import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, XCircle, Trash2, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Booking {
  id: string;
  rental_id: string | null;
  driver_id: string;
  rider_id: string;
  rider_name: string;
  rider_phone: string | null;
  purpose: string | null;
  booking_date: string;
  from_location: string | null;
  to_location: string | null;
  status: string;
  created_at: string;
}

export default function MyBookings() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const isDriver = profile?.role === "driver";

  const fetchBookings = async () => {
    if (!user) return;
    const col = isDriver ? "driver_id" : "rider_id";
    const { data } = await supabase.from("bookings").select("*").eq(col, user.id).order("created_at", { ascending: false });
    setBookings((data as Booking[]) ?? []);
  };

  useEffect(() => { fetchBookings(); }, [user, isDriver]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("bookings-realtime").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
      fetchBookings();
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status } as any).eq("id", id);
    toast.success(`Booking ${status}`); fetchBookings();
  };

  const deleteBooking = async (id: string) => {
    await supabase.from("bookings").delete().eq("id", id);
    toast.success("Booking deleted"); fetchBookings();
  };

  return (
    <div className="py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">{isDriver ? "Booking Requests" : "My Bookings"}</h1>
        <p className="text-muted-foreground">{isDriver ? "Manage booking requests from riders" : "Your vehicle bookings"}</p>
      </motion.div>

      {bookings.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No bookings yet</p>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold">{isDriver ? b.rider_name : "Booking"}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    b.status === "pending" ? "bg-warning/20 text-warning" :
                    b.status === "confirmed" ? "bg-success/20 text-success" :
                    "bg-destructive/20 text-destructive"
                  }`}>
                    {b.status === "pending" ? "⏳ Pending" : b.status === "confirmed" ? "✅ Confirmed" : "❌ " + b.status}
                  </span>
                </div>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.booking_date}</p>
                  {(b.from_location || b.to_location) && (
                    <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.from_location || "—"} → {b.to_location || "—"}</p>
                  )}
                  {b.purpose && <p>Purpose: {b.purpose}</p>}
                  {b.rider_phone && (
                    <a href={`tel:${b.rider_phone}`} className="text-primary flex items-center gap-1 w-fit"><Phone className="w-3 h-3" /> {b.rider_phone}</a>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {isDriver && b.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")} className="bg-success/20 text-success hover:bg-success/30">
                      <CheckCircle className="w-3 h-3 mr-1" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "rejected")} className="text-destructive border-destructive/30">
                      <XCircle className="w-3 h-3 mr-1" /> Reject
                    </Button>
                  </>
                )}
                {!isDriver && (
                  <Button size="sm" variant="outline" onClick={() => deleteBooking(b.id)} className="text-destructive border-destructive/30">
                    <Trash2 className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

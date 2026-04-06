import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, MapPin, FileText, Car, ArrowLeft, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type DriverProfile = Tables<"driver_profiles">;

export default function DriverProfileView() {
  const { id } = useParams();
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("driver_profiles").select("*").eq("id", id!).single();
      setDriver(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  if (!driver) return <div className="container py-20 text-center text-muted-foreground">Driver not found</div>;

  const initials = driver.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="container py-8 max-w-2xl">
      <Button asChild variant="ghost" className="mb-4"><Link to="/search"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Search</Link></Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <Avatar className="w-28 h-28 border-4 border-primary/30">
            <AvatarImage src={driver.profile_photo_url ?? ""} />
            <AvatarFallback className="text-3xl bg-accent text-accent-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{driver.name}</h1>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
              driver.vehicle_type === "auto" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
            }`}>
              {driver.vehicle_type === "auto" ? "🛺 Auto Rickshaw" : driver.vehicle_type === "bus" ? "🚌 Bus" : "🚗 Other"}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="grid gap-4">
          <div className="glass-card rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Route</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center p-3 bg-accent/50 rounded-lg">
                <p className="text-xs text-muted-foreground">From</p>
                <p className="font-medium">{driver.from_location || driver.from_district || "—"}</p>
                <p className="text-xs text-muted-foreground">{driver.from_state}</p>
              </div>
              <span className="text-xl">→</span>
              <div className="flex-1 text-center p-3 bg-accent/50 rounded-lg">
                <p className="text-xs text-muted-foreground">To</p>
                <p className="font-medium">{driver.to_location || driver.to_district || "—"}</p>
                <p className="text-xs text-muted-foreground">{driver.to_state}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-lg p-4 space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Vehicle Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground">Vehicle Number</p><p className="font-medium">{driver.transport_number || "N/A"}</p></div>
              <div><p className="text-muted-foreground">License Number</p><p className="font-medium">{driver.license_number || "N/A"}</p></div>
              {driver.age && <div><p className="text-muted-foreground">Age</p><p className="font-medium">{driver.age} years</p></div>}
            </div>
          </div>

          {driver.license_photo_url && (
            <div className="glass-card rounded-lg p-4">
              <h3 className="font-semibold mb-2">License Photo</h3>
              <img src={driver.license_photo_url} alt="License" className="rounded-lg max-h-48 object-contain" />
            </div>
          )}

          {driver.about && (
            <div className="glass-card rounded-lg p-4">
              <h3 className="font-semibold mb-2">About / Route Details</h3>
              <p className="text-sm text-muted-foreground">{driver.about}</p>
            </div>
          )}
        </div>

        <Button asChild size="lg" className="w-full gradient-primary text-primary-foreground">
          <a href={`tel:${driver.phone}`}><Phone className="w-4 h-4 mr-2" /> Call Driver — {driver.phone}</a>
        </Button>
      </motion.div>
    </div>
  );
}

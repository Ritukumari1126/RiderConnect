import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StateDistrictSelector from "@/components/StateDistrictSelector";
import { Plus, Trash2, X, Car, IndianRupee, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Rental {
  id: string;
  vehicle_type: string;
  from_state: string | null;
  from_district: string | null;
  from_location: string | null;
  to_state: string | null;
  to_district: string | null;
  to_location: string | null;
  price_per_day: number | null;
  description: string | null;
  available: boolean;
  created_at: string;
  driver_id: string;
  user_id: string;
}

export default function VehicleRentals() {
  const { user, profile } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [driverProfileId, setDriverProfileId] = useState<string | null>(null);
  const [form, setForm] = useState({
    vehicle_type: "auto", from_state: "", from_district: "", from_location: "",
    to_state: "", to_district: "", to_location: "", price_per_day: "", description: "",
  });

  const fetchRentals = async () => {
    if (!user) return;
    const { data } = await supabase.from("vehicle_rentals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setRentals((data as Rental[]) ?? []);
  };

  const fetchDriverProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("driver_profiles").select("id").eq("user_id", user.id).single();
    if (data) setDriverProfileId(data.id);
  };

  useEffect(() => { fetchRentals(); fetchDriverProfile(); }, [user]);

  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async () => {
    if (!user || !driverProfileId) { toast.error("Please create your driver profile first"); return; }
    if (!form.vehicle_type) { toast.error("Select vehicle type"); return; }
    setLoading(true);

    const { error } = await supabase.from("vehicle_rentals").insert({
      user_id: user.id,
      driver_id: driverProfileId,
      vehicle_type: form.vehicle_type,
      from_state: form.from_state || null,
      from_district: form.from_district || null,
      from_location: form.from_location || null,
      to_state: form.to_state || null,
      to_district: form.to_district || null,
      to_location: form.to_location || null,
      price_per_day: form.price_per_day ? parseFloat(form.price_per_day) : null,
      description: form.description || null,
    } as any);

    if (error) { toast.error("Failed to add rental"); console.error(error); }
    else {
      toast.success("Rental added!");
      setShowForm(false);
      setForm({ vehicle_type: "auto", from_state: "", from_district: "", from_location: "", to_state: "", to_district: "", to_location: "", price_per_day: "", description: "" });
      fetchRentals();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("vehicle_rentals").delete().eq("id", id);
    toast.success("Deleted"); fetchRentals();
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from("vehicle_rentals").update({ available: !current } as any).eq("id", id);
    toast.success(current ? "Marked unavailable" : "Marked available"); fetchRentals();
  };

  if (profile?.role !== "driver") {
    return <div className="container py-20 text-center text-muted-foreground">Only drivers can manage rentals.</div>;
  }

  return (
    <div className="py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Rental Listings</h1>
          <p className="text-muted-foreground">List your vehicle for rent</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gradient-primary text-primary-foreground">
          {showForm ? <><X className="w-4 h-4 mr-2" /> Cancel</> : <><Plus className="w-4 h-4 mr-2" /> Add Rental</>}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-xl p-6 space-y-4 overflow-hidden">
            <h2 className="text-lg font-bold">Add Vehicle for Rent</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Vehicle Type *</Label>
                <Select value={form.vehicle_type} onValueChange={(v) => update("vehicle_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🛺 Auto Rickshaw</SelectItem>
                    <SelectItem value="bus">🚌 Bus</SelectItem>
                    <SelectItem value="car">🚗 Car</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price per Day (₹)</Label>
                <Input type="number" value={form.price_per_day} onChange={(e) => update("price_per_day", e.target.value)} placeholder="500" />
              </div>
            </div>
            <StateDistrictSelector label="From" state={form.from_state} district={form.from_district} onStateChange={(v) => update("from_state", v)} onDistrictChange={(v) => update("from_district", v)} />
            <Input placeholder="Specific area (e.g., Railway Station)" value={form.from_location} onChange={(e) => update("from_location", e.target.value)} />
            <StateDistrictSelector label="To" state={form.to_state} district={form.to_district} onStateChange={(v) => update("to_state", v)} onDistrictChange={(v) => update("to_district", v)} />
            <Input placeholder="Specific area (e.g., Airport)" value={form.to_location} onChange={(e) => update("to_location", e.target.value)} />
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} placeholder="Available timings, AC/Non-AC, etc." />
            </div>
            <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? "Adding..." : "Add Rental Listing"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {rentals.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
            <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No rental listings yet. Add one above!</p>
          </div>
        )}
        {rentals.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold">
                    {r.vehicle_type === "auto" ? "🛺" : r.vehicle_type === "bus" ? "🚌" : r.vehicle_type === "car" ? "🚗" : "🚐"}{" "}
                    {r.vehicle_type.charAt(0).toUpperCase() + r.vehicle_type.slice(1)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.available ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                    {r.available ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {r.from_location || r.from_district || "—"} → {r.to_location || r.to_district || "—"}
                </div>
                {r.price_per_day && (
                  <p className="text-sm mt-1 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> ₹{r.price_per_day}/day</p>
                )}
                {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleAvailability(r.id, r.available)}>
                  {r.available ? "Mark Unavailable" : "Mark Available"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(r.id)} className="text-destructive border-destructive/30">
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

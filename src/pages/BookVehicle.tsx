import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StateDistrictSelector from "@/components/StateDistrictSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Car, MapPin, IndianRupee, Phone, Calendar, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface RentalWithDriver {
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
  driver_id: string;
  user_id: string;
  driver_profiles: {
    id: string;
    name: string;
    phone: string;
    profile_photo_url: string | null;
    vehicle_type: string;
    transport_number: string | null;
  } | null;
}

export default function BookVehicle() {
  const { user, profile } = useAuth();
  const [rentals, setRentals] = useState<RentalWithDriver[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingRentalId, setBookingRentalId] = useState<string | null>(null);
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    fromState: "", fromDistrict: "", toState: "", toDistrict: "", vehicleType: "all",
  });
  const [bookingForm, setBookingForm] = useState({
    purpose: "", booking_date: "", rider_name: profile?.full_name ?? "", rider_phone: profile?.phone ?? "",
  });

  useEffect(() => {
    if (profile) {
      setBookingForm((p) => ({ ...p, rider_name: profile.full_name ?? "", rider_phone: profile.phone ?? "" }));
    }
  }, [profile]);

  // Fetch user's existing bookings to show "Booked" status
  useEffect(() => {
    if (!user) return;
    const fetchMyBookings = async () => {
      const { data } = await supabase.from("bookings").select("rental_id").eq("rider_id", user.id).eq("status", "pending");
      if (data) setBookedIds(new Set(data.map((b: any) => b.rental_id).filter(Boolean)));
    };
    fetchMyBookings();
  }, [user]);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    let query = supabase.from("vehicle_rentals").select("*, driver_profiles!vehicle_rentals_driver_id_fkey(id, name, phone, profile_photo_url, vehicle_type, transport_number)").eq("available", true);
    if (filters.fromState) query = query.eq("from_state", filters.fromState);
    if (filters.fromDistrict) query = query.eq("from_district", filters.fromDistrict);
    if (filters.toState) query = query.eq("to_state", filters.toState);
    if (filters.toDistrict) query = query.eq("to_district", filters.toDistrict);
    if (filters.vehicleType !== "all") query = query.eq("vehicle_type", filters.vehicleType);

    const { data, error } = await query;
    if (error) {
      // fallback without join if FK doesn't exist
      const { data: fallback } = await supabase.from("vehicle_rentals").select("*").eq("available", true);
      setRentals((fallback as any) ?? []);
    } else {
      setRentals((data as any) ?? []);
    }
    setLoading(false);
  };

  const handleBook = async (rental: RentalWithDriver) => {
    if (!user) { toast.error("Please login"); return; }
    if (!bookingForm.booking_date) { toast.error("Select a date"); return; }
    if (!bookingForm.rider_name) { toast.error("Enter your name"); return; }

    const driverId = rental.driver_profiles?.id || rental.driver_id;

    const { error } = await supabase.from("bookings").insert({
      rental_id: rental.id,
      driver_id: rental.user_id,
      rider_id: user.id,
      rider_name: bookingForm.rider_name,
      rider_phone: bookingForm.rider_phone,
      purpose: bookingForm.purpose,
      booking_date: bookingForm.booking_date,
      from_location: rental.from_location || rental.from_district,
      to_location: rental.to_location || rental.to_district,
    } as any);

    if (error) { toast.error("Booking failed"); console.error(error); }
    else {
      toast.success("Booked successfully!");
      setBookedIds((prev) => new Set(prev).add(rental.id));
      setBookingRentalId(null);
      setBookingForm((p) => ({ ...p, purpose: "", booking_date: "" }));
    }
  };

  const update = (f: string, v: string) => setFilters((p) => ({ ...p, [f]: v }));

  return (
    <div className="py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Book a Vehicle</h1>
        <p className="text-muted-foreground">Book vehicles for weddings, events, or trips</p>
      </motion.div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        <StateDistrictSelector label="From" state={filters.fromState} district={filters.fromDistrict} onStateChange={(v) => update("fromState", v)} onDistrictChange={(v) => update("fromDistrict", v)} />
        <StateDistrictSelector label="To" state={filters.toState} district={filters.toDistrict} onStateChange={(v) => update("toState", v)} onDistrictChange={(v) => update("toDistrict", v)} />
        <Select value={filters.vehicleType} onValueChange={(v) => update("vehicleType", v)}>
          <SelectTrigger><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="auto">🛺 Auto</SelectItem>
            <SelectItem value="bus">🚌 Bus</SelectItem>
            <SelectItem value="car">🚗 Car</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} className="w-full gradient-primary text-primary-foreground" size="lg" disabled={loading}>
          <Search className="w-4 h-4 mr-2" /> {loading ? "Searching..." : "Search Vehicles"}
        </Button>
      </div>

      {searched && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{rentals.length} Vehicle{rentals.length !== 1 ? "s" : ""} Found</h2>
          {rentals.length === 0 && (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
              <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No vehicles available for this route.</p>
            </div>
          )}
          {rentals.map((r, i) => {
            const driver = r.driver_profiles;
            const isBooked = bookedIds.has(r.id);
            const initials = driver?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  {driver && (
                    <Avatar className="w-20 h-20 rounded-xl">
                      <AvatarImage src={driver.profile_photo_url ?? ""} />
                      <AvatarFallback className="rounded-xl bg-accent text-accent-foreground text-xl">{initials}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-lg font-bold">{driver?.name ?? "Driver"}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          {r.vehicle_type === "auto" ? "🛺 Auto" : r.vehicle_type === "bus" ? "🚌 Bus" : r.vehicle_type === "car" ? "🚗 Car" : "🚐 Other"}
                        </span>
                        {r.available ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Available</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Unavailable</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {r.from_location || r.from_district || "—"} → {r.to_location || r.to_district || "—"}
                    </div>
                    {r.price_per_day && (
                      <p className="text-sm font-medium flex items-center gap-1"><IndianRupee className="w-3 h-3" /> ₹{r.price_per_day}/day</p>
                    )}
                    {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
                    {driver?.transport_number && <p className="text-sm"><span className="text-muted-foreground">Vehicle: </span>{driver.transport_number}</p>}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {driver?.phone && (
                        <Button asChild size="sm" variant="outline">
                          <a href={`tel:${driver.phone}`}><Phone className="w-3 h-3 mr-1" /> Call</a>
                        </Button>
                      )}
                      {driver && (
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/driver/${driver.id}`}>View Profile</Link>
                        </Button>
                      )}
                      {isBooked ? (
                        <Button size="sm" disabled className="bg-success/20 text-success border-success/30">
                          <CheckCircle className="w-3 h-3 mr-1" /> Booked
                        </Button>
                      ) : (
                        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setBookingRentalId(bookingRentalId === r.id ? null : r.id)}>
                          <Calendar className="w-3 h-3 mr-1" /> Book Now
                        </Button>
                      )}
                    </div>

                    {bookingRentalId === r.id && !isBooked && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 p-4 bg-muted/50 rounded-lg space-y-3">
                        <h4 className="font-semibold text-sm">Booking Details</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div><Label className="text-xs">Your Name *</Label><Input value={bookingForm.rider_name} onChange={(e) => setBookingForm((p) => ({ ...p, rider_name: e.target.value }))} /></div>
                          <div><Label className="text-xs">Phone</Label><Input value={bookingForm.rider_phone} onChange={(e) => setBookingForm((p) => ({ ...p, rider_phone: e.target.value }))} /></div>
                          <div><Label className="text-xs">Date *</Label><Input type="date" value={bookingForm.booking_date} onChange={(e) => setBookingForm((p) => ({ ...p, booking_date: e.target.value }))} /></div>
                          <div><Label className="text-xs">Purpose</Label><Input value={bookingForm.purpose} onChange={(e) => setBookingForm((p) => ({ ...p, purpose: e.target.value }))} placeholder="Wedding, Trip, etc." /></div>
                        </div>
                        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleBook(r)}>Confirm Booking</Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

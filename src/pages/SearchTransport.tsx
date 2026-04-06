import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StateDistrictSelector from "@/components/StateDistrictSelector";
import { Search, Phone, MapPin, User } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

type DriverProfile = Tables<"driver_profiles">;

export default function SearchTransport() {
  const [fromState, setFromState] = useState("");
  const [fromDistrict, setFromDistrict] = useState("");
  const [toState, setToState] = useState("");
  const [toDistrict, setToDistrict] = useState("");
  const [vehicleType, setVehicleType] = useState("all");
  const [busNumber, setBusNumber] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [results, setResults] = useState<DriverProfile[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    let query = supabase.from("driver_profiles").select("*");

    if (busNumber.trim()) {
      query = query.ilike("transport_number", `%${busNumber.trim()}%`);
    } else if (locationSearch.trim()) {
      // Search across all location fields case-insensitively
      const term = `%${locationSearch.trim()}%`;
      query = query.or(
        `from_location.ilike.${term},to_location.ilike.${term},from_district.ilike.${term},to_district.ilike.${term},from_state.ilike.${term},to_state.ilike.${term}`
      );
    } else {
      // Use ilike for case-insensitive matching on state/district selectors
      if (fromState) query = query.ilike("from_state", fromState);
      if (fromDistrict) query = query.ilike("from_district", fromDistrict);
      if (toState) query = query.ilike("to_state", toState);
      if (toDistrict) query = query.ilike("to_district", toDistrict);
    }
    if (vehicleType !== "all") query = query.eq("vehicle_type", vehicleType);
    const { data } = await query;
    setResults(data ?? []);
    setLoading(false);
  };

  return (
    <div className="py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Find Transport</h1>
        <p className="text-muted-foreground">Search drivers by route, location name, or vehicle number</p>
      </motion.div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        {/* Quick location search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search any location (e.g. Delhi, mumbai, Patna)..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase">or filter by route</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <StateDistrictSelector label="From" state={fromState} district={fromDistrict} onStateChange={setFromState} onDistrictChange={setFromDistrict} />
        <StateDistrictSelector label="To" state={toState} district={toDistrict} onStateChange={setToState} onDistrictChange={setToDistrict} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="auto">Auto Rickshaw</SelectItem>
              <SelectItem value="bus">Bus</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Search by Bus/Vehicle Number" value={busNumber} onChange={(e) => setBusNumber(e.target.value)} />
        </div>
        <Button onClick={handleSearch} className="w-full gradient-primary text-primary-foreground" size="lg" disabled={loading}>
          <Search className="w-4 h-4 mr-2" /> {loading ? "Searching..." : "Search Drivers"}
        </Button>
      </div>

      {searched && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{results.length} Driver{results.length !== 1 ? "s" : ""} Found</h2>
          {results.length === 0 && (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No drivers found for this route.</p>
            </div>
          )}
          {results.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                <Avatar className="w-20 h-20 rounded-xl">
                  <AvatarImage src={d.profile_photo_url ?? ""} />
                  <AvatarFallback className="rounded-xl bg-accent text-accent-foreground text-xl">
                    {d.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{d.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      d.vehicle_type === "auto" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
                    }`}>
                      {d.vehicle_type === "auto" ? "🛺 Auto" : d.vehicle_type === "bus" ? "🚌 Bus" : "🚗 Other"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {d.from_location || d.from_district || "—"} → {d.to_location || d.to_district || "—"}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-muted-foreground">Vehicle: </span>{d.transport_number || "N/A"}</p>
                    <p><span className="text-muted-foreground">License: </span>{d.license_number || "N/A"}</p>
                  </div>
                  {d.about && <p className="text-sm text-muted-foreground">{d.about}</p>}
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="gradient-primary text-primary-foreground">
                      <a href={`tel:${d.phone}`}><Phone className="w-3 h-3 mr-1" /> Call {d.phone}</a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/driver/${d.id}`}><User className="w-3 h-3 mr-1" /> View Profile</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

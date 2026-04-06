import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import StateDistrictSelector from "@/components/StateDistrictSelector";
import { motion } from "framer-motion";
import { Search, AlertTriangle, MessageSquare, MapPin, Car, Bus, Calendar, IndianRupee, Save } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState(profile?.state ?? "");
  const [district, setDistrict] = useState(profile?.district ?? "");
  const [activeItems, setActiveItems] = useState(0);
  const [driverCount, setDriverCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [rentalCount, setRentalCount] = useState(0);

  const isDriver = profile?.role === "driver";

  useEffect(() => {
    if (profile?.state) setState(profile.state);
    if (profile?.district) setDistrict(profile.district);
  }, [profile]);

  // Fetch counts filtered by user's saved location
  useEffect(() => {
    const fetchCounts = async () => {
      const userState = profile?.state;
      const userDistrict = profile?.district;

      // Lost items count - filtered by location if set
      let lostQuery = supabase.from("lost_items").select("*", { count: "exact", head: true }).eq("status", "active");
      if (userState) lostQuery = lostQuery.eq("state", userState);
      if (userDistrict) lostQuery = lostQuery.eq("district", userDistrict);
      const { count: lost } = await lostQuery;

      // Driver count - filtered by location (from_state/from_district)
      let driverQuery = supabase.from("driver_profiles").select("*", { count: "exact", head: true });
      if (userState) driverQuery = driverQuery.eq("from_state", userState);
      if (userDistrict) driverQuery = driverQuery.eq("from_district", userDistrict);
      const { count: drivers } = await driverQuery;

      setActiveItems(lost ?? 0);
      setDriverCount(drivers ?? 0);

      if (user) {
        const col = isDriver ? "driver_id" : "rider_id";
        const { count: bk } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq(col, user.id);
        setBookingCount(bk ?? 0);

        if (isDriver) {
          const { count: rt } = await supabase.from("vehicle_rentals").select("*", { count: "exact", head: true }).eq("user_id", user.id);
          setRentalCount(rt ?? 0);
        }
      }
    };
    fetchCounts();
  }, [user, isDriver, profile?.state, profile?.district]);

  const saveLocation = async () => {
    if (!user || !state || !district) { toast.error("Please select state and district"); return; }
    const { error } = await supabase.from("profiles").update({ state, district }).eq("user_id", user.id);
    if (error) { toast.error("Failed to update location"); return; }
    await refreshProfile();
    toast.success("Location updated!");
  };

  const stats = [
    { icon: AlertTriangle, label: "Local Lost Items", value: activeItems, color: "text-warning" },
    { icon: Car, label: "Local Drivers", value: driverCount, color: "text-primary" },
    { icon: Calendar, label: isDriver ? "Booking Requests" : "My Bookings", value: bookingCount, color: "text-secondary" },
    ...(isDriver ? [{ icon: IndianRupee, label: "My Rentals", value: rentalCount, color: "text-primary" }] : []),
  ];

  const quickActions = isDriver
    ? [
        { icon: Car, label: "My Profile", desc: "Update your driver profile", path: "/driver-profile", color: "bg-primary/10 text-primary" },
        { icon: IndianRupee, label: "My Rentals", desc: "Manage rental listings", path: "/rentals", color: "bg-secondary/10 text-secondary" },
        { icon: Calendar, label: "Bookings", desc: "View booking requests", path: "/bookings", color: "bg-accent text-accent-foreground" },
        { icon: AlertTriangle, label: "Lost & Found", desc: "Report or find lost items", path: "/lost-found", color: "bg-warning/10 text-warning" },
        { icon: MessageSquare, label: "Community Chat", desc: "Chat with local drivers", path: "/chat", color: "bg-secondary/10 text-secondary" },
      ]
    : [
        { icon: Search, label: "Find Transport", desc: "Search drivers by route", path: "/search", color: "bg-primary/10 text-primary" },
        { icon: Car, label: "Book Vehicle", desc: "Book for weddings & events", path: "/book", color: "bg-secondary/10 text-secondary" },
        { icon: Calendar, label: "My Bookings", desc: "View your bookings", path: "/bookings", color: "bg-accent text-accent-foreground" },
        { icon: AlertTriangle, label: "Lost & Found", desc: "Report or find lost items", path: "/lost-found", color: "bg-warning/10 text-warning" },
        { icon: MessageSquare, label: "Community Chat", desc: "Chat with local community", path: "/chat", color: "bg-secondary/10 text-secondary" },
      ];

  return (
    <div className="py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || "User"}! 👋</h1>
        <p className="text-muted-foreground">Your {isDriver ? "Driver" : "Rider"} Dashboard
          {profile?.state && profile?.district && (
            <span className="ml-2 text-primary text-sm">📍 {profile.district}, {profile.state}</span>
          )}
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-accent flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!profile?.state && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Set Your Location
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Save your location to see local drivers, lost items, and community chat for your area.</p>
          <StateDistrictSelector state={state} district={district} onStateChange={setState} onDistrictChange={setDistrict} />
          <Button onClick={saveLocation} className="mt-4 gradient-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" /> Save Location
          </Button>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((a, i) => (
          <motion.div key={a.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.98 }}>
            <Link to={a.path} className="glass-card rounded-xl p-5 block group">
              <div className={`w-10 h-10 rounded-lg ${a.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <a.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold group-hover:text-primary transition-colors">{a.label}</h3>
              <p className="text-sm text-muted-foreground">{a.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, MessageSquare, Shield, MapPin, AlertTriangle, Car, Calendar, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import heroImg from "@/assets/transport-hero.jpg";
import autoImg from "@/assets/auto-rickshaw.png";
import busImg from "@/assets/bus.png";

const publicFeatures = [
  { icon: Search, title: "Find Transport", desc: "Search drivers by route, state, district", path: "/search", color: "bg-primary/10 text-primary" },
  { icon: Car, title: "Book Vehicle", desc: "Book for weddings, events, trips", path: "/book", color: "bg-secondary/10 text-secondary" },
  { icon: AlertTriangle, title: "Lost & Found", desc: "Report or find lost items in transport", path: "/lost-found", color: "bg-warning/10 text-warning" },
  { icon: MessageSquare, title: "Community Chat", desc: "Chat with local drivers & riders", path: "/chat", color: "bg-accent text-accent-foreground" },
  { icon: Calendar, title: "My Bookings", desc: "View and manage your bookings", path: "/bookings", color: "bg-primary/10 text-primary" },
  { icon: IndianRupee, title: "Vehicle Rentals", desc: "List or browse rental vehicles", path: "/rentals", color: "bg-secondary/10 text-secondary" },
];

const stats = [
  { value: "1000+", label: "Registered Drivers" },
  { value: "50+", label: "Cities Covered" },
  { value: "24/7", label: "Available" },
  { value: "Free", label: "For Riders" },
];

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFeatureClick = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      navigate("/auth?role=rider");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Transport in India" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-transparent" />
        </div>
        <div className="relative container py-28 md:py-40">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-6 backdrop-blur-sm border border-primary/30">
              <MapPin className="w-4 h-4" /> Find drivers near you
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary-foreground leading-tight">
              Connect with <span className="text-secondary">Auto & Riksha</span> Drivers Instantly
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-md">
              Lost something in a ride? Need a regular driver? Search by location, find verified drivers, and connect directly — no middleman.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground font-semibold px-8">
                <Link to="/auth?role=rider">🚌 Rider Login <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-8">
                <Link to="/auth?role=driver">🚗 Driver Login <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-card border-b">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              <p className="text-3xl font-extrabold text-secondary">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Public Dashboard Cards */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Explore Features</h2>
          <p className="text-muted-foreground text-center mb-12">Click any feature to get started</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {publicFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFeatureClick(f.path)}
                className="glass-card rounded-xl p-6 cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-lg ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-muted-foreground text-sm mt-2">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Transport showcase */}
      <section className="py-16 bg-card">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Available Transport</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              { img: autoImg, label: "Auto Rickshaw", desc: "Quick rides for short distances across the city" },
              { img: busImg, label: "Public Bus", desc: "Affordable long-route travel between districts" },
            ].map((v, i) => (
              <motion.div key={v.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.03, y: -3 }}
                className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
                <img src={v.img} alt={v.label} className="w-48 h-48 object-contain mb-4" loading="lazy" width={512} height={512} />
                <h3 className="text-xl font-bold">{v.label}</h3>
                <p className="text-muted-foreground mt-1">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-muted-foreground mb-8">Join as a rider or driver and start using all features</p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="gradient-primary text-primary-foreground px-8">
              <Link to="/auth?role=rider">🚌 Join as Rider</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8">
              <Link to="/auth?role=driver">🚗 Join as Driver</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} RideConnect. Built for India's transport community.
        </div>
      </footer>
    </div>
  );
}

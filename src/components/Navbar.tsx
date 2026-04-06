import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPin, Menu, X, LogOut, Moon, Sun, Edit2, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import ProfileEditPopup from "./ProfileEditPopup";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [profileOpen, setProfileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
    }
  }, []);

  const handleSignOut = async () => {
    setProfileOpen(false);
    await signOut();
    navigate("/");
  };

  const isDriver = profile?.role === "driver";

  const navItems = user
    ? [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Find Transport", path: "/search" },
        ...(isDriver
          ? [
              { label: "My Profile", path: "/driver-profile" },
              { label: "My Rentals", path: "/rentals" },
              { label: "Bookings", path: "/bookings" },
            ]
          : [
              { label: "Book Vehicle", path: "/book" },
              { label: "My Bookings", path: "/bookings" },
            ]),
        { label: "Lost & Found", path: "/lost-found" },
        { label: "Community", path: "/chat" },
      ]
    : [];

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-gradient">RideConnect</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} className="mr-1">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {user ? (
              <Popover open={profileOpen} onOpenChange={setProfileOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 ml-3 cursor-pointer rounded-full p-1 hover:bg-muted transition-colors">
                    <Avatar className="w-9 h-9 border-2 border-primary/30">
                      <AvatarImage src={profile?.profile_photo_url ?? ""} />
                      <AvatarFallback className="text-xs bg-accent text-accent-foreground">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-0">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-primary/30">
                        <AvatarImage src={profile?.profile_photo_url ?? ""} />
                        <AvatarFallback className="bg-accent text-accent-foreground">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{profile?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize mt-1 inline-block">{profile?.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-9"
                      onClick={() => { setProfileOpen(false); setEditOpen(true); }}
                    >
                      <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                    {isDriver && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm h-9"
                        onClick={() => { setProfileOpen(false); navigate("/driver-profile"); }}
                      >
                        <User className="w-4 h-4 mr-2" /> Driver Profile
                      </Button>
                    )}
                    <div className="border-t my-1" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="flex items-center gap-2 ml-3">
                <Button variant="outline" size="sm" onClick={() => navigate("/auth?role=driver")}>
                  🚗 Driver Login
                </Button>
                <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => navigate("/auth?role=rider")}>
                  🚌 Rider Login
                </Button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t bg-card p-4 space-y-1 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setDark(!dark)} className="w-full justify-start px-4">
              {dark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {dark ? "Light Mode" : "Dark Mode"}
            </Button>
            {user ? (
              <div className="border-t pt-2 mt-2 space-y-1">
                <div className="flex items-center gap-3 px-4 py-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.profile_photo_url ?? ""} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium flex-1">{profile?.full_name}</span>
                </div>
                <Button variant="ghost" size="sm" className="w-full justify-start px-4" onClick={() => { setOpen(false); setEditOpen(true); }}>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start px-4 text-destructive" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button className="w-full gradient-primary text-primary-foreground" onClick={() => { setOpen(false); navigate("/auth?role=rider"); }}>
                  🚌 Rider Login
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setOpen(false); navigate("/auth?role=driver"); }}>
                  🚗 Driver Login
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Profile edit dialog */}
      <ProfileEditPopup open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}

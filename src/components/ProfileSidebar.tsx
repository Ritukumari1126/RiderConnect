import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Edit2, Save, X, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import StateDistrictSelector from "./StateDistrictSelector";

export default function ProfileSidebar() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    state: profile?.state ?? "",
    district: profile?.district ?? "",
  });

  if (!user || !profile) return null;

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const startEdit = () => {
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      state: profile.state ?? "",
      district: profile.district ?? "",
    });
    setPhotoPreview("");
    setPhotoFile(null);
    setEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    let photoUrl = profile.profile_photo_url;

    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from("profile-photos").upload(path, photoFile, { upsert: true });
      if (!error) {
        photoUrl = supabase.storage.from("profile-photos").getPublicUrl(path).data.publicUrl;
      }
    }

    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone,
      state: form.state,
      district: form.district,
      profile_photo_url: photoUrl,
    }).eq("user_id", user.id);

    if (error) toast.error("Failed to update");
    else {
      toast.success("Profile updated!");
      await refreshProfile();
      setEditing(false);
    }
    setLoading(false);
  };

  return (
    <div className="w-72 shrink-0 hidden lg:block">
      <div className="sticky top-20 glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">My Profile</h3>
          {!editing && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startEdit}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex justify-center">
                <label className="cursor-pointer">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center overflow-hidden bg-muted">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : profile.profile_photo_url ? (
                      <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
                  }} />
                </label>
              </div>
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} className="h-8 text-sm" />
              </div>
              <StateDistrictSelector state={form.state} district={form.district} onStateChange={(v) => setForm(p => ({ ...p, state: v, district: "" }))} onDistrictChange={(v) => setForm(p => ({ ...p, district: v }))} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={loading} className="flex-1 gradient-primary text-primary-foreground">
                  <Save className="w-3 h-3 mr-1" /> {loading ? "..." : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="flex-1">
                  <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex flex-col items-center">
                <Avatar className="w-20 h-20 border-2 border-primary/30">
                  <AvatarImage src={profile.profile_photo_url ?? ""} />
                  <AvatarFallback className="text-xl bg-accent text-accent-foreground">{initials}</AvatarFallback>
                </Avatar>
                <h4 className="font-bold mt-2 text-center">{profile.full_name || "User"}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{profile.role}</span>
              </div>
              <div className="space-y-2 text-sm">
                {profile.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {(profile.state || profile.district) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{[profile.district, profile.state].filter(Boolean).join(", ")}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

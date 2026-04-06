import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Save } from "lucide-react";
import { toast } from "sonner";
import StateDistrictSelector from "./StateDistrictSelector";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileEditPopup({ open, onOpenChange }: Props) {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    state: "",
    district: "",
  });

  useEffect(() => {
    if (open && profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        state: profile.state ?? "",
        district: profile.district ?? "",
      });
      setPhotoPreview("");
      setPhotoFile(null);
    }
  }, [open, profile]);

  if (!user || !profile) return null;

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast.error("Name is required");
      return;
    }
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

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      await refreshProfile();
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Photo */}
          <div className="flex justify-center">
            <label className="cursor-pointer group">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center overflow-hidden bg-muted group-hover:border-primary transition-colors">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : profile.profile_photo_url ? (
                  <Avatar className="w-full h-full">
                    <AvatarImage src={profile.profile_photo_url} className="object-cover" />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
              }} />
              <p className="text-xs text-center text-muted-foreground mt-2">Change Photo</p>
            </label>
          </div>

          <div>
            <Label>Full Name</Label>
            <Input value={form.full_name} onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Your phone number" />
          </div>
          <StateDistrictSelector
            state={form.state}
            district={form.district}
            onStateChange={(v) => setForm(p => ({ ...p, state: v, district: "" }))}
            onDistrictChange={(v) => setForm(p => ({ ...p, district: v }))}
          />
          <Button onClick={handleSave} disabled={loading} className="w-full gradient-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

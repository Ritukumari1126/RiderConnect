import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StateDistrictSelector from "@/components/StateDistrictSelector";
import { User, FileText, Camera, MapPin, Save } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function DriverProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState("");
  const [form, setForm] = useState({
    name: "", age: "", phone: "", license_number: "", transport_number: "",
    vehicle_type: "auto", from_location: "", to_location: "", about: "",
    from_state: "", from_district: "", to_state: "", to_district: "",
    profile_photo_url: "", license_photo_url: "",
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from("driver_profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setForm({
          name: data.name ?? "", age: data.age?.toString() ?? "", phone: data.phone ?? "",
          license_number: data.license_number ?? "", transport_number: data.transport_number ?? "",
          vehicle_type: data.vehicle_type ?? "auto", from_location: data.from_location ?? "",
          to_location: data.to_location ?? "", about: data.about ?? "",
          from_state: data.from_state ?? "", from_district: data.from_district ?? "",
          to_state: data.to_state ?? "", to_district: data.to_district ?? "",
          profile_photo_url: data.profile_photo_url ?? "", license_photo_url: data.license_photo_url ?? "",
        });
        if (data.profile_photo_url) setPhotoPreview(data.profile_photo_url);
        if (data.license_photo_url) setLicensePreview(data.license_photo_url);
      }
    };
    fetchProfile();
  }, [user]);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | undefined> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) return undefined;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.name || !form.phone || !form.vehicle_type) {
      toast.error("Please fill name, phone, and vehicle type"); return;
    }
    setLoading(true);

    let profileUrl = form.profile_photo_url;
    let licenseUrl = form.license_photo_url;

    if (photoFile) {
      const url = await uploadFile(photoFile, "profile-photos", user.id);
      if (url) profileUrl = url;
    }
    if (licenseFile) {
      const url = await uploadFile(licenseFile, "license-photos", user.id);
      if (url) licenseUrl = url;
    }

    const payload = {
      user_id: user.id,
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      phone: form.phone,
      license_number: form.license_number,
      transport_number: form.transport_number,
      vehicle_type: form.vehicle_type,
      from_location: form.from_location,
      to_location: form.to_location,
      from_state: form.from_state,
      from_district: form.from_district,
      to_state: form.to_state,
      to_district: form.to_district,
      about: form.about,
      profile_photo_url: profileUrl,
      license_photo_url: licenseUrl,
    };

    const { error } = await supabase.from("driver_profiles").upsert(payload, { onConflict: "user_id" });
    if (error) { toast.error("Failed to save profile"); console.error(error); }
    else toast.success("Profile saved successfully!");

    setLoading(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: "photo" | "license") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "photo") { setPhotoFile(file); setPhotoPreview(url); }
    else { setLicenseFile(file); setLicensePreview(url); }
  };

  return (
    <div className="py-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage your profile and route information</p>
      </motion.div>

      <div className="glass-card rounded-xl p-6 space-y-6">
        {/* Photos */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <Label className="mb-2 block">Profile Photo</Label>
            <label className="cursor-pointer block">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden bg-muted/50 hover:border-primary transition-colors">
                {photoPreview ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover rounded-full" /> : <Camera className="w-10 h-10 text-muted-foreground" />}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, "photo")} />
            </label>
          </div>
          <div>
            <Label className="mb-2 block">Driving License</Label>
            <label className="cursor-pointer block">
              <div className="w-full h-40 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden bg-muted/50 hover:border-primary transition-colors">
                {licensePreview ? <img src={licensePreview} alt="License" className="w-full h-full object-cover" /> : <FileText className="w-10 h-10 text-muted-foreground" />}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, "license")} />
            </label>
          </div>
        </div>

        {/* Personal */}
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><User className="w-5 h-5 text-primary" /> Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Full Name *</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} /></div>
            <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} /></div>
            <div><Label>Phone Number *</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
            <div>
              <Label>Vehicle Type *</Label>
              <Select value={form.vehicle_type} onValueChange={(v) => update("vehicle_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto Rickshaw</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* License */}
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-primary" /> License & Vehicle</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>License Number</Label><Input value={form.license_number} onChange={(e) => update("license_number", e.target.value)} placeholder="DL-0420110012345" /></div>
            <div><Label>Transport / Vehicle Number</Label><Input value={form.transport_number} onChange={(e) => update("transport_number", e.target.value)} placeholder="DL 1S A 1234" /></div>
          </div>
        </div>

        {/* Routes */}
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-primary" /> Route Information</h2>
          <p className="text-sm text-muted-foreground mb-3">From where to where do you run your transport?</p>
          <div className="space-y-4">
            <StateDistrictSelector label="From Location" state={form.from_state} district={form.from_district} onStateChange={(v) => update("from_state", v)} onDistrictChange={(v) => update("from_district", v)} />
            <Input placeholder="Specific area/stop (e.g., Andheri Station)" value={form.from_location} onChange={(e) => update("from_location", e.target.value)} />
            <StateDistrictSelector label="To Location" state={form.to_state} district={form.to_district} onStateChange={(v) => update("to_state", v)} onDistrictChange={(v) => update("to_district", v)} />
            <Input placeholder="Specific area/stop (e.g., Churchgate)" value={form.to_location} onChange={(e) => update("to_location", e.target.value)} />
          </div>
        </div>

        {/* About */}
        <div>
          <Label>About / Route Details</Label>
          <Textarea placeholder="Tell riders about your schedule, timings, fare, etc." value={form.about} onChange={(e) => update("about", e.target.value)} rows={3} />
        </div>

        <Button onClick={handleSave} className="w-full gradient-primary text-primary-foreground" size="lg" disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}

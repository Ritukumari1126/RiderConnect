import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StateDistrictSelector from "@/components/StateDistrictSelector";
import { AlertTriangle, Plus, Trash2, CheckCircle, Camera, Phone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type LostItem = Tables<"lost_items">;

export default function LostFound() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<LostItem[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "found">("all");
  const [showForm, setShowForm] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "Other", location: "",
    state: "", district: "", reporter_name: "", reporter_phone: "",
  });

  const fetchItems = async () => {
    const { data } = await supabase.from("lost_items").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };

  useEffect(() => { fetchItems(); }, []);

  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async () => {
    if (!user) { toast.error("Please login first"); return; }
    if (!form.title.trim()) { toast.error("Please enter item title"); return; }
    setLoading(true);

    let photoUrl: string | undefined;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("lost-item-photos").upload(path, photoFile);
      if (!error) photoUrl = supabase.storage.from("lost-item-photos").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("lost_items").insert({
      user_id: user.id, title: form.title, description: form.description,
      category: form.category, location: form.location, state: form.state,
      district: form.district, reporter_name: form.reporter_name || profile?.full_name || "",
      reporter_phone: form.reporter_phone || profile?.phone || "", item_photo_url: photoUrl,
    });

    if (error) { toast.error("Failed to report item"); }
    else {
      toast.success("Item reported!");
      setShowForm(false);
      setForm({ title: "", description: "", category: "Other", location: "", state: "", district: "", reporter_name: "", reporter_phone: "" });
      setPhotoFile(null); setPhotoPreview("");
      fetchItems();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("lost_items").delete().eq("id", id);
    toast.success("Deleted"); fetchItems();
  };

  const handleFound = async (id: string) => {
    await supabase.from("lost_items").update({ status: "found" }).eq("id", id);
    toast.success("Marked as found!"); fetchItems();
  };

  const filtered = items.filter((i) => filter === "all" || i.status === filter);
  const activeCount = items.filter((i) => i.status === "active").length;

  return (
    <div className="py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lost & Found</h1>
          <p className="text-muted-foreground">{activeCount} active item{activeCount !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gradient-primary text-primary-foreground">
          {showForm ? <><X className="w-4 h-4 mr-2" /> Cancel</> : <><Plus className="w-4 h-4 mr-2" /> Report Lost Item</>}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-xl p-6 space-y-4 overflow-hidden">
            <h2 className="text-lg font-bold">Report a Lost Item</h2>
            <label className="cursor-pointer block">
              <div className="w-full h-32 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden bg-muted/50">
                {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-muted-foreground" />}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
              }} />
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Item Title *</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g., Blue Backpack" /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Bag", "Phone", "Wallet", "Documents", "Keys", "Electronics", "Other"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Near MG Road Bus Stop" /></div>
            <StateDistrictSelector state={form.state} district={form.district} onStateChange={(v) => update("state", v)} onDistrictChange={(v) => update("district", v)} />
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Your Name</Label><Input value={form.reporter_name} onChange={(e) => update("reporter_name", e.target.value)} /></div>
              <div><Label>Your Phone</Label><Input value={form.reporter_phone} onChange={(e) => update("reporter_phone", e.target.value)} /></div>
            </div>
            <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        {(["all", "active", "found"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
            onClick={() => setFilter(f)} className={filter === f ? "gradient-primary text-primary-foreground" : ""}>
            {f === "all" ? "All" : f === "active" ? `Active (${activeCount})` : "Found"}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="glass-card rounded-xl p-5">
            <div className="flex gap-4">
              {item.item_photo_url && <img src={item.item_photo_url} alt={item.title} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      item.status === "active" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                    }`}>{item.status === "active" ? "🔍 Active" : "✅ Found"}</span>
                  </div>
                  {item.category && <span className="text-xs bg-muted px-2 py-1 rounded-full">{item.category}</span>}
                </div>
                {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                  {item.location && <span>📍 {item.location}</span>}
                  {item.district && <span>{item.district}, {item.state}</span>}
                  <span>📅 {item.date}</span>
                </div>
                {(item.reporter_name || item.reporter_phone) && (
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    {item.reporter_name && <span className="text-muted-foreground">By: {item.reporter_name}</span>}
                    {item.reporter_phone && <a href={`tel:${item.reporter_phone}`} className="text-primary flex items-center gap-1"><Phone className="w-3 h-3" /> {item.reporter_phone}</a>}
                  </div>
                )}
                {user && item.user_id === user.id && (
                  <div className="flex gap-2 mt-3">
                    {item.status === "active" && (
                      <Button size="sm" variant="outline" onClick={() => handleFound(item.id)} className="text-success border-success/30">
                        <CheckCircle className="w-3 h-3 mr-1" /> I Found It
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)} className="text-destructive border-destructive/30">
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No items found</p>
          </div>
        )}
      </div>
    </div>
  );
}

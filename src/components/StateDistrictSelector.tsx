import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { indianStates, stateNames } from "@/data/india-states";
import { MapPin, Locate, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  state: string;
  district: string;
  onStateChange: (val: string) => void;
  onDistrictChange: (val: string) => void;
  label?: string;
  showAutoDetect?: boolean;
}

// Fuzzy match: find best matching state/district from our data
function findBestMatch(name: string, options: string[]): string | null {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  // Exact match
  const exact = options.find((o) => o.toLowerCase() === lower);
  if (exact) return exact;
  // Partial match
  const partial = options.find((o) => lower.includes(o.toLowerCase()) || o.toLowerCase().includes(lower));
  return partial ?? null;
}

export default function StateDistrictSelector({ state, district, onStateChange, onDistrictChange, label, showAutoDetect = true }: Props) {
  const [detecting, setDetecting] = useState(false);
  const districts = state ? indianStates[state] ?? [] : [];

  const autoDetect = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};

          // Nominatim returns state and state_district/county
          const detectedState = addr.state || "";
          const detectedDistrict = addr.state_district || addr.county || addr.city || "";

          const matchedState = findBestMatch(detectedState, stateNames);
          if (matchedState) {
            onStateChange(matchedState);
            const stateDistricts = indianStates[matchedState] ?? [];
            const matchedDistrict = findBestMatch(detectedDistrict, stateDistricts);
            if (matchedDistrict) {
              onDistrictChange(matchedDistrict);
              toast.success(`Location detected: ${matchedDistrict}, ${matchedState}`);
            } else {
              onDistrictChange("");
              toast.success(`State detected: ${matchedState}. Please select district.`);
            }
          } else {
            toast.error("Could not match your location to a state. Please select manually.");
          }
        } catch {
          toast.error("Failed to detect location. Please select manually.");
        }
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please allow location access.");
        } else {
          toast.error("Unable to detect location. Please select manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {label && <p className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{label}</p>}
        {showAutoDetect && (
          <Button type="button" variant="outline" size="sm" onClick={autoDetect} disabled={detecting} className="text-xs gap-1">
            {detecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Locate className="w-3 h-3" />}
            {detecting ? "Detecting..." : "Auto-detect"}
          </Button>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Select value={state} onValueChange={(v) => { onStateChange(v); onDistrictChange(""); }}>
          <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
          <SelectContent className="max-h-60">
            {stateNames.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={district} onValueChange={onDistrictChange} disabled={!state}>
          <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
          <SelectContent className="max-h-60">
            {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { useAuth } from "@/context/AuthContext";
// import { supabase } from "@/integrations/supabase/client";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import { motion } from "framer-motion";
// import { Camera, LogIn, UserPlus, MapPin, Car } from "lucide-react";

// export default function Auth() {
//   const { signUp, signIn } = useAuth();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const roleFromUrl = searchParams.get("role") === "driver" ? "driver" : "rider";

//   const [isLogin, setIsLogin] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({ email: "", password: "", full_name: "", role: roleFromUrl });
//   const [photoFile, setPhotoFile] = useState<File | null>(null);
//   const [photoPreview, setPhotoPreview] = useState<string>("");

//   const update = (field: string, val: string) => setForm((p) => ({ ...p, [field]: val }));

//   const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setPhotoFile(file);
//       setPhotoPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const { data } = await supabase.auth.getUser();
//     console.log(data.user);
//     console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
//     console.log("KEY:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

//     if (isLogin) {
//       const { error } = await signIn(form.email, form.password);
//       if (error) { toast.error(error.message); setLoading(false); return; }

//       // Check if user role matches the login button they clicked
//       const { data: profileData } = await supabase
//         .from("profiles")
//         .select("role")
//         .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
//         .single();

//       if (profileData && profileData.role !== form.role) {
//         toast.error(`This account is registered as a ${profileData.role}. Please use the ${profileData.role === "driver" ? "Driver" : "Rider"} Login button.`);
//         await supabase.auth.signOut();
//         setLoading(false);
//         return;
//       }

//       toast.success("Logged in successfully!");
//       navigate("/dashboard");
//     } else {
//       if (!form.full_name.trim()) { toast.error("Please enter your name"); setLoading(false); return; }

//       const { error } = await signUp(form.email, form.password, {
//         full_name: form.full_name,
//         role: form.role,
//       });
//       if (error) { toast.error(error.message); setLoading(false); return; }

//       toast.success("Account created! Logging you in...");
//       // Auto-confirm is enabled, so sign in immediately
//       const { error: loginError } = await signIn(form.email, form.password);
//       if (!loginError) {
//         navigate("/dashboard");
//         return;
//       }
//       setIsLogin(true);
//     }
//     setLoading(false);
//   };

//   const isDriver = form.role === "driver";

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="w-full max-w-md"
//       >
//         <div className="text-center mb-8">
//           <div className={`w-14 h-14 rounded-2xl ${isDriver ? "bg-secondary" : "gradient-primary"} flex items-center justify-center mx-auto mb-4`}>
//             {isDriver ? <Car className="w-7 h-7 text-secondary-foreground" /> : <MapPin className="w-7 h-7 text-primary-foreground" />}
//           </div>
//           <h1 className="text-3xl font-extrabold text-gradient">RideConnect</h1>
//           <p className="text-muted-foreground mt-1">
//             {isLogin ? "Welcome back!" : isDriver ? "Register as a Driver" : "Join as a Rider"}
//           </p>
//         </div>

//         {/* Role toggle */}
//         {!isLogin && (
//           <div className="flex rounded-xl overflow-hidden border border-border mb-6">
//             <button
//               type="button"
//               onClick={() => update("role", "rider")}
//               className={`flex-1 py-3 text-sm font-semibold transition-colors ${!isDriver ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
//             >
//               🚌 Rider
//             </button>
//             <button
//               type="button"
//               onClick={() => update("role", "driver")}
//               className={`flex-1 py-3 text-sm font-semibold transition-colors ${isDriver ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
//             >
//               🚗 Driver
//             </button>
//           </div>
//         )}

//         <div className="glass-card rounded-2xl p-6 space-y-5">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {!isLogin && (
//               <>
//                 {/* Profile Photo - Circle */}
//                 <div className="flex justify-center">
//                   <label className="cursor-pointer group">
//                     <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center overflow-hidden bg-muted group-hover:border-primary transition-colors">
//                       {photoPreview ? (
//                         <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
//                       ) : (
//                         <Camera className="w-8 h-8 text-muted-foreground" />
//                       )}
//                     </div>
//                     <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
//                     <p className="text-xs text-center text-muted-foreground mt-2">Profile Photo</p>
//                   </label>
//                 </div>

//                 <div>
//                   <Label>Full Name</Label>
//                   <Input placeholder="Enter your full name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
//                 </div>
//               </>
//             )}

//             <div>
//               <Label>Email</Label>
//               <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
//             </div>

//             <div>
//               <Label>Password</Label>
//               <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />
//             </div>

//             <Button type="submit" className="w-full gradient-primary text-primary-foreground" size="lg" disabled={loading}>
//               {loading ? "Please wait..." : isLogin ? (
//                 <><LogIn className="w-4 h-4 mr-2" /> Sign In</>
//               ) : (
//                 <><UserPlus className="w-4 h-4 mr-2" /> Create {isDriver ? "Driver" : "Rider"} Account</>
//               )}
//             </Button>
//           </form>

//           <div className="text-center">
//             <button
//               type="button"
//               onClick={() => setIsLogin(!isLogin)}
//               className="text-sm text-primary hover:underline"
//             >
//               {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Camera, LogIn, UserPlus, MapPin, Car } from "lucide-react";

export default function Auth() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get("role") === "driver" ? "driver" : "rider";

  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: roleFromUrl,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const update = (field: string, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
      console.log("KEY:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

      if (isLogin) {
        // Step 1: Sign in
        const { error: loginError } = await signIn(form.email, form.password);

        if (loginError) {
          toast.error(loginError.message);
          setLoading(false);
          return;
        }

        // Step 2: Get logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        console.log("Current user after login:", user);

        if (userError || !user) {
          toast.error("User not found after login");
          setLoading(false);
          return;
        }

        // Step 3: Fetch profile safely
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("Profile data:", profileData);
        console.log("Profile error:", profileError);

        if (profileError) {
          toast.error(profileError.message);
          setLoading(false);
          return;
        }

        // Step 4: Role check only if profile exists
        if (profileData && profileData.role !== form.role) {
          toast.error(
            `This account is registered as a ${profileData.role}. Please use the ${
              profileData.role === "driver" ? "Driver" : "Rider"
            } Login button.`
          );
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        // Signup flow
        if (!form.full_name.trim()) {
          toast.error("Please enter your name");
          setLoading(false);
          return;
        }

        const { error: signUpError } = await signUp(form.email, form.password, {
          full_name: form.full_name,
          role: form.role,
        });

        if (signUpError) {
          toast.error(signUpError.message);
          setLoading(false);
          return;
        }

        toast.success("Account created! Logging you in...");

        // Auto login after signup
        const { error: loginError } = await signIn(form.email, form.password);

        if (loginError) {
          toast.error(loginError.message);
          setIsLogin(true);
          setLoading(false);
          return;
        }

        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isDriver = form.role === "driver";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div
            className={`w-14 h-14 rounded-2xl ${
              isDriver ? "bg-secondary" : "gradient-primary"
            } flex items-center justify-center mx-auto mb-4`}
          >
            {isDriver ? (
              <Car className="w-7 h-7 text-secondary-foreground" />
            ) : (
              <MapPin className="w-7 h-7 text-primary-foreground" />
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-gradient">RideConnect</h1>

          <p className="text-muted-foreground mt-1">
            {isLogin
              ? "Welcome back!"
              : isDriver
              ? "Register as a Driver"
              : "Join as a Rider"}
          </p>
        </div>

        {!isLogin && (
          <div className="flex rounded-xl overflow-hidden border border-border mb-6">
            <button
              type="button"
              onClick={() => update("role", "rider")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                !isDriver
                  ? "gradient-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              🚌 Rider
            </button>

            <button
              type="button"
              onClick={() => update("role", "driver")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                isDriver
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              🚗 Driver
            </button>
          </div>
        )}

        <div className="glass-card rounded-2xl p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="flex justify-center">
                  <label className="cursor-pointer group">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center overflow-hidden bg-muted group-hover:border-primary transition-colors">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Profile Photo
                    </p>
                  </label>
                </div>

                <div>
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Enter your full name"
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Please wait..."
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" /> Create {isDriver ? "Driver" : "Rider"} Account
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
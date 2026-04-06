import ProfileSidebar from "./ProfileSidebar";
import { useAuth } from "@/context/AuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) return <>{children}</>;

  return (
    <div className="container flex gap-6 py-0">
      <div className="flex-1 min-w-0">{children}</div>
      <ProfileSidebar />
    </div>
  );
}

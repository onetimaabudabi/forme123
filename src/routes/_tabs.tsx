import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TabBar } from "@/components/TabBar";
import { SplashScreen } from "@/components/SplashScreen";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  const { user, profile, loading, needsProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/onboarding" });
    else if (needsProfile) navigate({ to: "/profile-setup" });
  }, [loading, user, needsProfile, navigate]);

  if (loading || !user || !profile) {
    return (
      <PhoneFrame>
        <div className="h-full flex items-center justify-center text-sm text-foreground/40">Loading…</div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar pb-28">
        <Outlet />
      </div>
      <TabBar />
    </PhoneFrame>
  );
}
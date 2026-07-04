import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { ProfileView } from "@/components/ProfileView";

export const Route = createFileRoute("/_tabs/profile")({
  head: () => ({ meta: [{ title: "Profile — Forme" }] }),
  component: MyProfile,
});

function MyProfile() {
  const { profile } = useAuth();
  if (!profile) return null;
  return (
    <div className="px-6 pt-14 pb-32">
      <ProfileView uid={profile.uid} />
    </div>
  );
}

import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft } from "lucide-react";
import { ProfileView } from "@/components/ProfileView";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/u/$uid")({
  head: () => ({ meta: [{ title: "Profile — Forme" }] }),
  component: PublicProfile,
});

function PublicProfile() {
  const { uid } = useParams({ from: "/u/$uid" });
  const { profile } = useAuth();

  // If user opens their own profile via /u/uid, still render the same view.
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between mb-2">
          <Link to="/feed" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <div className="size-10" />
        </div>
        {profile && <ProfileView uid={uid} />}
      </div>
    </PhoneFrame>
  );
}

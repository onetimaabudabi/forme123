import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Users, UserPlus } from "lucide-react";

export const Route = createFileRoute("/friends")({
  head: () => ({ meta: [{ title: "Friends — Forme" }] }),
  component: Friends,
});

function Friends() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Friends</h1>
          <div className="size-10" />
        </div>

        <div className="mt-10 surface p-8 text-center">
          <div className="size-14 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Users className="size-7 text-foreground/60" />
          </div>
          <p className="text-sm text-foreground/60 font-semibold">No friends yet</p>
          <p className="text-xs text-foreground/40 mt-1 max-w-[240px] mx-auto">Social features are coming soon. You'll be able to follow friends and share progress.</p>
          <button disabled className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-secondary text-foreground/40 font-semibold text-xs">
            <UserPlus className="size-4" /> Invite friends · coming soon
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
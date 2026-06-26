import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Crown } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Forme" }] }),
  component: Leaderboard,
});

function Leaderboard() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Leaderboard</h1>
          <div className="size-10" />
        </div>
        <div className="mt-10 surface p-8 text-center">
          <div className="size-14 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Crown className="size-7 text-foreground/60" />
          </div>
          <p className="text-sm text-foreground/60 font-semibold">Leaderboard coming soon</p>
          <p className="text-xs text-foreground/40 mt-1 max-w-[240px] mx-auto">Once friends are connected, you'll see rankings here.</p>
        </div>
      </div>
    </PhoneFrame>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Check, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getOrCreateTodayMission, toggleMission, type Mission } from "@/lib/missions";

export const Route = createFileRoute("/challenges")({
  head: () => ({ meta: [{ title: "Daily challenges — Forme" }] }),
  component: Challenges,
});

function Challenges() {
  const { profile } = useAuth();
  const [mission, setMission] = useState<Mission | null>(null);

  useEffect(() => {
    if (!profile) return;
    getOrCreateTodayMission(profile.uid, profile.goal, profile).then(setMission).catch(() => {});
  }, [profile]);

  const handle = async () => {
    if (!mission || !profile) return;
    const next = !mission.completed;
    setMission({ ...mission, completed: next });
    try { await toggleMission(profile.uid, mission.id, next); } catch { /* ignore */ }
  };

  if (!profile) return null;

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Daily challenges</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4 surface p-6">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Today</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">{mission?.completed ? "1 / 1" : "0 / 1"}</p>
          <p className="text-sm text-foreground/60 mt-1">Complete to extend your streak</p>
          <div className="mt-4 h-2 rounded-full bg-background overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: mission?.completed ? "100%" : "0%" }} />
          </div>
        </div>

        <div className="mt-5">
          {mission ? (
            <button onClick={handle} className="w-full surface p-4 flex items-center gap-3 text-left">
              <div className={`size-11 rounded-2xl flex items-center justify-center ${mission.completed ? "bg-accent text-white" : "bg-background border"}`}>
                {mission.completed ? <Check className="size-5" /> : <Target className="size-5" />}
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${mission.completed ? "line-through text-foreground/40" : ""}`}>{mission.title}</p>
                <p className="text-xs text-foreground/50 mt-0.5">Tap to mark {mission.completed ? "incomplete" : "complete"}</p>
              </div>
            </button>
          ) : (
            <p className="text-center text-sm text-foreground/40 mt-6">Loading…</p>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}
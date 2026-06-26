import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Trophy, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { ACHIEVEMENTS, listAchievements, type AchievementId } from "@/lib/achievements";

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements — Forme" }] }),
  component: Achievements,
});

function Achievements() {
  const { profile } = useAuth();
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!profile) return;
    listAchievements(profile.uid).then((a) => {
      setUnlocked(new Set(a.map((x) => x.id)));
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [profile]);

  if (!profile) return null;
  const total = ACHIEVEMENTS.length;
  const n = unlocked.size;

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Achievements</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4 surface p-6 text-center">
          <div className="size-16 mx-auto rounded-2xl bg-black flex items-center justify-center">
            <Trophy className="size-8 text-white" />
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight">{n} of {total}</p>
          <p className="text-sm text-foreground/50">badges unlocked</p>
          <div className="mt-4 h-1.5 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all" style={{ width: `${(n / total) * 100}%` }} />
          </div>
        </div>

        <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">All badges</h2>
        {!loaded ? (
          <p className="mt-3 text-xs text-foreground/40">Loading…</p>
        ) : n === 0 ? (
          <div className="mt-3 surface p-6 text-center text-sm text-foreground/60">
            No achievements yet — start logging activity to unlock badges.
          </div>
        ) : null}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((b) => {
            const u = unlocked.has(b.id);
            return (
              <div key={b.id} className="surface p-4 flex flex-col gap-2">
                <div className={`size-10 rounded-2xl flex items-center justify-center ${u ? "bg-black text-white" : "bg-background border text-foreground/30"}`}>
                  {u ? <Trophy className="size-5" /> : <Lock className="size-4" />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${u ? "" : "text-foreground/40"}`}>{b.name}</p>
                  <p className="text-[11px] text-foreground/50">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}
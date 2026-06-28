import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getFriendsLeaderboard, getGlobalLeaderboard, type LeaderboardEntry, type LeaderboardMetric } from "@/lib/leaderboards";
import { listFriendUids } from "@/lib/friends";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Forme" }] }),
  component: Leaderboard,
});

const METRICS: { id: LeaderboardMetric; label: string }[] = [
  { id: "currentStreak", label: "Streak" },
  { id: "longestStreak", label: "Longest" },
  { id: "totalWorkouts", label: "Workouts" },
  { id: "totalMissions", label: "Missions" },
  { id: "caloriesBurned", label: "kcal" },
];

function Leaderboard() {
  const { profile } = useAuth();
  const [scope, setScope] = useState<"global" | "friends">("friends");
  const [metric, setMetric] = useState<LeaderboardMetric>("currentStreak");
  const [items, setItems] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    if (!profile) return;
    setItems(null);
    (async () => {
      if (scope === "global") {
        setItems(await getGlobalLeaderboard(metric, 50).catch(() => []));
      } else {
        const friends = await listFriendUids(profile.uid).catch(() => []);
        const uids = Array.from(new Set([profile.uid, ...friends]));
        setItems(await getFriendsLeaderboard(metric, uids).catch(() => []));
      }
    })();
  }, [profile, scope, metric]);

  if (!profile) return null;

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Leaderboard</h1>
          <div className="size-10" />
        </div>

        <div className="mt-5 surface p-1 grid grid-cols-2 gap-1">
          {(["friends", "global"] as const).map((s) => (
            <button key={s} onClick={() => setScope(s)} className={`h-10 rounded-xl text-sm font-semibold transition ${scope === s ? "bg-black text-white" : "text-foreground/60"}`}>
              {s === "friends" ? "Friends" : "Global"}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {METRICS.map((m) => (
            <button key={m.id} onClick={() => setMetric(m.id)} className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold ${metric === m.id ? "bg-accent text-white" : "bg-secondary text-foreground/60"}`}>
              {m.label}
            </button>
          ))}
        </div>

        {items === null ? (
          <p className="mt-8 text-sm text-foreground/40">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-8 surface p-8 text-center">
            <div className="size-14 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Crown className="size-7 text-foreground/60" />
            </div>
            <p className="text-sm text-foreground/60 font-semibold">No rankings yet</p>
            <p className="text-xs text-foreground/40 mt-1 max-w-[240px] mx-auto">
              {scope === "friends" ? "Add friends to see how you rank." : "Be the first to log activity."}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {items.map((u, i) => (
              <Link key={u.uid} to="/u/$uid" params={{ uid: u.uid }} className="surface p-4 flex items-center gap-3">
                <div className={`size-9 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? "bg-yellow-400 text-black" : i === 1 ? "bg-gray-300 text-black" : i === 2 ? "bg-orange-400 text-white" : "bg-secondary"}`}>{i + 1}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{u.name ?? u.username ?? "—"}{u.uid === profile.uid && <span className="text-foreground/40"> (you)</span>}</p>
                  <p className="text-xs text-foreground/50">@{u.username ?? "user"}</p>
                </div>
                <p className="text-lg font-bold tracking-tight">{u.value}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
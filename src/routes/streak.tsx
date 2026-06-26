import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth";
import { getDb } from "@/lib/firebase";

export const Route = createFileRoute("/streak")({
  head: () => ({ meta: [{ title: "Streak calendar — Forme" }] }),
  component: Streak,
});

function Streak() {
  const { profile } = useAuth();
  const [completedDays, setCompletedDays] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const start = new Date(); start.setDate(start.getDate() - 29); start.setHours(0, 0, 0, 0);
      const snap = await getDocs(query(
        collection(getDb(), "missions"),
        where("uid", "==", profile.uid),
        where("createdAt", ">=", Timestamp.fromDate(start)),
        orderBy("createdAt", "desc"),
        limit(60),
      ));
      const set = new Set<string>();
      snap.docs.forEach((d) => {
        const data = d.data() as { completed: boolean; createdAt: Timestamp };
        if (!data.completed) return;
        const dt = data.createdAt.toDate();
        const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
        set.add(key);
      });
      setCompletedDays(set);
    })().catch(() => setCompletedDays(new Set()));
  }, [profile]);

  if (!profile) return null;

  const today = new Date();
  const cells: { day: number; key: string; isToday: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(today.getDate() - i);
    cells.push({
      day: d.getDate(),
      key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      isToday: i === 0,
    });
  }

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Streak</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4 surface p-6 text-center">
          <div className="size-16 mx-auto rounded-2xl bg-black flex items-center justify-center">
            <Flame className="size-8 text-white" />
          </div>
          <p className="mt-4 text-5xl font-bold tracking-tight">{profile.streak ?? 0}</p>
          <p className="text-sm text-foreground/50 font-medium">day streak</p>
        </div>

        <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">Last 30 days</h2>
        <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
          {cells.map((c) => {
            const done = completedDays?.has(c.key);
            return (
              <div key={c.key} className={`aspect-square rounded-xl flex items-center justify-center text-[11px] font-semibold ${
                done ? "bg-accent text-white" : "bg-secondary text-foreground/40"
              } ${c.isToday ? "ring-2 ring-black" : ""}`}>{c.day}</div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-foreground/60">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-accent" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-secondary" /> No activity</span>
        </div>

        <div className="mt-6 surface p-5">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Milestones</p>
          <div className="mt-3 space-y-3">
            {[{n:"7 day streak",t:7},{n:"30 day streak",t:30},{n:"100 day streak",t:100}].map((m) => {
              const s = profile.streak ?? 0;
              const done = s >= m.t;
              return (
                <div key={m.n} className="flex items-center justify-between">
                  <p className={`text-sm font-semibold ${done ? "" : "text-foreground/60"}`}>{m.n}</p>
                  <p className="text-xs text-foreground/50">{done ? "Unlocked" : `${m.t - s} to go`}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
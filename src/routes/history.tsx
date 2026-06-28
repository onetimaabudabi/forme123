import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Dumbbell, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { deleteWorkout, listWorkoutHistory, type WorkoutLog } from "@/lib/workouts";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Workout history — Forme" }] }),
  component: History,
});

function History() {
  const { profile } = useAuth();
  const [items, setItems] = useState<WorkoutLog[] | null>(null);

  const refresh = async () => {
    if (!profile) return;
    setItems(await listWorkoutHistory(profile.uid, 100));
  };
  useEffect(() => { void refresh(); }, [profile]);

  const remove = async (id: string) => { await deleteWorkout(id); await refresh(); };

  if (!profile) return null;
  const totals = (items ?? []).reduce(
    (a, b) => ({ count: a.count + 1, min: a.min + b.durationMin, kcal: a.kcal + b.kcal }),
    { count: 0, min: 0, kcal: 0 },
  );

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/workout" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">History</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat l="Workouts" v={String(totals.count)} />
          <Stat l="Hours" v={(totals.min / 60).toFixed(1)} />
          <Stat l="Calories" v={`${(totals.kcal / 1000).toFixed(1)}k`} />
        </div>

        {items === null ? (
          <p className="mt-8 text-sm text-foreground/40">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-8 surface p-8 text-center">
            <Dumbbell className="size-8 text-foreground/30 mx-auto" />
            <p className="mt-3 text-sm text-foreground/60">No workouts yet</p>
            <Link to="/workout" className="mt-5 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-black text-white font-semibold text-sm">Go to workout</Link>
          </div>
        ) : (
          <div className="mt-7">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-foreground/40">Sessions</h2>
            <div className="mt-3 space-y-2">
              {items.map((w) => (
                <div key={w.id} className="surface p-4 flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-background border flex items-center justify-center">
                    <Dumbbell className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{w.title}</p>
                    <p className="text-xs text-foreground/50">{w.completedAt.toLocaleDateString()} · {w.durationMin} min · {w.kcal} kcal</p>
                    {w.exercises && w.exercises.length > 0 && (
                      <p className="text-[11px] text-foreground/40 mt-1 truncate">
                        {w.exercises.length} exercises · {w.exercises.map((e) => `${e.name} ${e.sets}×${e.reps}`).join(" · ")}
                      </p>
                    )}
                  </div>
                  <button onClick={() => remove(w.id)} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="surface py-4 text-center">
      <p className="text-xl font-bold tracking-tight">{v}</p>
      <p className="text-[11px] text-foreground/50 mt-0.5 font-medium">{l}</p>
    </div>
  );
}
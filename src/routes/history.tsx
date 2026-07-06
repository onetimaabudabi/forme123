import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Clock, Dumbbell, Flame, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { deleteWorkout, subscribeWorkoutHistory, type WorkoutLog } from "@/lib/workouts";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Workout history — Forme" }] }),
  component: History,
});

function History() {
  const { profile } = useAuth();
  const [items, setItems] = useState<WorkoutLog[] | null>(null);
  const [open, setOpen] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    if (!profile) return;
    const unsub = subscribeWorkoutHistory(profile.uid, setItems);
    return () => unsub();
  }, [profile]);

  const remove = async (id: string) => { await deleteWorkout(id); if (open?.id === id) setOpen(null); };

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
                <button key={w.id} onClick={() => setOpen(w)} className="w-full text-left surface p-4 flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-background border flex items-center justify-center">
                    <Dumbbell className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{w.title}</p>
                    <p className="text-xs text-foreground/50">{w.completedAt.toLocaleDateString()} · {w.durationMin} min · {w.kcal} kcal</p>
                    {w.exercises && w.exercises.length > 0 && (
                      <p className="text-[11px] text-foreground/40 mt-1 truncate">
                        {w.exercises.length} exercises · {w.exercises.map((e) => `${e.name} ${e.sets}×${e.reps}`).join(" · ")}
                      </p>
                    )}
                  </div>
                  <span onClick={(e) => { e.stopPropagation(); remove(w.id); }} role="button" tabIndex={0} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Trash2 className="size-4" /></span>
                </button>
              ))}
            </div>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(null)} />
            <div className="relative w-full max-w-md mx-4 mb-6 rounded-3xl bg-background border shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-foreground/50 font-medium">{open.completedAt.toLocaleString()}</p>
                  <h3 className="text-xl font-bold tracking-tight mt-0.5">{open.title}</h3>
                </div>
                <button onClick={() => setOpen(null)} className="size-8 rounded-full bg-secondary flex items-center justify-center"><X className="size-4" /></button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-secondary p-3 flex items-center gap-2">
                  <Clock className="size-4 text-foreground/50" />
                  <div>
                    <p className="text-[11px] text-foreground/50">Duration</p>
                    <p className="text-sm font-bold">{open.durationMin} min</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-secondary p-3 flex items-center gap-2">
                  <Flame className="size-4 text-foreground/50" />
                  <div>
                    <p className="text-[11px] text-foreground/50">Calories</p>
                    <p className="text-sm font-bold">{open.kcal} kcal</p>
                  </div>
                </div>
              </div>
              <h4 className="mt-5 text-xs uppercase tracking-wider font-semibold text-foreground/40">Exercises</h4>
              <div className="mt-2 space-y-2">
                {open.exercises.map((ex, i) => (
                  <div key={i} className="rounded-2xl bg-secondary p-3">
                    <p className="text-sm font-semibold">{ex.name}</p>
                    <p className="text-xs text-foreground/60">{ex.sets} × {ex.reps} · rest {ex.rest}</p>
                  </div>
                ))}
                {open.exercises.length === 0 && <p className="text-sm text-foreground/40">No exercise data.</p>}
              </div>
              <button onClick={() => remove(open.id)} className="mt-5 w-full h-11 rounded-full bg-secondary text-sm font-semibold flex items-center justify-center gap-2 text-destructive">
                <Trash2 className="size-4" /> Delete workout
              </button>
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
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Flame, Check, Sparkles, Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { generateWorkoutPlan, getActivePlan, logCompletedWorkout, type WorkoutPlan } from "@/lib/workouts";
import { evaluateAchievements, countWorkouts } from "@/lib/achievements";

export const Route = createFileRoute("/_tabs/workout")({
  head: () => ({ meta: [{ title: "Workout — Forme" }] }),
  component: Workout,
});

function Workout() {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [gen, setGen] = useState(false);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    getActivePlan(profile.uid).then((p) => { setPlan(p); setLoading(false); }).catch(() => setLoading(false));
  }, [profile]);

  const generate = async () => {
    if (!profile) return;
    setGen(true); setError(null); setDone(new Set()); setLogged(false);
    try {
      const p = await generateWorkoutPlan(profile);
      setPlan(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate plan");
    } finally { setGen(false); }
  };

  const toggle = (i: number) => {
    setDone((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i); else n.add(i);
      return n;
    });
  };

  const complete = async () => {
    if (!profile || !plan) return;
    try {
      await logCompletedWorkout(profile.uid, plan);
      setLogged(true);
      const count = await countWorkouts(profile.uid);
      await evaluateAchievements(profile.uid, { workoutCount: count, streak: profile.streak });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to log workout");
    }
  };

  if (!profile) return null;

  return (
    <div className="px-6 pt-14">
      <p className="text-sm text-foreground/50 font-medium">Today's plan</p>
      <h1 className="text-3xl font-bold tracking-tight mt-1">{plan?.title ?? "No workout yet"}</h1>

      {loading ? (
        <p className="mt-8 text-sm text-foreground/40">Loading…</p>
      ) : !plan ? (
        <div className="mt-8 surface p-8 text-center">
          <div className="size-14 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Dumbbell className="size-7 text-foreground/60" />
          </div>
          <p className="text-sm text-foreground/60">No workouts yet</p>
          <p className="text-xs text-foreground/40 mt-1">Generate one tailored to your goal.</p>
          <button onClick={generate} disabled={gen} className="mt-5 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-black text-white font-semibold text-sm disabled:opacity-50">
            <Sparkles className="size-4" /> {gen ? "Generating…" : "Generate workout plan"}
          </button>
          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
        </div>
      ) : (
        <>
          <div className="mt-5 surface p-5">
            <div className="flex items-center justify-between">
              <div className="flex gap-5">
                <div>
                  <div className="flex items-center gap-1.5 text-foreground/50 text-xs"><Clock className="size-3.5" />Duration</div>
                  <p className="text-lg font-bold mt-0.5">{plan.durationMin} min</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-foreground/50 text-xs"><Flame className="size-3.5" />Burn</div>
                  <p className="text-lg font-bold mt-0.5">~{plan.estKcal} kcal</p>
                </div>
              </div>
              <button onClick={generate} disabled={gen} title="Regenerate" className="size-11 rounded-full bg-black flex items-center justify-center text-white active:scale-95 transition disabled:opacity-50">
                <Sparkles className="size-4" />
              </button>
            </div>
            <div className="mt-4 h-1.5 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(done.size / plan.exercises.length) * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-foreground/50">{done.size} of {plan.exercises.length} exercises completed</p>
          </div>

          <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">Exercises</h2>
          <div className="mt-3 space-y-2">
            {plan.exercises.map((ex, i) => {
              const isDone = done.has(i);
              return (
                <button key={i} onClick={() => toggle(i)} className="w-full text-left surface p-4 flex items-center gap-3">
                  <div className={`size-9 rounded-full flex items-center justify-center text-xs font-semibold ${isDone ? "bg-accent text-white" : "bg-background border"}`}>
                    {isDone ? <Check className="size-4" /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${isDone ? "line-through text-foreground/40" : ""}`}>{ex.name}</p>
                    <p className="text-xs text-foreground/50">{ex.sets} × {ex.reps} · rest {ex.rest}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {done.size === plan.exercises.length && !logged && (
            <button onClick={complete} className="mt-5 w-full h-14 rounded-full bg-accent text-white font-semibold text-sm active:scale-[0.98]">
              Finish & log workout
            </button>
          )}
          {logged && <p className="mt-5 text-center text-sm text-emerald-600 font-semibold">Workout saved ✓</p>}
          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}
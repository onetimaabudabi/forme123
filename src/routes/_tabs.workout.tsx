import { createFileRoute } from "@tanstack/react-router";
import { Clock, Flame, Check, Sparkles, Dumbbell, X, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { generateWorkoutPlan, getActivePlan, logCompletedWorkout, type WorkoutPlan } from "@/lib/workouts";
import { evaluateAchievements, countWorkouts } from "@/lib/achievements";
import { postActivity } from "@/lib/social";

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
  const [shareOpen, setShareOpen] = useState(false);
  const [completed, setCompleted] = useState<WorkoutPlan | null>(null);
  const [caption, setCaption] = useState("");
  const [sharing, setSharing] = useState(false);

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
      setCompleted(plan);
      setLogged(true);
      const count = await countWorkouts(profile.uid);
      await evaluateAchievements(profile.uid, { workoutCount: count, streak: profile.streak });
      setPlan(null);
      setShareOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to log workout");
    }
  };

  const share = async () => {
    if (!profile || !completed) return;
    setSharing(true);
    try {
      await postActivity(profile.uid, "workout_completed", {
        title: completed.title,
        durationMin: completed.durationMin,
        kcal: completed.estKcal,
        exercises: completed.exercises.length,
        caption: caption.trim() || undefined,
        completedAt: new Date().toISOString(),
      });
    } finally {
      setSharing(false);
      setShareOpen(false);
      setCaption("");
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

      {shareOpen && completed && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={() => setShareOpen(false)} />
          <div className="relative w-full max-w-md mx-4 mb-6 rounded-3xl bg-background border shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300">
            <button onClick={() => setShareOpen(false)} className="absolute top-4 right-4 size-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="size-4" />
            </button>
            <div className="size-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
              <Share2 className="size-7 text-accent" />
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-center">Workout complete!</h3>
            <p className="mt-1 text-sm text-foreground/60 text-center">Share with your friends?</p>

            <div className="mt-5 rounded-2xl bg-secondary p-4">
              <p className="text-sm font-semibold">{completed.title}</p>
              <p className="text-xs text-foreground/60 mt-0.5">{completed.durationMin} min · {completed.exercises.length} exercises · ~{completed.estKcal} kcal</p>
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a note (optional)…"
              maxLength={200}
              className="mt-3 w-full rounded-2xl bg-secondary px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/40 resize-none"
              rows={2}
            />

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setShareOpen(false)} className="h-12 rounded-full bg-secondary font-semibold text-sm active:scale-[0.98] transition">
                Not now
              </button>
              <button onClick={share} disabled={sharing} className="h-12 rounded-full bg-black text-white font-semibold text-sm active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2">
                <Share2 className="size-4" /> {sharing ? "Sharing…" : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
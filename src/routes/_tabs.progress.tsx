import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingDown, TrendingUp, Scale, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { deleteWeight, listWeights, logWeight, type WeightEntry } from "@/lib/weights";
import { listWorkoutHistory } from "@/lib/workouts";
import { listSleep } from "@/lib/sleep";

export const Route = createFileRoute("/_tabs/progress")({
  head: () => ({ meta: [{ title: "Progress — Forme" }] }),
  component: Progress,
});

function Chart({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values) - 0.3;
  const max = Math.max(...values) + 0.3;
  const norm = (v: number) => 1 - (v - min) / Math.max(0.001, max - min);
  const W = 320, H = 140;
  const step = W / (values.length - 1);
  const pts = values.map((v, i) => [i * step, norm(v) * H] as const);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${path} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H + 8}`} className="w-full">
      <path d={area} fill="var(--accent)" opacity="0.08" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => i === pts.length - 1 && <circle key={i} cx={x} cy={y} r="5" fill="var(--accent)" />)}
    </svg>
  );
}

function Progress() {
  const { profile } = useAuth();
  const [weights, setWeights] = useState<WeightEntry[] | null>(null);
  const [workouts30, setWorkouts30] = useState<number>(0);
  const [avgSleep, setAvgSleep] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");

  const refresh = async () => {
    if (!profile) return;
    const [w, h, s] = await Promise.all([
      listWeights(profile.uid, 60),
      listWorkoutHistory(profile.uid, 100),
      listSleep(profile.uid, 14),
    ]);
    setWeights(w);
    const cutoff = Date.now() - 30 * 86400_000;
    setWorkouts30(h.filter((x) => x.completedAt.getTime() >= cutoff).length);
    setAvgSleep(s.length ? s.reduce((a, b) => a + b.hours, 0) / s.length : null);
  };
  useEffect(() => { void refresh(); }, [profile]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const n = Number(val);
    if (!Number.isFinite(n) || n <= 0) return;
    await logWeight(profile.uid, n);
    const { unlockAchievement } = await import("@/lib/achievements");
    unlockAchievement(profile.uid, "first_weight").catch(() => {});
    setVal(""); setShow(false); await refresh();
  };

  const remove = async (id: string) => {
    await deleteWeight(id); await refresh();
  };

  if (!profile) return null;
  const ordered = weights ? [...weights].reverse() : [];
  const latest = ordered[ordered.length - 1]?.weight;
  const first = ordered[0]?.weight;
  const delta = latest !== undefined && first !== undefined ? +(latest - first).toFixed(1) : null;

  return (
    <div className="px-6 pt-14">
      <p className="text-sm text-foreground/50 font-medium">Analytics</p>
      <h1 className="text-3xl font-bold tracking-tight mt-1">Your progress</h1>

      <div className="mt-5 surface p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Weight</p>
            <p className="text-3xl font-bold tracking-tight mt-1">{latest ?? "—"} <span className="text-base text-foreground/40">kg</span></p>
          </div>
          {delta !== null && delta !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${delta < 0 ? "text-emerald-600" : "text-foreground/60"}`}>
              {delta < 0 ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />} {delta > 0 ? "+" : ""}{delta} kg
            </div>
          )}
        </div>
        {weights === null ? (
          <p className="mt-6 text-xs text-foreground/40">Loading…</p>
        ) : weights.length === 0 ? (
          <div className="mt-6 text-center py-6">
            <Scale className="size-8 text-foreground/30 mx-auto" />
            <p className="mt-3 text-sm text-foreground/60">No weight history yet</p>
            <button onClick={() => setShow(true)} className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-black text-white text-xs font-semibold">
              <Plus className="size-3.5" /> Add weight
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4"><Chart values={ordered.map((w) => w.weight)} /></div>
            <button onClick={() => setShow(true)} className="mt-3 w-full h-10 rounded-full bg-secondary text-xs font-semibold flex items-center justify-center gap-1.5">
              <Plus className="size-3.5" /> Add weight
            </button>
          </>
        )}
      </div>

      {show && (
        <form onSubmit={add} className="mt-3 surface p-4 flex gap-2 items-center">
          <input autoFocus type="number" step="0.1" value={val} onChange={(e) => setVal(e.target.value)} placeholder="kg" className="flex-1 h-11 rounded-xl bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
          <button type="submit" className="h-11 px-4 rounded-xl bg-accent text-white text-sm font-semibold">Save</button>
          <button type="button" onClick={() => setShow(false)} className="h-11 px-3 rounded-xl bg-secondary text-sm">Cancel</button>
        </form>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Workouts (30d)" value={String(workouts30)} />
        <Stat label="Avg sleep" value={avgSleep ? `${avgSleep.toFixed(1)}h` : "—"} />
        <Stat label="Streak" value={`${profile.streak ?? 0}d`} />
        <Stat label="Logs" value={String(weights?.length ?? 0)} />
      </div>

      {weights && weights.length > 0 && (
        <>
          <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">Weight log</h2>
          <div className="mt-3 surface divide-y divide-black/5">
            {weights.slice(0, 8).map((w) => (
              <div key={w.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{w.weight} kg</p>
                  <p className="text-xs text-foreground/40">{w.createdAt.toLocaleDateString()}</p>
                </div>
                <button onClick={() => remove(w.id)} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <Link to="/measurements" className="mt-5 block text-center text-xs text-accent font-semibold">Track body measurements →</Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-4">
      <p className="text-xs text-foreground/50 font-medium">{label}</p>
      <p className="text-2xl font-bold mt-2 tracking-tight">{value}</p>
    </div>
  );
}
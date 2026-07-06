import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Pencil, Plus, Ruler, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  addMeasurement,
  deleteMeasurement,
  subscribeMeasurements,
  updateMeasurement,
  type Measurement,
  type MeasurementKey,
} from "@/lib/measurements";
import { deleteWeight, listWeights, logWeight, updateWeight, type WeightEntry } from "@/lib/weights";
import { onSnapshot, collection, query, where, limit } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { unlockAchievement } from "@/lib/achievements";

export const Route = createFileRoute("/measurements")({
  head: () => ({ meta: [{ title: "Body measurements — Forme" }] }),
  component: Measurements,
});

const KEYS: { id: MeasurementKey; label: string }[] = [
  { id: "chest", label: "Chest" },
  { id: "waist", label: "Waist" },
  { id: "hips", label: "Hips" },
  { id: "leftArm", label: "Left arm" },
  { id: "rightArm", label: "Right arm" },
  { id: "leftThigh", label: "Left thigh" },
  { id: "rightThigh", label: "Right thigh" },
];

type FormState = Record<MeasurementKey, string>;
const EMPTY: FormState = { chest: "", waist: "", hips: "", neck: "", leftArm: "", rightArm: "", leftThigh: "", rightThigh: "" };

function MiniChart({ values, unit = "" }: { values: number[]; unit?: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = Math.max(0.001, max - min);
  const W = 300, H = 60;
  const step = W / (values.length - 1);
  const pts = values.map((v, i) => [i * step, H - ((v - min) / range) * H] as const);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y.toFixed(1)}`).join(" ");
  return (
    <div className="mt-2">
      <svg viewBox={`0 0 ${W} ${H + 4}`} className="w-full h-12">
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => i === pts.length - 1 && <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" />)}
      </svg>
      <div className="flex justify-between text-[10px] text-foreground/40 mt-0.5">
        <span>{min.toFixed(1)}{unit}</span>
        <span>{max.toFixed(1)}{unit}</span>
      </div>
    </div>
  );
}

function Measurements() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Measurement[] | null>(null);
  const [weights, setWeights] = useState<WeightEntry[] | null>(null);
  const [show, setShow] = useState(false);
  const [weight, setWeight] = useState("");
  const [form, setForm] = useState<FormState>({ ...EMPTY });
  const [editing, setEditing] = useState<Measurement | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ ...EMPTY });
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
  const [editWeightVal, setEditWeightVal] = useState("");

  useEffect(() => {
    if (!profile) return;
    const unsub = subscribeMeasurements(profile.uid, setItems);
    // Realtime weights
    const wq = query(collection(getDb(), "weights"), where("uid", "==", profile.uid), limit(200));
    const unsubW = onSnapshot(wq, (snap) => {
      const list: WeightEntry[] = snap.docs.map((d) => {
        const data = d.data() as { uid: string; weight: number; createdAt: { toDate(): Date } };
        return { id: d.id, uid: data.uid, weight: data.weight, createdAt: data.createdAt.toDate() };
      });
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setWeights(list);
    });
    // Fallback initial load
    listWeights(profile.uid, 200).then(setWeights).catch(() => {});
    return () => { unsub(); unsubW(); };
  }, [profile]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const payload: Partial<Record<MeasurementKey, number>> = {};
    (Object.keys(form) as MeasurementKey[]).forEach((k) => {
      const v = Number(form[k]);
      if (Number.isFinite(v) && v > 0) payload[k] = v;
    });
    const w = Number(weight);
    const hasWeight = Number.isFinite(w) && w > 0;
    if (Object.keys(payload).length === 0 && !hasWeight) return;
    if (Object.keys(payload).length > 0) {
      await addMeasurement(profile.uid, payload);
      unlockAchievement(profile.uid, "first_measurement").catch(() => {});
    }
    if (hasWeight) await logWeight(profile.uid, w);
    setForm({ ...EMPTY }); setWeight(""); setShow(false);
  };

  const openEdit = (m: Measurement) => {
    const f: FormState = { ...EMPTY };
    (Object.keys(EMPTY) as MeasurementKey[]).forEach((k) => { f[k] = m[k] !== undefined ? String(m[k]) : ""; });
    setEditForm(f);
    setEditing(m);
  };
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const patch: Partial<Record<MeasurementKey, number | null>> = {};
    (Object.keys(editForm) as MeasurementKey[]).forEach((k) => {
      const raw = editForm[k].trim();
      if (raw === "") patch[k] = null;
      else { const v = Number(raw); if (Number.isFinite(v) && v > 0) patch[k] = v; }
    });
    await updateMeasurement(editing.id, patch);
    setEditing(null);
  };

  const saveWeightEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeight || !profile) return;
    const n = Number(editWeightVal);
    if (!Number.isFinite(n) || n <= 0) return;
    await updateWeight(editingWeight.id, n, profile.uid);
    setEditingWeight(null);
  };

  const latest = items?.[0];
  const prev = items?.[1];
  const remove = async (id: string) => { await deleteMeasurement(id); };

  // Chart series (chronological)
  const chartSeries = useMemo(() => {
    const asc = items ? [...items].reverse() : [];
    const s: Record<MeasurementKey, number[]> = { chest: [], waist: [], hips: [], neck: [], leftArm: [], rightArm: [], leftThigh: [], rightThigh: [] };
    for (const m of asc) (Object.keys(s) as MeasurementKey[]).forEach((k) => { if (m[k] !== undefined) s[k].push(m[k] as number); });
    return s;
  }, [items]);
  const weightSeries = useMemo(() => (weights ? [...weights].reverse().map((w) => w.weight) : []), [weights]);

  if (!profile) return null;
  const latestWeight = weights?.[0];

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/progress" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Measurements</h1>
          <button onClick={() => setShow(true)} className="size-10 -mr-2 flex items-center justify-center"><Plus className="size-5" /></button>
        </div>

        {/* Weight card */}
        <div className="mt-4 surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground/50 font-medium">Weight</p>
              <p className="text-2xl font-bold tracking-tight mt-1">{latestWeight ? `${latestWeight.weight} kg` : "—"}</p>
              {latestWeight && <p className="text-[11px] text-foreground/40 mt-0.5">Updated {latestWeight.createdAt.toLocaleDateString()}</p>}
            </div>
          </div>
          {weightSeries.length >= 2 && <MiniChart values={weightSeries} unit=" kg" />}
        </div>

        {items === null ? (
          <p className="mt-10 text-sm text-foreground/40">Loading…</p>
        ) : items.length === 0 && (weights?.length ?? 0) === 0 ? (
          <div className="mt-8 surface p-8 text-center">
            <Ruler className="size-8 text-foreground/30 mx-auto" />
            <p className="mt-3 text-sm text-foreground/60">No measurements yet</p>
            <button onClick={() => setShow(true)} className="mt-5 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-black text-white font-semibold text-sm">
              <Plus className="size-4" /> Log measurement
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {KEYS.map(({ id, label }) => {
                const v = latest?.[id];
                const p = prev?.[id];
                const d = v !== undefined && p !== undefined ? +(v - p).toFixed(1) : null;
                const series = chartSeries[id];
                return (
                  <div key={id} className="surface p-4">
                    <p className="text-xs text-foreground/50 font-medium">{label}</p>
                    <p className="text-2xl font-bold tracking-tight mt-2">{v !== undefined ? `${v} cm` : "—"}</p>
                    {d !== null && d !== 0 && (
                      <p className={`text-xs mt-1 font-semibold ${d < 0 ? "text-emerald-600" : "text-foreground/60"}`}>{d > 0 ? "+" : ""}{d} cm</p>
                    )}
                    {series.length >= 2 && <MiniChart values={series} unit=" cm" />}
                  </div>
                );
              })}
            </div>
            {weights && weights.length > 0 && (
              <>
                <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">Weight log</h2>
                <div className="mt-3 surface divide-y divide-black/5">
                  {weights.slice(0, 12).map((w) => (
                    <div key={w.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{w.weight} kg</p>
                        <p className="text-xs text-foreground/40">{w.createdAt.toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => { setEditingWeight(w); setEditWeightVal(String(w.weight)); }} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Pencil className="size-4" /></button>
                      <button onClick={() => deleteWeight(w.id)} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Trash2 className="size-4" /></button>
                    </div>
                  ))}
                </div>
              </>
            )}
            {items.length > 0 && (
              <>
                <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">History</h2>
                <div className="mt-3 surface divide-y divide-black/5">
                  {items.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground/40">{m.createdAt.toLocaleDateString()}</p>
                        <p className="text-sm truncate">{KEYS.filter(({ id }) => m[id] !== undefined).map(({ id, label }) => `${label} ${m[id]}cm`).join(" · ") || "—"}</p>
                      </div>
                      <button onClick={() => openEdit(m)} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Pencil className="size-4" /></button>
                      <button onClick={() => remove(m.id)} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Trash2 className="size-4" /></button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {show && (
          <form onSubmit={submit} className="mt-5 surface p-4 space-y-2">
            <div className="flex items-center gap-3">
              <label className="w-20 text-xs font-semibold text-foreground/60">Weight</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="kg" className="flex-1 h-11 rounded-xl bg-secondary px-3 text-sm" />
            </div>
            {KEYS.map(({ id, label }) => (
              <div key={id} className="flex items-center gap-3">
                <label className="w-20 text-xs font-semibold text-foreground/60">{label}</label>
                <input type="number" step="0.1" value={form[id]} onChange={(e) => setForm({ ...form, [id]: e.target.value })} placeholder="cm" className="flex-1 h-11 rounded-xl bg-secondary px-3 text-sm" />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 h-11 rounded-full bg-accent text-white text-sm font-semibold">Save</button>
              <button type="button" onClick={() => setShow(false)} className="h-11 px-4 rounded-full bg-secondary text-sm">Cancel</button>
            </div>
          </form>
        )}

        {editing && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
            <form onSubmit={saveEdit} className="relative w-full max-w-md mx-4 mb-6 rounded-3xl bg-background border shadow-2xl p-5 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-semibold">Edit measurement</h3>
                <button type="button" onClick={() => setEditing(null)} className="size-8 rounded-full bg-secondary flex items-center justify-center"><X className="size-4" /></button>
              </div>
              {KEYS.map(({ id, label }) => (
                <div key={id} className="flex items-center gap-3">
                  <label className="w-20 text-xs font-semibold text-foreground/60">{label}</label>
                  <input type="number" step="0.1" value={editForm[id]} onChange={(e) => setEditForm({ ...editForm, [id]: e.target.value })} placeholder="cm" className="flex-1 h-11 rounded-xl bg-secondary px-3 text-sm" />
                </div>
              ))}
              <button type="submit" className="w-full h-11 rounded-full bg-accent text-white text-sm font-semibold mt-2">Save changes</button>
            </form>
          </div>
        )}

        {editingWeight && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditingWeight(null)} />
            <form onSubmit={saveWeightEdit} className="relative w-full max-w-md mx-4 mb-6 rounded-3xl bg-background border shadow-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Edit weight</h3>
                <button type="button" onClick={() => setEditingWeight(null)} className="size-8 rounded-full bg-secondary flex items-center justify-center"><X className="size-4" /></button>
              </div>
              <input autoFocus type="number" step="0.1" value={editWeightVal} onChange={(e) => setEditWeightVal(e.target.value)} placeholder="kg" className="w-full h-11 rounded-xl bg-secondary px-3 text-sm" />
              <button type="submit" className="w-full h-11 rounded-full bg-accent text-white text-sm font-semibold">Save changes</button>
            </form>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
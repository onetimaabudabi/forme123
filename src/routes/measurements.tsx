import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Plus, Ruler, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { addMeasurement, deleteMeasurement, listMeasurements, type Measurement, type MeasurementKey } from "@/lib/measurements";
import { unlockAchievement } from "@/lib/achievements";

export const Route = createFileRoute("/measurements")({
  head: () => ({ meta: [{ title: "Body measurements — Forme" }] }),
  component: Measurements,
});

const KEYS: { id: MeasurementKey; label: string }[] = [
  { id: "chest", label: "Chest" },
  { id: "waist", label: "Waist" },
  { id: "arms", label: "Arms" },
  { id: "hips", label: "Hips" },
  { id: "legs", label: "Legs" },
];

function Measurements() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Measurement[] | null>(null);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<Record<MeasurementKey, string>>({ chest: "", waist: "", arms: "", hips: "", legs: "" });

  const refresh = async () => {
    if (!profile) return;
    setItems(await listMeasurements(profile.uid));
  };
  useEffect(() => { void refresh(); }, [profile]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const payload: Partial<Record<MeasurementKey, number>> = {};
    (Object.keys(form) as MeasurementKey[]).forEach((k) => {
      const v = Number(form[k]);
      if (Number.isFinite(v) && v > 0) payload[k] = v;
    });
    if (Object.keys(payload).length === 0) return;
    await addMeasurement(profile.uid, payload);
    unlockAchievement(profile.uid, "first_measurement").catch(() => {});
    setForm({ chest: "", waist: "", arms: "", hips: "", legs: "" });
    setShow(false);
    await refresh();
  };

  const latest = items?.[0];
  const prev = items?.[1];
  const remove = async (id: string) => { await deleteMeasurement(id); await refresh(); };

  if (!profile) return null;

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/progress" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Measurements</h1>
          <button onClick={() => setShow(true)} className="size-10 -mr-2 flex items-center justify-center"><Plus className="size-5" /></button>
        </div>

        {items === null ? (
          <p className="mt-10 text-sm text-foreground/40">Loading…</p>
        ) : items.length === 0 ? (
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
                return (
                  <div key={id} className="surface p-4">
                    <p className="text-xs text-foreground/50 font-medium">{label}</p>
                    <p className="text-2xl font-bold tracking-tight mt-2">{v !== undefined ? `${v} cm` : "—"}</p>
                    {d !== null && d !== 0 && (
                      <p className={`text-xs mt-1 font-semibold ${d < 0 ? "text-emerald-600" : "text-foreground/60"}`}>{d > 0 ? "+" : ""}{d} cm</p>
                    )}
                  </div>
                );
              })}
            </div>
            <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">History</h2>
            <div className="mt-3 surface divide-y divide-black/5">
              {items.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground/40">{m.createdAt.toLocaleDateString()}</p>
                    <p className="text-sm">{KEYS.filter(({ id }) => m[id] !== undefined).map(({ id, label }) => `${label} ${m[id]}cm`).join(" · ")}</p>
                  </div>
                  <button onClick={() => remove(m.id)} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {show && (
          <form onSubmit={submit} className="mt-5 surface p-4 space-y-2">
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
      </div>
    </PhoneFrame>
  );
}
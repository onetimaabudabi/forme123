import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Plus, Apple, Pencil, Trash2, Droplets, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { addNutrition, addWater, deleteNutrition, subscribeTodayNutrition, subscribeTodayWater, updateNutrition, type NutritionEntry } from "@/lib/nutrition";

export const Route = createFileRoute("/nutrition")({
  head: () => ({ meta: [{ title: "Nutrition — Forme" }] }),
  component: Nutrition,
});

function Macro({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-semibold">{label}</span>
        <span className="text-foreground/50">{Math.round(value)} / {goal} g</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

const MEALS = ["breakfast", "lunch", "dinner", "snack"] as const;
type Meal = typeof MEALS[number];

type FormState = { meal: Meal; name: string; kcal: string; protein: string; carbs: string; fat: string; mealTime: string; notes: string };
const EMPTY_FORM: FormState = { meal: "breakfast", name: "", kcal: "", protein: "", carbs: "", fat: "", mealTime: "", notes: "" };

function Nutrition() {
  const { profile } = useAuth();
  const [items, setItems] = useState<NutritionEntry[] | null>(null);
  const [waterMl, setWaterMl] = useState(0);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [editing, setEditing] = useState<NutritionEntry | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ ...EMPTY_FORM });

  useEffect(() => {
    if (!profile) return;
    const un1 = subscribeTodayNutrition(profile.uid, setItems);
    const un2 = subscribeTodayWater(profile.uid, setWaterMl);
    return () => { un1(); un2(); };
  }, [profile]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.name.trim()) return;
    await addNutrition(profile.uid, {
      meal: form.meal,
      name: form.name.trim(),
      kcal: Number(form.kcal) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      mealTime: form.mealTime || null,
      notes: form.notes.trim() || null,
    });
    setForm({ ...EMPTY_FORM });
    setShow(false);
  };

  const openEdit = (m: NutritionEntry) => {
    setEditing(m);
    setEditForm({
      meal: m.meal, name: m.name,
      kcal: String(m.kcal), protein: String(m.protein), carbs: String(m.carbs), fat: String(m.fat),
      mealTime: m.mealTime ?? "", notes: m.notes ?? "",
    });
  };
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editForm.name.trim()) return;
    await updateNutrition(editing.id, {
      meal: editForm.meal,
      name: editForm.name.trim(),
      kcal: Number(editForm.kcal) || 0,
      protein: Number(editForm.protein) || 0,
      carbs: Number(editForm.carbs) || 0,
      fat: Number(editForm.fat) || 0,
      mealTime: editForm.mealTime || null,
      notes: editForm.notes.trim() || null,
    });
    setEditing(null);
  };

  const remove = async (id: string) => { await deleteNutrition(id); };
  const addGlass = async () => { if (!profile) return; await addWater(profile.uid, 250); };

  const goals = useMemo(() => {
    // Reasonable defaults derived from profile: kcal via TDEE-lite, macros by goal.
    if (!profile) return { kcal: 2000, protein: 140, carbs: 220, fat: 65 };
    const w = Number(profile.weight) || 70;
    const base = w * (profile.goal === "muscle_gain" ? 34 : profile.goal === "weight_loss" ? 26 : 30);
    const kcal = Math.max(1400, Math.round(base / 10) * 10);
    const protein = Math.round(w * (profile.goal === "muscle_gain" ? 2 : 1.7));
    const fat = Math.round((kcal * 0.28) / 9);
    const carbs = Math.max(80, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, carbs, fat };
  }, [profile]);

  if (!profile) return null;
  const totals = (items ?? []).reduce(
    (a, b) => ({ kcal: a.kcal + b.kcal, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const kcalPct = Math.min(100, (totals.kcal / goals.kcal) * 100);

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Nutrition</h1>
          <button onClick={() => setShow(true)} className="size-10 -mr-2 flex items-center justify-center"><Plus className="size-5" /></button>
        </div>

        <div className="mt-4 surface p-5">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Today</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-4xl font-bold tracking-tight">{totals.kcal.toLocaleString()}</span>
            <span className="text-base text-foreground/40">/ {goals.kcal.toLocaleString()} kcal</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${kcalPct}%` }} />
          </div>
          <div className="mt-5 space-y-3">
            <Macro label="Protein" value={totals.protein} goal={goals.protein} color="#007AFF" />
            <Macro label="Carbs" value={totals.carbs} goal={goals.carbs} color="#000" />
            <Macro label="Fat" value={totals.fat} goal={goals.fat} color="#999" />
          </div>
        </div>

        <div className="mt-4 surface p-4 flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-secondary flex items-center justify-center"><Droplets className="size-5 text-accent" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Water</p>
            <p className="text-xs text-foreground/50">{(waterMl / 1000).toFixed(2)} L today</p>
          </div>
          <button onClick={addGlass} className="h-10 px-4 rounded-full bg-black text-white text-xs font-semibold">+ 250 ml</button>
        </div>

        {show && (
          <form onSubmit={submit} className="mt-4 surface p-4 space-y-2">
            <select value={form.meal} onChange={(e) => setForm({ ...form, meal: e.target.value as typeof MEALS[number] })} className="w-full h-11 rounded-xl bg-secondary px-3 text-sm">
              {MEALS.map((m) => <option key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}</option>)}
            </select>
            <input required placeholder="What did you eat?" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-11 rounded-xl bg-secondary px-3 text-sm" />
            <div className="grid grid-cols-4 gap-2">
              <input type="number" placeholder="kcal" value={form.kcal} onChange={(e) => setForm({ ...form, kcal: e.target.value })} className="h-11 rounded-xl bg-secondary px-3 text-sm" />
              <input type="number" placeholder="P g" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} className="h-11 rounded-xl bg-secondary px-3 text-sm" />
              <input type="number" placeholder="C g" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} className="h-11 rounded-xl bg-secondary px-3 text-sm" />
              <input type="number" placeholder="F g" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} className="h-11 rounded-xl bg-secondary px-3 text-sm" />
            </div>
            <input type="time" value={form.mealTime} onChange={(e) => setForm({ ...form, mealTime: e.target.value })} className="w-full h-11 rounded-xl bg-secondary px-3 text-sm" />
            <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full rounded-xl bg-secondary px-3 py-2 text-sm resize-none" />
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 h-11 rounded-full bg-accent text-white text-sm font-semibold">Save</button>
              <button type="button" onClick={() => setShow(false)} className="h-11 px-4 rounded-full bg-secondary text-sm">Cancel</button>
            </div>
          </form>
        )}

        <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">Meals</h2>
        {items === null ? (
          <p className="mt-3 text-xs text-foreground/40">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-3 surface p-8 text-center">
            <Apple className="size-8 text-foreground/30 mx-auto" />
            <p className="mt-3 text-sm text-foreground/60">No meals logged yet</p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {items.map((m) => (
              <div key={m.id} className="surface p-4 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-background border flex items-center justify-center text-xs font-bold capitalize">{m.meal[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-foreground/50 capitalize">{m.meal}{m.mealTime ? ` · ${m.mealTime}` : ""} · {m.kcal} kcal · P{m.protein}/C{m.carbs}/F{m.fat}</p>
                  {m.notes && <p className="text-[11px] text-foreground/40 mt-0.5 truncate">{m.notes}</p>}
                </div>
                <button onClick={() => openEdit(m)} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Pencil className="size-4" /></button>
                <button onClick={() => remove(m.id)} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
            <form onSubmit={saveEdit} className="relative w-full max-w-md mx-4 mb-6 rounded-3xl bg-background border shadow-2xl p-5 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-semibold">Edit meal</h3>
                <button type="button" onClick={() => setEditing(null)} className="size-8 rounded-full bg-secondary flex items-center justify-center"><X className="size-4" /></button>
              </div>
              <select value={editForm.meal} onChange={(e) => setEditForm({ ...editForm, meal: e.target.value as Meal })} className="w-full h-11 rounded-xl bg-secondary px-3 text-sm">
                {MEALS.map((m) => <option key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}</option>)}
              </select>
              <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full h-11 rounded-xl bg-secondary px-3 text-sm" />
              <div className="grid grid-cols-4 gap-2">
                <input type="number" placeholder="kcal" value={editForm.kcal} onChange={(e) => setEditForm({ ...editForm, kcal: e.target.value })} className="h-11 rounded-xl bg-secondary px-3 text-sm" />
                <input type="number" placeholder="P g" value={editForm.protein} onChange={(e) => setEditForm({ ...editForm, protein: e.target.value })} className="h-11 rounded-xl bg-secondary px-3 text-sm" />
                <input type="number" placeholder="C g" value={editForm.carbs} onChange={(e) => setEditForm({ ...editForm, carbs: e.target.value })} className="h-11 rounded-xl bg-secondary px-3 text-sm" />
                <input type="number" placeholder="F g" value={editForm.fat} onChange={(e) => setEditForm({ ...editForm, fat: e.target.value })} className="h-11 rounded-xl bg-secondary px-3 text-sm" />
              </div>
              <input type="time" value={editForm.mealTime} onChange={(e) => setEditForm({ ...editForm, mealTime: e.target.value })} className="w-full h-11 rounded-xl bg-secondary px-3 text-sm" />
              <textarea placeholder="Notes" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={2} className="w-full rounded-xl bg-secondary px-3 py-2 text-sm resize-none" />
              <button type="submit" className="w-full h-11 rounded-full bg-accent text-white text-sm font-semibold mt-2">Save changes</button>
            </form>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
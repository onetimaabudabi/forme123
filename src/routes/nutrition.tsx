import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Plus, Apple, Trash2, Droplets } from "lucide-react";
import { useState } from "react";
import { useFocusRefetch } from "@/hooks/useFocusRefetch";
import { useAuth } from "@/lib/auth";
import { addNutrition, addWater, deleteNutrition, listTodayNutrition, listTodayWater, type NutritionEntry } from "@/lib/nutrition";

export const Route = createFileRoute("/nutrition")({
  head: () => ({ meta: [{ title: "Nutrition — Forme" }] }),
  component: Nutrition,
});

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-semibold">{label}</span>
        <span className="text-foreground/50">{value} g</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
    </div>
  );
}

const MEALS = ["breakfast", "lunch", "dinner", "snack"] as const;

function Nutrition() {
  const { profile } = useAuth();
  const [items, setItems] = useState<NutritionEntry[] | null>(null);
  const [waterMl, setWaterMl] = useState(0);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ meal: "breakfast" as typeof MEALS[number], name: "", kcal: "", protein: "", carbs: "", fat: "" });

  const refresh = async () => {
    if (!profile) return;
    const [n, w] = await Promise.all([listTodayNutrition(profile.uid), listTodayWater(profile.uid)]);
    setItems(n);
    setWaterMl(w.reduce((a, b) => a + b.ml, 0));
  };
  useFocusRefetch(() => refresh(), [profile?.uid]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    await addNutrition(profile.uid, {
      meal: form.meal,
      name: form.name.trim(),
      kcal: Number(form.kcal) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    });
    setForm({ meal: "breakfast", name: "", kcal: "", protein: "", carbs: "", fat: "" });
    setShow(false);
    await refresh();
  };

  const remove = async (id: string) => { await deleteNutrition(id); await refresh(); };
  const addGlass = async () => { if (!profile) return; await addWater(profile.uid, 250); await refresh(); };

  if (!profile) return null;
  const totals = (items ?? []).reduce(
    (a, b) => ({ kcal: a.kcal + b.kcal, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

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
            <span className="text-base text-foreground/40">kcal</span>
          </div>
          <div className="mt-5 space-y-3">
            <Macro label="Protein" value={totals.protein} color="#007AFF" />
            <Macro label="Carbs" value={totals.carbs} color="#000" />
            <Macro label="Fat" value={totals.fat} color="#999" />
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
                <div className="flex-1">
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-foreground/50 capitalize">{m.meal} · {m.kcal} kcal · P{m.protein}/C{m.carbs}/F{m.fat}</p>
                </div>
                <button onClick={() => remove(m.id)} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
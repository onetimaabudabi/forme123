import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Plus, Coffee, UtensilsCrossed, Pizza } from "lucide-react";

export const Route = createFileRoute("/nutrition")({
  head: () => ({ meta: [{ title: "Nutrition — Forme" }] }),
  component: Nutrition,
});

function Macro({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = (value / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-semibold">{label}</span>
        <span className="text-foreground/50">{value} / {total}g</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

const meals = [
  { icon: Coffee, name: "Breakfast", items: "Oats, blueberries, almond butter", kcal: 420 },
  { icon: UtensilsCrossed, name: "Lunch", items: "Grilled chicken bowl", kcal: 680 },
  { icon: Pizza, name: "Dinner", items: "Not logged yet", kcal: 0 },
];

function Nutrition() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Nutrition</h1>
          <button className="size-10 -mr-2 flex items-center justify-center"><Plus className="size-5" /></button>
        </div>

        <div className="mt-4 surface p-5">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Today</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-4xl font-bold tracking-tight">1,840</span>
            <span className="text-base text-foreground/40">/ 2,400 kcal</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-background overflow-hidden">
            <div className="h-full bg-foreground rounded-full" style={{ width: "76%" }} />
          </div>
          <div className="mt-5 space-y-3">
            <Macro label="Protein" value={142} total={180} color="#007AFF" />
            <Macro label="Carbs" value={210} total={280} color="#000" />
            <Macro label="Fat" value={58} total={75} color="#999" />
          </div>
        </div>

        <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">Meals</h2>
        <div className="mt-3 space-y-2">
          {meals.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.name} className="surface p-4 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-background border flex items-center justify-center">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-foreground/50">{m.items}</p>
                </div>
                <span className="text-sm font-semibold">{m.kcal > 0 ? `${m.kcal} kcal` : <Plus className="size-4 text-accent" />}</span>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}
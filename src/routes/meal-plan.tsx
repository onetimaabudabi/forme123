import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Sparkles, RefreshCw, Coffee, UtensilsCrossed, Pizza, Apple } from "lucide-react";

export const Route = createFileRoute("/meal-plan")({
  head: () => ({ meta: [{ title: "AI meal plan — Forme" }] }),
  component: MealPlan,
});

const meals = [
  { icon: Coffee, name: "Breakfast", title: "Greek yoghurt bowl", desc: "Berries, granola, honey, chia seeds", macros: "P 32g · C 48g · F 12g", kcal: 440 },
  { icon: UtensilsCrossed, name: "Lunch", title: "Grilled chicken & quinoa", desc: "Roasted veg, lemon tahini dressing", macros: "P 48g · C 62g · F 18g", kcal: 620 },
  { icon: Apple, name: "Snack", title: "Protein smoothie", desc: "Whey, banana, peanut butter, oat milk", macros: "P 28g · C 36g · F 9g", kcal: 320 },
  { icon: Pizza, name: "Dinner", title: "Salmon, sweet potato, greens", desc: "Pan-seared salmon, miso glaze", macros: "P 42g · C 54g · F 22g", kcal: 620 },
];

function MealPlan() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/nutrition" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Meal plan</h1>
          <button className="size-10 -mr-2 flex items-center justify-center"><RefreshCw className="size-[18px]" /></button>
        </div>

        <div className="mt-4 surface p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent">
            <Sparkles className="size-3.5" /> Generated for you
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">High-protein day</h2>
          <p className="text-sm text-foreground/55 mt-1">Tailored to your workout, weight goal, and pantry.</p>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[{l:"kcal",v:"2,000"},{l:"P",v:"150g"},{l:"C",v:"200g"},{l:"F",v:"61g"}].map((s) => (
              <div key={s.l} className="rounded-2xl bg-background py-2.5">
                <p className="text-sm font-bold tracking-tight">{s.v}</p>
                <p className="text-[10px] text-foreground/50 font-medium uppercase">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {meals.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="surface p-4">
                <div className="flex items-start gap-3">
                  <div className="size-11 rounded-2xl bg-background border flex items-center justify-center">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-foreground/40">{m.name}</p>
                      <p className="text-xs font-semibold text-foreground/60">{m.kcal} kcal</p>
                    </div>
                    <p className="font-semibold text-[15px] mt-0.5">{m.title}</p>
                    <p className="text-xs text-foreground/55 mt-0.5">{m.desc}</p>
                    <p className="text-[11px] text-foreground/50 mt-2 font-medium">{m.macros}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="mt-5 w-full h-14 rounded-full bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <Sparkles className="size-4" /> Generate new plan
        </button>
      </div>
    </PhoneFrame>
  );
}
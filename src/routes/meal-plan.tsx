import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Sparkles, RefreshCw, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { generateMealPlan, getLatestMealPlan, type MealPlan as MealPlanT } from "@/lib/mealPlans";
import { unlockAchievement } from "@/lib/achievements";

export const Route = createFileRoute("/meal-plan")({
  head: () => ({ meta: [{ title: "AI meal plan — Forme" }] }),
  component: MealPlan,
});

function MealPlan() {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<MealPlanT | null>(null);
  const [loading, setLoading] = useState(true);
  const [gen, setGen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    getLatestMealPlan(profile.uid).then((p) => { setPlan(p); setLoading(false); }).catch(() => setLoading(false));
  }, [profile]);

  const generate = async () => {
    if (!profile) return;
    setGen(true); setError(null);
    try {
      const p = await generateMealPlan(profile);
      setPlan(p);
      unlockAchievement(profile.uid, "first_meal_plan").catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate meal plan");
    } finally { setGen(false); }
  };

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Meal plan</h1>
          <button onClick={generate} disabled={gen} className="size-10 -mr-2 flex items-center justify-center disabled:opacity-40">
            <RefreshCw className={`size-[18px] ${gen ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-foreground/40">Loading…</p>
        ) : !plan ? (
          <div className="mt-8 surface p-8 text-center">
            <div className="size-14 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <UtensilsCrossed className="size-7 text-foreground/60" />
            </div>
            <p className="text-sm text-foreground/60">No meal plan yet</p>
            <p className="text-xs text-foreground/40 mt-1">Tailored to your goals and stats.</p>
            <button onClick={generate} disabled={gen} className="mt-5 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-black text-white font-semibold text-sm disabled:opacity-50">
              <Sparkles className="size-4" /> {gen ? "Generating…" : "Generate meal plan"}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 surface p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                <Sparkles className="size-3.5" /> Generated for you
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{plan.title}</h2>
              <p className="text-sm text-foreground/55 mt-1">{plan.createdAt.toLocaleDateString()}</p>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                {[{l:"kcal",v:plan.kcal.toLocaleString()},{l:"P",v:`${plan.protein}g`},{l:"C",v:`${plan.carbs}g`},{l:"F",v:`${plan.fat}g`}].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-background py-2.5">
                    <p className="text-sm font-bold tracking-tight">{s.v}</p>
                    <p className="text-[10px] text-foreground/50 font-medium uppercase">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {plan.meals.map((m, i) => (
                <div key={i} className="surface p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-foreground/40">{m.name}</p>
                    <p className="text-xs font-semibold text-foreground/60">{m.kcal} kcal</p>
                  </div>
                  <p className="font-semibold text-[15px] mt-0.5">{m.title}</p>
                  <p className="text-xs text-foreground/55 mt-0.5">{m.description}</p>
                  <p className="text-[11px] text-foreground/50 mt-2 font-medium">P {m.protein}g · C {m.carbs}g · F {m.fat}g</p>
                </div>
              ))}
            </div>

            <button onClick={generate} disabled={gen} className="mt-5 w-full h-14 rounded-full bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-50">
              <Sparkles className="size-4" /> {gen ? "Generating…" : "Generate new plan"}
            </button>
          </>
        )}
        {error && <p className="mt-3 text-xs text-destructive text-center">{error}</p>}
      </div>
    </PhoneFrame>
  );
}
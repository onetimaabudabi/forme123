import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/subscription")({
  head: () => ({ meta: [{ title: "Forme Pro" }] }),
  component: Subscription,
});

const features = [
  "Unlimited AI Coach conversations",
  "Personalised workout & meal plans",
  "Advanced progress analytics",
  "Sleep & recovery insights",
  "Apple Health & Watch integration",
  "Priority support",
];

function Subscription() {
  const [plan, setPlan] = useState<"yearly" | "monthly">("yearly");

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/settings" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Forme Pro</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-black text-white text-xs font-semibold">✦ Forme Pro</div>
          <h2 className="mt-4 text-[34px] leading-[1.05] font-bold tracking-tight">Train like a pro.<br />Every day.</h2>
          <p className="mt-3 text-[15px] text-foreground/55">Unlock the full Forme experience with deeper insights, personalised plans, and your always-on AI coach.</p>
        </div>

        <div className="mt-6 surface p-5 space-y-3">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-3">
              <div className="size-5 rounded-full bg-accent/10 flex items-center justify-center mt-0.5 shrink-0">
                <Check className="size-3 text-accent" strokeWidth={3} />
              </div>
              <p className="text-sm font-medium">{f}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2.5">
          <button onClick={() => setPlan("yearly")} className={`w-full rounded-3xl p-4 text-left transition border-2 ${plan === "yearly" ? "border-black bg-secondary" : "border-transparent bg-secondary"}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">Yearly</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent text-white">Save 40%</span>
                </div>
                <p className="text-xs text-foreground/50 mt-0.5">$59.99 / year · $4.99 per month</p>
              </div>
              <div className={`size-5 rounded-full border-2 ${plan === "yearly" ? "bg-black border-black" : "border-foreground/20"}`}>
                {plan === "yearly" && <Check className="size-3 text-white m-auto mt-0.5" strokeWidth={3} />}
              </div>
            </div>
          </button>
          <button onClick={() => setPlan("monthly")} className={`w-full rounded-3xl p-4 text-left transition border-2 ${plan === "monthly" ? "border-black bg-secondary" : "border-transparent bg-secondary"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Monthly</p>
                <p className="text-xs text-foreground/50 mt-0.5">$9.99 / month</p>
              </div>
              <div className={`size-5 rounded-full border-2 ${plan === "monthly" ? "bg-black border-black" : "border-foreground/20"}`}>
                {plan === "monthly" && <Check className="size-3 text-white m-auto mt-0.5" strokeWidth={3} />}
              </div>
            </div>
          </button>
        </div>

        <button className="mt-5 w-full h-14 rounded-full bg-black text-white font-semibold text-base active:scale-[0.98] transition">
          Start 7-day free trial
        </button>
        <p className="mt-3 text-center text-xs text-foreground/40">Cancel anytime · Restore purchase</p>
      </div>
    </PhoneFrame>
  );
}
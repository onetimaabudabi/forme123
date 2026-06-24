import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Plus, TrendingDown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/measurements")({
  head: () => ({ meta: [{ title: "Body measurements — Forme" }] }),
  component: Measurements,
});

const stats = [
  { l: "Weight", v: "74.2 kg", d: "-1.4", up: false },
  { l: "Body fat", v: "16.4 %", d: "-0.8", up: false },
  { l: "Muscle mass", v: "61.2 kg", d: "+0.6", up: true },
  { l: "Waist", v: "82 cm", d: "-1.2", up: false },
  { l: "Chest", v: "104 cm", d: "+0.5", up: true },
  { l: "Arm", v: "37 cm", d: "+0.3", up: true },
];

function Measurements() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/progress" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Measurements</h1>
          <button className="size-10 -mr-2 flex items-center justify-center"><Plus className="size-5" /></button>
        </div>

        <div className="mt-4 surface p-6 flex items-center justify-center">
          <svg viewBox="0 0 120 220" className="h-56 text-foreground/80" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="60" cy="22" r="16" />
            <path d="M40 50 L80 50 L86 110 L74 175 L66 215 L54 215 L46 175 L34 110 Z" />
            <path d="M40 55 L18 105 L24 140" strokeLinecap="round" />
            <path d="M80 55 L102 105 L96 140" strokeLinecap="round" />
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {stats.map((s) => {
            const Trend = s.up ? TrendingUp : TrendingDown;
            return (
              <div key={s.l} className="surface p-4">
                <p className="text-xs text-foreground/50 font-medium">{s.l}</p>
                <p className="text-2xl font-bold tracking-tight mt-2">{s.v}</p>
                <p className="text-xs mt-1 font-semibold text-emerald-600 flex items-center gap-1">
                  <Trend className="size-3" /> {s.d} this month
                </p>
              </div>
            );
          })}
        </div>

        <button className="mt-5 w-full py-4 rounded-full bg-black text-white font-semibold text-sm active:scale-[0.98] transition">
          Log new measurement
        </button>
      </div>
    </PhoneFrame>
  );
}
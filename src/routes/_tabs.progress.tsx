import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/_tabs/progress")({
  head: () => ({ meta: [{ title: "Progress — Forme" }] }),
  component: Progress,
});

const weight = [75.6, 75.4, 75.1, 74.9, 74.7, 74.5, 74.2];
const labels = ["M", "T", "W", "T", "F", "S", "S"];

function Chart() {
  const min = Math.min(...weight) - 0.3;
  const max = Math.max(...weight) + 0.3;
  const norm = (v: number) => 1 - (v - min) / (max - min);
  const W = 320, H = 140;
  const step = W / (weight.length - 1);
  const pts = weight.map((v, i) => [i * step, norm(v) * H] as const);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${path} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full">
      <path d={area} fill="var(--accent)" opacity="0.08" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          {i === pts.length - 1 && <circle cx={x} cy={y} r="5" fill="var(--accent)" />}
          <text x={x} y={H + 18} textAnchor="middle" fontSize="10" fill="rgba(0,0,0,0.4)">{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}

function Progress() {
  return (
    <div className="px-6 pt-14">
      <p className="text-sm text-foreground/50 font-medium">Analytics</p>
      <h1 className="text-3xl font-bold tracking-tight mt-1">Your progress</h1>

      <div className="mt-5 surface p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Weight</p>
            <p className="text-3xl font-bold tracking-tight mt-1">74.2 <span className="text-base text-foreground/40">kg</span></p>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
            <TrendingDown className="size-4" /> -1.4 kg
          </div>
        </div>
        <div className="mt-4"><Chart /></div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { label: "Workouts", value: "18", delta: "+3", up: true },
          { label: "Avg sleep", value: "7.4h", delta: "+12m", up: true },
          { label: "Resting HR", value: "58", delta: "-2", up: true },
          { label: "VO₂ max", value: "47.8", delta: "+0.6", up: true },
        ].map((s) => (
          <div key={s.label} className="surface p-4">
            <p className="text-xs text-foreground/50 font-medium">{s.label}</p>
            <p className="text-2xl font-bold mt-2 tracking-tight">{s.value}</p>
            <p className="text-xs mt-1 font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="size-3" /> {s.delta} this month
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 surface p-5">
        <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Weekly volume</p>
        <div className="mt-4 flex items-end justify-between gap-2 h-32">
          {[60, 80, 45, 90, 70, 95, 55].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-lg bg-foreground/80" style={{ height: `${v}%` }} />
              <span className="text-[10px] text-foreground/40">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
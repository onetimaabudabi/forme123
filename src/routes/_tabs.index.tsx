import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Droplets, Dumbbell, Scale, Sparkles, Apple, ChevronRight, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_tabs/")({
  head: () => ({
    meta: [
      { title: "Forme — Your daily fitness companion" },
      { name: "description", content: "Track workouts, nutrition, and progress with an AI coach designed for everyday athletes." },
    ],
  }),
  component: Home,
});

function Ring({ value, total, size = 120, stroke = 10, color = "var(--accent)" }: { value: number; total: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / total);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--secondary)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

function StatTile({ icon: Icon, label, value, unit, accent }: { icon: typeof Flame; label: string; value: string; unit: string; accent?: string }) {
  return (
    <div className="surface p-4">
      <div className="flex items-center gap-2 text-foreground/50">
        <Icon className="size-4" style={{ color: accent }} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span className="text-xs text-foreground/40 font-medium">{unit}</span>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="px-6 pt-14">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground/50 font-medium">Wednesday, Jun 24</p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Good morning, Alex</h1>
        </div>
        <div className="size-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">A</div>
      </div>

      {/* Daily progress card */}
      <div className="mt-6 surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Daily progress</p>
            <p className="text-4xl font-bold tracking-tight mt-1">78<span className="text-xl text-foreground/40">%</span></p>
            <p className="text-sm text-foreground/60 mt-1">3 of 4 goals on track</p>
          </div>
          <div className="relative">
            <Ring value={78} total={100} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame className="size-7 text-accent" />
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold">🔥 12 day streak</span>
          <span className="px-2.5 py-1 rounded-full bg-background border text-foreground/60 font-medium">+18% vs last week</span>
        </div>
      </div>

      {/* Stat grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile icon={Flame} label="Calories" value="1,840" unit="/ 2,400" accent="#FF6B35" />
        <StatTile icon={Droplets} label="Water" value="1.8" unit="L / 2.5L" accent="#007AFF" />
        <StatTile icon={Dumbbell} label="Workout" value="45" unit="min done" accent="#000" />
        <StatTile icon={Scale} label="Weight" value="74.2" unit="kg" accent="#000" />
      </div>

      {/* AI Coach pill */}
      <Link to="/coach" className="mt-4 block surface p-4 flex items-center gap-3 hover:bg-secondary/70 transition">
        <div className="size-10 rounded-full bg-black flex items-center justify-center">
          <Sparkles className="size-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Ask your AI Coach</p>
          <p className="text-xs text-foreground/50">"How should I recover today?"</p>
        </div>
        <ChevronRight className="size-4 text-foreground/30" />
      </Link>

      {/* Quick actions */}
      <h2 className="mt-8 text-xs uppercase tracking-wider font-semibold text-foreground/40">Today</h2>
      <div className="mt-3 space-y-2">
        <Link to="/workout" className="surface p-4 flex items-center gap-3 block">
          <div className="size-10 rounded-xl bg-background border flex items-center justify-center">
            <Dumbbell className="size-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Upper Body Strength</p>
            <p className="text-xs text-foreground/50">8 exercises · 45 min</p>
          </div>
          <span className="text-xs font-semibold text-accent">Start</span>
        </Link>
        <Link to="/nutrition" className="surface p-4 flex items-center gap-3 block">
          <div className="size-10 rounded-xl bg-background border flex items-center justify-center">
            <Apple className="size-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Log lunch</p>
            <p className="text-xs text-foreground/50">Recommended: 650 kcal</p>
          </div>
          <ChevronRight className="size-4 text-foreground/30" />
        </Link>
        <Link to="/progress" className="surface p-4 flex items-center gap-3 block">
          <div className="size-10 rounded-xl bg-background border flex items-center justify-center">
            <TrendingUp className="size-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Weekly insights</p>
            <p className="text-xs text-foreground/50">You're trending up</p>
          </div>
          <ChevronRight className="size-4 text-foreground/30" />
        </Link>
      </div>
    </div>
  );
}
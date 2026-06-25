import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Scale, Sparkles, Apple, ChevronRight, Target, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getOrCreateTodayMission, setMissionCompleted, type Mission } from "@/lib/missions";

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

const GOAL_LABEL: Record<string, string> = {
  weight_loss: "Weight Loss",
  muscle_gain: "Muscle Gain",
  maintain: "Maintain Fitness",
};

function Home() {
  const { profile } = useAuth();
  const [mission, setMission] = useState<Mission | null>(null);

  useEffect(() => {
    if (!profile) return;
    getOrCreateTodayMission(profile.uid, profile.goal).then(setMission).catch(() => {});
  }, [profile]);

  const toggleMission = async () => {
    if (!mission) return;
    const next = !mission.completed;
    setMission({ ...mission, completed: next });
    try { await setMissionCompleted(mission.id, next); } catch { /* ignore */ }
  };

  if (!profile) return null;
  const firstName = profile.name?.split(" ")[0] ?? "there";
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="px-6 pt-14">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground/50 font-medium">{today}</p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Good morning, {firstName}</h1>
        </div>
        <Link to="/profile" className="size-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">
          {firstName.charAt(0).toUpperCase()}
        </Link>
      </div>

      {/* Daily progress card */}
      <div className="mt-6 surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Today's mission</p>
            <p className="text-xl font-bold tracking-tight mt-2 leading-snug max-w-[200px]">
              {mission?.title ?? "Loading mission…"}
            </p>
          </div>
          <button onClick={toggleMission} className="shrink-0">
            {mission?.completed ? (
              <CheckCircle2 className="size-14 text-accent" />
            ) : (
              <Circle className="size-14 text-foreground/20" />
            )}
          </button>
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold">🔥 {profile.streak ?? 0} day streak</span>
          <span className="px-2.5 py-1 rounded-full bg-background border text-foreground/60 font-medium">
            Goal: {GOAL_LABEL[profile.goal] ?? "Maintain"}
          </span>
        </div>
      </div>

      {/* Stat grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile icon={Scale} label="Weight" value={String(profile.weight ?? "—")} unit="kg" accent="#000" />
        <StatTile icon={Flame} label="Streak" value={String(profile.streak ?? 0)} unit="days" accent="#FF6B35" />
        <StatTile icon={Target} label="Goal" value={GOAL_LABEL[profile.goal] ?? "—"} unit="" accent="#007AFF" />
        <StatTile icon={Apple} label="Height" value={String(profile.height ?? "—")} unit="cm" accent="#000" />
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

      <h2 className="mt-8 text-xs uppercase tracking-wider font-semibold text-foreground/40">Your profile</h2>
      <div className="mt-3 surface p-5 space-y-2.5 text-sm">
        <Row k="Name" v={profile.name} />
        <Row k="Email" v={profile.email} />
        <Row k="Age" v={`${profile.age} yrs`} />
        <Row k="Gender" v={profile.gender} />
        <Row k="Height" v={`${profile.height} cm`} />
        <Row k="Weight" v={`${profile.weight} kg`} />
        <Row k="Goal" v={GOAL_LABEL[profile.goal] ?? profile.goal} />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground/50">{k}</span>
      <span className="font-medium capitalize">{v}</span>
    </div>
  );
}
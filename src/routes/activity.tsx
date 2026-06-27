import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, ChevronRight, Dumbbell, Target, Apple, Droplets, Moon, Scale, Sparkles, Flame } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getActivityRange, monthStats, type DayActivity, type ActivityKind } from "@/lib/activity";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "Activity calendar — Forme" }] }),
  component: ActivityCalendar,
});

const KIND_META: Record<ActivityKind, { icon: typeof Dumbbell; color: string; label: string }> = {
  workout: { icon: Dumbbell, color: "#FF6B35", label: "Workout" },
  mission: { icon: Target, color: "#34C759", label: "Mission" },
  nutrition: { icon: Apple, color: "#FF3B30", label: "Nutrition" },
  water: { icon: Droplets, color: "#007AFF", label: "Water" },
  sleep: { icon: Moon, color: "#5856D6", label: "Sleep" },
  weight: { icon: Scale, color: "#000000", label: "Weight" },
  coach: { icon: Sparkles, color: "#AF52DE", label: "AI Coach" },
};

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ActivityCalendar() {
  const { profile } = useAuth();
  const [map, setMap] = useState<Map<string, DayActivity> | null>(null);
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selected, setSelected] = useState<string>(() => ymd(new Date()));

  useEffect(() => {
    if (!profile) return;
    getActivityRange(profile.uid, 180).then(setMap).catch(() => setMap(new Map()));
  }, [profile]);

  const stats = useMemo(() => map ? monthStats(map, cursor.getFullYear(), cursor.getMonth()) : null, [map, cursor]);

  if (!profile) return null;

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const startWeekday = (first.getDay() + 6) % 7; // Monday-first
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  const today = ymd(new Date());
  const selectedDay = map?.get(selected) ?? null;

  const move = (delta: number) => {
    const d = new Date(cursor); d.setMonth(d.getMonth() + delta); setCursor(d);
  };

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Activity</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => move(-1)} className="size-9 rounded-full bg-secondary flex items-center justify-center"><ChevronLeft className="size-4" /></button>
          <p className="text-lg font-bold tracking-tight">{monthLabel}</p>
          <button onClick={() => move(1)} className="size-9 rounded-full bg-secondary flex items-center justify-center"><ChevronRight className="size-4" /></button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1.5 text-center">
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} className="text-[10px] text-foreground/40 font-semibold uppercase">{d}</div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="aspect-square" />;
            const key = ymd(d);
            const day = map?.get(key);
            const count = day?.kinds.size ?? 0;
            const isToday = key === today;
            const isSelected = key === selected;
            const intensity = count === 0 ? 0 : Math.min(1, count / 4);
            const bg = count === 0 ? undefined : `color-mix(in oklch, var(--accent) ${20 + intensity * 70}%, transparent)`;
            return (
              <button
                key={i}
                onClick={() => setSelected(key)}
                className={`aspect-square rounded-xl flex items-center justify-center text-[11px] font-semibold transition-all duration-200 active:scale-90 ${
                  isSelected ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""
                } ${isToday && !isSelected ? "ring-1 ring-foreground/30" : ""} ${count === 0 ? "bg-secondary text-foreground/40" : "text-white"}`}
                style={bg ? { backgroundColor: bg } : undefined}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2 justify-end text-[10px] text-foreground/50">
          <span>Less</span>
          <div className="size-3 rounded bg-secondary" />
          <div className="size-3 rounded" style={{ background: "color-mix(in oklch, var(--accent) 35%, transparent)" }} />
          <div className="size-3 rounded" style={{ background: "color-mix(in oklch, var(--accent) 60%, transparent)" }} />
          <div className="size-3 rounded" style={{ background: "color-mix(in oklch, var(--accent) 90%, transparent)" }} />
          <span>More</span>
        </div>

        {/* Month stats */}
        {stats && (
          <>
            <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">This month</h2>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Stat l="Active days" v={String(stats.activeDays)} />
              <Stat l="Workouts" v={String(stats.workouts)} />
              <Stat l="Missions" v={String(stats.missions)} />
              <Stat l="Avg sleep" v={stats.avgSleep !== null ? `${stats.avgSleep.toFixed(1)}h` : "—"} />
              <Stat l="Avg kcal" v={stats.avgKcal !== null ? String(stats.avgKcal) : "—"} />
              <Stat l="Avg protein" v={stats.avgProtein !== null ? `${stats.avgProtein}g` : "—"} />
              <Stat l="Weight Δ" v={stats.weightChange !== null ? `${stats.weightChange > 0 ? "+" : ""}${stats.weightChange}kg` : "—"} />
              <Stat l="Coach msgs" v={String(stats.coachUsage)} />
              <Stat l="Streak" v={String(profile.streak ?? 0)} />
            </div>
          </>
        )}

        {/* Day detail */}
        <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">
          {new Date(selected).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </h2>
        {!selectedDay || selectedDay.kinds.size === 0 ? (
          <div className="mt-3 surface p-8 text-center">
            <Flame className="size-7 text-foreground/30 mx-auto" />
            <p className="mt-3 text-sm text-foreground/60">No activity logged</p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {selectedDay.kinds.has("workout") && (
              <DayRow icon={KIND_META.workout.icon} color={KIND_META.workout.color} label="Workout" detail={`${selectedDay.workouts} session${selectedDay.workouts > 1 ? "s" : ""} · ${selectedDay.workoutMinutes} min · ${selectedDay.workoutKcal} kcal`} />
            )}
            {selectedDay.kinds.has("mission") && (
              <DayRow icon={KIND_META.mission.icon} color={KIND_META.mission.color} label="Daily mission" detail="Completed" />
            )}
            {selectedDay.kinds.has("nutrition") && (
              <DayRow icon={KIND_META.nutrition.icon} color={KIND_META.nutrition.color} label="Nutrition" detail={`${selectedDay.meals} meal${selectedDay.meals > 1 ? "s" : ""} · ${selectedDay.kcal} kcal · P${Math.round(selectedDay.protein)}/C${Math.round(selectedDay.carbs)}/F${Math.round(selectedDay.fat)}`} />
            )}
            {selectedDay.kinds.has("water") && (
              <DayRow icon={KIND_META.water.icon} color={KIND_META.water.color} label="Water" detail={`${(selectedDay.waterMl / 1000).toFixed(2)} L`} />
            )}
            {selectedDay.kinds.has("sleep") && selectedDay.sleepHours !== null && (
              <DayRow icon={KIND_META.sleep.icon} color={KIND_META.sleep.color} label="Sleep" detail={`${selectedDay.sleepHours.toFixed(1)} h`} />
            )}
            {selectedDay.kinds.has("weight") && selectedDay.weight !== null && (
              <DayRow icon={KIND_META.weight.icon} color={KIND_META.weight.color} label="Weight" detail={`${selectedDay.weight} kg`} />
            )}
            {selectedDay.kinds.has("coach") && (
              <DayRow icon={KIND_META.coach.icon} color={KIND_META.coach.color} label="AI Coach" detail={`${selectedDay.coachMessages} message${selectedDay.coachMessages > 1 ? "s" : ""}`} />
            )}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="surface py-3 text-center">
      <p className="text-base font-bold tracking-tight">{v}</p>
      <p className="text-[10px] text-foreground/50 mt-0.5 font-medium">{l}</p>
    </div>
  );
}

function DayRow({ icon: Icon, color, label, detail }: { icon: typeof Dumbbell; color: string; label: string; detail: string }) {
  return (
    <div className="surface p-4 flex items-center gap-3">
      <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}>
        <Icon className="size-5" style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-foreground/55">{detail}</p>
      </div>
    </div>
  );
}
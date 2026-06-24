import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, ChevronRight, Dumbbell, Heart, Footprints } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Workout history — Forme" }] }),
  component: History,
});

const groups = [
  { label: "This week", items: [
    { icon: Dumbbell, name: "Upper Body Strength", date: "Today", dur: "45 min", kcal: 412 },
    { icon: Heart, name: "Zone 2 Cardio", date: "Yesterday", dur: "30 min", kcal: 248 },
    { icon: Dumbbell, name: "Lower Body Power", date: "Mon", dur: "52 min", kcal: 480 },
  ]},
  { label: "Last week", items: [
    { icon: Footprints, name: "Outdoor Run", date: "Sun", dur: "38 min", kcal: 360 },
    { icon: Dumbbell, name: "Push Day", date: "Fri", dur: "48 min", kcal: 430 },
    { icon: Heart, name: "HIIT Intervals", date: "Wed", dur: "22 min", kcal: 290 },
    { icon: Dumbbell, name: "Pull Day", date: "Tue", dur: "50 min", kcal: 445 },
  ]},
];

function History() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/workout" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">History</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[{l:"Workouts",v:"84"},{l:"Hours",v:"62"},{l:"Calories",v:"34k"}].map((s) => (
            <div key={s.l} className="surface py-4 text-center">
              <p className="text-xl font-bold tracking-tight">{s.v}</p>
              <p className="text-[11px] text-foreground/50 mt-0.5 font-medium">{s.l}</p>
            </div>
          ))}
        </div>

        {groups.map((g) => (
          <div key={g.label} className="mt-7">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-foreground/40">{g.label}</h2>
            <div className="mt-3 space-y-2">
              {g.items.map((w, i) => {
                const Icon = w.icon;
                return (
                  <div key={i} className="surface p-4 flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-background border flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{w.name}</p>
                      <p className="text-xs text-foreground/50">{w.date} · {w.dur} · {w.kcal} kcal</p>
                    </div>
                    <ChevronRight className="size-4 text-foreground/30" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}
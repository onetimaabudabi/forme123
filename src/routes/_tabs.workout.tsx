import { createFileRoute } from "@tanstack/react-router";
import { Play, Clock, Flame, ChevronRight, Check } from "lucide-react";

export const Route = createFileRoute("/_tabs/workout")({
  head: () => ({ meta: [{ title: "Workout — Forme" }] }),
  component: Workout,
});

const exercises = [
  { name: "Barbell Bench Press", sets: "4 × 8", done: true },
  { name: "Incline Dumbbell Press", sets: "3 × 10", done: true },
  { name: "Cable Fly", sets: "3 × 12", done: false },
  { name: "Overhead Press", sets: "4 × 8", done: false },
  { name: "Lateral Raise", sets: "3 × 15", done: false },
  { name: "Tricep Pushdown", sets: "3 × 12", done: false },
  { name: "Plank Hold", sets: "3 × 60s", done: false },
];

function Workout() {
  return (
    <div className="px-6 pt-14">
      <p className="text-sm text-foreground/50 font-medium">Today's plan</p>
      <h1 className="text-3xl font-bold tracking-tight mt-1">Upper Body Strength</h1>

      <div className="mt-5 surface p-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-5">
            <div>
              <div className="flex items-center gap-1.5 text-foreground/50 text-xs"><Clock className="size-3.5" />Duration</div>
              <p className="text-lg font-bold mt-0.5">45 min</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-foreground/50 text-xs"><Flame className="size-3.5" />Burn</div>
              <p className="text-lg font-bold mt-0.5">~420 kcal</p>
            </div>
          </div>
          <button className="size-12 rounded-full bg-black flex items-center justify-center text-white shadow-lg active:scale-95 transition">
            <Play className="size-5 ml-0.5" fill="white" />
          </button>
        </div>
        <div className="mt-4 h-1.5 bg-background rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: "28%" }} />
        </div>
        <p className="mt-2 text-xs text-foreground/50">2 of 7 exercises completed</p>
      </div>

      <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">Exercises</h2>
      <div className="mt-3 space-y-2">
        {exercises.map((ex, i) => (
          <div key={ex.name} className="surface p-4 flex items-center gap-3">
            <div className={`size-9 rounded-full flex items-center justify-center text-xs font-semibold ${ex.done ? "bg-accent text-white" : "bg-background border"}`}>
              {ex.done ? <Check className="size-4" /> : i + 1}
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${ex.done ? "line-through text-foreground/40" : ""}`}>{ex.name}</p>
              <p className="text-xs text-foreground/50">{ex.sets}</p>
            </div>
            <ChevronRight className="size-4 text-foreground/30" />
          </div>
        ))}
      </div>

      <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">This week</h2>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="surface aspect-square flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] text-foreground/40 font-medium">{d}</span>
            <div className={`size-2 rounded-full ${i < 3 ? "bg-accent" : i === 3 ? "bg-black" : "bg-foreground/10"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
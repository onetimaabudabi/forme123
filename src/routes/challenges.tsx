import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Flame, Footprints, Droplets, Dumbbell, Moon, Check } from "lucide-react";

export const Route = createFileRoute("/challenges")({
  head: () => ({ meta: [{ title: "Daily challenges — Forme" }] }),
  component: Challenges,
});

const items = [
  { icon: Footprints, name: "Walk 8,000 steps", reward: "+20 XP", progress: 0.62, done: false },
  { icon: Droplets, name: "Drink 2.5L of water", reward: "+15 XP", progress: 0.72, done: false },
  { icon: Dumbbell, name: "Complete today's workout", reward: "+40 XP", progress: 0.28, done: false },
  { icon: Flame, name: "Hit your calorie target", reward: "+25 XP", progress: 1, done: true },
  { icon: Moon, name: "Sleep 7+ hours", reward: "+20 XP", progress: 1, done: true },
];

function Challenges() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Daily challenges</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4 surface p-6">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Today</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">2 / 5</p>
          <p className="text-sm text-foreground/60 mt-1">Complete all to earn a streak bonus</p>
          <div className="mt-4 h-2 rounded-full bg-background overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: "40%" }} />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {items.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="surface p-4 flex items-center gap-3">
                <div className={`size-11 rounded-2xl flex items-center justify-center ${c.done ? "bg-accent text-white" : "bg-background border"}`}>
                  {c.done ? <Check className="size-5" /> : <Icon className="size-5" />}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${c.done ? "line-through text-foreground/40" : ""}`}>{c.name}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">{c.reward}</p>
                  {!c.done && (
                    <div className="mt-2 h-1 rounded-full bg-background overflow-hidden">
                      <div className="h-full bg-foreground rounded-full" style={{ width: `${c.progress * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}
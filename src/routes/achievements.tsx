import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Trophy, Flame, Dumbbell, Heart, Moon, Target, Zap, Award } from "lucide-react";

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements — Forme" }] }),
  component: Achievements,
});

const badges = [
  { icon: Flame, name: "10-day streak", unlocked: true },
  { icon: Dumbbell, name: "50 workouts", unlocked: true },
  { icon: Heart, name: "Cardio king", unlocked: true },
  { icon: Moon, name: "8h sleep × 7", unlocked: true },
  { icon: Target, name: "Goal crusher", unlocked: true },
  { icon: Zap, name: "Early bird", unlocked: true },
  { icon: Award, name: "Personal best", unlocked: true },
  { icon: Trophy, name: "Century club", unlocked: false },
  { icon: Flame, name: "30-day streak", unlocked: false },
];

function Achievements() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Achievements</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4 surface p-6 text-center">
          <div className="size-16 mx-auto rounded-2xl bg-black flex items-center justify-center">
            <Trophy className="size-8 text-white" />
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight">7 of 24</p>
          <p className="text-sm text-foreground/50">badges unlocked</p>
          <div className="mt-4 h-1.5 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-accent" style={{ width: "29%" }} />
          </div>
        </div>

        <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">All badges</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="surface p-4 flex flex-col items-center gap-2 text-center">
                <div className={`size-12 rounded-2xl flex items-center justify-center ${b.unlocked ? "bg-black text-white" : "bg-background border text-foreground/20"}`}>
                  <Icon className="size-5" />
                </div>
                <p className={`text-[11px] font-semibold leading-tight ${b.unlocked ? "" : "text-foreground/30"}`}>{b.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}
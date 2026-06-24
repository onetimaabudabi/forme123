import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Flame } from "lucide-react";

export const Route = createFileRoute("/streak")({
  head: () => ({ meta: [{ title: "Streak calendar — Forme" }] }),
  component: Streak,
});

// 30-day pattern: 1 = workout, 0 = rest, 2 = missed
const days: number[] = [1,1,0,1,1,1,0,1,1,1,2,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1];

function Streak() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Streak</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4 surface p-6 text-center">
          <div className="size-16 mx-auto rounded-2xl bg-black flex items-center justify-center">
            <Flame className="size-8 text-white" />
          </div>
          <p className="mt-4 text-5xl font-bold tracking-tight">12</p>
          <p className="text-sm text-foreground/50 font-medium">day streak · personal best 24</p>
        </div>

        <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">June</h2>
        <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <span key={i} className="text-[10px] text-foreground/40 font-medium">{d}</span>
          ))}
          {days.map((v, i) => (
            <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-[11px] font-semibold ${
              v === 1 ? "bg-accent text-white" : v === 2 ? "bg-secondary text-foreground/40 border border-destructive/30" : "bg-secondary text-foreground/40"
            }`}>{i + 1}</div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-foreground/60">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-accent" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-secondary" /> Rest</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-secondary border border-destructive/40" /> Missed</span>
        </div>

        <div className="mt-6 surface p-5">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Milestones</p>
          <div className="mt-3 space-y-3">
            {[{n:"7 day streak",d:"Unlocked"},{n:"14 day streak",d:"2 days away"},{n:"30 day streak",d:"18 days away"}].map((m) => (
              <div key={m.n} className="flex items-center justify-between">
                <p className="text-sm font-semibold">{m.n}</p>
                <p className="text-xs text-foreground/50">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
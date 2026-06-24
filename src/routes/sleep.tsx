import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Moon } from "lucide-react";

export const Route = createFileRoute("/sleep")({
  head: () => ({ meta: [{ title: "Sleep — Forme" }] }),
  component: Sleep,
});

const week = [7.2, 6.8, 7.4, 7.9, 6.4, 8.1, 7.6];
const labels = ["M","T","W","T","F","S","S"];

function Sleep() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Sleep</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4 surface p-6">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-black flex items-center justify-center">
              <Moon className="size-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Last night</p>
              <p className="text-3xl font-bold tracking-tight">7h 42m</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[{l:"Deep",v:"1h 38m"},{l:"REM",v:"1h 52m"},{l:"Light",v:"4h 12m"}].map((s) => (
              <div key={s.l} className="rounded-2xl bg-background p-3">
                <p className="text-[11px] text-foreground/50 font-medium">{s.l}</p>
                <p className="text-sm font-bold mt-1">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 surface p-5">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">This week</p>
          <div className="mt-4 flex items-end justify-between gap-2 h-36">
            {week.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-foreground/80" style={{ height: `${(v / 9) * 100}%` }} />
                <span className="text-[10px] text-foreground/40">{labels[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-foreground/60">Average <span className="font-semibold text-foreground">7h 24m</span> · target 7h 30m</p>
        </div>

        <div className="mt-4 surface p-5">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Schedule</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground/50">Bedtime</p>
              <p className="text-xl font-bold tracking-tight">10:45 PM</p>
            </div>
            <div className="text-foreground/30">→</div>
            <div>
              <p className="text-xs text-foreground/50">Wake</p>
              <p className="text-xl font-bold tracking-tight">6:15 AM</p>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
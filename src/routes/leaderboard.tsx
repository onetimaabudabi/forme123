import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Crown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Forme" }] }),
  component: Leaderboard,
});

const board = [
  { name: "Marco D.", xp: 4820, color: "#B5EAD7" },
  { name: "Sara K.", xp: 4310, color: "#FFB4A2" },
  { name: "Alex Morgan", xp: 3980, color: "#000000", me: true },
  { name: "Lena P.", xp: 3640, color: "#C9B5FF" },
  { name: "James W.", xp: 3120, color: "#FFD6A5" },
  { name: "Yuki T.", xp: 2870, color: "#AEC6CF" },
  { name: "Noah B.", xp: 2640, color: "#FCD5CE" },
  { name: "Priya S.", xp: 2410, color: "#CDE7B0" },
];

function Leaderboard() {
  const [tab, setTab] = useState<"friends" | "global">("friends");
  const top3 = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Leaderboard</h1>
          <div className="size-10" />
        </div>

        <div className="mt-4 surface p-1 grid grid-cols-2 gap-1 text-sm font-semibold">
          {(["friends","global"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`py-2 rounded-xl transition ${tab === t ? "bg-background shadow-sm" : "text-foreground/50"}`}>
              {t === "friends" ? "Friends" : "Global"}
            </button>
          ))}
        </div>

        {/* Podium */}
        <div className="mt-8 flex items-end justify-center gap-3">
          {[top3[1], top3[0], top3[2]].map((p, i) => {
            const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const h = rank === 1 ? 110 : rank === 2 ? 80 : 64;
            return (
              <div key={p.name} className="flex flex-col items-center gap-2 flex-1">
                <div className="relative">
                  <div className="size-14 rounded-full flex items-center justify-center font-bold text-white" style={{ background: p.color }}>{p.name[0]}</div>
                  {rank === 1 && <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 size-5 text-yellow-500" fill="currentColor" />}
                </div>
                <p className="text-xs font-semibold text-center">{p.name.split(" ")[0]}</p>
                <p className="text-[11px] text-foreground/50">{p.xp.toLocaleString()} XP</p>
                <div className="w-full rounded-t-2xl bg-secondary flex items-start justify-center pt-2 font-bold" style={{ height: h }}>
                  {rank}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 surface divide-y divide-black/5">
          {rest.map((p, i) => (
            <div key={p.name} className={`flex items-center gap-3 px-4 py-3 ${p.me ? "bg-accent/5" : ""}`}>
              <span className="text-sm font-bold w-6 text-foreground/50">{i + 4}</span>
              <div className="size-9 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: p.color }}>{p.name[0]}</div>
              <span className={`flex-1 text-sm font-semibold ${p.me ? "text-accent" : ""}`}>{p.name}{p.me && " (you)"}</span>
              <span className="text-sm font-semibold text-foreground/70">{p.xp.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
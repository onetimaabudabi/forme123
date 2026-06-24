import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Heart, MessageCircle, UserPlus, Dumbbell, Footprints, Trophy } from "lucide-react";

export const Route = createFileRoute("/friends")({
  head: () => ({ meta: [{ title: "Friends — Forme" }] }),
  component: Friends,
});

const feed = [
  { who: "Sara K.", color: "#FFB4A2", icon: Dumbbell, action: "completed Lower Body Power", meta: "52 min · 480 kcal", time: "12m", likes: 8 },
  { who: "Marco D.", color: "#B5EAD7", icon: Trophy, action: "earned the Century Club badge", meta: "100 workouts", time: "1h", likes: 24 },
  { who: "Lena P.", color: "#C9B5FF", icon: Footprints, action: "hit a 14-day streak", meta: "+1 personal best", time: "3h", likes: 11 },
  { who: "James W.", color: "#FFD6A5", icon: Dumbbell, action: "ran 8.2 km", meta: "Avg pace 5'12\"", time: "Yesterday", likes: 6 },
];

function Friends() {
  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Friends</h1>
          <button className="size-10 -mr-2 flex items-center justify-center"><UserPlus className="size-5" /></button>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
          {feed.map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="size-14 rounded-full ring-2 ring-accent ring-offset-2 ring-offset-background flex items-center justify-center font-bold text-foreground" style={{ background: f.color }}>
                {f.who[0]}
              </div>
              <span className="text-[11px] font-medium">{f.who.split(" ")[0]}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">Activity</h2>
        <div className="mt-3 space-y-3">
          {feed.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="surface p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: f.color }}>{f.who[0]}</div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{f.who}</span>{" "}
                      <span className="text-foreground/60">{f.action}</span>
                    </p>
                    <p className="text-xs text-foreground/40">{f.time}</p>
                  </div>
                  <Icon className="size-4 text-foreground/40" />
                </div>
                <div className="mt-3 rounded-2xl bg-background p-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground/70">{f.meta}</p>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-foreground/60">
                  <button className="flex items-center gap-1.5"><Heart className="size-4" /> {f.likes}</button>
                  <button className="flex items-center gap-1.5"><MessageCircle className="size-4" /> Comment</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}
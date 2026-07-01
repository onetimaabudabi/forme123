import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Bell, UserPlus, Check, Trophy, Target, Flame } from "lucide-react";
import { useState } from "react";
import { useFocusRefetch } from "@/hooks/useFocusRefetch";
import { useAuth } from "@/lib/auth";
import { listNotifications, markNotificationRead, type Notification, type NotificationType } from "@/lib/social";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Forme" }] }),
  component: Notifications,
});

const ICON: Record<NotificationType, typeof Bell> = {
  friend_request: UserPlus,
  friend_accepted: Check,
  achievement_unlocked: Trophy,
  mission_available: Target,
  workout_reminder: Bell,
  meal_reminder: Bell,
  streak_warning: Flame,
  leaderboard_update: Trophy,
};

function label(n: Notification): string {
  switch (n.type) {
    case "friend_request": return "New friend request";
    case "friend_accepted": return "Friend request accepted";
    case "achievement_unlocked": return `Achievement unlocked: ${n.payload.title ?? ""}`;
    case "mission_available": return "Today's mission is ready";
    case "workout_reminder": return "Time to move";
    case "meal_reminder": return "Log your meal";
    case "streak_warning": return "Keep your streak alive";
    case "leaderboard_update": return "Leaderboard updated";
  }
}

function Notifications() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Notification[] | null>(null);

  const refresh = async () => { if (profile) setItems(await listNotifications(profile.uid)); };
  useFocusRefetch(() => refresh(), [profile?.uid]);

  const open = async (n: Notification) => {
    if (!profile) return;
    if (!n.read) { await markNotificationRead(profile.uid, n.id).catch(() => {}); await refresh(); }
  };

  if (!profile) return null;

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Notifications</h1>
          <div className="size-10" />
        </div>

        {items === null ? (
          <p className="mt-10 text-sm text-foreground/40">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-8 surface p-8 text-center">
            <Bell className="size-8 text-foreground/30 mx-auto" />
            <p className="mt-3 text-sm text-foreground/60">All quiet</p>
            <p className="text-xs text-foreground/40 mt-1">You'll see friend requests, achievements and reminders here.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {items.map((n) => {
              const Icon = ICON[n.type] ?? Bell;
              return (
                <button key={n.id} onClick={() => open(n)} className={`w-full text-left surface p-4 flex items-center gap-3 ${n.read ? "opacity-60" : ""}`}>
                  <div className="size-9 rounded-xl bg-secondary flex items-center justify-center"><Icon className="size-4" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{label(n)}</p>
                    <p className="text-xs text-foreground/50">{n.createdAt.toLocaleString()}</p>
                  </div>
                  {!n.read && <span className="size-2 rounded-full bg-accent" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
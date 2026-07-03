import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Bell, UserPlus, Check, Trophy, Target, Flame, Heart, MessageCircle, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { subscribeNotifications, markNotificationRead, markAllNotificationsRead, type Notification, type NotificationType } from "@/lib/social";

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
  post_like: Heart,
  post_comment: MessageCircle,
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
    case "post_like": {
      const name = (n.payload.actorName as string | null) || ((n.payload.actorUsername as string | null) ? `@${n.payload.actorUsername}` : "Someone");
      return `${name} liked your post`;
    }
    case "post_comment": {
      const name = (n.payload.actorName as string | null) || ((n.payload.actorUsername as string | null) ? `@${n.payload.actorUsername}` : "Someone");
      return `${name} commented on your post`;
    }
  }
}

function Notifications() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Notification[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;
    const unsub = subscribeNotifications(profile.uid, setItems);
    return () => unsub();
  }, [profile?.uid]);

  const open = async (n: Notification) => {
    if (!profile) return;
    if (!n.read) await markNotificationRead(profile.uid, n.id).catch(() => {});
    const postId = n.payload.postId as string | undefined;
    if (postId && (n.type === "post_like" || n.type === "post_comment")) {
      navigate({ to: "/feed", search: { post: postId } as never });
    }
  };

  const markAll = async () => { if (profile) await markAllNotificationsRead(profile.uid).catch(() => {}); };

  if (!profile) return null;

  const unread = items?.filter((n) => !n.read).length ?? 0;

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Notifications</h1>
          {unread > 0 ? (
            <button onClick={markAll} aria-label="Mark all read" className="size-10 flex items-center justify-center text-foreground/60">
              <CheckCheck className="size-5" />
            </button>
          ) : <div className="size-10" />}
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
              const preview = (n.payload.commentText as string | null) || (n.payload.previewText as string | null);
              const photo = n.payload.previewPhoto as string | null | undefined;
              const initial = ((n.payload.actorName as string | null) || (n.payload.actorUsername as string | null) || "?").charAt(0).toUpperCase();
              const showAvatar = n.type === "post_like" || n.type === "post_comment" || n.type === "friend_request" || n.type === "friend_accepted";
              return (
                <button key={n.id} onClick={() => open(n)} className={`w-full text-left surface p-4 flex items-center gap-3 ${n.read ? "opacity-60" : ""}`}>
                  {showAvatar ? (
                    <div className="relative shrink-0">
                      <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">{initial}</div>
                      <div className="absolute -bottom-0.5 -right-0.5 size-5 rounded-full bg-background border border-black/5 flex items-center justify-center">
                        <Icon className={`size-3 ${n.type === "post_like" ? "text-rose-500" : ""}`} />
                      </div>
                    </div>
                  ) : (
                    <div className="size-9 rounded-xl bg-secondary flex items-center justify-center shrink-0"><Icon className="size-4" /></div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{label(n)}</p>
                    {preview && <p className="text-xs text-foreground/60 truncate mt-0.5">{preview}</p>}
                    <p className="text-xs text-foreground/50">{n.createdAt.toLocaleString()}</p>
                  </div>
                  {photo && <img src={photo} alt="" className="size-10 rounded-lg object-cover shrink-0" />}
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
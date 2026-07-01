import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell, Target, Flame, Trophy, Scale, Ruler, Rss, UserPlus } from "lucide-react";
import { useState } from "react";
import { useFocusRefetch } from "@/hooks/useFocusRefetch";
import { useAuth } from "@/lib/auth";
import { getFriendsFeed, type FeedItem, type FeedItemType } from "@/lib/social";
import { listFriendUids } from "@/lib/friends";
import { getPublicUser, type PublicUser } from "@/lib/usernames";

export const Route = createFileRoute("/_tabs/feed")({
  head: () => ({ meta: [{ title: "Feed — Forme" }] }),
  component: Feed,
});

const ICON: Record<FeedItemType, typeof Dumbbell> = {
  workout_completed: Dumbbell,
  mission_completed: Target,
  streak_milestone: Flame,
  achievement_unlocked: Trophy,
  weight_goal: Scale,
  measurement_milestone: Ruler,
};

function describe(item: FeedItem, user?: PublicUser | null): string {
  const name = user?.name ?? user?.username ?? "Someone";
  switch (item.type) {
    case "workout_completed": {
      const title = item.payload.title as string | undefined;
      return `${name} completed ${title ?? "a workout"}`;
    }
    case "mission_completed": return `${name} completed today's mission`;
    case "streak_milestone": return `${name} reached a ${item.payload.streak as number}-day streak`;
    case "achievement_unlocked": return `${name} unlocked ${(item.payload.title as string) ?? "an achievement"}`;
    case "weight_goal": return `${name} hit a weight goal`;
    case "measurement_milestone": return `${name} hit a measurement milestone`;
  }
}

function relTime(d: Date): string {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString();
}

function Feed() {
  const { profile } = useAuth();
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [users, setUsers] = useState<Record<string, PublicUser | null>>({});

  useFocusRefetch(async () => {
    if (!profile) return;
    const friends = await listFriendUids(profile.uid).catch(() => []);
    const uids = Array.from(new Set([profile.uid, ...friends]));
    const feed = await getFriendsFeed(uids, 50).catch(() => []);
    setItems(feed);
    const need = Array.from(new Set(feed.map((i) => i.uid)));
    const hydrated = await Promise.all(need.map(async (uid) => [uid, await getPublicUser(uid).catch(() => null)] as const));
    setUsers(Object.fromEntries(hydrated));
  }, [profile?.uid]);

  if (!profile) return null;

  return (
    <div className="px-6 pt-14">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
        <Link to="/add-friend" className="size-10 rounded-full bg-secondary flex items-center justify-center"><UserPlus className="size-5" /></Link>
      </div>
      <p className="text-sm text-foreground/50 mt-1">What your friends are up to.</p>

      {items === null ? (
        <p className="mt-10 text-sm text-foreground/40">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 surface p-8 text-center">
          <Rss className="size-8 text-foreground/30 mx-auto" />
          <p className="mt-3 text-sm text-foreground/60 font-semibold">No activity yet</p>
          <p className="text-xs text-foreground/40 mt-1 max-w-[240px] mx-auto">Add friends to see their workouts, missions and milestones here.</p>
          <Link to="/add-friend" className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-black text-white font-semibold text-xs">
            <UserPlus className="size-4" /> Add friend
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {items.map((it) => {
            const Icon = ICON[it.type] ?? Rss;
            const user = users[it.uid];
            const caption = it.payload.caption as string | undefined;
            return (
              <Link key={it.id} to="/u/$uid" params={{ uid: it.uid }} className="surface p-4 flex gap-3">
                <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold shrink-0">
                  {(user?.name ?? user?.username ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{user?.name ?? user?.username ?? "Someone"}</p>
                    <span className="text-[11px] text-foreground/40">· {relTime(it.createdAt)}</span>
                  </div>
                  <div className="mt-1 flex items-start gap-2">
                    <Icon className="size-4 text-foreground/50 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground/80">{describe(it, user)}</p>
                  </div>
                  {caption && <p className="mt-1.5 text-sm text-foreground/70">{caption}</p>}
                  {it.type === "workout_completed" && (it.payload.durationMin || it.payload.kcal) ? (
                    <p className="mt-1.5 text-[11px] text-foreground/50 font-medium">
                      {it.payload.durationMin ? `${it.payload.durationMin} min` : null}
                      {it.payload.durationMin && it.payload.kcal ? " · " : null}
                      {it.payload.kcal ? `${it.payload.kcal} kcal` : null}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
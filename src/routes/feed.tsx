import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Dumbbell, Target, Flame, Trophy, Scale, Ruler, Rss } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getFriendsFeed, type FeedItem, type FeedItemType } from "@/lib/social";
import { listFriendUids } from "@/lib/friends";
import { getPublicUser, type PublicUser } from "@/lib/usernames";

export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "Friends feed — Forme" }] }),
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
    case "workout_completed": return `${name} completed ${(item.payload.title as string) ?? "a workout"}`;
    case "mission_completed": return `${name} completed today's mission`;
    case "streak_milestone": return `${name} reached a ${item.payload.streak as number}-day streak`;
    case "achievement_unlocked": return `${name} unlocked ${(item.payload.title as string) ?? "an achievement"}`;
    case "weight_goal": return `${name} hit a weight goal`;
    case "measurement_milestone": return `${name} hit a measurement milestone`;
  }
}

function Feed() {
  const { profile } = useAuth();
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [users, setUsers] = useState<Record<string, PublicUser | null>>({});

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const friends = await listFriendUids(profile.uid).catch(() => []);
      const uids = Array.from(new Set([profile.uid, ...friends]));
      const feed = await getFriendsFeed(uids, 50).catch(() => []);
      setItems(feed);
      const need = Array.from(new Set(feed.map((i) => i.uid)));
      const hydrated = await Promise.all(need.map(async (uid) => [uid, await getPublicUser(uid).catch(() => null)] as const));
      setUsers(Object.fromEntries(hydrated));
    })();
  }, [profile]);

  if (!profile) return null;

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Friends feed</h1>
          <div className="size-10" />
        </div>

        {items === null ? (
          <p className="mt-10 text-sm text-foreground/40">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-8 surface p-8 text-center">
            <Rss className="size-8 text-foreground/30 mx-auto" />
            <p className="mt-3 text-sm text-foreground/60">No activity yet</p>
            <p className="text-xs text-foreground/40 mt-1">As you and your friends train, their wins show up here.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {items.map((it) => {
              const Icon = ICON[it.type] ?? Rss;
              const user = users[it.uid];
              return (
                <Link key={it.id} to="/u/$uid" params={{ uid: it.uid }} className="surface p-4 flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-secondary flex items-center justify-center"><Icon className="size-5" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{describe(it, user)}</p>
                    <p className="text-xs text-foreground/50">{it.createdAt.toLocaleString()}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
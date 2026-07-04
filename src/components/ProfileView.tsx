import { Link, useNavigate } from "@tanstack/react-router";
import { Settings, UserPlus, UserCheck, Film, Dumbbell, Target, Trophy, Flame, Scale, Ruler, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getPublicUser, type PublicUser } from "@/lib/usernames";
import { subscribeIsFollowing, follow, unfollow } from "@/lib/follows";
import { subscribeUserPosts } from "@/lib/social";
import { doc, onSnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { FeedItem, FeedItemType } from "@/lib/social";

type Props = { uid: string };

export function ProfileView({ uid }: Props) {
  const { profile: me } = useAuth();
  const navigate = useNavigate();
  const isSelf = !!me && me.uid === uid;
  const [user, setUser] = useState<PublicUser | null | undefined>(undefined);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [amFollowing, setAmFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState<FeedItem[] | null>(null);

  // Real-time user doc → counts + profile refresh.
  useEffect(() => {
    const unsub = onSnapshot(doc(getDb(), "users", uid), (snap) => {
      if (!snap.exists()) { setUser(null); return; }
      const data = snap.data() as Record<string, unknown>;
      setFollowers((data.followersCount as number) ?? 0);
      setFollowing((data.followingCount as number) ?? 0);
      // Reuse getPublicUser shape via a one-shot fetch to normalize.
      void getPublicUser(uid).then((u) => setUser(u ?? null));
    }, () => setUser(null));
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    if (!me || isSelf) return;
    const unsub = subscribeIsFollowing(me.uid, uid, setAmFollowing);
    return () => unsub();
  }, [me?.uid, uid, isSelf]);

  useEffect(() => {
    const unsub = subscribeUserPosts(uid, setPosts);
    return () => unsub();
  }, [uid]);

  const postCount = posts?.length ?? 0;

  const toggleFollow = async () => {
    if (!me || isSelf || busy) return;
    setBusy(true);
    try {
      if (amFollowing) await unfollow(me.uid, uid);
      else await follow(me.uid, uid);
    } finally { setBusy(false); }
  };

  const displayName = user?.name || user?.username || "User";
  const initial = displayName.charAt(0).toUpperCase();

  if (user === undefined) return <p className="mt-10 text-sm text-foreground/40 text-center">Loading…</p>;
  if (!user) return <p className="mt-10 text-sm text-foreground/40 text-center">User not found.</p>;

  return (
    <div>
      {/* Header row: username + settings (self only) */}
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold truncate">@{user.username || "user"}</p>
        {isSelf ? (
          <Link to="/settings" aria-label="Settings" className="size-10 -mr-2 flex items-center justify-center">
            <Settings className="size-5" />
          </Link>
        ) : <div className="size-10" />}
      </div>

      {/* Avatar + stats */}
      <div className="mt-5 flex items-center gap-5">
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="size-20 rounded-full object-cover bg-secondary" />
        ) : (
          <div className="size-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold">{initial}</div>
        )}
        <div className="flex-1 grid grid-cols-3 text-center">
          <div>
            <p className="text-lg font-bold tracking-tight">{postCount}</p>
            <p className="text-[11px] text-foreground/50 font-medium">Posts</p>
          </div>
          <Link to="/followers/$uid" params={{ uid }} className="active:opacity-60">
            <p className="text-lg font-bold tracking-tight">{followers}</p>
            <p className="text-[11px] text-foreground/50 font-medium">Followers</p>
          </Link>
          <Link to="/following/$uid" params={{ uid }} className="active:opacity-60">
            <p className="text-lg font-bold tracking-tight">{following}</p>
            <p className="text-[11px] text-foreground/50 font-medium">Following</p>
          </Link>
        </div>
      </div>

      {/* Name + bio */}
      <div className="mt-4">
        <p className="text-[15px] font-semibold">{displayName}</p>
        {user.bio && <p className="mt-1 text-sm text-foreground/70 whitespace-pre-wrap">{user.bio}</p>}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {isSelf ? (
          <Link to="/edit-profile" className="flex-1 h-10 rounded-xl bg-secondary text-[13px] font-semibold flex items-center justify-center">
            Edit profile
          </Link>
        ) : (
          <>
            <button onClick={toggleFollow} disabled={busy} className={`flex-1 h-10 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 ${amFollowing ? "bg-secondary text-foreground" : "bg-black text-white"}`}>
              {amFollowing ? <><UserCheck className="size-4" /> Following</> : <><UserPlus className="size-4" /> Follow</>}
            </button>
            <button
              onClick={() => navigate({ to: "/feed", search: { post: undefined } as never })}
              aria-label="Message"
              className="size-10 rounded-xl bg-secondary flex items-center justify-center"
            >
              <MessageSquare className="size-4" />
            </button>
          </>
        )}
      </div>

      {/* Posts grid */}
      <div className="mt-6 border-t pt-3">
        {posts === null ? (
          <p className="mt-6 text-xs text-foreground/40 text-center">Loading posts…</p>
        ) : posts.length === 0 ? (
          <div className="mt-6 text-center text-foreground/40">
            <p className="text-sm">No posts yet</p>
          </div>
        ) : (
          <PostGrid items={posts} />
        )}
      </div>
    </div>
  );
}

const TYPE_ICON: Record<FeedItemType, typeof Dumbbell> = {
  workout_completed: Dumbbell,
  mission_completed: Target,
  streak_milestone: Flame,
  achievement_unlocked: Trophy,
  weight_goal: Scale,
  measurement_milestone: Ruler,
  post: MessageSquare,
};

function PostGrid({ items }: { items: FeedItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {items.map((it) => <PostTile key={it.id} item={it} />)}
    </div>
  );
}

function PostTile({ item }: { item: FeedItem }) {
  const photos = (item.payload.photos as string[] | undefined) ?? [];
  const video = item.payload.video as string | undefined;
  const text = (item.payload.text as string | undefined) ?? (item.payload.caption as string | undefined);
  const Icon = TYPE_ICON[item.type] ?? MessageSquare;
  const cover = photos[0];

  return (
    <Link
      to="/post/$id"
      params={{ id: item.id }}
      className="relative aspect-square bg-secondary rounded-md overflow-hidden group"
    >
      {cover ? (
        <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      ) : video ? (
        <>
          <video src={video} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute top-1.5 right-1.5 text-white drop-shadow"><Film className="size-4" /></span>
        </>
      ) : item.type === "workout_completed" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black to-neutral-800 text-white p-2 text-center">
          <Dumbbell className="size-5 mb-1" />
          <p className="text-[10px] font-semibold line-clamp-2">{(item.payload.title as string) ?? "Workout"}</p>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary p-2 text-center">
          <Icon className="size-4 mb-1 text-foreground/50" />
          <p className="text-[10px] font-medium text-foreground/70 line-clamp-3">{text || "Post"}</p>
        </div>
      )}
      {photos.length > 1 && (
        <span className="absolute top-1.5 right-1.5 text-white drop-shadow text-[10px] font-bold bg-black/40 rounded px-1">{photos.length}</span>
      )}
    </Link>
  );
}
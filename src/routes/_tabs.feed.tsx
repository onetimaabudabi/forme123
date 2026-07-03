import { createFileRoute, Link, useSearch, useNavigate } from "@tanstack/react-router";
import { Dumbbell, Target, Flame, Trophy, Scale, Ruler, Rss, UserPlus, MessageCircle, Heart, Image as ImageIcon, Film, X, Send, Trash2, Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  subscribeFeed, createPost, toggleLike, hasLiked, subscribeComments, addComment, deleteComment,
  subscribeUnreadCount,
  type FeedItem, type FeedItemType, type Comment,
} from "@/lib/social";
import { listFriendUids } from "@/lib/friends";
import { getPublicUser, type PublicUser } from "@/lib/usernames";

export const Route = createFileRoute("/_tabs/feed")({
  head: () => ({ meta: [{ title: "Feed — Forme" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ post: typeof s.post === "string" ? s.post : undefined }),
  component: Feed,
});

const ICON: Record<FeedItemType, typeof Dumbbell> = {
  workout_completed: Dumbbell,
  mission_completed: Target,
  streak_milestone: Flame,
  achievement_unlocked: Trophy,
  weight_goal: Scale,
  measurement_milestone: Ruler,
  post: Rss,
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
    case "post": return `${name} shared a post`;
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
  const search = useSearch({ from: "/_tabs/feed" });
  const navigate = useNavigate();
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [users, setUsers] = useState<Record<string, PublicUser | null>>({});
  const [composerOpen, setComposerOpen] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const unsub = subscribeUnreadCount(profile.uid, setUnread);
    return () => unsub();
  }, [profile?.uid]);

  // Subscribe in real time to activity_feed, filtered to self+friends.
  useEffect(() => {
    if (!profile) return;
    let unsub: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      const friends = await listFriendUids(profile.uid).catch(() => []);
      if (cancelled) return;
      const uids = Array.from(new Set([profile.uid, ...friends]));
      unsub = subscribeFeed(uids, (feed) => {
        setItems(feed);
        // hydrate any new users.
        const need = Array.from(new Set(feed.map((i) => i.uid)));
        setUsers((prev) => {
          const missing = need.filter((u) => !(u in prev));
          if (missing.length) {
            void Promise.all(missing.map(async (u) => [u, await getPublicUser(u).catch(() => null)] as const))
              .then((pairs) => setUsers((cur) => ({ ...cur, ...Object.fromEntries(pairs) })));
          }
          return prev;
        });
      }, 100);
    })();
    return () => { cancelled = true; if (unsub) unsub(); };
  }, [profile?.uid]);

  // Scroll to highlighted post from a notification (once items are loaded).
  useEffect(() => {
    const target = search.post;
    if (!target || !items) return;
    const el = document.getElementById(`post-${target}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-accent");
      const t = setTimeout(() => el.classList.remove("ring-2", "ring-accent"), 2000);
      // clear the search param so it doesn't re-trigger
      navigate({ to: "/feed", search: {} as never, replace: true });
      return () => clearTimeout(t);
    }
  }, [search.post, items, navigate]);

  if (!profile) return null;

  return (
    <div className="px-6 pt-14">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
        <div className="flex items-center gap-2">
          <Link to="/notifications" aria-label="Notifications" className="relative size-10 rounded-full bg-secondary flex items-center justify-center">
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Link>
          <button onClick={() => setComposerOpen(true)} aria-label="New post" className="size-10 rounded-full bg-black text-white flex items-center justify-center">
            <ImageIcon className="size-5" />
          </button>
          <Link to="/add-friend" className="size-10 rounded-full bg-secondary flex items-center justify-center"><UserPlus className="size-5" /></Link>
        </div>
      </div>
      <p className="text-sm text-foreground/50 mt-1">What your friends are up to.</p>

      {items === null ? (
        <p className="mt-10 text-sm text-foreground/40">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 surface p-8 text-center">
          <Rss className="size-8 text-foreground/30 mx-auto" />
          <p className="mt-3 text-sm text-foreground/60 font-semibold">No activity yet</p>
          <p className="text-xs text-foreground/40 mt-1 max-w-[240px] mx-auto">Share your first post or add friends to see their workouts, missions and milestones here.</p>
          <div className="mt-5 flex items-center gap-2 justify-center">
            <button onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-black text-white font-semibold text-xs">
              <ImageIcon className="size-4" /> New post
            </button>
            <Link to="/add-friend" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-secondary font-semibold text-xs">
              <UserPlus className="size-4" /> Add friend
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {items.map((it) => {
            const user = users[it.uid];
            return (
              <PostCard
                key={it.id}
                item={it}
                user={user}
                selfUid={profile.uid}
                onOpenComments={() => setOpenComments(it.id)}
              />
            );
          })}
        </div>
      )}

      {composerOpen && <Composer uid={profile.uid} onClose={() => setComposerOpen(false)} />}
      {openComments && <CommentsSheet postId={openComments} selfUid={profile.uid} onClose={() => setOpenComments(null)} />}
    </div>
  );
}

// ---------- Post card ----------

function PostCard({ item, user, selfUid, onOpenComments }: {
  item: FeedItem;
  user?: PublicUser | null;
  selfUid: string;
  onOpenComments: () => void;
}) {
  const Icon = ICON[item.type] ?? Rss;
  const caption = item.payload.caption as string | undefined;
  const text = item.payload.text as string | undefined;
  const photos = (item.payload.photos as string[] | undefined) ?? [];
  const video = item.payload.video as string | undefined;
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likesCount ?? 0);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setLikes(item.likesCount ?? 0); }, [item.likesCount]);
  useEffect(() => {
    let cancel = false;
    hasLiked(item.id, selfUid).then((v) => { if (!cancel) setLiked(v); }).catch(() => {});
    return () => { cancel = true; };
  }, [item.id, selfUid]);

  const like = async () => {
    if (busy) return;
    setBusy(true);
    // optimistic
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    try { await toggleLike(item.id, selfUid); }
    catch { setLiked(!next); setLikes((n) => Math.max(0, n + (next ? -1 : 1))); }
    finally { setBusy(false); }
  };

  return (
    <div id={`post-${item.id}`} className="surface p-4 transition-shadow">
      <div className="flex gap-3">
        <Link to="/u/$uid" params={{ uid: item.uid }} className="size-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold shrink-0">
          {(user?.name ?? user?.username ?? "?").charAt(0).toUpperCase()}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link to="/u/$uid" params={{ uid: item.uid }} className="text-sm font-semibold truncate">{user?.name ?? user?.username ?? "Someone"}</Link>
            {user?.username && <span className="text-[11px] text-foreground/40 truncate">@{user.username}</span>}
            <span className="text-[11px] text-foreground/40">· {relTime(item.createdAt)}</span>
          </div>
          {item.type !== "post" && (
            <div className="mt-1 flex items-start gap-2">
              <Icon className="size-4 text-foreground/50 mt-0.5 shrink-0" />
              <p className="text-sm text-foreground/80">{describe(item, user)}</p>
            </div>
          )}
          {text && <p className="mt-1.5 text-sm text-foreground/90 whitespace-pre-wrap break-words">{text}</p>}
          {caption && <p className="mt-1.5 text-sm text-foreground/70">{caption}</p>}
          {item.type === "workout_completed" && (item.payload.durationMin || item.payload.kcal) ? (
            <p className="mt-1.5 text-[11px] text-foreground/50 font-medium">
              {item.payload.durationMin ? `${item.payload.durationMin} min` : null}
              {item.payload.durationMin && item.payload.kcal ? " · " : null}
              {item.payload.kcal ? `${item.payload.kcal} kcal` : null}
            </p>
          ) : null}
        </div>
      </div>

      {photos.length > 0 && (
        <div className={`mt-3 grid gap-1 ${photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {photos.map((src, i) => (
            <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-2xl bg-secondary" loading="lazy" />
          ))}
        </div>
      )}
      {video && (
        <video src={video} controls playsInline className="mt-3 w-full rounded-2xl bg-black aspect-video" />
      )}

      <div className="mt-3 flex items-center gap-1 text-foreground/60">
        <button onClick={like} disabled={busy} className={`h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold transition ${liked ? "text-rose-500 bg-rose-500/10" : "hover:bg-secondary"}`}>
          <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
          <span>{likes}</span>
        </button>
        <button onClick={onOpenComments} className="h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold hover:bg-secondary">
          <MessageCircle className="size-4" />
          <span>{item.commentsCount ?? 0}</span>
        </button>
      </div>
    </div>
  );
}

// ---------- Composer ----------

function Composer({ uid, onClose }: { uid: string; onClose: () => void }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (accept: string) => {
    if (!inputRef.current) return;
    inputRef.current.accept = accept;
    inputRef.current.click();
  };
  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files ?? []);
    setFiles((prev) => {
      const merged = [...prev, ...fs];
      // enforce: at most one video
      const videos = merged.filter((f) => f.type.startsWith("video"));
      const images = merged.filter((f) => f.type.startsWith("image"));
      const kept = [...images, ...(videos[0] ? [videos[0]] : [])];
      return kept.slice(0, 10);
    });
    e.target.value = "";
  };
  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!text.trim() && files.length === 0) return;
    setBusy(true); setErr(null);
    try {
      await createPost(uid, text, files);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to publish");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 mb-6 rounded-3xl bg-background border shadow-2xl p-5 animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">New post</h3>
          <button onClick={onClose} className="size-8 rounded-full bg-secondary flex items-center justify-center"><X className="size-4" /></button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share something…"
          maxLength={500}
          rows={3}
          className="mt-4 w-full rounded-2xl bg-secondary px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/40 resize-none"
        />
        {files.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {files.map((f, i) => (
              <div key={i} className="relative shrink-0">
                {f.type.startsWith("video")
                  ? <div className="size-20 rounded-xl bg-black text-white flex items-center justify-center"><Film className="size-6" /></div>
                  : <img src={URL.createObjectURL(f)} alt="" className="size-20 rounded-xl object-cover" />}
                <button onClick={() => removeFile(i)} className="absolute -top-1 -right-1 size-5 rounded-full bg-black text-white flex items-center justify-center"><X className="size-3" /></button>
              </div>
            ))}
          </div>
        )}
        <input ref={inputRef} type="file" multiple hidden onChange={onFiles} />
        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => pick("image/*")} className="h-10 px-3 rounded-full bg-secondary text-xs font-semibold inline-flex items-center gap-1.5"><ImageIcon className="size-4" /> Photo</button>
          <button onClick={() => pick("video/*")} className="h-10 px-3 rounded-full bg-secondary text-xs font-semibold inline-flex items-center gap-1.5"><Film className="size-4" /> Video</button>
          <div className="flex-1" />
          <button onClick={submit} disabled={busy || (!text.trim() && files.length === 0)} className="h-10 px-5 rounded-full bg-black text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5">
            <Send className="size-4" /> {busy ? "Publishing…" : "Publish"}
          </button>
        </div>
        {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
      </div>
    </div>
  );
}

// ---------- Comments sheet ----------

function CommentsSheet({ postId, selfUid, onClose }: { postId: string; selfUid: string; onClose: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<Record<string, PublicUser | null>>({});
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = subscribeComments(postId, (list) => {
      setComments(list);
      const need = Array.from(new Set(list.map((c) => c.uid)));
      setUsers((prev) => {
        const missing = need.filter((u) => !(u in prev));
        if (missing.length) {
          void Promise.all(missing.map(async (u) => [u, await getPublicUser(u).catch(() => null)] as const))
            .then((pairs) => setUsers((cur) => ({ ...cur, ...Object.fromEntries(pairs) })));
        }
        return prev;
      });
    });
    return () => unsub();
  }, [postId]);

  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try { await addComment(postId, selfUid, text); setText(""); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 mb-6 rounded-3xl bg-background border shadow-2xl p-5 max-h-[75vh] flex flex-col animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-base font-semibold">Comments</h3>
          <button onClick={onClose} className="size-8 rounded-full bg-secondary flex items-center justify-center"><X className="size-4" /></button>
        </div>
        <div className="mt-3 flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
          {comments.length === 0 ? (
            <p className="text-xs text-foreground/40 text-center py-6">Be the first to comment.</p>
          ) : comments.map((c) => {
            const u = users[c.uid];
            return (
              <div key={c.id} className="flex gap-2 items-start">
                <div className="size-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
                  {(u?.name ?? u?.username ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 rounded-2xl bg-secondary px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold truncate">{u?.name ?? u?.username ?? "Someone"}</p>
                    <span className="text-[10px] text-foreground/40">· {relTime(c.createdAt)}</span>
                    {c.uid === selfUid && (
                      <button onClick={() => deleteComment(postId, c.id)} className="ml-auto text-foreground/40 hover:text-destructive" aria-label="Delete comment">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{c.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 shrink-0">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Add a comment…"
            maxLength={300}
            className="flex-1 h-11 rounded-full bg-secondary px-4 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button onClick={submit} disabled={busy || !text.trim()} className="size-11 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-50">
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
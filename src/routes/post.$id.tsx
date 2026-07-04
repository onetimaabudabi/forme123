import { createFileRoute, Link, useParams, useRouter } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  subscribePost, subscribeComments, addComment, deleteComment, toggleLike, hasLiked,
  type FeedItem, type Comment,
} from "@/lib/social";
import { getPublicUser, type PublicUser } from "@/lib/usernames";

export const Route = createFileRoute("/post/$id")({
  head: () => ({ meta: [{ title: "Post — Forme" }] }),
  component: PostDetail,
});

function relTime(d: Date): string {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString();
}

function PostDetail() {
  const { id } = useParams({ from: "/post/$id" });
  const { profile } = useAuth();
  const router = useRouter();
  const [item, setItem] = useState<FeedItem | null | undefined>(undefined);
  const [author, setAuthor] = useState<PublicUser | null>(null);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentUsers, setCommentUsers] = useState<Record<string, PublicUser | null>>({});
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = subscribePost(id, (it) => {
      setItem(it);
      if (it) void getPublicUser(it.uid).then((u) => setAuthor(u ?? null));
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!profile || !item) return;
    let cancel = false;
    hasLiked(id, profile.uid).then((v) => !cancel && setLiked(v)).catch(() => {});
    return () => { cancel = true; };
  }, [id, profile?.uid, item?.likesCount]);

  useEffect(() => {
    const unsub = subscribeComments(id, (list) => {
      setComments(list);
      const need = Array.from(new Set(list.map((c) => c.uid)));
      setCommentUsers((prev) => {
        const missing = need.filter((u) => !(u in prev));
        if (missing.length) {
          void Promise.all(missing.map(async (u) => [u, await getPublicUser(u).catch(() => null)] as const))
            .then((pairs) => setCommentUsers((cur) => ({ ...cur, ...Object.fromEntries(pairs) })));
        }
        return prev;
      });
    });
    return () => unsub();
  }, [id]);

  const like = async () => {
    if (!profile || busy) return;
    setBusy(true);
    try { await toggleLike(id, profile.uid); setLiked((v) => !v); }
    finally { setBusy(false); }
  };

  const submit = async () => {
    if (!profile || !text.trim()) return;
    setBusy(true);
    try { await addComment(id, profile.uid, text); setText(""); }
    finally { setBusy(false); }
  };

  return (
    <PhoneFrame>
      <div className="h-full flex flex-col">
        <div className="px-6 pt-14 pb-3 flex items-center justify-between border-b">
          <button onClick={() => router.history.back()} className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></button>
          <h1 className="text-base font-semibold">Post</h1>
          <div className="size-10" />
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
          {item === undefined ? <p className="text-sm text-foreground/40">Loading…</p>
            : !item ? <p className="text-sm text-foreground/40">Post not found.</p>
            : (
              <>
                <div className="flex items-center gap-3">
                  <Link to="/u/$uid" params={{ uid: item.uid }} className="size-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
                    {(author?.name ?? author?.username ?? "?").charAt(0).toUpperCase()}
                  </Link>
                  <div className="flex-1">
                    <Link to="/u/$uid" params={{ uid: item.uid }} className="text-sm font-semibold">{author?.name ?? author?.username ?? "Someone"}</Link>
                    <p className="text-[11px] text-foreground/40">@{author?.username ?? "user"} · {relTime(item.createdAt)}</p>
                  </div>
                </div>
                {((item.payload.text as string | undefined) || (item.payload.caption as string | undefined)) && (
                  <p className="mt-3 text-sm whitespace-pre-wrap">{(item.payload.text as string) ?? (item.payload.caption as string)}</p>
                )}
                {(item.payload.photos as string[] | undefined)?.map((src, i) => (
                  <img key={i} src={src} alt="" className="mt-3 w-full rounded-2xl bg-secondary object-cover" loading="lazy" />
                ))}
                {(item.payload.video as string | undefined) && (
                  <video src={item.payload.video as string} controls playsInline className="mt-3 w-full rounded-2xl bg-black aspect-video" />
                )}

                <div className="mt-4 flex items-center gap-1">
                  <button onClick={like} disabled={busy || !profile} className={`h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold ${liked ? "text-rose-500 bg-rose-500/10" : "hover:bg-secondary"}`}>
                    <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
                    <Link to="/likes/$postId" params={{ postId: id }} onClick={(e) => e.stopPropagation()} className="hover:underline">{item.likesCount ?? 0} likes</Link>
                  </button>
                  <span className="h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold">
                    <MessageCircle className="size-4" />
                    {comments.length} comments
                  </span>
                </div>

                <div className="mt-4 border-t pt-3 space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-xs text-foreground/40">Be the first to comment.</p>
                  ) : comments.map((c) => {
                    const u = commentUsers[c.uid];
                    return (
                      <div key={c.id} className="flex gap-2 items-start">
                        <Link to="/u/$uid" params={{ uid: c.uid }} className="size-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
                          {(u?.name ?? u?.username ?? "?").charAt(0).toUpperCase()}
                        </Link>
                        <div className="flex-1">
                          <p className="text-xs"><Link to="/u/$uid" params={{ uid: c.uid }} className="font-semibold">{u?.name ?? u?.username ?? "Someone"}</Link> <span className="text-foreground/40">· {relTime(c.createdAt)}</span></p>
                          <p className="text-sm">{c.text}</p>
                        </div>
                        {profile?.uid === c.uid && (
                          <button onClick={() => deleteComment(id, c.id)} className="text-[11px] text-foreground/40">Delete</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
        </div>
        {profile && item && (
          <div className="border-t px-4 py-3 flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 h-10 rounded-full bg-secondary px-4 text-sm outline-none"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void submit(); } }}
            />
            <button onClick={submit} disabled={busy || !text.trim()} className="h-10 px-4 rounded-full bg-black text-white text-xs font-semibold disabled:opacity-50">Post</button>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
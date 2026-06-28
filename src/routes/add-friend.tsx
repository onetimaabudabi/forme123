import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Search, UserPlus, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { ensureUserIdentity, searchUsers, type PublicUser } from "@/lib/usernames";
import { sendFriendRequest } from "@/lib/friends";

export const Route = createFileRoute("/add-friend")({
  head: () => ({ meta: [{ title: "Add friend — Forme" }] }),
  component: AddFriend,
});

function AddFriend() {
  const { profile } = useAuth();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PublicUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure identity assigned (legacy users).
  useEffect(() => {
    if (profile && (!profile.username || !profile.friendCode)) {
      ensureUserIdentity(profile.uid, profile.name).catch(() => {});
    }
  }, [profile]);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await searchUsers(q.trim());
        setResults(r.filter((u) => u.uid !== profile?.uid));
      } catch { setResults([]); } finally { setSearching(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q, profile?.uid]);

  const send = async (uid: string) => {
    if (!profile) return;
    setError(null);
    try { await sendFriendRequest(profile.uid, uid); setSent((s) => ({ ...s, [uid]: true })); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  };

  const copy = async () => {
    if (!profile?.friendCode) return;
    await navigator.clipboard.writeText(profile.friendCode);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  if (!profile) return null;

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/friends" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Add friend</h1>
          <div className="size-10" />
        </div>

        <div className="mt-5 surface p-5">
          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Your friend code</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-mono font-bold tracking-tight">{profile.friendCode ?? "—"}</p>
            <button onClick={copy} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60">
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-foreground/50">Share this with friends so they can add you.</p>
        </div>

        <div className="mt-5 surface p-4 flex items-center gap-2">
          <Search className="size-4 text-foreground/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Username or FRM-123456"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

        <div className="mt-4 space-y-2">
          {searching && <p className="text-xs text-foreground/40">Searching…</p>}
          {!searching && q.trim() && results.length === 0 && <p className="text-xs text-foreground/40">No matches.</p>}
          {results.map((u) => (
            <div key={u.uid} className="surface p-4 flex items-center gap-3">
              <Link to="/u/$uid" params={{ uid: u.uid }} className="flex-1 flex items-center gap-3">
                <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
                  {(u.name ?? u.username).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{u.name ?? u.username}</p>
                  <p className="text-xs text-foreground/50">@{u.username}</p>
                </div>
              </Link>
              <button onClick={() => send(u.uid)} disabled={sent[u.uid]} className="h-9 px-4 rounded-full bg-black text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
                {sent[u.uid] ? <><Check className="size-3.5" /> Sent</> : <><UserPlus className="size-3.5" /> Add</>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
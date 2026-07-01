import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Users, UserPlus, Check, X, Trash2, Flame } from "lucide-react";
import { useState } from "react";
import { useFocusRefetch } from "@/hooks/useFocusRefetch";
import { useAuth } from "@/lib/auth";
import { acceptFriendRequest, declineFriendRequest, listFriends, listIncomingRequests, removeFriend, type Friend, type FriendRequest } from "@/lib/friends";
import { getPublicUser, type PublicUser } from "@/lib/usernames";

export const Route = createFileRoute("/friends")({
  head: () => ({ meta: [{ title: "Friends — Forme" }] }),
  component: FriendsScreen,
});

function FriendsScreen() {
  const { profile } = useAuth();
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [incoming, setIncoming] = useState<(FriendRequest & { from?: PublicUser | null })[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = async () => {
    if (!profile) return;
    const [f, inc] = await Promise.all([
      listFriends(profile.uid),
      listIncomingRequests(profile.uid),
    ]);
    const hydrated = await Promise.all(inc.map(async (r) => ({ ...r, from: await getPublicUser(r.fromUid).catch(() => null) })));
    setFriends(f);
    setIncoming(hydrated);
  };
  useFocusRefetch(() => refresh(), [profile?.uid]);

  const accept = async (r: FriendRequest) => {
    if (!profile) return;
    setBusy(r.id);
    try { await acceptFriendRequest(profile.uid, r.id, r.fromUid); await refresh(); } finally { setBusy(null); }
  };
  const decline = async (r: FriendRequest) => {
    setBusy(r.id);
    try { await declineFriendRequest(r.id); await refresh(); } finally { setBusy(null); }
  };
  const drop = async (uid: string) => {
    if (!profile) return;
    if (!confirm("Remove this friend?")) return;
    setBusy(uid);
    try { await removeFriend(profile.uid, uid); await refresh(); } finally { setBusy(null); }
  };

  if (!profile) return null;

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Friends</h1>
          <Link to="/add-friend" className="size-10 -mr-2 flex items-center justify-center"><UserPlus className="size-5" /></Link>
        </div>

        {incoming && incoming.length > 0 && (
          <>
            <h2 className="mt-6 text-xs uppercase tracking-wider font-semibold text-foreground/40">Requests</h2>
            <div className="mt-3 space-y-2">
              {incoming.map((r) => (
                <div key={r.id} className="surface p-4 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
                    {(r.from?.name ?? r.from?.username ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.from?.name ?? r.from?.username ?? "Someone"}</p>
                    <p className="text-xs text-foreground/50">@{r.from?.username ?? "user"}</p>
                  </div>
                  <button onClick={() => accept(r)} disabled={busy === r.id} className="size-9 rounded-full bg-accent text-white flex items-center justify-center disabled:opacity-50"><Check className="size-4" /></button>
                  <button onClick={() => decline(r)} disabled={busy === r.id} className="size-9 rounded-full bg-secondary flex items-center justify-center disabled:opacity-50"><X className="size-4" /></button>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">Your friends</h2>
        {friends === null ? (
          <p className="mt-3 text-sm text-foreground/40">Loading…</p>
        ) : friends.length === 0 ? (
          <div className="mt-3 surface p-8 text-center">
            <div className="size-14 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Users className="size-7 text-foreground/60" />
            </div>
            <p className="text-sm text-foreground/60 font-semibold">No friends yet</p>
            <p className="text-xs text-foreground/40 mt-1 max-w-[240px] mx-auto">Search by username or share your friend code <span className="font-mono font-semibold">{profile.friendCode ?? "—"}</span>.</p>
            <Link to="/add-friend" className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-black text-white font-semibold text-xs">
              <UserPlus className="size-4" /> Add friend
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {friends.map((f) => (
              <div key={f.uid} className="surface p-4 flex items-center gap-3">
                <Link to="/u/$uid" params={{ uid: f.uid }} className="flex-1 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
                    {(f.user?.name ?? f.user?.username ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{f.user?.name ?? f.user?.username ?? "Friend"}</p>
                    <p className="text-xs text-foreground/50">@{f.user?.username ?? "user"}{f.user?.streak ? <> · <Flame className="inline size-3" /> {f.user.streak}</> : null}</p>
                  </div>
                </Link>
                <button onClick={() => drop(f.uid)} disabled={busy === f.uid} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60 disabled:opacity-50"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
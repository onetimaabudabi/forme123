import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, UserPlus, UserMinus, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getPublicUser, type PublicUser } from "@/lib/usernames";
import { isFriend, listOutgoingRequests, removeFriend, sendFriendRequest } from "@/lib/friends";

export const Route = createFileRoute("/u/$uid")({
  head: () => ({ meta: [{ title: "Profile — Forme" }] }),
  component: PublicProfile,
});

function PublicProfile() {
  const { uid } = useParams({ from: "/u/$uid" });
  const { profile } = useAuth();
  const [user, setUser] = useState<PublicUser | null | undefined>(undefined);
  const [friend, setFriend] = useState(false);
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!profile) return;
    const u = await getPublicUser(uid);
    setUser(u);
    setFriend(await isFriend(profile.uid, uid));
    const out = await listOutgoingRequests(profile.uid);
    setPending(out.some((r) => r.toUid === uid));
  };
  useEffect(() => { void refresh(); }, [uid, profile]);

  const add = async () => {
    if (!profile) return;
    setBusy(true);
    try { await sendFriendRequest(profile.uid, uid); await refresh(); } finally { setBusy(false); }
  };
  const drop = async () => {
    if (!profile) return;
    if (!confirm("Remove this friend?")) return;
    setBusy(true);
    try { await removeFriend(profile.uid, uid); await refresh(); } finally { setBusy(false); }
  };

  if (!profile) return null;
  const isSelf = profile.uid === uid;

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/friends" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Profile</h1>
          <div className="size-10" />
        </div>

        {user === undefined ? (
          <p className="mt-10 text-sm text-foreground/40">Loading…</p>
        ) : !user ? (
          <p className="mt-10 text-sm text-foreground/40">User not found.</p>
        ) : (
          <>
            <div className="mt-6 flex flex-col items-center text-center">
              <div className="size-24 rounded-full bg-secondary flex items-center justify-center text-3xl font-bold">
                {(user.name ?? user.username).charAt(0).toUpperCase()}
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight">{user.name ?? user.username}</h2>
              <p className="text-sm text-foreground/50">@{user.username}</p>
              {!isSelf && (
                friend ? (
                  <button onClick={drop} disabled={busy} className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-secondary text-foreground text-xs font-semibold disabled:opacity-50">
                    <UserMinus className="size-4" /> Remove friend
                  </button>
                ) : pending ? (
                  <span className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-secondary text-foreground/60 text-xs font-semibold">
                    <Check className="size-4" /> Request sent
                  </span>
                ) : (
                  <button onClick={add} disabled={busy} className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-black text-white text-xs font-semibold disabled:opacity-50">
                    <UserPlus className="size-4" /> Add friend
                  </button>
                )
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat l="Streak" v={String(user.stats?.currentStreak ?? user.streak ?? 0)} />
              <Stat l="Longest" v={String(user.stats?.longestStreak ?? 0)} />
              <Stat l="Workouts" v={String(user.stats?.totalWorkouts ?? 0)} />
              <Stat l="Missions" v={String(user.stats?.totalMissions ?? 0)} />
              <Stat l="Active days" v={String(user.stats?.activeDays ?? 0)} />
              <Stat l="kcal burned" v={String(user.stats?.caloriesBurned ?? 0)} />
            </div>
          </>
        )}
      </div>
    </PhoneFrame>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="surface py-4 text-center">
      <p className="text-xl font-bold tracking-tight">{v}</p>
      <p className="text-[11px] text-foreground/50 mt-0.5 font-medium">{l}</p>
    </div>
  );
}
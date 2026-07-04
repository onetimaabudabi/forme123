import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeFollowers } from "@/lib/follows";
import { getPublicUser, type PublicUser } from "@/lib/usernames";
import { UserRow } from "@/components/UserRow";

export const Route = createFileRoute("/followers/$uid")({
  head: () => ({ meta: [{ title: "Followers — Forme" }] }),
  component: FollowersScreen,
});

function FollowersScreen() {
  const { uid } = useParams({ from: "/followers/$uid" });
  const [users, setUsers] = useState<PublicUser[] | null>(null);

  useEffect(() => {
    const unsub = subscribeFollowers(uid, async (list) => {
      const hydrated = await Promise.all(list.map((f) => getPublicUser(f.uid).catch(() => null)));
      setUsers(hydrated.filter((u): u is PublicUser => !!u));
    });
    return () => unsub();
  }, [uid]);

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/u/$uid" params={{ uid }} className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Followers</h1>
          <div className="size-10" />
        </div>
        <div className="mt-5 space-y-2">
          {users === null ? <p className="text-sm text-foreground/40">Loading…</p>
            : users.length === 0 ? <p className="text-sm text-foreground/40">No followers yet.</p>
            : users.map((u) => <UserRow key={u.uid} user={u} />)}
        </div>
      </div>
    </PhoneFrame>
  );
}
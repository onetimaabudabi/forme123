import { createFileRoute, Link, useParams, useRouter } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribePostLikes } from "@/lib/social";
import { getPublicUser, type PublicUser } from "@/lib/usernames";
import { UserRow } from "@/components/UserRow";

export const Route = createFileRoute("/likes/$postId")({
  head: () => ({ meta: [{ title: "Likes — Forme" }] }),
  component: LikesScreen,
});

function LikesScreen() {
  const { postId } = useParams({ from: "/likes/$postId" });
  const router = useRouter();
  const [users, setUsers] = useState<PublicUser[] | null>(null);

  useEffect(() => {
    const unsub = subscribePostLikes(postId, async (uids) => {
      const hydrated = await Promise.all(uids.map((u) => getPublicUser(u).catch(() => null)));
      setUsers(hydrated.filter((u): u is PublicUser => !!u));
    });
    return () => unsub();
  }, [postId]);

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <button onClick={() => router.history.back()} className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></button>
          <h1 className="text-base font-semibold">Likes</h1>
          <Link to="/feed" className="size-10" />
        </div>
        <div className="mt-5 space-y-2">
          {users === null ? <p className="text-sm text-foreground/40">Loading…</p>
            : users.length === 0 ? <p className="text-sm text-foreground/40">No likes yet.</p>
            : users.map((u) => <UserRow key={u.uid} user={u} />)}
        </div>
      </div>
    </PhoneFrame>
  );
}
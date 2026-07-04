import { Link } from "@tanstack/react-router";
import { UserCheck, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { follow, subscribeIsFollowing, unfollow } from "@/lib/follows";
import type { PublicUser } from "@/lib/usernames";

export function UserRow({ user }: { user: PublicUser }) {
  const { profile } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const isSelf = profile?.uid === user.uid;

  useEffect(() => {
    if (!profile || isSelf) return;
    const unsub = subscribeIsFollowing(profile.uid, user.uid, setIsFollowing);
    return () => unsub();
  }, [profile?.uid, user.uid, isSelf]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile || isSelf || busy) return;
    setBusy(true);
    try {
      if (isFollowing) await unfollow(profile.uid, user.uid);
      else await follow(profile.uid, user.uid);
    } finally { setBusy(false); }
  };

  const display = user.name || user.username || "User";
  return (
    <Link
      to="/u/$uid"
      params={{ uid: user.uid }}
      className="surface p-3 flex items-center gap-3"
    >
      {user.photoURL ? (
        <img src={user.photoURL} alt="" className="size-11 rounded-full object-cover bg-secondary" />
      ) : (
        <div className="size-11 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
          {display.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{display}</p>
        <p className="text-xs text-foreground/50 truncate">@{user.username || "user"}</p>
      </div>
      {!isSelf && (
        <button
          onClick={toggle}
          disabled={busy}
          className={`h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1 disabled:opacity-50 ${isFollowing ? "bg-secondary text-foreground" : "bg-black text-white"}`}
        >
          {isFollowing ? <><UserCheck className="size-3.5" /> Following</> : <><UserPlus className="size-3.5" /> Follow</>}
        </button>
      )}
    </Link>
  );
}
import { collection, deleteDoc, doc, getDoc, getDocs, increment, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, writeBatch } from "firebase/firestore";
import { getDb } from "./firebase";
import { getPublicUser, type PublicUser } from "./usernames";
import { notify } from "./social";

export type FollowEdge = { uid: string; createdAt: Date };

function refs(followerId: string, followingId: string) {
  const db = getDb();
  return {
    db,
    following: doc(db, "follows", followerId, "following", followingId),
    followers: doc(db, "follows", followingId, "followers", followerId),
    followerUser: doc(db, "users", followerId),
    followingUser: doc(db, "users", followingId),
  };
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  if (!followerId || !followingId || followerId === followingId) return false;
  const { following } = refs(followerId, followingId);
  const snap = await getDoc(following);
  return snap.exists();
}

export function subscribeIsFollowing(followerId: string, followingId: string, cb: (v: boolean) => void) {
  if (!followerId || !followingId || followerId === followingId) { cb(false); return () => {}; }
  const { following } = refs(followerId, followingId);
  return onSnapshot(following, (s) => cb(s.exists()), () => cb(false));
}

export async function follow(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) throw new Error("You can't follow yourself");
  const { db, following, followers, followerUser, followingUser } = refs(followerId, followingId);
  const exists = await getDoc(following);
  if (exists.exists()) return;
  const batch = writeBatch(db);
  const now = Timestamp.now();
  batch.set(following, { uid: followingId, createdAt: now });
  batch.set(followers, { uid: followerId, createdAt: now });
  batch.set(followerUser, { followingCount: increment(1) }, { merge: true });
  batch.set(followingUser, { followersCount: increment(1) }, { merge: true });
  await batch.commit();
  void serverTimestamp;
  notify(followingId, "friend_request", { type: "follow", actorUid: followerId }).catch(() => {});
}

export async function unfollow(followerId: string, followingId: string): Promise<void> {
  const { db, following, followers, followerUser, followingUser } = refs(followerId, followingId);
  const exists = await getDoc(following);
  if (!exists.exists()) return;
  const batch = writeBatch(db);
  batch.delete(following);
  batch.delete(followers);
  batch.set(followerUser, { followingCount: increment(-1) }, { merge: true });
  batch.set(followingUser, { followersCount: increment(-1) }, { merge: true });
  await batch.commit();
}

export async function listFollowingUids(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(getDb(), "follows", uid, "following"));
  return snap.docs.map((d) => d.id);
}

export async function listFollowerUids(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(getDb(), "follows", uid, "followers"));
  return snap.docs.map((d) => d.id);
}

export function subscribeFollowing(uid: string, cb: (list: FollowEdge[]) => void, max = 500) {
  const q = query(collection(getDb(), "follows", uid, "following"), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => {
      const data = d.data() as { createdAt?: Timestamp };
      return { uid: d.id, createdAt: data.createdAt?.toDate?.() ?? new Date() };
    }));
  }, () => cb([]));
}

export function subscribeFollowers(uid: string, cb: (list: FollowEdge[]) => void, max = 500) {
  const q = query(collection(getDb(), "follows", uid, "followers"), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => {
      const data = d.data() as { createdAt?: Timestamp };
      return { uid: d.id, createdAt: data.createdAt?.toDate?.() ?? new Date() };
    }));
  }, () => cb([]));
}

/** Hydrate a set of uids into PublicUser records (in parallel). */
export async function hydrateUsers(uids: string[]): Promise<Record<string, PublicUser | null>> {
  const entries = await Promise.all(uids.map(async (u) => [u, await getPublicUser(u).catch(() => null)] as const));
  return Object.fromEntries(entries);
}

/** Denormalized followers/following counts read from users doc, with fallback to counting subcollections. */
export async function getFollowCounts(uid: string): Promise<{ followers: number; following: number }> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  const data = (snap.exists() ? (snap.data() as { followersCount?: number; followingCount?: number }) : {}) ?? {};
  return { followers: data.followersCount ?? 0, following: data.followingCount ?? 0 };
}
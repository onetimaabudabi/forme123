import { doc, getDoc, runTransaction, setDoc, collection, getDocs, limit, query, where, orderBy } from "firebase/firestore";
import { getDb } from "./firebase";

export type PublicUser = {
  uid: string;
  username: string;
  friendCode: string;
  name?: string;
  goal?: string;
  streak?: number;
  bio?: string;
  photoURL?: string;
  followersCount?: number;
  followingCount?: number;
  stats?: { totalWorkouts?: number; currentStreak?: number; longestStreak?: number; activeDays?: number; totalMissions?: number; caloriesBurned?: number };
};

const ALPHA = "abcdefghijklmnopqrstuvwxyz0123456789";

function genCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += String(Math.floor(Math.random() * 10));
  return `FRM-${s}`;
}

function normalize(u: string) {
  return u.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}

export function suggestUsername(name: string): string {
  const base = normalize(name || "user") || "user";
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `${base}${suffix}`.slice(0, 20);
}

/** Reserve a username & friend code for a user. Idempotent if user already has one. */
export async function ensureUserIdentity(uid: string, preferred?: string): Promise<{ username: string; friendCode: string }> {
  const db = getDb();
  const userRef = doc(db, "users", uid);
  const existing = await getDoc(userRef);
  const data = existing.exists() ? (existing.data() as { username?: string; friendCode?: string; name?: string }) : {};
  if (data.username && data.friendCode) {
    return { username: data.username, friendCode: data.friendCode };
  }

  // Claim a username via transaction.
  let username = normalize(preferred || data.username || "");
  if (!username) username = suggestUsername(data.name || "user");
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = attempt === 0 ? username : `${username}${Math.floor(Math.random() * 9000 + 1000)}`.slice(0, 20);
    try {
      await runTransaction(db, async (tx) => {
        const claimRef = doc(db, "usernames", candidate);
        const claim = await tx.get(claimRef);
        if (claim.exists() && (claim.data() as { uid: string }).uid !== uid) {
          throw new Error("taken");
        }
        tx.set(claimRef, { uid });
        tx.set(userRef, { username: candidate }, { merge: true });
      });
      username = candidate;
      break;
    } catch {
      if (attempt === 5) throw new Error("Could not allocate username");
    }
  }

  // Friend code (collisions extremely unlikely; retry a few times anyway).
  let friendCode = data.friendCode ?? "";
  if (!friendCode) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const candidate = genCode();
      try {
        await runTransaction(db, async (tx) => {
          const ref = doc(db, "friend_codes", candidate);
          const snap = await tx.get(ref);
          if (snap.exists()) throw new Error("taken");
          tx.set(ref, { uid });
          tx.set(userRef, { friendCode: candidate }, { merge: true });
        });
        friendCode = candidate;
        break;
      } catch {
        if (attempt === 5) throw new Error("Could not allocate friend code");
      }
    }
  }

  return { username, friendCode };
}

/** Resolve a username → uid. */
export async function resolveUsername(username: string): Promise<string | null> {
  const u = normalize(username);
  if (!u) return null;
  const snap = await getDoc(doc(getDb(), "usernames", u));
  return snap.exists() ? (snap.data() as { uid: string }).uid : null;
}

export async function resolveFriendCode(code: string): Promise<string | null> {
  const c = code.trim().toUpperCase();
  if (!/^FRM-\d{6}$/.test(c)) return null;
  const snap = await getDoc(doc(getDb(), "friend_codes", c));
  return snap.exists() ? (snap.data() as { uid: string }).uid : null;
}

/** Validate that a candidate username is available (or already owned by the same uid). */
export async function isUsernameAvailable(candidate: string, uid?: string): Promise<boolean> {
  const u = normalize(candidate);
  if (!u || u.length < 3) return false;
  const snap = await getDoc(doc(getDb(), "usernames", u));
  if (!snap.exists()) return true;
  return uid ? (snap.data() as { uid: string }).uid === uid : false;
}

/** Change a user's username. Frees the previous claim; throws if taken. */
export async function changeUsername(uid: string, next: string): Promise<string> {
  const db = getDb();
  const u = normalize(next);
  if (!u || u.length < 3) throw new Error("Username must be at least 3 letters/numbers");
  const userRef = doc(db, "users", uid);
  const current = (await getDoc(userRef)).data() as { username?: string } | undefined;
  if (current?.username === u) return u;
  await runTransaction(db, async (tx) => {
    const claim = await tx.get(doc(db, "usernames", u));
    if (claim.exists() && (claim.data() as { uid: string }).uid !== uid) throw new Error("Username is already taken");
    tx.set(doc(db, "usernames", u), { uid });
    tx.set(userRef, { username: u }, { merge: true });
    if (current?.username && current.username !== u) {
      tx.delete(doc(db, "usernames", current.username));
    }
  });
  return u;
}

function toPublic(uid: string, data: Record<string, unknown>): PublicUser {
  return {
    uid,
    username: (data.username as string) ?? "",
    friendCode: (data.friendCode as string) ?? "",
    name: data.name as string | undefined,
    goal: data.goal as string | undefined,
    streak: data.streak as number | undefined,
    bio: data.bio as string | undefined,
    photoURL: data.photoURL as string | undefined,
    followersCount: data.followersCount as number | undefined,
    followingCount: data.followingCount as number | undefined,
    stats: data.stats as PublicUser["stats"],
  };
}

export async function getPublicUser(uid: string): Promise<PublicUser | null> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  if (!snap.exists()) return null;
  return toPublic(uid, snap.data() as Record<string, unknown>);
}

/** Username prefix search. Requires `username` field; uses range query. */
export async function searchUsers(q: string, max = 20): Promise<PublicUser[]> {
  const term = normalize(q);
  if (!term) return [];
  // Friend code shortcut
  if (/^frm-?\d{6}$/i.test(q.trim())) {
    const uid = await resolveFriendCode(q);
    if (!uid) return [];
    const u = await getPublicUser(uid);
    return u ? [u] : [];
  }
  const db = getDb();
  const ref = collection(db, "users");
  const qq = query(ref, where("username", ">=", term), where("username", "<=", term + "\uf8ff"), orderBy("username"), limit(max));
  const snap = await getDocs(qq);
  return snap.docs.map((d) => toPublic(d.id, d.data() as Record<string, unknown>));
}

export { ALPHA };
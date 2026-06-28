import { addDoc, collection, doc, getDocs, limit, orderBy, query, Timestamp, updateDoc, where, increment, setDoc, getDoc } from "firebase/firestore";
import { getDb } from "./firebase";

export type FeedItemType =
  | "workout_completed"
  | "mission_completed"
  | "streak_milestone"
  | "achievement_unlocked"
  | "weight_goal"
  | "measurement_milestone";

export type FeedItem = {
  id: string;
  uid: string;
  type: FeedItemType;
  payload: Record<string, unknown>;
  createdAt: Date;
};

export async function postActivity(uid: string, type: FeedItemType, payload: Record<string, unknown> = {}): Promise<void> {
  await addDoc(collection(getDb(), "activity_feed"), {
    uid, type, payload, createdAt: Timestamp.now(),
  });
}

/**
 * Reads feed items by a list of friend uids. Firestore `in` queries cap at 30 values,
 * so chunk if needed.
 */
export async function getFriendsFeed(uids: string[], max = 50): Promise<FeedItem[]> {
  if (uids.length === 0) return [];
  const db = getDb();
  const chunks: string[][] = [];
  for (let i = 0; i < uids.length; i += 30) chunks.push(uids.slice(i, i + 30));
  const all: FeedItem[] = [];
  for (const c of chunks) {
    const q = query(collection(db, "activity_feed"),
      where("uid", "in", c), orderBy("createdAt", "desc"), limit(max));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      const data = d.data() as { uid: string; type: FeedItemType; payload: Record<string, unknown>; createdAt: Timestamp };
      all.push({ id: d.id, uid: data.uid, type: data.type, payload: data.payload ?? {}, createdAt: data.createdAt.toDate() });
    }
  }
  all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return all.slice(0, max);
}

// ---------- Notifications ----------

export type NotificationType =
  | "friend_request"
  | "friend_accepted"
  | "achievement_unlocked"
  | "mission_available"
  | "workout_reminder"
  | "meal_reminder"
  | "streak_warning"
  | "leaderboard_update";

export type Notification = {
  id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
};

export async function notify(uid: string, type: NotificationType, payload: Record<string, unknown> = {}): Promise<void> {
  await addDoc(collection(getDb(), "notifications", uid, "items"), {
    type, payload, read: false, createdAt: Timestamp.now(),
  });
}

export async function listNotifications(uid: string, max = 50): Promise<Notification[]> {
  const q = query(collection(getDb(), "notifications", uid, "items"),
    orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as { type: NotificationType; payload: Record<string, unknown>; read: boolean; createdAt: Timestamp };
    return { id: d.id, type: data.type, payload: data.payload ?? {}, read: !!data.read, createdAt: data.createdAt.toDate() };
  });
}

export async function markNotificationRead(uid: string, id: string) {
  await updateDoc(doc(getDb(), "notifications", uid, "items", id), { read: true });
}

// ---------- Denormalized stats ----------

export type UserStats = {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  totalMissions: number;
  caloriesBurned: number;
};

export async function bumpStat(uid: string, field: keyof UserStats, by = 1) {
  const ref = doc(getDb(), "users", uid);
  await setDoc(ref, { stats: { [field]: increment(by) } }, { merge: true });
}

export async function setStat(uid: string, field: keyof UserStats, value: number) {
  await setDoc(doc(getDb(), "users", uid), { stats: { [field]: value } }, { merge: true });
}

export async function getUserStats(uid: string): Promise<UserStats> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  const data = snap.exists() ? (snap.data() as { stats?: Partial<UserStats> }) : {};
  const s = data.stats ?? {};
  return {
    totalWorkouts: s.totalWorkouts ?? 0,
    currentStreak: s.currentStreak ?? 0,
    longestStreak: s.longestStreak ?? 0,
    activeDays: s.activeDays ?? 0,
    totalMissions: s.totalMissions ?? 0,
    caloriesBurned: s.caloriesBurned ?? 0,
  };
}
import { addDoc, collection, doc, getDocs, limit, onSnapshot, orderBy, query, Timestamp, updateDoc, where, increment, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getBucket, getDb } from "./firebase";

export type FeedItemType =
  | "workout_completed"
  | "mission_completed"
  | "streak_milestone"
  | "achievement_unlocked"
  | "weight_goal"
  | "measurement_milestone"
  | "post";

export type FeedItem = {
  id: string;
  uid: string;
  type: FeedItemType;
  payload: Record<string, unknown>;
  createdAt: Date;
  likesCount?: number;
  commentsCount?: number;
};

export async function postActivity(uid: string, type: FeedItemType, payload: Record<string, unknown> = {}): Promise<void> {
  await addDoc(collection(getDb(), "activity_feed"), {
    uid, type, payload, createdAt: Timestamp.now(), likesCount: 0, commentsCount: 0,
  });
}

// ---------- Real-time feed ----------

/**
 * Real-time subscription to the newest activity_feed items, filtered client-side
 * to the given uids. Avoids requiring a composite (uid IN + createdAt) index.
 * Returns an unsubscribe function.
 */
export function subscribeFeed(uids: string[], onItems: (items: FeedItem[]) => void, max = 100) {
  const q = query(collection(getDb(), "activity_feed"), orderBy("createdAt", "desc"), limit(max));
  const set = new Set(uids);
  return onSnapshot(q, (snap) => {
    const items: FeedItem[] = [];
    for (const d of snap.docs) {
      const data = d.data() as { uid: string; type: FeedItemType; payload: Record<string, unknown>; createdAt: Timestamp; likesCount?: number; commentsCount?: number };
      if (!set.has(data.uid)) continue;
      items.push({
        id: d.id, uid: data.uid, type: data.type,
        payload: data.payload ?? {},
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        likesCount: data.likesCount ?? 0,
        commentsCount: data.commentsCount ?? 0,
      });
    }
    onItems(items);
  }, (err) => {
    console.error("subscribeFeed error", err);
    onItems([]);
  });
}

// ---------- Posts (text + media) ----------

export type MediaKind = "image" | "video";
export type PostMedia = { kind: MediaKind; url: string };

async function uploadOne(uid: string, file: File): Promise<PostMedia> {
  const kind: MediaKind = file.type.startsWith("video") ? "video" : "image";
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `posts/${uid}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;
  const r = storageRef(getBucket(), path);
  await uploadBytes(r, file, { contentType: file.type || undefined });
  const url = await getDownloadURL(r);
  return { kind, url };
}

export async function createPost(uid: string, text: string, files: File[] = []): Promise<string> {
  const photos: string[] = [];
  let video: string | null = null;
  for (const f of files) {
    const m = await uploadOne(uid, f);
    if (m.kind === "video" && !video) video = m.url;
    else if (m.kind === "image") photos.push(m.url);
  }
  const payload: Record<string, unknown> = { text: text.trim() };
  if (photos.length) payload.photos = photos;
  if (video) payload.video = video;
  const ref = await addDoc(collection(getDb(), "activity_feed"), {
    uid, type: "post" as FeedItemType, payload,
    createdAt: Timestamp.now(), likesCount: 0, commentsCount: 0,
  });
  return ref.id;
}

// ---------- Likes ----------

export async function toggleLike(postId: string, uid: string): Promise<boolean> {
  const db = getDb();
  const likeRef = doc(db, "activity_feed", postId, "likes", uid);
  const postRef = doc(db, "activity_feed", postId);
  const snap = await getDoc(likeRef);
  if (snap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(postRef, { likesCount: increment(-1) }).catch(() => {});
    return false;
  }
  await setDoc(likeRef, { createdAt: Timestamp.now() });
  await updateDoc(postRef, { likesCount: increment(1) }).catch(() => {});
  return true;
}

export async function hasLiked(postId: string, uid: string): Promise<boolean> {
  const snap = await getDoc(doc(getDb(), "activity_feed", postId, "likes", uid));
  return snap.exists();
}

// ---------- Comments ----------

export type Comment = { id: string; uid: string; text: string; createdAt: Date };

export function subscribeComments(postId: string, cb: (comments: Comment[]) => void) {
  const q = query(collection(getDb(), "activity_feed", postId, "comments"), orderBy("createdAt", "asc"), limit(200));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => {
      const data = d.data() as { uid: string; text: string; createdAt: Timestamp };
      return { id: d.id, uid: data.uid, text: data.text, createdAt: data.createdAt?.toDate?.() ?? new Date() };
    }));
  }, () => cb([]));
}

export async function addComment(postId: string, uid: string, text: string): Promise<void> {
  const t = text.trim();
  if (!t) return;
  await addDoc(collection(getDb(), "activity_feed", postId, "comments"), {
    uid, text: t, createdAt: Timestamp.now(),
  });
  await updateDoc(doc(getDb(), "activity_feed", postId), { commentsCount: increment(1) }).catch(() => {});
  // touch to bump activity
  void serverTimestamp;
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await deleteDoc(doc(getDb(), "activity_feed", postId, "comments", commentId));
  await updateDoc(doc(getDb(), "activity_feed", postId), { commentsCount: increment(-1) }).catch(() => {});
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
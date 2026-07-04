import { addDoc, collection, doc, getDocs, limit, onSnapshot, orderBy, query, Timestamp, updateDoc, where, increment, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "./firebase";
import { getPublicUser } from "./usernames";

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

/** Real-time subscription to ALL public activity_feed items (Discover). */
export function subscribeDiscoverFeed(onItems: (items: FeedItem[]) => void, max = 100) {
  const q = query(collection(getDb(), "activity_feed"), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => {
    const items: FeedItem[] = snap.docs.map((d) => {
      const data = d.data() as { uid: string; type: FeedItemType; payload: Record<string, unknown>; createdAt: Timestamp; likesCount?: number; commentsCount?: number };
      return {
        id: d.id, uid: data.uid, type: data.type,
        payload: data.payload ?? {},
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        likesCount: data.likesCount ?? 0,
        commentsCount: data.commentsCount ?? 0,
      };
    });
    onItems(items);
  }, (err) => { console.error("subscribeDiscoverFeed error", err); onItems([]); });
}

/** Real-time subscription to a single user's posts (all activity_feed items). */
export function subscribeUserPosts(uid: string, onItems: (items: FeedItem[]) => void, max = 200) {
  const q = query(collection(getDb(), "activity_feed"), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => {
    onItems(snap.docs.map((d) => {
      const data = d.data() as { uid: string; type: FeedItemType; payload: Record<string, unknown>; createdAt: Timestamp; likesCount?: number; commentsCount?: number };
      return {
        id: d.id, uid: data.uid, type: data.type,
        payload: data.payload ?? {},
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        likesCount: data.likesCount ?? 0,
        commentsCount: data.commentsCount ?? 0,
      };
    }));
  }, () => onItems([]));
}

/** Real-time subscription to a single post document. */
export function subscribePost(postId: string, cb: (item: FeedItem | null) => void) {
  return onSnapshot(doc(getDb(), "activity_feed", postId), (snap) => {
    if (!snap.exists()) { cb(null); return; }
    const data = snap.data() as { uid: string; type: FeedItemType; payload: Record<string, unknown>; createdAt: Timestamp; likesCount?: number; commentsCount?: number };
    cb({
      id: snap.id, uid: data.uid, type: data.type,
      payload: data.payload ?? {},
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      likesCount: data.likesCount ?? 0,
      commentsCount: data.commentsCount ?? 0,
    });
  }, () => cb(null));
}

/** Real-time subscription to the users who liked a post. */
export function subscribePostLikes(postId: string, cb: (uids: string[]) => void, max = 200) {
  const q = query(collection(getDb(), "activity_feed", postId, "likes"), limit(max));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.id)), () => cb([]));
}

// ---------- Posts (text + media) ----------

export type MediaKind = "image" | "video";
export type PostMedia = { kind: MediaKind; url: string };

// ---------- Cloudinary upload ----------

function uploadToCloudinary(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<PostMedia> {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;
  if (!cloud || !preset) {
    return Promise.reject(new Error("Cloudinary is not configured"));
  }
  const kind: MediaKind = file.type.startsWith("video") ? "video" : "image";
  const url = `https://api.cloudinary.com/v1_1/${cloud}/${kind === "video" ? "video" : "image"}/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  return new Promise<PostMedia>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText) as { secure_url?: string; error?: { message?: string } };
        if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
          resolve({ kind, url: res.secure_url });
        } else {
          reject(new Error(res.error?.message || `Upload failed (${xhr.status})`));
        }
      } catch {
        reject(new Error("Invalid upload response"));
      }
    };
    xhr.send(form);
  });
}

export async function createPost(
  uid: string,
  text: string,
  files: File[] = [],
  onProgress?: (pct: number) => void,
): Promise<string> {
  const photos: string[] = [];
  let video: string | null = null;
  const total = files.length;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const m = await uploadToCloudinary(f, (pct) => {
      if (!onProgress) return;
      const overall = Math.round(((i + pct / 100) / Math.max(total, 1)) * 100);
      onProgress(overall);
    });
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

function postPreview(item: { type: FeedItemType; payload: Record<string, unknown> }): { text?: string; photo?: string } {
  const p = item.payload ?? {};
  const text = ((p.text as string | undefined) ?? (p.caption as string | undefined) ?? "").slice(0, 80);
  const photos = p.photos as string[] | undefined;
  return { text: text || undefined, photo: photos?.[0] };
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
  // Notify post owner (not self-likes).
  try {
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const p = postSnap.data() as { uid: string; type: FeedItemType; payload: Record<string, unknown> };
      if (p.uid && p.uid !== uid) {
        const actor = await getPublicUser(uid).catch(() => null);
        const preview = postPreview(p);
        await notify(p.uid, "post_like", {
          postId,
          actorUid: uid,
          actorName: actor?.name ?? null,
          actorUsername: actor?.username ?? null,
          previewText: preview.text ?? null,
          previewPhoto: preview.photo ?? null,
        });
      }
    }
  } catch { /* non-fatal */ }
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
  void serverTimestamp;
  // Notify post owner (not self-comments).
  try {
    const postSnap = await getDoc(doc(getDb(), "activity_feed", postId));
    if (postSnap.exists()) {
      const p = postSnap.data() as { uid: string; type: FeedItemType; payload: Record<string, unknown> };
      if (p.uid && p.uid !== uid) {
        const actor = await getPublicUser(uid).catch(() => null);
        const preview = postPreview(p);
        await notify(p.uid, "post_comment", {
          postId,
          actorUid: uid,
          actorName: actor?.name ?? null,
          actorUsername: actor?.username ?? null,
          commentText: t.slice(0, 120),
          previewText: preview.text ?? null,
          previewPhoto: preview.photo ?? null,
        });
      }
    }
  } catch { /* non-fatal */ }
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
  | "leaderboard_update"
  | "post_like"
  | "post_comment";

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

export function subscribeNotifications(uid: string, cb: (items: Notification[]) => void, max = 50) {
  const q = query(collection(getDb(), "notifications", uid, "items"),
    orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => {
      const data = d.data() as { type: NotificationType; payload: Record<string, unknown>; read: boolean; createdAt: Timestamp };
      return { id: d.id, type: data.type, payload: data.payload ?? {}, read: !!data.read, createdAt: data.createdAt?.toDate?.() ?? new Date() };
    }));
  }, () => cb([]));
}

export function subscribeUnreadCount(uid: string, cb: (n: number) => void) {
  const q = query(collection(getDb(), "notifications", uid, "items"), where("read", "==", false), limit(100));
  return onSnapshot(q, (snap) => cb(snap.size), () => cb(0));
}

export async function markAllNotificationsRead(uid: string): Promise<void> {
  const q = query(collection(getDb(), "notifications", uid, "items"), where("read", "==", false), limit(200));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true }).catch(() => {})));
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
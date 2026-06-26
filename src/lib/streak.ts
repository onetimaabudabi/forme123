import { doc, getDoc, increment, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "./firebase";

function ymd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isYesterday(prev: string) {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return ymd(d) === prev;
}

/**
 * Apply daily mission completion. Increments streak if first completion today;
 * resets to 1 if previous activity was older than yesterday.
 * Returns new streak value.
 */
export async function applyDailyCompletion(uid: string): Promise<number> {
  const db = getDb();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;
  const data = snap.data() as { streak?: number; lastCompletedAt?: string };
  const today = ymd();
  if (data.lastCompletedAt === today) return data.streak ?? 0;
  let next = 1;
  if (data.lastCompletedAt && isYesterday(data.lastCompletedAt)) {
    next = (data.streak ?? 0) + 1;
  }
  await updateDoc(ref, { streak: next, lastCompletedAt: today });
  return next;
}

/** Undo today's completion (if user un-toggles). Decrements streak by 1 minimum 0. */
export async function undoDailyCompletion(uid: string): Promise<number> {
  const db = getDb();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;
  const data = snap.data() as { streak?: number; lastCompletedAt?: string };
  const today = ymd();
  if (data.lastCompletedAt !== today) return data.streak ?? 0;
  const next = Math.max(0, (data.streak ?? 1) - 1);
  await updateDoc(ref, { streak: next, lastCompletedAt: null });
  return next;
}

export async function recordFirstLogin(uid: string) {
  const db = getDb();
  const ref = doc(db, "users", uid);
  await setDoc(ref, { lastLoginAt: serverTimestamp() }, { merge: true });
  // increment counter for "First Login" tracking
  await updateDoc(ref, { loginCount: increment(1) }).catch(() => {});
}
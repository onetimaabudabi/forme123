import { addDoc, collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { getDb } from "./firebase";

export type SleepEntry = {
  id: string;
  uid: string;
  hours: number;
  quality?: number | null; // 1-5
  bedtime?: string | null;   // HH:MM
  wakeTime?: string | null;  // HH:MM
  createdAt: Date;
};

export async function logSleep(
  uid: string,
  hours: number,
  opts?: { quality?: number | null; bedtime?: string | null; wakeTime?: string | null },
) {
  await addDoc(collection(getDb(), "sleep"), {
    uid,
    hours,
    quality: opts?.quality ?? null,
    bedtime: opts?.bedtime ?? null,
    wakeTime: opts?.wakeTime ?? null,
    createdAt: Timestamp.now(),
  });
}

function fromDoc(id: string, data: { uid: string; hours: number; quality?: number | null; bedtime?: string | null; wakeTime?: string | null; createdAt: Timestamp }): SleepEntry {
  return { id, uid: data.uid, hours: data.hours, quality: data.quality ?? null, bedtime: data.bedtime ?? null, wakeTime: data.wakeTime ?? null, createdAt: data.createdAt.toDate() };
}

export async function listSleep(uid: string, max = 60): Promise<SleepEntry[]> {
  const q = query(collection(getDb(), "sleep"), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.id, d.data() as Parameters<typeof fromDoc>[1]));
}

export function subscribeSleep(uid: string, cb: (items: SleepEntry[]) => void): () => void {
  const q = query(collection(getDb(), "sleep"), where("uid", "==", uid), limit(200));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => fromDoc(d.id, d.data() as Parameters<typeof fromDoc>[1]));
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    cb(items);
  });
}

export async function updateSleep(id: string, patch: Partial<Pick<SleepEntry, "hours" | "quality" | "bedtime" | "wakeTime">>) {
  const clean: Record<string, unknown> = {};
  if (patch.hours !== undefined) clean.hours = patch.hours;
  if (patch.quality !== undefined) clean.quality = patch.quality ?? null;
  if (patch.bedtime !== undefined) clean.bedtime = patch.bedtime ?? null;
  if (patch.wakeTime !== undefined) clean.wakeTime = patch.wakeTime ?? null;
  await updateDoc(doc(getDb(), "sleep", id), clean);
}

export async function deleteSleep(id: string) {
  await deleteDoc(doc(getDb(), "sleep", id));
}
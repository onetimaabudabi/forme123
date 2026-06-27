import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";
import { getDb } from "./firebase";

export type SleepEntry = {
  id: string;
  uid: string;
  hours: number;
  quality?: "poor" | "ok" | "good" | "great";
  bedtime?: string | null;   // HH:MM
  wakeTime?: string | null;  // HH:MM
  createdAt: Date;
};

export async function logSleep(
  uid: string,
  hours: number,
  opts?: { quality?: SleepEntry["quality"]; bedtime?: string | null; wakeTime?: string | null },
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

export async function listSleep(uid: string, max = 14): Promise<SleepEntry[]> {
  const q = query(
    collection(getDb(), "sleep"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as { uid: string; hours: number; quality?: SleepEntry["quality"]; bedtime?: string | null; wakeTime?: string | null; createdAt: Timestamp };
    return { id: d.id, uid: data.uid, hours: data.hours, quality: data.quality, bedtime: data.bedtime ?? null, wakeTime: data.wakeTime ?? null, createdAt: data.createdAt.toDate() };
  });
}

export async function deleteSleep(id: string) {
  await deleteDoc(doc(getDb(), "sleep", id));
}
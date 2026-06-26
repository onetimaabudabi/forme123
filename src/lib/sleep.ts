import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";
import { getDb } from "./firebase";

export type SleepEntry = {
  id: string;
  uid: string;
  hours: number;
  quality?: "poor" | "ok" | "good" | "great";
  createdAt: Date;
};

export async function logSleep(uid: string, hours: number, quality?: SleepEntry["quality"]) {
  await addDoc(collection(getDb(), "sleep"), {
    uid,
    hours,
    quality: quality ?? null,
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
    const data = d.data() as { uid: string; hours: number; quality?: SleepEntry["quality"]; createdAt: Timestamp };
    return { id: d.id, uid: data.uid, hours: data.hours, quality: data.quality, createdAt: data.createdAt.toDate() };
  });
}

export async function deleteSleep(id: string) {
  await deleteDoc(doc(getDb(), "sleep", id));
}
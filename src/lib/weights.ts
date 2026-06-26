import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { getDb } from "./firebase";

export type WeightEntry = { id: string; uid: string; weight: number; createdAt: Date };

export async function logWeight(uid: string, weight: number) {
  await addDoc(collection(getDb(), "weights"), { uid, weight, createdAt: Timestamp.now() });
  await updateDoc(doc(getDb(), "users", uid), { weight });
}

export async function getLatestWeight(uid: string): Promise<number | null> {
  const q = query(collection(getDb(), "weights"), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return (snap.docs[0].data().weight as number) ?? null;
}

export async function listWeights(uid: string, max = 60): Promise<WeightEntry[]> {
  const q = query(collection(getDb(), "weights"), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as { uid: string; weight: number; createdAt: Timestamp };
    return { id: d.id, uid: data.uid, weight: data.weight, createdAt: data.createdAt.toDate() };
  });
}

export async function deleteWeight(id: string) {
  await deleteDoc(doc(getDb(), "weights", id));
}

export async function updateWeight(id: string, weight: number, uid?: string) {
  await updateDoc(doc(getDb(), "weights", id), { weight });
  if (uid) await updateDoc(doc(getDb(), "users", uid), { weight });
}
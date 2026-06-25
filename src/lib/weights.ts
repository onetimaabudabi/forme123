import { addDoc, collection, getDocs, limit, orderBy, query, where, Timestamp } from "firebase/firestore";
import { getDb } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function logWeight(uid: string, weight: number) {
  await addDoc(collection(getDb(), "weights"), {
    uid,
    weight,
    createdAt: Timestamp.now(),
  });
  await updateDoc(doc(getDb(), "users", uid), { weight });
}

export async function getLatestWeight(uid: string): Promise<number | null> {
  const q = query(collection(getDb(), "weights"), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return (snap.docs[0].data().weight as number) ?? null;
}
import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";
import { getDb } from "./firebase";

export type MeasurementKey = "chest" | "waist" | "arms" | "hips" | "legs";

export type Measurement = {
  id: string;
  uid: string;
  chest?: number;
  waist?: number;
  arms?: number;
  hips?: number;
  legs?: number;
  createdAt: Date;
};

export async function addMeasurement(uid: string, m: Partial<Record<MeasurementKey, number>>): Promise<void> {
  await addDoc(collection(getDb(), "measurements"), {
    uid,
    ...m,
    createdAt: Timestamp.now(),
  });
}

export async function listMeasurements(uid: string, max = 50): Promise<Measurement[]> {
  const q = query(
    collection(getDb(), "measurements"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown> & { createdAt: Timestamp };
    return {
      id: d.id,
      uid,
      chest: data.chest as number | undefined,
      waist: data.waist as number | undefined,
      arms: data.arms as number | undefined,
      hips: data.hips as number | undefined,
      legs: data.legs as number | undefined,
      createdAt: data.createdAt.toDate(),
    };
  });
}

export async function deleteMeasurement(id: string) {
  await deleteDoc(doc(getDb(), "measurements", id));
}
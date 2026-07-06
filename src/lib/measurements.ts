import { addDoc, collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { getDb } from "./firebase";

export type MeasurementKey =
  | "chest"
  | "waist"
  | "hips"
  | "neck"
  | "leftArm"
  | "rightArm"
  | "leftThigh"
  | "rightThigh";

export type Measurement = {
  id: string;
  uid: string;
  chest?: number;
  waist?: number;
  hips?: number;
  neck?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  createdAt: Date;
};

export async function addMeasurement(uid: string, m: Partial<Record<MeasurementKey, number>>): Promise<void> {
  await addDoc(collection(getDb(), "measurements"), {
    uid,
    ...m,
    createdAt: Timestamp.now(),
  });
}

function fromDoc(id: string, uid: string, data: Record<string, unknown> & { createdAt: Timestamp }): Measurement {
  const num = (k: string) => (typeof data[k] === "number" ? (data[k] as number) : undefined);
  return {
    id,
    uid,
    chest: num("chest"),
    waist: num("waist"),
    hips: num("hips"),
    neck: num("neck"),
    leftArm: num("leftArm") ?? num("arms"),
    rightArm: num("rightArm"),
    leftThigh: num("leftThigh") ?? num("legs"),
    rightThigh: num("rightThigh"),
    createdAt: data.createdAt.toDate(),
  };
}

export async function listMeasurements(uid: string, max = 50): Promise<Measurement[]> {
  const q = query(collection(getDb(), "measurements"), where("uid", "==", uid), limit(max));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => fromDoc(d.id, uid, d.data() as Record<string, unknown> & { createdAt: Timestamp }));
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return items;
}

export function subscribeMeasurements(uid: string, cb: (items: Measurement[]) => void): () => void {
  const q = query(collection(getDb(), "measurements"), where("uid", "==", uid), limit(200));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => fromDoc(d.id, uid, d.data() as Record<string, unknown> & { createdAt: Timestamp }));
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    cb(items);
  });
}

export async function updateMeasurement(id: string, patch: Partial<Record<MeasurementKey, number | null>>) {
  const clean: Record<string, number | null> = {};
  for (const [k, v] of Object.entries(patch)) clean[k] = v === null || v === undefined ? null : Number(v);
  await updateDoc(doc(getDb(), "measurements", id), clean);
}

export async function deleteMeasurement(id: string) {
  await deleteDoc(doc(getDb(), "measurements", id));
}

export async function listMeasurementsAsc(uid: string, max = 200): Promise<Measurement[]> {
  const items = await listMeasurements(uid, max);
  return items.reverse();
}

// Re-order for consistent orderBy elsewhere (kept exported for potential future use).
export const _orderRef = { orderBy, Timestamp };
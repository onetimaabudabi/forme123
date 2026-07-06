import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { getDb } from "./firebase";

export type NutritionEntry = {
  id: string;
  uid: string;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  mealTime?: string | null; // HH:MM
  notes?: string | null;
  createdAt: Date;
};

function startOfToday(): Date {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d;
}

export async function addNutrition(uid: string, entry: Omit<NutritionEntry, "id" | "uid" | "createdAt">) {
  await addDoc(collection(getDb(), "nutrition"), {
    uid,
    ...entry,
    mealTime: entry.mealTime ?? null,
    notes: entry.notes ?? null,
    createdAt: Timestamp.now(),
  });
}

export async function updateNutrition(id: string, patch: Partial<Omit<NutritionEntry, "id" | "uid" | "createdAt">>) {
  const clean: Record<string, unknown> = { ...patch };
  if ("mealTime" in patch) clean.mealTime = patch.mealTime ?? null;
  if ("notes" in patch) clean.notes = patch.notes ?? null;
  await updateDoc(doc(getDb(), "nutrition", id), clean);
}

function fromDoc(id: string, data: Omit<NutritionEntry, "id" | "createdAt"> & { createdAt: Timestamp }): NutritionEntry {
  return {
    id,
    uid: data.uid,
    meal: data.meal,
    name: data.name,
    kcal: data.kcal,
    protein: data.protein,
    carbs: data.carbs,
    fat: data.fat,
    mealTime: data.mealTime ?? null,
    notes: data.notes ?? null,
    createdAt: data.createdAt.toDate(),
  };
}

export async function listTodayNutrition(uid: string): Promise<NutritionEntry[]> {
  const start = Timestamp.fromDate(startOfToday());
  const q = query(
    collection(getDb(), "nutrition"),
    where("uid", "==", uid),
    where("createdAt", ">=", start),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.id, d.data() as Parameters<typeof fromDoc>[1]));
}

export function subscribeTodayNutrition(uid: string, cb: (items: NutritionEntry[]) => void): () => void {
  // Avoid composite index requirement — client filters by day.
  const q = query(collection(getDb(), "nutrition"), where("uid", "==", uid));
  return onSnapshot(q, (snap) => {
    const start = startOfToday().getTime();
    const items = snap.docs
      .map((d) => fromDoc(d.id, d.data() as Parameters<typeof fromDoc>[1]))
      .filter((n) => n.createdAt.getTime() >= start)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    cb(items);
  });
}

export async function deleteNutrition(id: string) {
  await deleteDoc(doc(getDb(), "nutrition", id));
}

// Water tracking — counts of 250ml glasses today
export type WaterEntry = { id: string; uid: string; ml: number; createdAt: Date };

export async function addWater(uid: string, ml: number) {
  await addDoc(collection(getDb(), "water"), { uid, ml, createdAt: Timestamp.now() });
}

export function subscribeTodayWater(uid: string, cb: (ml: number) => void): () => void {
  const q = query(collection(getDb(), "water"), where("uid", "==", uid));
  return onSnapshot(q, (snap) => {
    const start = startOfToday().getTime();
    const ml = snap.docs.reduce((acc, d) => {
      const data = d.data() as { ml: number; createdAt: Timestamp };
      return data.createdAt.toDate().getTime() >= start ? acc + (data.ml || 0) : acc;
    }, 0);
    cb(ml);
  });
}

export async function listTodayWater(uid: string): Promise<WaterEntry[]> {
  const start = Timestamp.fromDate(startOfToday());
  const q = query(
    collection(getDb(), "water"),
    where("uid", "==", uid),
    where("createdAt", ">=", start),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as { uid: string; ml: number; createdAt: Timestamp };
    return { id: d.id, uid: data.uid, ml: data.ml, createdAt: data.createdAt.toDate() };
  });
}
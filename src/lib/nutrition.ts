import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
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
  createdAt: Date;
};

function startOfToday(): Date {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d;
}

export async function addNutrition(uid: string, entry: Omit<NutritionEntry, "id" | "uid" | "createdAt">) {
  await addDoc(collection(getDb(), "nutrition"), { uid, ...entry, createdAt: Timestamp.now() });
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
  return snap.docs.map((d) => {
    const data = d.data() as Omit<NutritionEntry, "id"> & { createdAt: Timestamp };
    return {
      id: d.id,
      uid: data.uid,
      meal: data.meal,
      name: data.name,
      kcal: data.kcal,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      createdAt: data.createdAt.toDate(),
    };
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
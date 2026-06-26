import { addDoc, collection, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";
import { getDb } from "./firebase";
import { groqJSON, type GroqMessage } from "./groq";
import type { UserProfile } from "./auth";

export type Meal = { name: string; title: string; description: string; kcal: number; protein: number; carbs: number; fat: number };
export type MealPlan = {
  id: string;
  uid: string;
  title: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
  createdAt: Date;
};

export async function generateMealPlan(profile: UserProfile): Promise<MealPlan> {
  const goalLabel: Record<string, string> = {
    weight_loss: "modest calorie deficit, high protein",
    muscle_gain: "calorie surplus, very high protein",
    maintain: "maintenance calories, balanced macros",
  };
  const sys: GroqMessage = {
    role: "system",
    content: "You design daily meal plans. Always return STRICT JSON only, no markdown.",
  };
  const user: GroqMessage = {
    role: "user",
    content: `Design ONE daily meal plan for ${profile.age}yo ${profile.gender}, ${profile.height}cm, ${profile.weight}kg, goal: ${goalLabel[profile.goal]}.
Return JSON: {"title": string, "kcal": number, "protein": number, "carbs": number, "fat": number, "meals":[{"name": "Breakfast"|"Lunch"|"Dinner"|"Snack","title": string, "description": string, "kcal": number, "protein": number, "carbs": number, "fat": number}]}
Exactly 4 meals: Breakfast, Lunch, Snack, Dinner. Be varied — do not repeat previous days. Use realistic everyday foods.`,
  };
  const parsed = await groqJSON<Omit<MealPlan, "id" | "uid" | "createdAt">>([sys, user]);
  const db = getDb();
  const ref = await addDoc(collection(db, "meal_plans"), { uid: profile.uid, ...parsed, createdAt: Timestamp.now() });
  return { id: ref.id, uid: profile.uid, ...parsed, createdAt: new Date() };
}

export async function getLatestMealPlan(uid: string): Promise<MealPlan | null> {
  const q = query(collection(getDb(), "meal_plans"), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data() as Omit<MealPlan, "id"> & { createdAt: Timestamp };
  return {
    id: d.id,
    uid: data.uid,
    title: data.title,
    kcal: data.kcal,
    protein: data.protein,
    carbs: data.carbs,
    fat: data.fat,
    meals: data.meals,
    createdAt: data.createdAt.toDate(),
  };
}
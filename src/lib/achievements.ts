import { collection, doc, getDocs, query, setDoc, Timestamp, where } from "firebase/firestore";
import { getDb } from "./firebase";

export type AchievementId =
  | "first_login"
  | "first_weight"
  | "first_mission"
  | "streak_7"
  | "streak_30"
  | "workouts_10"
  | "first_meal_plan"
  | "first_measurement";

export type AchievementDef = {
  id: AchievementId;
  name: string;
  description: string;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_login", name: "Welcome to Forme", description: "Sign in for the first time" },
  { id: "first_weight", name: "First weigh-in", description: "Log your first weight" },
  { id: "first_mission", name: "Mission accomplished", description: "Complete your first daily mission" },
  { id: "streak_7", name: "7-day streak", description: "Keep your streak alive for a week" },
  { id: "streak_30", name: "30-day streak", description: "A full month of consistency" },
  { id: "workouts_10", name: "10 workouts", description: "Complete 10 workouts" },
  { id: "first_meal_plan", name: "Chef mode", description: "Generate your first AI meal plan" },
  { id: "first_measurement", name: "Measured up", description: "Log your first body measurement" },
];

export type UnlockedAchievement = { id: AchievementId; unlockedAt: Date };

export async function unlockAchievement(uid: string, id: AchievementId): Promise<boolean> {
  const db = getDb();
  const ref = doc(db, "users", uid, "achievements", id);
  // setDoc with merge: false would overwrite createdAt; check first.
  try {
    await setDoc(ref, { id, unlockedAt: Timestamp.now() }, { merge: true });
    return true;
  } catch {
    return false;
  }
}

export async function listAchievements(uid: string): Promise<UnlockedAchievement[]> {
  const db = getDb();
  const q = query(collection(db, "users", uid, "achievements"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as { unlockedAt?: Timestamp };
    return { id: d.id as AchievementId, unlockedAt: data.unlockedAt?.toDate() ?? new Date() };
  });
}

/** Evaluate streak/workout-count-based unlocks. */
export async function evaluateAchievements(uid: string, ctx: { streak?: number; workoutCount?: number }) {
  if ((ctx.streak ?? 0) >= 7) await unlockAchievement(uid, "streak_7");
  if ((ctx.streak ?? 0) >= 30) await unlockAchievement(uid, "streak_30");
  if ((ctx.workoutCount ?? 0) >= 10) await unlockAchievement(uid, "workouts_10");
}

export async function countWorkouts(uid: string): Promise<number> {
  const db = getDb();
  const snap = await getDocs(query(collection(db, "workouts"), where("uid", "==", uid)));
  return snap.size;
}
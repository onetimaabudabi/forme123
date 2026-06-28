import { addDoc, collection, getDocs, limit, orderBy, query, updateDoc, where, doc, Timestamp } from "firebase/firestore";
import { getDb } from "./firebase";
import type { FitnessGoal } from "./auth";
import { applyDailyCompletion, undoDailyCompletion } from "./streak";
import { evaluateAchievements, unlockAchievement, countWorkouts } from "./achievements";
import { bumpStat, postActivity, setStat } from "./social";
import { doc, getDoc } from "firebase/firestore";

export type Mission = {
  id: string;
  uid: string;
  title: string;
  completed: boolean;
  createdAt: Date;
};

const MISSIONS_BY_GOAL: Record<FitnessGoal, string[]> = {
  weight_loss: ["Walk 10,000 steps", "Drink 2.5L water", "Stay within calorie target"],
  muscle_gain: ["Hit your protein target", "Complete today's workout", "Drink 2.5L water"],
  maintain: ["Complete your activity goal", "Stay hydrated", "Track your nutrition"],
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function pickMissionTitle(goal: FitnessGoal) {
  const opts = MISSIONS_BY_GOAL[goal] ?? MISSIONS_BY_GOAL.maintain;
  const dayIdx = Math.floor(Date.now() / 86_400_000);
  return opts[dayIdx % opts.length];
}

export async function getOrCreateTodayMission(uid: string, goal: FitnessGoal): Promise<Mission> {
  const db = getDb();
  const col = collection(db, "missions");
  const startTs = Timestamp.fromDate(startOfToday());
  const q = query(col, where("uid", "==", uid), where("createdAt", ">=", startTs), orderBy("createdAt", "desc"), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    const data = d.data() as { uid: string; title: string; completed: boolean; createdAt: Timestamp };
    return { id: d.id, uid: data.uid, title: data.title, completed: !!data.completed, createdAt: data.createdAt.toDate() };
  }
  const title = pickMissionTitle(goal);
  const created = await addDoc(col, { uid, title, completed: false, createdAt: Timestamp.now() });
  return { id: created.id, uid, title, completed: false, createdAt: new Date() };
}

export async function setMissionCompleted(id: string, completed: boolean) {
  await updateDoc(doc(getDb(), "missions", id), { completed });
}

/** Toggle today's mission, applying streak and achievement side effects. */
export async function toggleMission(uid: string, id: string, completed: boolean): Promise<number> {
  await setMissionCompleted(id, completed);
  if (completed) {
    const streak = await applyDailyCompletion(uid);
    await unlockAchievement(uid, "first_mission");
    const workoutCount = await countWorkouts(uid).catch(() => 0);
    await evaluateAchievements(uid, { streak, workoutCount });
    // Denormalize for leaderboards + feed.
    await bumpStat(uid, "totalMissions", 1).catch(() => {});
    await setStat(uid, "currentStreak", streak).catch(() => {});
    // Update longestStreak if needed.
    try {
      const snap = await getDoc(doc(getDb(), "users", uid));
      const longest = (snap.data() as { stats?: { longestStreak?: number } })?.stats?.longestStreak ?? 0;
      if (streak > longest) await setStat(uid, "longestStreak", streak);
    } catch { /* ignore */ }
    postActivity(uid, "mission_completed", { streak }).catch(() => {});
    if (streak > 0 && streak % 7 === 0) postActivity(uid, "streak_milestone", { streak }).catch(() => {});
    return streak;
  }
  return undoDailyCompletion(uid);
}
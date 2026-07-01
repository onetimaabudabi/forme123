import { doc, setDoc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { getDb } from "./firebase";
import type { FitnessGoal, UserProfile } from "./auth";
import { applyDailyCompletion, undoDailyCompletion } from "./streak";
import { evaluateAchievements, unlockAchievement, countWorkouts } from "./achievements";
import { bumpStat, postActivity, setStat } from "./social";
import { groqJSON, type GroqMessage } from "./groq";

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

function ymd(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function pickMissionTitle(goal: FitnessGoal) {
  const opts = MISSIONS_BY_GOAL[goal] ?? MISSIONS_BY_GOAL.maintain;
  const dayIdx = Math.floor(Date.now() / 86_400_000);
  return opts[dayIdx % opts.length];
}

async function generateAIChallenge(profile: UserProfile | null, goal: FitnessGoal): Promise<string> {
  try {
    const goalLabel: Record<FitnessGoal, string> = {
      weight_loss: "sustainable fat loss",
      muscle_gain: "hypertrophy and strength",
      maintain: "general fitness and consistency",
    };
    const sys: GroqMessage = { role: "system", content: "You write ONE short, motivating, achievable daily fitness micro-challenge. Return STRICT JSON only." };
    const user: GroqMessage = {
      role: "user",
      content: `Give exactly one micro-challenge for today (max 8 words, action-oriented, second-person) tailored to: goal ${goalLabel[goal]}${profile ? `, age ${profile.age}, ${profile.gender}, ${profile.weight}kg` : ""}.
Return JSON: {"title": string}`,
    };
    const parsed = await groqJSON<{ title: string }>([sys, user]);
    const t = parsed.title?.trim();
    if (t && t.length > 0 && t.length < 120) return t;
  } catch { /* fall through */ }
  return pickMissionTitle(goal);
}

/** Deterministic per-day mission document, ID `${uid}_${YYYY-MM-DD}`. */
export async function getOrCreateTodayMission(uid: string, goal: FitnessGoal, profile: UserProfile | null = null): Promise<Mission> {
  const db = getDb();
  const date = ymd();
  const id = `${uid}_${date}`;
  const ref = doc(db, "missions", id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as { uid: string; title: string; completed: boolean; createdAt: Timestamp };
    return { id, uid: data.uid, title: data.title, completed: !!data.completed, createdAt: data.createdAt?.toDate?.() ?? new Date() };
  }
  const title = await generateAIChallenge(profile, goal);
  const now = Timestamp.now();
  await setDoc(ref, { uid, title, completed: false, date, createdAt: now });
  return { id, uid, title, completed: false, createdAt: now.toDate() };
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
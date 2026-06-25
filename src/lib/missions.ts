import { addDoc, collection, getDocs, limit, orderBy, query, updateDoc, where, doc, Timestamp } from "firebase/firestore";
import { getDb } from "./firebase";
import type { FitnessGoal } from "./auth";

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
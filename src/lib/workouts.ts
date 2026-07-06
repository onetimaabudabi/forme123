import { addDoc, collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { getDb } from "./firebase";
import { groqJSON, type GroqMessage } from "./groq";
import type { UserProfile } from "./auth";
import { bumpStat } from "./social";
import { applyDailyCompletion } from "./streak";

export type Exercise = { name: string; sets: number; reps: string; rest: string };

export type WorkoutPlan = {
  id: string;
  uid: string;
  title: string;
  durationMin: number;
  estKcal: number;
  exercises: Exercise[];
  createdAt: Date;
  archived?: boolean;
};

export type WorkoutLog = {
  id: string;
  uid: string;
  title: string;
  durationMin: number;
  kcal: number;
  exercises: Exercise[];
  completedAt: Date;
};

export async function getActivePlan(uid: string): Promise<WorkoutPlan | null> {
  const db = getDb();
  const q = query(
    collection(db, "workout_plans"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(5),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  for (const d of snap.docs) {
    const data = d.data() as { uid: string; title: string; durationMin: number; estKcal: number; exercises: Exercise[]; archived?: boolean; createdAt: Timestamp };
    if (data.archived) continue;
    return {
      id: d.id,
      uid: data.uid,
      title: data.title,
      durationMin: data.durationMin,
      estKcal: data.estKcal,
      exercises: data.exercises ?? [],
      archived: false,
      createdAt: data.createdAt.toDate(),
    };
  }
  return null;
}

export async function generateWorkoutPlan(profile: UserProfile): Promise<WorkoutPlan> {
  const goalLabel: Record<string, string> = {
    weight_loss: "fat loss with hypertrophy",
    muscle_gain: "hypertrophy and strength",
    maintain: "general fitness and conditioning",
  };
  const sys: GroqMessage = {
    role: "system",
    content: "You design personalised gym workouts. Always return STRICT JSON matching the requested schema, no markdown.",
  };
  const user: GroqMessage = {
    role: "user",
    content: `Design a single ~45 minute workout for: age ${profile.age}, ${profile.gender}, ${profile.height}cm, ${profile.weight}kg, goal: ${goalLabel[profile.goal]}.
Return JSON: {"title": string, "durationMin": number, "estKcal": number, "exercises": [{"name": string, "sets": number, "reps": string, "rest": string}]}
6-8 exercises, balanced, beginner-to-intermediate friendly.`,
  };
  const parsed = await groqJSON<{ title: string; durationMin: number; estKcal: number; exercises: Exercise[] }>([sys, user]);
  const db = getDb();
  const created = await addDoc(collection(db, "workout_plans"), {
    uid: profile.uid,
    title: parsed.title,
    durationMin: parsed.durationMin,
    estKcal: parsed.estKcal,
    exercises: parsed.exercises,
    archived: false,
    createdAt: Timestamp.now(),
  });
  return { id: created.id, uid: profile.uid, ...parsed, createdAt: new Date() };
}

export async function logCompletedWorkout(uid: string, plan: WorkoutPlan): Promise<WorkoutLog> {
  const db = getDb();
  const ref = await addDoc(collection(db, "workouts"), {
    uid,
    title: plan.title,
    durationMin: plan.durationMin,
    kcal: plan.estKcal,
    exercises: plan.exercises,
    completedAt: Timestamp.now(),
  });
  // Archive the plan so a new one can be generated explicitly.
  await updateDoc(doc(db, "workout_plans", plan.id), { archived: true, completedAt: Timestamp.now() }).catch(() => {});
  // Denormalize for leaderboards. Feed post is handled by the UI so the user can choose to share.
  await Promise.all([
    bumpStat(uid, "totalWorkouts", 1).catch(() => {}),
    bumpStat(uid, "caloriesBurned", plan.estKcal || 0).catch(() => {}),
    applyDailyCompletion(uid).catch(() => {}),
  ]);
  return { id: ref.id, uid, title: plan.title, durationMin: plan.durationMin, kcal: plan.estKcal, exercises: plan.exercises, completedAt: new Date() };
}

export async function listWorkoutHistory(uid: string, max = 50): Promise<WorkoutLog[]> {
  const db = getDb();
  const q = query(
    collection(db, "workouts"),
    where("uid", "==", uid),
    orderBy("completedAt", "desc"),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as { uid: string; title: string; durationMin: number; kcal: number; exercises?: Exercise[]; completedAt: Timestamp };
    return {
      id: d.id,
      uid: data.uid,
      title: data.title,
      durationMin: data.durationMin,
      kcal: data.kcal,
      exercises: data.exercises ?? [],
      completedAt: data.completedAt.toDate(),
    };
  });
}

export function subscribeWorkoutHistory(uid: string, cb: (items: WorkoutLog[]) => void): () => void {
  const q = query(collection(getDb(), "workouts"), where("uid", "==", uid), limit(200));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => {
      const data = d.data() as { uid: string; title: string; durationMin: number; kcal: number; exercises?: Exercise[]; completedAt: Timestamp };
      return {
        id: d.id,
        uid: data.uid,
        title: data.title,
        durationMin: data.durationMin,
        kcal: data.kcal,
        exercises: data.exercises ?? [],
        completedAt: data.completedAt.toDate(),
      };
    });
    items.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    cb(items);
  });
}

export async function deleteWorkout(id: string) {
  await deleteDoc(doc(getDb(), "workouts", id));
}
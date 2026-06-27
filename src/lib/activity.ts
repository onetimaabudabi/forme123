import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { getDb } from "./firebase";

export type ActivityKind = "workout" | "mission" | "nutrition" | "water" | "sleep" | "weight" | "coach";

export type DayActivity = {
  date: string; // yyyy-mm-dd
  kinds: Set<ActivityKind>;
  workouts: number;
  workoutMinutes: number;
  workoutKcal: number;
  meals: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  sleepHours: number | null;
  weight: number | null;
  missionCompleted: boolean;
  coachMessages: number;
};

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyDay(date: string): DayActivity {
  return { date, kinds: new Set(), workouts: 0, workoutMinutes: 0, workoutKcal: 0, meals: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0, sleepHours: null, weight: null, missionCompleted: false, coachMessages: 0 };
}

function ensure(map: Map<string, DayActivity>, date: string) {
  let d = map.get(date);
  if (!d) { d = emptyDay(date); map.set(date, d); }
  return d;
}

async function fetchSince(uid: string, col: string, field: string, since: Date) {
  const q = query(
    collection(getDb(), col),
    where("uid", "==", uid),
    where(field, ">=", Timestamp.fromDate(since)),
    orderBy(field, "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Record<string, unknown>);
}

/** Returns a Map keyed by YYYY-MM-DD covering the last `days` days. */
export async function getActivityRange(uid: string, days = 120): Promise<Map<string, DayActivity>> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const map = new Map<string, DayActivity>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since); d.setDate(d.getDate() + i);
    map.set(ymd(d), emptyDay(ymd(d)));
  }

  const results = await Promise.allSettled([
    fetchSince(uid, "workouts", "completedAt", since),
    fetchSince(uid, "missions", "createdAt", since),
    fetchSince(uid, "nutrition", "createdAt", since),
    fetchSince(uid, "water", "createdAt", since),
    fetchSince(uid, "sleep", "createdAt", since),
    fetchSince(uid, "weights", "createdAt", since),
    fetchSince(uid, "messages", "createdAt", since),
  ]);

  const [w, m, n, water, sl, wt, msg] = results.map((r) => (r.status === "fulfilled" ? r.value : []));

  for (const x of w) {
    const ts = x.completedAt as Timestamp | undefined; if (!ts) continue;
    const day = ensure(map, ymd(ts.toDate()));
    day.kinds.add("workout");
    day.workouts += 1;
    day.workoutMinutes += Number(x.durationMin ?? 0);
    day.workoutKcal += Number(x.kcal ?? 0);
  }
  for (const x of m) {
    const ts = x.createdAt as Timestamp | undefined; if (!ts) continue;
    if (x.completed) {
      const day = ensure(map, ymd(ts.toDate()));
      day.kinds.add("mission");
      day.missionCompleted = true;
    }
  }
  for (const x of n) {
    const ts = x.createdAt as Timestamp | undefined; if (!ts) continue;
    const day = ensure(map, ymd(ts.toDate()));
    day.kinds.add("nutrition");
    day.meals += 1;
    day.kcal += Number(x.kcal ?? 0);
    day.protein += Number(x.protein ?? 0);
    day.carbs += Number(x.carbs ?? 0);
    day.fat += Number(x.fat ?? 0);
  }
  for (const x of water) {
    const ts = x.createdAt as Timestamp | undefined; if (!ts) continue;
    const day = ensure(map, ymd(ts.toDate()));
    day.kinds.add("water");
    day.waterMl += Number(x.ml ?? 0);
  }
  for (const x of sl) {
    const ts = x.createdAt as Timestamp | undefined; if (!ts) continue;
    const day = ensure(map, ymd(ts.toDate()));
    day.kinds.add("sleep");
    day.sleepHours = (day.sleepHours ?? 0) + Number(x.hours ?? 0);
  }
  for (const x of wt) {
    const ts = x.createdAt as Timestamp | undefined; if (!ts) continue;
    const day = ensure(map, ymd(ts.toDate()));
    day.kinds.add("weight");
    day.weight = Number(x.weight ?? x.kg ?? 0) || day.weight;
  }
  for (const x of msg) {
    const ts = x.createdAt as Timestamp | undefined; if (!ts) continue;
    const day = ensure(map, ymd(ts.toDate()));
    day.kinds.add("coach");
    day.coachMessages += 1;
  }

  return map;
}

export function monthStats(map: Map<string, DayActivity>, year: number, month: number) {
  let active = 0, workouts = 0, missions = 0, sleepSum = 0, sleepDays = 0, kcalSum = 0, kcalDays = 0, proteinSum = 0, coach = 0;
  let weightFirst: number | null = null, weightLast: number | null = null;
  for (const day of map.values()) {
    const d = new Date(day.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    if (day.kinds.size > 0) active += 1;
    workouts += day.workouts;
    if (day.missionCompleted) missions += 1;
    if (day.sleepHours) { sleepSum += day.sleepHours; sleepDays += 1; }
    if (day.kcal > 0) { kcalSum += day.kcal; kcalDays += 1; }
    proteinSum += day.protein;
    coach += day.coachMessages;
    if (day.weight !== null) {
      if (weightFirst === null) weightFirst = day.weight;
      weightLast = day.weight;
    }
  }
  return {
    activeDays: active,
    workouts,
    missions,
    avgSleep: sleepDays ? sleepSum / sleepDays : null,
    avgKcal: kcalDays ? Math.round(kcalSum / kcalDays) : null,
    avgProtein: kcalDays ? Math.round(proteinSum / kcalDays) : null,
    weightChange: weightFirst !== null && weightLast !== null ? +(weightLast - weightFirst).toFixed(1) : null,
    coachUsage: coach,
  };
}
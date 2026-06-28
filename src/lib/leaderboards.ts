import { collection, doc, getDoc, getDocs, limit, orderBy, query } from "firebase/firestore";
import { getDb } from "./firebase";
import type { PublicUser } from "./usernames";
import type { UserStats } from "./social";

export type LeaderboardMetric =
  | "totalWorkouts"
  | "currentStreak"
  | "longestStreak"
  | "activeDays"
  | "totalMissions"
  | "caloriesBurned";

export type LeaderboardEntry = PublicUser & { value: number };

export async function getGlobalLeaderboard(metric: LeaderboardMetric, max = 50): Promise<LeaderboardEntry[]> {
  const db = getDb();
  const q = query(collection(db, "users"), orderBy(`stats.${metric}`, "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown> & { stats?: Partial<UserStats> };
    return {
      uid: d.id,
      username: (data.username as string) ?? "",
      friendCode: (data.friendCode as string) ?? "",
      name: data.name as string | undefined,
      goal: data.goal as string | undefined,
      streak: data.streak as number | undefined,
      stats: data.stats as PublicUser["stats"],
      value: (data.stats?.[metric] as number | undefined) ?? 0,
    };
  });
}

/** Compute leaderboard for a given set of uids (friends + self). */
export async function getFriendsLeaderboard(metric: LeaderboardMetric, uids: string[]): Promise<LeaderboardEntry[]> {
  if (uids.length === 0) return [];
  const db = getDb();
  const all = await Promise.all(uids.map(async (uid) => {
    const d = await getDoc(doc(db, "users", uid));
    if (!d.exists()) return null;
    const data = d.data() as Record<string, unknown> & { stats?: Partial<UserStats> };
    return {
      uid: d.id,
      username: (data.username as string) ?? "",
      friendCode: (data.friendCode as string) ?? "",
      name: data.name as string | undefined,
      goal: data.goal as string | undefined,
      streak: data.streak as number | undefined,
      stats: data.stats as PublicUser["stats"],
      value: (data.stats?.[metric] as number | undefined) ?? 0,
    } as LeaderboardEntry;
  }));
  return all.filter((x): x is LeaderboardEntry => !!x).sort((a, b) => b.value - a.value);
}
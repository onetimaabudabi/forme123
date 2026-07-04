import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User, signOut as fbSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { getFbAuth, getDb } from "./firebase";

export type FitnessGoal = "weight_loss" | "muscle_gain" | "maintain";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: FitnessGoal;
  streak: number;
  username?: string;
  friendCode?: string;
  bio?: string;
  photoURL?: string;
  followersCount?: number;
  followingCount?: number;
  stats?: {
    totalWorkouts?: number;
    currentStreak?: number;
    longestStreak?: number;
    activeDays?: number;
    totalMissions?: number;
    caloriesBurned?: number;
  };
  createdAt?: unknown;
};

type AuthCtx = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  needsProfile: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFbAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const db = getDb();
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile({ uid: user.uid, ...(snap.data() as Omit<UserProfile, "uid">) });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const value: AuthCtx = {
    user,
    profile,
    loading,
    needsProfile: !!user && !loading && (!profile || !profile.name),
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(getFbAuth(), email, password);
    },
    signUp: async (email, password) => {
      await createUserWithEmailAndPassword(getFbAuth(), email, password);
    },
    signOut: async () => {
      await fbSignOut(getFbAuth());
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export async function saveUserProfile(uid: string, email: string, data: Partial<Omit<UserProfile, "uid" | "email" | "streak" | "createdAt">> & { name: string }) {
  const db = getDb();
  const ref = doc(db, "users", uid);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      ...data,
      email,
      streak: existing.exists() ? (existing.data().streak ?? 0) : 0,
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
    },
    { merge: true }
  );
}
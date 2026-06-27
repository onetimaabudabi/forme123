// Lightweight local reminder scheduling using the browser Notification API.
// Reminders only fire while the app tab is open. No background push.

export type ReminderKey = "mission" | "workout" | "meals" | "water" | "sleep" | "weekly" | "streak";

export type ReminderPrefs = Record<ReminderKey, boolean>;

const KEY = "forme.reminders";

export const DEFAULT_PREFS: ReminderPrefs = {
  mission: true,
  workout: true,
  meals: false,
  water: false,
  sleep: false,
  weekly: true,
  streak: true,
};

export function loadPrefs(): ReminderPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<ReminderPrefs>) };
  } catch { return DEFAULT_PREFS; }
}

export function savePrefs(p: ReminderPrefs) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted" || Notification.permission === "denied") return Notification.permission;
  return Notification.requestPermission();
}

export function notify(title: string, body?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try { new Notification(title, { body, icon: "/icon-192.png" }); } catch { /* ignore */ }
}

const TIMERS = new Map<string, number>();

function msUntil(hour: number, minute = 0): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

function schedule(id: string, hour: number, title: string, body: string) {
  const handle = window.setTimeout(() => {
    notify(title, body);
    schedule(id, hour, title, body); // re-arm next day
  }, msUntil(hour));
  TIMERS.set(id, handle);
}

/** Cancels all scheduled reminders. */
export function clearAll() {
  TIMERS.forEach((h) => clearTimeout(h));
  TIMERS.clear();
}

/** Re-arms timers based on prefs. Call when prefs change or on app start. */
export function applyReminders(prefs: ReminderPrefs) {
  clearAll();
  if (typeof window === "undefined") return;
  if (Notification.permission !== "granted") return;
  if (prefs.mission) schedule("mission", 9, "Daily mission", "Tap to start today's mission.");
  if (prefs.workout) schedule("workout", 18, "Workout time", "Your workout is waiting.");
  if (prefs.meals) schedule("meals", 12, "Log your meal", "Stay on top of nutrition.");
  if (prefs.water) schedule("water", 15, "Hydrate", "Have a glass of water.");
  if (prefs.sleep) schedule("sleep", 22, "Wind down", "Log tonight's sleep.");
  if (prefs.streak) schedule("streak", 21, "Keep your streak", "Finish today's mission to extend your streak.");
  if (prefs.weekly) schedule("weekly", 10, "Weekly progress", "Review your progress this week.");
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, ChevronRight, Bell, Moon, Sun, Smartphone, CreditCard, HelpCircle, FileText, LogOut, UserCog, Trash2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme, type ThemeMode } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { applyReminders, loadPrefs, requestPermission, savePrefs, type ReminderKey, type ReminderPrefs } from "@/lib/reminders";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { getDb, getFbAuth } from "@/lib/firebase";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Forme" }] }),
  component: Settings,
});

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`w-12 h-7 rounded-full transition-colors relative ${on ? "bg-accent" : "bg-foreground/15"}`}>
      <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

const REMINDER_LABELS: Record<ReminderKey, string> = {
  mission: "Daily mission",
  workout: "Workout",
  meals: "Meals",
  water: "Water",
  sleep: "Sleep",
  weekly: "Weekly progress",
  streak: "Streak warning",
};

function Settings() {
  const { mode, setMode } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<ReminderPrefs>(() => loadPrefs());
  const [perm, setPerm] = useState<NotificationPermission>(typeof Notification !== "undefined" ? Notification.permission : "denied");

  useEffect(() => { applyReminders(prefs); }, [prefs]);

  const togglePref = async (k: ReminderKey) => {
    if (perm !== "granted") {
      const next = await requestPermission();
      setPerm(next);
      if (next !== "granted") return;
    }
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next); savePrefs(next);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/signin" });
  };

  const handleDelete = async () => {
    if (!user || !profile) return;
    if (!confirm("Delete your account and all data? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(getDb(), "users", user.uid));
      await deleteUser(getFbAuth().currentUser!);
      navigate({ to: "/signin" });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete. Please sign in again, then retry.");
    }
  };

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Settings</h1>
          <div className="size-10" />
        </div>

        <h2 className="mt-6 text-xs uppercase tracking-wider font-semibold text-foreground/40 px-1">Appearance</h2>
        <div className="mt-2 surface divide-y divide-black/5">
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-secondary flex items-center justify-center"><Moon className="size-[18px]" /></div>
              <span className="flex-1 text-[15px] font-medium">Theme</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["system","light","dark"] as ThemeMode[]).map((m) => {
                const Icon = m === "system" ? Smartphone : m === "light" ? Sun : Moon;
                const active = mode === m;
                return (
                  <button key={m} onClick={() => setMode(m)} className={`h-12 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 ${active ? "bg-black text-white" : "bg-background border"}`}>
                    <Icon className="size-4" /> <span className="capitalize">{m}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <h2 className="mt-6 text-xs uppercase tracking-wider font-semibold text-foreground/40 px-1">
          Notifications {perm !== "granted" && <span className="text-foreground/30 normal-case font-medium">· tap any to enable</span>}
        </h2>
        <div className="mt-2 surface divide-y divide-black/5">
          {(Object.keys(REMINDER_LABELS) as ReminderKey[]).map((k) => (
            <div key={k} className="flex items-center gap-3 px-4 py-3.5">
              <div className="size-9 rounded-xl bg-secondary flex items-center justify-center"><Bell className="size-[18px]" /></div>
              <span className="flex-1 text-[15px] font-medium">{REMINDER_LABELS[k]}</span>
              <Toggle on={prefs[k]} onChange={() => togglePref(k)} />
            </div>
          ))}
        </div>

        <h2 className="mt-6 text-xs uppercase tracking-wider font-semibold text-foreground/40 px-1">Account</h2>
        <div className="mt-2 surface divide-y divide-black/5">
          <LinkRow to="/edit-profile" icon={UserCog} label="Edit profile" />
          <LinkRow to="/activity" icon={Calendar} label="Activity calendar" />
          <LinkRow to="/subscription" icon={CreditCard} label="Subscription" />
        </div>

        <h2 className="mt-6 text-xs uppercase tracking-wider font-semibold text-foreground/40 px-1">About</h2>
        <div className="mt-2 surface divide-y divide-black/5">
          <ExtRow icon={HelpCircle} label="Help center" href="mailto:support@forme.app" />
          <ExtRow icon={FileText} label="Terms & privacy" href="https://www.lovable.dev/" />
        </div>

        <div className="mt-6 surface divide-y divide-black/5">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
            <div className="size-9 rounded-xl bg-secondary flex items-center justify-center"><LogOut className="size-[18px]" /></div>
            <span className="flex-1 text-[15px] font-medium">Sign out</span>
          </button>
          <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-destructive">
            <div className="size-9 rounded-xl bg-destructive/10 flex items-center justify-center"><Trash2 className="size-[18px]" /></div>
            <span className="flex-1 text-[15px] font-medium">Delete account</span>
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-foreground/30">Forme · v1.0.0</p>
      </div>
    </PhoneFrame>
  );
}

function LinkRow({ to, icon: Icon, label, hint }: { to: string; icon: typeof Bell; label: string; hint?: string }) {
  return (
    <Link to={to as "/"} className="flex items-center gap-3 px-4 py-3.5">
      <div className="size-9 rounded-xl bg-secondary flex items-center justify-center"><Icon className="size-[18px]" /></div>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {hint && <span className="text-xs text-foreground/40">{hint}</span>}
      <ChevronRight className="size-4 text-foreground/30" />
    </Link>
  );
}

function ExtRow({ icon: Icon, label, href }: { icon: typeof Bell; label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3.5">
      <div className="size-9 rounded-xl bg-secondary flex items-center justify-center"><Icon className="size-[18px]" /></div>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight className="size-4 text-foreground/30" />
    </a>
  );
}
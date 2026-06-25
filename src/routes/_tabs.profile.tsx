import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Trophy, Apple, Settings, Bell, Shield, HelpCircle, LogOut, Flame, Calendar, Users, Crown, History, Ruler, Moon, Sparkles, UserCog } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_tabs/profile")({
  head: () => ({ meta: [{ title: "Profile — Forme" }] }),
  component: Profile,
});

function Row({ to, icon: Icon, label, hint }: { to: string; icon: typeof Trophy; label: string; hint?: string }) {
  return (
    <Link to={to as "/"} className="flex items-center gap-3 px-4 py-3.5 hover:bg-foreground/[0.02] transition">
      <div className="size-9 rounded-xl bg-secondary flex items-center justify-center">
        <Icon className="size-[18px]" />
      </div>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {hint && <span className="text-xs text-foreground/40">{hint}</span>}
      <ChevronRight className="size-4 text-foreground/30" />
    </Link>
  );
}

function Profile() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/signin" });
  };

  const goalLabel: Record<string, string> = {
    weight_loss: "Weight Loss",
    muscle_gain: "Muscle Gain",
    maintain: "Maintain Fitness",
  };

  return (
    <div className="px-6 pt-14">
      <div className="flex flex-col items-center text-center">
        <div className="size-24 rounded-full bg-secondary flex items-center justify-center text-3xl font-bold">
          {profile.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{profile.name}</h1>
        <p className="text-sm text-foreground/50">{profile.email}</p>
        <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-xs font-semibold">
          ✦ {goalLabel[profile.goal] ?? "Forme"}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { v: String(profile.streak ?? 0), l: "Day streak" },
          { v: `${profile.weight}`, l: "Weight kg" },
          { v: `${profile.height}`, l: "Height cm" },
        ].map((s) => (
          <div key={s.l} className="surface py-4 text-center">
            <p className="text-xl font-bold tracking-tight">{s.v}</p>
            <p className="text-[11px] text-foreground/50 mt-0.5 font-medium">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 surface overflow-hidden divide-y divide-black/5">
        <Row to="/edit-profile" icon={UserCog} label="Edit profile" hint="Name · weight · goal" />
      </div>

      <div className="mt-6 surface overflow-hidden divide-y divide-black/5">
        <Row to="/achievements" icon={Trophy} label="Achievements" hint="7 unlocked" />
        <Row to="/challenges" icon={Flame} label="Daily challenges" hint="2 / 5" />
        <Row to="/streak" icon={Calendar} label="Streak calendar" hint="12 days" />
        <Row to="/leaderboard" icon={Crown} label="Leaderboard" hint="#3" />
        <Row to="/friends" icon={Users} label="Friends" />
      </div>

      <div className="mt-4 surface overflow-hidden divide-y divide-black/5">
        <Row to="/history" icon={History} label="Workout history" />
        <Row to="/measurements" icon={Ruler} label="Body measurements" />
        <Row to="/sleep" icon={Moon} label="Sleep tracking" />
        <Row to="/meal-plan" icon={Sparkles} label="AI meal plans" />
        <Row to="/nutrition" icon={Apple} label="Nutrition" />
      </div>

      <div className="mt-4 surface overflow-hidden divide-y divide-black/5">
        <Row to="/subscription" icon={Crown} label="Forme Pro" hint="Active" />
        <Row to="/settings" icon={Settings} label="Settings" />
      </div>

      <div className="mt-4 surface overflow-hidden divide-y divide-black/5">
        <Row to="/settings" icon={Bell} label="Notifications" />
        <Row to="/settings" icon={Shield} label="Privacy" />
        <Row to="/settings" icon={HelpCircle} label="Help & support" />
      </div>

      <button onClick={handleSignOut} className="mt-4 w-full surface flex items-center justify-center gap-2 py-4 text-destructive font-semibold text-sm">
        <LogOut className="size-4" /> Sign out
      </button>
    </div>
  );
}
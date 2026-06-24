import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Trophy, Apple, Settings, Bell, Shield, HelpCircle, LogOut } from "lucide-react";

export const Route = createFileRoute("/_tabs/profile")({
  head: () => ({ meta: [{ title: "Profile — Forme" }] }),
  component: Profile,
});

function Row({ to, icon: Icon, label, hint }: { to: string; icon: typeof Trophy; label: string; hint?: string }) {
  return (
    <Link to={to as "/"} className="flex items-center gap-3 px-4 py-3.5 hover:bg-foreground/[0.02] transition">
      <div className="size-9 rounded-xl bg-secondary flex items-center justify-center">
        <Icon className="size-4.5" />
      </div>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {hint && <span className="text-xs text-foreground/40">{hint}</span>}
      <ChevronRight className="size-4 text-foreground/30" />
    </Link>
  );
}

function Profile() {
  return (
    <div className="px-6 pt-14">
      <div className="flex flex-col items-center text-center">
        <div className="size-24 rounded-full bg-secondary flex items-center justify-center text-3xl font-bold">A</div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Alex Morgan</h1>
        <p className="text-sm text-foreground/50">alex@forme.app</p>
        <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-xs font-semibold">
          ✦ Forme Pro
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { v: "12", l: "Day streak" },
          { v: "84", l: "Workouts" },
          { v: "7", l: "Badges" },
        ].map((s) => (
          <div key={s.l} className="surface py-4 text-center">
            <p className="text-xl font-bold tracking-tight">{s.v}</p>
            <p className="text-[11px] text-foreground/50 mt-0.5 font-medium">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 surface overflow-hidden divide-y divide-black/5">
        <Row to="/achievements" icon={Trophy} label="Achievements" hint="7 unlocked" />
        <Row to="/nutrition" icon={Apple} label="Nutrition" />
        <Row to="/settings" icon={Settings} label="Settings" />
      </div>

      <div className="mt-4 surface overflow-hidden divide-y divide-black/5">
        <Row to="/settings" icon={Bell} label="Notifications" />
        <Row to="/settings" icon={Shield} label="Privacy" />
        <Row to="/settings" icon={HelpCircle} label="Help & support" />
      </div>

      <Link to="/signin" className="mt-4 surface flex items-center justify-center gap-2 py-4 text-destructive font-semibold text-sm">
        <LogOut className="size-4" /> Sign out
      </Link>
    </div>
  );
}
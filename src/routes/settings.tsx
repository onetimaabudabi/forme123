import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, ChevronRight, Bell, Moon, Lock, Globe, CreditCard, HelpCircle, FileText } from "lucide-react";
import { useState } from "react";

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

function Settings() {
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Settings</h1>
          <div className="size-10" />
        </div>

        <h2 className="mt-6 text-xs uppercase tracking-wider font-semibold text-foreground/40 px-1">Preferences</h2>
        <div className="mt-2 surface divide-y divide-black/5">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="size-9 rounded-xl bg-secondary flex items-center justify-center"><Bell className="size-4.5" /></div>
            <span className="flex-1 text-[15px] font-medium">Notifications</span>
            <Toggle on={notif} onChange={setNotif} />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="size-9 rounded-xl bg-secondary flex items-center justify-center"><Moon className="size-4.5" /></div>
            <span className="flex-1 text-[15px] font-medium">Dark mode</span>
            <Toggle on={dark} onChange={setDark} />
          </div>
          <Row icon={Globe} label="Units" hint="Metric" />
        </div>

        <h2 className="mt-6 text-xs uppercase tracking-wider font-semibold text-foreground/40 px-1">Account</h2>
        <div className="mt-2 surface divide-y divide-black/5">
          <Row icon={Lock} label="Privacy & security" />
          <Row icon={CreditCard} label="Subscription" hint="Pro" />
        </div>

        <h2 className="mt-6 text-xs uppercase tracking-wider font-semibold text-foreground/40 px-1">About</h2>
        <div className="mt-2 surface divide-y divide-black/5">
          <Row icon={HelpCircle} label="Help center" />
          <Row icon={FileText} label="Terms & privacy" />
        </div>

        <p className="mt-8 text-center text-xs text-foreground/30">Forme · v1.0.0</p>
      </div>
    </PhoneFrame>
  );
}

function Row({ icon: Icon, label, hint }: { icon: typeof Bell; label: string; hint?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="size-9 rounded-xl bg-secondary flex items-center justify-center"><Icon className="size-4.5" /></div>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {hint && <span className="text-xs text-foreground/40">{hint}</span>}
      <ChevronRight className="size-4 text-foreground/30" />
    </div>
  );
}
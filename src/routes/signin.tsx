import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Apple, Mail } from "lucide-react";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign in — Forme" }] }),
  component: SignIn,
});

function SignIn() {
  return (
    <PhoneFrame>
      <div className="h-full flex flex-col px-7 pt-16 pb-10">
        <Link to="/onboarding" className="text-sm text-foreground/50 font-medium">← Back</Link>

        <div className="mt-10">
          <h1 className="text-[36px] leading-[1.05] font-bold tracking-tight">Welcome back.</h1>
          <p className="mt-3 text-[17px] text-foreground/55">Sign in to continue your streak.</p>
        </div>

        <div className="mt-10 space-y-3">
          <div>
            <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Email</label>
            <input type="email" placeholder="alex@forme.app" className="mt-2 w-full h-14 rounded-2xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Password</label>
            <input type="password" placeholder="••••••••" className="mt-2 w-full h-14 rounded-2xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
        </div>

        <Link to="/" className="mt-5 w-full h-14 rounded-full bg-black text-white flex items-center justify-center font-semibold text-base active:scale-[0.98] transition">
          Sign in
        </Link>

        <div className="my-6 flex items-center gap-3 text-xs text-foreground/40">
          <div className="flex-1 h-px bg-foreground/10" /> or <div className="flex-1 h-px bg-foreground/10" />
        </div>

        <div className="space-y-2.5">
          <button className="w-full h-13 py-3.5 rounded-full bg-secondary flex items-center justify-center gap-2 font-semibold text-sm">
            <Apple className="size-4" fill="currentColor" /> Continue with Apple
          </button>
          <button className="w-full h-13 py-3.5 rounded-full bg-secondary flex items-center justify-center gap-2 font-semibold text-sm">
            <Mail className="size-4" /> Continue with email
          </button>
        </div>

        <p className="mt-auto text-center text-xs text-foreground/40">
          New to Forme? <span className="text-foreground font-semibold">Create account</span>
        </p>
      </div>
    </PhoneFrame>
  );
}
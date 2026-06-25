import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign in — Forme" }] }),
  component: SignIn,
});

function SignIn() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        navigate({ to: "/" });
      } else {
        await signUp(email.trim(), password);
        navigate({ to: "/profile-setup" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PhoneFrame>
      <form onSubmit={submit} className="h-full flex flex-col px-7 pt-16 pb-10">
        <Link to="/onboarding" className="text-sm text-foreground/50 font-medium">← Back</Link>

        <div className="mt-10">
          <h1 className="text-[36px] leading-[1.05] font-bold tracking-tight">
            {mode === "signin" ? "Welcome back." : "Create account."}
          </h1>
          <p className="mt-3 text-[17px] text-foreground/55">
            {mode === "signin" ? "Sign in to continue your streak." : "Start your fitness journey with Forme."}
          </p>
        </div>

        <div className="mt-10 space-y-3">
          <div>
            <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@forme.app"
              className="mt-2 w-full h-14 rounded-2xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full h-14 rounded-2xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full h-14 rounded-full bg-black text-white flex items-center justify-center font-semibold text-base active:scale-[0.98] transition disabled:opacity-50"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <p className="mt-auto text-center text-xs text-foreground/50">
          {mode === "signin" ? "New to Forme?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            className="text-foreground font-semibold"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>
      </form>
    </PhoneFrame>
  );
}
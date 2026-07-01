import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useAuth, saveUserProfile, type FitnessGoal } from "@/lib/auth";
import { ensureUserIdentity, isUsernameAvailable, suggestUsername } from "@/lib/usernames";

export const Route = createFileRoute("/profile-setup")({
  head: () => ({ meta: [{ title: "Set up your profile — Forme" }] }),
  component: ProfileSetup,
});

const goals: { id: FitnessGoal; label: string; hint: string }[] = [
  { id: "weight_loss", label: "Weight Loss", hint: "Burn fat sustainably" },
  { id: "muscle_gain", label: "Muscle Gain", hint: "Build lean strength" },
  { id: "maintain", label: "Maintain Fitness", hint: "Stay consistent" },
];

function ProfileSetup() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameErr, setUsernameErr] = useState<string | null>(null);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState<FitnessGoal>("maintain");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/signin" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setUsername(profile.username ?? "");
      setAge(profile.age ? String(profile.age) : "");
      setGender((profile.gender as "male" | "female" | "other") || "male");
      setHeight(profile.height ? String(profile.height) : "");
      setWeight(profile.weight ? String(profile.weight) : "");
      setGoal((profile.goal as FitnessGoal) || "maintain");
    }
  }, [profile]);

  useEffect(() => {
    if (!username && name) setUsername(suggestUsername(name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    setUsernameErr(null);
    try {
      const uname = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (uname.length < 3) { setUsernameErr("Username must be at least 3 letters/numbers"); setBusy(false); return; }
      const avail = await isUsernameAvailable(uname, user.uid);
      if (!avail) { setUsernameErr("Username is already taken"); setBusy(false); return; }
      await saveUserProfile(user.uid, user.email ?? "", {
        name: name.trim(),
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        goal,
      });
      // Reserve chosen username + friend code once profile exists.
      await ensureUserIdentity(user.uid, uname).catch(() => {});
      navigate({ to: "/feed" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PhoneFrame>
      <form onSubmit={submit} className="h-full overflow-y-auto no-scrollbar px-7 pt-14 pb-10">
        <h1 className="text-[32px] leading-[1.05] font-bold tracking-tight">Tell us about you.</h1>
        <p className="mt-2 text-[15px] text-foreground/55">We'll personalise Forme around your goals.</p>

        <div className="mt-8 space-y-4">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder="Alex Morgan" />
          </Field>
          <Field label="Username">
            <input value={username} onChange={(e) => { setUsername(e.target.value); setUsernameErr(null); }} required minLength={3} className={inputCls} placeholder="alexm" />
            {usernameErr && <p className="mt-1 text-xs text-destructive">{usernameErr}</p>}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age">
              <input type="number" min={10} max={100} value={age} onChange={(e) => setAge(e.target.value)} required className={inputCls} placeholder="28" />
            </Field>
            <Field label="Gender">
              <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female" | "other")} className={inputCls}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Height (cm)">
              <input type="number" min={100} max={250} value={height} onChange={(e) => setHeight(e.target.value)} required className={inputCls} placeholder="178" />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" min={30} max={300} step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required className={inputCls} placeholder="74.2" />
            </Field>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Fitness goal</label>
            <div className="mt-2 space-y-2">
              {goals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border transition ${goal === g.id ? "bg-black text-white border-black" : "bg-secondary border-transparent"}`}
                >
                  <p className="font-semibold text-[15px]">{g.label}</p>
                  <p className={`text-xs ${goal === g.id ? "text-white/60" : "text-foreground/50"}`}>{g.hint}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-8 w-full h-14 rounded-full bg-accent text-white flex items-center justify-center font-semibold text-base active:scale-[0.98] transition disabled:opacity-50"
        >
          {busy ? "Saving…" : "Continue"}
        </button>
      </form>
    </PhoneFrame>
  );
}

const inputCls = "mt-2 w-full h-14 rounded-2xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 focus:ring-accent/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
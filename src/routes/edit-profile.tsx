import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useAuth, saveUserProfile, type FitnessGoal } from "@/lib/auth";
import { logWeight } from "@/lib/weights";

export const Route = createFileRoute("/edit-profile")({
  head: () => ({ meta: [{ title: "Edit profile — Forme" }] }),
  component: EditProfile,
});

const goals: { id: FitnessGoal; label: string }[] = [
  { id: "weight_loss", label: "Weight Loss" },
  { id: "muscle_gain", label: "Muscle Gain" },
  { id: "maintain", label: "Maintain Fitness" },
];

function EditProfile() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
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
      setName(profile.name);
      setAge(String(profile.age));
      setHeight(String(profile.height));
      setWeight(String(profile.weight));
      setGoal(profile.goal);
    }
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setBusy(true); setError(null);
    try {
      const newWeight = Number(weight);
      await saveUserProfile(user.uid, user.email ?? profile.email, {
        name: name.trim(),
        age: Number(age),
        gender: profile.gender,
        height: Number(height),
        weight: newWeight,
        goal,
      });
      if (newWeight !== profile.weight) {
        await logWeight(user.uid, newWeight);
      }
      navigate({ to: "/profile" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  if (!profile) return null;
  const inputCls = "mt-2 w-full h-14 rounded-2xl bg-secondary px-4 text-[15px] outline-none focus:ring-2 focus:ring-accent/40";

  return (
    <PhoneFrame>
      <form onSubmit={save} className="h-full overflow-y-auto no-scrollbar px-7 pt-14 pb-10">
        <Link to="/profile" className="text-sm text-foreground/50 font-medium">← Back</Link>
        <h1 className="mt-6 text-[32px] leading-[1.05] font-bold tracking-tight">Edit profile</h1>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Height (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} required className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Weight (kg)</label>
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required className={inputCls} />
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
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <button disabled={busy} type="submit" className="mt-8 w-full h-14 rounded-full bg-accent text-white flex items-center justify-center font-semibold text-base active:scale-[0.98] transition disabled:opacity-50">
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </PhoneFrame>
  );
}
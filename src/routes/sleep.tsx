import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Moon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFocusRefetch } from "@/hooks/useFocusRefetch";
import { useAuth } from "@/lib/auth";
import { deleteSleep, listSleep, logSleep, type SleepEntry } from "@/lib/sleep";

export const Route = createFileRoute("/sleep")({
  head: () => ({ meta: [{ title: "Sleep — Forme" }] }),
  component: Sleep,
});

function fmt(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}h ${mm.toString().padStart(2, "0")}m`;
}

function Sleep() {
  const { profile } = useAuth();
  const [items, setItems] = useState<SleepEntry[] | null>(null);
  const [hours, setHours] = useState("");
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [show, setShow] = useState(false);

  const refresh = async () => {
    if (!profile) return;
    setItems(await listSleep(profile.uid));
  };
  useFocusRefetch(() => refresh(), [profile?.uid]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    let n = Number(hours);
    // Auto-compute hours from bedtime/wake if hours blank
    if ((!n || !Number.isFinite(n)) && bedtime && wakeTime) {
      const [bh, bm] = bedtime.split(":").map(Number);
      const [wh, wm] = wakeTime.split(":").map(Number);
      let mins = (wh * 60 + wm) - (bh * 60 + bm);
      if (mins < 0) mins += 24 * 60;
      n = +(mins / 60).toFixed(2);
    }
    if (!Number.isFinite(n) || n <= 0 || n > 16) return;
    await logSleep(profile.uid, n, { bedtime: bedtime || null, wakeTime: wakeTime || null });
    setHours(""); setBedtime(""); setWakeTime(""); setShow(false); await refresh();
  };
  const remove = async (id: string) => { await deleteSleep(id); await refresh(); };

  if (!profile) return null;
  const latest = items?.[0];
  const week = items?.slice(0, 7).reverse() ?? [];
  const avg = items && items.length ? items.reduce((a, b) => a + b.hours, 0) / items.length : null;

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto no-scrollbar px-6 pt-14 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="size-10 -ml-2 flex items-center justify-center"><ChevronLeft className="size-5" /></Link>
          <h1 className="text-base font-semibold">Sleep</h1>
          <button onClick={() => setShow(true)} className="size-10 -mr-2 flex items-center justify-center"><Plus className="size-5" /></button>
        </div>

        {items === null ? (
          <p className="mt-10 text-sm text-foreground/40">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-8 surface p-8 text-center">
            <Moon className="size-8 text-foreground/30 mx-auto" />
            <p className="mt-3 text-sm text-foreground/60">No sleep data yet</p>
            <button onClick={() => setShow(true)} className="mt-5 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-black text-white font-semibold text-sm">
              <Plus className="size-4" /> Log sleep
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 surface p-6">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-black flex items-center justify-center">
                  <Moon className="size-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Latest</p>
                  <p className="text-3xl font-bold tracking-tight">{latest ? fmt(latest.hours) : "—"}</p>
                </div>
              </div>
            </div>
            {week.length > 0 && (
              <div className="mt-4 surface p-5">
                <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Recent</p>
                <div className="mt-4 flex items-end justify-between gap-2 h-36">
                  {week.map((s, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full rounded-t-lg bg-foreground/80" style={{ height: `${Math.min(100, (s.hours / 10) * 100)}%` }} />
                      <span className="text-[10px] text-foreground/40">{s.createdAt.toLocaleDateString(undefined, { weekday: "short" })[0]}</span>
                    </div>
                  ))}
                </div>
                {avg !== null && <p className="mt-4 text-xs text-foreground/60">Average <span className="font-semibold text-foreground">{fmt(avg)}</span></p>}
              </div>
            )}
            <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">History</h2>
            <div className="mt-3 surface divide-y divide-black/5">
              {items.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{fmt(s.hours)}</p>
                    <p className="text-xs text-foreground/40">{s.createdAt.toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => remove(s.id)} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {show && (
          <form onSubmit={submit} className="mt-5 surface p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-foreground/60">Bedtime
                <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-secondary px-3 text-sm" />
              </label>
              <label className="text-xs font-medium text-foreground/60">Wake up
                <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-secondary px-3 text-sm" />
              </label>
            </div>
            <input type="number" step="0.1" min="0" max="16" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Or just enter hours slept" className="w-full h-11 rounded-xl bg-secondary px-3 text-sm" />
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 h-11 rounded-full bg-accent text-white text-sm font-semibold">Save</button>
              <button type="button" onClick={() => setShow(false)} className="h-11 px-4 rounded-full bg-secondary text-sm">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </PhoneFrame>
  );
}
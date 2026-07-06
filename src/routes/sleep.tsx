import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Moon, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { deleteSleep, logSleep, subscribeSleep, updateSleep, type SleepEntry } from "@/lib/sleep";

export const Route = createFileRoute("/sleep")({
  head: () => ({ meta: [{ title: "Sleep — Forme" }] }),
  component: Sleep,
});

function fmt(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}h ${mm.toString().padStart(2, "0")}m`;
}

function QualityStars({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-1">
          <Star className={`size-6 ${value && value >= n ? "fill-accent text-accent" : "text-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
}

function Sleep() {
  const { profile } = useAuth();
  const [items, setItems] = useState<SleepEntry[] | null>(null);
  const [hours, setHours] = useState("");
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [quality, setQuality] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<SleepEntry | null>(null);
  const [eHours, setEHours] = useState("");
  const [eBed, setEBed] = useState("");
  const [eWake, setEWake] = useState("");
  const [eQuality, setEQuality] = useState<number | null>(null);

  useEffect(() => {
    if (!profile) return;
    const unsub = subscribeSleep(profile.uid, setItems);
    return () => unsub();
  }, [profile]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    let n = Number(hours);
    if ((!n || !Number.isFinite(n)) && bedtime && wakeTime) {
      const [bh, bm] = bedtime.split(":").map(Number);
      const [wh, wm] = wakeTime.split(":").map(Number);
      let mins = (wh * 60 + wm) - (bh * 60 + bm);
      if (mins < 0) mins += 24 * 60;
      n = +(mins / 60).toFixed(2);
    }
    if (!Number.isFinite(n) || n <= 0 || n > 16) return;
    await logSleep(profile.uid, n, { bedtime: bedtime || null, wakeTime: wakeTime || null, quality });
    setHours(""); setBedtime(""); setWakeTime(""); setQuality(null); setShow(false);
  };
  const remove = async (id: string) => { await deleteSleep(id); };

  const openEdit = (s: SleepEntry) => {
    setEditing(s);
    setEHours(String(s.hours));
    setEBed(s.bedtime ?? "");
    setEWake(s.wakeTime ?? "");
    setEQuality(s.quality ?? null);
  };
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    let n = Number(eHours);
    if ((!n || !Number.isFinite(n)) && eBed && eWake) {
      const [bh, bm] = eBed.split(":").map(Number);
      const [wh, wm] = eWake.split(":").map(Number);
      let mins = (wh * 60 + wm) - (bh * 60 + bm);
      if (mins < 0) mins += 24 * 60;
      n = +(mins / 60).toFixed(2);
    }
    if (!Number.isFinite(n) || n <= 0 || n > 16) return;
    await updateSleep(editing.id, { hours: n, bedtime: eBed || null, wakeTime: eWake || null, quality: eQuality });
    setEditing(null);
  };

  if (!profile) return null;
  const latest = items?.[0];
  const week = items?.slice(0, 7).reverse() ?? [];
  const now = Date.now();
  const weekItems = (items ?? []).filter((s) => now - s.createdAt.getTime() <= 7 * 86400_000);
  const monthItems = (items ?? []).filter((s) => now - s.createdAt.getTime() <= 30 * 86400_000);
  const weekAvg = weekItems.length ? weekItems.reduce((a, b) => a + b.hours, 0) / weekItems.length : null;
  const monthAvg = monthItems.length ? monthItems.reduce((a, b) => a + b.hours, 0) / monthItems.length : null;
  const isSameDay = (d: Date) => { const t = new Date(); return d.toDateString() === t.toDateString(); };
  const today = (items ?? []).find((s) => isSameDay(s.createdAt));

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
                  <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">{today ? "Today" : "Latest"}</p>
                  <p className="text-3xl font-bold tracking-tight">{today ? fmt(today.hours) : latest ? fmt(latest.hours) : "—"}</p>
                  {(today?.quality ?? latest?.quality) && (
                    <div className="flex gap-0.5 mt-1">
                      {[1,2,3,4,5].map((n) => <Star key={n} className={`size-3 ${(today?.quality ?? latest?.quality ?? 0) >= n ? "fill-accent text-accent" : "text-foreground/20"}`} />)}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-secondary p-3">
                  <p className="text-[11px] text-foreground/50 font-medium">Weekly avg</p>
                  <p className="text-lg font-bold tracking-tight">{weekAvg ? fmt(weekAvg) : "—"}</p>
                </div>
                <div className="rounded-2xl bg-secondary p-3">
                  <p className="text-[11px] text-foreground/50 font-medium">Monthly avg</p>
                  <p className="text-lg font-bold tracking-tight">{monthAvg ? fmt(monthAvg) : "—"}</p>
                </div>
              </div>
            </div>
            {week.length > 0 && (
              <div className="mt-4 surface p-5">
                <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Last 7 days</p>
                <div className="mt-4 flex items-end justify-between gap-2 h-36">
                  {week.map((s, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full rounded-t-lg bg-foreground/80" style={{ height: `${Math.min(100, (s.hours / 10) * 100)}%` }} />
                      <span className="text-[10px] text-foreground/40">{s.createdAt.toLocaleDateString(undefined, { weekday: "short" })[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h2 className="mt-7 text-xs uppercase tracking-wider font-semibold text-foreground/40">History</h2>
            <div className="mt-3 surface divide-y divide-black/5">
              {items.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{fmt(s.hours)}</p>
                    <p className="text-xs text-foreground/40">
                      {s.createdAt.toLocaleDateString()}
                      {s.bedtime && s.wakeTime ? ` · ${s.bedtime}–${s.wakeTime}` : ""}
                      {s.quality ? ` · ${"★".repeat(s.quality)}` : ""}
                    </p>
                  </div>
                  <button onClick={() => openEdit(s)} className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground/60"><Pencil className="size-4" /></button>
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
            <div className="pt-1">
              <p className="text-xs font-medium text-foreground/60 mb-1">Quality</p>
              <QualityStars value={quality} onChange={setQuality} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 h-11 rounded-full bg-accent text-white text-sm font-semibold">Save</button>
              <button type="button" onClick={() => setShow(false)} className="h-11 px-4 rounded-full bg-secondary text-sm">Cancel</button>
            </div>
          </form>
        )}

        {editing && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
            <form onSubmit={saveEdit} className="relative w-full max-w-md mx-4 mb-6 rounded-3xl bg-background border shadow-2xl p-5 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-semibold">Edit sleep</h3>
                <button type="button" onClick={() => setEditing(null)} className="size-8 rounded-full bg-secondary flex items-center justify-center"><X className="size-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-medium text-foreground/60">Bedtime
                  <input type="time" value={eBed} onChange={(e) => setEBed(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-secondary px-3 text-sm" />
                </label>
                <label className="text-xs font-medium text-foreground/60">Wake up
                  <input type="time" value={eWake} onChange={(e) => setEWake(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-secondary px-3 text-sm" />
                </label>
              </div>
              <input type="number" step="0.1" min="0" max="16" value={eHours} onChange={(e) => setEHours(e.target.value)} placeholder="Hours" className="w-full h-11 rounded-xl bg-secondary px-3 text-sm" />
              <div className="pt-1">
                <p className="text-xs font-medium text-foreground/60 mb-1">Quality</p>
                <QualityStars value={eQuality} onChange={setEQuality} />
              </div>
              <button type="submit" className="w-full h-11 rounded-full bg-accent text-white text-sm font-semibold mt-2">Save changes</button>
            </form>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
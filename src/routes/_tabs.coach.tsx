import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, ArrowUp, Mic } from "lucide-react";
import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_tabs/coach")({
  head: () => ({ meta: [{ title: "AI Coach — Forme" }] }),
  component: Coach,
});

type Msg = { id: string; role: "user" | "assistant"; text: string };

const suggestions = ["Plan my week", "Recovery tips", "Adjust my macros", "Why am I plateauing?"];

function Coach() {
  const { user, profile } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(getDb(), "messages"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMsgs(snap.docs.map((d) => {
        const data = d.data() as { role: "user" | "assistant"; text: string };
        return { id: d.id, role: data.role, text: data.text };
      }));
    });
    return () => unsub();
  }, [user]);

  const send = async (text: string) => {
    if (!text.trim() || !user) return;
    setInput("");
    const col = collection(getDb(), "messages");
    await addDoc(col, { uid: user.uid, role: "user", text, createdAt: Timestamp.now() });
    const goalReply: Record<string, string> = {
      weight_loss: "Stay in a small calorie deficit and prioritise protein — you've got this.",
      muscle_gain: "Push for progressive overload today and keep protein at 1.6g/kg.",
      maintain: "Consistency beats intensity. Keep your routine steady today.",
    };
    const reply = profile ? goalReply[profile.goal] ?? "Got it — let's keep moving." : "Got it.";
    await addDoc(col, { uid: user.uid, role: "assistant", text: reply, createdAt: Timestamp.now() });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-14 pb-3 sticky top-0 glass z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-black flex items-center justify-center">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">AI Coach</h1>
            <p className="text-xs text-foreground/50 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Online · personalised
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pb-40 space-y-3 overflow-y-auto no-scrollbar">
        {msgs.length === 0 && (
          <p className="text-center text-sm text-foreground/40 mt-10">Say hi to your AI coach.</p>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2.5 text-[15px] leading-snug ${
                m.role === "user"
                  ? "bg-accent text-white rounded-3xl rounded-br-md"
                  : "bg-secondary text-foreground rounded-3xl rounded-bl-md"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-24 left-0 right-0 px-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="glass shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="glass rounded-full flex items-center gap-2 px-2 py-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-foreground/40"
          />
          <button type="button" className="size-9 rounded-full flex items-center justify-center text-foreground/60">
            <Mic className="size-4" />
          </button>
          <button type="submit" className="size-9 rounded-full bg-black text-white flex items-center justify-center active:scale-95 transition">
            <ArrowUp className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
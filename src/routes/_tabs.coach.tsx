import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, ArrowUp, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { addDoc, collection, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { coachSystemPrompt, MissingGroqKeyError, streamGroqChat, type GroqMessage } from "@/lib/groq";

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
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastUserRef = useRef<string | null>(null);

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [msgs, streaming]);

  const runCompletion = async (text: string) => {
    if (!user) return;
    setError(null);
    setBusy(true);
    setStreaming("");
    try {
      const history: GroqMessage[] = msgs.map((m) => ({ role: m.role, content: m.text }));
      const messages: GroqMessage[] = [
        { role: "system", content: coachSystemPrompt(profile) },
        ...history,
        { role: "user", content: text },
      ];
      let acc = "";
      await streamGroqChat(messages, (delta) => {
        acc += delta;
        setStreaming(acc);
      });
      await addDoc(collection(getDb(), "messages"), {
        uid: user.uid, role: "assistant", text: acc, createdAt: Timestamp.now(),
      });
      setStreaming(null);
    } catch (err) {
      setStreaming(null);
      if (err instanceof MissingGroqKeyError) setError(err.message);
      else setError(err instanceof Error ? err.message : "Failed to reach AI coach");
    } finally {
      setBusy(false);
    }
  };

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || !user || busy) return;
    setInput("");
    lastUserRef.current = t;
    await addDoc(collection(getDb(), "messages"), {
      uid: user.uid, role: "user", text: t, createdAt: Timestamp.now(),
    });
    await runCompletion(t);
  };

  const retry = async () => {
    if (!lastUserRef.current) return;
    await runCompletion(lastUserRef.current);
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

      <div ref={scrollRef} className="flex-1 px-5 pb-40 space-y-3 overflow-y-auto no-scrollbar">
        {msgs.length === 0 && !streaming && (
          <p className="text-center text-sm text-foreground/40 mt-10">Say hi to your AI coach.</p>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2.5 text-[15px] leading-snug whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-accent text-white rounded-3xl rounded-br-md"
                  : "bg-secondary text-foreground rounded-3xl rounded-bl-md"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {streaming !== null && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-2.5 text-[15px] leading-snug bg-secondary text-foreground rounded-3xl rounded-bl-md whitespace-pre-wrap">
              {streaming || <span className="inline-flex gap-1"><Dot/><Dot delay={150}/><Dot delay={300}/></span>}
            </div>
          </div>
        )}
        {error && (
          <div className="mx-auto max-w-[85%] px-4 py-3 text-xs rounded-2xl bg-destructive/10 text-destructive flex items-center gap-2 justify-between">
            <span className="flex-1">{error}</span>
            <button onClick={retry} className="flex items-center gap-1 font-semibold"><RotateCcw className="size-3" /> Retry</button>
          </div>
        )}
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
          <button type="submit" disabled={busy || !input.trim()} className="size-9 rounded-full bg-black text-white flex items-center justify-center active:scale-95 transition disabled:opacity-40">
            <ArrowUp className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return <span className="inline-block size-1.5 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: `${delay}ms` }} />;
}
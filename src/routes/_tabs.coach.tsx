import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, ArrowUp, Mic } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_tabs/coach")({
  head: () => ({ meta: [{ title: "AI Coach — Forme" }] }),
  component: Coach,
});

type Msg = { role: "user" | "assistant"; text: string };

const seed: Msg[] = [
  { role: "assistant", text: "Good morning, Alex. I noticed you slept 7h 42m and hit your protein goal yesterday. Ready for today's session?" },
  { role: "user", text: "Yeah but my shoulders are tight." },
  { role: "assistant", text: "Let's swap the overhead press for landmine press today and add 5 min of band mobility. Your bench numbers won't suffer — promise." },
];

const suggestions = ["Plan my week", "Recovery tips", "Adjust my macros", "Why am I plateauing?"];

function Coach() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "assistant", text: "Got it — let me think through that for you…" }]);
    setInput("");
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
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
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
import type { UserProfile } from "./auth";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export type GroqMessage = { role: "system" | "user" | "assistant"; content: string };

export class MissingGroqKeyError extends Error {
  constructor() {
    super("Missing VITE_GROQ_API_KEY. Add it in Workspace Settings → Build Secrets or your .env file, then reload.");
    this.name = "MissingGroqKeyError";
  }
}

function getKey(): string {
  const key = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim();
  if (!key) throw new MissingGroqKeyError();
  return key;
}

export function coachSystemPrompt(profile: UserProfile | null): string {
  const goal = profile?.goal ?? "maintain";
  const goalLabel: Record<string, string> = {
    weight_loss: "weight loss",
    muscle_gain: "muscle gain",
    maintain: "general fitness maintenance",
  };
  const lines = [
    "You are Forme, a calm, knowledgeable, evidence-based personal fitness coach.",
    "Be concise, friendly, and practical. Use short paragraphs and bullet points.",
    "Never give medical advice — refer to a clinician for medical concerns.",
    "Tailor every reply to the user's profile.",
  ];
  if (profile) {
    lines.push(
      `User profile: name=${profile.name}, age=${profile.age}, gender=${profile.gender}, height=${profile.height}cm, weight=${profile.weight}kg, goal=${goalLabel[goal]}, current streak=${profile.streak ?? 0} days.`,
    );
  }
  return lines.join("\n");
}

/** Streaming chat — calls onDelta with incremental text. Returns full text. */
export async function streamGroqChat(
  messages: GroqMessage[],
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages, stream: true, temperature: 0.7 }),
    signal,
  });
  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Groq error ${res.status}: ${txt || res.statusText}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const j = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
        const delta = j.choices?.[0]?.delta?.content;
        if (delta) { full += delta; onDelta(delta); }
      } catch { /* ignore partial frames */ }
    }
  }
  return full;
}

/** Non-streaming JSON completion. */
export async function groqJSON<T>(messages: GroqMessage[]): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Groq error ${res.status}: ${txt || res.statusText}`);
  }
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = j.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content) as T;
}
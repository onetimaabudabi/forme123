import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "system" | "light" | "dark";
const KEY = "forme.theme";

type Ctx = { mode: ThemeMode; resolved: "light" | "dark"; setMode: (m: ThemeMode) => void };
const ThemeCtx = createContext<Ctx | null>(null);

function resolve(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function apply(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved === "dark" ? "#0b1220" : "#ffffff");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem(KEY) as ThemeMode | null)) || "system";
    setModeState(stored);
    const r = resolve(stored);
    setResolved(r);
    apply(r);
    if (stored === "system" && typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => { const r2 = resolve("system"); setResolved(r2); apply(r2); };
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    try { localStorage.setItem(KEY, m); } catch { /* ignore */ }
    const r = resolve(m);
    setResolved(r);
    apply(r);
  };

  return <ThemeCtx.Provider value={{ mode, resolved, setMode }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
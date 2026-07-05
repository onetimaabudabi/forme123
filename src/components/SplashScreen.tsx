import { useEffect, useState } from "react";

type Phase = "entering" | "visible" | "exiting" | "done";

export function SplashScreen({ loading }: { loading: boolean }) {
  const [phase, setPhase] = useState<Phase>("entering");

  useEffect(() => {
    const raf = requestAnimationFrame(() => setPhase("visible"));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!loading && phase === "visible") {
      setPhase("exiting");
      const timer = setTimeout(() => setPhase("done"), 600);
      return () => clearTimeout(timer);
    }
  }, [loading, phase]);

  if (phase === "done") return null;

  const entering = phase === "entering";
  const exiting = phase === "exiting";

  return (
    <div
      className={[
        "absolute inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-out",
        exiting ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div
        className={[
          "flex flex-col items-center transition-all duration-700",
          entering
            ? "opacity-0 scale-[0.85] translate-y-4"
            : exiting
            ? "opacity-0 scale-[0.96] translate-y-1"
            : "opacity-100 scale-100 translate-y-0",
        ].join(" ")}
        style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        <img
          src="/icon-512.png"
          alt="Forme"
          className="h-24 w-24 rounded-[22%] shadow-2xl"
        />
        <h1 className="mt-5 text-[28px] font-semibold tracking-tight text-foreground">
          Forme
        </h1>
      </div>
    </div>
  );
}

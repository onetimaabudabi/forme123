import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Dumbbell, Sparkles, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome to Forme" }] }),
  component: Onboarding,
});

const slides = [
  { icon: Dumbbell, title: "Train smarter,\nnot harder.", body: "Personalised plans that adapt to your recovery, schedule, and goals." },
  { icon: Sparkles, title: "Your AI coach,\non call 24/7.", body: "Get real-time guidance on form, nutrition, and recovery — designed just for you." },
  { icon: BarChart3, title: "See every win,\nmeasured.", body: "Beautiful analytics that show what's working and what to change next." },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const slide = slides[i];
  const Icon = slide.icon;
  const last = i === slides.length - 1;

  return (
    <PhoneFrame>
      <div className="h-full flex flex-col px-7 pt-16 pb-10">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">Forme</span>
          <Link to="/signin" className="text-sm text-foreground/50 font-medium">Skip</Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="size-20 rounded-3xl bg-secondary flex items-center justify-center mb-10">
            <Icon className="size-10" />
          </div>
          <h1 className="text-[40px] leading-[1.05] font-bold tracking-tight whitespace-pre-line">{slide.title}</h1>
          <p className="mt-5 text-[17px] text-foreground/55 leading-relaxed">{slide.body}</p>
        </div>

        <div className="flex items-center gap-1.5 justify-center mb-6">
          {slides.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-foreground" : "w-1.5 bg-foreground/15"}`} />
          ))}
        </div>

        {last ? (
          <Link to="/signin" className="w-full h-14 rounded-full bg-black text-white flex items-center justify-center font-semibold text-base active:scale-[0.98] transition">
            Get started
          </Link>
        ) : (
          <button onClick={() => setI(i + 1)} className="w-full h-14 rounded-full bg-black text-white flex items-center justify-center font-semibold text-base active:scale-[0.98] transition">
            Continue
          </button>
        )}
      </div>
    </PhoneFrame>
  );
}
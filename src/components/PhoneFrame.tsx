import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-0 sm:p-8">
      <div className="relative w-full sm:w-[420px] sm:h-[860px] h-screen bg-background sm:rounded-[3rem] overflow-hidden sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] sm:border sm:border-black/5">
        {children}
      </div>
    </div>
  );
}
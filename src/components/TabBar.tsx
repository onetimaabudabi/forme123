import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Dumbbell, Sparkles, BarChart3, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/coach", label: "AI Coach", icon: Sparkles },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function TabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-2 z-50">
      <div className="glass rounded-full flex items-center justify-between px-3 py-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]">
        {tabs.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-full transition-all duration-300 px-3 py-2 ${
                active ? "text-accent" : "text-foreground/50"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
              <span className="text-[10px] font-medium tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
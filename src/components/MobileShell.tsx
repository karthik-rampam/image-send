import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutDashboard, Camera, History, Settings } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "Scan", icon: Camera, primary: true },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-white/85 backdrop-blur-xl">
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map(({ to, label, icon: Icon, primary }) => {
          const active = pathname === to;
          if (primary) {
            return (
              <li key={to} className="flex items-center justify-center">
                <Link
                  to={to}
                  className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[var(--shadow-soft)] transition-transform active:scale-95"
                  style={{ background: "var(--gradient-primary)" }}
                  aria-label={label}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </Link>
              </li>
            );
          }
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
                {active && <span className="h-1 w-1 rounded-full bg-primary" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileShell({
  children,
  hideNav = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[oklch(0.97_0.008_270)] px-0 py-0 md:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background md:min-h-[900px] md:rounded-[2.5rem] md:shadow-[0_30px_80px_-20px_rgba(91,92,235,0.25)] md:ring-1 md:ring-black/5 md:overflow-hidden">
        <div className="flex flex-1 flex-col">{children}</div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Menu, CheckCircle2, XCircle, Upload, TrendingUp, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { loadHistory, formatDateTime, type HistoryItem } from "@/lib/history-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Image Sender" }] }),
  component: DashboardPage,
});

function toneClass(tone: "success" | "danger" | "primary" | "accent") {
  switch (tone) {
    case "success":
      return "bg-[color:var(--success)]/12 text-[color:var(--success)]";
    case "danger":
      return "bg-[color:var(--danger)]/12 text-[color:var(--danger)]";
    case "accent":
      return "bg-[oklch(0.6_0.24_295)]/12 text-[oklch(0.55_0.22_295)]";
    default:
      return "bg-primary/12 text-primary";
  }
}

function DashboardPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    setItems(loadHistory());
  }, []);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfDay - now.getDay() * 24 * 60 * 60 * 1000;
  const total = items.length;
  const successful = items.filter((i) => i.status === "Success").length;
  const failed = items.filter((i) => i.status === "Failed").length;
  const todaySent = items.filter((i) => i.timestamp >= startOfDay).length;
  const weekSent = items.filter((i) => i.timestamp >= startOfWeek).length;

  const stats = [
    { label: "Successful", value: successful, icon: CheckCircle2, tone: "success" as const },
    { label: "Failed", value: failed, icon: XCircle, tone: "danger" as const },
    { label: "Today Sent", value: todaySent, icon: Upload, tone: "primary" as const },
    { label: "This Week", value: weekSent, icon: TrendingUp, tone: "accent" as const },
  ];
  const activity = items.slice(0, 4);

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-white/75 px-5 py-4 backdrop-blur-xl">
        <button
          aria-label="Menu"
          className="rounded-full p-2 text-foreground/70 hover:bg-secondary"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-[15px] font-semibold tracking-tight">Dashboard</h1>
        <button
          aria-label="Notifications"
          className="rounded-full p-2 text-foreground/70 hover:bg-secondary"
        >
          <Bell className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-1 space-y-5 px-5 pb-8 pt-4">
        {/* Hero stat */}
        <div
          className="relative overflow-hidden rounded-3xl p-5 text-white shadow-[var(--shadow-soft)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <p className="text-xs font-medium uppercase tracking-wider text-white/80">
            Total Images Sent
          </p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-4xl font-bold tracking-tight">{total}</p>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              <Upload className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-1 text-xs text-white/80">All time</p>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${toneClass(s.tone)}`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-medium text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 text-2xl font-bold tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <section className="rounded-3xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[15px] font-semibold">Recent Activity</h2>
            <Link
              to="/history"
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {activity.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No activity yet. Capture your first image to get started.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {activity.map((a) => {
                const dt = formatDateTime(a.timestamp);
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-secondary">
                      <img src={a.dataUrl} alt={a.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{a.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {dt.date}, {dt.time}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </MobileShell>
  );
}

function StatusBadge({ status }: { status: "Success" | "Failed" | "Pending" }) {
  const map = {
    Success: "bg-[color:var(--success)]/12 text-[color:var(--success)]",
    Failed: "bg-[color:var(--danger)]/12 text-[color:var(--danger)]",
    Pending: "bg-amber-500/12 text-amber-600",
  } as const;
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

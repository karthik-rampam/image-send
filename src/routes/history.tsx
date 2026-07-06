import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search, SlidersHorizontal, MoreVertical, ImageIcon } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Image History · Image Sender" }] }),
  component: HistoryPage,
});

const items = [
  { name: "IMG_20250517_102030.jpg", date: "17 May 2025", time: "10:20 AM", size: "2.45 MB", status: "Success" as const },
  { name: "IMG_20250517_101015.jpg", date: "17 May 2025", time: "10:10 AM", size: "2.10 MB", status: "Success" as const },
  { name: "IMG_20250517_095500.jpg", date: "17 May 2025", time: "09:55 AM", size: "1.98 MB", status: "Failed" as const },
  { name: "IMG_20250517_094512.jpg", date: "17 May 2025", time: "09:45 AM", size: "2.22 MB", status: "Success" as const },
  { name: "IMG_20250517_093000.jpg", date: "17 May 2025", time: "09:30 AM", size: "2.15 MB", status: "Pending" as const },
  { name: "IMG_20250517_092030.jpg", date: "17 May 2025", time: "09:20 AM", size: "1.75 MB", status: "Success" as const },
];

function HistoryPage() {
  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-white/80 px-5 py-4 backdrop-blur-xl">
        <Link to="/" className="rounded-full p-2 text-foreground/70 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-[15px] font-semibold tracking-tight">Image History</h1>
        <span className="w-9" />
      </header>

      <main className="flex-1 space-y-4 px-5 pb-8 pt-4">
        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search images..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <ul className="space-y-2.5">
          {items.map((i) => (
            <li key={i.name} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-[var(--shadow-card)]">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{i.name}</p>
                  <StatusBadge status={i.status} />
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {i.date}, {i.time} · {i.size}
                </p>
              </div>
              <button className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
                <MoreVertical className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
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
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}
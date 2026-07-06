import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ImageIcon,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  loadHistory,
  saveHistory,
  formatDateTime,
  formatBytes,
  type HistoryItem,
} from "@/lib/history-store";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Image History · Image Sender" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [viewer, setViewer] = useState<HistoryItem | null>(null);
  useEffect(() => {
    setItems(loadHistory());
  }, []);
  const filtered = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );
  function removeItem(id: string) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveHistory(next);
  }

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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search images..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <ImageIcon className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold">No images yet</p>
            <p className="max-w-[240px] text-xs text-muted-foreground">
              Captured images you send will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((i) => {
              const dt = formatDateTime(i.timestamp);
              return (
                <li
                  key={i.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-[var(--shadow-card)]"
                >
                  <button
                    type="button"
                    onClick={() => setViewer(i)}
                    className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary transition-transform active:scale-95"
                    aria-label={`Open ${i.name}`}
                  >
                    <img src={i.dataUrl} alt={i.name} className="h-full w-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewer(i)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{i.name}</p>
                      <StatusBadge status={i.status} />
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {dt.date}, {dt.time} · {formatBytes(i.sizeBytes)}
                    </p>
                  </button>
                  <button
                    onClick={() => removeItem(i.id)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <Dialog open={viewer !== null} onOpenChange={(o) => !o && setViewer(null)}>
        <DialogContent className="max-w-[95vw] gap-3 rounded-2xl p-3 sm:max-w-lg">
          {viewer && (
            <>
              <div className="overflow-hidden rounded-xl bg-black">
                <img
                  src={viewer.dataUrl}
                  alt={viewer.name}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
              <div className="flex items-start justify-between gap-3 px-1">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{viewer.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDateTime(viewer.timestamp).date},{" "}
                    {formatDateTime(viewer.timestamp).time} · {viewer.width}×{viewer.height} ·{" "}
                    {formatBytes(viewer.sizeBytes)}
                  </p>
                </div>
                <StatusBadge status={viewer.status} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
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

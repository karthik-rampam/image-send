import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Sun, Focus, Ruler, Aperture, HardDrive, RefreshCw, Send } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";

export const Route = createFileRoute("/quality")({
  head: () => ({ meta: [{ title: "Image Quality Check · Image Sender" }] }),
  component: QualityPage,
});

const checks = [
  { label: "Resolution", icon: Ruler, value: "3024×4032" },
  { label: "Brightness", icon: Sun, value: "Good" },
  { label: "Sharpness", icon: Aperture, value: "Good" },
  { label: "Focus", icon: Focus, value: "Good" },
  { label: "File Size", icon: HardDrive, value: "2.4 MB" },
];

function QualityPage() {
  const navigate = useNavigate();
  return (
    <MobileShell hideNav>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-white/80 px-5 py-4 backdrop-blur-xl">
        <Link to="/scan" className="rounded-full p-2 text-foreground/70 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="text-center">
          <p className="text-[15px] font-semibold tracking-tight">Image Quality Check</p>
          <p className="text-[11px] text-muted-foreground">We check your image before sending</p>
        </div>
        <span className="w-9" />
      </header>

      <main className="flex-1 space-y-5 px-5 pb-8 pt-4">
        {/* Preview */}
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-secondary shadow-[var(--shadow-card)]">
          <div className="relative aspect-[4/3] w-full">
            <svg viewBox="0 0 400 300" className="h-full w-full">
              <defs>
                <linearGradient id="w" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f2ede4" />
                  <stop offset="100%" stopColor="#e0d9cc" />
                </linearGradient>
                <linearGradient id="f" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d9cdb8" />
                  <stop offset="100%" stopColor="#b8a487" />
                </linearGradient>
              </defs>
              <rect width="400" height="190" fill="url(#w)" />
              <rect y="190" width="400" height="110" fill="url(#f)" />
              <rect x="20" y="40" width="80" height="120" fill="#cfe6f5" opacity="0.7" stroke="#8aa3b3" strokeWidth="2" />
              <rect x="170" y="70" width="140" height="80" rx="4" fill="#1a1a1a" />
              <rect x="60" y="200" width="200" height="60" rx="10" fill="#c9beac" />
              <rect x="120" y="255" width="140" height="16" rx="4" fill="#8a7358" />
            </svg>
          </div>
        </div>

        {/* Checklist */}
        <div className="rounded-3xl border border-border/70 bg-card p-2 shadow-[var(--shadow-card)]">
          <ul className="divide-y divide-border/60">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-3 px-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  <c.icon className="h-4 w-4" />
                </div>
                <p className="flex-1 text-sm font-medium">{c.label}</p>
                <span className="text-xs text-muted-foreground">{c.value}</span>
                <CheckCircle2 className="h-5 w-5 text-[color:var(--success)]" />
              </li>
            ))}
          </ul>
        </div>

        {/* Info card */}
        <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--success)]/25 bg-[color:var(--success)]/8 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--success)]/15 text-[color:var(--success)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Image quality looks good</p>
            <p className="text-xs text-muted-foreground">This image is ready to send.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => navigate({ to: "/scan" })}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <RefreshCw className="h-4 w-4" />
            Retake
          </button>
          <button
            onClick={() => navigate({ to: "/history" })}
            className="flex h-14 flex-[1.4] items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98]"
            style={{ background: "var(--gradient-primary)" }}
          >
            Send Image
            <Send className="h-4 w-4" />
          </button>
        </div>
      </main>
    </MobileShell>
  );
}
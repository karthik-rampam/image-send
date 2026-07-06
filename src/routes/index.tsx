import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Menu, Camera, ShieldCheck, Send, ChevronRight, ArrowRight, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { loadHistory, formatDateTime, type HistoryItem } from "@/lib/history-store";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [last, setLast] = useState<HistoryItem | null>(null);
  useEffect(() => {
    const items = loadHistory();
    setLast(items[0] ?? null);
  }, []);

  return (
    <MobileShell>
      {/* Glass header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-white/75 px-5 py-4 backdrop-blur-xl">
        <button aria-label="Menu" className="rounded-full p-2 text-foreground/70 hover:bg-secondary">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: "var(--gradient-primary)" }}>
            <Send className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Image Sender</span>
        </div>
        <button aria-label="Notifications" className="relative rounded-full p-2 text-foreground/70 hover:bg-secondary">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>
      </header>

      <main className="flex-1 space-y-6 px-5 pb-8 pt-4">
        {/* Hero illustration */}
        <div className="relative mx-auto mt-2 flex h-56 w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[oklch(0.96_0.03_285)] to-[oklch(0.94_0.05_295)]">
          <div className="absolute -left-8 top-6 h-24 w-24 rounded-full bg-white/50 blur-2xl" />
          <div className="absolute -right-6 bottom-4 h-28 w-28 rounded-full bg-[oklch(0.7_0.2_295)]/30 blur-2xl" />
          <PhoneIllustration />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Capture & Send Images Securely</h1>
          <p className="mx-auto max-w-[300px] text-sm leading-relaxed text-muted-foreground">
            Capture an image from your phone and securely send it to another application for processing.
          </p>
        </div>

        <Link
          to="/scan"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-white shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Camera className="h-5 w-5" />
          New Scan
        </Link>

        {/* How it works */}
        <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">How it works</h2>
            <span className="text-xs text-muted-foreground">3 steps</span>
          </div>
          <ol className="space-y-3">
            {[
              { icon: Camera, title: "Capture Image", desc: "Take a photo using your camera" },
              { icon: ShieldCheck, title: "Quality Check", desc: "We verify the image before sending" },
              { icon: Send, title: "Send Image", desc: "Securely transmit to your application" },
            ].map((s, i) => (
              <li key={s.title} className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    <span className="mr-2 text-muted-foreground">Step {i + 1}</span>
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                {i < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground/40" />}
              </li>
            ))}
          </ol>
        </section>

        <Link
          to="/history"
          className="flex items-center justify-between rounded-3xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-secondary/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Last image sent</p>
              {last ? (
                <p className="text-sm font-semibold">
                  {formatDateTime(last.timestamp).date} · {formatDateTime(last.timestamp).time}
                </p>
              ) : (
                <p className="text-sm font-semibold">No images yet</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            {last ? last.status : "—"}
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      </main>
    </MobileShell>
  );
}

function PhoneIllustration() {
  return (
    <svg viewBox="0 0 220 200" className="h-44 w-auto drop-shadow-[0_10px_20px_rgba(91,92,235,0.25)]">
      <defs>
        <linearGradient id="phone" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#5B5CEB" />
          <stop offset="100%" stopColor="#7C4DFF" />
        </linearGradient>
      </defs>
      <rect x="70" y="20" width="90" height="160" rx="18" fill="url(#phone)" />
      <rect x="78" y="34" width="74" height="120" rx="10" fill="white" opacity="0.95" />
      <rect x="86" y="46" width="58" height="42" rx="6" fill="#EEF0FF" />
      <circle cx="102" cy="66" r="6" fill="#7C4DFF" opacity="0.6" />
      <path d="M92 82 L106 70 L120 82 L138 66 L138 88 L92 88 Z" fill="#5B5CEB" opacity="0.7" />
      <rect x="86" y="96" width="58" height="6" rx="3" fill="#E5E7F5" />
      <rect x="86" y="106" width="40" height="6" rx="3" fill="#E5E7F5" />
      <rect x="86" y="120" width="58" height="20" rx="8" fill="#5B5CEB" />
      {/* paper plane */}
      <path d="M172 62 L206 46 L192 90 L182 78 L172 82 Z" fill="#7C4DFF" />
      <path d="M182 78 L192 90 L188 74 Z" fill="#5B5CEB" />
      {/* dashed trajectory */}
      <path d="M160 100 Q 180 80 200 96" stroke="#7C4DFF" strokeWidth="2" strokeDasharray="3 4" fill="none" opacity="0.6" />
      {/* clouds */}
      <ellipse cx="40" cy="60" rx="20" ry="7" fill="white" opacity="0.9" />
      <ellipse cx="30" cy="150" rx="18" ry="6" fill="white" opacity="0.9" />
    </svg>
  );
}
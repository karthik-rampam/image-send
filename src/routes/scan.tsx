import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Zap, RefreshCw, Image as ImageIcon, Upload, Camera, Lightbulb } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "New Scan · Image Sender" }] }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  return (
    <MobileShell hideNav>
      <div className="relative flex min-h-screen flex-col bg-[oklch(0.15_0.02_270)] text-white">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 pt-5">
          <Link to="/" className="rounded-full bg-white/10 p-2.5 backdrop-blur-md">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <p className="text-[15px] font-semibold">New Scan</p>
            <p className="text-[11px] text-white/60">Capture a new image</p>
          </div>
          <button className="rounded-full bg-white/10 p-2.5 backdrop-blur-md">
            <Zap className="h-5 w-5" />
          </button>
        </header>

        {/* Camera preview */}
        <div className="relative mx-5 mt-5 flex-1 overflow-hidden rounded-[28px] bg-gradient-to-br from-[oklch(0.35_0.03_270)] to-[oklch(0.25_0.02_270)]">
          <FakeRoomScene />

          {/* Camera badge */}
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--success)]" />
            Camera
          </div>

          {/* Corner markers */}
          {[
            "left-4 top-4 border-l-2 border-t-2 rounded-tl-xl",
            "right-4 top-4 border-r-2 border-t-2 rounded-tr-xl",
            "left-4 bottom-4 border-l-2 border-b-2 rounded-bl-xl",
            "right-4 bottom-4 border-r-2 border-b-2 rounded-br-xl",
          ].map((c) => (
            <span key={c} className={`absolute h-8 w-8 border-white/80 ${c}`} />
          ))}
          {/* Center guide */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="h-8 w-px bg-white/40" />
            <span className="h-px w-8 -ml-4 bg-white/40" />
          </div>
        </div>

        {/* Controls */}
        <div className="px-5 pt-6">
          <div className="flex items-center justify-between">
            <button className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-2xl bg-white/10 text-white backdrop-blur-md">
              <ImageIcon className="h-5 w-5" />
              <span className="text-[9px] font-medium">Gallery</span>
            </button>

            <button
              onClick={() => navigate({ to: "/quality" })}
              aria-label="Capture"
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-[0_10px_30px_rgba(91,92,235,0.5)] transition-transform active:scale-95"
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Camera className="h-7 w-7" />
              </span>
            </button>

            <button className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-2xl bg-white/10 text-white backdrop-blur-md">
              <RefreshCw className="h-5 w-5" />
              <span className="text-[9px] font-medium">Flip</span>
            </button>
          </div>

          {/* Tip */}
          <div className="mt-5 mb-6 flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
            <Lightbulb className="mt-0.5 h-4 w-4 text-amber-300" />
            <div className="text-[12px] leading-relaxed text-white/90">
              <p className="font-semibold">Tips for best results</p>
              <p className="text-white/70">Good lighting · Avoid blur · Hold steady</p>
            </div>
            <button className="ml-auto rounded-full bg-white/10 p-2">
              <Upload className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function FakeRoomScene() {
  return (
    <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full opacity-90">
      <defs>
        <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d9cdb8" />
          <stop offset="100%" stopColor="#b8a487" />
        </linearGradient>
        <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f2ede4" />
          <stop offset="100%" stopColor="#e0d9cc" />
        </linearGradient>
      </defs>
      <rect width="400" height="320" fill="url(#wall)" />
      <rect y="320" width="400" height="180" fill="url(#floor)" />
      {/* window */}
      <rect x="20" y="60" width="100" height="180" fill="#cfe6f5" opacity="0.7" />
      <rect x="20" y="60" width="100" height="180" fill="none" stroke="#8aa3b3" strokeWidth="3" />
      <line x1="70" y1="60" x2="70" y2="240" stroke="#8aa3b3" strokeWidth="2" />
      {/* TV */}
      <rect x="180" y="120" width="140" height="80" rx="4" fill="#1a1a1a" />
      {/* sofa */}
      <rect x="60" y="330" width="200" height="70" rx="10" fill="#c9beac" />
      <rect x="70" y="310" width="180" height="40" rx="8" fill="#d9cdb8" />
      {/* coffee table */}
      <rect x="120" y="410" width="140" height="20" rx="4" fill="#8a7358" />
      {/* plant */}
      <rect x="310" y="340" width="40" height="50" rx="4" fill="#5a4a38" />
      <path d="M310 340 Q330 280 320 260 Q340 290 350 340 Q345 300 360 280 Q360 320 350 340 Z" fill="#4a7a4a" />
    </svg>
  );
}
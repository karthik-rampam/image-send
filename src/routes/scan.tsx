import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Zap,
  RefreshCw,
  Image as ImageIcon,
  Camera,
  Lightbulb,
  ZapOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "New Scan · Image Sender" }] }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [torch, setTorch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      setError(null);
      setReady(false);
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera not supported on this device.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setReady(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unable to access camera.";
        setError(msg);
      }
    }
    start();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [facing]);

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const caps = (track.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean };
    if (!caps.torch) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] });
      setTorch(!torch);
    } catch {
      /* noop */
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !ready) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    try {
      sessionStorage.setItem("last-capture", dataUrl);
      sessionStorage.setItem("last-capture-meta", JSON.stringify({ w, h, ts: Date.now() }));
    } catch {
      /* noop */
    }
    navigate({ to: "/quality" });
  }

  function onGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const img = new Image();
      img.onload = () => {
        try {
          sessionStorage.setItem("last-capture", dataUrl);
          sessionStorage.setItem(
            "last-capture-meta",
            JSON.stringify({ w: img.naturalWidth, h: img.naturalHeight, ts: Date.now() }),
          );
        } catch {
          /* noop */
        }
        navigate({ to: "/quality" });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

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
          <button
            onClick={toggleTorch}
            aria-label="Flash"
            className="rounded-full bg-white/10 p-2.5 backdrop-blur-md"
          >
            {torch ? <Zap className="h-5 w-5 text-amber-300" /> : <ZapOff className="h-5 w-5" />}
          </button>
        </header>

        {/* Camera preview */}
        <div className="relative mx-5 mt-5 flex-1 overflow-hidden rounded-[28px] bg-gradient-to-br from-[oklch(0.35_0.03_270)] to-[oklch(0.25_0.02_270)]">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`absolute inset-0 h-full w-full object-cover ${facing === "user" ? "scale-x-[-1]" : ""}`}
          />
          {!ready && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70">
              Starting camera…
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="text-sm font-semibold text-white">Camera unavailable</p>
              <p className="text-xs text-white/70">{error}</p>
              <p className="text-[11px] text-white/50">
                Allow camera access, or use Gallery below.
              </p>
            </div>
          )}

          {/* Camera badge */}
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
            <span
              className={`h-2 w-2 animate-pulse rounded-full ${ready ? "bg-[color:var(--success)]" : "bg-amber-400"}`}
            />
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
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-2xl bg-white/10 text-white backdrop-blur-md"
            >
              <ImageIcon className="h-5 w-5" />
              <span className="text-[9px] font-medium">Gallery</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onGallery}
            />

            <button
              onClick={capture}
              disabled={!ready}
              aria-label="Capture"
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-[0_10px_30px_rgba(91,92,235,0.5)] transition-transform active:scale-95 disabled:opacity-60"
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Camera className="h-7 w-7" />
              </span>
            </button>

            <button
              onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
              className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-2xl bg-white/10 text-white backdrop-blur-md"
            >
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
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

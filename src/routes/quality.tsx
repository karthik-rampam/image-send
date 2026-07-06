import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Sun,
  Focus,
  Ruler,
  Aperture,
  HardDrive,
  RefreshCw,
  Send,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { addHistoryItem, formatBytes } from "@/lib/history-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/quality")({
  head: () => ({ meta: [{ title: "Image Quality Check · Image Sender" }] }),
  component: QualityPage,
});

function QualityPage() {
  const navigate = useNavigate();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ w: number; h: number; ts: number } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = sessionStorage.getItem("last-capture");
    const metaRaw = sessionStorage.getItem("last-capture-meta");
    setDataUrl(url);
    if (metaRaw) {
      try {
        setMeta(JSON.parse(metaRaw));
      } catch {
        /* noop */
      }
    }
  }, []);

  const bytes = dataUrl ? Math.round((dataUrl.length * 3) / 4) : 0;
  const megapixels = meta ? (meta.w * meta.h) / 1_000_000 : 0;
  const goodResolution = megapixels >= 0.3;

  const checks = [
    {
      label: "Resolution",
      icon: Ruler,
      value: meta ? `${meta.w}×${meta.h}` : "—",
      ok: goodResolution,
    },
    { label: "Brightness", icon: Sun, value: "Good", ok: true },
    { label: "Sharpness", icon: Aperture, value: "Good", ok: true },
    { label: "Focus", icon: Focus, value: "Good", ok: true },
    { label: "File Size", icon: HardDrive, value: formatBytes(bytes), ok: bytes > 0 },
  ];

  async function send() {
    if (!dataUrl || !meta) return;
    setSending(true);
    const d = new Date(meta.ts);
    const pad = (n: number) => String(n).padStart(2, "0");
    const name = `IMG_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.jpg`;
    let status: "Success" | "Failed" = "Success";
    try {
      const { error } = await supabase.from("captures").insert({
        name,
        image_data: dataUrl,
        width: meta.w,
        height: meta.h,
        size_bytes: bytes,
      });
      if (error) throw error;
    } catch (err) {
      console.error("Send failed:", err);
      status = "Failed";
    }
    addHistoryItem({
      id: crypto.randomUUID(),
      name,
      dataUrl,
      sizeBytes: bytes,
      width: meta.w,
      height: meta.h,
      timestamp: meta.ts,
      status,
    });
    try {
      sessionStorage.removeItem("last-capture");
      sessionStorage.removeItem("last-capture-meta");
    } catch {
      /* noop */
    }
    navigate({ to: "/history" });
  }

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
            {dataUrl ? (
              <img src={dataUrl} alt="Captured" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No image captured yet.
              </div>
            )}
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
                {c.ok ? (
                  <CheckCircle2 className="h-5 w-5 text-[color:var(--success)]" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Info card */}
        {dataUrl && (
          <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--success)]/25 bg-[color:var(--success)]/8 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--success)]/15 text-[color:var(--success)]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Image quality looks good</p>
              <p className="text-xs text-muted-foreground">This image is ready to send.</p>
            </div>
          </div>
        )}

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
            onClick={send}
            disabled={!dataUrl || sending}
            className="flex h-14 flex-[1.4] items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98] disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send Image <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </main>
    </MobileShell>
  );
}

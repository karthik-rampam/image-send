import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  WifiOff,
  Camera,
  History as HistoryIcon,
  ScanSearch,
  Gauge,
  RotateCcw,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { formatDateTime } from "@/lib/history-store";
import {
  loadDetectionSession,
  classLabel,
  classColor,
  confidencePct,
  type Detection,
  type DetectionSession,
} from "@/lib/detection";

export const Route = createFileRoute("/detection")({
  head: () => ({
    meta: [
      { title: "AI Detection Result · Image Sender" },
      {
        name: "description",
        content:
          "YOLOv8 AI analysis result for your captured image, with detected objects and confidence.",
      },
      { property: "og:title", content: "AI Detection Result · Image Sender" },
      {
        property: "og:description",
        content: "View the AI detection result for your captured image.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DetectionPage,
});

function DetectionPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<DetectionSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadDetectionSession());
    setReady(true);
  }, []);

  if (!ready) return <LoadingScreen />;

  if (!session) {
    return (
      <MobileShell hideNav>
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <ScanSearch className="h-7 w-7" />
          </div>
          <p className="text-sm font-semibold">Nothing to show</p>
          <p className="max-w-[260px] text-xs text-muted-foreground">
            Capture an image and run an analysis to see AI detection results here.
          </p>
          <Link
            to="/scan"
            className="mt-2 flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Camera className="h-4 w-4" /> New Scan
          </Link>
        </main>
      </MobileShell>
    );
  }

  if (session.error || !session.result) {
    return (
      <MobileShell hideNav>
        <Header />
        <main className="flex-1 space-y-5 px-5 pb-8 pt-4">
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-[color:var(--danger)]/25 bg-[color:var(--danger)]/8 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--danger)]/15 text-[color:var(--danger)]">
              <WifiOff className="h-6 w-6" />
            </div>
            <p className="text-base font-bold">AI Analysis Failed</p>
            <p className="max-w-[280px] text-xs text-muted-foreground">
              Unable to connect to the detection server.
            </p>
            {session.error && (
              <p className="max-w-[280px] break-words font-mono text-[10px] text-muted-foreground/80">
                {session.error}
              </p>
            )}
          </div>

          {session.dataUrl && (
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-secondary">
              <img src={session.dataUrl} alt={session.name} className="w-full object-cover" />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate({ to: "/quality" })}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-semibold hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={() => navigate({ to: "/quality", search: { retry: 1 } })}
              className="flex h-14 flex-[1.4] items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white shadow-[var(--shadow-soft)] active:scale-[0.98]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <RotateCcw className="h-4 w-4" /> Retry Analysis
            </button>
          </div>
        </main>
      </MobileShell>
    );
  }

  const result = session.result;
  const detected = result.count > 0;
  const sorted = [...result.detections].sort((a, b) => b.confidence - a.confidence);
  const top = sorted[0];
  const dt = formatDateTime(session.timestamp);

  return (
    <MobileShell hideNav>
      <Header />
      <main className="flex-1 space-y-5 px-5 pb-8 pt-4">
        {/* Result summary */}
        <div
          className="relative overflow-hidden rounded-3xl p-5 text-white shadow-[var(--shadow-soft)]"
          style={{
            background: detected
              ? "linear-gradient(135deg, oklch(0.58 0.21 25), oklch(0.5 0.2 15))"
              : "linear-gradient(135deg, oklch(0.62 0.16 155), oklch(0.54 0.15 165))",
          }}
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              {detected ? (
                <ShieldAlert className="h-6 w-6" />
              ) : (
                <ShieldCheck className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/80">
                AI Detection Result
              </p>
              <p className="mt-1 text-xl font-bold leading-tight">
                {detected ? "Potential Camera Detected" : "No Potential Camera Detected"}
              </p>
              <p className="mt-1 text-xs text-white/85">
                {detected
                  ? `${result.count} ${result.count === 1 ? "detection" : "detections"} found`
                  : "AI did not identify a camera-like object in this image."}
              </p>
            </div>
          </div>
        </div>

        {/* Image with boxes */}
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-secondary shadow-[var(--shadow-card)]">
          <ImageWithBoxes
            src={session.dataUrl}
            alt={session.name}
            detections={result.detections}
            imageWidth={result.image_width || session.width}
            imageHeight={result.image_height || session.height}
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard
            icon={ScanSearch}
            label="AI Analysis"
            value="Complete"
            sub="YOLOv8n model"
          />
          <InfoCard
            icon={ShieldAlert}
            label="Detections"
            value={String(result.count)}
            sub={detected ? "objects found" : "nothing found"}
          />
          <InfoCard
            icon={Gauge}
            label="Top Confidence"
            value={top ? confidencePct(top.confidence) : "—"}
            sub={top ? classLabel(top.class) : "n/a"}
          />
          <InfoCard
            icon={HistoryIcon}
            label="Captured"
            value={dt.time}
            sub={dt.date}
          />
        </div>

        {/* Detected objects */}
        <section className="rounded-3xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
          <h2 className="mb-3 px-1 text-[15px] font-semibold">
            {detected
              ? `${result.count} ${result.count === 1 ? "Object" : "Objects"} Detected`
              : "Detected Objects"}
          </h2>
          {!detected ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              AI did not identify a camera-like object in this image.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {sorted.map((d, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span
                    className="h-9 w-1.5 shrink-0 rounded-full"
                    style={{ background: classColor(d.class) }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{classLabel(d.class)}</p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${Math.round(d.confidence * 100)}%`,
                          background: classColor(d.class),
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="shrink-0 text-sm font-bold"
                    style={{ color: classColor(d.class) }}
                  >
                    {confidencePct(d.confidence)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex gap-3">
          <Link
            to="/history"
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-semibold hover:bg-secondary"
          >
            <HistoryIcon className="h-4 w-4" /> View History
          </Link>
          <Link
            to="/scan"
            className="flex h-14 flex-[1.4] items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white shadow-[var(--shadow-soft)] active:scale-[0.98]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Camera className="h-4 w-4" /> Analyze Another Image
          </Link>
        </div>
      </main>
    </MobileShell>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-white/80 px-5 py-4 backdrop-blur-xl">
      <Link to="/scan" className="rounded-full p-2 text-foreground/70 hover:bg-secondary">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="text-center">
        <p className="text-[15px] font-semibold tracking-tight">AI Detection Result</p>
        <p className="text-[11px] text-muted-foreground">YOLOv8 hidden-camera analysis</p>
      </div>
      <span className="w-9" />
    </header>
  );
}

function LoadingScreen() {
  return (
    <MobileShell hideNav>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold">Analyzing Image...</p>
        <p className="text-xs text-muted-foreground">YOLOv8 is processing the image</p>
      </main>
    </MobileShell>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-xl font-bold tracking-tight">{value}</p>
      <p className="truncate text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

/** Draws bounding boxes scaled from the model's image dimensions to the rendered size. */
function ImageWithBoxes({
  src,
  alt,
  detections,
  imageWidth,
  imageHeight,
}: {
  src: string;
  alt: string;
  detections: Detection[];
  imageWidth: number;
  imageHeight: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scaleX = imageWidth > 0 ? size.w / imageWidth : 0;
  const scaleY = imageHeight > 0 ? size.h / imageHeight : 0;

  return (
    <div ref={wrapRef} className="relative w-full">
      <img src={src} alt={alt} className="block w-full" />
      {scaleX > 0 &&
        scaleY > 0 &&
        detections.map((d, i) => {
          const left = d.box.x1 * scaleX;
          const top = d.box.y1 * scaleY;
          const width = (d.box.x2 - d.box.x1) * scaleX;
          const height = (d.box.y2 - d.box.y1) * scaleY;
          const color = classColor(d.class);
          return (
            <div
              key={i}
              className="absolute rounded-md"
              style={{
                left,
                top,
                width,
                height,
                border: `2px solid ${color}`,
                boxShadow: `0 0 0 1px rgba(0,0,0,0.25)`,
              }}
            >
              <span
                className="absolute -top-[1.35rem] left-0 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                style={{ background: color }}
              >
                {classLabel(d.class)} {confidencePct(d.confidence)}
              </span>
            </div>
          );
        })}
    </div>
  );
}

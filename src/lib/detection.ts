// ============================================================
// Central configuration for the YOLOv8n Flask detection backend.
// When ngrok gives you a new URL, change ONLY this constant
// (or override it from Settings → Target Server URL).
// ============================================================
export const YOLO_API_URL = "https://018e-35-190-143-111.ngrok-free.app/predict";

/** Normalizes any configured base/endpoint URL to exactly one trailing /predict. */
export function resolvePredictUrl(raw?: string): string {
  const base = (raw ?? "").trim() || YOLO_API_URL;
  const cleaned = base.replace(/\/+$/, "").replace(/(\/predict)+$/i, "");
  return `${cleaned}/predict`;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  class_id: number;
  class: string;
  confidence: number;
  box: BoundingBox;
}

export interface PredictionResponse {
  success: boolean;
  count: number;
  detections: Detection[];
  image_width: number;
  image_height: number;
  error?: string;
}

export interface PredictPayload {
  name: string;
  image_data: string;
  width: number;
  height: number;
  size_bytes: number;
  timestamp: number;
}

export const CLASS_LABELS: Record<string, string> = {
  camera: "Camera",
  cctv: "CCTV",
  hidden_camera: "Potential Hidden Camera",
};

export function classLabel(cls: string): string {
  return CLASS_LABELS[cls] ?? cls;
}

/** Tailwind-ish token colors per class for boxes and badges. */
export function classColor(cls: string): string {
  switch (cls) {
    case "hidden_camera":
      return "var(--danger)";
    case "cctv":
      return "oklch(0.72 0.17 65)";
    default:
      return "var(--primary)";
  }
}

export function confidencePct(c: number): string {
  return `${Math.round(c * 100)}%`;
}

/** POST the image to the Flask /predict endpoint. Throws on failure. */
export async function analyzeImage(
  payload: PredictPayload,
  opts: { url?: string; timeoutSec?: number } = {},
): Promise<PredictionResponse> {
  const url = resolvePredictUrl(opts.url);
  console.log("YOLO API URL:", url);
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Math.max(1, opts.timeoutSec ?? 60) * 1000,
  );
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Detection server returned ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as PredictionResponse;
    if (!json || typeof json !== "object" || !Array.isArray(json.detections)) {
      throw new Error("Unexpected response from detection server");
    }
    if (json.success === false) {
      throw new Error(json.error || "Detection failed on the server");
    }
    return json;
  } finally {
    clearTimeout(timeout);
  }
}

// ---- temporary client-side handoff between Quality Check and /detection ----

export type DetectionSession = {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  timestamp: number;
  result?: PredictionResponse;
  error?: string;
};

const SESSION_KEY = "last-detection";

export function saveDetectionSession(s: DetectionSession) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

export function loadDetectionSession(): DetectionSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as DetectionSession) : null;
  } catch {
    return null;
  }
}

/**
 * "Detected"  = AI found at least one camera-like object
 * "Clear"     = AI analysed the image and found nothing
 * "Failed"    = analysis could not complete (server/network error)
 * "Success" / "Pending" kept for older stored entries.
 */
export type SendStatus = "Detected" | "Clear" | "Failed" | "Pending" | "Success";

export type HistoryItem = {
  id: string;
  name: string;
  dataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
  timestamp: number;
  status: SendStatus;
  /** number of detections returned by the AI */
  detectionCount?: number;
  /** raw class names, e.g. ["hidden_camera","cctv"] */
  detectedClasses?: string[];
  /** highest confidence 0..1 */
  topConfidence?: number;
};

export function statusLabel(status: SendStatus): string {
  switch (status) {
    case "Detected":
      return "Potential Camera Detected";
    case "Clear":
      return "No Potential Camera Detected";
    case "Failed":
      return "Analysis Failed";
    default:
      return status;
  }
}

export function statusShort(status: SendStatus): string {
  switch (status) {
    case "Detected":
      return "Detected";
    case "Clear":
      return "Clear";
    default:
      return status;
  }
}

const KEY = "image-sender-history";

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 100)));
  } catch {
    /* quota */
  }
}

export function addHistoryItem(item: HistoryItem) {
  const items = loadHistory();
  items.unshift(item);
  saveHistory(items);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 2 : 1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function formatDateTime(ts: number): { date: string; time: string } {
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

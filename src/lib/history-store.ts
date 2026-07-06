export type SendStatus = "Success" | "Failed" | "Pending";
export type HistoryItem = {
  id: string;
  name: string;
  dataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
  timestamp: number;
  status: SendStatus;
};

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

import { YOLO_API_URL } from "./detection";

export type AppSettings = {
  serverUrl: string;
  timeoutSec: number;
  defaultCamera: "Back Camera" | "Front Camera";
  imageQuality: "Low" | "Medium" | "High";
  autoSend: boolean;
  lightMode: boolean;
};

const KEY = "image-sender-settings";

export const defaultSettings: AppSettings = {
  /** YOLOv8 detection endpoint — defaults to the centralized constant. */
  serverUrl: YOLO_API_URL,
  timeoutSec: 60,
  defaultCamera: "Back Camera",
  imageQuality: "High",
  autoSend: true,
  lightMode: true,
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    const s = { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
    // Migrate legacy upload URLs to the YOLO detection endpoint.
    if (
      !s.serverUrl ||
      s.serverUrl.includes("/api/public/upload") ||
      s.serverUrl.includes("github.io") ||
      // any older ngrok tunnel that is no longer live
      (s.serverUrl.includes("ngrok-free.app") && !s.serverUrl.includes("018e-35-190-143-111"))
    ) {
      s.serverUrl = YOLO_API_URL;
    }
    return s;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: AppSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

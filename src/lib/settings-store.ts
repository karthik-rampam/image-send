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
  serverUrl:
    typeof window !== "undefined"
      ? `${window.location.origin}/api/public/upload`
      : "/api/public/upload",
  timeoutSec: 30,
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
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
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

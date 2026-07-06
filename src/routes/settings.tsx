import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronRight,
  Camera,
  Image as ImageIcon,
  Zap,
  Server,
  Timer,
  Info,
  Shield,
  Sun,
  Pencil,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings-store";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Image Sender" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [s, setS] = useState<AppSettings | null>(null);
  const [editField, setEditField] = useState<null | "serverUrl" | "timeoutSec">(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setS(loadSettings());
  }, []);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    if (!s) return;
    const next = { ...s, [key]: value };
    setS(next);
    saveSettings(next);
  }

  function openEdit(field: "serverUrl" | "timeoutSec") {
    if (!s) return;
    setEditField(field);
    setDraft(String(s[field]));
  }

  function saveEdit() {
    if (!s || !editField) return;
    if (editField === "timeoutSec") {
      const n = Math.max(1, Math.min(300, Number(draft) || 30));
      update("timeoutSec", n);
    } else {
      update("serverUrl", draft.trim());
    }
    setEditField(null);
  }

  if (!s) {
    return (
      <MobileShell>
        <div className="flex-1" />
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-white/80 px-5 py-4 backdrop-blur-xl">
        <Link to="/" className="rounded-full p-2 text-foreground/70 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-[15px] font-semibold tracking-tight">Settings</h1>
        <span className="w-9" />
      </header>

      <main className="flex-1 space-y-6 px-5 pb-8 pt-4">
        <Section title="Camera Settings">
          <SelectRow
            icon={Camera}
            label="Default Camera"
            value={s.defaultCamera}
            options={["Back Camera", "Front Camera"]}
            onChange={(v) => update("defaultCamera", v as AppSettings["defaultCamera"])}
          />
          <SelectRow
            icon={ImageIcon}
            label="Image Quality"
            value={s.imageQuality}
            options={["Low", "Medium", "High"]}
            onChange={(v) => update("imageQuality", v as AppSettings["imageQuality"])}
          />
          <ToggleRow
            icon={Zap}
            label="Auto Send"
            sub="Automatically send image after quality check"
            checked={s.autoSend}
            onChange={(v) => update("autoSend", v)}
          />
        </Section>

        <Section title="Server Settings">
          <EditableRow
            icon={Server}
            label="Target Server URL"
            value={s.serverUrl}
            mono
            onEdit={() => openEdit("serverUrl")}
          />
          <EditableRow
            icon={Timer}
            label="Timeout"
            value={`${s.timeoutSec} s`}
            onEdit={() => openEdit("timeoutSec")}
          />
        </Section>

        <Section title="Appearance">
          <ToggleRow
            icon={Sun}
            label="Light Mode"
            checked={s.lightMode}
            onChange={(v) => update("lightMode", v)}
          />
        </Section>

        <Section title="About">
          <StaticRow icon={Info} label="Version" value="1.0.0" />
          <StaticRow icon={Shield} label="Privacy Policy" chevron />
        </Section>
      </main>

      <Dialog open={editField !== null} onOpenChange={(o) => !o && setEditField(null)}>
        <DialogContent className="max-w-[92vw] rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editField === "serverUrl" ? "Target Server URL" : "Timeout (seconds)"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-field" className="text-xs text-muted-foreground">
              {editField === "serverUrl"
                ? "Full URL where images will be sent"
                : "Request timeout between 1 and 300"}
            </Label>
            <Input
              id="edit-field"
              autoFocus
              type={editField === "timeoutSec" ? "number" : "url"}
              inputMode={editField === "timeoutSec" ? "numeric" : "url"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={editField === "serverUrl" ? "https://..." : "30"}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[var(--shadow-card)]">
        <ul className="divide-y divide-border/60">{children}</ul>
      </div>
    </section>
  );
}

type IconType = typeof Camera;

function RowShell({
  icon: Icon,
  label,
  sub,
  children,
}: {
  icon: IconType;
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-[11px] leading-snug text-muted-foreground">{sub}</p>}
      </div>
      <div className="ml-2 flex shrink-0 items-center">{children}</div>
    </li>
  );
}

function ToggleRow({
  icon,
  label,
  sub,
  checked,
  onChange,
}: {
  icon: IconType;
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <RowShell icon={icon} label={label} sub={sub}>
      <Switch checked={checked} onCheckedChange={onChange} />
    </RowShell>
  );
}

function EditableRow({
  icon,
  label,
  value,
  mono,
  onEdit,
}: {
  icon: IconType;
  label: string;
  value: string;
  mono?: boolean;
  onEdit: () => void;
}) {
  const Icon = icon;
  return (
    <li>
      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/40"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p
            className={`truncate text-[11px] text-muted-foreground ${mono ? "font-mono" : ""}`}
          >
            {value}
          </p>
        </div>
        <Pencil className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    </li>
  );
}

function StaticRow({
  icon: Icon,
  label,
  value,
  chevron,
}: {
  icon: IconType;
  label: string;
  value?: string;
  chevron?: boolean;
}) {
  return (
    <RowShell icon={Icon} label={label}>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      {chevron && <ChevronRight className="ml-1 h-4 w-4 text-muted-foreground" />}
    </RowShell>
  );
}

function SelectRow({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: IconType;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <RowShell icon={Icon} label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 min-w-[7.5rem] gap-1 rounded-lg border-border/70 bg-secondary/50 px-2.5 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o} className="text-sm">
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </RowShell>
  );
}

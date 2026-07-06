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
} from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Image Sender" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [autoSend, setAutoSend] = useState(true);
  const [lightMode, setLightMode] = useState(true);
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
          <Row icon={Camera} label="Default Camera" value="Back Camera" chevron />
          <Row icon={ImageIcon} label="Image Quality" value="High" chevron />
          <Row
            icon={Zap}
            label="Auto Send"
            sub="Automatically send image after quality check"
            trailing={<Toggle checked={autoSend} onChange={() => setAutoSend((v) => !v)} />}
          />
        </Section>

        <Section title="Server Settings">
          <Row
            icon={Server}
            label="Target Server URL"
            value="https://example.com/api/upload"
            chevron
            mono
          />
          <Row icon={Timer} label="Timeout" value="30 s" chevron />
        </Section>

        <Section title="Appearance">
          <Row
            icon={Sun}
            label="Light Mode"
            trailing={<Toggle checked={lightMode} onChange={() => setLightMode((v) => !v)} />}
          />
        </Section>

        <Section title="About">
          <Row icon={Info} label="Version" value="1.0.0" />
          <Row icon={Shield} label="Privacy Policy" chevron />
        </Section>
      </main>
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

function Row({
  icon: Icon,
  label,
  value,
  sub,
  chevron,
  trailing,
  mono,
}: {
  icon: typeof Camera;
  label: string;
  value?: string;
  sub?: string;
  chevron?: boolean;
  trailing?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        {value && !trailing && (
          <p className={`truncate text-[11px] text-muted-foreground ${mono ? "font-mono" : ""}`}>
            {value}
          </p>
        )}
      </div>
      {trailing ?? (
        <>
          {value && !sub && !mono && <span className="text-xs text-muted-foreground">{value}</span>}
          {chevron && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </>
      )}
    </li>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "" : "bg-border"}`}
      style={checked ? { background: "var(--gradient-primary)" } : undefined}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

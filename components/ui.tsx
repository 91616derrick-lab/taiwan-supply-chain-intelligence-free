import Link from "next/link";
import type {
  ImpactDirection,
  ImpactMagnitude,
  ResearchPriority
} from "@/src/lib/schemas/intelligenceSchema";
import { directionText } from "@/src/lib/beginner/beginnerCopy";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Panel({
  title,
  kicker,
  action,
  children,
  className
}: {
  title: string;
  kicker?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("border border-terminal-line bg-terminal-panel", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-terminal-line px-3 py-2">
        <div>
          {kicker ? <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-terminal-muted">{kicker}</div> : null}
          <h2 className="text-sm font-semibold text-terminal-text">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "red" | "amber" | "blue" | "purple";
}) {
  const tones = {
    neutral: "border-terminal-line text-terminal-muted",
    green: "border-terminal-green/60 text-terminal-green",
    red: "border-terminal-red/60 text-terminal-red",
    amber: "border-terminal-amber/60 text-terminal-amber",
    blue: "border-terminal-blue/60 text-terminal-blue",
    purple: "border-terminal-purple/60 text-terminal-purple"
  };

  return (
    <span className={cx("inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase", tones[tone])}>
      {children}
    </span>
  );
}

export function DirectionChip({ direction }: { direction: ImpactDirection }) {
  const tone = direction === "positive" ? "green" : direction === "negative" ? "red" : direction === "mixed" ? "amber" : "neutral";
  return <Badge tone={tone}>{directionText(direction)}</Badge>;
}

export function PriorityBadge({ priority }: { priority: ResearchPriority }) {
  const tone = priority === "high" ? "red" : priority === "medium" ? "amber" : "blue";
  return <Badge tone={tone}>{priority}</Badge>;
}

export function MagnitudeBadge({ magnitude }: { magnitude: ImpactMagnitude }) {
  const tone = magnitude === "high" ? "red" : magnitude === "medium" ? "amber" : "neutral";
  return <Badge tone={tone}>{magnitude}</Badge>;
}

export function ScoreBar({ value, label }: { value: number; label?: string }) {
  const tone = value >= 75 ? "bg-terminal-green" : value >= 55 ? "bg-terminal-amber" : "bg-terminal-red";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 font-mono text-[10px] uppercase text-terminal-muted">
        <span>{label ?? "score"}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-1.5 border border-terminal-line bg-terminal-bg">
        <div className={cx("h-full", tone)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function Metric({ label, value, tone = "neutral" }: { label: string; value: string | number; tone?: "neutral" | "green" | "red" | "amber" | "blue" }) {
  return (
    <div className="border border-terminal-line bg-terminal-panel2 px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-terminal-muted">{label}</div>
      <div className={cx("mt-1 text-lg font-semibold", tone === "green" && "text-terminal-green", tone === "red" && "text-terminal-red", tone === "amber" && "text-terminal-amber", tone === "blue" && "text-terminal-blue")}>{value}</div>
    </div>
  );
}

export function OpenDoctorButton() {
  return (
    <Link
      href="/doctor"
      className="border border-terminal-blue px-2.5 py-1 font-mono text-[11px] uppercase text-terminal-blue hover:bg-terminal-blue hover:text-terminal-bg"
    >
      Open Doctor
    </Link>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="border border-dashed border-terminal-line p-4 text-sm text-terminal-muted">{children}</div>;
}

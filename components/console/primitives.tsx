"use client";

import Link from "next/link";
import { prettyDate, titleCase } from "@/lib/utils";

// ─── Utility ─────────────────────────────────────────────────────────────────

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// ─── Icon (Material Symbols Outlined) ────────────────────────────────────────

export function Icon({
  name,
  size = 20,
  filled = false,
  className
}: {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx("material-symbols-outlined", filled && "filled", className)}
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-surface-highest text-on-surface-var border-transparent",
  primary: "bg-primary/15 text-primary border-primary/20",
  success: "bg-tertiary/15 text-tertiary border-tertiary/20",
  warning: "bg-warning/15 text-warning border-warning/20",
  danger:  "bg-error/15 text-error border-error/20",
  info:    "bg-primary/10 text-primary border-primary/15"
};

export function Badge({
  tone = "neutral",
  children,
  className
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── StatusBadge (legacy-compatible alias) ────────────────────────────────────

export function StatusBadge({
  tone,
  children
}: {
  tone: "neutral" | "info" | "warning" | "danger" | "success";
  children: React.ReactNode;
}) {
  const map: Record<string, BadgeTone> = {
    neutral: "neutral",
    info: "info",
    warning: "warning",
    danger: "danger",
    success: "success"
  };
  return <Badge tone={map[tone] as BadgeTone}>{children}</Badge>;
}

// ─── ConfidenceBar ────────────────────────────────────────────────────────────

type BarTone = "primary" | "success" | "warning" | "danger";

const barColors: Record<BarTone, string> = {
  primary: "bg-primary",
  success: "bg-tertiary",
  warning: "bg-warning",
  danger:  "bg-error"
};

export function ConfidenceBar({
  value,
  tone = "primary",
  className
}: {
  value: number;
  tone?: BarTone;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cx("confidence-bar", className)}>
      <div
        className={cx("confidence-bar-fill", barColors[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function Panel({
  className,
  children,
  as: Tag = "section"
}: {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  return (
    <Tag className={cx("bg-surface-low rounded-xl overflow-hidden", className)}>
      {children}
    </Tag>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon,
  tone = "neutral",
  sublabel
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: BadgeTone;
  sublabel?: string;
}) {
  const iconBg: Record<BadgeTone, string> = {
    neutral: "bg-surface-highest text-on-surface-var",
    primary: "bg-primary/15 text-primary",
    success: "bg-tertiary/15 text-tertiary",
    warning: "bg-warning/15 text-warning",
    danger:  "bg-error/15 text-error",
    info:    "bg-primary/10 text-primary"
  };

  return (
    <div className="bg-surface-low rounded-xl p-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="eyebrow mb-2">{label}</div>
        <div className="font-headline text-3xl font-bold text-on-surface leading-none">{value}</div>
        {sublabel && <div className="mt-1.5 text-xs text-on-surface-var">{sublabel}</div>}
      </div>
      <div className={cx("flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center", iconBg[tone])}>
        <Icon name={icon} size={20} />
      </div>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  badge,
  action,
  className
}: {
  title: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-center justify-between gap-3 mb-4", className)}>
      <div className="flex items-center gap-2">
        <h3 className="font-headline font-semibold text-on-surface text-base">{title}</h3>
        {badge}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ─── Eyebrow ──────────────────────────────────────────────────────────────────

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("eyebrow", className)}>{children}</div>
  );
}

// ─── DataPoint ────────────────────────────────────────────────────────────────

export function DataPoint({
  label,
  value,
  hint
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="bg-surface-high rounded-xl p-4">
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-2 text-sm font-semibold text-on-surface">{value}</div>
      {hint && <p className="mt-1 text-xs text-on-surface-var">{hint}</p>}
    </div>
  );
}

// ─── InfoList ─────────────────────────────────────────────────────────────────

export function InfoList({
  items
}: {
  items: Array<{ label: string; value: string | number | undefined }>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <DataPoint
          key={item.label}
          label={item.label}
          value={item.value === undefined || item.value === "" ? "—" : item.value}
        />
      ))}
    </div>
  );
}

// ─── FreshnessPill ────────────────────────────────────────────────────────────

export function FreshnessPill({ freshness }: { freshness: "fresh" | "aging" | "stale" }) {
  const tone: BadgeTone = freshness === "fresh" ? "success" : freshness === "aging" ? "warning" : "danger";
  return <Badge tone={tone}>{titleCase(freshness)}</Badge>;
}

// ─── TimeCaption ──────────────────────────────────────────────────────────────

export function TimeCaption({ value }: { value?: string }) {
  return <span className="text-xs text-on-surface-var/60">{prettyDate(value)}</span>;
}

// ─── SummaryLink ──────────────────────────────────────────────────────────────

export function SummaryLink({
  href,
  label,
  caption
}: {
  href: string;
  label: string;
  caption?: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-high px-4 py-2 text-sm font-medium text-on-surface transition hover:border-primary/40 hover:bg-primary/8 hover:text-primary"
    >
      <span>{label}</span>
      {caption && <span className="text-on-surface-var">{caption}</span>}
      <Icon name="arrow_forward" size={16} className="text-on-surface-var transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

// ─── MetricCard (legacy alias) ────────────────────────────────────────────────

export function MetricCard({
  label,
  value,
  tone,
  icon
}: {
  label: string;
  value: number;
  tone: "neutral" | "info" | "warning" | "danger" | "success";
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-surface-low rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow>{label}</Eyebrow>
          <div className="mt-3 font-headline text-4xl font-bold text-on-surface leading-none">{value}</div>
        </div>
        {icon && <div className="flex-shrink-0">{icon}</div>}
      </div>
    </div>
  );
}

// ─── ConfidenceRing (kept for backward compat) ───────────────────────────────

export function ConfidenceRing({
  value,
  tone = "blue",
  size = "md",
  label
}: {
  value: number;
  tone?: "blue" | "amber" | "teal" | "rose";
  size?: "sm" | "md";
  label?: string;
}) {
  const color = { blue: "#a2c9ff", amber: "#F9B21D", teal: "#65de85", rose: "#ffb4ab" }[tone];
  const dim = size === "sm" ? 56 : 80;
  const stroke = size === "sm" ? 5 : 6;
  const r = (dim - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90">
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#333537" strokeWidth={stroke} />
          <circle
            cx={dim / 2} cy={dim / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-headline font-bold text-on-surface"
          style={{ fontSize: size === "sm" ? 14 : 18 }}
        >
          {value}
        </span>
      </div>
      {label && <div className="text-sm text-on-surface-var">{label}</div>}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ReviewQueueView } from "@/lib/console-types";
import { useCurrentUser, hasRole } from "@/lib/auth-client";
import {
  Badge,
  ConfidenceBar,
  ConfidenceRing,
  cx,
  Icon,
  SectionHeader,
  StatCard
} from "@/components/console/primitives";

// ─── Queue item border colours by severity ────────────────────────────────────

const severityBorder: Record<string, string> = {
  danger:  "border-l-error",
  warning: "border-l-warning",
  info:    "border-l-primary"
};

const severityIcon: Record<string, string> = {
  conflict:        "warning",
  recommendation:  "recommend",
  duplicate:       "content_copy",
  profile_review:  "rate_review"
};

// ─── ReviewQueue ──────────────────────────────────────────────────────────────

export function ReviewQueue({ initialView }: { initialView: ReviewQueueView }) {
  const [selectedItemId, setSelectedItemId] = useState(initialView.selectedItemId);
  const user = useCurrentUser();
  const canResolve = hasRole(user, ["am", "cs"]);

  const selectedItem = useMemo(
    () => initialView.items.find((item) => item.id === selectedItemId) ?? initialView.items[0],
    [initialView.items, selectedItemId]
  );

  // Map metrics to stat card config
  const statConfig: Record<string, { icon: string; tone: "danger" | "warning" | "primary" | "neutral" }> = {
    "Pending Tasks":  { icon: "pending_actions", tone: "neutral" },
    "Conflicts":      { icon: "warning",         tone: "danger" },
    "Duplicates":     { icon: "content_copy",    tone: "warning" },
    "Queue Integrity":{ icon: "health_metrics",  tone: "primary" }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-5">

      {/* ── Stat cards header ─────────────────────────────────────────────── */}
      <div>
        <div className="eyebrow mb-2">Review Queue</div>
        <h2 className="font-headline font-bold text-on-surface text-3xl md:text-4xl mb-4">Analyst Workspace</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {initialView.metrics.map((metric) => {
          const cfg = statConfig[metric.label] ?? { icon: "analytics", tone: "neutral" as const };
          return (
            <StatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              icon={cfg.icon}
              tone={cfg.tone}
            />
          );
        })}
        {/* Queue integrity extra card */}
        <div className="bg-surface-low rounded-xl p-5 flex items-center gap-4">
          <ConfidenceRing value={initialView.queueIntegrity} tone="blue" size="sm" />
          <div>
            <div className="eyebrow mb-1">Queue Integrity</div>
            <div className={cx(
              "text-xs font-semibold",
              initialView.queueIntegrity >= 70 ? "text-tertiary" : "text-warning"
            )}>
              {initialView.queueIntegrity >= 70 ? "Above target" : "Needs attention"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main 2-col layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">

        {/* ── Priority queue list ──────────────────────────────────────────── */}
        <div className="bg-surface-low rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center justify-between">
            <h3 className="font-headline font-semibold text-on-surface">Priority Queue</h3>
            <span className="text-xs text-primary cursor-pointer hover:text-primary/80 transition-colors">
              Filter by rank
            </span>
          </div>

          <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
            {initialView.items.map((item) => {
              const isActive = selectedItem?.id === item.id;
              const borderColor = severityBorder[item.severity] ?? "border-l-primary";
              const icon = severityIcon[item.type] ?? "info";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItemId(item.id)}
                  className={cx(
                    "w-full border-l-4 rounded-r-xl p-4 text-left transition-all",
                    borderColor,
                    isActive
                      ? "bg-surface-high ring-1 ring-primary/30"
                      : "bg-surface-high/50 hover:bg-surface-high"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge
                      tone={item.severity === "danger" ? "danger" : item.severity === "warning" ? "warning" : "info"}
                    >
                      {item.statusLabel}
                    </Badge>
                    <span className="text-[10px] text-on-surface-var/50 flex-shrink-0">{item.ageLabel}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Icon name={icon} size={14} className="text-on-surface-var flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-headline font-semibold text-on-surface text-sm leading-tight">
                        {item.title}
                      </div>
                      <p className="text-xs text-on-surface-var mt-0.5 line-clamp-2">{item.subtitle}</p>
                    </div>
                  </div>

                  {item.scoreLabel && (
                    <div className="mt-2 text-[10px] text-on-surface-var/60">{item.scoreLabel}</div>
                  )}

                  <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                    Review item
                    <Icon name="arrow_forward" size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Detail workpane ──────────────────────────────────────────────── */}
        {selectedItem ? (
          <div className="bg-surface-low rounded-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-surface px-6 py-5 border-b border-outline-variant/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface-highest flex items-center justify-center">
                    <Icon name={severityIcon[selectedItem.type] ?? "info"} size={22} className="text-on-surface-var" />
                  </div>
                  <div>
                    <Badge tone={selectedItem.severity === "danger" ? "danger" : selectedItem.severity === "warning" ? "warning" : "info"}>
                      {selectedItem.statusLabel}
                    </Badge>
                    <h3 className="font-headline font-bold text-on-surface text-xl leading-tight mt-1">
                      {selectedItem.title}
                    </h3>
                    <p className="text-xs text-on-surface-var mt-0.5">{selectedItem.subtitle}</p>
                  </div>
                </div>

                {/* Quick actions — am + cs only for resolve/approve */}
                <div className="flex-shrink-0 flex gap-2">
                  {canResolve && (
                    <button className="px-3 py-2 rounded-lg border border-outline-variant/30 text-on-surface-var text-xs font-semibold hover:text-on-surface transition-colors">
                      Dismiss
                    </button>
                  )}
                  {canResolve && selectedItem.recommendationId ? (
                    <Link
                      href={`/recommendations/${selectedItem.recommendationId}`}
                      className="px-3 py-2 rounded-lg bg-primary text-surface text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Approve
                    </Link>
                  ) : (
                    <Link
                      href={`/workbench/${selectedItem.accountId}`}
                      className="px-3 py-2 rounded-lg bg-primary text-surface text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Open
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis comparison */}
            <div className="p-5 grid sm:grid-cols-2 gap-4 border-b border-outline-variant/10">
              {/* Internal logic */}
              <div className="bg-surface-high rounded-xl p-4 border border-outline-variant/10">
                <div className="eyebrow mb-3">Internal Logic</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-on-surface-var mb-1">Current Detail</div>
                    <p className="text-xs text-on-surface-var/80 leading-relaxed">{selectedItem.detail}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-on-surface-var mb-1">Workspace Note</div>
                    <p className="text-xs text-on-surface-var/80 leading-relaxed">{selectedItem.workspaceNote}</p>
                  </div>
                </div>
              </div>

              {/* Observer proposal */}
              <div className="bg-surface-high rounded-xl p-4 border border-warning/20 ring-1 ring-warning/10">
                <div className="eyebrow mb-3 text-warning/70">Observer Proposal</div>
                <p className="text-xs text-warning/90 leading-relaxed mb-3">{selectedItem.callToAction}</p>
                <ConfidenceBar value={75} tone="warning" />
                <div className="mt-3 flex gap-2">
                  {selectedItem.recommendationId ? (
                    <Link
                      href={`/recommendations/${selectedItem.recommendationId}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-surface text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Icon name="recommend" size={13} />
                      Open recommendation
                    </Link>
                  ) : (
                    <Link
                      href={`/workbench/${selectedItem.accountId}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-surface text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Icon name="psychology" size={13} />
                      Open workbench
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Conflict resolution log */}
            <div className="p-5 border-b border-outline-variant/10">
              <div className="bg-surface-high/50 p-4 rounded-xl border-2 border-dashed border-outline-variant/25">
                <div className="eyebrow mb-3">Conflict Resolution Log</div>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <Icon name="history" size={14} className="text-on-surface-var flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-on-surface-var leading-relaxed">
                      Item created from automated conflict detection.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="chat_bubble_outline" size={14} className="text-on-surface-var flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-on-surface-var leading-relaxed">
                      Awaiting analyst review decision.
                    </p>
                  </div>
                </div>
                {canResolve && (
                  <button className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors">
                    Resolve Conflict &amp; Update Master Record →
                  </button>
                )}
              </div>
            </div>

            {/* Related signals + workspace health */}
            <div className="p-5 grid sm:grid-cols-2 gap-4 flex-1">
              <div>
                <SectionHeader title="Related Signals" />
                <div className="space-y-2">
                  {selectedItem.relatedSignals.map((signal) => (
                    <div key={signal} className="flex items-center gap-2 p-3 bg-surface-high rounded-xl">
                      <Icon name="hub" size={14} className="text-primary flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-on-surface">{signal}</div>
                        <div className="text-[10px] text-on-surface-var/60">Signal cluster</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glass expert context */}
              <div className="glass-panel rounded-xl p-4">
                <SectionHeader title="Queue Health" />
                <div className="flex items-center gap-3 mb-3">
                  <ConfidenceRing value={initialView.queueIntegrity} tone="blue" size="sm" />
                  <div>
                    <div className="text-sm font-semibold text-on-surface">
                      {initialView.queueIntegrity}% integrity
                    </div>
                    <div className="text-xs text-on-surface-var">
                      {initialView.queueIntegrity >= 70 ? "Above target baseline" : "Needs attention"}
                    </div>
                  </div>
                </div>
                <div className="bg-primary/8 border border-primary/15 rounded-lg p-3 text-xs text-on-surface-var leading-relaxed">
                  Consider creating or tightening a rule when recurring patterns are confirmed by enough analyst decisions.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-low rounded-xl flex items-center justify-center p-12">
            <div className="text-center">
              <Icon name="playlist_add_check" size={40} className="text-outline-variant/40 mb-3" />
              <p className="text-sm text-on-surface-var/60">Select an item from the queue to review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

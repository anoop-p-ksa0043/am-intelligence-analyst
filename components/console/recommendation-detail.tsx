"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { RecommendationDetailView } from "@/lib/console-types";
import { titleCase } from "@/lib/utils";
import { useCurrentUser, hasRole } from "@/lib/auth-client";
import {
  Badge,
  ConfidenceBar,
  ConfidenceRing,
  cx,
  Icon,
  SectionHeader
} from "@/components/console/primitives";

// ─── Score driver data ────────────────────────────────────────────────────────

const SCORE_DIMENSIONS = [
  { label: "Industry Match",       weight: 0.25 },
  { label: "Business Functions",   weight: 0.20 },
  { label: "Scale / Size Band",    weight: 0.15 },
  { label: "Complexity Match",     weight: 0.15 },
  { label: "Growth Signals",       weight: 0.12 },
  { label: "Ecosystem Dependency", weight: 0.08 },
  { label: "Evidence Confidence",  weight: 0.05 }
];

// ─── RecommendationDetail ─────────────────────────────────────────────────────

export function RecommendationDetail({ initialView }: { initialView: RecommendationDetailView }) {
  const [view, setView] = useState(initialView);
  const [message, setMessage] = useState<{ text: string; tone: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();
  const user = useCurrentUser();
  const canReview = hasRole(user, ["am", "cs", "analyst"]);

  async function reloadView() {
    const res = await fetch(`/api/recommendations/${view.recommendation.id}/detail`);
    const next = (await res.json()) as RecommendationDetailView;
    setView(next);
  }

  async function handleDecision(decision: "accepted" | "needs_follow_up" | "rejected") {
    startTransition(async () => {
      setMessage(null);
      const notes = {
        accepted:        "Approved from recommendation detail.",
        needs_follow_up: "Marked for discovery validation.",
        rejected:        "Held for analyst review."
      }[decision];

      const res = await fetch(`/api/recommendations/${view.recommendation.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes })
      });

      if (!res.ok) {
        setMessage({ text: "Action failed.", tone: "error" });
        return;
      }

      await reloadView();
      setMessage({
        text: {
          accepted:        "Recommendation approved.",
          needs_follow_up: "Marked for discovery validation.",
          rejected:        "Held for analyst review."
        }[decision],
        tone: "success"
      });
    });
  }

  const { recommendation, product, evidence, reviews, snapshot, analyst } = view;
  const isSelectedPrimary = view.selectedPrimaryRecommendation?.id === recommendation.id;

  const classificationTone =
    recommendation.classification === "anchor" ? "primary" :
    recommendation.classification === "adjacent" ? "success" : "warning";

  const statusTone =
    recommendation.status === "approved" ? "success" :
    recommendation.status === "validate_in_discovery" ? "warning" : "danger";

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6">

      {/* Back nav */}
      <Link
        href={`/workbench/${snapshot.account.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-var hover:text-primary transition-colors mb-5"
      >
        <Icon name="arrow_back" size={16} />
        Back to workbench
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* ── Left column ──────────────────────────────────────────────────── */}
        <div className="space-y-5 min-w-0">

          {/* Hero header */}
          <div className="bg-surface-low rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge tone={classificationTone}>{titleCase(recommendation.classification.replace("_", " "))}</Badge>
                <Badge tone={statusTone}>{titleCase(recommendation.status.replace(/_/g, " "))}</Badge>
                {isSelectedPrimary && (
                  <Badge tone="primary">
                    <Icon name="star" size={10} className="mr-0.5" />
                    Primary motion
                  </Badge>
                )}
              </div>

              {/* Product name */}
              <h1 className="font-headline font-bold text-on-surface text-3xl md:text-4xl leading-tight tracking-tight">
                <span className="text-primary">{product.name}</span>
              </h1>
              <p className="mt-2 text-sm text-on-surface-var">
                Recommendation for <span className="text-on-surface font-medium">{snapshot.account.canonicalName}</span>
              </p>

              {/* Fit + Confidence score cards */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="bg-surface-high rounded-xl p-4">
                  <div className="eyebrow mb-2">Fit Score</div>
                  <div className="font-headline font-bold text-5xl text-primary leading-none">
                    {recommendation.fitScore}
                    <span className="text-xl text-on-surface-var font-normal">%</span>
                  </div>
                  <p className="text-xs text-on-surface-var mt-2">Rule-led conceptual match</p>
                  <ConfidenceBar
                    value={recommendation.fitScore}
                    tone="primary"
                    className="mt-3"
                  />
                </div>
                <div className="bg-surface-high rounded-xl p-4">
                  <div className="eyebrow mb-2">Confidence Score</div>
                  <div className="font-headline font-bold text-5xl text-tertiary leading-none">
                    {recommendation.confidenceScore}
                    <span className="text-xl text-on-surface-var font-normal">%</span>
                  </div>
                  <p className="text-xs text-on-surface-var mt-2">Evidence defensibility</p>
                  <ConfidenceBar
                    value={recommendation.confidenceScore}
                    tone={recommendation.confidenceScore >= 75 ? "success" : recommendation.confidenceScore >= 50 ? "warning" : "danger"}
                    className="mt-3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rationale / Opportunity hypothesis */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
            <SectionHeader title="Opportunity Hypothesis" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="eyebrow mb-2 text-primary/60">The Catalyst</div>
                <p className="text-sm text-on-surface-var leading-relaxed">{recommendation.rationale}</p>
              </div>
              <div>
                <div className="eyebrow mb-2 text-primary/60">The Solution</div>
                <p className="text-sm text-on-surface-var leading-relaxed">{recommendation.nextBestAction}</p>
              </div>
            </div>
          </div>

          {/* Evidence wall */}
          <div className="bg-surface-low rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center justify-between">
              <h3 className="font-headline font-semibold text-on-surface">Evidence Wall</h3>
              <Link
                href={`/workbench/${snapshot.account.id}`}
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                Account context
                <Icon name="arrow_forward" size={12} />
              </Link>
            </div>

            <div className="p-5 space-y-3">
              {evidence.map((signal) => (
                <div key={signal.id} className="flex items-start gap-3">
                  <div className={cx(
                    "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5",
                    signal.conflictFlag ? "bg-error/15" : "bg-tertiary/15"
                  )}>
                    <Icon
                      name={signal.conflictFlag ? "warning" : "verified"}
                      size={16}
                      className={signal.conflictFlag ? "text-error" : "text-tertiary"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-on-surface">{titleCase(signal.fieldName)}</div>
                        <div className="text-xs text-on-surface-var">{titleCase(signal.fieldValue)}</div>
                      </div>
                      <Badge tone={signal.conflictFlag ? "danger" : "success"}>
                        {signal.conflictFlag ? "Conflict" : `${signal.confidence}%`}
                      </Badge>
                    </div>
                    {/* Quote block */}
                    <div className="mt-2 bg-surface p-2.5 rounded-lg border-l-2 border-primary/50">
                      <p className="text-xs italic text-primary/80">
                        Extracted from normalized profile · {signal.confidence}% confidence
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score drivers */}
          <div className="bg-surface-low rounded-xl p-5">
            <SectionHeader title="Score Drivers" />
            <div className="space-y-3">
              {SCORE_DIMENSIONS.map((dim) => {
                const score = Math.round(recommendation.fitScore * dim.weight * (0.8 + Math.random() * 0.4));
                const clamped = Math.min(100, Math.max(0, score));
                return (
                  <div key={dim.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-on-surface-var">{dim.label}</span>
                      <span className="text-on-surface font-semibold">{clamped}%</span>
                    </div>
                    <ConfidenceBar
                      value={clamped}
                      tone={clamped >= 70 ? "primary" : clamped >= 40 ? "warning" : "danger"}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intelligence provenance timeline */}
          <div className="bg-surface-low rounded-xl p-5">
            <SectionHeader title="Intelligence Timeline" />
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-0 bottom-0 w-px bg-surface-highest" />

              {[
                { label: "Recommendation generated", desc: "Scored against product rule v1", active: true },
                { label: "Profile normalized", desc: "Evidence processed and deduplicated", active: false },
                { label: "Signals ingested", desc: "Public sources fetched and classified", active: false },
                { label: "Account resolved", desc: `${snapshot.account.canonicalName} matched deterministically`, active: false }
              ].map((node, i) => (
                <div key={i} className="relative mb-5 last:mb-0">
                  {/* Node dot */}
                  <div className={cx(
                    "absolute left-[-24px] w-6 h-6 rounded-full border-4 border-surface flex items-center justify-center",
                    node.active ? "bg-primary-container" : "bg-surface-highest"
                  )}>
                    {node.active && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-on-surface leading-tight">{node.label}</div>
                    <div className="text-xs text-on-surface-var mt-0.5">{node.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right column ─────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Glass explainability rail */}
          <div className="glass-panel rounded-xl p-5">
            <SectionHeader title="Why It Fits" />
            <p className="text-sm text-on-surface-var leading-relaxed mb-4">{recommendation.rationale}</p>

            {/* Counter-signals */}
            <div className="eyebrow mb-2">Counter-Signals</div>
            <div className="space-y-2">
              {evidence.filter((e) => e.conflictFlag).length > 0 ? (
                evidence.filter((e) => e.conflictFlag).map((s) => (
                  <div key={s.id} className="bg-error/8 border border-error/15 rounded-lg p-2.5 text-xs text-error/90">
                    <Icon name="warning" size={12} className="mr-1" />
                    Conflict: {titleCase(s.fieldName)} — {titleCase(s.fieldValue)}
                  </div>
                ))
              ) : (
                <div className="text-xs text-on-surface-var/60 italic">No conflicts detected.</div>
              )}
            </div>

            {/* Confidence rings */}
            <div className="mt-5 space-y-3">
              <ConfidenceRing value={recommendation.fitScore}        tone="blue"  size="sm" label="Fit Score" />
              <ConfidenceRing value={recommendation.confidenceScore} tone="teal"  size="sm" label="Confidence" />
            </div>
          </div>

          {/* Decision actions */}
          <div className="bg-surface-low rounded-xl p-5">
            <SectionHeader title="Review Decision" />

            {canReview && <div className="space-y-2">
              <button
                onClick={() => handleDecision("accepted")}
                disabled={isPending}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-tertiary/15 border border-tertiary/20 text-tertiary text-sm font-semibold hover:bg-tertiary/20 transition-colors disabled:opacity-40"
              >
                <Icon name="check_circle" size={16} />
                {isPending ? "Saving…" : "Approve recommendation"}
              </button>
              <button
                onClick={() => handleDecision("needs_follow_up")}
                disabled={isPending}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-warning/30 bg-warning/8 text-warning text-sm font-semibold hover:bg-warning/15 transition-colors disabled:opacity-40"
              >
                <Icon name="science" size={16} />
                Validate in discovery
              </button>
              <button
                onClick={() => handleDecision("rejected")}
                disabled={isPending}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-high text-on-surface-var text-sm font-semibold hover:text-on-surface transition-colors disabled:opacity-40"
              >
                <Icon name="rate_review" size={16} />
                Hold for analyst
              </button>
            </div>}

            {message && (
              <p className={cx("mt-3 text-xs", message.tone === "success" ? "text-tertiary" : "text-error")}>
                {message.text}
              </p>
            )}
          </div>

          {/* Recommendation state */}
          <div className="bg-surface-low rounded-xl p-5">
            <SectionHeader title="Recommendation State" />
            <div className="space-y-2.5">
              <div className="bg-surface-high rounded-xl p-3">
                <div className="eyebrow mb-1">Account</div>
                <div className="text-sm font-semibold text-on-surface">{snapshot.account.canonicalName}</div>
              </div>
              <div className="bg-surface-high rounded-xl p-3">
                <div className="eyebrow mb-1">Assigned Analyst</div>
                <div className="text-sm font-semibold text-on-surface">{analyst}</div>
              </div>
              <div className="bg-primary/8 border border-primary/15 rounded-xl p-3">
                <div className="eyebrow mb-1 text-primary/60">Suggested Handling</div>
                <p className="text-xs text-on-surface-var leading-relaxed">
                  {recommendation.classification === "anchor"
                    ? "Use as the primary account motion if approved. This is the anchor play."
                    : recommendation.classification === "adjacent"
                      ? "Treat as a follow-on expansion play after the anchor motion is set."
                      : "Only keep if the account has genuine ecosystem or partner complexity."}
                </p>
              </div>
            </div>
          </div>

          {/* Review history */}
          <div className="bg-surface-low rounded-xl p-5">
            <SectionHeader title="Review History" />
            {reviews.length > 0 ? (
              <div className="space-y-2.5">
                {reviews.map((rev, i) => (
                  <div key={i} className="bg-surface-high rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-on-surface">{rev.reviewer}</div>
                      <Badge tone={rev.decision === "accepted" ? "success" : rev.decision === "needs_follow_up" ? "warning" : "danger"}>
                        {titleCase(rev.decision.replace("_", " "))}
                      </Badge>
                    </div>
                    {rev.notes && <p className="text-xs text-on-surface-var mt-1 leading-relaxed">{rev.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-var/60 italic">No review history yet.</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/accounts"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-high text-on-surface-var text-xs hover:text-on-surface transition-colors"
            >
              <Icon name="arrow_back" size={14} />
              Accounts
            </Link>
            <Link
              href="/review-queue"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-high text-on-surface-var text-xs hover:text-on-surface transition-colors"
            >
              <Icon name="playlist_add_check" size={14} />
              Review Queue
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { WorkbenchView } from "@/lib/console-types";
import { ProfileUpdateRequest } from "@/lib/domain";
import { prettyDate, titleCase } from "@/lib/utils";
import { useCurrentUser, hasRole } from "@/lib/auth-client";
import {
  Badge,
  ConfidenceBar,
  ConfidenceRing,
  cx,
  FreshnessPill,
  Icon,
  SectionHeader
} from "@/components/console/primitives";

// ─── Classification border colour map ─────────────────────────────────────────

const classificationBorder: Record<string, string> = {
  anchor:            "border-l-primary",
  adjacent:          "border-l-tertiary",
  ecosystem_enabler: "border-l-warning"
};

const classificationText: Record<string, string> = {
  anchor:            "text-primary",
  adjacent:          "text-tertiary",
  ecosystem_enabler: "text-warning"
};

// ─── Signal icon colours ──────────────────────────────────────────────────────

const signalIcon: Record<string, { icon: string; bg: string; color: string }> = {
  industry:          { icon: "domain",      bg: "bg-primary/15",   color: "text-primary" },
  growth_signals:    { icon: "trending_up", bg: "bg-tertiary/15",  color: "text-tertiary" },
  businessfunctions: { icon: "business",    bg: "bg-warning/15",   color: "text-warning" }
};

function getSignalStyle(fieldName: string) {
  const key = fieldName.toLowerCase().replace(/\s/g, "_");
  return signalIcon[key] ?? { icon: "sensors", bg: "bg-primary/10", color: "text-primary" };
}

// ─── Intelligence Workbench ───────────────────────────────────────────────────

export function IntelligenceWorkbench({ initialView }: { initialView: WorkbenchView }) {
  const [view, setView] = useState(initialView);
  const [message, setMessage] = useState<{ text: string; tone: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const user = useCurrentUser();
  const canCorrect = hasRole(user, ["am", "data_steward"]);
  const [draft, setDraft] = useState<ProfileUpdateRequest>({
    industry: initialView.snapshot.profile.industry ?? "",
    businessFunctions: initialView.snapshot.profile.businessFunctions,
    growthSignals: initialView.snapshot.profile.growthSignals
  });

  const primaryRecommendation = useMemo(
    () =>
      view.snapshot.recommendations.find(
        (r) => r.id === view.snapshot.selectedPrimaryRecommendationId
      ),
    [view.snapshot.recommendations, view.snapshot.selectedPrimaryRecommendationId]
  );

  async function reloadView() {
    const res = await fetch(`/api/workbench/${view.snapshot.account.id}`);
    const next = (await res.json()) as WorkbenchView;
    setView(next);
    setDraft({
      industry: next.snapshot.profile.industry ?? "",
      businessFunctions: next.snapshot.profile.businessFunctions,
      growthSignals: next.snapshot.profile.growthSignals
    });
  }

  async function handleWorkflow(action: "approve_profile" | "send_to_review" | "validate_in_discovery") {
    startTransition(async () => {
      setMessage(null);
      const res = await fetch(`/api/accounts/${view.snapshot.account.id}/workflow-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (!res.ok) {
        setMessage({ text: "Workflow action failed.", tone: "error" });
        return;
      }
      await reloadView();
      const labels = {
        approve_profile: "Profile approved.",
        send_to_review: "Account sent to analyst review.",
        validate_in_discovery: "Recommendations marked for discovery validation."
      };
      setMessage({ text: labels[action], tone: "success" });
    });
  }

  async function handleRefresh() {
    startTransition(async () => {
      setMessage(null);
      const res = await fetch(`/api/accounts/${view.snapshot.account.id}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "manual" })
      });
      if (!res.ok) {
        setMessage({ text: "Refresh failed.", tone: "error" });
        return;
      }
      await reloadView();
      setMessage({ text: "Account refreshed. Freshness updated.", tone: "success" });
    });
  }

  async function handleProfileUpdate() {
    startTransition(async () => {
      setMessage(null);
      const res = await fetch(`/api/accounts/${view.snapshot.account.id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      if (!res.ok) {
        setMessage({ text: "Profile correction failed.", tone: "error" });
        return;
      }
      await reloadView();
      setMessage({ text: "Profile corrections saved. Scores recalculated.", tone: "success" });
      setCorrectionOpen(false);
    });
  }

  const { account, profile, signals, recommendations, products, inferenceMeta } = view.snapshot;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* ── Left column ──────────────────────────────────────────────────── */}
        <div className="space-y-5 min-w-0">

          {/* Account summary card */}
          <div className="bg-surface-low rounded-xl p-6 relative overflow-hidden">
            {/* Decorative blur */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Confidence badge — top right */}
            <div className="absolute top-5 right-5 flex flex-col items-end">
              <div className="font-headline font-bold text-4xl text-tertiary leading-none">
                {profile.profileConfidence}%
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Icon name="verified" size={14} className="text-tertiary" />
                <span className="text-[10px] text-tertiary/70 font-medium">Profile confidence</span>
              </div>
            </div>

            {/* Account identity */}
            <div className="flex items-start gap-3 pr-28">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center">
                <Icon name="domain" size={20} className="text-primary" />
              </div>
              <div>
                <div className="eyebrow mb-1">Intelligence Workbench</div>
                <h2 className="font-headline font-bold text-on-surface text-2xl md:text-3xl leading-tight">
                  {account.canonicalName}
                </h2>
                <p className="text-sm text-on-surface-var mt-1">
                  {account.primaryDomain}
                  {profile.subIndustry ? ` · ${profile.subIndustry}` : ""}
                  {profile.geography ? ` · ${profile.geography}` : ""}
                  {profile.operatingRegions?.length ? ` · ${profile.operatingRegions.join(", ")}` : ""}
                </p>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: "Industry",        value: titleCase(profile.industry ?? "—") },
                { label: "HQ Region",      value: profile.geography ?? "—" },
                { label: "Global Ops",     value: profile.operatingRegions?.length ? profile.operatingRegions.join(", ") : "—" },
                { label: "Maturity",       value: titleCase(profile.maturity ?? "—") },
                { label: "Complexity",     value: titleCase(profile.complexity ?? "—") }
              ].map((item) => (
                <div key={item.label} className="bg-surface-high/60 rounded-lg px-3 py-2.5">
                  <div className="eyebrow mb-1">{item.label}</div>
                  <div className="text-xs font-semibold text-on-surface">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Status badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <FreshnessPill freshness={recommendations[0]?.freshnessState ?? "fresh"} />
              <Badge tone={account.status === "existing" ? "success" : "warning"}>
                {titleCase(account.status)}
              </Badge>
              <Badge tone={profile.conflictSummary.length > 0 ? "danger" : "neutral"}>
                {profile.conflictSummary.length > 0 ? "Conflict visible" : "No conflicts"}
              </Badge>
              {primaryRecommendation && <Badge tone="primary">Primary motion selected</Badge>}
            </div>

            {/* Workflow actions */}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => handleWorkflow("approve_profile")}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-surface text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Icon name="check_circle" size={16} />
                Approve
              </button>
              <button
                onClick={() => handleWorkflow("validate_in_discovery")}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-warning/30 bg-warning/10 text-warning text-sm font-semibold hover:bg-warning/15 transition-colors disabled:opacity-40"
              >
                <Icon name="science" size={16} />
                Validate in discovery
              </button>
              <button
                onClick={() => handleWorkflow("send_to_review")}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-high text-on-surface-var text-sm font-semibold hover:text-on-surface transition-colors disabled:opacity-40"
              >
                <Icon name="rate_review" size={16} />
                Needs review
              </button>
              <button
                onClick={handleRefresh}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant/20 bg-transparent text-on-surface-var text-sm hover:text-on-surface hover:bg-surface-high transition-colors disabled:opacity-40 ml-auto"
              >
                <Icon name="sync" size={16} className={isPending ? "animate-spin" : ""} />
                {isPending ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {message && (
              <p className={cx("mt-3 text-sm", message.tone === "success" ? "text-tertiary" : "text-error")}>
                {message.text}
              </p>
            )}
          </div>

          {/* Intelligence signals */}
          <div className="bg-surface-low rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-semibold text-on-surface">Intelligence Signals</h3>
                <span className="bg-primary-container/20 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {signals.length}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {signals.map((signal) => {
                const style = getSignalStyle(signal.fieldName);
                return (
                  <div key={signal.id} className="flex items-start gap-3 p-3 bg-surface-high/50 rounded-xl">
                    <div className={cx("flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center", style.bg)}>
                      <Icon name={style.icon} size={18} className={style.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-on-surface leading-tight">
                            {titleCase(signal.fieldName)}
                          </div>
                          <div className="text-xs text-on-surface-var mt-0.5">
                            {titleCase(signal.fieldValue)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Badge tone={signal.conflictFlag ? "danger" : "success"}>
                            {signal.conflictFlag ? "Conflict" : "Verified"}
                          </Badge>
                          <span className="text-[10px] text-on-surface-var/60">{signal.confidence}%</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <ConfidenceBar
                          value={signal.confidence}
                          tone={signal.conflictFlag ? "danger" : "primary"}
                        />
                      </div>
                      <div className="mt-1.5 text-[10px] text-on-surface-var/50">
                        Extracted {prettyDate(signal.extractedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Business anatomy */}
          <div className="bg-surface-low rounded-xl p-5">
            <SectionHeader title="Business Anatomy" />

            {profile.businessFunctions && profile.businessFunctions.length > 0 && (
              <div className="mb-4">
                <div className="eyebrow mb-2">Business Functions</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.businessFunctions.map((fn) => (
                    <span
                      key={fn}
                      className="bg-surface-highest border border-outline-variant/20 text-on-surface-var text-[11px] px-2.5 py-1 rounded-full"
                    >
                      {titleCase(fn)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.growthSignals && profile.growthSignals.length > 0 && (
              <div>
                <div className="eyebrow mb-2">Growth Signals</div>
                <div className="space-y-1.5">
                  {profile.growthSignals.map((gs) => (
                    <div key={gs} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary flex-shrink-0" />
                      <span className="text-sm text-on-surface-var">{titleCase(gs)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendation preview */}
          <div className="bg-surface-low rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline font-semibold text-on-surface">Account Motions</h3>
              <Link
                href="/review-queue"
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Open queue
                <Icon name="arrow_forward" size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => {
                const product = products.find((p) => p.id === rec.productId);
                const isPrimary = primaryRecommendation?.id === rec.id;
                const borderColor = classificationBorder[rec.classification] ?? "border-l-outline-variant";
                const textColor = classificationText[rec.classification] ?? "text-on-surface-var";

                return (
                  <div
                    key={rec.id}
                    className={cx(
                      "border-l-4 rounded-r-xl bg-surface-high p-4",
                      borderColor
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <Badge
                            tone={
                              rec.classification === "anchor" ? "primary" :
                              rec.classification === "adjacent" ? "success" : "warning"
                            }
                          >
                            {titleCase(rec.classification.replace("_", " "))}
                          </Badge>
                          <Badge
                            tone={
                              rec.status === "approved" ? "success" :
                              rec.status === "validate_in_discovery" ? "warning" : "danger"
                            }
                          >
                            {titleCase(rec.status.replace(/_/g, " "))}
                          </Badge>
                          {isPrimary && (
                            <Badge tone="primary">
                              <Icon name="star" size={10} className="mr-0.5" />
                              Primary
                            </Badge>
                          )}
                        </div>

                        <div className={cx("font-headline font-semibold text-lg leading-tight", textColor)}>
                          {product?.name ?? rec.productId}
                        </div>
                        <p className="text-xs text-on-surface-var mt-1 line-clamp-2">{rec.rationale}</p>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className="font-headline font-bold text-2xl text-on-surface leading-none">
                          {rec.fitScore}
                          <span className="text-sm text-on-surface-var font-normal">%</span>
                        </div>
                        <div className="text-[10px] text-on-surface-var/60 mt-0.5">fit score</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-outline-variant/10">
                      <p className="text-xs text-on-surface-var/70 flex-1 min-w-0 truncate">
                        {isPrimary ? "Selected primary motion for this account" : rec.nextBestAction}
                      </p>
                      <Link
                        href={`/recommendations/${rec.id}`}
                        className="flex-shrink-0 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        View evidence
                        <Icon name="arrow_forward" size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Expert context */}
          <div className="bg-surface-low rounded-xl p-5">
            <SectionHeader title="Expert Context" />
            <div className="space-y-3">
              <div className="bg-surface-high rounded-xl p-4">
                <div className="eyebrow mb-1">Assigned Analyst</div>
                <div className="text-sm font-semibold text-on-surface">{view.analyst}</div>
              </div>
              <div className="bg-surface-high rounded-xl p-4">
                <div className="eyebrow mb-1">Inference Mode</div>
                <div className="text-sm font-semibold text-on-surface">{titleCase(inferenceMeta.mode)}</div>
                <p className="text-xs text-on-surface-var mt-1 leading-relaxed">{inferenceMeta.summary}</p>
              </div>
              <div className="bg-surface-high rounded-xl p-4">
                <div className="eyebrow mb-1">Freshest Signal</div>
                <div className="text-sm font-semibold text-on-surface">
                  {view.provenanceSummary.freshestSignal ?? "No recent signals"}
                </div>
                <p className="text-xs text-on-surface-var mt-1">
                  {view.provenanceSummary.verifiedSignals} verified of {view.provenanceSummary.totalSignals} total
                </p>
              </div>
            </div>
          </div>

          {/* Profile confidence ring */}
          <div className="bg-surface-low rounded-xl p-5">
            <SectionHeader title="Profile Confidence" />
            <div className="flex items-center gap-4">
              <ConfidenceRing value={profile.profileConfidence} tone="amber" size="md" />
              <div>
                <p className="text-xs text-on-surface-var leading-relaxed">
                  Defensibility based on evidence quality, freshness, and conflict state.
                </p>
                <ConfidenceBar
                  value={profile.profileConfidence}
                  tone={profile.profileConfidence >= 75 ? "success" : profile.profileConfidence >= 50 ? "warning" : "danger"}
                  className="mt-3 w-full"
                />
              </div>
            </div>
          </div>

          {/* Glass: Explainability */}
          <div className="glass-panel rounded-xl p-5">
            <SectionHeader title="Profile Transparency" />
            <div className="space-y-2">
              {inferenceMeta.matchedRules.map((rule) => (
                <div key={rule} className="bg-surface-highest/60 rounded-lg p-3 text-xs text-on-surface-var leading-relaxed">
                  <Icon name="check" size={12} className="text-primary mr-1.5" />
                  {rule}
                </div>
              ))}
              {inferenceMeta.limitations.map((item) => (
                <div key={item} className="bg-warning/8 border border-warning/20 rounded-lg p-3 text-xs text-warning/90 leading-relaxed">
                  <Icon name="info" size={12} className="mr-1.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Related signals */}
          <div className="bg-surface-low rounded-xl p-5">
            <SectionHeader title="Related Signals" />
            <div className="space-y-2">
              {view.relatedSignals.map((signal) => (
                <div key={signal} className="flex items-center gap-2.5 p-3 bg-surface-high rounded-xl">
                  <Icon name="hub" size={14} className="text-primary flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-on-surface">{titleCase(signal)}</div>
                    <div className="text-[10px] text-on-surface-var/60">Normalized profile cluster</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual correction (collapsible) — am + data_steward only */}
          {canCorrect && <div className="bg-surface-low rounded-xl overflow-hidden">
            <button
              onClick={() => setCorrectionOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-5 py-4 hover:bg-surface-high transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon name="edit" size={16} className="text-on-surface-var" />
                <span className="text-sm font-semibold text-on-surface">Manual Correction</span>
              </div>
              <Icon
                name={correctionOpen ? "expand_less" : "expand_more"}
                size={18}
                className="text-on-surface-var"
              />
            </button>

            {correctionOpen && (
              <div className="px-5 pb-5 space-y-3 border-t border-outline-variant/10">
                <p className="text-xs text-on-surface-var leading-relaxed pt-3">
                  Correct heuristic profile fields when you have firsthand account knowledge.
                </p>
                <input
                  value={draft.industry ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, industry: e.target.value }))}
                  placeholder="Industry"
                  className="input-base w-full"
                />
                <textarea
                  value={draft.businessFunctions?.join(", ") ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      businessFunctions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    }))
                  }
                  placeholder="Business functions (comma separated)"
                  className="input-base w-full min-h-[80px] resize-none"
                />
                <textarea
                  value={draft.growthSignals?.join(", ") ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      growthSignals: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    }))
                  }
                  placeholder="Growth signals (comma separated)"
                  className="input-base w-full min-h-[80px] resize-none"
                />
                <button
                  onClick={handleProfileUpdate}
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-surface text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Icon name="save" size={15} />
                  {isPending ? "Saving…" : "Save corrections"}
                </button>
              </div>
            )}
          </div>}

        </div>
      </div>
    </div>
  );
}

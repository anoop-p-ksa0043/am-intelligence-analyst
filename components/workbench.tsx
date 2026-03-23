"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Account,
  AccountWorkflowAction,
  DashboardSnapshot,
  IntakeResponse,
  ProfileUpdateRequest,
  Recommendation,
  ReviewDecision
} from "@/lib/domain";
import { prettyDate, titleCase } from "@/lib/utils";

type WorkbenchProps = {
  initialSnapshot: DashboardSnapshot;
  accounts: Array<{
    id: string;
    canonicalName: string;
    primaryDomain: string;
    status: string;
    confidenceStatus: string;
    recommendationCount: number;
    profileConfidence: number;
    freshnessState: string;
  }>;
  overview: {
    accounts: number;
    activeProducts: number;
    reviewQueue: number;
    approvedPublicSources: number;
  };
};

type CandidatePreview = {
  account: Account;
  message: string;
  summary: string;
  nextStep: string;
};

function Pill({
  tone,
  children
}: {
  tone: "neutral" | "success" | "warning" | "danger";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "bg-white/80 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-700"
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function ScoreRing({
  label,
  score,
  color
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="metric-ring shrink-0" style={{ ["--ring-value" as string]: `${score}`, ["--ring-color" as string]: color }}>
        <span className="text-lg font-semibold">{score}</span>
      </div>
      <div>
        <div className="eyebrow">{label}</div>
        <p className="mt-1 text-sm text-slate-600">
          {label === "Fit Score"
            ? "Rule-led conceptual match against governed product logic."
            : "Defensibility based on evidence quality, freshness, and conflict state."}
        </p>
      </div>
    </div>
  );
}

export function Workbench({ initialSnapshot, accounts, overview }: WorkbenchProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [accountsList, setAccountsList] = useState(accounts);
  const [selectedAccountId, setSelectedAccountId] = useState(initialSnapshot.account.id);
  const [intakeResult, setIntakeResult] = useState<IntakeResponse | null>(null);
  const [candidatePreview, setCandidatePreview] = useState<CandidatePreview | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string>("");
  const [profileDraft, setProfileDraft] = useState<ProfileUpdateRequest>({
    industry: initialSnapshot.profile.industry ?? "",
    businessFunctions: initialSnapshot.profile.businessFunctions,
    growthSignals: initialSnapshot.profile.growthSignals
  });
  const [isPending, startTransition] = useTransition();
  const recommendationsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSnapshot(initialSnapshot);
    setAccountsList(accounts);
    setSelectedAccountId(initialSnapshot.account.id);
    setProfileDraft({
      industry: initialSnapshot.profile.industry ?? "",
      businessFunctions: initialSnapshot.profile.businessFunctions,
      growthSignals: initialSnapshot.profile.growthSignals
    });
  }, [initialSnapshot, accounts]);

  function createCandidatePreview(result: IntakeResponse) {
    return {
      account: result.account,
      message:
        result.matchMethod === "candidate_created"
          ? "New account candidate created from intake"
          : "Account requires review before it joins the governed workbench",
      summary:
        "No normalized profile exists yet. This intake needs evidence collection, account resolution, and confidence building before recommendations can be published.",
      nextStep:
        "Run public-source ingestion, confirm canonical identity, and route medium-confidence matches to stewardship review."
    };
  }

  async function focusExistingAccount(accountId: string) {
    const response = await fetch(`/api/accounts/${accountId}`);
    if (!response.ok) {
      return;
    }
    const detail = (await response.json()) as DashboardSnapshot;
    setSnapshot(detail);
    setSelectedAccountId(detail.account.id);
    setCandidatePreview(null);
    setProfileDraft({
      industry: detail.profile.industry ?? "",
      businessFunctions: detail.profile.businessFunctions,
      growthSignals: detail.profile.growthSignals
    });
  }

  function upsertWorkbenchAccount(nextSnapshot: DashboardSnapshot) {
    setAccountsList((current) => {
      const nextItem = {
        id: nextSnapshot.account.id,
        canonicalName: nextSnapshot.account.canonicalName,
        primaryDomain: nextSnapshot.account.primaryDomain,
        status: nextSnapshot.account.status,
        confidenceStatus: nextSnapshot.account.confidenceStatus,
        recommendationCount: nextSnapshot.recommendations.length,
        profileConfidence: nextSnapshot.profile.profileConfidence,
        freshnessState: nextSnapshot.recommendations[0]?.freshnessState ?? "fresh"
      };

      const existingIndex = current.findIndex((item) => item.id === nextItem.id);
      if (existingIndex >= 0) {
        const clone = [...current];
        clone[existingIndex] = nextItem;
        return clone;
      }

      return [nextItem, ...current];
    });
  }

  function focusRecommendations() {
    recommendationsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  const selectedPrimaryRecommendation = snapshot.recommendations.find(
    (recommendation) => recommendation.id === snapshot.selectedPrimaryRecommendationId
  );

  async function handleIntake(formData: FormData) {
    const payload = {
      organizationName: String(formData.get("organizationName") || ""),
      domain: String(formData.get("domain") || ""),
      crmReference: String(formData.get("crmReference") || "")
    };

    startTransition(async () => {
      const response = await fetch("/api/accounts/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as IntakeResponse;
      setIntakeResult(data);
      setReviewMessage("");

      const existingAccount = accounts.find((account) => account.id === data.account.id);
      if (existingAccount) {
        await focusExistingAccount(existingAccount.id);
        return;
      }

      setCandidatePreview(createCandidatePreview(data));
      setSelectedAccountId(data.account.id);
    });
  }

  async function handleRefresh() {
    startTransition(async () => {
      const response = await fetch(`/api/accounts/${snapshot.account.id}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "manual" })
      });

      if (response.ok) {
        const refreshResponse = await fetch(`/api/accounts/${snapshot.account.id}`);
        const detail = (await refreshResponse.json()) as DashboardSnapshot;
        setSnapshot(detail);
        setCandidatePreview(null);
        setSelectedAccountId(detail.account.id);
        upsertWorkbenchAccount(detail);
      }
    });
  }

  async function handleReview(recommendationId: string, decision: ReviewDecision) {
    startTransition(async () => {
      const response = await fetch(`/api/recommendations/${recommendationId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          notes:
            decision === "accepted"
              ? "Approved during workbench review."
              : "Recommendation requires more discovery."
        })
      });

      if (response.ok) {
        setReviewMessage(`Recommendation updated to ${decision.replace(/_/g, " ")}.`);
        const detailResponse = await fetch(`/api/accounts/${snapshot.account.id}`);
        const detail = (await detailResponse.json()) as DashboardSnapshot;
        setSnapshot(detail);
        setCandidatePreview(null);
        setSelectedAccountId(detail.account.id);
        upsertWorkbenchAccount(detail);
      }
    });
  }

  async function handleCandidateAnalysis() {
    if (!candidatePreview) {
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/accounts/analyze-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: candidatePreview.account })
      });

      if (!response.ok) {
        return;
      }

      const detail = (await response.json()) as DashboardSnapshot;
      setSnapshot(detail);
      setSelectedAccountId(detail.account.id);
      setCandidatePreview(null);
      setReviewMessage("Candidate analysis completed. Evidence, profile, and recommendations are now live.");
      upsertWorkbenchAccount(detail);
      setProfileDraft({
        industry: detail.profile.industry ?? "",
        businessFunctions: detail.profile.businessFunctions,
        growthSignals: detail.profile.growthSignals
      });
    });
  }

  async function handleAccountAction(action: AccountWorkflowAction, message: string) {
    startTransition(async () => {
      const response = await fetch(`/api/accounts/${snapshot.account.id}/workflow-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        return;
      }

      const detail = (await response.json()) as DashboardSnapshot;
      setSnapshot(detail);
      setSelectedAccountId(detail.account.id);
      setCandidatePreview(null);
      setReviewMessage(message);
      upsertWorkbenchAccount(detail);
      setProfileDraft({
        industry: detail.profile.industry ?? "",
        businessFunctions: detail.profile.businessFunctions,
        growthSignals: detail.profile.growthSignals
      });

      if (action === "approve_profile" || action === "validate_in_discovery") {
        setTimeout(() => {
          focusRecommendations();
        }, 120);
      }
    });
  }

  async function handleProfileCorrection(formData: FormData) {
    const industry = String(formData.get("industry") || "")
      .split(",")
      .join(" ")
      .trim();
    const businessFunctions = String(formData.get("businessFunctions") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const growthSignals = String(formData.get("growthSignals") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    startTransition(async () => {
      const response = await fetch(`/api/accounts/${snapshot.account.id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          businessFunctions,
          growthSignals
        })
      });

      if (!response.ok) {
        return;
      }

      const detail = (await response.json()) as DashboardSnapshot;
      setSnapshot(detail);
      setSelectedAccountId(detail.account.id);
      setCandidatePreview(null);
      setReviewMessage("Profile corrections saved. Recommendations were rescored using the updated profile.");
      upsertWorkbenchAccount(detail);
      setProfileDraft({
        industry: detail.profile.industry ?? "",
        businessFunctions: detail.profile.businessFunctions,
        growthSignals: detail.profile.growthSignals
      });
    });
  }

  return (
    <main className="app-shell relative overflow-hidden px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="panel overflow-hidden rounded-[2rem] p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.95fr]">
            <div>
              <div className="eyebrow">Phase 1 Decision Workbench</div>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-6xl">
                Account intelligence with confidence, provenance, and human review built in.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
                This MVP turns approved public signals into a normalized account profile, correlates the profile
                against governed product rules, and surfaces evidence-backed next-best actions without autonomous
                execution.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Canonical Accounts", value: overview.accounts },
                  { label: "Active Products", value: overview.activeProducts },
                  { label: "Review Queue", value: overview.reviewQueue },
                  { label: "Approved Sources", value: overview.approvedPublicSources }
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4"
                    style={{ animation: `fade-up 500ms ease ${index * 80}ms both` }}
                  >
                    <div className="eyebrow">{item.label}</div>
                    <div className="mt-3 text-3xl font-semibold text-ink">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.75rem] bg-ink px-5 py-6 text-white shadow-panel">
              <div className="eyebrow text-white/60">Account Intake</div>
              <h2 className="mt-2 text-2xl font-semibold">
                Search a company and make that result the active focus immediately.
              </h2>
              <form action={handleIntake} className="mt-6 space-y-4">
                <input
                  name="organizationName"
                  placeholder="Organization name"
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 outline-none placeholder:text-white/45"
                />
                <input
                  name="domain"
                  placeholder="Primary domain"
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 outline-none placeholder:text-white/45"
                />
                <input
                  name="crmReference"
                  placeholder="CRM reference (optional)"
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 outline-none placeholder:text-white/45"
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gold px-4 py-3 font-semibold text-ink transition hover:-translate-y-0.5"
                >
                  {isPending ? "Resolving..." : "Run intake"}
                </button>
              </form>
              <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm">
                <div className="eyebrow text-white/60">
                  {candidatePreview ? "Active search result" : "Latest intake outcome"}
                </div>
                {intakeResult ? (
                  <>
                    <p className="mt-2 font-semibold">{intakeResult.account.canonicalName}</p>
                    <p className="mt-1 text-white/80">
                      {titleCase(intakeResult.resolutionStatus)} via {titleCase(intakeResult.matchMethod)} matching
                    </p>
                    <p className="mt-2 text-white/70">
                      {candidatePreview
                        ? "This company is now front-and-center in the workspace below."
                        : "Matched accounts replace the current workbench context immediately."}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-white/70">
                    Search an organization to either pull an existing governed account into focus or create a new candidate flow.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="panel rounded-[1.75rem] p-5">
            <div className="eyebrow">Workbench Accounts</div>
            <div className="mt-4 space-y-3">
              {accountsList.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => {
                    startTransition(async () => {
                      await focusExistingAccount(account.id);
                    });
                  }}
                  className={`rounded-[1.25rem] border p-4 ${
                    account.id === selectedAccountId && !candidatePreview
                      ? "border-ember bg-ember/10"
                      : "border-slate-200 bg-white/70"
                  } w-full text-left transition hover:-translate-y-0.5`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{account.canonicalName}</p>
                      <p className="mt-1 text-xs text-slate-500">{account.primaryDomain}</p>
                    </div>
                    <Pill
                      tone={
                        account.freshnessState === "fresh"
                          ? "success"
                          : account.freshnessState === "aging"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {titleCase(account.freshnessState)}
                    </Pill>
                  </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                      <span>{account.recommendationCount} recommendations</span>
                      <span>{account.profileConfidence}% profile confidence</span>
                    </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
            {candidatePreview ? (
              <section className="panel rounded-[1.75rem] overflow-hidden border-2 border-ember">
                <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="bg-white/90 p-6 md:p-7">
                    <div className="eyebrow text-ember">Search Result In Focus</div>
                    <h2 className="mt-2 text-4xl font-semibold text-ink">
                      {candidatePreview.account.canonicalName}
                    </h2>
                    <p className="mt-3 text-lg leading-8 text-slate-700">{candidatePreview.message}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Pill tone="warning">{titleCase(intakeResult?.resolutionStatus ?? "new")}</Pill>
                      <Pill tone="neutral">{candidatePreview.account.primaryDomain}</Pill>
                      <Pill tone="neutral">No recommendations yet</Pill>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] bg-sand p-5">
                        <div className="eyebrow">What this means</div>
                        <p className="mt-2 text-sm leading-7 text-slate-700">{candidatePreview.summary}</p>
                      </div>
                      <div className="rounded-[1.5rem] bg-ink p-5 text-white">
                        <div className="eyebrow text-white/60">Recommended next step</div>
                        <p className="mt-2 text-sm leading-7 text-white/85">{candidatePreview.nextStep}</p>
                        <button
                          type="button"
                          onClick={handleCandidateAnalysis}
                          className="mt-5 w-full rounded-2xl bg-gold px-4 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
                        >
                          {isPending ? "Running analysis..." : "Start account analysis"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-ink p-6 text-white md:p-7">
                    <div className="eyebrow text-white/60">Candidate Activation Flow</div>
                    <div className="mt-4 space-y-3">
                      <WorkflowStep
                        label="1. Identity review"
                        description="Confirm the company is not a fuzzy duplicate before attaching evidence."
                        dark
                      />
                      <WorkflowStep
                        label="2. Public-source ingestion"
                        description="Collect approved public signals with provenance and source quality."
                        dark
                      />
                      <WorkflowStep
                        label="3. Normalization and scoring"
                        description="Publish a structured profile before product-fit recommendations appear."
                        dark
                      />
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="panel rounded-[1.75rem] p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="eyebrow">{candidatePreview ? "Current governed account" : "Account Summary"}</div>
                  <h2 className="mt-2 text-3xl font-semibold text-ink">{snapshot.account.canonicalName}</h2>
                  <p className="mt-2 max-w-3xl text-slate-600">
                    {snapshot.profile.subIndustry} in {snapshot.profile.geography}. Recommendations stay advisory and
                    evidence-backed until reviewed by AM/CS.
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-ink transition hover:-translate-y-0.5"
                >
                  {isPending ? "Refreshing..." : "Refresh account"}
                </button>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="eyebrow">Next Step Actions</div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleAccountAction(
                        "approve_profile",
                        "Profile approved. The account is now in a governed existing state. Next step: triage the recommendations below."
                      )
                    }
                    className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Approve profile
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAccountAction(
                        "send_to_review",
                        "Account sent to analyst review for more evidence and identity validation."
                      )
                    }
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
                  >
                    Needs analyst review
                  </button>
                  <button
                    type="button"
                    onClick={focusRecommendations}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
                  >
                    Review recommendations
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAccountAction(
                        "validate_in_discovery",
                        "Recommendations are now marked for discovery validation before broader use."
                      )
                    }
                    className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 transition hover:-translate-y-0.5"
                  >
                    Validate in discovery
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Pill tone={snapshot.account.status === "existing" ? "success" : snapshot.account.status === "new" ? "warning" : "danger"}>
                  {titleCase(snapshot.account.status)}
                </Pill>
                <Pill tone={snapshot.inferenceMeta.mode === "manual_override" ? "success" : snapshot.inferenceMeta.mode === "seeded" ? "neutral" : "warning"}>
                  {snapshot.inferenceMeta.mode === "manual_override"
                    ? "Manually corrected"
                    : snapshot.inferenceMeta.mode === "seeded"
                      ? "Curated seed profile"
                      : "Provisional inferred values"}
                </Pill>
                <Pill tone={snapshot.profile.conflictSummary.length ? "warning" : "neutral"}>
                  {snapshot.profile.conflictSummary.length ? "Conflict visible" : "No active conflicts"}
                </Pill>
                <Pill tone="neutral">Last refresh {prettyDate(snapshot.account.lastRefreshedAt)}</Pill>
              </div>

              <div
                className={`mt-4 rounded-[1.25rem] border px-4 py-4 ${
                  snapshot.account.status === "existing"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        snapshot.account.status === "existing" ? "text-emerald-800" : "text-amber-900"
                      }`}
                    >
                      {snapshot.account.status === "existing"
                        ? "Account approved for recommendation triage"
                        : "Account still needs review before broader use"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {snapshot.account.status === "existing"
                        ? `${snapshot.recommendations.length} recommendations are ready for decisioning. Approve the strongest ones and send medium-confidence plays to discovery validation.`
                        : "Review the profile quality first, then decide whether to approve the account or keep it in analyst review."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={focusRecommendations}
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
                  >
                    Go to recommendations
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]">
                <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-5">
                  <div className="eyebrow">Inference Transparency</div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{snapshot.inferenceMeta.summary}</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-ink">Matched rules</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {snapshot.inferenceMeta.matchedRules.map((rule) => (
                        <span key={rule} className="rounded-full bg-white px-3 py-1 text-xs text-slate-700">
                          {rule}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-ink">Limitations</p>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                      {snapshot.inferenceMeta.limitations.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5">
                  <div className="eyebrow">Correct Provisional Profile</div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Edit these values when the heuristic guess is wrong. Use comma-separated values for business functions and growth signals.
                  </p>
                  <form action={handleProfileCorrection} className="mt-4 space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-ink">Industry</span>
                      <input
                        name="industry"
                        defaultValue={profileDraft.industry}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-ink">Business functions</span>
                      <input
                        name="businessFunctions"
                        defaultValue={(profileDraft.businessFunctions ?? []).join(", ")}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-ink">Growth signals</span>
                      <input
                        name="growthSignals"
                        defaultValue={(profileDraft.growthSignals ?? []).join(", ")}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                      />
                    </label>
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      {isPending ? "Saving corrections..." : "Save profile corrections"}
                    </button>
                  </form>
                </section>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="rounded-[1.5rem] bg-white/80 p-5">
                  <div className="eyebrow">Signals Dashboard</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Industry</p>
                      <p className="mt-1 text-lg font-semibold text-ink">{snapshot.profile.industry}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Complexity</p>
                      <p className="mt-1 text-lg font-semibold text-ink">{titleCase(snapshot.profile.complexity ?? "unknown")}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm font-semibold text-slate-500">Business functions</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {snapshot.profile.businessFunctions.map((item) => (
                          <span key={item} className="rounded-full bg-sand px-3 py-1 text-sm text-ink">
                            {titleCase(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm font-semibold text-slate-500">Growth signals</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {snapshot.profile.growthSignals.map((item) => (
                          <span key={item} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                            {titleCase(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-ink p-5 text-white">
                  <div className="eyebrow text-white/60">Evidence & Confidence</div>
                  <div className="mt-5 grid gap-6">
                    <ScoreRing label="Profile Confidence" score={snapshot.profile.profileConfidence} color="#f4a261" />
                    <div className="grid gap-2">
                      {snapshot.signals.slice(0, 4).map((signal) => (
                        <div key={signal.id} className="rounded-2xl bg-white/8 px-4 py-3">
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-semibold">{titleCase(signal.fieldName)}</span>
                            <span className="text-sm text-white/70">{signal.confidence}%</span>
                          </div>
                          <p className="mt-1 text-sm text-white/80">{titleCase(signal.fieldValue)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
              <div id="recommendations" ref={recommendationsRef} className="panel rounded-[1.75rem] p-5 md:p-6">
                <div className="eyebrow">Recommendations</div>
                <div className="mt-3 rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  Triage order:
                  <span className="font-semibold text-ink"> approve </span>
                  high-fit, high-confidence recommendations,
                  <span className="font-semibold text-ink"> validate in discovery </span>
                  medium-confidence plays, and
                  <span className="font-semibold text-ink"> hold for analyst </span>
                  when the rationale or evidence still feels weak.
                </div>
                {selectedPrimaryRecommendation ? (
                  <div className="mt-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
                    <div className="eyebrow text-emerald-800">Primary Motion Selected</div>
                    <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-ink">
                          {titleCase(selectedPrimaryRecommendation.productId.replace("prod-", "").replace(/-/g, " "))}
                        </h3>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-700">
                          This anchor is now the primary recommendation for the account. Use its next-best action to guide discovery,
                          account planning, and internal AM/CS alignment. Treat adjacent recommendations as follow-on plays.
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] bg-white px-4 py-3 text-sm text-slate-700">
                        Next step:
                        <span className="ml-1 font-semibold text-ink">
                          Prepare a discovery brief around the selected anchor motion.
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <RecommendationGuideCard
                    title="Anchor"
                    description="Treat this as the primary product motion. Usually pick the strongest one anchor recommendation first."
                  />
                  <RecommendationGuideCard
                    title="Adjacent"
                    description="Use this as an expansion or follow-on play after the primary motion is validated."
                  />
                  <RecommendationGuideCard
                    title="Ecosystem Enabler"
                    description="Use this when the account has partnership, channel, or ecosystem complexity that benefits from broader enablement."
                  />
                </div>
                <div className="mt-4 space-y-4">
                  {snapshot.recommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      onReview={handleReview}
                      selectedPrimaryRecommendationId={snapshot.selectedPrimaryRecommendationId}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <section className="panel rounded-[1.75rem] p-5">
                  <div className="eyebrow">Validation Workflow</div>
                  <div className="mt-4 space-y-3">
                    <WorkflowStep
                      label="Approved"
                      description="High-confidence recommendations publish directly into the workbench."
                    />
                    <WorkflowStep
                      label="Validate in discovery"
                      description="Medium-confidence items stay visible but require discovery confirmation."
                    />
                    <WorkflowStep
                      label="Review required"
                      description="Low-confidence or conflicting outputs route to analyst/admin review."
                    />
                  </div>
                  {reviewMessage ? (
                    <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{reviewMessage}</p>
                  ) : null}
                </section>

                <section className="panel rounded-[1.75rem] p-5">
                  <div className="eyebrow">Refresh & Audit</div>
                  <div className="mt-4 space-y-3">
                    {snapshot.refreshJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="rounded-[1.25rem] border border-slate-200 bg-white/80 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-ink">{titleCase(job.jobType)}</p>
                          <Pill tone={job.status === "completed" ? "success" : job.status === "stale" ? "warning" : "neutral"}>
                            {titleCase(job.status)}
                          </Pill>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{job.sourceScope.map(titleCase).join(", ")}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {prettyDate(job.completedAt ?? job.startedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function RecommendationCard({
  recommendation,
  onReview,
  selectedPrimaryRecommendationId
}: {
  recommendation: Recommendation;
  onReview: (recommendationId: string, decision: ReviewDecision) => void;
  selectedPrimaryRecommendationId?: string;
}) {
  const tone =
    recommendation.status === "approved"
      ? "success"
      : recommendation.status === "validate_in_discovery"
        ? "warning"
        : "danger";

  const isSelectedPrimary = selectedPrimaryRecommendationId === recommendation.id;

  return (
    <article
      className={`rounded-[1.5rem] border bg-white/80 p-5 ${
        isSelectedPrimary ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-200"
      }`}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={tone}>{titleCase(recommendation.status)}</Pill>
            <Pill tone="neutral">{titleCase(recommendation.classification)}</Pill>
            {isSelectedPrimary ? <Pill tone="success">Primary motion</Pill> : null}
            <Pill tone={recommendation.freshnessState === "fresh" ? "success" : recommendation.freshnessState === "aging" ? "warning" : "danger"}>
              {titleCase(recommendation.freshnessState)}
            </Pill>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-ink">
              {titleCase(recommendation.productId.replace("prod-", "").replace(/-/g, " "))}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{recommendation.rationale}</p>
          </div>
          <p className="rounded-[1rem] bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Recommended handling: {recommendationAdvice(recommendation, isSelectedPrimary)}
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendation.evidenceRefs.map((ref) => (
              <span key={ref} className="rounded-full bg-sand px-3 py-1 text-xs text-slate-700">
                Evidence {ref}
              </span>
            ))}
          </div>
          <p className="rounded-[1rem] bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Next-best action: {recommendation.nextBestAction}
          </p>
        </div>
        <div className="grid gap-4 md:min-w-[220px]">
          <ScoreRing label="Fit Score" score={recommendation.fitScore} color="#2a9d8f" />
          <ScoreRing label="Confidence Score" score={recommendation.confidenceScore} color="#e76f51" />
          <div className="grid gap-2">
            <button
              onClick={() => onReview(recommendation.id, "accepted")}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                recommendation.status === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-ink text-white"
              }`}
            >
              {isSelectedPrimary
                ? "Primary recommendation selected"
                : recommendation.status === "approved"
                  ? "Approved recommendation"
                  : recommendation.classification === "anchor"
                    ? "Approve as primary motion"
                    : "Approve recommendation"}
            </button>
            <button
              onClick={() => onReview(recommendation.id, "needs_follow_up")}
              className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"
            >
              Validate in discovery
            </button>
            <button
              onClick={() => onReview(recommendation.id, "rejected")}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink"
            >
              Hold for analyst
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function recommendationAdvice(recommendation: Recommendation, isSelectedPrimary: boolean) {
  if (isSelectedPrimary) {
    return "This is the chosen primary motion. Use it to drive the discovery brief and keep the other recommendations as supporting options.";
  }
  if (recommendation.classification === "anchor") {
    return recommendation.confidenceBand === "high"
      ? "Use this as the primary product motion for the account."
      : "Treat this as the leading product motion, but validate it in discovery before committing.";
  }

  if (recommendation.classification === "adjacent") {
    return "Position this as a secondary expansion play after the anchor motion is confirmed.";
  }

  return "Use this only if the account has ecosystem or partnership complexity that makes enablement relevant.";
}

function RecommendationGuideCard({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white/80 p-4">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function WorkflowStep({
  label,
  description,
  dark = false
}: {
  label: string;
  description: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.25rem] p-4 ${
        dark ? "border border-white/10 bg-white/8" : "border border-slate-200 bg-white/80"
      }`}
    >
      <p className={`font-semibold ${dark ? "text-white" : "text-ink"}`}>{label}</p>
      <p className={`mt-1 text-sm leading-6 ${dark ? "text-white/72" : "text-slate-600"}`}>
        {description}
      </p>
    </div>
  );
}

import {
  DashboardSnapshot,
  Recommendation,
  RecommendationReview
} from "@/lib/domain";
import {
  getDashboardSnapshot,
  getFoundationOverview,
  listWorkbenchAccounts
} from "@/lib/services";
import {
  AccountBoardRecord,
  AccountsBoardView,
  RecommendationDetailView,
  ReviewQueueItem,
  ReviewQueueView,
  WorkbenchView
} from "@/lib/console-types";
import { prettyDate, titleCase } from "@/lib/utils";

const analysts = ["Amina Shah", "Jordan Diaz", "Priya Menon", "Omar Rahman"];

function getAnalystForAccount(accountId: string) {
  const hash = accountId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return analysts[hash % analysts.length];
}

async function getAllSnapshots(): Promise<DashboardSnapshot[]> {
  const accounts = await listWorkbenchAccounts();
  const snapshots = await Promise.all(accounts.map((a) => getDashboardSnapshot(a.id)));
  return snapshots.filter((value): value is DashboardSnapshot => Boolean(value));
}

function getProductName(snapshot: DashboardSnapshot, recommendation?: Recommendation) {
  if (!recommendation) {
    return undefined;
  }
  return snapshot.products.find((product) => product.id === recommendation.productId)?.name ?? "Unknown Product";
}

function buildBoardRecord(snapshot: DashboardSnapshot): AccountBoardRecord {
  const unresolvedCount =
    snapshot.recommendations.filter((recommendation) => recommendation.status !== "approved").length +
    snapshot.profile.conflictSummary.length;
  const selectedPrimaryRecommendation = snapshot.recommendations.find(
    (recommendation) => recommendation.id === snapshot.selectedPrimaryRecommendationId
  );

  return {
    id: snapshot.account.id,
    canonicalName: snapshot.account.canonicalName,
    primaryDomain: snapshot.account.primaryDomain,
    industry: snapshot.profile.industry,
    region: snapshot.account.region,
    status: snapshot.account.status,
    confidenceStatus: snapshot.account.confidenceStatus,
    profileConfidence: snapshot.profile.profileConfidence,
    freshnessState: snapshot.recommendations[0]?.freshnessState ?? "fresh",
    recommendationCount: snapshot.recommendations.length,
    unresolvedCount,
    selectedPrimaryRecommendation: selectedPrimaryRecommendation
      ? {
          id: selectedPrimaryRecommendation.id,
          productName: getProductName(snapshot, selectedPrimaryRecommendation) ?? "Primary motion",
          classification: selectedPrimaryRecommendation.classification,
          status: selectedPrimaryRecommendation.status
        }
      : undefined,
    analyst: getAnalystForAccount(snapshot.account.id),
    nextAction:
      selectedPrimaryRecommendation?.nextBestAction ??
      (snapshot.account.status === "review_required"
        ? "Resolve profile review before broader use."
        : "Open workbench to analyze the account."),
    lastRefreshedAt: snapshot.account.lastRefreshedAt
  };
}

export async function getAccountsBoardView(): Promise<AccountsBoardView> {
  const [overview, snapshots] = await Promise.all([
    getFoundationOverview(),
    getAllSnapshots()
  ]);
  const boardRecords = snapshots.map(buildBoardRecord);

  return {
    metrics: [
      { label: "Tracked Accounts", value: overview.accounts, tone: "neutral" },
      {
        label: "Review Pressure",
        value: boardRecords.filter((record) => record.unresolvedCount > 0).length,
        tone: "warning"
      },
      {
        label: "Primary Motions",
        value: boardRecords.filter((record) => record.selectedPrimaryRecommendation).length,
        tone: "success"
      },
      {
        label: "Stale Accounts",
        value: boardRecords.filter((record) => record.freshnessState === "stale").length,
        tone: "danger"
      }
    ],
    accounts: boardRecords.sort((left, right) => {
      if (left.selectedPrimaryRecommendation && !right.selectedPrimaryRecommendation) {
        return -1;
      }
      if (!left.selectedPrimaryRecommendation && right.selectedPrimaryRecommendation) {
        return 1;
      }
      return right.profileConfidence - left.profileConfidence;
    }),
    availableIndustries: [
      ...new Set(
        boardRecords
          .map((record) => record.industry)
          .filter((value): value is string => Boolean(value))
      )
    ].sort()
  };
}

export async function getWorkbenchView(accountId: string): Promise<WorkbenchView | undefined> {
  const snapshot = await getDashboardSnapshot(accountId);

  if (!snapshot) {
    return undefined;
  }

  return {
    snapshot,
    analyst: getAnalystForAccount(accountId),
    provenanceSummary: {
      totalSignals: snapshot.signals.length,
      verifiedSignals: snapshot.signals.filter((signal) => signal.confidence >= 70 && !signal.conflictFlag).length,
      conflictingSignals: snapshot.signals.filter((signal) => signal.conflictFlag).length,
      freshestSignal: snapshot.signals[0] ? prettyDate(snapshot.signals[0].extractedAt) : undefined
    },
    relatedSignals: snapshot.profile.growthSignals.slice(0, 3)
  };
}

export async function getRecommendationDetailView(recommendationId: string): Promise<RecommendationDetailView | undefined> {
  const snapshots = await getAllSnapshots();

  for (const snapshot of snapshots) {
    const recommendation = snapshot.recommendations.find((candidate) => candidate.id === recommendationId);
    if (!recommendation) {
      continue;
    }

    const product = snapshot.products.find((candidate) => candidate.id === recommendation.productId);
    if (!product) {
      continue;
    }

    return {
      snapshot,
      recommendation,
      product,
      evidence: snapshot.signals.filter((signal) => recommendation.evidenceRefs.includes(signal.id)),
      reviews: snapshot.reviews
        .filter((review) => review.recommendationId === recommendation.id)
        .sort((left, right) => right.reviewedAt.localeCompare(left.reviewedAt)),
      selectedPrimaryRecommendation: snapshot.recommendations.find(
        (candidate) => candidate.id === snapshot.selectedPrimaryRecommendationId
      ),
      analyst: getAnalystForAccount(snapshot.account.id)
    };
  }

  return undefined;
}

function buildReviewQueueItem(snapshot: DashboardSnapshot): ReviewQueueItem[] {
  const items: ReviewQueueItem[] = [];
  const relatedSignals = snapshot.profile.growthSignals.slice(0, 2).map((value) => titleCase(value));

  if (snapshot.profile.conflictSummary.length > 0) {
    items.push({
      id: `queue-conflict-${snapshot.account.id}`,
      type: "conflict",
      severity: "danger",
      statusLabel: "Conflict",
      title: `Data conflict: ${snapshot.account.canonicalName}`,
      subtitle: snapshot.profile.conflictSummary[0],
      detail: "Firmographic or profile evidence needs analyst confirmation before downstream use.",
      ageLabel: snapshot.recommendations[0]?.freshnessState === "stale" ? "1h ago" : "12m ago",
      accountId: snapshot.account.id,
      scoreLabel: `${snapshot.profile.profileConfidence}/100 confidence`,
      relatedSignals,
      workspaceNote: "AI surfaced conflicting evidence patterns that should be reconciled in the workbench.",
      callToAction: "Resolve in workbench"
    });
  }

  if (snapshot.account.status === "review_required") {
    items.push({
      id: `queue-profile-${snapshot.account.id}`,
      type: "profile_review",
      severity: "warning",
      statusLabel: "Review Required",
      title: `Profile review: ${snapshot.account.canonicalName}`,
      subtitle: "Account profile still needs stewardship approval before broader use.",
      detail: "Check the normalized profile, provenance, and freshness before approving the account.",
      ageLabel: "15m ago",
      accountId: snapshot.account.id,
      scoreLabel: `${snapshot.profile.profileConfidence}/100 profile confidence`,
      relatedSignals,
      workspaceNote: "Manual review can either approve the profile or keep it in discovery-only mode.",
      callToAction: "Open workbench"
    });
  }

  const reviewRecommendation = snapshot.recommendations.find(
    (recommendation) => recommendation.status !== "approved"
  );

  if (reviewRecommendation) {
    items.push({
      id: `queue-rec-${reviewRecommendation.id}`,
      type: "recommendation",
      severity: reviewRecommendation.status === "review_required" ? "danger" : "warning",
      statusLabel:
        reviewRecommendation.status === "review_required" ? "Review Required" : "Validate in Discovery",
      title: `Recommendation review: ${snapshot.account.canonicalName}`,
      subtitle: reviewRecommendation.rationale,
      detail: reviewRecommendation.nextBestAction,
      ageLabel: "2m ago",
      accountId: snapshot.account.id,
      recommendationId: reviewRecommendation.id,
      scoreLabel: `${reviewRecommendation.fitScore}/100 fit`,
      relatedSignals,
      workspaceNote: "The recommendation should be accepted, validated, or held before it is promoted.",
      callToAction: "Review recommendation"
    });
  }

  const duplicateAlias = snapshot.aliases.find((alias) => alias.type === "alias" && alias.matchConfidence < 80);
  if (duplicateAlias) {
    items.push({
      id: `queue-dup-${snapshot.account.id}`,
      type: "duplicate",
      severity: "info",
      statusLabel: "Potential Duplicate",
      title: `${snapshot.account.canonicalName} / ${duplicateAlias.value}`,
      subtitle: `Matched on alias with ${duplicateAlias.matchConfidence}% similarity.`,
      detail: "Merge suggested after steward review of the canonical identity.",
      ageLabel: "1h ago",
      accountId: snapshot.account.id,
      scoreLabel: undefined,
      relatedSignals,
      workspaceNote: "A fuzzy alias match may indicate an adjacent record that should be merged or preserved.",
      callToAction: "Inspect account"
    });
  }

  return items;
}

export async function getReviewQueueView(): Promise<ReviewQueueView> {
  const snapshots = await getAllSnapshots();
  const items = snapshots.flatMap(buildReviewQueueItem);
  const conflicts = items.filter((item) => item.type === "conflict").length;
  const duplicates = items.filter((item) => item.type === "duplicate").length;
  const pending = items.length;
  const queueIntegrity = Math.max(34, 100 - pending * 6);

  return {
    metrics: [
      { label: "Pending Tasks", value: pending, tone: "warning" },
      { label: "Conflicts", value: conflicts, tone: "danger" },
      { label: "Duplicates", value: duplicates, tone: "info" }
    ],
    items,
    selectedItemId: items[0]?.id ?? "",
    queueIntegrity
  };
}

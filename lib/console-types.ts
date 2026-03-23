import {
  AccountDetailResponse,
  AccountResolutionStatus,
  ConfidenceBand,
  DashboardSnapshot,
  Product,
  Recommendation,
  RecommendationClassification,
  RecommendationReview,
  RecommendationStatus
} from "@/lib/domain";

export interface BoardMetric {
  label: string;
  value: number;
  tone: "neutral" | "info" | "warning" | "danger" | "success";
}

export interface AccountBoardRecord {
  id: string;
  canonicalName: string;
  primaryDomain: string;
  industry?: string;
  region?: string;
  status: AccountResolutionStatus;
  confidenceStatus: ConfidenceBand;
  profileConfidence: number;
  freshnessState: "fresh" | "aging" | "stale";
  recommendationCount: number;
  unresolvedCount: number;
  selectedPrimaryRecommendation?: {
    id: string;
    productName: string;
    classification: RecommendationClassification;
    status: RecommendationStatus;
  };
  analyst: string;
  nextAction: string;
  lastRefreshedAt?: string;
}

export interface AccountsBoardView {
  metrics: BoardMetric[];
  accounts: AccountBoardRecord[];
  availableIndustries: string[];
}

export interface WorkbenchView {
  snapshot: DashboardSnapshot;
  analyst: string;
  provenanceSummary: {
    totalSignals: number;
    verifiedSignals: number;
    conflictingSignals: number;
    freshestSignal?: string;
  };
  relatedSignals: string[];
}

export interface RecommendationDetailView {
  snapshot: DashboardSnapshot;
  recommendation: Recommendation;
  product: Product;
  evidence: AccountDetailResponse["signals"];
  reviews: RecommendationReview[];
  selectedPrimaryRecommendation?: Recommendation;
  analyst: string;
}

export interface ReviewQueueItem {
  id: string;
  type: "conflict" | "recommendation" | "duplicate" | "profile_review";
  severity: "danger" | "warning" | "info";
  statusLabel: string;
  title: string;
  subtitle: string;
  detail: string;
  ageLabel: string;
  accountId: string;
  recommendationId?: string;
  scoreLabel?: string;
  relatedSignals: string[];
  workspaceNote: string;
  callToAction: string;
}

export interface ReviewQueueView {
  metrics: BoardMetric[];
  items: ReviewQueueItem[];
  selectedItemId: string;
  queueIntegrity: number;
}

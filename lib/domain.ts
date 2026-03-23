export type AccountId = string;
export type ProductId = string;
export type SourceRecordId = string;
export type EvidenceRecordId = string;
export type RecommendationId = string;

export type AccountResolutionStatus = "existing" | "new" | "review_required";
export type RecommendationStatus =
  | "approved"
  | "validate_in_discovery"
  | "review_required";
export type RecommendationClassification =
  | "anchor"
  | "adjacent"
  | "ecosystem_enabler";
export type ConfidenceBand = "high" | "medium" | "low";
export type SourceClass =
  | "public_website"
  | "public_newsroom"
  | "careers"
  | "registry"
  | "other_public";
export type SourceQuality = "high" | "medium" | "low";
export type RefreshStatus = "pending" | "running" | "completed" | "failed" | "stale";
export type ReviewDecision = "accepted" | "rejected" | "needs_follow_up";
export type MatchMethod = "deterministic" | "fuzzy" | "candidate_created";

export interface Account {
  id: AccountId;
  canonicalName: string;
  primaryDomain: string;
  aliases: string[];
  region?: string;
  industry?: string;
  sizeBand?: string;
  status: AccountResolutionStatus;
  confidenceStatus: ConfidenceBand;
  lastRefreshedAt?: string;
}

export interface AliasIdentifier {
  type: "domain" | "crm_reference" | "alias";
  value: string;
  source: string;
  matchConfidence: number;
  active: boolean;
}

export interface SourceRecord {
  id: SourceRecordId;
  accountId: AccountId;
  sourceClass: SourceClass;
  sourceUrl: string;
  fetchedAt: string;
  quality: SourceQuality;
  extractionStatus: "pending" | "success" | "failed";
}

export interface EvidenceRecord {
  id: EvidenceRecordId;
  accountId: AccountId;
  sourceRecordId: SourceRecordId;
  fieldName: string;
  fieldValue: string;
  confidence: number;
  conflictFlag: boolean;
  extractedAt: string;
}

export interface NormalizedProfile {
  accountId: AccountId;
  industry?: string;        // saas | fintech | healthcare | manufacturing | logistics | professional services | retail | education | construction | energy | real estate | conglomerate | government | media | telecommunications | hospitality | automotive | other
  subIndustry?: string;
  businessFunctions: string[];
  geography?: string;       // HQ / primary region
  operatingRegions: string[]; // additional regions (Global Operations)
  maturity?: string;
  complexity?: string;
  growthSignals: string[];
  profileConfidence: number;
  conflictSummary: string[];
}

export interface Product {
  id: ProductId;
  name: string;
  family: string;
  classification: RecommendationClassification;
  primaryFunctions: string[];
  industries: string[];
  buyerPersonas: string[];
  complexity: string;
  deprecatedAt?: string;
}

export interface ProductRule {
  id: string;
  productId: ProductId;
  version: string;
  effectiveFrom: string;
  owner: string;
  weightings: {
    industry: number;
    businessFunction: number;
    scale: number;
    complexity: number;
    triggerSignal: number;
    ecosystem: number;
    evidenceConfidence: number;
  };
  conditions: {
    industries: string[];
    functions: string[];
    sizeBands: string[];
    complexities: string[];
    triggers: string[];
    dependencyFamilies: string[];
  };
  dependencies: string[];
}

export interface Recommendation {
  id: RecommendationId;
  accountId: AccountId;
  productId: ProductId;
  classification: RecommendationClassification;
  fitScore: number;
  confidenceScore: number;
  rationale: string;
  evidenceRefs: EvidenceRecordId[];
  nextBestAction: string;
  status: RecommendationStatus;
  confidenceBand: ConfidenceBand;
  freshnessState: "fresh" | "aging" | "stale";
  conflictState: "none" | "minor" | "major";
  createdAt: string;
}

export interface RecommendationReview {
  recommendationId: RecommendationId;
  reviewer: string;
  decision: ReviewDecision;
  notes?: string;
  reviewedAt: string;
}

export interface RefreshJob {
  id: string;
  accountId: AccountId;
  jobType: "scheduled" | "manual" | "source_update";
  status: RefreshStatus;
  sourceScope: SourceClass[];
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface IntakeRequest {
  organizationName?: string;
  domain?: string;
  crmReference?: string;
}

export interface IntakeResponse {
  account: Account;
  resolutionStatus: AccountResolutionStatus;
  matchMethod: MatchMethod;
}

export interface AccountDetailResponse {
  account: Account;
  profile: NormalizedProfile;
  signals: EvidenceRecord[];
  recommendations: Recommendation[];
  refreshJobs: RefreshJob[];
}

export interface ReviewRequest {
  decision: ReviewDecision;
  notes?: string;
}

export interface RefreshRequest {
  sourceScope?: SourceClass[];
  reason?: "manual" | "scheduled" | "source_delta";
}

export interface RefreshResponse {
  job: RefreshJob;
}

export type AccountWorkflowAction =
  | "approve_profile"
  | "send_to_review"
  | "validate_in_discovery";

export interface ProfileInferenceMeta {
  mode: "seeded" | "heuristic" | "manual_override";
  summary: string;
  matchedRules: string[];
  limitations: string[];
  lastEditedAt?: string;
}

export interface ProfileUpdateRequest {
  industry?: string;
  businessFunctions?: string[];
  growthSignals?: string[];
}

export interface DashboardSnapshot extends AccountDetailResponse {
  products: Product[];
  rules: ProductRule[];
  reviews: RecommendationReview[];
  aliases: AliasIdentifier[];
  inferenceMeta: ProfileInferenceMeta;
  selectedPrimaryRecommendationId?: RecommendationId;
}

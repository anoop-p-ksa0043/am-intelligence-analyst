import {
  Account,
  AliasIdentifier,
  EvidenceRecord,
  NormalizedProfile,
  Product,
  ProductRule,
  Recommendation,
  RecommendationReview,
  RefreshJob,
  SourceRecord
} from "@/lib/domain";

const now = "2026-03-22T11:15:00.000Z";

export const products: Product[] = [
  {
    id: "prod-workflows",
    name: "Workflow Orchestrator",
    family: "Operations",
    classification: "anchor",
    primaryFunctions: ["operations", "service delivery", "revops"],
    industries: ["saas", "fintech", "healthcare"],
    buyerPersonas: ["operations lead", "cs ops"],
    complexity: "medium"
  },
  {
    id: "prod-analytics",
    name: "Signal Analytics Cloud",
    family: "Analytics",
    classification: "adjacent",
    primaryFunctions: ["analytics", "leadership", "strategy"],
    industries: ["saas", "professional services", "fintech"],
    buyerPersonas: ["strategy lead", "vp customer success"],
    complexity: "medium"
  },
  {
    id: "prod-ecosystem",
    name: "Partner Enablement Hub",
    family: "Ecosystem",
    classification: "ecosystem_enabler",
    primaryFunctions: ["partnerships", "ecosystem"],
    industries: ["saas", "manufacturing"],
    buyerPersonas: ["partnership manager"],
    complexity: "high"
  },
  {
    id: "prod-legacy",
    name: "Legacy Insights Classic",
    family: "Analytics",
    classification: "adjacent",
    primaryFunctions: ["analytics"],
    industries: ["saas"],
    buyerPersonas: ["analyst"],
    complexity: "low",
    deprecatedAt: "2026-01-15T00:00:00.000Z"
  }
];

export const productRules: ProductRule[] = [
  {
    id: "rule-workflows-v1",
    productId: "prod-workflows",
    version: "1.0.0",
    effectiveFrom: "2026-03-01T00:00:00.000Z",
    owner: "Product Operations",
    weightings: {
      industry: 20,
      businessFunction: 25,
      scale: 10,
      complexity: 10,
      triggerSignal: 10,
      ecosystem: 15,
      evidenceConfidence: 10
    },
    conditions: {
      industries: ["saas", "fintech", "healthcare"],
      functions: ["operations", "service delivery", "revops"],
      sizeBands: ["mid-market", "enterprise"],
      complexities: ["medium", "high"],
      triggers: ["expansion hiring", "multi-region growth", "new executive hire"],
      dependencyFamilies: []
    },
    dependencies: []
  },
  {
    id: "rule-analytics-v1",
    productId: "prod-analytics",
    version: "1.0.0",
    effectiveFrom: "2026-03-01T00:00:00.000Z",
    owner: "Product Operations",
    weightings: {
      industry: 20,
      businessFunction: 25,
      scale: 10,
      complexity: 10,
      triggerSignal: 10,
      ecosystem: 15,
      evidenceConfidence: 10
    },
    conditions: {
      industries: ["saas", "professional services", "fintech"],
      functions: ["analytics", "leadership", "strategy"],
      sizeBands: ["mid-market", "enterprise"],
      complexities: ["low", "medium", "high"],
      triggers: ["new regional expansion", "board-level efficiency push"],
      dependencyFamilies: ["Operations"]
    },
    dependencies: ["prod-workflows"]
  },
  {
    id: "rule-ecosystem-v1",
    productId: "prod-ecosystem",
    version: "1.0.0",
    effectiveFrom: "2026-03-01T00:00:00.000Z",
    owner: "Product Operations",
    weightings: {
      industry: 20,
      businessFunction: 25,
      scale: 10,
      complexity: 10,
      triggerSignal: 10,
      ecosystem: 15,
      evidenceConfidence: 10
    },
    conditions: {
      industries: ["saas", "manufacturing"],
      functions: ["partnerships", "ecosystem"],
      sizeBands: ["enterprise"],
      complexities: ["high"],
      triggers: ["channel launch", "regional alliance hiring"],
      dependencyFamilies: ["Operations", "Analytics"]
    },
    dependencies: ["prod-workflows", "prod-analytics"]
  }
];

export const accounts: Account[] = [
  {
    id: "acc-northstar",
    canonicalName: "Northstar Health Cloud",
    primaryDomain: "northstarhealth.com",
    aliases: ["Northstar Health", "Northstar HC"],
    region: "North America",
    industry: "healthcare",
    sizeBand: "enterprise",
    status: "existing",
    confidenceStatus: "high",
    lastRefreshedAt: now
  },
  {
    id: "acc-lattice",
    canonicalName: "Lattice Forge",
    primaryDomain: "latticeforge.io",
    aliases: ["Lattice Forge Labs"],
    region: "EMEA",
    industry: "saas",
    sizeBand: "mid-market",
    status: "review_required",
    confidenceStatus: "medium",
    lastRefreshedAt: "2026-03-14T09:10:00.000Z"
  },
  {
    id: "acc-sunline",
    canonicalName: "Sunline Freight Systems",
    primaryDomain: "sunlinefreight.com",
    aliases: ["Sunline Freight"],
    region: "Middle East",
    industry: "logistics",
    sizeBand: "enterprise",
    status: "new",
    confidenceStatus: "low",
    lastRefreshedAt: "2026-02-28T08:00:00.000Z"
  }
];

export const aliases: Record<string, AliasIdentifier[]> = {
  "acc-northstar": [
    { type: "domain", value: "northstarhealth.com", source: "official_site", matchConfidence: 100, active: true },
    { type: "alias", value: "Northstar Health", source: "data_steward", matchConfidence: 96, active: true }
  ],
  "acc-lattice": [
    { type: "domain", value: "latticeforge.io", source: "official_site", matchConfidence: 100, active: true },
    { type: "alias", value: "Lattice Forge Labs", source: "public_newsroom", matchConfidence: 71, active: true }
  ],
  "acc-sunline": [
    { type: "domain", value: "sunlinefreight.com", source: "registry", matchConfidence: 88, active: true }
  ]
};

export const sourceRecords: SourceRecord[] = [
  {
    id: "src-1",
    accountId: "acc-northstar",
    sourceClass: "public_website",
    sourceUrl: "https://northstarhealth.com",
    fetchedAt: now,
    quality: "high",
    extractionStatus: "success"
  },
  {
    id: "src-2",
    accountId: "acc-northstar",
    sourceClass: "careers",
    sourceUrl: "https://northstarhealth.com/careers",
    fetchedAt: now,
    quality: "medium",
    extractionStatus: "success"
  },
  {
    id: "src-3",
    accountId: "acc-lattice",
    sourceClass: "public_newsroom",
    sourceUrl: "https://latticeforge.io/news",
    fetchedAt: "2026-03-14T09:10:00.000Z",
    quality: "medium",
    extractionStatus: "success"
  },
  {
    id: "src-4",
    accountId: "acc-sunline",
    sourceClass: "registry",
    sourceUrl: "https://registry.example/sunlinefreight",
    fetchedAt: "2026-02-28T08:00:00.000Z",
    quality: "low",
    extractionStatus: "success"
  }
];

export const evidenceRecords: EvidenceRecord[] = [
  {
    id: "ev-1",
    accountId: "acc-northstar",
    sourceRecordId: "src-1",
    fieldName: "industry",
    fieldValue: "healthcare",
    confidence: 96,
    conflictFlag: false,
    extractedAt: now
  },
  {
    id: "ev-2",
    accountId: "acc-northstar",
    sourceRecordId: "src-2",
    fieldName: "growth_signal",
    fieldValue: "expansion hiring",
    confidence: 82,
    conflictFlag: false,
    extractedAt: now
  },
  {
    id: "ev-3",
    accountId: "acc-northstar",
    sourceRecordId: "src-1",
    fieldName: "business_function",
    fieldValue: "operations",
    confidence: 90,
    conflictFlag: false,
    extractedAt: now
  },
  {
    id: "ev-4",
    accountId: "acc-lattice",
    sourceRecordId: "src-3",
    fieldName: "business_function",
    fieldValue: "analytics",
    confidence: 72,
    conflictFlag: false,
    extractedAt: "2026-03-14T09:10:00.000Z"
  },
  {
    id: "ev-5",
    accountId: "acc-lattice",
    sourceRecordId: "src-3",
    fieldName: "industry",
    fieldValue: "saas",
    confidence: 78,
    conflictFlag: false,
    extractedAt: "2026-03-14T09:10:00.000Z"
  },
  {
    id: "ev-6",
    accountId: "acc-lattice",
    sourceRecordId: "src-3",
    fieldName: "complexity",
    fieldValue: "low",
    confidence: 44,
    conflictFlag: true,
    extractedAt: "2026-03-14T09:10:00.000Z"
  },
  {
    id: "ev-7",
    accountId: "acc-sunline",
    sourceRecordId: "src-4",
    fieldName: "industry",
    fieldValue: "logistics",
    confidence: 45,
    conflictFlag: false,
    extractedAt: "2026-02-28T08:00:00.000Z"
  },
  {
    id: "ev-8",
    accountId: "acc-sunline",
    sourceRecordId: "src-4",
    fieldName: "growth_signal",
    fieldValue: "new regional expansion",
    confidence: 34,
    conflictFlag: true,
    extractedAt: "2026-02-28T08:00:00.000Z"
  }
];

export const normalizedProfiles: NormalizedProfile[] = [
  {
    accountId: "acc-northstar",
    industry: "healthcare",
    subIndustry: "healthtech platform",
    businessFunctions: ["operations", "service delivery", "strategy"],
    geography: "North America",
    operatingRegions: [],
    maturity: "digitally mature",
    complexity: "high",
    growthSignals: ["expansion hiring", "new executive hire"],
    profileConfidence: 91,
    conflictSummary: []
  },
  {
    accountId: "acc-lattice",
    industry: "saas",
    subIndustry: "workflow tooling",
    businessFunctions: ["analytics", "strategy"],
    geography: "EMEA",
    operatingRegions: [],
    maturity: "emerging",
    complexity: "medium",
    growthSignals: ["board-level efficiency push"],
    profileConfidence: 63,
    conflictSummary: ["Complexity evidence conflicts across sources."]
  },
  {
    accountId: "acc-sunline",
    industry: "logistics",
    subIndustry: "freight operations",
    businessFunctions: ["operations"],
    geography: "MEA",
    operatingRegions: [],
    maturity: "early",
    complexity: "medium",
    growthSignals: ["new regional expansion"],
    profileConfidence: 38,
    conflictSummary: ["Growth signals rely on low-quality registry evidence."]
  }
];

export const seededRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    accountId: "acc-northstar",
    productId: "prod-workflows",
    classification: "anchor",
    fitScore: 88,
    confidenceScore: 89,
    rationale:
      "Operations-heavy account with strong healthcare alignment, multi-region complexity, and fresh expansion signals.",
    evidenceRefs: ["ev-1", "ev-2", "ev-3"],
    nextBestAction: "Validate operating-complexity pain points and introduce the orchestration anchor play.",
    status: "approved",
    confidenceBand: "high",
    freshnessState: "fresh",
    conflictState: "none",
    createdAt: now
  },
  {
    id: "rec-2",
    accountId: "acc-northstar",
    productId: "prod-analytics",
    classification: "adjacent",
    fitScore: 76,
    confidenceScore: 82,
    rationale:
      "Leadership and strategy signals suggest reporting and visibility needs adjacent to the operational motion.",
    evidenceRefs: ["ev-2", "ev-3"],
    nextBestAction: "Position analytics as the second-step expansion after operational alignment is confirmed.",
    status: "approved",
    confidenceBand: "high",
    freshnessState: "fresh",
    conflictState: "none",
    createdAt: now
  },
  {
    id: "rec-3",
    accountId: "acc-lattice",
    productId: "prod-analytics",
    classification: "adjacent",
    fitScore: 70,
    confidenceScore: 59,
    rationale:
      "Analytics function presence is clear, but complexity signals conflict and the evidence base is aging.",
    evidenceRefs: ["ev-4", "ev-5", "ev-6"],
    nextBestAction: "Validate complexity and ownership in discovery before proposing an adjacent analytics motion.",
    status: "validate_in_discovery",
    confidenceBand: "medium",
    freshnessState: "aging",
    conflictState: "minor",
    createdAt: "2026-03-14T09:10:00.000Z"
  },
  {
    id: "rec-4",
    accountId: "acc-sunline",
    productId: "prod-workflows",
    classification: "anchor",
    fitScore: 52,
    confidenceScore: 34,
    rationale:
      "Operational alignment exists conceptually, but phase-1 evidence is weak and partially stale.",
    evidenceRefs: ["ev-7", "ev-8"],
    nextBestAction: "Route for analyst review before any account planning recommendation is shared.",
    status: "review_required",
    confidenceBand: "low",
    freshnessState: "stale",
    conflictState: "major",
    createdAt: "2026-02-28T08:00:00.000Z"
  }
];

export const recommendationReviews: RecommendationReview[] = [
  {
    recommendationId: "rec-3",
    reviewer: "Amina Shah",
    decision: "needs_follow_up",
    notes: "Need confirmation on deployment complexity and current stack maturity.",
    reviewedAt: "2026-03-16T10:00:00.000Z"
  }
];

export const refreshJobs: RefreshJob[] = [
  {
    id: "job-1",
    accountId: "acc-northstar",
    jobType: "scheduled",
    status: "completed",
    sourceScope: ["public_website", "careers"],
    startedAt: "2026-03-22T10:45:00.000Z",
    completedAt: now
  },
  {
    id: "job-2",
    accountId: "acc-sunline",
    jobType: "manual",
    status: "stale",
    sourceScope: ["registry"],
    startedAt: "2026-03-18T12:00:00.000Z",
    completedAt: "2026-03-18T12:04:00.000Z"
  }
];

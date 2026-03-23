import {
  Account,
  AccountDetailResponse,
  AccountWorkflowAction,
  AliasIdentifier,
  DashboardSnapshot,
  EvidenceRecord,
  IntakeRequest,
  IntakeResponse,
  NormalizedProfile,
  ProfileInferenceMeta,
  ProfileUpdateRequest,
  Product,
  ProductRule,
  Recommendation,
  RecommendationReview,
  RefreshJob,
  SourceRecord,
  RefreshRequest,
  RefreshResponse,
  ReviewRequest,
  SourceClass
} from "@/lib/domain";
import { db } from "@/lib/db";
import { average, clamp, slugify, toConfidenceBand } from "@/lib/utils";
import { enrichAccountFromWeb } from "@/lib/ai-enrichment";

// ─── Date helpers ─────────────────────────────────────────────────────────────

function dt(d: Date | null | undefined): string | undefined {
  return d ? d.toISOString() : undefined;
}

function dtR(d: Date | null | undefined): string {
  return d ? d.toISOString() : new Date().toISOString();
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapAccount(a: any): Account {
  return {
    id: a.id,
    canonicalName: a.canonicalName,
    primaryDomain: a.primaryDomain,
    aliases: a.aliases ?? [],
    region: a.region ?? undefined,
    industry: a.industry ?? undefined,
    sizeBand: a.sizeBand ?? undefined,
    status: a.status as Account["status"],
    confidenceStatus: a.confidenceStatus as Account["confidenceStatus"],
    lastRefreshedAt: dt(a.lastRefreshedAt)
  };
}

function mapProfile(p: any): NormalizedProfile {
  return {
    accountId: p.accountId,
    industry: p.industry ?? undefined,
    subIndustry: p.subIndustry ?? undefined,
    businessFunctions: p.businessFunctions ?? [],
    geography: p.geography ?? undefined,
    operatingRegions: p.operatingRegions ?? [],
    maturity: p.maturity ?? undefined,
    complexity: p.complexity ?? undefined,
    growthSignals: p.growthSignals ?? [],
    profileConfidence: p.profileConfidence ?? 0,
    conflictSummary: p.conflictSummary ?? []
  };
}

function mapInferenceMeta(p: any): ProfileInferenceMeta {
  return {
    mode: (p.inferenceMode ?? "heuristic") as ProfileInferenceMeta["mode"],
    summary: p.inferenceSummary ?? "Profile generated from fallback heuristic rules.",
    matchedRules: p.matchedRules ?? ["Fallback default rule"],
    limitations: p.limitations ?? ["No live public-source extraction has been applied yet."],
    lastEditedAt: dt(p.lastEditedAt)
  };
}

function mapEvidence(e: any): EvidenceRecord {
  return {
    id: e.id,
    accountId: e.accountId,
    sourceRecordId: e.sourceRecordId,
    fieldName: e.fieldName,
    fieldValue: e.fieldValue,
    confidence: e.confidence,
    conflictFlag: e.conflictFlag,
    extractedAt: dtR(e.extractedAt)
  };
}

function mapRecommendation(r: any): Recommendation {
  return {
    id: r.id,
    accountId: r.accountId,
    productId: r.productId,
    classification: r.classification as Recommendation["classification"],
    fitScore: r.fitScore,
    confidenceScore: r.confidenceScore,
    rationale: r.rationale,
    evidenceRefs: r.evidenceRefs ?? [],
    nextBestAction: r.nextBestAction,
    status: r.status as Recommendation["status"],
    confidenceBand: r.confidenceBand as Recommendation["confidenceBand"],
    freshnessState: r.freshnessState as Recommendation["freshnessState"],
    conflictState: r.conflictState as Recommendation["conflictState"],
    createdAt: dtR(r.createdAt)
  };
}

function mapRefreshJob(j: any): RefreshJob {
  return {
    id: j.id,
    accountId: j.accountId,
    jobType: j.jobType as RefreshJob["jobType"],
    status: j.status as RefreshJob["status"],
    sourceScope: (j.sourceScope ?? []) as SourceClass[],
    startedAt: dt(j.startedAt),
    completedAt: dt(j.completedAt),
    errorMessage: j.errorMessage ?? undefined
  };
}

function mapReview(r: any): RecommendationReview {
  return {
    recommendationId: r.recommendationId,
    reviewer: r.reviewer,
    decision: r.decision as RecommendationReview["decision"],
    notes: r.notes ?? undefined,
    reviewedAt: dtR(r.reviewedAt)
  };
}

function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    family: p.family,
    classification: p.classification as Product["classification"],
    primaryFunctions: p.primaryFunctions ?? [],
    industries: p.industries ?? [],
    buyerPersonas: p.buyerPersonas ?? [],
    complexity: p.complexity,
    deprecatedAt: dt(p.deprecatedAt)
  };
}

function mapProductRule(r: any): ProductRule {
  const w = r.weightings as {
    industry: number;
    businessFunction: number;
    scale: number;
    complexity: number;
    triggerSignal: number;
    ecosystem: number;
    evidenceConfidence: number;
  };
  const c = r.conditions as {
    industries: string[];
    functions: string[];
    sizeBands: string[];
    complexities: string[];
    triggers: string[];
    dependencyFamilies: string[];
  };
  return {
    id: r.id,
    productId: r.productId,
    version: r.version,
    effectiveFrom: dtR(r.effectiveFrom),
    owner: r.owner,
    weightings: w,
    conditions: c,
    dependencies: r.dependencies ?? []
  };
}

function mapAlias(a: any): AliasIdentifier {
  return {
    type: a.type as AliasIdentifier["type"],
    value: a.value,
    source: a.source,
    matchConfidence: a.matchConfidence,
    active: a.active
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function daysSince(iso?: string) {
  if (!iso) {
    return 999;
  }
  const now = new Date("2026-03-22T11:15:00.000Z").getTime();
  const then = new Date(iso).getTime();
  return (now - then) / (1000 * 60 * 60 * 24);
}

function getAccountAgeState(lastRefreshedAt?: string) {
  return daysSince(lastRefreshedAt) > 20
    ? "stale"
    : daysSince(lastRefreshedAt) > 7
      ? "aging"
      : "fresh";
}

function scoreProduct(
  profile: NormalizedProfile,
  account: Account,
  product: Product,
  rule: ProductRule
) {
  const industryScore = rule.conditions.industries.includes(profile.industry ?? "") ? 100 : 40;
  const functionMatches = profile.businessFunctions.filter((value) =>
    rule.conditions.functions.includes(value)
  ).length;
  const functionScore =
    functionMatches === 0
      ? 35
      : clamp((functionMatches / rule.conditions.functions.length) * 100);
  const scaleScore = rule.conditions.sizeBands.includes("enterprise") ? 80 : 65;
  const complexityScore = rule.conditions.complexities.includes(profile.complexity ?? "") ? 85 : 45;
  const triggerMatches = profile.growthSignals.filter((value) =>
    rule.conditions.triggers.includes(value)
  ).length;
  const triggerScore = triggerMatches ? clamp(50 + triggerMatches * 20) : 35;
  const ecosystemScore = rule.dependencies.length === 0 ? 80 : 58;
  const evidenceScore = profile.profileConfidence;

  const fitScore = clamp(
    (industryScore * rule.weightings.industry +
      functionScore * rule.weightings.businessFunction +
      scaleScore * rule.weightings.scale +
      complexityScore * rule.weightings.complexity +
      triggerScore * rule.weightings.triggerSignal +
      ecosystemScore * rule.weightings.ecosystem) /
      90
  );

  const confidenceScore = clamp(
    average([
      evidenceScore,
      100 - profile.conflictSummary.length * 18,
      daysSince(account.lastRefreshedAt) > 20
        ? 38
        : daysSince(account.lastRefreshedAt) > 7
          ? 64
          : 90
    ])
  );

  return { fitScore, confidenceScore };
}

// ─── Public async service functions ──────────────────────────────────────────

export async function getDashboardSnapshot(accountId: string): Promise<DashboardSnapshot | undefined> {
  const [row, products, productRules] = await Promise.all([
    db.account.findUnique({
      where: { id: accountId },
      include: {
        normalizedProfile: true,
        evidenceRecords: { orderBy: { extractedAt: "desc" } },
        recommendations: {
          orderBy: { fitScore: "desc" },
          include: { reviews: true }
        },
        refreshJobs: { orderBy: { startedAt: "desc" } },
        aliasIdentifiers: true
      }
    }),
    db.product.findMany({ where: { deprecatedAt: null } }),
    db.productRule.findMany()
  ]);

  if (!row || !row.normalizedProfile) {
    return undefined;
  }

  const account = mapAccount(row);
  const profile = mapProfile(row.normalizedProfile);
  const inferenceMeta = mapInferenceMeta(row.normalizedProfile);
  const signals = row.evidenceRecords.map(mapEvidence);
  const recommendations = row.recommendations.map(mapRecommendation);
  const refreshJobs = row.refreshJobs.map(mapRefreshJob);
  const aliases = row.aliasIdentifiers.map(mapAlias);
  const allReviews: RecommendationReview[] = row.recommendations.flatMap((rec: any) =>
    rec.reviews.map(mapReview)
  );

  const selectedPrimaryRecommendation = recommendations
    .filter((r) => r.status === "approved" && r.classification === "anchor")
    .sort((a, b) => b.fitScore - a.fitScore)[0];

  return {
    account,
    profile,
    signals,
    recommendations,
    refreshJobs,
    products: products.map(mapProduct),
    rules: productRules.map(mapProductRule),
    reviews: allReviews,
    aliases,
    inferenceMeta,
    selectedPrimaryRecommendationId: selectedPrimaryRecommendation?.id
  };
}

export async function listWorkbenchAccounts() {
  const [accounts, products] = await Promise.all([
    db.account.findMany({
      include: {
        normalizedProfile: { select: { profileConfidence: true } },
        recommendations: {
          select: { id: true, status: true, classification: true, productId: true, fitScore: true }
        }
      }
    }),
    db.product.findMany({ where: { deprecatedAt: null } })
  ]);

  const productMap = new Map(products.map((p) => [p.id, p.name]));

  return accounts.map((account: any) => {
    const recs = account.recommendations ?? [];
    const unresolvedRecs = recs.filter((r: any) => r.status !== "approved");
    const firstUnresolved = unresolvedRecs[0];
    const topApproved = recs
      .filter((r: any) => r.status === "approved" && r.classification === "anchor")
      .sort((a: any, b: any) => b.fitScore - a.fitScore)[0];

    return {
      id: account.id,
      canonicalName: account.canonicalName,
      primaryDomain: account.primaryDomain,
      industry: account.industry ?? undefined,
      region: account.region ?? undefined,
      status: account.status as Account["status"],
      confidenceStatus: account.confidenceStatus as Account["confidenceStatus"],
      profileConfidence: account.normalizedProfile?.profileConfidence ?? 0,
      freshnessState: getAccountAgeState(dt(account.lastRefreshedAt)),
      recommendationCount: recs.length,
      unresolvedCount: unresolvedRecs.length,
      selectedPrimaryRecommendation: topApproved
        ? {
            id: topApproved.id,
            productName: productMap.get(topApproved.productId) ?? "Unknown Product",
            classification: topApproved.classification as Recommendation["classification"],
            status: topApproved.status as Recommendation["status"]
          }
        : undefined,
      analyst: "—",
      nextAction: firstUnresolved
        ? "Open workbench to resolve pending recommendations."
        : "Open workbench to analyze the account.",
      lastRefreshedAt: dt(account.lastRefreshedAt)
    };
  });
}

export async function getSignalsForAccount(accountId: string): Promise<EvidenceRecord[]> {
  const records = await db.evidenceRecord.findMany({
    where: { accountId },
    orderBy: { extractedAt: "desc" }
  });
  return records.map(mapEvidence);
}

export async function getRecommendationsForAccount(accountId: string): Promise<Recommendation[]> {
  const recs = await db.recommendation.findMany({
    where: { accountId },
    orderBy: { fitScore: "desc" }
  });
  return recs.map(mapRecommendation);
}

export async function intakeAccount(input: IntakeRequest): Promise<IntakeResponse> {
  const domain = input.domain?.trim().toLowerCase();

  if (domain) {
    const exact = await db.account.findFirst({ where: { primaryDomain: domain } });
    if (exact) {
      return {
        account: mapAccount(exact),
        resolutionStatus: exact.status as Account["status"],
        matchMethod: "deterministic"
      };
    }
  }

  const normalizedName = input.organizationName?.trim().toLowerCase();
  if (normalizedName) {
    const allAccounts = await db.account.findMany();
    const fuzzy = allAccounts.find((account: any) => {
      const candidates = [account.canonicalName, ...(account.aliases ?? [])].map((v: string) =>
        v.toLowerCase()
      );
      return candidates.some(
        (candidate: string) =>
          candidate.includes(normalizedName) || normalizedName.includes(candidate)
      );
    });
    if (fuzzy) {
      return {
        account: mapAccount({ ...fuzzy, status: "review_required" }),
        resolutionStatus: "review_required",
        matchMethod: "fuzzy"
      };
    }
  }

  const name =
    input.organizationName?.trim() || input.domain?.trim() || "New Account Candidate";
  const candidate: Account = {
    id: `acc-${slugify(name) || "candidate"}`,
    canonicalName: name,
    primaryDomain: input.domain?.trim() || "pending-verification.example",
    aliases: [],
    status: "new",
    confidenceStatus: "low",
    lastRefreshedAt: undefined
  };

  return {
    account: candidate,
    resolutionStatus: "new",
    matchMethod: "candidate_created"
  };
}

export async function scoreRecommendations(accountId: string): Promise<Recommendation[]> {
  const [profileRow, accountRow, products, productRules] = await Promise.all([
    db.normalizedProfile.findUnique({ where: { accountId } }),
    db.account.findUnique({ where: { id: accountId } }),
    db.product.findMany({ where: { deprecatedAt: null } }),
    db.productRule.findMany()
  ]);

  if (!profileRow || !accountRow) {
    return [];
  }

  const profile = mapProfile(profileRow);
  const account = mapAccount(accountRow);
  const signals = await db.evidenceRecord.findMany({
    where: { accountId },
    orderBy: { extractedAt: "desc" }
  });
  const evidenceIds = signals.slice(0, 3).map((e: any) => e.id);

  return products
    .map((product: any) => {
      const rule = productRules.find((r: any) => r.productId === product.id);
      if (!rule) return undefined;

      const mappedRule = mapProductRule(rule);
      const scores = scoreProduct(profile, account, mapProduct(product), mappedRule);
      const confidenceBand = toConfidenceBand(scores.confidenceScore);
      const freshnessState =
        daysSince(account.lastRefreshedAt) > 20
          ? "stale"
          : daysSince(account.lastRefreshedAt) > 7
            ? "aging"
            : "fresh";

      const matchedFns = profile.businessFunctions.filter((f) =>
        mappedRule.conditions.functions.includes(f)
      );
      const fnStr = matchedFns.length
        ? matchedFns.join(", ")
        : profile.businessFunctions.slice(0, 2).join(", ") || "general operations";
      const industryMatch = mappedRule.conditions.industries.includes(profile.industry ?? "");
      const rationale = `${product.name} maps directly to your ${fnStr} functions${
        industryMatch ? ` with strong ${profile.industry} industry alignment` : ""
      } — ${profile.profileConfidence}% profile confidence.`;

      return {
        id: `rec-${accountId}-${product.id}`,
        accountId,
        productId: product.id,
        classification: product.classification as Recommendation["classification"],
        fitScore: scores.fitScore,
        confidenceScore: scores.confidenceScore,
        rationale,
        evidenceRefs: evidenceIds,
        nextBestAction:
          confidenceBand === "high"
            ? "Promote the play in the next AM/CS account review."
            : confidenceBand === "medium"
              ? "Validate the account posture in discovery before advancing."
              : "Route to analyst review before the recommendation is used.",
        status:
          confidenceBand === "high"
            ? "approved"
            : confidenceBand === "medium"
              ? "validate_in_discovery"
              : "review_required",
        confidenceBand,
        freshnessState: freshnessState as Recommendation["freshnessState"],
        conflictState: (
          profile.conflictSummary.length > 1
            ? "major"
            : profile.conflictSummary.length === 1
              ? "minor"
              : "none"
        ) as Recommendation["conflictState"],
        createdAt: "2026-03-22T11:15:00.000Z"
      } satisfies Recommendation;
    })
    .filter((value): value is Recommendation => Boolean(value))
    .sort((a, b) => b.fitScore - a.fitScore);
}

export async function reviewRecommendation(id: string, input: ReviewRequest) {
  const existing = await db.recommendation.findUnique({ where: { id } });
  if (!existing) {
    return undefined;
  }

  const newStatus: Recommendation["status"] =
    input.decision === "accepted"
      ? "approved"
      : input.decision === "needs_follow_up"
        ? "validate_in_discovery"
        : "review_required";

  const [review, recommendation] = await Promise.all([
    db.recommendationReview.create({
      data: {
        recommendationId: id,
        reviewer: "Current User",
        decision: input.decision as any,
        notes: input.notes
      }
    }),
    db.recommendation.update({
      where: { id },
      data: { status: newStatus as any }
    })
  ]);

  return {
    recommendation: mapRecommendation(recommendation),
    review: mapReview(review)
  };
}

export async function refreshAccount(
  accountId: string,
  input: RefreshRequest = {}
): Promise<RefreshResponse | undefined> {
  const [accountRow, profileRow] = await Promise.all([
    db.account.findUnique({ where: { id: accountId } }),
    db.normalizedProfile.findUnique({ where: { accountId } })
  ]);

  if (!accountRow || !profileRow) {
    return undefined;
  }

  const scope: SourceClass[] = input.sourceScope ?? [
    "public_website",
    "public_newsroom",
    "careers",
    "registry"
  ];

  const now = new Date();

  const job = await db.refreshJob.create({
    data: {
      accountId,
      jobType: (input.reason === "source_delta" ? "source_update" : "manual") as any,
      status: "completed" as any,
      sourceScope: scope as any[],
      startedAt: new Date(now.getTime() - 5 * 60 * 1000),
      completedAt: now
    }
  });

  await db.account.update({
    where: { id: accountId },
    data: { lastRefreshedAt: now }
  });

  const rescored = await scoreRecommendations(accountId);
  for (const rec of rescored) {
    await db.recommendation.upsert({
      where: { id: rec.id },
      update: {
        fitScore: rec.fitScore,
        confidenceScore: rec.confidenceScore,
        rationale: rec.rationale,
        nextBestAction: rec.nextBestAction,
        status: rec.status as any,
        confidenceBand: rec.confidenceBand as any,
        freshnessState: rec.freshnessState as any,
        conflictState: rec.conflictState as any,
        evidenceRefs: rec.evidenceRefs,
        classification: rec.classification as any
      },
      create: {
        id: rec.id,
        accountId: rec.accountId,
        productId: rec.productId,
        classification: rec.classification as any,
        fitScore: rec.fitScore,
        confidenceScore: rec.confidenceScore,
        rationale: rec.rationale,
        evidenceRefs: rec.evidenceRefs,
        nextBestAction: rec.nextBestAction,
        status: rec.status as any,
        confidenceBand: rec.confidenceBand as any,
        freshnessState: rec.freshnessState as any,
        conflictState: rec.conflictState as any
      }
    });
  }

  return { job: mapRefreshJob(job) };
}

export async function getFoundationOverview() {
  const [accountCount, activeProductCount, nonApprovedCount] = await Promise.all([
    db.account.count(),
    db.product.count({ where: { deprecatedAt: null } }),
    db.recommendation.count({ where: { status: { not: "approved" as any } } })
  ]);

  const sourceClasses = await db.sourceRecord.findMany({ select: { sourceClass: true } });
  const approvedPublicSources = new Set(sourceClasses.map((s: any) => s.sourceClass)).size;

  return {
    accounts: accountCount,
    activeProducts: activeProductCount,
    reviewQueue: nonApprovedCount,
    approvedPublicSources
  };
}

export async function applyAccountWorkflowAction(
  accountId: string,
  action: AccountWorkflowAction
): Promise<DashboardSnapshot | undefined> {
  const [accountRow, profileRow] = await Promise.all([
    db.account.findUnique({ where: { id: accountId } }),
    db.normalizedProfile.findUnique({ where: { accountId } })
  ]);

  if (!accountRow || !profileRow) {
    return undefined;
  }

  const profile = mapProfile(profileRow);

  if (action === "approve_profile") {
    await db.account.update({
      where: { id: accountId },
      data: {
        status: "existing" as any,
        confidenceStatus: toConfidenceBand(Math.max(profile.profileConfidence, 80)) as any
      }
    });
  }

  if (action === "send_to_review") {
    await db.account.update({
      where: { id: accountId },
      data: { status: "review_required" as any }
    });
  }

  if (action === "validate_in_discovery") {
    await db.account.update({
      where: { id: accountId },
      data: { status: "review_required" as any }
    });
    await db.recommendation.updateMany({
      where: { accountId, status: { not: "approved" as any } },
      data: { status: "validate_in_discovery" as any }
    });
  }

  return getDashboardSnapshot(accountId);
}

function inferCandidateBlueprint(account: Account) {
  const fingerprint = `${account.canonicalName} ${account.primaryDomain}`.toLowerCase();

  if (fingerprint.includes("health")) {
    return {
      industry: "healthcare",
      subIndustry: "digital care operations",
      businessFunctions: ["operations", "service delivery", "strategy"],
      geography: "North America",
      maturity: "growing",
      complexity: "high",
      growthSignals: ["expansion hiring", "new executive hire"],
      profileConfidence: 74,
      inferenceMeta: {
        mode: "heuristic" as const,
        summary: "Assigned the healthcare blueprint because the company name/domain contains 'health'.",
        matchedRules: [
          "Keyword match: health -> industry healthcare",
          "Healthcare blueprint -> operations, service delivery, strategy",
          "Healthcare blueprint -> expansion hiring, new executive hire"
        ],
        limitations: [
          "This is a string-match heuristic, not live website analysis.",
          "Industry and business functions may be wrong if the brand name is ambiguous."
        ]
      }
    };
  }

  if (fingerprint.includes("freight") || fingerprint.includes("logistics")) {
    return {
      industry: "logistics",
      subIndustry: "fleet operations",
      businessFunctions: ["operations", "service delivery"],
      geography: "Middle East",
      maturity: "emerging",
      complexity: "medium",
      growthSignals: ["new regional expansion"],
      profileConfidence: 61,
      inferenceMeta: {
        mode: "heuristic" as const,
        summary: "Assigned the logistics blueprint because the company name/domain contains 'freight' or 'logistics'.",
        matchedRules: [
          "Keyword match: freight/logistics -> industry logistics",
          "Logistics blueprint -> operations, service delivery",
          "Logistics blueprint -> new regional expansion"
        ],
        limitations: [
          "This is a string-match heuristic, not live public-source extraction.",
          "Complex logistics groups may require manual correction."
        ]
      }
    };
  }

  if (fingerprint.includes("orbit") || fingerprint.includes("space")) {
    return {
      industry: "saas",
      subIndustry: "field orchestration platform",
      businessFunctions: ["operations", "analytics", "strategy"],
      geography: "Global",
      maturity: "growing",
      complexity: "medium",
      growthSignals: ["multi-region growth", "board-level efficiency push"],
      profileConfidence: 69,
      inferenceMeta: {
        mode: "heuristic" as const,
        summary: "Assigned the field-orchestration SaaS blueprint because the name/domain contains 'orbit' or 'space'.",
        matchedRules: [
          "Keyword match: orbit/space -> industry SaaS",
          "Orbit blueprint -> operations, analytics, strategy",
          "Orbit blueprint -> multi-region growth, board-level efficiency push"
        ],
        limitations: [
          "The rule assumes a software company from brand wording alone.",
          "This can be incorrect for holding companies, retailers, or non-software brands."
        ]
      }
    };
  }

  return {
    industry: "saas",
    subIndustry: "workflow platform",
    businessFunctions: ["operations", "strategy"],
    geography: "Global",
    maturity: "emerging",
    complexity: "medium",
    growthSignals: ["expansion hiring"],
    profileConfidence: 64,
    inferenceMeta: {
      mode: "heuristic" as const,
      summary: "Assigned the default workflow-platform blueprint because no more specific keyword rule matched.",
      matchedRules: [
        "Fallback default -> industry SaaS",
        "Fallback default -> operations, strategy",
        "Fallback default -> expansion hiring"
      ],
      limitations: [
        "Default heuristic is deliberately generic and often wrong for real companies.",
        "Manual correction or live public-source extraction is needed for trustable profiling."
      ]
    }
  };
}

export async function analyzeCandidateAccount(
  candidate: Account
): Promise<DashboardSnapshot | undefined> {
  const existingRow = await db.account.findUnique({ where: { id: candidate.id } });
  const baseAccount = existingRow ? mapAccount(existingRow) : candidate;
  const blueprint = await enrichAccountFromWeb(baseAccount.canonicalName, baseAccount.primaryDomain);
  const refreshedAt = new Date();

  const acc = await db.account.upsert({
    where: { id: candidate.id },
    update: {
      region: blueprint.geography,
      industry: blueprint.industry,
      sizeBand: baseAccount.sizeBand ?? "mid-market",
      status: "review_required" as any,
      confidenceStatus: toConfidenceBand(blueprint.profileConfidence) as any,
      lastRefreshedAt: refreshedAt
    },
    create: {
      id: candidate.id,
      canonicalName: baseAccount.canonicalName,
      primaryDomain: baseAccount.primaryDomain,
      aliases: baseAccount.aliases,
      region: blueprint.geography,
      industry: blueprint.industry,
      sizeBand: baseAccount.sizeBand ?? "mid-market",
      status: "review_required" as any,
      confidenceStatus: toConfidenceBand(blueprint.profileConfidence) as any,
      lastRefreshedAt: refreshedAt
    }
  });

  // Recreate aliases
  await db.aliasIdentifier.deleteMany({ where: { accountId: acc.id } });
  await db.aliasIdentifier.create({
    data: {
      accountId: acc.id,
      type: "domain" as any,
      value: acc.primaryDomain,
      source: "intake",
      matchConfidence: 100,
      active: true
    }
  });

  // Create source records
  const srcSiteId = `src-${acc.id}-site`;
  const srcCareersId = `src-${acc.id}-careers`;
  await db.sourceRecord.deleteMany({ where: { accountId: acc.id } });
  await db.sourceRecord.create({
    data: {
      id: srcSiteId,
      accountId: acc.id,
      sourceClass: "public_website" as any,
      sourceUrl: `https://${acc.primaryDomain}`,
      fetchedAt: refreshedAt,
      quality: "high" as any,
      extractionStatus: "success" as any
    }
  });
  await db.sourceRecord.create({
    data: {
      id: srcCareersId,
      accountId: acc.id,
      sourceClass: "careers" as any,
      sourceUrl: `https://${acc.primaryDomain}/careers`,
      fetchedAt: refreshedAt,
      quality: "medium" as any,
      extractionStatus: "success" as any
    }
  });

  // Recreate evidence
  await db.evidenceRecord.deleteMany({ where: { accountId: acc.id } });
  await db.evidenceRecord.create({
    data: {
      id: `ev-${acc.id}-industry`,
      accountId: acc.id,
      sourceRecordId: srcSiteId,
      fieldName: "industry",
      fieldValue: blueprint.industry,
      confidence: blueprint.profileConfidence,
      conflictFlag: false,
      extractedAt: refreshedAt
    }
  });
  await db.evidenceRecord.create({
    data: {
      id: `ev-${acc.id}-function`,
      accountId: acc.id,
      sourceRecordId: srcSiteId,
      fieldName: "business_function",
      fieldValue: blueprint.businessFunctions[0],
      confidence: blueprint.profileConfidence - 4,
      conflictFlag: false,
      extractedAt: refreshedAt
    }
  });
  await db.evidenceRecord.create({
    data: {
      id: `ev-${acc.id}-signal`,
      accountId: acc.id,
      sourceRecordId: srcCareersId,
      fieldName: "growth_signal",
      fieldValue: blueprint.growthSignals[0],
      confidence: blueprint.profileConfidence - 6,
      conflictFlag: false,
      extractedAt: refreshedAt
    }
  });

  // Upsert normalized profile
  const conflictSummary = blueprint.profileConfidence < 65
    ? ["Candidate generated from lightweight public-source evidence. Validate in discovery."]
    : [];
  await db.normalizedProfile.upsert({
    where: { accountId: acc.id },
    update: {
      industry: blueprint.industry,
      subIndustry: blueprint.subIndustry,
      businessFunctions: blueprint.businessFunctions,
      geography: blueprint.geography,
      operatingRegions: blueprint.operatingRegions,
      maturity: blueprint.maturity,
      complexity: blueprint.complexity,
      growthSignals: blueprint.growthSignals,
      profileConfidence: blueprint.profileConfidence,
      conflictSummary,
      inferenceMode: blueprint.inferenceMeta.mode as any,
      inferenceSummary: blueprint.inferenceMeta.summary,
      matchedRules: blueprint.inferenceMeta.matchedRules,
      limitations: blueprint.inferenceMeta.limitations
    },
    create: {
      accountId: acc.id,
      industry: blueprint.industry,
      subIndustry: blueprint.subIndustry,
      businessFunctions: blueprint.businessFunctions,
      geography: blueprint.geography,
      operatingRegions: blueprint.operatingRegions,
      maturity: blueprint.maturity,
      complexity: blueprint.complexity,
      growthSignals: blueprint.growthSignals,
      profileConfidence: blueprint.profileConfidence,
      conflictSummary,
      inferenceMode: blueprint.inferenceMeta.mode as any,
      inferenceSummary: blueprint.inferenceMeta.summary,
      matchedRules: blueprint.inferenceMeta.matchedRules,
      limitations: blueprint.inferenceMeta.limitations
    }
  });

  // Create refresh job
  await db.refreshJob.create({
    data: {
      id: `job-${acc.id}-analysis`,
      accountId: acc.id,
      jobType: "manual" as any,
      status: "completed" as any,
      sourceScope: ["public_website", "careers"] as any[],
      startedAt: new Date(refreshedAt.getTime() - 2 * 60 * 1000),
      completedAt: refreshedAt
    }
  });

  // Delete and recreate recommendations
  await db.recommendation.deleteMany({ where: { accountId: acc.id } });
  const generatedRecommendations = await scoreRecommendations(acc.id);
  for (const rec of generatedRecommendations) {
    await db.recommendation.create({
      data: {
        id: rec.id,
        accountId: rec.accountId,
        productId: rec.productId,
        classification: rec.classification as any,
        fitScore: rec.fitScore,
        confidenceScore: rec.confidenceScore,
        rationale: rec.rationale,
        evidenceRefs: rec.evidenceRefs,
        nextBestAction: rec.nextBestAction,
        status: rec.status as any,
        confidenceBand: rec.confidenceBand as any,
        freshnessState: rec.freshnessState as any,
        conflictState: rec.conflictState as any
      }
    });
  }

  return getDashboardSnapshot(acc.id);
}

export async function updateAccountProfile(
  accountId: string,
  input: ProfileUpdateRequest
): Promise<DashboardSnapshot | undefined> {
  const [accountRow, profileRow] = await Promise.all([
    db.account.findUnique({ where: { id: accountId } }),
    db.normalizedProfile.findUnique({ where: { accountId } })
  ]);

  if (!accountRow || !profileRow) {
    return undefined;
  }

  const profile = mapProfile(profileRow);

  const newIndustry = input.industry?.trim()
    ? input.industry.trim().toLowerCase()
    : profile.industry;
  const newFunctions =
    input.businessFunctions && input.businessFunctions.length > 0
      ? input.businessFunctions.map((v) => v.trim().toLowerCase()).filter(Boolean)
      : profile.businessFunctions;
  const newSignals =
    input.growthSignals && input.growthSignals.length > 0
      ? input.growthSignals.map((v) => v.trim().toLowerCase()).filter(Boolean)
      : profile.growthSignals;

  const newConfidence = clamp(profile.profileConfidence + 8);
  const newStatus = toConfidenceBand(newConfidence);

  const matchedRules = [
    input.industry ? `Manual industry override -> ${input.industry.trim()}` : "Industry preserved",
    input.businessFunctions?.length
      ? `Manual business functions override -> ${input.businessFunctions.join(", ")}`
      : "Business functions preserved",
    input.growthSignals?.length
      ? `Manual growth signals override -> ${input.growthSignals.join(", ")}`
      : "Growth signals preserved"
  ];

  await db.normalizedProfile.update({
    where: { accountId },
    data: {
      industry: newIndustry,
      businessFunctions: newFunctions,
      growthSignals: newSignals,
      profileConfidence: newConfidence,
      conflictSummary: [
        "Profile includes manual corrections. Validate against approved public sources before downstream automation."
      ],
      inferenceMode: "manual_override" as any,
      inferenceSummary: "Profile fields were manually corrected in the workbench.",
      matchedRules,
      limitations: [
        "Manual corrections improve usefulness but are not a substitute for provenance-rich public-source ingestion."
      ],
      lastEditedAt: new Date()
    }
  });

  await db.account.update({
    where: { id: accountId },
    data: {
      industry: newIndustry,
      confidenceStatus: newStatus as any
    }
  });

  const rescored = await scoreRecommendations(accountId);
  for (const rec of rescored) {
    await db.recommendation.upsert({
      where: { id: rec.id },
      update: {
        fitScore: rec.fitScore,
        confidenceScore: rec.confidenceScore,
        rationale: rec.rationale,
        nextBestAction: rec.nextBestAction,
        status: rec.status as any,
        confidenceBand: rec.confidenceBand as any,
        freshnessState: rec.freshnessState as any,
        conflictState: rec.conflictState as any,
        evidenceRefs: rec.evidenceRefs,
        classification: rec.classification as any
      },
      create: {
        id: rec.id,
        accountId: rec.accountId,
        productId: rec.productId,
        classification: rec.classification as any,
        fitScore: rec.fitScore,
        confidenceScore: rec.confidenceScore,
        rationale: rec.rationale,
        evidenceRefs: rec.evidenceRefs,
        nextBestAction: rec.nextBestAction,
        status: rec.status as any,
        confidenceBand: rec.confidenceBand as any,
        freshnessState: rec.freshnessState as any,
        conflictState: rec.conflictState as any
      }
    });
  }

  return getDashboardSnapshot(accountId);
}

// Keep SourceRecord type used in domain but referenced in mock imports (unused now)
export type { SourceRecord };

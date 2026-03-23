/**
 * Prisma seed script.
 * Run: npx prisma db seed
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { ZOHO_PRODUCTS, ZOHO_RULES } from "../lib/zoho-products";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database…");

  // ── Zoho Products ────────────────────────────────────────────────────────────
  console.log("  → Upserting Zoho product catalog…");
  for (const p of ZOHO_PRODUCTS) {
    await db.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        family: p.family,
        classification: p.classification,
        primaryFunctions: p.primaryFunctions,
        industries: p.industries,
        buyerPersonas: p.buyerPersonas,
        complexity: p.complexity
      },
      create: {
        id: p.id,
        name: p.name,
        family: p.family,
        classification: p.classification,
        primaryFunctions: p.primaryFunctions,
        industries: p.industries,
        buyerPersonas: p.buyerPersonas,
        complexity: p.complexity
      }
    });
  }

  // ── Zoho Product Rules ───────────────────────────────────────────────────────
  console.log("  → Upserting Zoho product rules…");
  for (const r of ZOHO_RULES) {
    await db.productRule.upsert({
      where: { id: r.id },
      update: {
        weightings: r.weightings,
        conditions: r.conditions,
        dependencies: r.dependencies
      },
      create: {
        id: r.id,
        productId: r.productId,
        version: "1.0.0",
        effectiveFrom: new Date("2026-03-01T00:00:00.000Z"),
        owner: "Product Operations",
        weightings: r.weightings,
        conditions: r.conditions,
        dependencies: r.dependencies
      }
    });
  }

  // ── Accounts ─────────────────────────────────────────────────────────────────
  await db.account.upsert({
    where: { id: "acc-northstar" },
    update: {},
    create: {
      id: "acc-northstar",
      canonicalName: "Northstar Health Cloud",
      primaryDomain: "northstarhealth.com",
      aliases: ["Northstar Health", "Northstar HC"],
      region: "North America",
      industry: "healthcare",
      sizeBand: "enterprise",
      status: "existing",
      confidenceStatus: "high",
      lastRefreshedAt: new Date("2026-03-22T11:15:00.000Z")
    }
  });

  await db.account.upsert({
    where: { id: "acc-lattice" },
    update: {},
    create: {
      id: "acc-lattice",
      canonicalName: "Lattice Forge",
      primaryDomain: "latticeforge.io",
      aliases: ["Lattice Forge Labs"],
      region: "EMEA",
      industry: "saas",
      sizeBand: "mid-market",
      status: "review_required",
      confidenceStatus: "medium",
      lastRefreshedAt: new Date("2026-03-14T09:10:00.000Z")
    }
  });

  await db.account.upsert({
    where: { id: "acc-sunline" },
    update: {},
    create: {
      id: "acc-sunline",
      canonicalName: "Sunline Freight Systems",
      primaryDomain: "sunlinefreight.com",
      aliases: ["Sunline Freight"],
      region: "Middle East",
      industry: "logistics",
      sizeBand: "enterprise",
      status: "new",
      confidenceStatus: "low",
      lastRefreshedAt: new Date("2026-02-28T08:00:00.000Z")
    }
  });

  // ── Alias identifiers ────────────────────────────────────────────────────────
  const aliasData = [
    { accountId: "acc-northstar", type: "domain" as const,  value: "northstarhealth.com",     source: "official_site",    matchConfidence: 100, active: true },
    { accountId: "acc-northstar", type: "alias" as const,   value: "Northstar Health",         source: "data_steward",     matchConfidence: 96,  active: true },
    { accountId: "acc-lattice",   type: "domain" as const,  value: "latticeforge.io",          source: "official_site",    matchConfidence: 100, active: true },
    { accountId: "acc-lattice",   type: "alias" as const,   value: "Lattice Forge Labs",       source: "public_newsroom",  matchConfidence: 71,  active: true },
    { accountId: "acc-sunline",   type: "domain" as const,  value: "sunlinefreight.com",       source: "registry",         matchConfidence: 88,  active: true }
  ];

  for (const alias of aliasData) {
    await db.aliasIdentifier.upsert({
      where: { id: `alias-${alias.accountId}-${alias.value}` },
      update: {},
      create: { id: `alias-${alias.accountId}-${alias.value}`, ...alias }
    });
  }

  // ── Source records ───────────────────────────────────────────────────────────
  const sources = [
    { id: "src-1", accountId: "acc-northstar", sourceClass: "public_website" as const, sourceUrl: "https://northstarhealth.com",         fetchedAt: new Date("2026-03-22T11:15:00.000Z"), quality: "high" as const,   extractionStatus: "success" as const },
    { id: "src-2", accountId: "acc-northstar", sourceClass: "careers" as const,        sourceUrl: "https://northstarhealth.com/careers",  fetchedAt: new Date("2026-03-22T11:15:00.000Z"), quality: "medium" as const, extractionStatus: "success" as const },
    { id: "src-3", accountId: "acc-lattice",   sourceClass: "public_newsroom" as const, sourceUrl: "https://latticeforge.io/news",         fetchedAt: new Date("2026-03-14T09:10:00.000Z"), quality: "medium" as const, extractionStatus: "success" as const },
    { id: "src-4", accountId: "acc-sunline",   sourceClass: "registry" as const,       sourceUrl: "https://registry.example/sunlinefreight", fetchedAt: new Date("2026-02-28T08:00:00.000Z"), quality: "low" as const, extractionStatus: "success" as const }
  ];

  for (const src of sources) {
    await db.sourceRecord.upsert({ where: { id: src.id }, update: {}, create: src });
  }

  // ── Evidence records ─────────────────────────────────────────────────────────
  const evidence = [
    { id: "ev-1", accountId: "acc-northstar", sourceRecordId: "src-1", fieldName: "industry",          fieldValue: "healthcare",              confidence: 96, conflictFlag: false, extractedAt: new Date("2026-03-22T11:15:00.000Z") },
    { id: "ev-2", accountId: "acc-northstar", sourceRecordId: "src-2", fieldName: "growth_signal",     fieldValue: "expansion hiring",        confidence: 82, conflictFlag: false, extractedAt: new Date("2026-03-22T11:15:00.000Z") },
    { id: "ev-3", accountId: "acc-northstar", sourceRecordId: "src-1", fieldName: "business_function", fieldValue: "operations",              confidence: 90, conflictFlag: false, extractedAt: new Date("2026-03-22T11:15:00.000Z") },
    { id: "ev-4", accountId: "acc-lattice",   sourceRecordId: "src-3", fieldName: "business_function", fieldValue: "analytics",               confidence: 72, conflictFlag: false, extractedAt: new Date("2026-03-14T09:10:00.000Z") },
    { id: "ev-5", accountId: "acc-lattice",   sourceRecordId: "src-3", fieldName: "industry",          fieldValue: "saas",                    confidence: 78, conflictFlag: false, extractedAt: new Date("2026-03-14T09:10:00.000Z") },
    { id: "ev-6", accountId: "acc-lattice",   sourceRecordId: "src-3", fieldName: "complexity",        fieldValue: "low",                     confidence: 44, conflictFlag: true,  extractedAt: new Date("2026-03-14T09:10:00.000Z") },
    { id: "ev-7", accountId: "acc-sunline",   sourceRecordId: "src-4", fieldName: "industry",          fieldValue: "logistics",               confidence: 45, conflictFlag: false, extractedAt: new Date("2026-02-28T08:00:00.000Z") },
    { id: "ev-8", accountId: "acc-sunline",   sourceRecordId: "src-4", fieldName: "growth_signal",     fieldValue: "new regional expansion",  confidence: 34, conflictFlag: true,  extractedAt: new Date("2026-02-28T08:00:00.000Z") }
  ];

  for (const ev of evidence) {
    await db.evidenceRecord.upsert({ where: { id: ev.id }, update: {}, create: ev });
  }

  // ── Normalized profiles ──────────────────────────────────────────────────────
  await db.normalizedProfile.upsert({
    where: { accountId: "acc-northstar" },
    update: {},
    create: {
      accountId: "acc-northstar", industry: "healthcare", subIndustry: "healthtech platform",
      businessFunctions: ["operations", "service delivery", "strategy"], geography: "North America",
      maturity: "digitally mature", complexity: "high", growthSignals: ["expansion hiring", "new executive hire"],
      profileConfidence: 91, conflictSummary: [], inferenceMode: "seeded",
      inferenceSummary: "Seeded profile — high-confidence from deterministic source match.",
      matchedRules: ["Healthcare operations profile", "Expansion hiring signal detected", "Enterprise size band confirmed"],
      limitations: []
    }
  });

  await db.normalizedProfile.upsert({
    where: { accountId: "acc-lattice" },
    update: {},
    create: {
      accountId: "acc-lattice", industry: "saas", subIndustry: "workflow tooling",
      businessFunctions: ["analytics", "strategy"], geography: "EMEA",
      maturity: "emerging", complexity: "medium", growthSignals: ["board-level efficiency push"],
      profileConfidence: 63, conflictSummary: ["Complexity evidence conflicts across sources."],
      inferenceMode: "heuristic",
      inferenceSummary: "Heuristic profile — inferred from keyword patterns in newsroom content. Verify complexity and ownership.",
      matchedRules: ["SaaS keyword detected", "Analytics function inferred from job postings"],
      limitations: ["Complexity evidence is conflicting and should be validated in discovery", "Growth signals rely on a single newsroom source"]
    }
  });

  await db.normalizedProfile.upsert({
    where: { accountId: "acc-sunline" },
    update: {},
    create: {
      accountId: "acc-sunline", industry: "logistics", subIndustry: "freight operations",
      businessFunctions: ["operations"], geography: "Middle East",
      maturity: "early", complexity: "medium", growthSignals: ["new regional expansion"],
      profileConfidence: 38, conflictSummary: ["Growth signals rely on low-quality registry evidence."],
      inferenceMode: "heuristic",
      inferenceSummary: "Heuristic profile — inferred from registry data only. Low confidence. Manual correction recommended.",
      matchedRules: ["Logistics keyword detected from registry"],
      limitations: ["Only registry-class evidence available — low quality", "No behavioral or newsroom signals available for this account", "Regional expansion signal conflicts with stale evidence"]
    }
  });

  // ── Recommendations ──────────────────────────────────────────────────────────
  const recs = [
    {
      id: "rec-1", accountId: "acc-northstar", productId: "prod-workflows",
      classification: "anchor" as const, fitScore: 88, confidenceScore: 89,
      rationale: "Operations-heavy account with strong healthcare alignment, multi-region complexity, and fresh expansion signals.",
      evidenceRefs: ["ev-1", "ev-2", "ev-3"], nextBestAction: "Validate operating-complexity pain points and introduce the orchestration anchor play.",
      status: "approved" as const, confidenceBand: "high" as const, freshnessState: "fresh" as const, conflictState: "none" as const,
      createdAt: new Date("2026-03-22T11:15:00.000Z")
    },
    {
      id: "rec-2", accountId: "acc-northstar", productId: "prod-analytics",
      classification: "adjacent" as const, fitScore: 76, confidenceScore: 82,
      rationale: "Leadership and strategy signals suggest reporting and visibility needs adjacent to the operational motion.",
      evidenceRefs: ["ev-2", "ev-3"], nextBestAction: "Position analytics as the second-step expansion after operational alignment is confirmed.",
      status: "approved" as const, confidenceBand: "high" as const, freshnessState: "fresh" as const, conflictState: "none" as const,
      createdAt: new Date("2026-03-22T11:15:00.000Z")
    },
    {
      id: "rec-3", accountId: "acc-lattice", productId: "prod-analytics",
      classification: "adjacent" as const, fitScore: 70, confidenceScore: 59,
      rationale: "Analytics function presence is clear, but complexity signals conflict and the evidence base is aging.",
      evidenceRefs: ["ev-4", "ev-5", "ev-6"], nextBestAction: "Validate complexity and ownership in discovery before proposing an adjacent analytics motion.",
      status: "validate_in_discovery" as const, confidenceBand: "medium" as const, freshnessState: "aging" as const, conflictState: "minor" as const,
      createdAt: new Date("2026-03-14T09:10:00.000Z")
    },
    {
      id: "rec-4", accountId: "acc-sunline", productId: "prod-workflows",
      classification: "anchor" as const, fitScore: 52, confidenceScore: 34,
      rationale: "Operational alignment exists conceptually, but phase-1 evidence is weak and partially stale.",
      evidenceRefs: ["ev-7", "ev-8"], nextBestAction: "Route for analyst review before any account planning recommendation is shared.",
      status: "review_required" as const, confidenceBand: "low" as const, freshnessState: "stale" as const, conflictState: "major" as const,
      createdAt: new Date("2026-02-28T08:00:00.000Z")
    }
  ];

  for (const rec of recs) {
    await db.recommendation.upsert({ where: { id: rec.id }, update: {}, create: rec });
  }

  // ── Recommendation reviews ───────────────────────────────────────────────────
  await db.recommendationReview.upsert({
    where: { id: "review-rec-3-1" },
    update: {},
    create: {
      id: "review-rec-3-1",
      recommendationId: "rec-3",
      reviewer: "Amina Shah",
      decision: "needs_follow_up",
      notes: "Need confirmation on deployment complexity and current stack maturity.",
      reviewedAt: new Date("2026-03-16T10:00:00.000Z")
    }
  });

  // ── Refresh jobs ─────────────────────────────────────────────────────────────
  await db.refreshJob.upsert({
    where: { id: "job-1" },
    update: {},
    create: {
      id: "job-1", accountId: "acc-northstar", jobType: "scheduled", status: "completed",
      sourceScope: ["public_website", "careers"],
      startedAt: new Date("2026-03-22T10:45:00.000Z"),
      completedAt: new Date("2026-03-22T11:15:00.000Z")
    }
  });

  await db.refreshJob.upsert({
    where: { id: "job-2" },
    update: {},
    create: {
      id: "job-2", accountId: "acc-sunline", jobType: "manual", status: "stale",
      sourceScope: ["registry"],
      startedAt: new Date("2026-03-18T12:00:00.000Z"),
      completedAt: new Date("2026-03-18T12:04:00.000Z")
    }
  });

  // ── DUMMY TEST DATA ─────────────────────────────────────────────────────────

  // acc-zenith — Zenith Capital Partners
  await db.account.upsert({
    where: { id: "acc-zenith" },
    update: {},
    create: {
      id: "acc-zenith",
      canonicalName: "Zenith Capital Partners",
      primaryDomain: "zenithcap.io",
      aliases: [],
      region: "APAC",
      industry: "fintech",
      sizeBand: "enterprise",
      status: "existing",
      confidenceStatus: "high",
      lastRefreshedAt: new Date("2026-03-20T10:00:00.000Z")
    }
  });

  await db.aliasIdentifier.upsert({
    where: { id: "alias-acc-zenith-zenithcap.io" },
    update: {},
    create: {
      id: "alias-acc-zenith-zenithcap.io",
      accountId: "acc-zenith",
      type: "domain",
      value: "zenithcap.io",
      source: "official_site",
      matchConfidence: 100,
      active: true
    }
  });

  await db.sourceRecord.upsert({
    where: { id: "src-zenith-1" },
    update: {},
    create: {
      id: "src-zenith-1",
      accountId: "acc-zenith",
      sourceClass: "public_website",
      sourceUrl: "https://zenithcap.io",
      fetchedAt: new Date("2026-03-20T10:00:00.000Z"),
      quality: "high",
      extractionStatus: "success"
    }
  });

  const zenithEvidence = [
    { id: "ev-zenith-1", accountId: "acc-zenith", sourceRecordId: "src-zenith-1", fieldName: "industry",          fieldValue: "fintech",            confidence: 90, conflictFlag: false, extractedAt: new Date("2026-03-20T10:00:00.000Z") },
    { id: "ev-zenith-2", accountId: "acc-zenith", sourceRecordId: "src-zenith-1", fieldName: "business_function", fieldValue: "strategy",           confidence: 85, conflictFlag: false, extractedAt: new Date("2026-03-20T10:00:00.000Z") },
    { id: "ev-zenith-3", accountId: "acc-zenith", sourceRecordId: "src-zenith-1", fieldName: "growth_signal",     fieldValue: "expansion hiring",   confidence: 80, conflictFlag: false, extractedAt: new Date("2026-03-20T10:00:00.000Z") }
  ];
  for (const ev of zenithEvidence) {
    await db.evidenceRecord.upsert({ where: { id: ev.id }, update: {}, create: ev });
  }

  await db.normalizedProfile.upsert({
    where: { accountId: "acc-zenith" },
    update: {},
    create: {
      accountId: "acc-zenith",
      industry: "fintech",
      businessFunctions: ["strategy", "analytics", "operations"],
      geography: "APAC",
      maturity: "digitally mature",
      complexity: "high",
      growthSignals: ["expansion hiring", "board-level efficiency push"],
      profileConfidence: 88,
      conflictSummary: [],
      inferenceMode: "seeded",
      inferenceSummary: "Fintech capital partner with strong analytics signals.",
      matchedRules: [],
      limitations: []
    }
  });

  await db.recommendation.upsert({
    where: { id: "rec-zenith-workflows" },
    update: {},
    create: {
      id: "rec-zenith-workflows",
      accountId: "acc-zenith",
      productId: "prod-workflows",
      classification: "anchor",
      fitScore: 82,
      confidenceScore: 86,
      rationale: "Strategy-driven fintech with complex operations and strong expansion signals.",
      evidenceRefs: ["ev-zenith-1", "ev-zenith-2", "ev-zenith-3"],
      nextBestAction: "Introduce the orchestration anchor play in the next account review.",
      status: "approved",
      confidenceBand: "high",
      freshnessState: "fresh",
      conflictState: "none",
      createdAt: new Date("2026-03-20T10:00:00.000Z")
    }
  });

  await db.recommendationReview.upsert({
    where: { id: "review-zenith-1" },
    update: {},
    create: {
      id: "review-zenith-1",
      recommendationId: "rec-zenith-workflows",
      reviewer: "Jordan Diaz",
      decision: "accepted",
      notes: "Strong fit confirmed in discovery call.",
      reviewedAt: new Date("2026-03-21T09:00:00.000Z")
    }
  });

  await db.refreshJob.upsert({
    where: { id: "job-zenith-1" },
    update: {},
    create: {
      id: "job-zenith-1",
      accountId: "acc-zenith",
      jobType: "scheduled",
      status: "completed",
      sourceScope: ["public_website"],
      startedAt: new Date("2026-03-20T09:30:00.000Z"),
      completedAt: new Date("2026-03-20T10:00:00.000Z")
    }
  });

  // acc-meridian — Meridian Data Services
  await db.account.upsert({
    where: { id: "acc-meridian" },
    update: {},
    create: {
      id: "acc-meridian",
      canonicalName: "Meridian Data Services",
      primaryDomain: "meridian-data.io",
      aliases: ["Meridian DS"],
      region: "EMEA",
      industry: "saas",
      sizeBand: "mid-market",
      status: "review_required",
      confidenceStatus: "medium",
      lastRefreshedAt: new Date("2026-03-10T09:00:00.000Z")
    }
  });

  const meridianAliases = [
    { id: "alias-acc-meridian-meridian-data.io", accountId: "acc-meridian", type: "domain" as const,  value: "meridian-data.io", source: "official_site",   matchConfidence: 100, active: true },
    { id: "alias-acc-meridian-Meridian DS",       accountId: "acc-meridian", type: "alias" as const,   value: "Meridian DS",      source: "public_newsroom", matchConfidence: 72,  active: true }
  ];
  for (const a of meridianAliases) {
    await db.aliasIdentifier.upsert({ where: { id: a.id }, update: {}, create: a });
  }

  await db.sourceRecord.upsert({
    where: { id: "src-meridian-1" },
    update: {},
    create: {
      id: "src-meridian-1",
      accountId: "acc-meridian",
      sourceClass: "public_newsroom",
      sourceUrl: "https://meridian-data.io/blog",
      fetchedAt: new Date("2026-03-10T09:00:00.000Z"),
      quality: "medium",
      extractionStatus: "success"
    }
  });

  const meridianEvidence = [
    { id: "ev-meridian-1", accountId: "acc-meridian", sourceRecordId: "src-meridian-1", fieldName: "industry",          fieldValue: "saas",                  confidence: 78, conflictFlag: false, extractedAt: new Date("2026-03-10T09:00:00.000Z") },
    { id: "ev-meridian-2", accountId: "acc-meridian", sourceRecordId: "src-meridian-1", fieldName: "business_function", fieldValue: "analytics",             confidence: 71, conflictFlag: false, extractedAt: new Date("2026-03-10T09:00:00.000Z") },
    { id: "ev-meridian-3", accountId: "acc-meridian", sourceRecordId: "src-meridian-1", fieldName: "complexity",        fieldValue: "low",                   confidence: 44, conflictFlag: true,  extractedAt: new Date("2026-03-10T09:00:00.000Z") }
  ];
  for (const ev of meridianEvidence) {
    await db.evidenceRecord.upsert({ where: { id: ev.id }, update: {}, create: ev });
  }

  await db.normalizedProfile.upsert({
    where: { accountId: "acc-meridian" },
    update: {},
    create: {
      accountId: "acc-meridian",
      industry: "saas",
      businessFunctions: ["analytics", "strategy"],
      geography: "EMEA",
      maturity: "growing",
      complexity: "medium",
      growthSignals: ["new regional expansion"],
      profileConfidence: 65,
      conflictSummary: ["Maturity signals conflict between newsroom and careers evidence."],
      inferenceMode: "heuristic",
      inferenceSummary: "Mid-market SaaS with analytics focus. Maturity evidence is conflicting.",
      matchedRules: [],
      limitations: []
    }
  });

  await db.recommendation.upsert({
    where: { id: "rec-meridian-analytics" },
    update: {},
    create: {
      id: "rec-meridian-analytics",
      accountId: "acc-meridian",
      productId: "prod-analytics",
      classification: "adjacent",
      fitScore: 68,
      confidenceScore: 57,
      rationale: "Analytics function present but maturity conflicts need resolution before advancing.",
      evidenceRefs: ["ev-meridian-1", "ev-meridian-2", "ev-meridian-3"],
      nextBestAction: "Validate account complexity and maturity in discovery before proposing analytics motion.",
      status: "validate_in_discovery",
      confidenceBand: "medium",
      freshnessState: "aging",
      conflictState: "minor",
      createdAt: new Date("2026-03-10T09:00:00.000Z")
    }
  });

  await db.refreshJob.upsert({
    where: { id: "job-meridian-1" },
    update: {},
    create: {
      id: "job-meridian-1",
      accountId: "acc-meridian",
      jobType: "manual",
      status: "completed",
      sourceScope: ["public_newsroom"],
      startedAt: new Date("2026-03-10T08:30:00.000Z"),
      completedAt: new Date("2026-03-10T09:00:00.000Z")
    }
  });

  // acc-ironvault — IronVault Manufacturing
  await db.account.upsert({
    where: { id: "acc-ironvault" },
    update: {},
    create: {
      id: "acc-ironvault",
      canonicalName: "IronVault Manufacturing",
      primaryDomain: "ironvault-mfg.com",
      aliases: [],
      region: "MEA",
      industry: "manufacturing",
      sizeBand: "enterprise",
      status: "new",
      confidenceStatus: "low",
      lastRefreshedAt: new Date("2026-02-15T08:00:00.000Z")
    }
  });

  await db.aliasIdentifier.upsert({
    where: { id: "alias-acc-ironvault-ironvault-mfg.com" },
    update: {},
    create: {
      id: "alias-acc-ironvault-ironvault-mfg.com",
      accountId: "acc-ironvault",
      type: "domain",
      value: "ironvault-mfg.com",
      source: "registry",
      matchConfidence: 85,
      active: true
    }
  });

  await db.sourceRecord.upsert({
    where: { id: "src-ironvault-1" },
    update: {},
    create: {
      id: "src-ironvault-1",
      accountId: "acc-ironvault",
      sourceClass: "registry",
      sourceUrl: "https://registry.example/ironvault",
      fetchedAt: new Date("2026-02-15T08:00:00.000Z"),
      quality: "low",
      extractionStatus: "success"
    }
  });

  const ironvaultEvidence = [
    { id: "ev-ironvault-1", accountId: "acc-ironvault", sourceRecordId: "src-ironvault-1", fieldName: "industry",      fieldValue: "manufacturing",       confidence: 48, conflictFlag: false, extractedAt: new Date("2026-02-15T08:00:00.000Z") },
    { id: "ev-ironvault-2", accountId: "acc-ironvault", sourceRecordId: "src-ironvault-1", fieldName: "growth_signal", fieldValue: "new regional expansion", confidence: 35, conflictFlag: true,  extractedAt: new Date("2026-02-15T08:00:00.000Z") }
  ];
  for (const ev of ironvaultEvidence) {
    await db.evidenceRecord.upsert({ where: { id: ev.id }, update: {}, create: ev });
  }

  await db.normalizedProfile.upsert({
    where: { accountId: "acc-ironvault" },
    update: {},
    create: {
      accountId: "acc-ironvault",
      industry: "manufacturing",
      businessFunctions: ["operations"],
      geography: "MEA",
      maturity: "early",
      complexity: "medium",
      growthSignals: ["new regional expansion"],
      profileConfidence: 42,
      conflictSummary: ["Operations signals from registry-only evidence. Low confidence."],
      inferenceMode: "heuristic",
      inferenceSummary: "Manufacturing entity with weak evidence base. Needs re-analysis.",
      matchedRules: [],
      limitations: []
    }
  });

  await db.recommendation.upsert({
    where: { id: "rec-ironvault-workflows" },
    update: {},
    create: {
      id: "rec-ironvault-workflows",
      accountId: "acc-ironvault",
      productId: "prod-workflows",
      classification: "anchor",
      fitScore: 45,
      confidenceScore: 32,
      rationale: "Operations alignment conceptual but evidence too weak and stale for planning.",
      evidenceRefs: ["ev-ironvault-1", "ev-ironvault-2"],
      nextBestAction: "Route for analyst review and schedule a full profile refresh before any account planning.",
      status: "review_required",
      confidenceBand: "low",
      freshnessState: "stale",
      conflictState: "major",
      createdAt: new Date("2026-02-15T08:00:00.000Z")
    }
  });

  await db.refreshJob.upsert({
    where: { id: "job-ironvault-1" },
    update: {},
    create: {
      id: "job-ironvault-1",
      accountId: "acc-ironvault",
      jobType: "manual",
      status: "stale",
      sourceScope: ["registry"],
      startedAt: new Date("2026-02-15T07:30:00.000Z"),
      completedAt: new Date("2026-02-15T08:00:00.000Z")
    }
  });

  // acc-cascade — Cascade Health Systems
  await db.account.upsert({
    where: { id: "acc-cascade" },
    update: {},
    create: {
      id: "acc-cascade",
      canonicalName: "Cascade Health Systems",
      primaryDomain: "cascadehealth.org",
      aliases: [],
      region: "North America",
      industry: "healthcare",
      sizeBand: "enterprise",
      status: "existing",
      confidenceStatus: "high",
      lastRefreshedAt: new Date("2026-03-21T10:00:00.000Z")
    }
  });

  await db.aliasIdentifier.upsert({
    where: { id: "alias-acc-cascade-cascadehealth.org" },
    update: {},
    create: {
      id: "alias-acc-cascade-cascadehealth.org",
      accountId: "acc-cascade",
      type: "domain",
      value: "cascadehealth.org",
      source: "official_site",
      matchConfidence: 100,
      active: true
    }
  });

  const cascadeSources = [
    { id: "src-cascade-1", accountId: "acc-cascade", sourceClass: "public_website" as const, sourceUrl: "https://cascadehealth.org",         fetchedAt: new Date("2026-03-21T10:00:00.000Z"), quality: "high" as const,   extractionStatus: "success" as const },
    { id: "src-cascade-2", accountId: "acc-cascade", sourceClass: "careers" as const,        sourceUrl: "https://cascadehealth.org/careers", fetchedAt: new Date("2026-03-21T10:00:00.000Z"), quality: "high" as const,   extractionStatus: "success" as const }
  ];
  for (const src of cascadeSources) {
    await db.sourceRecord.upsert({ where: { id: src.id }, update: {}, create: src });
  }

  const cascadeEvidence = [
    { id: "ev-cascade-1", accountId: "acc-cascade", sourceRecordId: "src-cascade-1", fieldName: "industry",          fieldValue: "healthcare",         confidence: 93, conflictFlag: false, extractedAt: new Date("2026-03-21T10:00:00.000Z") },
    { id: "ev-cascade-2", accountId: "acc-cascade", sourceRecordId: "src-cascade-1", fieldName: "business_function", fieldValue: "operations",         confidence: 88, conflictFlag: false, extractedAt: new Date("2026-03-21T10:00:00.000Z") },
    { id: "ev-cascade-3", accountId: "acc-cascade", sourceRecordId: "src-cascade-2", fieldName: "business_function", fieldValue: "service delivery",   confidence: 84, conflictFlag: false, extractedAt: new Date("2026-03-21T10:00:00.000Z") },
    { id: "ev-cascade-4", accountId: "acc-cascade", sourceRecordId: "src-cascade-2", fieldName: "growth_signal",     fieldValue: "new executive hire", confidence: 79, conflictFlag: false, extractedAt: new Date("2026-03-21T10:00:00.000Z") }
  ];
  for (const ev of cascadeEvidence) {
    await db.evidenceRecord.upsert({ where: { id: ev.id }, update: {}, create: ev });
  }

  await db.normalizedProfile.upsert({
    where: { accountId: "acc-cascade" },
    update: {},
    create: {
      accountId: "acc-cascade",
      industry: "healthcare",
      businessFunctions: ["operations", "service delivery", "leadership"],
      geography: "North America",
      maturity: "digitally mature",
      complexity: "high",
      growthSignals: ["new executive hire", "multi-region growth"],
      profileConfidence: 85,
      conflictSummary: [],
      inferenceMode: "seeded",
      inferenceSummary: "Large healthcare system with strong operational profile and multi-region growth signals.",
      matchedRules: [],
      limitations: []
    }
  });

  const cascadeRecs = [
    {
      id: "rec-cascade-workflows",
      accountId: "acc-cascade",
      productId: "prod-workflows",
      classification: "anchor" as const,
      fitScore: 86,
      confidenceScore: 83,
      rationale: "Large healthcare operations with complex service delivery and fresh executive signals.",
      evidenceRefs: ["ev-cascade-1", "ev-cascade-2", "ev-cascade-3", "ev-cascade-4"],
      nextBestAction: "Promote orchestration anchor play — strong fit confirmed.",
      status: "approved" as const,
      confidenceBand: "high" as const,
      freshnessState: "fresh" as const,
      conflictState: "none" as const,
      createdAt: new Date("2026-03-21T10:00:00.000Z")
    },
    {
      id: "rec-cascade-analytics",
      accountId: "acc-cascade",
      productId: "prod-analytics",
      classification: "adjacent" as const,
      fitScore: 74,
      confidenceScore: 79,
      rationale: "Leadership and multi-region signals suggest data visibility is a clear adjacent need.",
      evidenceRefs: ["ev-cascade-1", "ev-cascade-4"],
      nextBestAction: "Position analytics as second step after operational alignment is confirmed.",
      status: "validate_in_discovery" as const,
      confidenceBand: "high" as const,
      freshnessState: "fresh" as const,
      conflictState: "none" as const,
      createdAt: new Date("2026-03-21T10:00:00.000Z")
    }
  ];
  for (const rec of cascadeRecs) {
    await db.recommendation.upsert({ where: { id: rec.id }, update: {}, create: rec });
  }

  await db.recommendationReview.upsert({
    where: { id: "review-cascade-1" },
    update: {},
    create: {
      id: "review-cascade-1",
      recommendationId: "rec-cascade-workflows",
      reviewer: "Amina Shah",
      decision: "accepted",
      notes: "Confirmed complex operations across 4 regions.",
      reviewedAt: new Date("2026-03-22T08:00:00.000Z")
    }
  });

  await db.refreshJob.upsert({
    where: { id: "job-cascade-1" },
    update: {},
    create: {
      id: "job-cascade-1",
      accountId: "acc-cascade",
      jobType: "scheduled",
      status: "completed",
      sourceScope: ["public_website", "careers"],
      startedAt: new Date("2026-03-21T09:30:00.000Z"),
      completedAt: new Date("2026-03-21T10:00:00.000Z")
    }
  });

  // acc-vortex — Vortex Platform Inc
  await db.account.upsert({
    where: { id: "acc-vortex" },
    update: {},
    create: {
      id: "acc-vortex",
      canonicalName: "Vortex Platform Inc",
      primaryDomain: "vortex-platform.com",
      aliases: ["Vortex"],
      region: "EMEA",
      industry: "saas",
      sizeBand: "mid-market",
      status: "review_required",
      confidenceStatus: "medium",
      lastRefreshedAt: new Date("2026-03-18T10:00:00.000Z")
    }
  });

  const vortexAliases = [
    { id: "alias-acc-vortex-vortex-platform.com", accountId: "acc-vortex", type: "domain" as const, value: "vortex-platform.com", source: "official_site",   matchConfidence: 100, active: true },
    { id: "alias-acc-vortex-Vortex",              accountId: "acc-vortex", type: "alias" as const,  value: "Vortex",              source: "public_newsroom", matchConfidence: 68,  active: true }
  ];
  for (const a of vortexAliases) {
    await db.aliasIdentifier.upsert({ where: { id: a.id }, update: {}, create: a });
  }

  const vortexSources = [
    { id: "src-vortex-1", accountId: "acc-vortex", sourceClass: "public_website" as const,  sourceUrl: "https://vortex-platform.com",       fetchedAt: new Date("2026-03-18T10:00:00.000Z"), quality: "medium" as const, extractionStatus: "success" as const },
    { id: "src-vortex-2", accountId: "acc-vortex", sourceClass: "public_newsroom" as const, sourceUrl: "https://vortex-platform.com/news",   fetchedAt: new Date("2026-03-18T10:00:00.000Z"), quality: "medium" as const, extractionStatus: "success" as const }
  ];
  for (const src of vortexSources) {
    await db.sourceRecord.upsert({ where: { id: src.id }, update: {}, create: src });
  }

  const vortexEvidence = [
    { id: "ev-vortex-1", accountId: "acc-vortex", sourceRecordId: "src-vortex-1", fieldName: "industry",          fieldValue: "saas",                         confidence: 82, conflictFlag: false, extractedAt: new Date("2026-03-18T10:00:00.000Z") },
    { id: "ev-vortex-2", accountId: "acc-vortex", sourceRecordId: "src-vortex-1", fieldName: "business_function", fieldValue: "operations",                   confidence: 74, conflictFlag: false, extractedAt: new Date("2026-03-18T10:00:00.000Z") },
    { id: "ev-vortex-3", accountId: "acc-vortex", sourceRecordId: "src-vortex-2", fieldName: "business_function", fieldValue: "analytics",                    confidence: 69, conflictFlag: false, extractedAt: new Date("2026-03-18T10:00:00.000Z") },
    { id: "ev-vortex-4", accountId: "acc-vortex", sourceRecordId: "src-vortex-2", fieldName: "growth_signal",     fieldValue: "board-level efficiency push",  confidence: 66, conflictFlag: false, extractedAt: new Date("2026-03-18T10:00:00.000Z") }
  ];
  for (const ev of vortexEvidence) {
    await db.evidenceRecord.upsert({ where: { id: ev.id }, update: {}, create: ev });
  }

  await db.normalizedProfile.upsert({
    where: { accountId: "acc-vortex" },
    update: {},
    create: {
      accountId: "acc-vortex",
      industry: "saas",
      businessFunctions: ["operations", "analytics"],
      geography: "EMEA",
      maturity: "growing",
      complexity: "medium",
      growthSignals: ["board-level efficiency push", "expansion hiring"],
      profileConfidence: 72,
      conflictSummary: ["Dual function signals suggest adjacency — validate operations or analytics as primary motion."],
      inferenceMode: "heuristic",
      inferenceSummary: "Mid-market SaaS with competing operations and analytics signals.",
      matchedRules: [],
      limitations: []
    }
  });

  const vortexRecs = [
    {
      id: "rec-vortex-workflows",
      accountId: "acc-vortex",
      productId: "prod-workflows",
      classification: "anchor" as const,
      fitScore: 74,
      confidenceScore: 68,
      rationale: "Operations signal present with efficiency push, but dual-function profile creates uncertainty.",
      evidenceRefs: ["ev-vortex-1", "ev-vortex-2", "ev-vortex-4"],
      nextBestAction: "Validate which function (operations vs. analytics) is the primary driver before advancing.",
      status: "validate_in_discovery" as const,
      confidenceBand: "medium" as const,
      freshnessState: "fresh" as const,
      conflictState: "minor" as const,
      createdAt: new Date("2026-03-18T10:00:00.000Z")
    },
    {
      id: "rec-vortex-analytics",
      accountId: "acc-vortex",
      productId: "prod-analytics",
      classification: "adjacent" as const,
      fitScore: 65,
      confidenceScore: 62,
      rationale: "Analytics adjacent play is viable if discovery confirms analytics-first mandate.",
      evidenceRefs: ["ev-vortex-1", "ev-vortex-3", "ev-vortex-4"],
      nextBestAction: "Hold until workbench review clarifies the primary motion.",
      status: "review_required" as const,
      confidenceBand: "medium" as const,
      freshnessState: "fresh" as const,
      conflictState: "minor" as const,
      createdAt: new Date("2026-03-18T10:00:00.000Z")
    }
  ];
  for (const rec of vortexRecs) {
    await db.recommendation.upsert({ where: { id: rec.id }, update: {}, create: rec });
  }

  await db.refreshJob.upsert({
    where: { id: "job-vortex-1" },
    update: {},
    create: {
      id: "job-vortex-1",
      accountId: "acc-vortex",
      jobType: "manual",
      status: "completed",
      sourceScope: ["public_website", "public_newsroom"],
      startedAt: new Date("2026-03-18T09:30:00.000Z"),
      completedAt: new Date("2026-03-18T10:00:00.000Z")
    }
  });

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

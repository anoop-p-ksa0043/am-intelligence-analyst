/**
 * Zoho Product Catalog — canonical source of truth for the product suite.
 * Used by: seed script, scoring engine, GET /api/products.
 */

export interface ZohoProduct {
  id: string;
  name: string;
  family: string;
  classification: "anchor" | "adjacent" | "ecosystem_enabler";
  primaryFunctions: string[];
  industries: string[];       // "all" means every industry
  buyerPersonas: string[];
  complexity: "low" | "medium" | "high";
  description: string;
}

export interface ZohoRule {
  id: string;
  productId: string;
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
  dependencies: string[];  // productIds this product depends on
}

// ─── Product catalog ──────────────────────────────────────────────────────────

export const ZOHO_PRODUCTS: ZohoProduct[] = [
  // ── Anchor products (standalone, no dependencies) ──────────────────────────
  {
    id: "zoho-crm",
    name: "Zoho CRM",
    family: "Revenue",
    classification: "anchor",
    primaryFunctions: ["sales", "crm", "revenue operations", "lead management"],
    industries: ["saas", "fintech", "professional services", "healthcare", "retail", "manufacturing"],
    buyerPersonas: ["sales director", "revenue operations lead", "vp sales", "crm admin"],
    complexity: "medium",
    description: "Full-featured CRM covering pipeline management, lead nurturing, and revenue operations."
  },
  {
    id: "zoho-desk",
    name: "Zoho Desk",
    family: "Service",
    classification: "anchor",
    primaryFunctions: ["customer support", "service delivery", "help desk", "ticketing"],
    industries: ["saas", "healthcare", "professional services", "retail", "manufacturing"],
    buyerPersonas: ["customer success manager", "support lead", "cs ops", "head of service"],
    complexity: "medium",
    description: "Context-aware help desk software for multi-channel customer support and SLA management."
  },
  {
    id: "zoho-books",
    name: "Zoho Books",
    family: "Finance",
    classification: "anchor",
    primaryFunctions: ["finance", "accounting", "invoicing", "expense management"],
    industries: ["saas", "professional services", "fintech", "manufacturing", "logistics"],
    buyerPersonas: ["finance director", "controller", "cfo", "accountant"],
    complexity: "medium",
    description: "End-to-end accounting platform with invoicing, expense tracking, and compliance reporting."
  },
  {
    id: "zoho-people",
    name: "Zoho People",
    family: "HR",
    classification: "anchor",
    primaryFunctions: ["hr", "people operations", "employee management", "payroll"],
    industries: ["all"],
    buyerPersonas: ["hr director", "people ops lead", "chro", "hr manager"],
    complexity: "medium",
    description: "Unified HR platform for employee lifecycle management, leave, attendance, and performance."
  },
  {
    id: "zoho-projects",
    name: "Zoho Projects",
    family: "Operations",
    classification: "anchor",
    primaryFunctions: ["project management", "operations", "task tracking", "delivery"],
    industries: ["professional services", "saas", "manufacturing"],
    buyerPersonas: ["operations lead", "project manager", "delivery head", "pmo"],
    complexity: "medium",
    description: "Project management tool with Gantt charts, resource management, and milestone tracking."
  },
  {
    id: "zoho-one",
    name: "Zoho One",
    family: "Suite",
    classification: "anchor",
    primaryFunctions: ["all-in-one suite", "full business os", "digital transformation"],
    industries: ["all"],
    buyerPersonas: ["ceo", "coo", "head of digital transformation", "it director"],
    complexity: "high",
    description: "The complete Zoho suite — all 45+ apps under one subscription for org-wide transformation."
  },

  // ── Adjacent products (depend on 1–2 anchors) ─────────────────────────────
  {
    id: "zoho-analytics",
    name: "Zoho Analytics",
    family: "Analytics",
    classification: "adjacent",
    primaryFunctions: ["analytics", "business intelligence", "reporting", "strategy", "leadership"],
    industries: ["all"],
    buyerPersonas: ["analytics lead", "vp strategy", "data analyst", "operations manager"],
    complexity: "medium",
    description: "Self-service BI and analytics with 500+ connectors, AI-assisted insights, and custom dashboards."
  },
  {
    id: "zoho-campaigns",
    name: "Zoho Campaigns",
    family: "Marketing",
    classification: "adjacent",
    primaryFunctions: ["marketing", "email campaigns", "audience segmentation", "demand generation"],
    industries: ["saas", "retail", "professional services", "fintech"],
    buyerPersonas: ["marketing manager", "demand generation lead", "growth marketer", "email marketer"],
    complexity: "low",
    description: "Email and multi-channel marketing automation with segmentation, A/B testing, and CRM sync."
  },
  {
    id: "zoho-salesiq",
    name: "Zoho SalesIQ",
    family: "Revenue",
    classification: "adjacent",
    primaryFunctions: ["sales", "live chat", "lead qualification", "website engagement"],
    industries: ["saas", "retail", "fintech", "professional services"],
    buyerPersonas: ["sales development rep", "growth lead", "inside sales manager", "pre-sales"],
    complexity: "low",
    description: "Live chat and visitor intelligence platform for real-time lead engagement and conversion."
  },
  {
    id: "zoho-recruit",
    name: "Zoho Recruit",
    family: "HR",
    classification: "adjacent",
    primaryFunctions: ["recruitment", "hiring", "applicant tracking", "talent acquisition"],
    industries: ["all"],
    buyerPersonas: ["talent acquisition lead", "hr director", "recruiter", "people ops"],
    complexity: "medium",
    description: "End-to-end ATS and recruitment CRM for in-house teams and staffing agencies."
  },
  {
    id: "zoho-inventory",
    name: "Zoho Inventory",
    family: "Operations",
    classification: "adjacent",
    primaryFunctions: ["inventory management", "stock control", "order fulfillment", "warehouse"],
    industries: ["retail", "manufacturing", "logistics"],
    buyerPersonas: ["operations manager", "supply chain lead", "warehouse manager", "procurement head"],
    complexity: "medium",
    description: "Multi-warehouse inventory management with order tracking, barcode scanning, and shipping integrations."
  },
  {
    id: "zoho-payroll",
    name: "Zoho Payroll",
    family: "Finance",
    classification: "adjacent",
    primaryFunctions: ["payroll", "salary processing", "tax compliance", "compensation"],
    industries: ["all"],
    buyerPersonas: ["payroll manager", "finance director", "hr director", "cfo"],
    complexity: "medium",
    description: "Automated payroll processing with statutory compliance, payslips, and direct deposit."
  },
  {
    id: "zoho-sign",
    name: "Zoho Sign",
    family: "Legal",
    classification: "adjacent",
    primaryFunctions: ["e-signature", "contract signing", "document approval", "legal workflows"],
    industries: ["professional services", "fintech", "healthcare", "saas"],
    buyerPersonas: ["legal counsel", "operations lead", "cfo", "contract manager"],
    complexity: "low",
    description: "Legally binding e-signature and document workflow automation with audit trails."
  },
  {
    id: "zoho-social",
    name: "Zoho Social",
    family: "Marketing",
    classification: "adjacent",
    primaryFunctions: ["social media", "brand management", "content scheduling", "engagement"],
    industries: ["saas", "retail", "professional services"],
    buyerPersonas: ["social media manager", "brand manager", "marketing lead", "content strategist"],
    complexity: "low",
    description: "Social media management platform for scheduling, monitoring, and reporting across channels."
  },
  {
    id: "zoho-survey",
    name: "Zoho Survey",
    family: "CX",
    classification: "adjacent",
    primaryFunctions: ["customer feedback", "surveys", "nps", "voice of customer"],
    industries: ["saas", "retail", "healthcare", "professional services"],
    buyerPersonas: ["cx lead", "customer success manager", "product manager", "researcher"],
    complexity: "low",
    description: "Survey builder with NPS, CSAT, and custom questions — integrated with CRM and desk."
  },

  // ── Ecosystem enablers (platform / integration layer) ─────────────────────
  {
    id: "zoho-creator",
    name: "Zoho Creator",
    family: "Platform",
    classification: "ecosystem_enabler",
    primaryFunctions: ["low-code apps", "custom workflows", "business automation", "forms"],
    industries: ["all"],
    buyerPersonas: ["business analyst", "operations lead", "it manager", "citizen developer"],
    complexity: "medium",
    description: "Low-code application builder for custom business apps, workflows, and process automation."
  },
  {
    id: "zoho-flow",
    name: "Zoho Flow",
    family: "Platform",
    classification: "ecosystem_enabler",
    primaryFunctions: ["workflow automation", "app integration", "process orchestration", "no-code"],
    industries: ["all"],
    buyerPersonas: ["operations lead", "it manager", "business analyst", "automation specialist"],
    complexity: "medium",
    description: "No-code integration platform connecting 900+ apps with drag-and-drop workflow builder."
  },
  {
    id: "zoho-cliq",
    name: "Zoho Cliq",
    family: "Collaboration",
    classification: "ecosystem_enabler",
    primaryFunctions: ["team communication", "chat", "collaboration", "internal messaging"],
    industries: ["all"],
    buyerPersonas: ["it director", "operations lead", "team lead", "coo"],
    complexity: "low",
    description: "Team messaging and collaboration hub with channels, video calls, and bot integrations."
  }
];

// ─── Scoring rules ─────────────────────────────────────────────────────────────
// Weightings sum to 90 (matches the divisor in scoreProduct).
// anchor:             ecosystem = 80, no dependencies
// adjacent:           ecosystem = 58, 1–2 anchor dependencies
// ecosystem_enabler:  ecosystem = 40, businessFunction = 35

export const ZOHO_RULES: ZohoRule[] = [
  // ── Anchors ────────────────────────────────────────────────────────────────
  {
    id: "rule-zoho-crm-v1",
    productId: "zoho-crm",
    weightings: { industry: 20, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 10, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "fintech", "professional services", "healthcare", "retail", "manufacturing"],
      functions: ["sales", "crm", "revenue operations", "lead management"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium", "high"],
      triggers: ["expansion hiring", "new executive hire", "product launch", "funding round"],
      dependencyFamilies: []
    },
    dependencies: []
  },
  {
    id: "rule-zoho-desk-v1",
    productId: "zoho-desk",
    weightings: { industry: 20, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 10, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "healthcare", "professional services", "retail", "manufacturing"],
      functions: ["customer support", "service delivery", "help desk", "ticketing"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium", "high"],
      triggers: ["expansion hiring", "new executive hire", "product launch"],
      dependencyFamilies: []
    },
    dependencies: []
  },
  {
    id: "rule-zoho-books-v1",
    productId: "zoho-books",
    weightings: { industry: 15, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 15, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "professional services", "fintech", "manufacturing", "logistics"],
      functions: ["finance", "accounting", "invoicing", "expense management"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium", "high"],
      triggers: ["funding round", "board-level efficiency push", "new executive hire"],
      dependencyFamilies: []
    },
    dependencies: []
  },
  {
    id: "rule-zoho-people-v1",
    productId: "zoho-people",
    weightings: { industry: 10, businessFunction: 30, scale: 10, complexity: 5, triggerSignal: 15, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "fintech", "professional services", "healthcare", "retail", "manufacturing", "logistics", "education", "other"],
      functions: ["hr", "people operations", "employee management", "payroll"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium", "high"],
      triggers: ["expansion hiring", "new executive hire", "new regional expansion", "multi-region growth"],
      dependencyFamilies: []
    },
    dependencies: []
  },
  {
    id: "rule-zoho-projects-v1",
    productId: "zoho-projects",
    weightings: { industry: 15, businessFunction: 30, scale: 5, complexity: 10, triggerSignal: 10, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["professional services", "saas", "manufacturing"],
      functions: ["project management", "operations", "task tracking", "delivery"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["medium", "high"],
      triggers: ["expansion hiring", "product launch", "new regional expansion"],
      dependencyFamilies: []
    },
    dependencies: []
  },
  {
    id: "rule-zoho-one-v1",
    productId: "zoho-one",
    weightings: { industry: 10, businessFunction: 20, scale: 15, complexity: 10, triggerSignal: 10, ecosystem: 20, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "fintech", "professional services", "healthcare", "retail", "manufacturing", "logistics", "education", "other"],
      functions: ["sales", "crm", "customer support", "finance", "hr", "operations", "analytics", "marketing"],
      sizeBands: ["mid-market", "enterprise"],
      complexities: ["medium", "high"],
      triggers: ["funding round", "board-level efficiency push", "new executive hire", "multi-region growth"],
      dependencyFamilies: []
    },
    dependencies: []
  },

  // ── Adjacent ───────────────────────────────────────────────────────────────
  {
    id: "rule-zoho-analytics-v1",
    productId: "zoho-analytics",
    weightings: { industry: 10, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 15, ecosystem: 20, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "fintech", "professional services", "healthcare", "retail", "manufacturing", "logistics", "education", "other"],
      functions: ["analytics", "business intelligence", "reporting", "strategy", "leadership"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium", "high"],
      triggers: ["board-level efficiency push", "new executive hire", "multi-region growth", "funding round"],
      dependencyFamilies: ["Revenue", "Operations", "Service"]
    },
    dependencies: ["zoho-crm", "zoho-desk"]
  },
  {
    id: "rule-zoho-campaigns-v1",
    productId: "zoho-campaigns",
    weightings: { industry: 15, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 15, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "retail", "professional services", "fintech"],
      functions: ["marketing", "email campaigns", "audience segmentation", "demand generation"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium"],
      triggers: ["product launch", "funding round", "new regional expansion", "channel launch"],
      dependencyFamilies: ["Revenue"]
    },
    dependencies: ["zoho-crm"]
  },
  {
    id: "rule-zoho-salesiq-v1",
    productId: "zoho-salesiq",
    weightings: { industry: 15, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 15, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "retail", "fintech", "professional services"],
      functions: ["sales", "live chat", "lead qualification", "website engagement"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium"],
      triggers: ["product launch", "expansion hiring", "funding round"],
      dependencyFamilies: ["Revenue"]
    },
    dependencies: ["zoho-crm"]
  },
  {
    id: "rule-zoho-recruit-v1",
    productId: "zoho-recruit",
    weightings: { industry: 10, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 20, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "fintech", "professional services", "healthcare", "retail", "manufacturing", "logistics", "education", "other"],
      functions: ["recruitment", "hiring", "applicant tracking", "talent acquisition"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium", "high"],
      triggers: ["expansion hiring", "new executive hire", "funding round", "new regional expansion"],
      dependencyFamilies: ["HR"]
    },
    dependencies: ["zoho-people"]
  },
  {
    id: "rule-zoho-inventory-v1",
    productId: "zoho-inventory",
    weightings: { industry: 20, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 10, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["retail", "manufacturing", "logistics"],
      functions: ["inventory management", "stock control", "order fulfillment", "warehouse"],
      sizeBands: ["mid-market", "enterprise"],
      complexities: ["medium", "high"],
      triggers: ["new regional expansion", "multi-region growth", "expansion hiring"],
      dependencyFamilies: ["Finance"]
    },
    dependencies: ["zoho-books"]
  },
  {
    id: "rule-zoho-payroll-v1",
    productId: "zoho-payroll",
    weightings: { industry: 10, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 20, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "fintech", "professional services", "healthcare", "retail", "manufacturing", "logistics", "education", "other"],
      functions: ["payroll", "salary processing", "tax compliance", "compensation"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium", "high"],
      triggers: ["expansion hiring", "new executive hire", "multi-region growth"],
      dependencyFamilies: ["HR", "Finance"]
    },
    dependencies: ["zoho-people", "zoho-books"]
  },
  {
    id: "rule-zoho-sign-v1",
    productId: "zoho-sign",
    weightings: { industry: 15, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 15, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["professional services", "fintech", "healthcare", "saas"],
      functions: ["e-signature", "contract signing", "document approval", "legal workflows"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium", "high"],
      triggers: ["expansion hiring", "new executive hire", "board-level efficiency push"],
      dependencyFamilies: ["Revenue", "Operations"]
    },
    dependencies: ["zoho-crm"]
  },
  {
    id: "rule-zoho-social-v1",
    productId: "zoho-social",
    weightings: { industry: 15, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 15, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "retail", "professional services"],
      functions: ["social media", "brand management", "content scheduling", "marketing"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium"],
      triggers: ["product launch", "channel launch", "new regional expansion"],
      dependencyFamilies: ["Marketing"]
    },
    dependencies: ["zoho-campaigns"]
  },
  {
    id: "rule-zoho-survey-v1",
    productId: "zoho-survey",
    weightings: { industry: 15, businessFunction: 30, scale: 5, complexity: 5, triggerSignal: 15, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "retail", "healthcare", "professional services"],
      functions: ["customer feedback", "surveys", "nps", "voice of customer"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium"],
      triggers: ["product launch", "expansion hiring", "new executive hire"],
      dependencyFamilies: ["Service"]
    },
    dependencies: ["zoho-desk"]
  },

  // ── Ecosystem enablers ─────────────────────────────────────────────────────
  {
    id: "rule-zoho-creator-v1",
    productId: "zoho-creator",
    weightings: { industry: 10, businessFunction: 35, scale: 5, complexity: 10, triggerSignal: 10, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "fintech", "professional services", "healthcare", "retail", "manufacturing", "logistics", "education", "other"],
      functions: ["low-code apps", "custom workflows", "business automation", "operations"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["medium", "high"],
      triggers: ["board-level efficiency push", "new executive hire", "expansion hiring"],
      dependencyFamilies: ["Revenue", "Operations", "HR"]
    },
    dependencies: ["zoho-crm", "zoho-projects"]
  },
  {
    id: "rule-zoho-flow-v1",
    productId: "zoho-flow",
    weightings: { industry: 10, businessFunction: 35, scale: 5, complexity: 10, triggerSignal: 10, ecosystem: 15, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "fintech", "professional services", "healthcare", "retail", "manufacturing", "logistics", "education", "other"],
      functions: ["workflow automation", "app integration", "process orchestration", "operations"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["medium", "high"],
      triggers: ["board-level efficiency push", "multi-region growth", "expansion hiring"],
      dependencyFamilies: ["Revenue", "Operations", "Finance"]
    },
    dependencies: ["zoho-crm", "zoho-books"]
  },
  {
    id: "rule-zoho-cliq-v1",
    productId: "zoho-cliq",
    weightings: { industry: 5, businessFunction: 35, scale: 5, complexity: 5, triggerSignal: 15, ecosystem: 20, evidenceConfidence: 5 },
    conditions: {
      industries: ["saas", "fintech", "professional services", "healthcare", "retail", "manufacturing", "logistics", "education", "other"],
      functions: ["team communication", "collaboration", "operations"],
      sizeBands: ["startup", "mid-market", "enterprise"],
      complexities: ["low", "medium", "high"],
      triggers: ["expansion hiring", "multi-region growth", "new regional expansion"],
      dependencyFamilies: ["Revenue", "Operations"]
    },
    dependencies: ["zoho-crm", "zoho-projects"]
  }
];

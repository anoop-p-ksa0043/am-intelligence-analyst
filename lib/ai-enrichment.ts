/**
 * AI-powered account enrichment.
 * Fetches the company website, extracts visible text, then uses Claude to
 * produce a structured account profile blueprint.  Falls back to the
 * keyword heuristic if anything in the pipeline fails.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Blueprint {
  industry: string;
  subIndustry: string;
  businessFunctions: string[];
  geography: string;          // HQ / primary region
  operatingRegions: string[]; // additional operating regions
  maturity: string;
  complexity: string;
  growthSignals: string[];
  profileConfidence: number;
  inferenceMeta: {
    mode: "ai" | "heuristic";
    summary: string;
    matchedRules: string[];
    limitations: string[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip HTML tags and collapse whitespace to get readable text. */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Attempt to fetch visible text from a URL. Returns empty string on failure. */
async function fetchPageText(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IntelligenceObserver/1.0)" }
    });
    clearTimeout(timer);
    if (!res.ok) return "";
    const html = await res.text();
    return stripHtml(html).slice(0, 4000);
  } catch {
    return "";
  }
}

// ─── Keyword fallback ─────────────────────────────────────────────────────────

function keywordFallback(name: string, domain: string): Blueprint {
  const fingerprint = `${name} ${domain}`.toLowerCase();

  if (fingerprint.includes("health")) {
    return {
      industry: "healthcare",
      subIndustry: "digital care operations",
      businessFunctions: ["operations", "service delivery", "strategy"],
      geography: "North America",
      operatingRegions: [],
      maturity: "growing",
      complexity: "high",
      growthSignals: ["expansion hiring", "new executive hire"],
      profileConfidence: 40,
      inferenceMeta: {
        mode: "heuristic",
        summary: "Keyword heuristic matched 'health' in company name/domain.",
        matchedRules: ["Keyword: health → industry healthcare"],
        limitations: ["String-match heuristic — not live web analysis."]
      }
    };
  }

  if (fingerprint.includes("freight") || fingerprint.includes("logistics")) {
    return {
      industry: "logistics",
      subIndustry: "fleet operations",
      businessFunctions: ["operations", "service delivery"],
      geography: "MEA",
      operatingRegions: [],
      maturity: "emerging",
      complexity: "medium",
      growthSignals: ["new regional expansion"],
      profileConfidence: 40,
      inferenceMeta: {
        mode: "heuristic",
        summary: "Keyword heuristic matched 'freight' or 'logistics'.",
        matchedRules: ["Keyword: freight/logistics → industry logistics"],
        limitations: ["String-match heuristic — not live web analysis."]
      }
    };
  }

  return {
    industry: "saas",
    subIndustry: "workflow platform",
    businessFunctions: ["operations", "strategy"],
    geography: "Global",
    operatingRegions: [],
    maturity: "emerging",
    complexity: "medium",
    growthSignals: ["expansion hiring"],
    profileConfidence: 40,
    inferenceMeta: {
      mode: "heuristic",
      summary: "Default heuristic — no keyword rule matched. Manual correction recommended.",
      matchedRules: ["Fallback default → SaaS workflow platform"],
      limitations: [
        "Default heuristic is deliberately generic.",
        "Manual correction or live web extraction needed for accuracy."
      ]
    }
  };
}

// ─── Main enrichment function ─────────────────────────────────────────────────

export async function enrichAccountFromWeb(
  name: string,
  domain: string
): Promise<Blueprint> {
  if (!process.env.GEMINI_API_KEY) {
    return keywordFallback(name, domain);
  }

  // 1. Try company website
  let text = await fetchPageText(`https://${domain}`);

  // 2. Supplement with Wikipedia if website is thin
  if (text.length < 200) {
    const wikiSlug = name.replace(/\s+/g, "_");
    const wikiText = await fetchPageText(`https://en.wikipedia.org/wiki/${encodeURIComponent(wikiSlug)}`);
    if (wikiText.length > text.length) text = wikiText;
  }

  // Always call Gemini — it can reason from name + domain even with no website text
  // 3. Call Gemini for structured extraction
  try {
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const websiteSection = text.length > 0
      ? `Website content: ${text.slice(0, 3000)}`
      : `Website content: (unavailable — infer from company name and domain only)`;

    const prompt = `You are an account intelligence analyst. Analyse the following company and extract structured data. Use the company name, domain, and any website content available. If website content is unavailable, make your best inference from the name and domain.

Return ONLY valid JSON with these exact keys — no markdown, no explanation:
{
  "industry": "one of: saas, fintech, healthcare, manufacturing, logistics, professional services, retail, education, construction, energy, real estate, conglomerate, government, media, telecommunications, hospitality, automotive, other",
  "subIndustry": "short 2–4 word descriptor",
  "businessFunctions": ["array from: sales, crm, customer support, analytics, finance, hr, project management, marketing, operations, strategy, leadership, partnerships, e-signature, payroll, recruitment, inventory management"],
  "geography": "HQ or founding region — one of: North America, EMEA, APAC, MEA, Latin America, Global. Pick the single region where the company is headquartered or was founded. For Gulf/Middle Eastern companies use 'MEA'. For pan-European or pan-African use 'EMEA'. Use 'Global' ONLY if the company has no identifiable home region.",
  "operatingRegions": ["additional regions where the company actively operates beyond HQ — array of zero or more from: North America, EMEA, APAC, MEA, Latin America, Global. Omit the HQ region already captured in geography."],
  "maturity": "one of: early, emerging, growing, digitally mature",
  "complexity": "one of: low, medium, high",
  "growthSignals": ["array from: expansion hiring, new executive hire, funding round, product launch, new regional expansion, multi-region growth, board-level efficiency push, channel launch"],
  "profileConfidence": "integer 0–100 — how confident you are based on available evidence. Use lower values (30–50) when inferring from name/domain only, higher (60–85) when website content is available"
}

Company name: ${name}
Domain: ${domain}
${websiteSection}`;

    // Try models in order — each has a separate free-tier quota bucket
    const MODEL_FALLBACK_CHAIN = [
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.5-flash"
    ];

    let raw = "";
    for (const modelId of MODEL_FALLBACK_CHAIN) {
      try {
        const model = genai.getGenerativeModel({ model: modelId });
        const result = await model.generateContent(prompt);
        raw = result.response.text();
        break;
      } catch (modelErr: any) {
        if (modelId === MODEL_FALLBACK_CHAIN[MODEL_FALLBACK_CHAIN.length - 1]) throw modelErr;
      }
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]);

    const operatingRegions = Array.isArray(parsed.operatingRegions) ? parsed.operatingRegions : [];
    return {
      industry: parsed.industry ?? "other",
      subIndustry: parsed.subIndustry ?? "",
      businessFunctions: Array.isArray(parsed.businessFunctions) ? parsed.businessFunctions : [],
      geography: parsed.geography ?? "Global",
      operatingRegions,
      maturity: parsed.maturity ?? "emerging",
      complexity: parsed.complexity ?? "medium",
      growthSignals: Array.isArray(parsed.growthSignals) ? parsed.growthSignals : [],
      profileConfidence: typeof parsed.profileConfidence === "number"
        ? Math.min(100, Math.max(0, parsed.profileConfidence))
        : 60,
      inferenceMeta: {
        mode: "ai",
        summary: `Gemini-enriched profile for ${name} using live website analysis.`,
        matchedRules: [
          `Industry identified: ${parsed.industry}`,
          `HQ region: ${parsed.geography}${operatingRegions.length ? ` · Operations: ${operatingRegions.join(", ")}` : ""}`,
          `Business functions: ${(parsed.businessFunctions ?? []).join(", ") || "none"}`,
          `Growth signals: ${(parsed.growthSignals ?? []).join(", ") || "none"}`
        ],
        limitations: [
          "Extracted from public website — may not reflect internal operations.",
          "Manual review recommended for high-stakes accounts."
        ]
      }
    };
  } catch (err) {
    console.error("[enrichment] Gemini call failed:", err);
    return keywordFallback(name, domain);
  }
}

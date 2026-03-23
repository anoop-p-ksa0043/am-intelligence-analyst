"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AccountsBoardView, AccountBoardRecord } from "@/lib/console-types";
import { titleCase } from "@/lib/utils";
import { Badge, ConfidenceBar, cx, FreshnessPill, Icon, SectionHeader, StatCard, TimeCaption } from "@/components/console/primitives";

// ─── Delete confirm bar ────────────────────────────────────────────────────────

function DeleteConfirmBar({
  account,
  onCancel,
  onConfirm
}: {
  account: AccountBoardRecord;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <tr className="bg-error/5 border-b border-error/20">
      <td colSpan={7} className="px-5 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Icon name="warning" size={16} className="text-error flex-shrink-0" />
          <span className="text-sm text-on-surface">
            Delete <strong>{account.canonicalName}</strong>? This is permanent and cannot be undone.
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-high text-on-surface hover:bg-surface-highest transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-error text-white hover:opacity-90 transition-opacity"
            >
              Delete
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Status dot ───────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const color =
    status === "existing" ? "bg-tertiary" :
    status === "review_required" ? "bg-error" :
    "bg-warning";
  return <span className={cx("inline-block w-2 h-2 rounded-full flex-shrink-0", color)} />;
}

// ─── Motion badge ─────────────────────────────────────────────────────────────

function MotionBadge({ classification }: { classification: string }) {
  const tone =
    classification === "anchor" ? "primary" :
    classification === "adjacent" ? "success" :
    "warning";
  return (
    <Badge tone={tone} className="text-[10px]">
      {titleCase(classification.replace("_", " "))}
    </Badge>
  );
}

// ─── Account row (table) ──────────────────────────────────────────────────────

function AccountRow({
  account,
  onDelete
}: {
  account: AccountBoardRecord;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="border-b border-outline-variant/10 hover:bg-surface-high/40 transition-colors group">
      {/* Account name */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <StatusDot status={account.status} />
          <div>
            <div className="font-headline font-semibold text-on-surface text-sm leading-tight">
              {account.canonicalName}
            </div>
            <div className="text-[11px] text-on-surface-var/70 mt-0.5">{account.primaryDomain}</div>
          </div>
        </div>
      </td>

      {/* Industry / Region */}
      <td className="px-5 py-4 hidden md:table-cell">
        <div className="text-sm text-on-surface">{titleCase(account.industry ?? "—")}</div>
        <div className="text-[11px] text-on-surface-var/70 mt-0.5">{account.region ?? "—"}</div>
      </td>

      {/* Freshness */}
      <td className="px-5 py-4 hidden lg:table-cell">
        <FreshnessPill freshness={account.freshnessState} />
      </td>

      {/* Confidence */}
      <td className="px-5 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-2 w-28">
          <ConfidenceBar
            value={account.profileConfidence}
            tone={account.profileConfidence >= 75 ? "primary" : account.profileConfidence >= 50 ? "warning" : "danger"}
            className="flex-1"
          />
          <span className="text-[11px] text-on-surface-var flex-shrink-0">{account.profileConfidence}%</span>
        </div>
      </td>

      {/* Primary motion */}
      <td className="px-5 py-4 hidden xl:table-cell">
        {account.selectedPrimaryRecommendation ? (
          <div>
            <MotionBadge classification={account.selectedPrimaryRecommendation.classification} />
            <div className="text-[11px] text-on-surface-var/70 mt-1 max-w-[140px] truncate">
              {account.selectedPrimaryRecommendation.productName}
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-on-surface-var/40">Not selected</span>
        )}
      </td>

      {/* Analyst */}
      <td className="px-5 py-4 hidden xl:table-cell">
        <div className="text-sm text-on-surface">{account.analyst}</div>
        <TimeCaption value={account.lastRefreshedAt} />
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 justify-end">
          <Link
            href={`/workbench/${account.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
            title="Open workbench"
          >
            <Icon name="psychology" size={16} />
          </Link>
          {account.selectedPrimaryRecommendation && (
            <Link
              href={`/recommendations/${account.selectedPrimaryRecommendation.id}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-highest text-on-surface-var hover:text-on-surface hover:bg-surface-high transition-colors"
              title="View primary motion"
            >
              <Icon name="recommend" size={16} />
            </Link>
          )}
          <button
            onClick={() => onDelete(account.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-var/40 hover:bg-error/10 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
            title="Delete account"
          >
            <Icon name="delete" size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Account card (mobile fallback) ──────────────────────────────────────────

function AccountCard({
  account,
  onDelete
}: {
  account: AccountBoardRecord;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="bg-surface-low rounded-xl p-4 border border-outline-variant/10 hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusDot status={account.status} />
            <span className="font-headline font-semibold text-on-surface">{account.canonicalName}</span>
            <FreshnessPill freshness={account.freshnessState} />
          </div>
          <div className="text-xs text-on-surface-var/70 mt-0.5">{account.primaryDomain}</div>
        </div>
        <div className="flex items-start gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="font-headline font-bold text-2xl text-primary leading-none">{account.profileConfidence}%</div>
            <div className="text-[10px] text-on-surface-var/60 mt-0.5">confidence</div>
          </div>
          <button
            onClick={() => onDelete(account.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-var/40 hover:bg-error/10 hover:text-error transition-colors"
            title="Delete account"
          >
            <Icon name="delete" size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="bg-surface-high rounded-lg p-2.5">
          <div className="eyebrow mb-1">Industry</div>
          <div className="text-xs font-semibold text-on-surface truncate">{titleCase(account.industry ?? "—")}</div>
        </div>
        <div className="bg-surface-high rounded-lg p-2.5">
          <div className="eyebrow mb-1">Recs</div>
          <div className="text-xs font-semibold text-on-surface">{account.recommendationCount}</div>
        </div>
        <div className="bg-surface-high rounded-lg p-2.5">
          <div className="eyebrow mb-1">Unresolved</div>
          <div className={cx("text-xs font-semibold", account.unresolvedCount > 0 ? "text-warning" : "text-tertiary")}>
            {account.unresolvedCount}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-outline-variant/10">
        <div className="min-w-0">
          <div className="text-xs font-medium text-on-surface truncate">{account.analyst}</div>
          <TimeCaption value={account.lastRefreshedAt} />
        </div>
        <div className="flex gap-2">
          <Link
            href={`/workbench/${account.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors"
          >
            <Icon name="psychology" size={14} />
            Workbench
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Row group (row + optional confirm bar) ───────────────────────────────────

function AccountRowGroup({
  account,
  deleteAccountId,
  onDelete,
  onCancel,
  onConfirm
}: {
  account: AccountBoardRecord;
  deleteAccountId: string | null;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <AccountRow account={account} onDelete={onDelete} />
      {deleteAccountId === account.id && (
        <DeleteConfirmBar account={account} onCancel={onCancel} onConfirm={onConfirm} />
      )}
    </>
  );
}

// ─── Intake form ──────────────────────────────────────────────────────────────

function IntakeForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleAnalyze(formData: FormData) {
    const payload = {
      organizationName: String(formData.get("organizationName") || ""),
      domain: String(formData.get("domain") || ""),
      crmReference: String(formData.get("crmReference") || "")
    };

    startTransition(async () => {
      setMessage("");
      const intakeResponse = await fetch("/api/accounts/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const intake = await intakeResponse.json();

      if (intake.matchMethod !== "candidate_created") {
        router.push(`/workbench/${intake.account.id}`);
        return;
      }

      const analysisResponse = await fetch("/api/accounts/analyze-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: intake.account })
      });
      const snapshot = await analysisResponse.json();

      if (!analysisResponse.ok) {
        setMessage(snapshot.message ?? "Candidate analysis failed.");
        return;
      }

      router.push(`/workbench/${snapshot.account.id}`);
    });
  }

  return (
    <div className="bg-primary-container rounded-xl p-6 relative overflow-hidden">
      {/* Decorative blur */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="manage_search" size={18} className="text-primary" />
          <span className="eyebrow text-primary/80">Analyze Account</span>
        </div>
        <h3 className="font-headline font-semibold text-on-surface text-lg leading-snug">
          Start from any company
        </h3>
        <p className="text-xs text-on-surface-var/70 mt-1 mb-5">
          Existing matches open instantly. New companies are analyzed and profiled automatically.
        </p>

        <form action={handleAnalyze} className="space-y-2.5">
          <input
            name="organizationName"
            placeholder="Organization name"
            className="input-base w-full"
          />
          <input
            name="domain"
            placeholder="Primary domain (e.g. acme.com)"
            className="input-base w-full"
          />
          <input
            name="crmReference"
            placeholder="CRM reference (optional)"
            className="input-base w-full"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-surface font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Icon name={isPending ? "sync" : "search"} size={16} className={isPending ? "animate-spin" : ""} />
            {isPending ? "Fetching web data & analysing with AI…" : "Analyze Account"}
          </button>
        </form>

        {message && (
          <p className="mt-3 text-xs text-error">{message}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main AccountsBoard ───────────────────────────────────────────────────────

export function AccountsBoard({ initialView }: { initialView: AccountsBoardView }) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("all");
  const [accounts, setAccounts] = useState(initialView.accounts);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  async function handleDeleteConfirm() {
    if (!deleteAccountId) return;
    setDeleteAccountId(null);
    setAccounts((prev) => prev.filter((a) => a.id !== deleteAccountId));
    await fetch(`/api/accounts/${deleteAccountId}`, { method: "DELETE" });
  }

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesQuery =
        query.trim().length === 0 ||
        `${account.canonicalName} ${account.primaryDomain} ${account.industry ?? ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
      const matchesIndustry = industry === "all" || account.industry === industry;
      return matchesQuery && matchesIndustry;
    });
  }, [industry, accounts, query]);

  // Map metrics to stat cards
  const statCards = [
    { label: "At Risk", icon: "warning", tone: "danger" as const, key: "Review Pressure" },
    { label: "Healthy",  icon: "verified", tone: "success" as const, key: "Primary Motions" },
    { label: "Tracked",  icon: "domain",  tone: "primary" as const, key: "Tracked Accounts" },
    { label: "Stale",    icon: "schedule", tone: "warning" as const, key: "Stale Accounts" }
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">

      {/* ── Header + stats ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <div className="flex-1 min-w-0">
          <div className="eyebrow mb-2">Accounts Board</div>
          <h2 className="font-headline font-bold text-on-surface text-3xl md:text-4xl leading-tight">
            Portfolio Overview
          </h2>
          <p className="mt-2 text-sm text-on-surface-var max-w-xl">
            Scan portfolio health, identify review pressure, and drill directly into any account workbench without losing portfolio context.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/review-queue"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-low text-on-surface-var text-sm hover:text-on-surface hover:bg-surface-high transition-colors"
          >
            <Icon name="playlist_add_check" size={16} />
            Review Queue
          </Link>
        </div>
      </div>

      {/* ── Stat cards row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => {
          const metric = initialView.metrics.find((m) => m.label === card.key);
          return (
            <StatCard
              key={card.label}
              label={card.label}
              value={metric?.value ?? 0}
              icon={card.icon}
              tone={card.tone}
            />
          );
        })}
      </div>

      {/* ── Main content: table + intake ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

        {/* Account table */}
        <div className="bg-surface-low rounded-xl overflow-hidden">
          {/* Filter bar */}
          <div className="px-5 py-3 border-b border-outline-variant/10 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[160px] bg-surface rounded-lg px-3 py-2">
              <Icon name="search" size={16} className="text-on-surface-var/50 flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search accounts…"
                className="bg-transparent text-sm text-on-surface placeholder:text-on-surface-var/40 outline-none w-full"
              />
            </div>

            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="bg-surface border-0 rounded-lg px-3 py-2 text-sm text-on-surface outline-none cursor-pointer"
            >
              <option value="all">All industries</option>
              {initialView.availableIndustries.map((opt) => (
                <option key={opt} value={opt}>{titleCase(opt)}</option>
              ))}
            </select>

            <span className="hidden sm:block h-5 w-px bg-outline-variant/30" />

            <button className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
              <Icon name="download" size={14} />
              Export CSV
            </button>
          </div>

          {/* Table — desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-high/50 border-b border-outline-variant/10">
                  {["Account", "Industry / Region", "Freshness", "Confidence", "Primary Motion", "Analyst", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-on-surface-var/60 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-on-surface-var/50">
                      No accounts match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => (
                    <AccountRowGroup
                      key={account.id}
                      account={account}
                      deleteAccountId={deleteAccountId}
                      onDelete={setDeleteAccountId}
                      onCancel={() => setDeleteAccountId(null)}
                      onConfirm={handleDeleteConfirm}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden p-4 space-y-3">
            {filteredAccounts.length === 0 ? (
              <p className="text-center text-sm text-on-surface-var/50 py-8">No accounts match your filters.</p>
            ) : (
              filteredAccounts.map((account) => (
                <div key={account.id} className="space-y-0">
                  <AccountCard
                    account={account}
                    onDelete={setDeleteAccountId}
                  />
                  {deleteAccountId === account.id && (
                    <div className="bg-error/5 border border-error/20 rounded-xl p-3 mt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon name="warning" size={14} className="text-error flex-shrink-0" />
                        <span className="text-xs text-on-surface flex-1">
                          Delete <strong>{account.canonicalName}</strong>? Permanent.
                        </span>
                        <button
                          onClick={() => setDeleteAccountId(null)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-high text-on-surface"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteConfirm}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-error text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-outline-variant/10 bg-surface-high/20 flex items-center justify-between">
            <span className="text-xs text-on-surface-var/60">
              {filteredAccounts.length} account{filteredAccounts.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-1">
              {[1].map((page) => (
                <button
                  key={page}
                  className="h-7 w-7 rounded-md bg-primary text-surface text-xs font-semibold"
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Intake form */}
        <div className="space-y-4">
          <IntakeForm />

          {/* Intelligence drift placeholder */}
          <div className="bg-surface-low rounded-xl p-5">
            <SectionHeader
              title="Intelligence Drift"
              badge={<span className="eyebrow text-on-surface-var/50">30 days</span>}
            />
            <div className="h-32 flex items-center justify-center">
              <div className="text-center">
                <Icon name="show_chart" size={32} className="text-outline-variant/40" />
                <p className="text-xs text-on-surface-var/40 mt-2">Drift chart coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

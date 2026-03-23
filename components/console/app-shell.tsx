"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/lib/auth-client";
import { Icon } from "@/components/console/primitives";

// ─── Nav definition (no legacy link) ─────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/accounts",    match: "/accounts",    icon: "monitoring",         label: "Accounts Board" },
  { href: "/review-queue", match: "/review-queue", icon: "playlist_add_check", label: "Review Queue" }
];

const BOTTOM_NAV = [
  { href: "/accounts",    match: "/accounts",    icon: "monitoring",         label: "Accounts" },
  { href: "/review-queue", match: "/review-queue", icon: "playlist_add_check", label: "Queue" }
];

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell({
  pageLabel,
  title,
  children,
  topActions
}: {
  pageLabel: string;
  title: string;
  children: React.ReactNode;
  topActions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface">

      {/* ── Left sidebar (desktop) ───────────────────────────────────────── */}
      <aside className="group/sidebar fixed left-0 top-0 z-40 hidden md:flex h-screen w-20 hover:w-56 flex-col items-start bg-surface border-r border-white/5 py-5 gap-2 overflow-hidden transition-[width] duration-200 ease-in-out">

        {/* Logo mark */}
        <Link
          href="/accounts"
          className="mb-4 mx-auto group-hover/sidebar:mx-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-container text-surface hover:opacity-90 transition-all duration-200"
          title="Intelligence Observer"
        >
          <Icon name="radar" size={22} />
        </Link>

        {/* Nav items */}
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={
                active
                  ? "relative flex h-11 w-full items-center gap-3 px-4 rounded-xl bg-primary-container/20 text-primary border-r-2 border-primary transition-all duration-200"
                  : "flex h-11 w-full items-center gap-3 px-4 rounded-xl text-on-surface-var/60 hover:bg-surface-high hover:text-on-surface transition-all duration-200"
              }
            >
              <Icon name={item.icon} size={22} className="flex-shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 delay-75">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Settings */}
        <Link
          href="#"
          title="Settings"
          className="flex h-11 w-full items-center gap-3 px-4 rounded-xl text-on-surface-var/60 hover:bg-surface-high hover:text-on-surface transition-all duration-200"
        >
          <Icon name="settings" size={22} className="flex-shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 delay-75">
            Settings
          </span>
        </Link>

        {/* User avatar + sign out */}
        <div className="mt-2 w-full flex items-center gap-3 px-4">
          <div
            className="flex-shrink-0 h-9 w-9 rounded-full bg-primary-container/40 border border-primary/20 flex items-center justify-center text-primary text-xs font-semibold font-headline"
            title={user?.name ?? user?.email ?? "Signed in"}
          >
            {user?.name
              ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
              : user?.email
                ? user.email.slice(0, 2).toUpperCase()
                : "—"}
          </div>
          <div className="flex-1 min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-150 delay-75">
            <p className="text-xs font-medium text-on-surface truncate">{user?.name ?? user?.email ?? "User"}</p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-[10px] text-on-surface-var/50 hover:text-error transition-colors flex items-center gap-1 mt-0.5"
            >
              <Icon name="logout" size={12} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Top header ───────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-30 h-16 md:left-20 bg-surface/90 backdrop-blur border-b border-white/5 flex items-center px-5 md:px-8 gap-4 transition-[left] duration-200">
        {/* Mobile: logo */}
        <Link href="/accounts" className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-surface flex-shrink-0">
          <Icon name="radar" size={18} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="eyebrow text-primary/80 hidden sm:block">Intelligence Observer</span>
            <span className="hidden sm:block h-4 w-px bg-outline-variant/40" />
            <span className="eyebrow">{pageLabel}</span>
          </div>
          <h1 className="font-headline font-semibold text-on-surface text-base leading-tight truncate mt-0.5">{title}</h1>
        </div>

        {topActions && (
          <div className="flex items-center gap-2 flex-shrink-0">{topActions}</div>
        )}

        {/* Notification icon */}
        <button className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-lg text-on-surface-var/60 hover:bg-surface-high hover:text-on-surface transition-all">
          <Icon name="notifications" size={20} />
        </button>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="md:ml-20 pt-16 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* ── Bottom tab bar (mobile only) ──────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-surface/95 backdrop-blur border-t border-white/5 flex items-center justify-around px-2">
        {BOTTOM_NAV.map((item) => {
          const active = pathname.startsWith(item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "flex flex-col items-center gap-0.5 px-3 py-1 text-primary"
                  : "flex flex-col items-center gap-0.5 px-3 py-1 text-on-surface-var/50"
              }
            >
              <Icon name={item.icon} size={22} filled={active} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}

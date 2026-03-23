"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/console/primitives";

// ─── Dev role presets (only shown outside production) ─────────────────────────

const DEV_USERS = [
  { label: "Account Manager",  email: "am@internal.dev",      role: "am" },
  { label: "Customer Success",  email: "cs@internal.dev",      role: "cs" },
  { label: "Analyst",          email: "analyst@internal.dev",  role: "analyst" },
  { label: "Data Steward",     email: "steward@internal.dev",  role: "data_steward" },
  { label: "PMM",              email: "pmm@internal.dev",      role: "pmm" }
];

const IS_DEV = process.env.NODE_ENV !== "production";

// ─── Login form (client component) ───────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/accounts";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  function prefill(userEmail: string) {
    setEmail(userEmail);
    setPassword("demo1234");
    setError("");
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container mb-4">
            <Icon name="radar" size={28} className="text-surface" />
          </div>
          <h1 className="font-headline font-bold text-on-surface text-2xl">Intelligence Observer</h1>
          <p className="text-sm text-on-surface-var mt-1">Sign in to your workspace</p>
        </div>

        {/* Form card */}
        <div className="bg-surface-low rounded-xl p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="eyebrow block mb-1.5" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@internal.dev"
                required
                autoComplete="email"
                className="input-base w-full"
              />
            </div>

            <div>
              <label className="eyebrow block mb-1.5" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="input-base w-full"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-error text-sm bg-error/8 border border-error/15 rounded-lg px-3 py-2">
                <Icon name="error" size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-surface font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Icon name="sync" size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Icon name="login" size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Dev role quick-select (hidden in production) */}
        {IS_DEV && (
          <div className="mt-5 bg-surface-low rounded-xl p-4">
            <div className="eyebrow mb-3 text-warning/70">Dev quick-sign-in (not in production)</div>
            <div className="grid grid-cols-1 gap-1.5">
              {DEV_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => prefill(u.email)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-high transition-colors text-left"
                >
                  <span className="text-sm text-on-surface font-medium">{u.label}</span>
                  <span className="text-xs text-on-surface-var/60">{u.email}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-on-surface-var/40 mt-2">Password for all: demo1234</p>
          </div>
        )}

      </div>
    </div>
  );
}

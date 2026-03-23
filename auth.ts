/**
 * NextAuth v5 configuration — Credentials provider with role-aware sessions.
 *
 * Phase 1: Hard-coded user roster (5 users, one per role).
 * Phase 2: Swap USER_ROSTER for a DB lookup via lib/db.ts.
 *
 * Roles:
 *   am          — Account Manager: full workbench + approval access
 *   cs          — Customer Success: workbench read + review actions
 *   analyst     — Review decisions on recommendations
 *   data_steward — Profile corrections, source registry
 *   pmm         — Portfolio read-only + recommendation context
 */

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// ─── Role type ────────────────────────────────────────────────────────────────

export type UserRole = "am" | "cs" | "analyst" | "data_steward" | "pmm";

// ─── Module augmentation ──────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }
  interface User {
    role: UserRole;
  }
}

// ─── User roster (Phase 1 — replace with DB lookup in Phase 2) ───────────────

const USER_ROSTER: Array<{
  id: string;
  email: string;
  password: string; // plaintext for Phase 1 only — hash in Phase 2
  name: string;
  role: UserRole;
}> = [
  { id: "user-am",           email: "am@internal.dev",           password: "demo1234", name: "Jordan Diaz",    role: "am" },
  { id: "user-cs",           email: "cs@internal.dev",           password: "demo1234", name: "Priya Menon",    role: "cs" },
  { id: "user-analyst",      email: "analyst@internal.dev",      password: "demo1234", name: "Omar Rahman",    role: "analyst" },
  { id: "user-steward",      email: "steward@internal.dev",      password: "demo1234", name: "Amina Shah",     role: "data_steward" },
  { id: "user-pmm",          email: "pmm@internal.dev",          password: "demo1234", name: "Alex Torres",    role: "pmm" }
];

// ─── Auth config ──────────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Internal SSO",
      credentials: {
        email:    { label: "Email",    type: "email",    placeholder: "you@internal.dev" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email    = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = USER_ROSTER.find(
          (u) => u.email === email && u.password === password
        );

        if (!user) return null;

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          role:  user.role
        };
      }
    })
  ],

  session: { strategy: "jwt" },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
      }
      return session;
    }
  },

  pages: {
    signIn: "/login"
  }
});

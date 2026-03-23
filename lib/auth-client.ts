/**
 * Client-side auth utilities.
 *
 * Usage in client components:
 *   import { useCurrentUser, hasRole } from "@/lib/auth-client"
 *   const user = useCurrentUser()
 *   if (hasRole(user, ["am", "cs"])) { ... }
 */

"use client";

import { useSession } from "next-auth/react";
import type { UserRole } from "@/auth";

export function useCurrentUser() {
  const { data: session } = useSession();
  return session?.user ?? null;
}

export function hasRole(
  user: { role?: UserRole } | null,
  roles: UserRole[]
): boolean {
  if (!user?.role) return false;
  return roles.includes(user.role);
}

export { type UserRole };

/**
 * Route protection middleware — redirects unauthenticated visitors to /login.
 *
 * Protected routes: /accounts, /workbench, /recommendations, /review-queue
 * Public routes: /login, /api/auth
 */

import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  // Allow public routes
  const isPublic =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname === "/";

  if (!isPublic && !session) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/accounts/:path*",
    "/workbench/:path*",
    "/recommendations/:path*",
    "/review-queue/:path*",
    "/api/accounts/:path*",
    "/api/workbench/:path*",
    "/api/recommendations/:path*",
    "/api/review-queue/:path*",
    "/api/accounts-board/:path*"
  ]
};

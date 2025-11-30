import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { AUTH_SECRET } from "@/lib/auth-options";
import { siteRoutes } from "@/constants/site-routes";

const DASHBOARD_AGENT_PATHS = [
  siteRoutes.dashboard.root,
  siteRoutes.dashboard.application.root,
  siteRoutes.dashboard.application.new,
];

const DASHBOARD_STAFF_PATHS = [
  siteRoutes.dashboard.root,
  siteRoutes.dashboard.agents.root,
  siteRoutes.dashboard.applicationQueue.root,
];

const AUTH_PAGES = [
  siteRoutes.auth.login,
  siteRoutes.auth.register,
  siteRoutes.auth.signUp,
  siteRoutes.auth.signUpAlt,
] as const;

const normalizePath = (pathname: string) =>
  pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

const isProtectedPath = (pathname: string) =>
  pathname.startsWith(siteRoutes.dashboard.root);

const isAllowedPath = (pathname: string, role: string) => {
  const normalized = normalizePath(pathname);
  if (role === "admin") return true;
  if (role === "agent") {
    return DASHBOARD_AGENT_PATHS.some(
      (p) => normalized === p || normalized.startsWith(`${p}/`)
    );
  }
  if (role === "staff") {
    return DASHBOARD_STAFF_PATHS.some(
      (p) => normalized === p || normalized.startsWith(`${p}/`)
    );
  }
  return false;
};

const defaultRedirectForRole = (role: string) => {
  if (role === "agent") return siteRoutes.dashboard.root;
  if (role === "staff") return siteRoutes.dashboard.root;
  if (role === "admin") return siteRoutes.dashboard.root;
  return siteRoutes.home;
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: AUTH_SECRET,
  });

  console.log(token);

  if (
    token &&
    (AUTH_PAGES as readonly string[]).includes(normalizePath(pathname))
  ) {
    const redirectUrl = new URL(
      defaultRedirectForRole((token.role as string) ?? "admin"),
      request.url
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL(siteRoutes.auth.login, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token.role as string | undefined) ?? "admin";

  // Students cannot access dashboard
  if (role === "student") {
    const loginUrl = new URL(siteRoutes.auth.login, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isAllowedPath(pathname, role)) {
    // redirect to first allowed path for the role
    const fallback =
      role === "agent"
        ? DASHBOARD_AGENT_PATHS[0]
        : role === "staff"
        ? DASHBOARD_STAFF_PATHS[0]
        : siteRoutes.dashboard.root;
    const redirectUrl = new URL(fallback, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Next.js requires matcher entries to be static strings, so keep them literal while
  // routing logic above continues to rely on siteRoutes for comparisons.
  matcher: ["/dashboard/:path*", "/login", "/register", "/sign-up", "/signup"],
};

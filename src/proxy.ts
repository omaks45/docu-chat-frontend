import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pages anyone can visit without being logged in
const PUBLIC_ROUTES = ["/auth/register", "/auth/login",];
// Pages only for unauthenticated users (redirect logged-in users to dashboard)
const AUTH_ONLY_ROUTES = ["/auth/register", "/auth/login",];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasSession = request.cookies.has("refreshToken");

    // Already logged in — bounce away from login/register
    if (AUTH_ONLY_ROUTES.includes(pathname) && hasSession) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Not logged in — bounce to login
    if (!PUBLIC_ROUTES.includes(pathname) && !hasSession) {
        const loginUrl = new URL("/auth/login", request.url); // ← fix here too
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
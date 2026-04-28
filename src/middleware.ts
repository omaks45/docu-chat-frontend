import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];
const AUTH_ROUTES = ["/login", "/register"]; // redirect away if already logged in

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasSession = request.cookies.has("refreshToken");

    // Redirect logged-in users away from auth pages
    if (AUTH_ROUTES.includes(pathname) && hasSession) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect unauthenticated users to login
    if (!PUBLIC_ROUTES.includes(pathname) && !hasSession) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/workout",
  "/calendar",
  "/stats",
  "/group",
  "/posts",
  "/profile",
];

const protectedApiPaths = [
  "/api/workout",
  "/api/upload",
  "/api/calendar",
  "/api/stats",
  "/api/group",
  "/api/posts",
  "/api/user",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = protectedPaths.some((p) => pathname.startsWith(p));
  const isProtectedApi = protectedApiPaths.some((p) => pathname.startsWith(p));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workout/:path*",
    "/calendar/:path*",
    "/stats/:path*",
    "/group/:path*",
    "/posts/:path*",
    "/profile/:path*",
    "/api/workout/:path*",
    "/api/upload/:path*",
    "/api/calendar/:path*",
    "/api/stats/:path*",
    "/api/group/:path*",
    "/api/posts/:path*",
    "/api/user/:path*",
  ],
};

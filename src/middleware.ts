import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pages that always require authentication
const authRequiredPages = [
  "/profile",
  "/workout/new",
  "/posts/new",
  "/group/create",
];

// API routes that require auth even for GET
const authRequiredApiGet = [
  "/api/user",
  "/api/calendar",
  "/api/stats",
];

// API routes where only write (POST/PUT/DELETE) requires auth
const writeProtectedApi = [
  "/api/workout",
  "/api/posts",
  "/api/group",
  "/api/upload",
  "/api/feed",
];

function getToken(request: NextRequest) {
  return (
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const token = getToken(request);

  // Auth-required pages — redirect to login
  const isAuthPage = authRequiredPages.some((p) => pathname.startsWith(p));
  if (isAuthPage && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // API routes that always require auth (even GET)
  const isAuthApi = authRequiredApiGet.some((p) => pathname.startsWith(p));
  if (isAuthApi && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Write-protected APIs — GET is public, POST/PUT/DELETE require auth
  const isWriteApi = writeProtectedApi.some((p) => pathname.startsWith(p));
  if (isWriteApi && method !== "GET" && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/workout/new",
    "/posts/new",
    "/group/create",
    "/api/user/:path*",
    "/api/calendar/:path*",
    "/api/stats/:path*",
    "/api/workout/:path*",
    "/api/posts/:path*",
    "/api/group/:path*",
    "/api/upload/:path*",
    "/api/feed/:path*",
  ],
};
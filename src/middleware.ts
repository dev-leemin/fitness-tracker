export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/(main)/:path*", "/api/workout/:path*", "/api/upload/:path*", "/api/calendar/:path*", "/api/stats/:path*", "/api/group/:path*", "/api/posts/:path*"],
};

import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store — works per-instance (sufficient for edge/single-region deployments)
const rateLimitMap = new Map<string, RateLimitEntry>();

const LIMIT = 5;           // max requests per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  // Only rate-limit API routes
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  const now = Date.now();

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    // First request or window expired — start fresh
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (entry.count >= LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      {
        error: "Rate limit exceeded. You can run up to 5 scans per hour.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(LIMIT),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(entry.resetAt).toUTCString(),
        },
      }
    );
  }

  // Increment count
  entry.count += 1;
  rateLimitMap.set(ip, entry);

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(LIMIT));
  response.headers.set("X-RateLimit-Remaining", String(LIMIT - entry.count));
  response.headers.set("X-RateLimit-Reset", new Date(entry.resetAt).toUTCString());
  return response;
}

export const config = {
  matcher: "/api/:path*",
};

import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Rate limiter en memoria — ventana deslizante por IP
// NOTA: En producción serverless (Vercel) cada instancia tiene su propio
// mapa; para escala mayor usar Upstash Redis. Para un e-commerce pequeño
// esta protección es suficiente contra ataques dirigidos.
// ---------------------------------------------------------------------------
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getClientIp(req);

  // ── Protección brute-force: endpoint de login de NextAuth ──────────────
  // 10 intentos por minuto por IP antes de bloquear con 429
  if (
    (pathname.startsWith("/api/auth/callback") ||
      pathname.startsWith("/api/auth/signin")) &&
    req.method === "POST"
  ) {
    if (!checkRateLimit(`login:${ip}`, 10, 60_000)) {
      return new NextResponse(
        JSON.stringify({ error: "Demasiados intentos. Esperá 1 minuto." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  // ── Rate limit APIs públicas (stock y shipping) ─────────────────────────
  // 60 requests por minuto por IP
  if (
    pathname.startsWith("/api/stock") ||
    pathname.startsWith("/api/shipping")
  ) {
    if (!checkRateLimit(`api:${ip}`, 60, 60_000)) {
      return new NextResponse(
        JSON.stringify({ error: "Demasiadas solicitudes. Intentá más tarde." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  // ── Protección panel admin ───────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    const sessionCookie =
      req.cookies.get("authjs.session-token") ??
      req.cookies.get("__Secure-authjs.session-token") ??
      req.cookies.get("next-auth.session-token") ??
      req.cookies.get("__Secure-next-auth.session-token");

    const isLoggedIn = !!sessionCookie?.value;

    if (isLoginPage) {
      if (isLoggedIn) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/auth/callback/:path*",
    "/api/auth/signin/:path*",
    "/api/stock/:path*",
    "/api/shipping/:path*",
  ],
};

import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  // NextAuth v5 beta guarda la sesión en estas cookies
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

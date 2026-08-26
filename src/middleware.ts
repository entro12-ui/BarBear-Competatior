import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/auth-constants";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isLogin;
  const hasSession = Boolean(request.cookies.get(COOKIE_NAME)?.value);

  if (isAdminRoute && !hasSession) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

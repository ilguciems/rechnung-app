import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const timerCookie = request.cookies.get("timer-expires-at")?.value;
  const now = Date.now();

  if (timerCookie && parseInt(timerCookie, 10) < now) {
    const response = NextResponse.redirect(
      new URL("/sign-in?reason=session_expired", request.url),
    );

    response.cookies.delete("timer-expires-at");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

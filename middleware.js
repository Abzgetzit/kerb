import { NextResponse } from "next/server";
import { KERB_SESSION_COOKIE } from "./app/lib/kerb-session-cookie";

const canonicalHost = "kerbcar.co.uk";

export function middleware(request) {
  const requestHost = String(request.headers.get("host") || "")
    .split(":")[0]
    .toLowerCase();
  const pathname = request.nextUrl.pathname;

  if (
    process.env.VERCEL_ENV === "production" &&
    (requestHost === `www.${canonicalHost}` || requestHost.endsWith(".vercel.app"))
  ) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.protocol = "https:";
    canonicalUrl.hostname = canonicalHost;
    canonicalUrl.port = "";
    return NextResponse.redirect(canonicalUrl, 308);
  }

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(KERB_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-kerb-session-token", sessionCookie);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

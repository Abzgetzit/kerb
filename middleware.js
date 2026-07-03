import { NextResponse } from "next/server";
import { KERB_SESSION_COOKIE } from "./app/lib/kerb-session-cookie";

export function middleware(request) {
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
  matcher: ["/api/:path*"],
};

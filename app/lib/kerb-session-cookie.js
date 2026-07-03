import { NextResponse } from "next/server";

export const KERB_SESSION_COOKIE = "kerb_session";
export const KERB_SESSION_MARKER = "cookie-session";
export const KERB_SESSION_DAYS = 14;

export function createSessionExpiry(days = KERB_SESSION_DAYS) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function createJsonResponseWithSessionCookie(payload, sessionToken, expiresAt, init = {}) {
  const response = NextResponse.json(
    {
      ...payload,
      session_token: KERB_SESSION_MARKER,
    },
    init
  );

  response.cookies.set({
    name: KERB_SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });

  return response;
}

export function createJsonResponseClearingSessionCookie(payload = { success: true }, init = {}) {
  const response = NextResponse.json(payload, init);

  response.cookies.set({
    name: KERB_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

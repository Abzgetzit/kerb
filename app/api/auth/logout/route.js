import { createJsonResponseClearingSessionCookie } from "../../../lib/kerb-session-cookie";

export async function POST() {
  return createJsonResponseClearingSessionCookie({ success: true });
}

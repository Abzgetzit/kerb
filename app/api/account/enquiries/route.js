export const runtime = "nodejs";

import { POST as createEnquiry } from "../../enquiries/route";

export async function POST(request) {
  return createEnquiry(request);
}

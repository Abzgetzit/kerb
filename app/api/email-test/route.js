import { NextResponse } from "next/server";
import { sendKerbEmail } from "../../lib/kerb-email";

export const runtime = "nodejs";

function clean(value) {
  return String(value || "").trim();
}

export async function GET(request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const url = new URL(request.url);
  const suppliedPassword = clean(url.searchParams.get("admin_password"));
  const to = clean(url.searchParams.get("to")) || process.env.KERB_TEST_EMAIL;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is missing in Vercel." },
      { status: 500 }
    );
  }

  if (!suppliedPassword || suppliedPassword !== adminPassword) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  if (!to || !to.includes("@")) {
    return NextResponse.json(
      {
        error:
          "Add ?to=your@email.com to the URL, or set KERB_TEST_EMAIL in Vercel.",
      },
      { status: 400 }
    );
  }

  const result = await sendKerbEmail({
    to,
    subject: "Kerb email test",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px;">
        <h1 style="color:#0048ff;">Kerb email test</h1>
        <p>If this arrived, Resend is working on the live deployment.</p>
      </div>
    `,
  });

  return NextResponse.json({
    success: Boolean(result.sent),
    to,
    result,
    environment: {
      has_resend_api_key: Boolean(process.env.RESEND_API_KEY),
      has_kerb_from_email: Boolean(process.env.KERB_FROM_EMAIL),
      from_email_preview: process.env.KERB_FROM_EMAIL || "not set",
      has_next_public_site_url: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    },
  });
}

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.KERB_FROM_EMAIL || "Kerb <onboarding@resend.dev>";

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function clean(value) {
  return String(value || "").trim().toLowerCase();
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function createLoginEmailHtml(code) {
  return `
    <div style="font-family: Arial, sans-serif; background:#f6f8fc; padding:28px;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:18px; padding:30px; border:1px solid #e5eaf4;">
        <h1 style="margin:0 0 12px; color:#071126; font-size:28px;">Your Kerb login code</h1>

        <p style="margin:0 0 20px; color:#59657a; line-height:1.6;">
          Enter this code on Kerb to sign in to your account.
        </p>

        <div style="background:#eef3ff; border:1px solid #d7e4ff; border-radius:16px; padding:22px; text-align:center; margin:22px 0;">
          <div style="font-size:42px; font-weight:900; letter-spacing:8px; color:#0048ff;">
            ${code}
          </div>
        </div>

        <p style="margin:0; color:#59657a; line-height:1.6;">
          This code expires in 10 minutes. If you didn’t request this, you can ignore this email.
        </p>

        <p style="margin:24px 0 0; color:#7a8499; font-size:13px;">
          Thanks for using Kerb.
        </p>
      </div>
    </div>
  `;
}

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  if (!resend) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is missing in Vercel environment variables." },
      { status: 500 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const email = clean(body.email);

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase
    .from("kerb_login_codes")
    .update({ used: true })
    .eq("email", email)
    .eq("used", false);

  const { error: insertError } = await supabase
    .from("kerb_login_codes")
    .insert({
      email,
      code,
      expires_at: expiresAt,
      used: false,
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Your Kerb login code",
      html: createLoginEmailHtml(code),
    });
  } catch (error) {
    console.error("Kerb login email error:", error);

    return NextResponse.json(
      { error: error?.message || "Could not send login code." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Login code sent.",
  });
}

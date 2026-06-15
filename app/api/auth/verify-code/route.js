import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanCode(value) {
  return String(value || "").trim();
}

function createSessionToken() {
  return randomBytes(48).toString("hex");
}

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
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

  const email = cleanEmail(body.email);
  const code = cleanCode(body.code);

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  if (!code || code.length !== 6) {
    return NextResponse.json(
      { error: "Enter the 6-digit login code." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const { data: loginCode, error: codeError } = await supabase
    .from("kerb_login_codes")
    .select("*")
    .eq("email", email)
    .eq("code", code)
    .eq("used", false)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (codeError) {
    return NextResponse.json({ error: codeError.message }, { status: 500 });
  }

  if (!loginCode) {
    return NextResponse.json(
      { error: "Invalid or expired code." },
      { status: 401 }
    );
  }

  await supabase
    .from("kerb_login_codes")
    .update({ used: true })
    .eq("id", loginCode.id);

  const { data: existingAccount, error: existingAccountError } = await supabase
    .from("kerb_accounts")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existingAccountError) {
    return NextResponse.json(
      { error: existingAccountError.message },
      { status: 500 }
    );
  }

  let account = existingAccount;

  if (!account) {
    const { data: newAccount, error: newAccountError } = await supabase
      .from("kerb_accounts")
      .insert({
        email,
      })
      .select("*")
      .single();

    if (newAccountError) {
      return NextResponse.json(
        { error: newAccountError.message },
        { status: 500 }
      );
    }

    account = newAccount;
  }

  const sessionToken = createSessionToken();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const { error: sessionError } = await supabase
    .from("kerb_account_sessions")
    .insert({
      account_id: account.id,
      email,
      session_token: sessionToken,
      expires_at: expiresAt,
    });

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    account,
    session_token: sessionToken,
  });
}

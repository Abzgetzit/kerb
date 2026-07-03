import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  createJsonResponseWithSessionCookie,
  createSessionExpiry,
} from "../../../lib/kerb-session-cookie";
import { randomBytes } from "crypto";

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

async function createSession(account) {
  const sessionToken = createSessionToken();
  const expiresAt = createSessionExpiry();

  const { error } = await supabase.from("kerb_account_sessions").insert({
    account_id: account.id,
    email: account.email,
    session_token: sessionToken,
    expires_at: expiresAt,
  });

  if (error) throw new Error(error.message);

  return { sessionToken, expiresAt };
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
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = cleanEmail(body.email);
  const code = cleanCode(body.code);
  const password = String(body.password || "");
  const confirmPassword = String(body.confirm_password || "");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "Enter the 6-digit reset code." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
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
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 401 });
  }

  const { data: account, error: accountError } = await supabase
    .from("kerb_accounts")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (accountError) {
    return NextResponse.json({ error: accountError.message }, { status: 500 });
  }

  if (!account) {
    return NextResponse.json(
      { error: "No Kerb account exists with this email. Please create an account first." },
      { status: 404 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data: updatedAccount, error: updateError } = await supabase
    .from("kerb_accounts")
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", account.id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase
    .from("kerb_login_codes")
    .update({ used: true })
    .eq("id", loginCode.id);

  try {
    const { sessionToken, expiresAt } = await createSession(updatedAccount);

    return createJsonResponseWithSessionCookie(
      {
        success: true,
        account: {
          id: updatedAccount.id,
          email: updatedAccount.email,
          full_name: updatedAccount.full_name,
          phone: updatedAccount.phone,
          profile_photo_url: updatedAccount.profile_photo_url,
          default_show_seller_name: updatedAccount.default_show_seller_name,
          default_show_seller_phone: updatedAccount.default_show_seller_phone,
          created_at: updatedAccount.created_at,
        },
      },
      sessionToken,
      expiresAt
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Password changed, but sign-in could not be completed." },
      { status: 500 }
    );
  }
}

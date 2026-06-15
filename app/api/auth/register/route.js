import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

function clean(value) {
  return String(value || "").trim();
}

function cleanEmail(value) {
  return clean(value).toLowerCase();
}

function createSessionToken() {
  return randomBytes(48).toString("hex");
}

async function createSession(account) {
  const sessionToken = createSessionToken();

  const expiresAt = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabase.from("kerb_account_sessions").insert({
    account_id: account.id,
    email: account.email,
    session_token: sessionToken,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(error.message);
  }

  return sessionToken;
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

  const fullName = clean(body.full_name);
  const phone = clean(body.phone);
  const email = cleanEmail(body.email);
  const password = String(body.password || "");
  const confirmPassword = String(body.confirm_password || "");

  if (!fullName) {
    return NextResponse.json(
      { error: "Enter your full name." },
      { status: 400 }
    );
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  if (!phone) {
    return NextResponse.json(
      { error: "Enter your phone number." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match." },
      { status: 400 }
    );
  }

  const { data: existingAccount, error: existingError } = await supabase
    .from("kerb_accounts")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existingAccount) {
    return NextResponse.json(
      { error: "An account already exists with this email. Please sign in." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data: account, error: createError } = await supabase
    .from("kerb_accounts")
    .insert({
      full_name: fullName,
      phone,
      email,
      password_hash: passwordHash,
      email_verified: false,
      phone_verified: false,
    })
    .select("id, email, full_name, phone, created_at")
    .single();

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  try {
    const sessionToken = await createSession(account);

    return NextResponse.json({
      success: true,
      account,
      session_token: sessionToken,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Could not create session." },
      { status: 500 }
    );
  }
}

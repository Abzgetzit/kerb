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

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
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

  const email = cleanEmail(body.email);
  const password = String(body.password || "");

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  if (!password) {
    return NextResponse.json(
      { error: "Enter your password." },
      { status: 400 }
    );
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
      { error: "No account found with this email. Please create an account." },
      { status: 404 }
    );
  }

  if (!account.password_hash) {
    return NextResponse.json(
      {
        error:
          "This account does not have a password yet. Use email code login, then add a password later.",
      },
      { status: 400 }
    );
  }

  const passwordMatches = await bcrypt.compare(password, account.password_hash);

  if (!passwordMatches) {
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 }
    );
  }

  try {
    const sessionToken = await createSession(account);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        full_name: account.full_name,
        phone: account.phone,
        profile_photo_url: account.profile_photo_url,
        default_show_seller_name: account.default_show_seller_name,
        default_show_seller_phone: account.default_show_seller_phone,
        created_at: account.created_at,
      },
      session_token: sessionToken,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Could not create session." },
      { status: 500 }
    );
  }
}

import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

function cleanText(value) {
  return String(value || "").trim();
}

async function getSignedInAccount(request) {
  const token = cleanText(request.headers.get("x-kerb-session-token"));

  if (!token) {
    return { error: "Not logged in.", status: 401 };
  }

  const { data: session, error: sessionError } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError) {
    return { error: sessionError.message, status: 500 };
  }

  if (!session) {
    return { error: "Session expired. Please log in again.", status: 401 };
  }

  const { data: account, error: accountError } = await supabase
    .from("kerb_accounts")
    .select("*")
    .eq("id", session.account_id)
    .maybeSingle();

  if (accountError) {
    return { error: accountError.message, status: 500 };
  }

  if (!account) {
    return { error: "Account could not be found.", status: 404 };
  }

  return { session, account };
}

export async function PATCH(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  const signedIn = await getSignedInAccount(request);

  if (signedIn.error) {
    return NextResponse.json(
      { error: signedIn.error },
      { status: signedIn.status || 401 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const currentPassword = String(body.current_password || "");
  const newPassword = String(body.new_password || "");
  const confirmPassword = String(body.confirm_password || "");

  if (signedIn.account.password_hash) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Enter your current password." },
        { status: 400 }
      );
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      signedIn.account.password_hash
    );

    if (!currentPasswordMatches) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 }
      );
    }
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 }
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "New passwords do not match." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const { error } = await supabase
    .from("kerb_accounts")
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", signedIn.account.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Password updated.",
  });
}

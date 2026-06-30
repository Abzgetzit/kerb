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

function cleanBoolean(value, fallback = false) {
  if (value === true) return true;
  if (value === false) return false;

  const text = cleanText(value).toLowerCase();

  if (["true", "yes", "1", "on"].includes(text)) return true;
  if (["false", "no", "0", "off"].includes(text)) return false;

  return fallback;
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
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const fullName = cleanText(body.full_name);
  const phone = cleanText(body.phone);
  const defaultShowSellerName = cleanBoolean(
    body.default_show_seller_name,
    true
  );
  const defaultShowSellerPhone = cleanBoolean(
    body.default_show_seller_phone,
    false
  );

  if (!fullName) {
    return NextResponse.json(
      { error: "Enter your full name." },
      { status: 400 }
    );
  }

  if (fullName.length > 120) {
    return NextResponse.json(
      { error: "Please keep your name under 120 characters." },
      { status: 400 }
    );
  }

  if (phone.length > 40) {
    return NextResponse.json(
      { error: "Please keep your phone number under 40 characters." },
      { status: 400 }
    );
  }

  const { data: account, error } = await supabase
    .from("kerb_accounts")
    .update({
      full_name: fullName,
      phone: phone || null,
      default_show_seller_name: defaultShowSellerName,
      default_show_seller_phone: defaultShowSellerPhone && Boolean(phone),
      updated_at: new Date().toISOString(),
    })
    .eq("id", signedIn.account.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    account,
  });
}

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

function getToken(request) {
  const headerToken = request.headers.get("x-kerb-session-token");
  return String(headerToken || "").trim();
}

export async function GET(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  const token = getToken(request);

  if (!token) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const now = new Date().toISOString();

  const { data: session, error: sessionError } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", now)
    .maybeSingle();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json(
      { error: "Session expired. Please log in again." },
      { status: 401 }
    );
  }

  const email = String(session.email || "").toLowerCase();

  const { data: account, error: accountError } = await supabase
    .from("kerb_accounts")
    .select("*")
    .eq("id", session.account_id)
    .maybeSingle();

  if (accountError) {
    return NextResponse.json({ error: accountError.message }, { status: 500 });
  }

  const { data: sentEnquiries, error: sentError } = await supabase
    .from("kerb_enquiries")
    .select("*")
    .ilike("buyer_email", email)
    .order("created_at", { ascending: false });

  if (sentError) {
    return NextResponse.json({ error: sentError.message }, { status: 500 });
  }

  const { data: receivedEnquiries, error: receivedError } = await supabase
    .from("kerb_enquiries")
    .select("*")
    .ilike("seller_email", email)
    .order("created_at", { ascending: false });

  if (receivedError) {
    return NextResponse.json({ error: receivedError.message }, { status: 500 });
  }

  const { data: myListings, error: listingsError } = await supabase
    .from("kerb_listings")
    .select("*")
    .ilike("seller_email", email)
    .order("created_at", { ascending: false });

  if (listingsError) {
    return NextResponse.json({ error: listingsError.message }, { status: 500 });
  }

  return NextResponse.json({
    account,
    email,
    sent_enquiries: sentEnquiries || [],
    received_enquiries: receivedEnquiries || [],
    my_listings: myListings || [],
  });
}

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

function normaliseEmail(value) {
  return cleanText(value).toLowerCase();
}

async function getSession(request) {
  const token = cleanText(request.headers.get("x-kerb-session-token"));

  if (!token || !supabase) return null;

  const { data } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  return data || null;
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

  const listingId = cleanText(body?.listing_id);
  const reason = cleanText(body?.reason);
  const details = cleanText(body?.details);
  const session = await getSession(request);
  const reporterEmail =
    normaliseEmail(session?.email) || normaliseEmail(body?.reporter_email);

  if (!listingId) {
    return NextResponse.json(
      { error: "Listing id is required." },
      { status: 400 }
    );
  }

  if (!reason) {
    return NextResponse.json(
      { error: "Please choose a reason." },
      { status: 400 }
    );
  }

  if (details.length > 1200) {
    return NextResponse.json(
      { error: "Please keep the report under 1,200 characters." },
      { status: 400 }
    );
  }

  const { data: listing, error: listingError } = await supabase
    .from("kerb_listings")
    .select("id")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    return NextResponse.json({ error: listingError.message }, { status: 500 });
  }

  if (!listing) {
    return NextResponse.json(
      { error: "Listing could not be found." },
      { status: 404 }
    );
  }

  const { data: report, error } = await supabase
    .from("kerb_listing_reports")
    .insert({
      listing_id: listingId,
      reporter_email: reporterEmail || null,
      reason,
      details: details || null,
      status: "new",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    report,
  });
}

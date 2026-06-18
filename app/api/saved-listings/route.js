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

function getToken(request) {
  return cleanText(request.headers.get("x-kerb-session-token"));
}

async function getSession(request) {
  const token = getToken(request);

  if (!token) return { error: "Not logged in.", status: 401 };

  const now = new Date().toISOString();

  const { data: session, error } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", now)
    .maybeSingle();

  if (error) return { error: error.message, status: 500 };
  if (!session) {
    return { error: "Session expired. Please log in again.", status: 401 };
  }

  return { session };
}

async function parseListingId(request) {
  try {
    const body = await request.json();
    return cleanText(body.listing_id);
  } catch {
    return "";
  }
}

export async function GET(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  const sessionResult = await getSession(request);

  if (sessionResult.error) {
    return NextResponse.json(
      { error: sessionResult.error },
      { status: sessionResult.status }
    );
  }

  const accountId = cleanText(sessionResult.session.account_id);
  const email = normaliseEmail(sessionResult.session.email);

  const { data: savedRows, error: savedError } = await supabase
    .from("kerb_saved_listings")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (savedError) {
    return NextResponse.json({ error: savedError.message }, { status: 500 });
  }

  const listingIds = [...new Set((savedRows || []).map((row) => row.listing_id))];

  let listings = [];

  if (listingIds.length > 0) {
    const { data, error } = await supabase
      .from("kerb_listings")
      .select("*")
      .in("id", listingIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    listings = data || [];
  }

  const listingsById = new Map(
    listings.map((listing) => [String(listing.id), listing])
  );

  const savedListings = (savedRows || [])
    .map((row) => {
      const listing = listingsById.get(String(row.listing_id));

      if (!listing) return null;

      return {
        ...listing,
        saved_at: row.created_at,
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    success: true,
    account_email: email,
    saved_listing_ids: listingIds,
    saved_listings: savedListings,
  });
}

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  const sessionResult = await getSession(request);

  if (sessionResult.error) {
    return NextResponse.json(
      { error: sessionResult.error },
      { status: sessionResult.status }
    );
  }

  const listingId = await parseListingId(request);

  if (!listingId) {
    return NextResponse.json({ error: "Missing listing ID." }, { status: 400 });
  }

  const accountId = cleanText(sessionResult.session.account_id);
  const email = normaliseEmail(sessionResult.session.email);

  const { data, error } = await supabase
    .from("kerb_saved_listings")
    .upsert(
      {
        account_id: accountId,
        account_email: email,
        listing_id: listingId,
      },
      {
        onConflict: "account_id,listing_id",
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    saved: true,
    saved_listing: data,
  });
}

export async function DELETE(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  const sessionResult = await getSession(request);

  if (sessionResult.error) {
    return NextResponse.json(
      { error: sessionResult.error },
      { status: sessionResult.status }
    );
  }

  const listingId = await parseListingId(request);

  if (!listingId) {
    return NextResponse.json({ error: "Missing listing ID." }, { status: 400 });
  }

  const accountId = cleanText(sessionResult.session.account_id);

  const { error } = await supabase
    .from("kerb_saved_listings")
    .delete()
    .eq("account_id", accountId)
    .eq("listing_id", listingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    saved: false,
  });
}

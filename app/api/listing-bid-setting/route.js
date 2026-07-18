import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value) {
  return String(value || "").trim();
}

function normaliseEmail(value) {
  return clean(value).toLowerCase();
}

function cleanBoolean(value) {
  if (value === true || value === false) return value;
  const text = clean(value).toLowerCase();
  return text === "true" || text === "1" || text === "yes" || text === "on";
}

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getSignedInAccount(supabase, request) {
  const token = clean(request.headers.get("x-kerb-session-token"));
  if (!token) return { error: "Sign in required.", status: 401 };

  const { data: session, error: sessionError } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError) return { error: sessionError.message, status: 500 };
  if (!session) return { error: "Session expired. Please sign in again.", status: 401 };

  return {
    accountId: clean(session.account_id),
    email: normaliseEmail(session.email),
  };
}

export async function POST(request) {
  const supabase = getClient();
  if (!supabase) {
    return Response.json({ error: "Supabase server client is not configured." }, { status: 500 });
  }

  const signedIn = await getSignedInAccount(supabase, request);
  if (signedIn.error) {
    return Response.json({ error: signedIn.error }, { status: signedIn.status || 401 });
  }

  const body = await request.json().catch(() => ({}));
  const listingId = clean(body.listing_id || body.listingId);
  const acceptBids = cleanBoolean(body.accept_bids ?? body.acceptBids);

  if (!listingId) {
    return Response.json({ error: "Listing ID is required." }, { status: 400 });
  }

  const { data: listing, error: listingError } = await supabase
    .from("kerb_listings")
    .select("id, account_id, account_email, seller_email")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    return Response.json({ error: listingError.message }, { status: 400 });
  }

  if (!listing) {
    return Response.json({ error: "Listing not found." }, { status: 404 });
  }

  const ownsByAccount =
    signedIn.accountId && clean(listing.account_id) === signedIn.accountId;
  const listingEmail = normaliseEmail(listing.account_email || listing.seller_email);
  const ownsByEmail = signedIn.email && listingEmail === signedIn.email;

  if (!ownsByAccount && !ownsByEmail) {
    return Response.json({ error: "You can only change your own listing." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("kerb_listings")
    .update({ accept_bids: acceptBids })
    .eq("id", listingId)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true, listing: data });
}

import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value) {
  return String(value || "").trim();
}

function normaliseEmail(value) {
  return clean(value).toLowerCase();
}

function cleanAmount(value) {
  const amount = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? Math.round(amount) : 0;
}

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getListing(supabase, listingId) {
  const { data, error } = await supabase
    .from("kerb_listings")
    .select("*")
    .eq("id", listingId)
    .eq("status", "approved")
    .eq("accept_bids", true)
    .maybeSingle();

  return { listing: data || null, error };
}

async function getSignedInAccount(supabase, request, required = true) {
  const token = clean(request.headers.get("x-kerb-session-token"));
  if (!token) {
    return required ? { error: "Sign in to submit a bid.", status: 401 } : { accountId: "", email: "" };
  }

  const { data: session, error: sessionError } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError) return { error: sessionError.message, status: 500 };
  if (!session) return required ? { error: "Your session has expired. Sign in again.", status: 401 } : { accountId: "", email: "" };

  const { data: account, error: accountError } = await supabase
    .from("kerb_accounts")
    .select("*")
    .eq("id", session.account_id)
    .maybeSingle();

  if (accountError) return { error: accountError.message, status: 500 };

  const email = normaliseEmail(account?.email || session.email);
  const name = clean(account?.full_name || account?.name) || (email ? email.split("@")[0] : "Buyer");

  return {
    session,
    account,
    accountId: clean(account?.id || session.account_id),
    email,
    name,
  };
}

function isListingOwner(listing, account) {
  const ownerAccountId = clean(listing?.account_id);
  const ownerEmail = normaliseEmail(listing?.account_email || listing?.seller_email);
  return Boolean(
    (ownerAccountId && account?.accountId && ownerAccountId === account.accountId) ||
      (ownerEmail && account?.email && ownerEmail === account.email)
  );
}

async function getBids(supabase, listingId, includeContacts = false) {
  const { data, error } = await supabase
    .from("kerb_listing_bids")
    .select("id, amount, created_at, bidder_account_id, bidder_email, bidder_name")
    .eq("listing_id", String(listingId))
    .eq("status", "active")
    .order("amount", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) return { bids: [], error };

  let phoneByAccountId = new Map();
  if (includeContacts) {
    const accountIds = [...new Set((data || []).map((bid) => clean(bid.bidder_account_id)).filter(Boolean))];
    if (accountIds.length) {
      const { data: accounts } = await supabase
        .from("kerb_accounts")
        .select("id, phone")
        .in("id", accountIds);
      phoneByAccountId = new Map((accounts || []).map((account) => [String(account.id), clean(account.phone)]));
    }
  }

  return {
    bids: (data || []).map((bid) => ({
      id: bid.id,
      amount: Number(bid.amount || 0),
      created_at: bid.created_at,
      ...(includeContacts
        ? {
            bidder_name: clean(bid.bidder_name) || "Buyer",
            bidder_email: clean(bid.bidder_email),
            bidder_phone: phoneByAccountId.get(clean(bid.bidder_account_id)) || "",
          }
        : {}),
    })),
    error: null,
  };
}

export async function GET(request) {
  const supabase = getClient();
  if (!supabase) return Response.json({ error: "Supabase server client is not configured." }, { status: 500 });

  const url = new URL(request.url);
  const listingId = clean(url.searchParams.get("listingId"));
  if (!listingId) return Response.json({ error: "Listing ID is required." }, { status: 400 });

  const { listing, error: listingError } = await getListing(supabase, listingId);
  if (listingError) return Response.json({ error: listingError.message }, { status: 400 });
  if (!listing) return Response.json({ error: "This car is not open to bids." }, { status: 404 });

  const signedIn = await getSignedInAccount(supabase, request, false);
  const seller_view = !signedIn.error && isListingOwner(listing, signedIn);
  const { bids, error } = await getBids(supabase, listingId, seller_view);
  if (error) return Response.json({ error: error.message }, { status: 400 });

  return Response.json({ bids, highest_bid: bids[0]?.amount || 0, bid_count: bids.length, seller_view });
}

export async function POST(request) {
  const supabase = getClient();
  if (!supabase) return Response.json({ error: "Supabase server client is not configured." }, { status: 500 });

  const signedIn = await getSignedInAccount(supabase, request, true);
  if (signedIn.error) return Response.json({ error: signedIn.error }, { status: signedIn.status || 401 });

  const body = await request.json().catch(() => ({}));
  const listingId = clean(body.listing_id || body.listingId);
  const amount = cleanAmount(body.amount);

  if (!listingId) return Response.json({ error: "Listing ID is required." }, { status: 400 });
  if (amount < 1) return Response.json({ error: "Enter a valid bid amount." }, { status: 400 });
  if (amount > 10000000) return Response.json({ error: "The bid amount is too high." }, { status: 400 });

  const { listing, error: listingError } = await getListing(supabase, listingId);
  if (listingError) return Response.json({ error: listingError.message }, { status: 400 });
  if (!listing) return Response.json({ error: "This car is not open to bids." }, { status: 404 });
  if (isListingOwner(listing, signedIn)) return Response.json({ error: "You cannot bid on your own listing." }, { status: 400 });

  const { error: insertError } = await supabase.from("kerb_listing_bids").insert({
    listing_id: String(listingId),
    bidder_account_id: signedIn.accountId || null,
    bidder_email: signedIn.email || null,
    bidder_name: signedIn.name || null,
    amount,
    status: "active",
  });

  if (insertError) return Response.json({ error: insertError.message }, { status: 400 });

  const { bids, error } = await getBids(supabase, listingId, false);
  if (error) return Response.json({ error: error.message }, { status: 400 });

  return Response.json({ success: true, bids, highest_bid: bids[0]?.amount || amount, bid_count: bids.length });
}

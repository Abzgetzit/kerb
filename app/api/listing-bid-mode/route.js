import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function clean(value) {
  return String(value || "").trim();
}

async function getAccount(supabase, request) {
  const token = clean(request.headers.get("x-kerb-session-token"));
  if (!token) return null;

  const { data: session } = await supabase
    .from("kerb_account_sessions")
    .select("account_id,email")
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  return session || null;
}

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json({ error: "Missing Supabase environment variables." }, { status: 500 });
    }

    const body = await request.json();
    const listingId = clean(body?.listing_id);
    const acceptBids = body?.accept_bids === true;

    if (!listingId) {
      return Response.json({ error: "Listing ID is required." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const session = await getAccount(supabase, request);
    if (!session) {
      return Response.json({ error: "Sign in required." }, { status: 401 });
    }

    let query = supabase
      .from("kerb_listings")
      .update({ accept_bids: acceptBids })
      .eq("id", listingId);

    if (session.account_id) {
      query = query.eq("account_id", session.account_id);
    } else if (session.email) {
      query = query.eq("account_email", String(session.email).toLowerCase());
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return Response.json({ error: "Listing not found or you do not own it." }, { status: 404 });
    }

    return Response.json({ success: true, listing: data });
  } catch (error) {
    return Response.json({ error: error.message || "Could not update bid listing mode." }, { status: 500 });
  }
}

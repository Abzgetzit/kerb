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

function getRequestIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    ""
  );
}

function getResultRow(data) {
  if (Array.isArray(data)) return data[0] || null;
  return data || null;
}

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  let body = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const listingId = cleanText(body.listing_id || body.listingId);

  if (!listingId) {
    return NextResponse.json(
      { error: "Missing listing_id." },
      { status: 400 }
    );
  }

  const viewerEmail = cleanText(body.viewer_email).toLowerCase() || null;
  const viewerUserAgent = cleanText(request.headers.get("user-agent")) || null;
  const viewerIp = getRequestIp(request) || null;

  // Preferred path: one atomic database function call.
  // This guarantees every request increments the counter by 1, including refreshes.
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "kerb_record_listing_view",
    {
      p_listing_id: listingId,
      p_viewer_email: viewerEmail,
      p_viewer_ip: viewerIp,
      p_user_agent: viewerUserAgent,
    }
  );

  if (!rpcError) {
    const row = getResultRow(rpcData);

    return NextResponse.json({
      success: true,
      counted: true,
      view_count: Number(row?.view_count || 0),
      last_viewed_at: row?.last_viewed_at || null,
    });
  }

  console.warn("Kerb view RPC unavailable, using fallback:", rpcError.message);

  // Fallback path: still counts views, even if the SQL function has not been added yet.
  const { data: listing, error: listingError } = await supabase
    .from("kerb_listings")
    .select("id, view_count")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    return NextResponse.json({ error: listingError.message }, { status: 500 });
  }

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const nextViewCount = Number(listing.view_count || 0) + 1;

  const { error: eventError } = await supabase
    .from("kerb_listing_view_events")
    .insert({
      listing_id: listingId,
      viewer_email: viewerEmail,
      viewer_ip: viewerIp,
      user_agent: viewerUserAgent,
    });

  if (eventError) {
    console.warn("Kerb view event could not be saved:", eventError.message);
  }

  const { data: updatedListing, error: updateError } = await supabase
    .from("kerb_listings")
    .update({
      view_count: nextViewCount,
      last_viewed_at: now,
    })
    .eq("id", listingId)
    .select("view_count, last_viewed_at")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    counted: true,
    view_count: Number(updatedListing?.view_count || nextViewCount),
    last_viewed_at: updatedListing?.last_viewed_at || now,
  });
}

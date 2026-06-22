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

  if (!listingId) {
    return NextResponse.json(
      { error: "Listing ID is required." },
      { status: 400 }
    );
  }

  const { data: listing, error: listingError } = await supabase
    .from("kerb_listings")
    .select("id, view_count, status")
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

  if (String(listing.status || "").toLowerCase() !== "approved") {
    return NextResponse.json({
      success: true,
      skipped: true,
      view_count: listing.view_count || 0,
    });
  }

  const nextViewCount = Number(listing.view_count || 0) + 1;

  const { data: updatedListing, error: updateError } = await supabase
    .from("kerb_listings")
    .update({
      view_count: nextViewCount,
      last_viewed_at: new Date().toISOString(),
    })
    .eq("id", listingId)
    .select("id, view_count, last_viewed_at")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    view_count: updatedListing.view_count || nextViewCount,
    last_viewed_at: updatedListing.last_viewed_at,
  });
}

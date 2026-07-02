import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function noStoreJson(body, init = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      ...(init.headers || {}),
    },
  });
}

async function getListingViewAnalytics(listingId, fallbackViewCount = 0) {
  const nowMs = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayStartMs = todayStart.getTime();
  const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgoMs = nowMs - 14 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgoMs = nowMs - 30 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = new Date(thirtyDaysAgoMs).toISOString();

  const { data, error } = await supabase
    .from("kerb_listing_view_events")
    .select("created_at")
    .eq("listing_id", listingId)
    .gte("created_at", thirtyDaysAgo);

  if (error) {
    console.warn("Kerb recent view analytics could not be loaded:", error.message);

    return {
      view_count: Number(fallbackViewCount || 0),
      views_today: 0,
      views_last_7_days: 0,
      views_last_14_days: 0,
      views_last_30_days: 0,
    };
  }

  return (data || []).reduce(
    (analytics, row) => {
      const createdAt = row.created_at ? new Date(row.created_at) : null;

      if (!createdAt || Number.isNaN(createdAt.getTime())) {
        return analytics;
      }

      const createdAtMs = createdAt.getTime();

      analytics.views_last_30_days += 1;

      if (createdAtMs >= todayStartMs) {
        analytics.views_today += 1;
      }

      if (createdAtMs >= sevenDaysAgoMs) {
        analytics.views_last_7_days += 1;
      }

      if (createdAtMs >= fourteenDaysAgoMs) {
        analytics.views_last_14_days += 1;
      }

      return analytics;
    },
    {
      view_count: Number(fallbackViewCount || 0),
      views_today: 0,
      views_last_7_days: 0,
      views_last_14_days: 0,
      views_last_30_days: 0,
    }
  );
}

export async function POST(request) {
  if (!supabase) {
    return noStoreJson(
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
    return noStoreJson({ error: "Missing listing_id." }, { status: 400 });
  }

  const viewerEmail = cleanText(body.viewer_email).toLowerCase() || null;
  const viewerUserAgent = cleanText(request.headers.get("user-agent")) || null;
  const viewerIp = getRequestIp(request) || null;
  const now = new Date().toISOString();

  const { data: listing, error: listingError } = await supabase
    .from("kerb_listings")
    .select("id, view_count")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    return noStoreJson({ error: listingError.message }, { status: 500 });
  }

  if (!listing) {
    return noStoreJson({ error: "Listing not found." }, { status: 404 });
  }

  // Important: do NOT call the old Supabase RPC here.
  // The old function was incrementing lifetime views but not reliably inserting
  // event rows, so Today / 14 days stayed stuck. This route writes the event row
  // directly every single time the listing page loads.
  const { error: eventError } = await supabase
    .from("kerb_listing_view_events")
    .insert({
      listing_id: listingId,
      viewer_email: viewerEmail,
      viewer_ip: viewerIp,
      user_agent: viewerUserAgent,
      created_at: now,
    });

  if (eventError) {
    console.warn("Kerb view event could not be saved:", eventError.message);
  }

  const nextViewCount = Number(listing.view_count || 0) + 1;

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
    return noStoreJson({ error: updateError.message }, { status: 500 });
  }

  const viewCount = Number(updatedListing?.view_count || nextViewCount);
  const analytics = await getListingViewAnalytics(listingId, viewCount);

  return noStoreJson({
    success: true,
    counted: true,
    event_inserted: !eventError,
    event_error: eventError?.message || "",
    view_count: viewCount,
    last_viewed_at: updatedListing?.last_viewed_at || now,
    analytics,
    views_today: analytics.views_today,
    views_last_7_days: analytics.views_last_7_days,
    views_last_14_days: analytics.views_last_14_days,
    views_last_30_days: analytics.views_last_30_days,
  });
}

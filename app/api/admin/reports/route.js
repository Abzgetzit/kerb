import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

const VALID_REPORT_STATUSES = ["new", "reviewing", "actioned", "dismissed"];

function checkAdmin(request) {
  const suppliedPassword = request.headers.get("x-admin-password");

  if (!adminPassword) {
    return "ADMIN_PASSWORD is missing in Vercel environment variables.";
  }

  if (!supabase) {
    return "Supabase admin client is not configured.";
  }

  if (!suppliedPassword || suppliedPassword !== adminPassword) {
    return "Unauthorised.";
  }

  return "";
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanStatus(value) {
  const status = cleanText(value).toLowerCase();

  return VALID_REPORT_STATUSES.includes(status) ? status : "new";
}

function cleanAction(value) {
  return cleanText(value).toLowerCase();
}

function getListingTitle(listing) {
  if (!listing) return "Listing not found";
  if (listing.title) return listing.title;

  return (
    [listing.year, listing.make, listing.model, listing.model_detail]
      .filter(Boolean)
      .join(" ") || "Untitled listing"
  );
}

async function attachListings(reports) {
  const listingIds = [
    ...new Set((reports || []).map((report) => report.listing_id).filter(Boolean)),
  ];

  if (listingIds.length === 0) return reports || [];

  const { data: listings, error } = await supabase
    .from("kerb_listings")
    .select("*")
    .in("id", listingIds);

  if (error) {
    throw new Error(error.message);
  }

  const listingsById = new Map(
    (listings || []).map((listing) => [String(listing.id), listing])
  );

  return (reports || []).map((report) => {
    const listing = listingsById.get(String(report.listing_id)) || null;

    return {
      ...report,
      listing,
      listing_title: getListingTitle(listing),
    };
  });
}

export async function GET(request) {
  const authError = checkAdmin(request);

  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = cleanText(searchParams.get("status")).toLowerCase();

  let query = supabase
    .from("kerb_listing_reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", cleanStatus(status));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const reports = await attachListings(data || []);

    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Could not load report listings." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const authError = checkAdmin(request);

  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = cleanText(body?.id);
  const action = cleanAction(body?.action);

  if (!id) {
    return NextResponse.json({ error: "Report id is required." }, { status: 400 });
  }

  const { data: existingReport, error: existingError } = await supabase
    .from("kerb_listing_reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (!existingReport) {
    return NextResponse.json({ error: "Report could not be found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  let updatePayload = {};
  let updatedListing = null;

  if (action === "dismiss") {
    updatePayload = {
      status: "dismissed",
      resolved_at: now,
      admin_note: cleanText(body?.admin_note) || null,
    };
  } else if (action === "review") {
    updatePayload = {
      status: "reviewing",
      admin_note: cleanText(body?.admin_note) || existingReport.admin_note || null,
    };
  } else if (action === "actioned") {
    updatePayload = {
      status: "actioned",
      actioned_at: now,
      resolved_at: now,
      admin_note: cleanText(body?.admin_note) || existingReport.admin_note || null,
    };
  } else if (action === "remove-listing") {
    if (!existingReport.listing_id) {
      return NextResponse.json(
        { error: "This report is not linked to a listing." },
        { status: 400 }
      );
    }

    const moderationReason =
      cleanText(body?.moderation_reason) || "Reported listing removed";
    const moderationNote =
      cleanText(body?.moderation_note) ||
      `Removed after report: ${existingReport.reason || "Reported listing"}`;

    const { data: listing, error: listingError } = await supabase
      .from("kerb_listings")
      .update({
        status: "rejected",
        moderation_reason: moderationReason.slice(0, 160),
        moderation_note: moderationNote.slice(0, 800),
        sold_at: null,
      })
      .eq("id", existingReport.listing_id)
      .select("*")
      .single();

    if (listingError) {
      return NextResponse.json({ error: listingError.message }, { status: 500 });
    }

    updatedListing = listing;
    updatePayload = {
      status: "actioned",
      actioned_at: now,
      resolved_at: now,
      admin_note: moderationNote.slice(0, 800),
    };
  } else {
    const status = cleanStatus(body?.status);
    updatePayload = {
      status,
      admin_note: cleanText(body?.admin_note) || existingReport.admin_note || null,
      resolved_at: ["actioned", "dismissed"].includes(status) ? now : null,
      actioned_at: status === "actioned" ? now : existingReport.actioned_at || null,
    };
  }

  const { data: report, error } = await supabase
    .from("kerb_listing_reports")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const [reportWithListing] = await attachListings([report]);

  return NextResponse.json({
    success: true,
    report: reportWithListing,
    listing: updatedListing,
  });
}

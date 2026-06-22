import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  createListingLiveEmail,
  createListingRejectedEmail,
  getListingTitle,
  getSiteUrl,
  sendKerbEmail,
} from "../../../lib/kerb-email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

const VALID_STATUSES = ["pending", "approved", "sold", "rejected"];

function checkAdmin(request) {
  const suppliedPassword = request.headers.get("x-admin-password");

  if (!adminPassword) {
    return "ADMIN_PASSWORD is missing in Vercel environment variables.";
  }

  if (!suppliedPassword || suppliedPassword !== adminPassword) {
    return "Unauthorised.";
  }

  if (!supabase) {
    return "Supabase admin client is not configured.";
  }

  return "";
}

function cleanStatus(status) {
  return String(status || "pending").trim().toLowerCase();
}

function cleanText(value) {
  return String(value || "").trim();
}

export async function GET(request) {
  const authError = checkAdmin(request);

  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("kerb_listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listings: data || [] });
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
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const id = body?.id;
  const status = cleanStatus(body?.status);
  const moderationReason = cleanText(body?.moderation_reason);
  const moderationNote = cleanText(body?.moderation_note);

  if (!id) {
    return NextResponse.json(
      { error: "Listing id is required." },
      { status: 400 }
    );
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid listing status." },
      { status: 400 }
    );
  }

  const { data: existingListing, error: existingListingError } = await supabase
    .from("kerb_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (existingListingError) {
    return NextResponse.json(
      { error: existingListingError.message },
      { status: 500 }
    );
  }

  const updates = {
    status,
    sold_at: status === "sold" ? new Date().toISOString() : null,
    moderation_reason: moderationReason || null,
    moderation_note: moderationNote || null,
    moderated_at: new Date().toISOString(),
    moderated_by: "admin",
  };

  const { data, error } = await supabase
    .from("kerb_listings")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let liveEmail = null;
  let rejectedEmail = null;

  if (status === "approved" && existingListing?.status !== "approved") {
    const siteUrl = getSiteUrl(request);

    liveEmail = await sendKerbEmail({
      to: data.seller_email || data.account_email,
      subject: `Your ${getListingTitle(data)} listing is now live`,
      html: createListingLiveEmail({
        listing: data,
        siteUrl,
      }),
    });
  }

  if (status === "rejected" && existingListing?.status !== "rejected") {
    const siteUrl = getSiteUrl(request);

    rejectedEmail = await sendKerbEmail({
      to: data.seller_email || data.account_email,
      subject: `Your ${getListingTitle(data)} listing needs changes`,
      html: createListingRejectedEmail({
        listing: data,
        siteUrl,
        reason: moderationReason || "Needs changes",
        note: moderationNote,
      }),
    });
  }

  return NextResponse.json({
    success: true,
    listing: data,
    emails: {
      listing_live: liveEmail,
      listing_rejected: rejectedEmail,
    },
  });
}

export async function DELETE(request) {
  const authError = checkAdmin(request);

  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
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

  const id = body?.id;

  if (!id) {
    return NextResponse.json(
      { error: "Listing id is required." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("kerb_listings")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true, listing: data });
}

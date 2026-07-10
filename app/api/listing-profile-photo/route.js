import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

function cleanText(value) {
  return String(value || "").trim();
}

function normaliseEmail(value) {
  return cleanText(value).toLowerCase();
}

async function findAccountByListing(listing) {
  if (!supabase || !listing) return null;

  const accountId = cleanText(listing.account_id || listing.seller_account_id);

  if (accountId) {
    const { data } = await supabase
      .from("kerb_accounts")
      .select("id, full_name, name, profile_photo_url")
      .eq("id", accountId)
      .maybeSingle();

    if (data) return data;
  }

  const email = normaliseEmail(listing.account_email || listing.seller_email);

  if (!email) return null;

  const { data } = await supabase
    .from("kerb_accounts")
    .select("id, full_name, name, profile_photo_url")
    .eq("email", email)
    .maybeSingle();

  return data || null;
}

export async function GET(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const listingId = cleanText(searchParams.get("listing_id"));

  if (!listingId) {
    return NextResponse.json({ error: "Listing ID is required." }, { status: 400 });
  }

  const { data: listing, error: listingError } = await supabase
    .from("kerb_listings")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    return NextResponse.json({ error: listingError.message }, { status: 500 });
  }

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const directProfilePhotoUrl = cleanText(
    listing.seller_profile_photo_url ||
      listing.profile_photo_url ||
      listing.account_profile_photo_url
  );

  if (directProfilePhotoUrl) {
    return NextResponse.json({
      profile_photo_url: directProfilePhotoUrl,
      seller_name: cleanText(listing.seller_name || listing.account_name),
    });
  }

  const account = await findAccountByListing(listing);

  return NextResponse.json({
    profile_photo_url: cleanText(account?.profile_photo_url),
    seller_name: cleanText(
      account?.full_name || account?.name || listing.seller_name || listing.account_name
    ),
  });
}

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

function clean(value) {
  return String(value || "").trim();
}

function getListingTitle(listing) {
  return [listing?.year, listing?.make, listing?.model, listing?.variant]
    .filter(Boolean)
    .join(" ")
    .trim();
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

  const listingId = clean(body.listing_id);
  const buyerName = clean(body.buyer_name);
  const buyerEmail = clean(body.buyer_email);
  const buyerPhone = clean(body.buyer_phone);
  const message = clean(body.message);

  if (!listingId) {
    return NextResponse.json(
      { error: "Listing ID is required." },
      { status: 400 }
    );
  }

  if (!buyerName) {
    return NextResponse.json(
      { error: "Your name is required." },
      { status: 400 }
    );
  }

  if (!buyerEmail || !buyerEmail.includes("@")) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  if (!message) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  const { data: listing, error: listingError } = await supabase
    .from("kerb_listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return NextResponse.json(
      { error: "Listing could not be found." },
      { status: 404 }
    );
  }

  const listingTitle = listing.title || getListingTitle(listing) || "Kerb listing";

  const { data: enquiry, error: enquiryError } = await supabase
    .from("kerb_enquiries")
    .insert({
      listing_id: listingId,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone || null,
      message,
      seller_email: listing.seller_email || null,
      seller_phone: listing.seller_phone || null,
      listing_title: listingTitle,
      status: "new",
    })
    .select("*")
    .single();

  if (enquiryError) {
    return NextResponse.json(
      { error: enquiryError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    enquiry,
  });
}

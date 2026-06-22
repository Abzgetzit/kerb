import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

function getToken(request) {
  const headerToken = request.headers.get("x-kerb-session-token");
  return String(headerToken || "").trim();
}

function normaliseRole(value) {
  return String(value || "").trim().toLowerCase();
}

function getEnquiryActivityDate(enquiry) {
  return enquiry?.last_message_at || enquiry?.created_at || "";
}

function isUnreadForParticipant(enquiry, participantRole) {
  const role = normaliseRole(participantRole);
  const lastSenderRole = normaliseRole(enquiry?.last_message_sender_role);

  if (!role || !lastSenderRole || lastSenderRole === role) return false;

  const readAt =
    role === "seller" ? enquiry?.seller_last_read_at : enquiry?.buyer_last_read_at;
  const latestAt = getEnquiryActivityDate(enquiry);

  if (!latestAt) return false;
  if (!readAt) return true;

  return new Date(latestAt).getTime() > new Date(readAt).getTime();
}

export async function GET(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  const token = getToken(request);

  if (!token) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const now = new Date().toISOString();

  const { data: session, error: sessionError } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", now)
    .maybeSingle();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json(
      { error: "Session expired. Please log in again." },
      { status: 401 }
    );
  }

  const email = String(session.email || "").toLowerCase();

  const { data: account, error: accountError } = await supabase
    .from("kerb_accounts")
    .select("*")
    .eq("id", session.account_id)
    .maybeSingle();

  if (accountError) {
    return NextResponse.json({ error: accountError.message }, { status: 500 });
  }

  const { data: sentEnquiries, error: sentError } = await supabase
    .from("kerb_enquiries")
    .select("*")
    .ilike("buyer_email", email)
    .order("created_at", { ascending: false });

  if (sentError) {
    return NextResponse.json({ error: sentError.message }, { status: 500 });
  }

  const { data: receivedEnquiries, error: receivedError } = await supabase
    .from("kerb_enquiries")
    .select("*")
    .ilike("seller_email", email)
    .order("created_at", { ascending: false });

  if (receivedError) {
    return NextResponse.json({ error: receivedError.message }, { status: 500 });
  }

  const enquiryListingIds = [
    ...new Set(
      [...(sentEnquiries || []), ...(receivedEnquiries || [])]
        .map((enquiry) => enquiry.listing_id)
        .filter(Boolean)
        .map((listingId) => String(listingId))
    ),
  ];

  let enquiryListingsById = new Map();

  if (enquiryListingIds.length > 0) {
    const { data: enquiryListings, error: enquiryListingsError } =
      await supabase
        .from("kerb_listings")
        .select("*")
        .in("id", enquiryListingIds);

    if (enquiryListingsError) {
      return NextResponse.json(
        { error: enquiryListingsError.message },
        { status: 500 }
      );
    }

    enquiryListingsById = new Map(
      (enquiryListings || []).map((listing) => [String(listing.id), listing])
    );
  }

  function attachListing(enquiries = [], participantRole) {
    return enquiries
      .map((enquiry) => ({
        ...enquiry,
        participant_role: participantRole,
        is_unread: isUnreadForParticipant(enquiry, participantRole),
        listing:
          enquiryListingsById.get(String(enquiry.listing_id || "")) || null,
      }))
      .sort(
        (a, b) =>
          new Date(getEnquiryActivityDate(b)) -
          new Date(getEnquiryActivityDate(a))
      );
  }

  const sentWithListings = attachListing(sentEnquiries || [], "buyer");
  const receivedWithListings = attachListing(receivedEnquiries || [], "seller");
  const unreadSentCount = sentWithListings.filter(
    (enquiry) => enquiry.is_unread
  ).length;
  const unreadReceivedCount = receivedWithListings.filter(
    (enquiry) => enquiry.is_unread
  ).length;

  const listingOwnerFilters = [
    `seller_email.ilike.${email}`,
    `account_email.ilike.${email}`,
  ];

  if (session.account_id) {
    listingOwnerFilters.push(`account_id.eq.${session.account_id}`);
  }

  const { data: myListings, error: listingsError } = await supabase
    .from("kerb_listings")
    .select("*")
    .or(listingOwnerFilters.join(","))
    .order("created_at", { ascending: false });

  if (listingsError) {
    return NextResponse.json({ error: listingsError.message }, { status: 500 });
  }

  const { data: savedRows, error: savedError } = await supabase
    .from("kerb_saved_listings")
    .select("*")
    .eq("account_id", session.account_id)
    .order("created_at", { ascending: false });

  if (savedError) {
    return NextResponse.json({ error: savedError.message }, { status: 500 });
  }

  const savedListingIds = [
    ...new Set((savedRows || []).map((row) => row.listing_id)),
  ];

  let savedListings = [];

  if (savedListingIds.length > 0) {
    const { data: savedCars, error: savedCarsError } = await supabase
      .from("kerb_listings")
      .select("*")
      .in("id", savedListingIds);

    if (savedCarsError) {
      return NextResponse.json(
        { error: savedCarsError.message },
        { status: 500 }
      );
    }

    const savedCarsById = new Map(
      (savedCars || []).map((listing) => [String(listing.id), listing])
    );

    savedListings = (savedRows || [])
      .map((row) => {
        const listing = savedCarsById.get(String(row.listing_id));

        if (!listing) return null;

        return {
          ...listing,
          saved_at: row.created_at,
        };
      })
      .filter(Boolean);
  }

  return NextResponse.json({
    account,
    email,
    sent_enquiries: sentWithListings,
    received_enquiries: receivedWithListings,
    unread_sent_count: unreadSentCount,
    unread_received_count: unreadReceivedCount,
    unread_total: unreadSentCount + unreadReceivedCount,
    my_listings: myListings || [],
    saved_listings: savedListings,
    saved_listing_ids: savedListingIds,
  });
}

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

function normaliseEmail(value) {
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

function getDaysAgoIso(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
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

  const messageThreadsByConversation = new Map();

  [...receivedWithListings, ...sentWithListings]
    .sort(
      (a, b) =>
        new Date(getEnquiryActivityDate(b)) -
        new Date(getEnquiryActivityDate(a))
    )
    .forEach((enquiry) => {
      const enquiryId = String(enquiry.id || "");
      const conversationKey = [
        enquiry.participant_role || "",
        enquiry.listing_id || "",
        normaliseEmail(enquiry.buyer_email),
        normaliseEmail(enquiry.seller_email),
      ].join("|");

      if (!enquiryId || messageThreadsByConversation.has(conversationKey)) return;

      messageThreadsByConversation.set(conversationKey, {
        ...enquiry,
        conversation_mode:
          enquiry.participant_role === "seller" ? "received" : "sent",
      });
    });

  const messageThreads = [...messageThreadsByConversation.values()]
    .sort(
      (a, b) =>
        new Date(getEnquiryActivityDate(b)) -
        new Date(getEnquiryActivityDate(a))
    );
  const unreadMessageCount = messageThreads.filter(
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

  const myListingIds = [
    ...new Set((myListings || []).map((listing) => String(listing.id))),
  ].filter(Boolean);

  let savedCountsByListingId = new Map();
  let viewEventAnalyticsByListingId = new Map();

  if (myListingIds.length > 0) {
    const { data: listingSaveRows, error: listingSaveError } = await supabase
      .from("kerb_saved_listings")
      .select("listing_id")
      .in("listing_id", myListingIds);

    if (listingSaveError) {
      return NextResponse.json(
        { error: listingSaveError.message },
        { status: 500 }
      );
    }

    savedCountsByListingId = (listingSaveRows || []).reduce((counts, row) => {
      const listingId = String(row.listing_id || "");

      if (!listingId) return counts;

      counts.set(listingId, (counts.get(listingId) || 0) + 1);

      return counts;
    }, new Map());

    const nowMs = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();
    const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgoMs = nowMs - 14 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgoMs = nowMs - 30 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = new Date(thirtyDaysAgoMs).toISOString();

    const { data: viewEventRows, error: viewEventError } = await supabase
      .from("kerb_listing_view_events")
      .select("listing_id, created_at")
      .in("listing_id", myListingIds)
      .gte("created_at", thirtyDaysAgo);

    if (viewEventError) {
      console.warn("Kerb view events could not be loaded:", viewEventError);
    } else {
      viewEventAnalyticsByListingId = (viewEventRows || []).reduce(
        (groups, row) => {
          const listingId = String(row.listing_id || "");
          const createdAt = row.created_at ? new Date(row.created_at) : null;

          if (!listingId || !createdAt || Number.isNaN(createdAt.getTime())) {
            return groups;
          }

          const createdAtMs = createdAt.getTime();
          const current = groups.get(listingId) || {
            views_today: 0,
            views_last_7_days: 0,
            views_last_14_days: 0,
            views_last_30_days: 0,
          };

          current.views_last_30_days += 1;

          if (createdAtMs >= todayStartMs) {
            current.views_today += 1;
          }

          if (createdAtMs >= sevenDaysAgoMs) {
            current.views_last_7_days += 1;
          }

          if (createdAtMs >= fourteenDaysAgoMs) {
            current.views_last_14_days += 1;
          }

          groups.set(listingId, current);

          return groups;
        },
        new Map()
      );
    }
  }

  const receivedEnquiriesByListingId = receivedWithListings.reduce(
    (groups, enquiry) => {
      const listingId = String(enquiry.listing_id || "");

      if (!listingId) return groups;

      const currentGroup = groups.get(listingId) || [];
      const buyerKey = normaliseEmail(enquiry.buyer_email) || String(enquiry.id || "");

      if (
        !currentGroup.some(
          (currentEnquiry) =>
            (normaliseEmail(currentEnquiry.buyer_email) ||
              String(currentEnquiry.id || "")) === buyerKey
        )
      ) {
        currentGroup.push(enquiry);
      }

      groups.set(listingId, currentGroup);

      return groups;
    },
    new Map()
  );

  const myListingsWithAnalytics = (myListings || []).map((listing) => {
    const listingId = String(listing.id || "");
    const listingEnquiries = receivedEnquiriesByListingId.get(listingId) || [];
    const latestEnquiry = listingEnquiries[0] || null;
    const viewEventAnalytics =
      viewEventAnalyticsByListingId.get(listingId) || {};

    return {
      ...listing,
      analytics: {
        view_count: Number(listing.view_count || 0),
        views_today: Number(viewEventAnalytics.views_today || 0),
        views_last_7_days: Number(viewEventAnalytics.views_last_7_days || 0),
        views_last_14_days: Number(viewEventAnalytics.views_last_14_days || 0),
        views_last_30_days: Number(viewEventAnalytics.views_last_30_days || 0),
        save_count: savedCountsByListingId.get(listingId) || 0,
        enquiry_count: listingEnquiries.length,
        unread_enquiry_count: listingEnquiries.filter(
          (enquiry) => enquiry.is_unread
        ).length,
        last_enquiry_at: latestEnquiry
          ? getEnquiryActivityDate(latestEnquiry)
          : null,
        last_message_preview: latestEnquiry?.last_message_preview || "",
      },
    };
  });

  let boostHistory = [];

  try {
    let boostQuery = supabase
      .from("kerb_listing_boosts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (myListingIds.length > 0) {
      boostQuery = boostQuery.in("listing_id", myListingIds);
    } else if (session.account_id) {
      boostQuery = boostQuery.eq("account_id", session.account_id);
    } else if (email) {
      boostQuery = boostQuery.ilike("account_email", email);
    }

    const { data: boostRows, error: boostError } = await boostQuery;

    if (boostError) {
      console.warn("Kerb boost history could not be loaded:", boostError);
    } else {
      const myListingsById = new Map(
        (myListings || []).map((listing) => [String(listing.id), listing])
      );
      const missingListingIds = [
        ...new Set(
          (boostRows || [])
            .map((boost) => String(boost.listing_id || ""))
            .filter((listingId) => listingId && !myListingsById.has(listingId))
        ),
      ];
      let extraListingsById = new Map();

      if (missingListingIds.length > 0) {
        const { data: extraListings, error: extraListingsError } = await supabase
          .from("kerb_listings")
          .select("*")
          .in("id", missingListingIds);

        if (extraListingsError) {
          console.warn("Kerb boost listing details could not be loaded:", extraListingsError);
        } else {
          extraListingsById = new Map(
            (extraListings || []).map((listing) => [String(listing.id), listing])
          );
        }
      }

      boostHistory = (boostRows || []).map((boost) => ({
        ...boost,
        listing:
          myListingsById.get(String(boost.listing_id || "")) ||
          extraListingsById.get(String(boost.listing_id || "")) ||
          null,
      }));
    }
  } catch (error) {
    console.warn("Kerb boost history failed:", error);
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
    messages: messageThreads,
    message_count: messageThreads.length,
    unread_sent_count: unreadSentCount,
    unread_received_count: unreadReceivedCount,
    unread_total: unreadMessageCount,
    my_listings: myListingsWithAnalytics,
    saved_listings: savedListings,
    saved_listing_ids: savedListingIds,
    boost_history: boostHistory,
  });
}

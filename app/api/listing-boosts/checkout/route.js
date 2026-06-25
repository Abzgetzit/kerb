import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const boostPlans = {
  "7-days": {
    id: "7-days",
    days: 7,
    amount: 799,
    label: "Featured for 7 days",
    shortLabel: "1 week",
  },
  "14-days": {
    id: "14-days",
    days: 14,
    amount: 1399,
    label: "Featured for 14 days",
    shortLabel: "2 weeks",
  },
  "30-days": {
    id: "30-days",
    days: 30,
    amount: 1999,
    label: "Featured for 30 days",
    shortLabel: "1 month",
  },
};

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

function getSiteUrl(request) {
  const configuredUrl = String(
    process.env.NEXT_PUBLIC_KERB_SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      ""
  ).trim();

  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  return request.nextUrl.origin;
}

function cleanId(value) {
  return String(value || "").trim();
}

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function getBoostPlan(value) {
  const planId = cleanId(value || "14-days");

  return boostPlans[planId] || boostPlans["14-days"];
}

function getAccountIdentity(accountResult) {
  const account = accountResult?.account || {};

  return {
    accountId: cleanId(
      account.id ||
        account.user_id ||
        account.account_id ||
        accountResult?.id ||
        accountResult?.user_id ||
        accountResult?.account_id
    ),
    accountEmail: cleanEmail(
      accountResult?.email ||
        account.email ||
        account.account_email ||
        accountResult?.account_email
    ),
  };
}

function listingEmailValues(listing) {
  return [
    listing?.account_email,
    listing?.seller_email,
    listing?.email,
    listing?.owner_email,
  ]
    .map(cleanEmail)
    .filter(Boolean);
}

function listingIdValues(listing) {
  return [listing?.account_id, listing?.seller_id, listing?.owner_id]
    .map(cleanId)
    .filter(Boolean);
}

function accountResultIncludesListing(accountResult, listingId) {
  const listingIdText = cleanId(listingId);

  if (!listingIdText) return false;

  const allAccountListings = [
    ...(Array.isArray(accountResult?.my_listings) ? accountResult.my_listings : []),
    ...(Array.isArray(accountResult?.listings) ? accountResult.listings : []),
    ...(Array.isArray(accountResult?.seller_listings)
      ? accountResult.seller_listings
      : []),
  ];

  return allAccountListings.some(
    (item) => cleanId(item?.id || item?.listing_id || item) === listingIdText
  );
}

function ownsListing(listing, accountId, accountEmail, accountResult, listingId) {
  const listingAccountIds = listingIdValues(listing);
  const listingAccountEmails = listingEmailValues(listing);

  return (
    accountResultIncludesListing(accountResult, listingId) ||
    (accountId && listingAccountIds.includes(accountId)) ||
    (accountEmail && listingAccountEmails.includes(accountEmail))
  );
}

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role is not configured." },
      { status: 500 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe boost checkout is not configured. Add STRIPE_SECRET_KEY." },
      { status: 500 }
    );
  }

  const sessionToken = request.headers.get("x-kerb-session-token");

  if (!sessionToken) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const listingId = cleanId(body?.listing_id || body?.listingId);
  const selectedPlan = getBoostPlan(body?.plan_id || body?.planId || body?.plan);

  if (!listingId) {
    return NextResponse.json({ error: "Listing id is required." }, { status: 400 });
  }

  const accountResponse = await fetch(new URL("/api/account", request.url), {
    headers: {
      "x-kerb-session-token": sessionToken,
    },
    cache: "no-store",
  });

  const accountResult = await accountResponse.json().catch(() => ({}));

  if (!accountResponse.ok) {
    return NextResponse.json(
      { error: accountResult.error || "Could not verify your account." },
      { status: 401 }
    );
  }

  const { accountId, accountEmail } = getAccountIdentity(accountResult);

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

  if (!ownsListing(listing, accountId, accountEmail, accountResult, listingId)) {
    return NextResponse.json(
      { error: "This listing is not linked to your Kerb account yet." },
      { status: 403 }
    );
  }

  if (String(listing.status || "").toLowerCase() === "sold") {
    return NextResponse.json(
      { error: "Sold listings cannot be boosted." },
      { status: 400 }
    );
  }

  const siteUrl = getSiteUrl(request);
  const listingTitle =
    listing.title ||
    [listing.year, listing.make, listing.model].filter(Boolean).join(" ") ||
    "Kerb listing";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: selectedPlan.amount,
          product_data: {
            name: `Kerb boost - ${selectedPlan.shortLabel}`,
            description: `${selectedPlan.label} for ${listingTitle}.`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/boost/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/boost/cancel?listing_id=${encodeURIComponent(listingId)}`,
    customer_email: accountEmail || undefined,
    client_reference_id: listingId,
    metadata: {
      listing_id: listingId,
      account_id: accountId || "",
      account_email: accountEmail || "",
      boost_days: String(selectedPlan.days),
      boost_plan_id: selectedPlan.id,
      boost_plan_label: selectedPlan.label,
      boost_amount: String(selectedPlan.amount),
      source: String(body?.source || "listing").slice(0, 80),
    },
  });

  try {
    await supabase.from("kerb_listing_boosts").upsert(
      {
        listing_id: listingId,
        account_id: accountId || null,
        account_email: accountEmail || null,
        provider: "stripe",
        stripe_checkout_session_id: checkoutSession.id,
        amount_total: checkoutSession.amount_total || selectedPlan.amount,
        currency: checkoutSession.currency || "gbp",
        status: "checkout_created",
        boost_days: selectedPlan.days,
        plan_id: selectedPlan.id,
        plan_label: selectedPlan.label,
      },
      { onConflict: "stripe_checkout_session_id" }
    );
  } catch (error) {
    console.warn("Boost checkout log insert failed:", error);
  }

  return NextResponse.json({
    url: checkoutSession.url,
    checkout_session_id: checkoutSession.id,
  });
}

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const defaultRank = Number(process.env.KERB_BOOST_RANK || 100);

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

function cleanId(value) {
  return String(value || "").trim();
}

function getBoostDays(session) {
  const value = Number(
    session?.metadata?.plan_days ||
      session?.metadata?.boost_days ||
      process.env.KERB_BOOST_DAYS ||
      14
  );

  if (!Number.isFinite(value) || value <= 0) return 14;

  return Math.min(Math.round(value), 90);
}

async function applyPaidBoost(session, event) {
  const listingId = cleanId(session?.metadata?.listing_id || session?.client_reference_id);
  const sessionId = cleanId(session?.id);

  if (!listingId || !sessionId || !supabase) return;

  const { data: existingPaidBoost, error: existingPaidBoostError } = await supabase
    .from("kerb_listing_boosts")
    .select("id, status, stripe_checkout_session_id")
    .eq("stripe_checkout_session_id", sessionId)
    .eq("status", "paid")
    .maybeSingle();

  if (existingPaidBoostError) {
    console.warn("Boost idempotency check failed:", existingPaidBoostError);
  }

  if (existingPaidBoost) return;

  const boostDays = getBoostDays(session);
  const now = new Date();
  const { data: listing, error: listingError } = await supabase
    .from("kerb_listings")
    .select("id, status, featured_until")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    console.warn("Boost listing lookup failed:", listingError);
    return;
  }

  if (!listing) return;

  const listingStatus = String(listing.status || "").toLowerCase();

  if (listingStatus === "sold" || listingStatus === "rejected") {
    try {
      await supabase.from("kerb_listing_boosts").upsert(
        {
          listing_id: listingId,
          account_id: session?.metadata?.account_id || null,
          account_email: session?.metadata?.account_email || null,
          provider: "stripe",
          stripe_checkout_session_id: sessionId,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          amount_total: session.amount_total,
          currency: session.currency,
          status: "ignored_listing_unavailable",
          boost_days: boostDays,
          plan_id: session?.metadata?.boost_plan_id || null,
          plan_label: session?.metadata?.boost_plan_label || null,
          paid_at: now.toISOString(),
          raw_event: event,
        },
        { onConflict: "stripe_checkout_session_id" }
      );
    } catch (error) {
      console.warn("Boost ignored payment log upsert failed:", error);
    }

    return;
  }

  const currentFeaturedUntilTime = Date.parse(listing.featured_until || "");
  const baseDate =
    Number.isFinite(currentFeaturedUntilTime) &&
    currentFeaturedUntilTime > now.getTime()
      ? new Date(currentFeaturedUntilTime)
      : now;
  const featuredUntil = new Date(
    baseDate.getTime() + boostDays * 24 * 60 * 60 * 1000
  ).toISOString();

  await supabase
    .from("kerb_listings")
    .update({
      is_featured: true,
      featured_until: featuredUntil,
      featured_rank: Number.isFinite(defaultRank) ? defaultRank : 100,
      boosted_at: now.toISOString(),
    })
    .eq("id", listingId);

  try {
    await supabase.from("kerb_listing_boosts").upsert(
      {
        listing_id: listingId,
        account_id: session?.metadata?.account_id || null,
        account_email: session?.metadata?.account_email || null,
        provider: "stripe",
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        amount_total: session.amount_total,
        currency: session.currency,
        status: "paid",
        boost_days: boostDays,
        plan_id: session?.metadata?.boost_plan_id || null,
        plan_label: session?.metadata?.boost_plan_label || null,
        paid_at: now.toISOString(),
        raw_event: event,
      },
      { onConflict: "stripe_checkout_session_id" }
    );
  } catch (error) {
    console.warn("Boost payment log upsert failed:", error);
  }
}

export async function POST(request) {
  if (!stripe || !webhookSecret || !supabase) {
    return NextResponse.json(
      { error: "Stripe webhook or Supabase admin client is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${error.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required"
    ) {
      await applyPaidBoost(session, event);
    }
  }

  return NextResponse.json({ received: true });
}

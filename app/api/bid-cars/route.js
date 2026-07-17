import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value) {
  return String(value || "").trim();
}

function number(value) {
  const parsed = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function bestFitScore(listing) {
  const askingPrice = number(listing.asking_price || listing.price);
  const highestBid = number(listing.highest_bid);
  const bidStrength = askingPrice > 0 ? Math.min(highestBid / askingPrice, 1.25) * 100 : 0;
  const featured = listing.is_featured === true || Number(listing.featured_rank || 0) > 0 ? 60 : 0;
  const activity = Math.min(number(listing.bid_count) * 8, 48);
  const createdAt = new Date(listing.created_at || 0).getTime();
  const ageDays = Number.isFinite(createdAt) ? Math.max(0, (Date.now() - createdAt) / 86400000) : 365;
  const freshness = Math.max(0, 28 - ageDays);
  return featured + activity + bidStrength + freshness;
}

export async function GET(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return Response.json(
      { listings: [], error: "Supabase environment variables are missing." },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const location = clean(url.searchParams.get("location")).toLowerCase();
  const make = clean(url.searchParams.get("make")).toLowerCase();
  const model = clean(url.searchParams.get("model")).toLowerCase();
  const fuel = clean(url.searchParams.get("fuel")).toLowerCase();
  const gearbox = clean(url.searchParams.get("gearbox")).toLowerCase();
  const minPrice = number(url.searchParams.get("minPrice"));
  const maxPrice = number(url.searchParams.get("maxPrice"));
  const maxMileage = number(url.searchParams.get("maxMileage"));
  const sort = clean(url.searchParams.get("sort")) || "best-fit";

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("kerb_listings")
    .select("*")
    .eq("status", "approved")
    .eq("accept_bids", true)
    .limit(250);

  if (error) {
    return Response.json({ listings: [], error: error.message }, { status: 400 });
  }

  const listingIds = (data || []).map((listing) => String(listing.id));
  const bidSummary = new Map();

  if (listingIds.length > 0) {
    const { data: bids } = await supabase
      .from("kerb_listing_bids")
      .select("listing_id, amount")
      .eq("status", "active")
      .in("listing_id", listingIds);

    (bids || []).forEach((bid) => {
      const key = String(bid.listing_id);
      const current = bidSummary.get(key) || { highest_bid: 0, bid_count: 0 };
      current.highest_bid = Math.max(current.highest_bid, number(bid.amount));
      current.bid_count += 1;
      bidSummary.set(key, current);
    });
  }

  const filtered = (data || [])
    .map((listing) => ({
      ...listing,
      ...(bidSummary.get(String(listing.id)) || { highest_bid: 0, bid_count: 0 }),
    }))
    .filter((listing) => !location || String(listing.location || "").toLowerCase().includes(location))
    .filter((listing) => !make || String(listing.make || "").toLowerCase().includes(make))
    .filter((listing) => !model || String(listing.model || "").toLowerCase().includes(model))
    .filter((listing) => !fuel || String(listing.fuel_type || listing.fuel || "").toLowerCase() === fuel)
    .filter((listing) => !gearbox || String(listing.gearbox || listing.transmission || "").toLowerCase() === gearbox)
    .filter((listing) => !minPrice || number(listing.asking_price || listing.price) >= minPrice)
    .filter((listing) => !maxPrice || number(listing.asking_price || listing.price) <= maxPrice)
    .filter((listing) => !maxMileage || number(listing.mileage) <= maxMileage)
    .sort((a, b) => {
      if (sort === "price-low") return number(a.asking_price || a.price) - number(b.asking_price || b.price);
      if (sort === "price-high") return number(b.asking_price || b.price) - number(a.asking_price || a.price);
      if (sort === "most-bids") return number(b.bid_count) - number(a.bid_count) || number(b.highest_bid) - number(a.highest_bid);
      if (sort === "newest") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return bestFitScore(b) - bestFitScore(a);
    });

  return Response.json({ listings: filtered, error: "" });
}

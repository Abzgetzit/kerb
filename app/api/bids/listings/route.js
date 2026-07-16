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

export async function GET(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ listings: [], error: "Supabase environment variables are missing." }, { status: 500 });
  }

  const url = new URL(request.url);
  const location = clean(url.searchParams.get("location")).toLowerCase();
  const make = clean(url.searchParams.get("make")).toLowerCase();
  const model = clean(url.searchParams.get("model")).toLowerCase();
  const fuel = clean(url.searchParams.get("fuel")).toLowerCase();
  const gearbox = clean(url.searchParams.get("gearbox")).toLowerCase();
  const maxPrice = number(url.searchParams.get("maxPrice"));
  const maxMileage = number(url.searchParams.get("maxMileage"));
  const sort = clean(url.searchParams.get("sort")) || "newest";

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

  const filtered = (data || [])
    .filter((listing) => !location || String(listing.location || "").toLowerCase().includes(location))
    .filter((listing) => !make || String(listing.make || "").toLowerCase().includes(make))
    .filter((listing) => !model || String(listing.model || "").toLowerCase().includes(model))
    .filter((listing) => !fuel || String(listing.fuel_type || listing.fuel || "").toLowerCase() === fuel)
    .filter((listing) => !gearbox || String(listing.gearbox || "").toLowerCase() === gearbox)
    .filter((listing) => !maxPrice || number(listing.asking_price || listing.price) <= maxPrice)
    .filter((listing) => !maxMileage || number(listing.mileage) <= maxMileage)
    .sort((a, b) => {
      if (sort === "price-low") return number(a.asking_price || a.price) - number(b.asking_price || b.price);
      if (sort === "price-high") return number(b.asking_price || b.price) - number(a.asking_price || a.price);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  return Response.json({ listings: filtered, error: "" });
}

import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const baseUrl = "https://kerbcar.co.uk";

const routes = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/browse", priority: 0.95, changeFrequency: "daily" },
  { path: "/bids", priority: 0.9, changeFrequency: "daily" },
  { path: "/sell-car", priority: 0.9, changeFrequency: "weekly" },
  { path: "/electric-cars", priority: 0.85, changeFrequency: "daily" },
  { path: "/new-cars", priority: 0.85, changeFrequency: "daily" },
  { path: "/cars-on-finance", priority: 0.8, changeFrequency: "daily" },
  { path: "/car-finance", priority: 0.75, changeFrequency: "monthly" },
  { path: "/first-cars", priority: 0.75, changeFrequency: "daily" },
  { path: "/family-suvs", priority: 0.75, changeFrequency: "daily" },
  { path: "/performance-cars", priority: 0.75, changeFrequency: "daily" },
  { path: "/guides", priority: 0.7, changeFrequency: "weekly" },
  { path: "/guides/how-to-sell-your-car", priority: 0.65, changeFrequency: "monthly" },
  { path: "/guides/buying-a-used-car-safely", priority: 0.65, changeFrequency: "monthly" },
  { path: "/safety", priority: 0.55, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.55, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
];

function validDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function getApprovedListings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return [];

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("kerb_listings")
    .select("id,created_at,accept_bids")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    console.error("Kerb sitemap listing error:", error);
    return [];
  }

  return data || [];
}

export default async function sitemap() {
  const listings = await getApprovedListings();

  const staticEntries = routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const listingEntries = listings.map((listing) => ({
    url: `${baseUrl}${listing.accept_bids ? "/bids" : "/listing"}/${listing.id}`,
    lastModified: validDate(listing.created_at),
    changeFrequency: "weekly",
    priority: listing.accept_bids ? 0.8 : 0.85,
  }));

  return [...staticEntries, ...listingEntries];
}

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import BidDetailClient from "./BidDetailClient";

export const dynamic = "force-dynamic";

async function getBidListing(id) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("kerb_listings")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .eq("accept_bids", true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

function getTitle(listing) {
  return (
    listing?.title ||
    [listing?.year, listing?.make, listing?.model, listing?.model_detail, listing?.variant]
      .filter(Boolean)
      .join(" ") ||
    "Car open to bids"
  );
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const listing = await getBidListing(resolvedParams.id);

  if (!listing) return { title: "Bid car not found | Kerb Car" };

  const title = getTitle(listing);
  return {
    title: `${title} – Make a Bid | Kerb Car`,
    description: `View ${title}, compare the current bids and submit your best bid on Kerb Car.`,
  };
}

export default async function BidListingPage({ params }) {
  const resolvedParams = await params;
  const listing = await getBidListing(resolvedParams.id);

  if (!listing) notFound();

  return <BidDetailClient listing={listing} />;
}

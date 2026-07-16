import { createClient } from "@supabase/supabase-js";
import { POST as createListing } from "../post-car/route";

export const runtime = "nodejs";

function cleanBoolean(value) {
  const text = String(value || "").trim().toLowerCase();
  return text === "true" || text === "yes" || text === "1" || text === "on";
}

export async function POST(request) {
  const formData = await request.clone().formData();
  const acceptBids = cleanBoolean(formData.get("accept_bids"));
  const originalResponse = await createListing(request);
  const result = await originalResponse.clone().json().catch(() => null);

  if (!originalResponse.ok || !result?.listing?.id) {
    return originalResponse;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({
      ...result,
      bid_setting_saved: false,
      bid_setting_warning: "The listing was created, but the bid setting could not be saved.",
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("kerb_listings")
    .update({ accept_bids: acceptBids })
    .eq("id", result.listing.id)
    .select()
    .single();

  if (error) {
    return Response.json({
      ...result,
      bid_setting_saved: false,
      bid_setting_warning: error.message,
    });
  }

  return Response.json({
    ...result,
    listing: data,
    bid_setting_saved: true,
  });
}

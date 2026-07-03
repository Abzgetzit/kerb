import { createClient } from "@supabase/supabase-js";

const listingCategoryValues = new Set([
  "first-car",
  "performance",
  "family-suv",
  "electric-hybrid",
  "newer-car",
]);

function getParam(searchParams, key) {
  const value = searchParams?.[key];

  if (Array.isArray(value)) return value[0] || "";

  return value || "";
}

function normaliseCategory(value) {
  const category = String(value || "").trim().toLowerCase();

  if (category === "general") return "";

  return listingCategoryValues.has(category) ? category : "";
}

export function normaliseBrowseFiltersFromSearchParams(searchParams = {}) {
  return {
    location: getParam(searchParams, "location"),
    make: getParam(searchParams, "make"),
    model: getParam(searchParams, "model"),
    modelDetail:
      getParam(searchParams, "model_detail") ||
      getParam(searchParams, "modelDetail") ||
      getParam(searchParams, "type"),
    spec: getParam(searchParams, "spec") || getParam(searchParams, "trim"),
    priceMin: getParam(searchParams, "priceMin"),
    priceMax: getParam(searchParams, "priceMax"),
    mileageMin: getParam(searchParams, "mileageMin"),
    mileageMax: getParam(searchParams, "mileageMax"),
    bodyType: getParam(searchParams, "body_type") || getParam(searchParams, "bodyType"),
    fuel: getParam(searchParams, "fuel"),
    condition: getParam(searchParams, "condition"),
    finance: getParam(searchParams, "finance"),
    category: normaliseCategory(getParam(searchParams, "category")),
  };
}

export function normaliseBrowseSearchFromSearchParams(searchParams = {}) {
  return getParam(searchParams, "keyword") || getParam(searchParams, "q");
}

export function normaliseBrowseSortFromSearchParams(searchParams = {}) {
  return getParam(searchParams, "sort") || "featured";
}

export async function fetchApprovedListings({ limit = 250 } = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      listings: [],
      error: "Supabase environment variables are missing.",
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("kerb_listings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Kerb server listings error:", error);

    return {
      listings: [],
      error: error.message,
    };
  }

  return {
    listings: data || [],
    error: "",
  };
}

import { createClient } from "@supabase/supabase-js";
import {
  createListingLiveEmail,
  getListingTitle,
  getSiteUrl,
  sendKerbEmail,
} from "../../lib/kerb-email";

export const runtime = "nodejs";

const MAX_LISTING_PHOTOS = 30;

function cleanText(value) {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();

  return text || null;
}

function cleanNumber(value) {
  if (!value) return null;

  const number = Number(String(value).replace(/[^0-9.]/g, ""));

  return Number.isFinite(number) ? number : null;
}

function cleanBoolean(value) {
  if (value === true) return true;
  if (value === false) return false;

  const text = String(value || "").trim().toLowerCase();

  return text === "true" || text === "yes" || text === "1" || text === "on";
}

function normaliseEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function getSignedInAccount(supabase, request) {
  const sessionToken = cleanText(request.headers.get("x-kerb-session-token"));

  if (!sessionToken) {
    return {
      error: "Sign in required.",
      status: 401,
    };
  }

  const now = new Date().toISOString();

  const { data: session, error: sessionError } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", sessionToken)
    .gt("expires_at", now)
    .maybeSingle();

  if (sessionError) {
    return {
      error: sessionError.message,
      status: 500,
    };
  }

  if (!session) {
    return {
      error: "Session expired. Please sign in again.",
      status: 401,
    };
  }

  const { data: account, error: accountError } = await supabase
    .from("kerb_accounts")
    .select("*")
    .eq("id", session.account_id)
    .maybeSingle();

  if (accountError) {
    return {
      error: accountError.message,
      status: 500,
    };
  }

  const accountEmail = normaliseEmail(session.email || account?.email);
  const accountName =
    cleanText(account?.full_name) ||
    cleanText(account?.name) ||
    (accountEmail ? accountEmail.split("@")[0] : null) ||
    null;

  return {
    session,
    account,
    accountId: cleanText(session.account_id || account?.id),
    accountEmail,
    accountName,
  };
}

function roundToNearestHundred(value) {
  return Math.round(value / 100) * 100;
}

function getSafeValuation({ low, high, askingPrice }) {
  if (!low || !high) {
    return {
      low,
      high,
    };
  }

  if (askingPrice && high > askingPrice * 1.35) {
    return {
      low: roundToNearestHundred(askingPrice * 0.9),
      high: roundToNearestHundred(askingPrice * 1.08),
    };
  }

  return {
    low,
    high,
  };
}

function getFileExtension(fileName = "") {
  const extension = String(fileName).split(".").pop();

  if (!extension || extension === fileName) return "jpg";

  return extension.toLowerCase();
}

const allowedFeatures = new Set([
  "Apple CarPlay",
  "Android Auto",
  "Bluetooth",
  "Satellite navigation",
  "Parking sensors",
  "Reversing camera",
  "Heated seats",
  "Leather seats",
  "Cruise control",
  "Adaptive cruise control",
  "Air conditioning",
  "Climate control",
  "Keyless entry",
  "Panoramic roof",
  "DAB radio",
  "Service history",
  "MOT included",
  "ULEZ compliant",
  "Alloy wheels",
  "Electric folding mirrors",
  "Lane assist",
  "Blind spot monitoring",
]);

const allowedListingCategories = new Set([
  "general",
  "first-car",
  "performance",
  "family-suv",
  "electric-hybrid",
  "newer-car",
]);

function cleanListingCategory(value) {
  const category = cleanText(value);

  return allowedListingCategories.has(category) ? category : "general";
}

function cleanFeatures(formData) {
  return [
    ...new Set(
      formData
        .getAll("features")
        .map(cleanText)
        .filter((feature) => feature && allowedFeatures.has(feature))
    ),
  ];
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const signedInAccount = await getSignedInAccount(supabase, request);

    if (signedInAccount.error) {
      return Response.json(
        { error: signedInAccount.error },
        { status: signedInAccount.status || 401 }
      );
    }

    const photos = formData
      .getAll("photos")
      .filter((photo) => photo && typeof photo !== "string" && photo.size > 0)
      .slice(0, MAX_LISTING_PHOTOS);

    const photoUrls = [];

    for (const photo of photos) {
      const fileExt = getFileExtension(photo.name);
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `listings/${fileName}`;

      const arrayBuffer = await photo.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("kerb-car-photos")
        .upload(filePath, fileBuffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: photo.type || "image/jpeg",
        });

      if (uploadError) {
        return Response.json({ error: uploadError.message }, { status: 400 });
      }

      const { data: publicUrlData } = supabase.storage
        .from("kerb-car-photos")
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        photoUrls.push(publicUrlData.publicUrl);
      }
    }

    const sellerEmail =
      signedInAccount.accountEmail ||
      cleanText(formData.get("seller_email")) ||
      cleanText(formData.get("account_email"));

    const sellerNameInput = cleanText(formData.get("seller_name"));
    const sellerName =
      sellerNameInput ||
      signedInAccount.accountName ||
      cleanText(formData.get("account_name"));
    const sellerPhone = cleanText(formData.get("seller_phone"));
    const showSellerName = cleanBoolean(formData.get("show_seller_name"));
    const showSellerPhone = cleanBoolean(formData.get("show_seller_phone"));

    const make = cleanText(formData.get("make"));
    const model = cleanText(formData.get("model"));
    const modelDetail = cleanText(formData.get("model_detail"));
    const year = cleanNumber(formData.get("year"));
    const mileage = cleanNumber(formData.get("mileage"));
    const bodyType = cleanText(formData.get("body_type"));
    const condition = cleanText(formData.get("condition"));
    const fuelType = cleanText(formData.get("fuel_type"));
    const gearbox = cleanText(formData.get("gearbox"));
    const askingPrice = cleanNumber(formData.get("asking_price"));
    const location = cleanText(formData.get("location"));
    const financeAvailable = cleanBoolean(formData.get("finance_available"));
    const valuation = getSafeValuation({
      low: cleanNumber(formData.get("valuation_low")),
      high: cleanNumber(formData.get("valuation_high")),
      askingPrice,
    });
    const features = cleanFeatures(formData);
    const listingCategory = cleanListingCategory(formData.get("listing_category"));
    const termsAccepted = cleanBoolean(formData.get("terms_accepted"));
    const termsVersion = cleanText(formData.get("terms_version")) || "2026-06-28";

    if (!termsAccepted) {
      return Response.json(
        { error: "You must agree to Kerb’s Terms and Conditions before listing your car." },
        { status: 400 }
      );
    }

    const title = [year, make, model, modelDetail].filter(Boolean).join(" ");

    const listing = {
      status: "approved",
      terms_accepted_at: new Date().toISOString(),
      terms_version: termsVersion,

      account_id:
        signedInAccount.accountId || cleanText(formData.get("account_id")),
      account_email:
        signedInAccount.accountEmail || cleanText(formData.get("account_email")),
      account_name:
        signedInAccount.accountName ||
        cleanText(formData.get("account_name")) ||
        sellerName,

      seller_name: sellerName,
      seller_email: sellerEmail,
      seller_phone: sellerPhone,
      seller_type: cleanText(formData.get("seller_type")),
      show_seller_name: showSellerName,
      show_seller_phone: Boolean(showSellerPhone && sellerPhone),

      title: title || null,
      make,
      model,
      model_detail: modelDetail,
      year,
      mileage,
      body_type: bodyType,
      condition,
      fuel_type: fuelType,
      gearbox,
      asking_price: askingPrice,
      price: askingPrice,
      location,
      listing_category: listingCategory,

      finance_available: financeAvailable,

      description: cleanText(formData.get("description")),
      features,

      valuation_low: valuation.low,
      valuation_high: valuation.high,

      image_url: photoUrls[0] || null,
      photos: photoUrls,
      photo_urls: photoUrls,
    };

    const { data, error } = await supabase
      .from("kerb_listings")
      .insert(listing)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    const siteUrl = getSiteUrl(request);
    const sellerConfirmationEmail = await sendKerbEmail({
      to: data.seller_email || data.account_email,
      subject: `Your ${getListingTitle(data)} listing is now live on Kerb`,
      html: createListingLiveEmail({
        listing: data,
        siteUrl,
      }),
    });

    return Response.json({
      success: true,
      listing: data,
      emails: {
        seller_confirmation: sellerConfirmationEmail,
      },
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

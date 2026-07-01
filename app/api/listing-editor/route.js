import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const MAX_LISTING_PHOTOS = 30;

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

function cleanText(value) {
  if (value === null || value === undefined) return "";

  return String(value).trim();
}

function nullableText(value) {
  const text = cleanText(value);

  return text || null;
}

function normaliseEmail(value) {
  return cleanText(value).toLowerCase();
}

function cleanNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(String(value).replace(/[^0-9.]/g, ""));

  return Number.isFinite(number) ? number : null;
}

function cleanBoolean(value) {
  if (value === true) return true;
  if (value === false) return false;

  const text = cleanText(value).toLowerCase();

  return text === "true" || text === "yes" || text === "1";
}

function cleanFeatures(value) {
  const rawFeatures = Array.isArray(value) ? value : [];

  return [
    ...new Set(
      rawFeatures
        .map(nullableText)
        .filter((feature) => feature && allowedFeatures.has(feature))
    ),
  ];
}

function getFileExtension(fileName = "") {
  const extension = String(fileName).split(".").pop();

  if (!extension || extension === fileName) return "jpg";

  return extension.toLowerCase();
}

function parsePhotoField(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean);
  }

  if (typeof value === "string") {
    const text = cleanText(value);

    if (!text) return [];

    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed.map(cleanText).filter(Boolean);
      }

      if (typeof parsed === "string") {
        return [cleanText(parsed)].filter(Boolean);
      }
    } catch {
      return [text];
    }
  }

  return [];
}

function getListingPhotoUrls(listing) {
  const urls = [
    ...parsePhotoField(listing?.photo_urls),
    ...parsePhotoField(listing?.photos),
    ...parsePhotoField(listing?.image_urls),
    ...parsePhotoField(listing?.images),
    ...parsePhotoField(listing?.image_url),
  ];

  return [...new Set(urls)].filter(Boolean);
}

function getStoragePathFromPublicUrl(url) {
  const marker = "/storage/v1/object/public/kerb-car-photos/";
  const text = cleanText(url);
  const markerIndex = text.indexOf(marker);

  if (markerIndex === -1) return "";

  return decodeURIComponent(text.slice(markerIndex + marker.length));
}

async function removeStoragePhotos(supabase, urls = []) {
  const paths = urls
    .map(getStoragePathFromPublicUrl)
    .filter(Boolean);

  if (paths.length === 0) return;

  const { error } = await supabase.storage
    .from("kerb-car-photos")
    .remove(paths);

  if (error) {
    console.error("Kerb photo delete error:", error);
  }
}

async function uploadPhotos(supabase, photos = []) {
  const uploadedUrls = [];

  for (const photo of photos) {
    if (!photo || typeof photo === "string" || photo.size <= 0) continue;

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
      throw new Error(uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from("kerb-car-photos")
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      uploadedUrls.push(publicUrlData.publicUrl);
    }
  }

  return uploadedUrls;
}

function cleanListingCategory(value) {
  const category = cleanText(value);

  return allowedListingCategories.has(category) ? category : "general";
}

function getToken(request) {
  return cleanText(request.headers.get("x-kerb-session-token"));
}

function getAccountEmail(account) {
  return normaliseEmail(
    account?.email ||
      account?.account_email ||
      account?.user_email ||
      account?.owner_email
  );
}

function getAccountId(account) {
  return cleanText(
    account?.id ||
      account?.account_id ||
      account?.user_id
  );
}

async function getAccountByIdOrEmail(supabase, session) {
  const accountId = cleanText(session?.account_id || session?.user_id);
  const email = normaliseEmail(session?.email || session?.account_email);

  if (accountId) {
    const { data } = await supabase
      .from("kerb_accounts")
      .select("*")
      .eq("id", accountId)
      .maybeSingle();

    if (data) {
      return {
        ...data,
        account_id: accountId,
        email: data.email || email,
      };
    }
  }

  if (email) {
    const { data } = await supabase
      .from("kerb_accounts")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (data) {
      return {
        ...data,
        account_id: data.id || accountId,
      };
    }
  }

  if (accountId || email) {
    return {
      id: accountId,
      account_id: accountId,
      email,
    };
  }

  return null;
}

async function findAccountFromToken(supabase, token) {
  if (!token) return null;

  const sessionAttempts = [
    {
      table: "kerb_account_sessions",
      column: "session_token",
    },
    {
      table: "kerb_account_sessions",
      column: "token",
    },
    {
      table: "kerb_sessions",
      column: "token",
    },
  ];

  for (const attempt of sessionAttempts) {
    const { data, error } = await supabase
      .from(attempt.table)
      .select("*")
      .eq(attempt.column, token)
      .maybeSingle();

    if (!error && data) {
      if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
        return null;
      }

      const account = await getAccountByIdOrEmail(supabase, data);

      if (account) return account;
    }
  }

  const accountAttempts = [
    {
      table: "kerb_accounts",
      column: "session_token",
    },
    {
      table: "kerb_accounts",
      column: "token",
    },
    {
      table: "kerb_accounts",
      column: "auth_token",
    },
  ];

  for (const attempt of accountAttempts) {
    const { data, error } = await supabase
      .from(attempt.table)
      .select("*")
      .eq(attempt.column, token)
      .maybeSingle();

    if (!error && data) return data;
  }

  return null;
}

function accountOwnsListing(account, listing) {
  const accountEmail = getAccountEmail(account);
  const accountId = getAccountId(account);

  const listingOwnerEmails = [
    listing.account_email,
    listing.seller_email,
  ]
    .filter(Boolean)
    .map(normaliseEmail);

  const listingOwnerIds = [
    listing.account_id,
    listing.user_id,
    listing.owner_id,
  ]
    .filter(Boolean)
    .map(cleanText);

  return Boolean(
    (accountEmail && listingOwnerEmails.includes(accountEmail)) ||
      (accountId && listingOwnerIds.includes(accountId))
  );
}

async function getVerifiedListing({ request, listingId }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      response: Response.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      ),
    };
  }

  const token = getToken(request);

  if (!token) {
    return {
      response: Response.json(
        { error: "Please sign in again to edit this listing." },
        { status: 401 }
      ),
    };
  }

  if (!listingId) {
    return {
      response: Response.json(
        { error: "Missing listing ID." },
        { status: 400 }
      ),
    };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const account = await findAccountFromToken(supabase, token);

  if (!account) {
    return {
      response: Response.json(
        {
          error:
            "Could not verify your session. Please sign out, sign back in and try again.",
        },
        { status: 401 }
      ),
    };
  }

  const { data: listing, error: listingError } = await supabase
    .from("kerb_listings")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return {
      response: Response.json(
        { error: "Listing could not be found." },
        { status: 404 }
      ),
    };
  }

  if (!accountOwnsListing(account, listing)) {
    return {
      response: Response.json(
        { error: "You do not have permission to edit this listing." },
        { status: 403 }
      ),
    };
  }

  return {
    supabase,
    account,
    listing,
  };
}

export async function GET(request) {
  try {
    const listingId = cleanText(
      new URL(request.url).searchParams.get("listing_id")
    );

    const verified = await getVerifiedListing({ request, listingId });

    if (verified.response) return verified.response;

    return Response.json({
      success: true,
      listing: verified.listing,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body = {};
    let newPhotos = [];
    let photoUrlsWereProvided = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      body = {
        listing_id: formData.get("listing_id"),
        asking_price: formData.get("asking_price"),
        mileage: formData.get("mileage"),
        condition: formData.get("condition"),
        body_type: formData.get("body_type"),
        finance_available: formData.get("finance_available"),
        description: formData.get("description"),
        seller_phone: formData.get("seller_phone"),
        location: formData.get("location"),
        fuel_type: formData.get("fuel_type"),
        gearbox: formData.get("gearbox"),
        listing_category: formData.get("listing_category"),
        features: formData.getAll("features"),
        existing_photo_urls: formData.get("existing_photo_urls"),
      };

      photoUrlsWereProvided = formData.has("existing_photo_urls");
      newPhotos = formData
        .getAll("new_photos")
        .filter((photo) => photo && typeof photo !== "string" && photo.size > 0);
    } else {
      body = await request.json();
      photoUrlsWereProvided = Object.prototype.hasOwnProperty.call(
        body,
        "existing_photo_urls"
      );
    }

    const listingId = cleanText(body.listing_id);
    const verified = await getVerifiedListing({ request, listingId });

    if (verified.response) return verified.response;

    const askingPrice = cleanNumber(body.asking_price);
    const mileage = cleanNumber(body.mileage);
    const features = cleanFeatures(body.features);
    const currentPhotoUrls = getListingPhotoUrls(verified.listing);
    const currentPhotoUrlSet = new Set(currentPhotoUrls);
    const requestedExistingPhotoUrls = photoUrlsWereProvided
      ? parsePhotoField(body.existing_photo_urls)
      : currentPhotoUrls;
    const keptPhotoUrls = requestedExistingPhotoUrls.filter((url) =>
      currentPhotoUrlSet.has(url)
    );
    const uploadSlots = Math.max(MAX_LISTING_PHOTOS - keptPhotoUrls.length, 0);
    const uploadedPhotoUrls = await uploadPhotos(
      verified.supabase,
      newPhotos.slice(0, uploadSlots)
    );
    const nextPhotoUrls = [...keptPhotoUrls, ...uploadedPhotoUrls].slice(0, MAX_LISTING_PHOTOS);
    const removedPhotoUrls = currentPhotoUrls.filter(
      (url) => !nextPhotoUrls.includes(url)
    );

    const updates = {
      asking_price: askingPrice,
      price: askingPrice,
      mileage,
      condition: nullableText(body.condition),
      body_type: nullableText(body.body_type),
      finance_available: cleanBoolean(body.finance_available),
      description: nullableText(body.description),
      seller_phone: nullableText(body.seller_phone),
      location: nullableText(body.location),
      fuel_type: nullableText(body.fuel_type),
      gearbox: nullableText(body.gearbox),
      features,
      listing_category: cleanListingCategory(body.listing_category),
      image_url: nextPhotoUrls[0] || null,
      photos: nextPhotoUrls,
      photo_urls: nextPhotoUrls,
    };

    if (cleanText(verified.listing.status).toLowerCase() === "rejected") {
      updates.status = "pending";
    }

    const { data: updatedListing, error: updateError } = await verified.supabase
      .from("kerb_listings")
      .update(updates)
      .eq("id", listingId)
      .select()
      .single();

    if (updateError) {
      await removeStoragePhotos(verified.supabase, uploadedPhotoUrls);

      return Response.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    await removeStoragePhotos(verified.supabase, removedPhotoUrls);

    return Response.json({
      success: true,
      listing: updatedListing,
      photos: nextPhotoUrls,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

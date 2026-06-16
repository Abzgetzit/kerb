import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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

  return text === "true" || text === "yes" || text === "1";
}

function getFileExtension(fileName = "") {
  const extension = String(fileName).split(".").pop();

  if (!extension || extension === fileName) return "jpg";

  return extension.toLowerCase();
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

    const photos = formData
      .getAll("photos")
      .filter((photo) => photo && typeof photo !== "string" && photo.size > 0)
      .slice(0, 12);

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
        return Response.json(
          { error: uploadError.message },
          { status: 400 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("kerb-car-photos")
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        photoUrls.push(publicUrlData.publicUrl);
      }
    }

    const sellerEmail =
      cleanText(formData.get("seller_email")) ||
      cleanText(formData.get("account_email"));

    const sellerName =
      cleanText(formData.get("seller_name")) ||
      cleanText(formData.get("account_name"));

    const make = cleanText(formData.get("make"));
    const model = cleanText(formData.get("model"));
    const year = cleanNumber(formData.get("year"));
    const mileage = cleanNumber(formData.get("mileage"));
    const bodyType = cleanText(formData.get("body_type"));
    const condition = cleanText(formData.get("condition"));
    const fuelType = cleanText(formData.get("fuel_type"));
    const gearbox = cleanText(formData.get("gearbox"));
    const askingPrice = cleanNumber(formData.get("asking_price"));
    const location = cleanText(formData.get("location"));
    const financeAvailable = cleanBoolean(formData.get("finance_available"));

    const title = [year, make, model].filter(Boolean).join(" ");

    const listing = {
      status: "pending",

      account_id: cleanText(formData.get("account_id")),
      account_email: cleanText(formData.get("account_email")),
      account_name: cleanText(formData.get("account_name")),

      seller_name: sellerName,
      seller_email: sellerEmail,
      seller_phone: cleanText(formData.get("seller_phone")),
      seller_type: cleanText(formData.get("seller_type")),

      title: title || null,
      make,
      model,
      year,
      mileage,
      body_type: bodyType,
      condition,
      fuel_type: fuelType,
      gearbox,
      asking_price: askingPrice,
      price: askingPrice,
      location,

      finance_available: financeAvailable,

      description: cleanText(formData.get("description")),

      valuation_low: cleanNumber(formData.get("valuation_low")),
      valuation_high: cleanNumber(formData.get("valuation_high")),

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
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      listing: data,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

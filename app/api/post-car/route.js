import { createClient } from "@supabase/supabase-js";

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

    const photos = formData.getAll("photos");
    const photoUrls = [];

    for (const photo of photos) {
      if (!photo || typeof photo === "string" || photo.size === 0) continue;

      const fileExt = photo.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `listings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("kerb-car-photos")
        .upload(filePath, photo, {
          cacheControl: "3600",
          upsert: false,
          contentType: photo.type,
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

      photoUrls.push(publicUrlData.publicUrl);
    }

    const cleanNumber = (value) => {
      if (!value) return null;
      const number = Number(String(value).replace(/[^0-9.]/g, ""));
      return Number.isFinite(number) ? number : null;
    };

    const listing = {
      status: "pending",

      seller_name: formData.get("seller_name"),
      seller_email: formData.get("seller_email"),
      seller_phone: formData.get("seller_phone"),
      seller_type: formData.get("seller_type"),

      make: formData.get("make"),
      model: formData.get("model"),
      year: cleanNumber(formData.get("year")),
      mileage: cleanNumber(formData.get("mileage")),
      fuel_type: formData.get("fuel_type"),
      gearbox: formData.get("gearbox"),
      asking_price: cleanNumber(formData.get("asking_price")),
      location: formData.get("location"),

      description: formData.get("description"),

      valuation_low: cleanNumber(formData.get("valuation_low")),
      valuation_high: cleanNumber(formData.get("valuation_high")),

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

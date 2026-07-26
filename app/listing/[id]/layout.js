import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const baseUrl = "https://kerbcar.co.uk";

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const getListing = cache(async (id) => {
  const supabase = createServerClient();
  if (!supabase || !id) return null;

  const { data, error } = await supabase
    .from("kerb_listings")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) return null;
  return data;
});

function getTitle(listing) {
  return (
    cleanText(listing?.title) ||
    [
      listing?.year,
      listing?.make,
      listing?.model,
      listing?.model_detail,
      listing?.variant,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Used car"
  );
}

function parseImages(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(cleanText).filter(Boolean);
      if (typeof parsed === "string") return [cleanText(parsed)].filter(Boolean);
    } catch {
      return [cleanText(trimmed)].filter(Boolean);
    }
  }

  return [];
}

function getImages(listing) {
  const images = [
    ...parseImages(listing?.image_url),
    ...parseImages(listing?.photo_url),
    ...parseImages(listing?.main_photo_url),
    ...parseImages(listing?.cover_image_url),
    ...parseImages(listing?.photo_urls),
    ...parseImages(listing?.photos),
    ...parseImages(listing?.image_urls),
    ...parseImages(listing?.images),
  ];

  return [...new Set(images)]
    .filter(Boolean)
    .map((image) =>
      image.startsWith("http")
        ? image
        : `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`
    );
}

function getPrice(listing) {
  const price = Number(listing?.asking_price || listing?.price || 0);
  return Number.isFinite(price) && price > 0 ? price : 0;
}

function getCanonicalUrl(listing) {
  const path = listing?.accept_bids ? "/bids" : "/listing";
  return `${baseUrl}${path}/${listing.id}`;
}

function getDescription(listing) {
  const title = getTitle(listing);
  const location = cleanText(listing?.location || listing?.city);
  const mileage = Number(listing?.mileage || 0);
  const details = [
    mileage > 0
      ? `${new Intl.NumberFormat("en-GB").format(mileage)} miles`
      : "",
    cleanText(listing?.fuel_type || listing?.fuel),
    cleanText(listing?.gearbox || listing?.transmission),
    location ? `for sale in ${location}` : "for sale in the UK",
  ].filter(Boolean);

  const description = `View this ${title}${
    details.length ? `, ${details.join(", ")}` : ""
  } on Kerb.`;

  return description.slice(0, 160);
}

function buildVehicleSchema(listing) {
  const canonicalUrl = getCanonicalUrl(listing);
  const mileage = Number(listing?.mileage || 0);
  const price = getPrice(listing);
  const images = getImages(listing);

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${canonicalUrl}#vehicle`,
    sku: String(listing.id),
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    name: getTitle(listing),
    description: getDescription(listing),
    image: images.length ? images : [`${baseUrl}/cars/hero-car.png`],
    brand: listing?.make
      ? { "@type": "Brand", name: cleanText(listing.make) }
      : undefined,
    model: cleanText(listing?.model || listing?.model_detail) || undefined,
    vehicleModelDate: listing?.year ? String(listing.year) : undefined,
    bodyType: cleanText(listing?.body_type) || undefined,
    fuelType: cleanText(listing?.fuel_type || listing?.fuel) || undefined,
    vehicleTransmission:
      cleanText(listing?.gearbox || listing?.transmission) || undefined,
    mileageFromOdometer:
      mileage > 0
        ? {
            "@type": "QuantitativeValue",
            value: mileage,
            unitCode: "SMI",
          }
        : undefined,
    itemCondition:
      cleanText(listing?.condition).toLowerCase() === "new"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    datePosted: listing?.created_at || undefined,
    offers:
      price > 0
        ? {
            "@type": "Offer",
            url: canonicalUrl,
            price,
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
          }
        : undefined,
  };
}

function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const listing = await getListing(resolvedParams?.id);

  if (!listing) {
    return {
      title: "Car listing not found | Kerb",
      robots: { index: false, follow: false },
    };
  }

  const listingTitle = getTitle(listing);
  const location = cleanText(listing?.location || listing?.city);
  const canonicalUrl = getCanonicalUrl(listing);
  const pageTitle = `${listingTitle} for Sale${
    location ? ` in ${location}` : ""
  } | Kerb`;
  const description = getDescription(listing);
  const images = getImages(listing);

  return {
    title: pageTitle,
    description,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonicalUrl,
      siteName: "Kerb",
      locale: "en_GB",
      type: "website",
      images: images.length ? images : [`${baseUrl}/cars/hero-car.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: images.length
        ? [images[0]]
        : [`${baseUrl}/cars/hero-car.png`],
    },
  };
}

export default async function ListingLayout({ children, params }) {
  const resolvedParams = await params;
  const listing = await getListing(resolvedParams?.id);

  return (
    <>
      {listing ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(buildVehicleSchema(listing)),
          }}
        />
      ) : null}
      {children}
    </>
  );
}

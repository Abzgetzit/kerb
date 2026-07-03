import BrowseClient from "./BrowseClient";
import {
  fetchApprovedListings,
  normaliseBrowseFiltersFromSearchParams,
  normaliseBrowseSearchFromSearchParams,
  normaliseBrowseSortFromSearchParams,
} from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

const baseUrl = "https://kerbcar.co.uk";

function hasFacetedSearchParams(searchParams = {}) {
  const rankingParams = [
    "category",
    "finance",
    "make",
    "model",
    "model_detail",
    "modelDetail",
    "type",
    "spec",
    "trim",
    "location",
    "priceMin",
    "priceMax",
    "mileageMin",
    "mileageMax",
    "body_type",
    "bodyType",
    "fuel",
    "condition",
    "keyword",
    "q",
    "sort",
  ];

  return rankingParams.some((key) => {
    const value = searchParams?.[key];
    if (Array.isArray(value)) return value.some(Boolean);
    return Boolean(value);
  });
}

export async function generateMetadata({ searchParams }) {
  const hasFilters = hasFacetedSearchParams(searchParams);

  return {
    title: "Browse Used Cars for Sale in the UK | Kerb Car",
    description:
      "Search used cars for sale in the UK on Kerb Car. Filter by make, model, price, mileage, fuel type and more.",
    alternates: {
      canonical: `${baseUrl}/browse`,
    },
    robots: hasFilters
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title: "Browse Used Cars for Sale in the UK | Kerb Car",
      description:
        "Search used cars for sale in the UK on Kerb Car. Filter by make, model, price, mileage, fuel type and more.",
      url: `${baseUrl}/browse`,
      siteName: "Kerb Car",
      type: "website",
    },
  };
}

export default async function BrowsePage({ searchParams }) {
  const filters = normaliseBrowseFiltersFromSearchParams(searchParams);
  const search = normaliseBrowseSearchFromSearchParams(searchParams);
  const sort = normaliseBrowseSortFromSearchParams(searchParams);
  const { listings, error } = await fetchApprovedListings();

  return (
    <BrowseClient
      initialCars={listings}
      initialFilters={filters}
      initialSearch={search}
      initialSort={sort}
      initialLoadError={error}
    />
  );
}

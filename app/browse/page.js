import BrowseClient from "./BrowseClient";
import {
  fetchApprovedListings,
  normaliseBrowseFiltersFromSearchParams,
  normaliseBrowseSearchFromSearchParams,
  normaliseBrowseSortFromSearchParams,
} from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse cars for sale | Kerb",
  description:
    "Browse used cars for sale on Kerb from private sellers and dealers across the UK.",
};

export default async function BrowsePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const { listings, error } = await fetchApprovedListings();

  return (
    <BrowseClient
      initialCars={listings}
      initialFilters={normaliseBrowseFiltersFromSearchParams(resolvedSearchParams)}
      initialSearch={normaliseBrowseSearchFromSearchParams(resolvedSearchParams)}
      initialSort={normaliseBrowseSortFromSearchParams(resolvedSearchParams)}
      initialLoadError={error}
    />
  );
}

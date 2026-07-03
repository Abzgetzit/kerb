import BrowseClient from "../browse/BrowseClient";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Performance cars for sale | Kerb",
  description: "Browse performance cars, hot hatches and sports models for sale on Kerb.",
};

export default async function PerformanceCarsPage() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <BrowseClient
      initialCars={listings}
      initialFilters={{ category: "performance" }}
      initialLoadError={error}
    />
  );
}

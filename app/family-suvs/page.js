import BrowseClient from "../browse/BrowseClient";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Family SUVs for sale | Kerb",
  description: "Browse family SUVs and practical crossover cars for sale on Kerb.",
};

export default async function FamilySuvsPage() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <BrowseClient
      initialCars={listings}
      initialFilters={{ category: "family-suv" }}
      initialLoadError={error}
    />
  );
}

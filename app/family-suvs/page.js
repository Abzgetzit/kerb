import BrowseClient from "../browse/BrowseClient";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Family SUV Cars for Sale | Kerb Car",
  description:
    "Browse practical family SUV and crossover cars for sale on Kerb Car.",
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

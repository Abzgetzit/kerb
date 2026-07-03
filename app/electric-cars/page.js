import BrowseClient from "../browse/BrowseClient";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Electric and hybrid cars for sale | Kerb",
  description: "Browse electric and hybrid cars for sale on Kerb.",
};

export default async function ElectricCarsPage() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <BrowseClient
      initialCars={listings}
      initialFilters={{ category: "electric-hybrid" }}
      initialLoadError={error}
    />
  );
}

import BrowseClient from "../browse/BrowseClient";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "First cars for sale | Kerb",
  description: "Browse affordable first cars and small hatchbacks for sale on Kerb.",
};

export default async function FirstCarsPage() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <BrowseClient
      initialCars={listings}
      initialFilters={{ category: "first-car" }}
      initialLoadError={error}
    />
  );
}

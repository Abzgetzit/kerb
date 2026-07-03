import BrowseClient from "../browse/BrowseClient";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Electric and Hybrid Cars for Sale | Kerb Car",
  description:
    "Browse electric and hybrid cars for sale on Kerb Car from private sellers and dealers.",
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

import BrowseClient from "../browse/BrowseClient";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cars with finance available | Kerb",
  description:
    "Browse cars where the seller or dealer says finance may be available. Kerb does not provide finance.",
};

export default async function FinanceCarsPage() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <BrowseClient
      initialCars={listings}
      initialFilters={{ finance: "true" }}
      initialLoadError={error}
    />
  );
}

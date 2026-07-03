import BrowseClient from "../browse/BrowseClient";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cars with Finance Available | Kerb Car",
  description:
    "Browse cars where sellers or dealers say finance may be available. Kerb Car does not provide finance.",
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

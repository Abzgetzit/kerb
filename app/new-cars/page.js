import BrowseClient from "../browse/BrowseClient";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New and Nearly New Cars for Sale | Kerb Car",
  description:
    "Browse newer and nearly-new cars for sale on Kerb Car from private sellers and dealers.",
};

export default async function Page() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <BrowseClient
      initialCars={listings}
      initialFilters={{ category: "newer-car" }}
      initialLoadError={error}
    />
  );
}

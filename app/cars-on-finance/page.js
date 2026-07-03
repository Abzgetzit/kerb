import BrowseClient from "../browse/BrowseClient";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cars with Finance Available | Kerb Car",
  description:
    "Browse cars where sellers or dealers say finance may be available. Kerb Car does not provide finance.",
  alternates: {
    canonical: "https://kerbcar.co.uk/cars-on-finance",
  },
};

const landingContent = {
  kicker: "Cars with finance available",
  title: "Browse cars where sellers say finance may be available",
  description:
    "Kerb Car is not a finance provider. This page shows listings where the seller or dealer indicates finance may be available, so buyers can compare the car and contact the seller directly.",
  points: [
    {
      title: "Marketplace only",
      text: "Kerb Car does not provide finance, approve finance, broker finance or give financial advice.",
    },
    {
      title: "Ask the seller",
      text: "Contact the seller or dealer to understand any finance option, eligibility checks, terms and costs.",
    },
    {
      title: "Compare the car first",
      text: "Use price, mileage, photos, condition and vehicle details to decide whether the listing is worth enquiring about.",
    },
  ],
  faqTitle: "Finance listing questions",
  faqs: [
    {
      question: "Does Kerb Car provide car finance?",
      answer: "No. Kerb Car does not provide finance. Any finance information comes from the seller or dealer listing the car.",
    },
    {
      question: "Are finance terms guaranteed?",
      answer: "No. Buyers should speak directly to the seller or dealer and read any finance terms carefully before agreeing anything.",
    },
    {
      question: "Can private sellers appear on this page?",
      answer: "This page is based on listing details. If a seller says finance may be available, the listing can appear here, but buyers should verify it directly.",
    },
  ],
};

export default async function CarsOnFinancePage() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <BrowseClient
      initialCars={listings}
      initialFilters={{ finance: "true" }}
      initialLoadError={error}
      landingContent={landingContent}
    />
  );
}

import BrowseClient from "../browse/BrowseClient";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Family SUV Cars for Sale | Kerb Car",
  description:
    "Browse practical family SUV and crossover cars for sale on Kerb Car.",
};

const landingContent = {
  kicker: "Family SUV cars",
  title: "Browse practical SUV and crossover cars for family life",
  description:
    "Find family SUV and crossover listings with useful details such as mileage, photos, price, fuel type and seller notes. Kerb Car helps you compare options before contacting the seller.",
  points: [
    {
      title: "Space and practicality",
      text: "Look for boot space, seating layout, ISOFIX points and comfort features that fit your daily needs.",
    },
    {
      title: "Running costs",
      text: "Compare fuel type, mileage, tax, tyres and servicing before deciding which SUV is worth viewing.",
    },
    {
      title: "Safety checks",
      text: "Check MOT history, service records, tyres, brakes and any warning lights before agreeing a sale.",
    },
  ],
  faqTitle: "Family SUV questions",
  faqs: [
    {
      question: "What listings appear on this page?",
      answer: "This page focuses on listings that look like SUVs, crossovers, 4x4s or family-focused cars based on their advert details.",
    },
    {
      question: "Does Kerb Car check the vehicle condition?",
      answer: "No. Buyers should inspect the car, review documents and consider independent checks before buying.",
    },
    {
      question: "Can I contact the seller before viewing?",
      answer: "Yes. Use the enquiry button on a listing to ask questions and arrange next steps directly with the seller.",
    },
  ],
};

export default async function FamilySuvsPage() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <BrowseClient
      initialCars={listings}
      initialFilters={{ category: "family-suv" }}
      initialLoadError={error}
      landingContent={landingContent}
    />
  );
}

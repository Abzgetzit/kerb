import BrowseClient from "../browse/BrowseClient";
import SeoBottomContent from "../components/SeoBottomContent";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Performance Cars for Sale | Kerb Car",
  description:
    "Browse performance cars, hot hatches and sports models for sale on Kerb Car.",
};

const landingContent = {
  kicker: "Performance cars",
  title: "Browse performance cars, hot hatches and sports models",
  description:
    "Compare performance-focused listings on Kerb Car, including sporty trims, hot hatches and higher-powered models. Check the advert carefully and contact the seller directly before viewing.",
  points: [
    {
      title: "Sporty models and trims",
      text: "Find listings with performance keywords, trims and models such as GTI, M Sport, AMG, S line, RS and similar.",
    },
    {
      title: "Condition matters",
      text: "Look closely at service history, tyres, brakes, modifications, warning lights and ownership notes.",
    },
    {
      title: "Ask before travelling",
      text: "Use Kerb Car enquiries to ask about maintenance, faults, finance status and test-drive arrangements.",
    },
  ],
  faqTitle: "Performance car questions",
  faqs: [
    {
      question: "Are all listings on this page high-performance cars?",
      answer: "Listings are filtered using advert details and performance-related terms. Buyers should confirm the exact specification with the seller.",
    },
    {
      question: "Should I check for modifications?",
      answer: "Yes. Ask the seller about modifications, insurance implications, service records and whether any changes are declared.",
    },
    {
      question: "Does Kerb Car warranty performance cars?",
      answer: "No. Kerb Car is a marketplace and does not warranty, inspect or sell vehicles directly.",
    },
  ],
};

export default async function PerformanceCarsPage() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <>
      <BrowseClient
        initialCars={listings}
        initialFilters={{ category: "performance" }}
        initialLoadError={error}
      />
      <SeoBottomContent content={landingContent} />
    </>
  );
}

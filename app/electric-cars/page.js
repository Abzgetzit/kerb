import BrowseClient from "../browse/BrowseClient";
import SeoBottomContent from "../components/SeoBottomContent";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Electric and Hybrid Cars for Sale | Kerb Car",
  description:
    "Browse electric and hybrid cars for sale on Kerb Car from private sellers and dealers.",
};

const landingContent = {
  kicker: "Electric and hybrid cars",
  title: "Browse electric and hybrid cars on Kerb Car",
  description:
    "Compare EV, plug-in hybrid and hybrid listings from UK sellers. Use Kerb Car to check photos, mileage, price, location and seller notes before making an enquiry.",
  points: [
    {
      title: "EV and hybrid filters",
      text: "This page focuses on electric, hybrid, plug-in hybrid and EV-related listings.",
    },
    {
      title: "Check the details",
      text: "Look for battery size, range, charging cables, service history and any warranty information the seller provides.",
    },
    {
      title: "Contact sellers directly",
      text: "Send an enquiry through Kerb Car and ask practical questions before viewing or test driving.",
    },
  ],
  faqTitle: "Electric car questions",
  faqs: [
    {
      question: "Does Kerb Car verify electric range or battery health?",
      answer: "No. Kerb Car is a marketplace and does not inspect vehicles. Buyers should ask the seller for details and consider independent checks.",
    },
    {
      question: "Can hybrids appear on this page?",
      answer: "Yes. The page includes electric and hybrid cars where the listing details suggest electric, hybrid, EV or PHEV.",
    },
    {
      question: "What should I check before buying an electric car?",
      answer: "Check battery condition, charging options, service records, MOT history, warranty status and whether the car suits your normal driving needs.",
    },
  ],
};

export default async function ElectricCarsPage() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <>
      <BrowseClient
        initialCars={listings}
        initialFilters={{ category: "electric-hybrid" }}
        initialLoadError={error}
      />
      <SeoBottomContent content={landingContent} />
    </>
  );
}

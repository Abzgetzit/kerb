import BrowseClient from "../browse/BrowseClient";
import SeoBottomContent from "../components/SeoBottomContent";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "First Cars for Sale | Kerb Car",
  description:
    "Browse affordable first cars and small hatchbacks for sale on Kerb Car.",
};

const landingContent = {
  kicker: "First cars on Kerb Car",
  title: "Find affordable first cars with clear listing details",
  description:
    "Browse smaller, affordable and practical cars that may suit new drivers. Kerb Car helps buyers compare price, mileage, photos and seller notes before making an enquiry.",
  points: [
    {
      title: "Budget-friendly filters",
      text: "Narrow listings by price, mileage, make and model to find cars that fit your budget.",
    },
    {
      title: "Practical details",
      text: "Check MOT, insurance group, running costs, condition and service history before arranging a viewing.",
    },
    {
      title: "Direct seller contact",
      text: "Message sellers through Kerb Car and ask the right questions before travelling to view a car.",
    },
  ],
  faqTitle: "First car questions",
  faqs: [
    {
      question: "What makes a good first car?",
      answer: "Many buyers look for sensible insurance costs, good fuel economy, manageable mileage, clear service history and honest condition notes.",
    },
    {
      question: "Does Kerb Car inspect first cars?",
      answer: "No. Kerb Car is a marketplace. Buyers should carry out their own checks and consider independent inspections where useful.",
    },
    {
      question: "Can I save first cars to compare later?",
      answer: "Yes. Sign in to Kerb Car to save cars and compare your options from your account.",
    },
  ],
};

export default async function FirstCarsPage() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <>
      <BrowseClient
        initialCars={listings}
        initialFilters={{ category: "first-car" }}
        initialLoadError={error}
      />
      <SeoBottomContent content={landingContent} />
    </>
  );
}

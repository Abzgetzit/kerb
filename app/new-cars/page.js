import BrowseClient from "../browse/BrowseClient";
import SeoBottomContent from "../components/SeoBottomContent";
import { fetchApprovedListings } from "../lib/kerb-server-listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Newer Used Cars for Sale | Kerb Car",
  description:
    "Browse newer and nearly-new used cars for sale on Kerb Car from private sellers and dealers.",
  alternates: {
    canonical: "https://kerbcar.co.uk/new-cars",
  },
};

const landingContent = {
  kicker: "Newer cars on Kerb Car",
  title: "Find newer and nearly-new cars from UK sellers",
  description:
    "Browse cars that are recent, low-age or marked as new by sellers. Kerb Car helps you compare listings, photos, mileage, price and seller details in one simple marketplace.",
  points: [
    {
      title: "Recent models",
      text: "Filter newer listings by make, model, price and mileage without leaving the marketplace.",
    },
    {
      title: "Private and dealer sellers",
      text: "Kerb Car connects buyers and sellers directly, so always check the advert and seller details before buying.",
    },
    {
      title: "Simple enquiries",
      text: "Message the seller from the listing page and keep important details clear before arranging a viewing.",
    },
  ],
  faqTitle: "New car marketplace questions",
  faqs: [
    {
      question: "Are all cars on this page brand new?",
      answer: "No. This page can include newer, nearly-new or seller-marked new cars. Always check the listing year, mileage, condition and seller notes.",
    },
    {
      question: "Does Kerb Car sell the cars directly?",
      answer: "No. Kerb Car is a marketplace. Buyers and sellers agree viewings, payment and collection directly.",
    },
    {
      question: "Can I filter new cars by make and model?",
      answer: "Yes. Use the search filters below to narrow listings by make, model, location, price, mileage and more.",
    },
  ],
};

export default async function Page() {
  const { listings, error } = await fetchApprovedListings();

  return (
    <>
      <BrowseClient
        initialCars={listings}
        initialFilters={{ category: "newer-car" }}
        initialLoadError={error}
      />
      <SeoBottomContent content={landingContent} />
    </>
  );
}

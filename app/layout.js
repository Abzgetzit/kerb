import "./globals.css";
import "./post-chat-size-fixes.css";
import "./chat-privacy-final.css";
import "./short-description-fix.css";
import "./bids-hero-final.css";
import BrowseHeadingCleaner from "./components/BrowseHeadingCleaner";
import KerbClientEnhancements from "./components/KerbClientEnhancements";
import MobileListingContactButton from "./components/MobileListingContactButton";
import HomeBidsAndBidHeroFix from "./components/HomeBidsAndBidHeroFix";
import BidPageReplacement from "./components/BidPageReplacement";
import PostCarBidTabs from "./components/PostCarBidTabs";
import MobileAccountCompact from "./components/MobileAccountCompact";
import MobilePostCarWizard from "./components/MobilePostCarWizard";

export const metadata = {
  metadataBase: new URL("https://kerbcar.co.uk"),
  title: {
    default: "Kerb Car | Buy and Sell Used Cars in the UK",
    template: "%s",
  },
  description:
    "Browse used cars, list your car for free and connect with buyers and sellers across the UK on Kerb Car.",
  openGraph: {
    title: "Kerb Car | Buy and Sell Used Cars in the UK",
    description:
      "Browse used cars, list your car for free and connect with buyers and sellers across the UK on Kerb Car.",
    url: "https://kerbcar.co.uk",
    siteName: "Kerb Car",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerb Car | Buy and Sell Used Cars in the UK",
    description:
      "Browse used cars, list your car for free and connect with buyers and sellers across the UK on Kerb Car.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BrowseHeadingCleaner />
        <KerbClientEnhancements />
        <MobileListingContactButton />
        <HomeBidsAndBidHeroFix />
        <PostCarBidTabs />
        <MobilePostCarWizard />
        <MobileAccountCompact />
        <BidPageReplacement />
        {children}
      </body>
    </html>
  );
}

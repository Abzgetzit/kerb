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
import PostCarSafariUploadFix from "./components/PostCarSafariUploadFix";
import BidListingSubmissionFix from "./components/BidListingSubmissionFix";
import ListingBidsNavFix from "./components/ListingBidsNavFix";
import BidSellerContactDetails from "./components/BidSellerContactDetails";

const baseUrl = "https://kerbcar.co.uk";
const defaultTitle = "Kerb | Buy and Sell Used Cars in the UK";
const defaultDescription =
  "Kerb is a UK car marketplace for buying and selling used cars. Browse cars, list your car for free and contact sellers directly.";

const brandSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: `${baseUrl}/`,
      name: "Kerb",
      alternateName: ["Kerb Car", "Kerb UK Car Marketplace"],
      description: defaultDescription,
      inLanguage: "en-GB",
      publisher: { "@id": `${baseUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/browse?keyword={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "OnlineBusiness",
      "@id": `${baseUrl}/#organization`,
      url: `${baseUrl}/`,
      name: "Kerb",
      alternateName: "Kerb Car",
      description: defaultDescription,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/kerb-logo.svg`,
        contentUrl: `${baseUrl}/kerb-logo.svg`,
        width: 512,
        height: 512,
      },
      email: "hello@kerbcar.co.uk",
      areaServed: {
        "@type": "Country",
        name: "United Kingdom",
      },
    },
  ],
};

function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: "Kerb",
  title: {
    default: defaultTitle,
    template: "%s",
  },
  description: defaultDescription,
  keywords: [
    "Kerb",
    "Kerb Car",
    "used cars UK",
    "cars for sale UK",
    "sell my car",
    "UK car marketplace",
  ],
  authors: [{ name: "Kerb", url: baseUrl }],
  creator: "Kerb",
  publisher: "Kerb",
  category: "automotive",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: baseUrl,
    siteName: "Kerb",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/cars/hero-car.png",
        alt: "Kerb UK car marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/cars/hero-car.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(brandSchema) }}
        />
        <BrowseHeadingCleaner />
        <KerbClientEnhancements />
        <MobileListingContactButton />
        <HomeBidsAndBidHeroFix />
        <PostCarBidTabs />
        <MobilePostCarWizard />
        <PostCarSafariUploadFix />
        <BidListingSubmissionFix />
        <ListingBidsNavFix />
        <BidSellerContactDetails />
        <MobileAccountCompact />
        <BidPageReplacement />
        {children}
      </body>
    </html>
  );
}

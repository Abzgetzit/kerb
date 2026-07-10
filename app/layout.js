import "./globals.css";
import BrowseHeadingCleaner from "./components/BrowseHeadingCleaner";
import KerbClientEnhancements from "./components/KerbClientEnhancements";

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
        {children}
      </body>
    </html>
  );
}

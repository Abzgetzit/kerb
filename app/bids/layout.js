const baseUrl = "https://kerbcar.co.uk";

export const metadata = {
  title: "Car Bids | Kerb",
  description:
    "Browse cars open to private bids on Kerb and submit the highest amount you would genuinely pay directly to the seller.",
  alternates: {
    canonical: `${baseUrl}/bids`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Car Bids | Kerb",
    description:
      "Browse cars open to private bids and send your best offer directly to the seller on Kerb.",
    url: `${baseUrl}/bids`,
    siteName: "Kerb",
    locale: "en_GB",
    type: "website",
    images: [`${baseUrl}/cars/bids-hero-car.png`],
  },
};

export default function BidsLayout({ children }) {
  return children;
}

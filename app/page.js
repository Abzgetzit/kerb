import HomeClient from "./HomeClient";

const baseUrl = "https://kerbcar.co.uk";
const title = "Kerb | Buy and Sell Used Cars in the UK";
const description =
  "Kerb is a UK car marketplace for buying and selling used cars. Browse cars, list your car for free and contact sellers directly.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: `${baseUrl}/`,
  },
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
    title,
    description,
    url: `${baseUrl}/`,
    siteName: "Kerb",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: `${baseUrl}/cars/hero-car.png`,
        alt: "Kerb UK car marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${baseUrl}/cars/hero-car.png`],
  },
};

export default function HomePage() {
  return <HomeClient />;
}

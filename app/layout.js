export const metadata = {
  metadataBase: new URL("https://kerbcar.co.uk"),
  title: {
    default: "Kerb | Car Marketplace",
    template: "%s | Kerb",
  },
  description: "Find, browse and sell cars with confidence on Kerb.",
  openGraph: {
    title: "Kerb | Car Marketplace",
    description: "Find, browse and sell cars with confidence on Kerb.",
    url: "https://kerbcar.co.uk",
    siteName: "Kerb",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

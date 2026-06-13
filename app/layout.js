export const metadata = {
  title: "Kerb | Car Marketplace",
  description: "Find, browse and sell cars with confidence on Kerb.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

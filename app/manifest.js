export default function manifest() {
  return {
    name: "Kerb - UK Car Marketplace",
    short_name: "Kerb",
    description: "Buy and sell used cars across the UK with Kerb.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0048ff",
    lang: "en-GB",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}

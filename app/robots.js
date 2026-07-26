export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/account",
          "/login",
          "/saved",
          "/post-car",
          "/boost",
          "/enquiries",
        ],
      },
    ],
    sitemap: "https://kerbcar.co.uk/sitemap.xml",
    host: "https://kerbcar.co.uk",
  };
}

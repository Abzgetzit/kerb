const baseUrl = "https://kerbcar.co.uk";

const routes = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/browse", priority: 0.95, changeFrequency: "daily" },
  { path: "/sell-car", priority: 0.9, changeFrequency: "weekly" },
  { path: "/electric-cars", priority: 0.85, changeFrequency: "daily" },
  { path: "/new-cars", priority: 0.85, changeFrequency: "daily" },
  { path: "/car-finance", priority: 0.8, changeFrequency: "daily" },
  { path: "/first-cars", priority: 0.75, changeFrequency: "daily" },
  { path: "/family-suvs", priority: 0.75, changeFrequency: "daily" },
  { path: "/performance-cars", priority: 0.75, changeFrequency: "daily" },
  { path: "/guides", priority: 0.7, changeFrequency: "weekly" },
  { path: "/guides/how-to-sell-your-car", priority: 0.65, changeFrequency: "monthly" },
  { path: "/guides/buying-a-used-car-safely", priority: 0.65, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.45, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.45, changeFrequency: "monthly" },
  { path: "/safety", priority: 0.55, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.55, changeFrequency: "monthly" },
];

export default function sitemap() {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

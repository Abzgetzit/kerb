import { permanentRedirect } from "next/navigation";

export const metadata = {
  title: "Cars with Finance Available | Kerb Car",
  description:
    "Browse cars where sellers or dealers say finance may be available. Kerb Car does not provide finance.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CarFinanceRedirectPage() {
  permanentRedirect("/cars-on-finance");
}

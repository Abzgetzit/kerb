import Link from "next/link";
import LegalPage, { legalStyles as styles } from "../components/LegalPage";

export const metadata = {
  title: "Legal | Kerb",
  description: "Kerb legal, privacy, cookie and safety information.",
};

export default function LegalHubPage() {
  const cards = [
    {
      href: "/terms",
      title: "Terms and conditions",
      text: "Rules for using Kerb, creating listings, messaging sellers and managing accounts.",
    },
    {
      href: "/privacy",
      title: "Privacy policy",
      text: "How Kerb collects, uses and protects account, listing, enquiry and analytics information.",
    },
    {
      href: "/cookies",
      title: "Cookie policy",
      text: "How Kerb uses essential local storage, cookies and similar browser technologies.",
    },
    {
      href: "/safety",
      title: "Safety advice",
      text: "Simple marketplace safety guidance for buyers, sellers and listing reports.",
    },
  ];

  return (
    <LegalPage
      kicker="Kerb legal"
      title="Legal and safety information"
      description="Key information for using Kerb as a buyer, seller or account holder."
      showHub
    >
      {cards.map((card) => (
        <Link key={card.href} href={card.href} className={styles.hubCard}>
          <strong>{card.title}</strong>
          <span>{card.text}</span>
        </Link>
      ))}
    </LegalPage>
  );
}

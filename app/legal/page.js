import Link from "next/link";
import LegalPage, { legalStyles as styles } from "../components/LegalPage";

export const metadata = {
  title: "Legal and Safety Information | Kerb Car",
  description: "Kerb Car legal, privacy, cookie, support and safety information.",
};

export default function LegalHubPage() {
  const cards = [
    {
      href: "/terms",
      title: "Terms and conditions",
      text: "Rules for using Kerb Car, creating listings, messaging sellers and managing accounts.",
    },
    {
      href: "/privacy",
      title: "Privacy policy",
      text: "How Kerb Car collects, uses and protects account, listing, enquiry and analytics information.",
    },
    {
      href: "/cookies",
      title: "Cookie policy",
      text: "How Kerb Car uses essential local storage, cookies and similar browser technologies.",
    },
    {
      href: "/safety",
      title: "Safety advice",
      text: "Simple marketplace safety guidance for buyers, sellers and listing reports.",
    },
    {
      href: "/contact",
      title: "Contact support",
      text: "Get help with Kerb Car accounts, listings, enquiries, reports and general marketplace questions.",
    },
  ];

  return (
    <LegalPage
      kicker="Kerb Car legal"
      title="Legal and safety information"
      description="Key information for using Kerb Car as a buyer, seller or account holder."
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

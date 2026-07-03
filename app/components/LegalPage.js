import Link from "next/link";
import styles from "./LegalPage.module.css";

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/safety", label: "Safety" },
  { href: "/contact", label: "Contact support" },
];

export default function LegalPage({
  kicker,
  title,
  description,
  lastUpdated = "23 June 2026",
  children,
  showHub = false,
}) {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          Kerb
        </Link>

        <div className={styles.navLinks}>
          <Link href="/browse">Browse cars</Link>
          <Link href="/sell-car">Sell your car</Link>
          <Link href="/account">My account</Link>
        </div>
      </nav>

      <div className={styles.shell}>
        <section className={styles.hero}>
          <span className={styles.kicker}>{kicker}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          {lastUpdated ? (
            <span className={styles.updated}>Last updated: {lastUpdated}</span>
          ) : null}
        </section>

        {showHub ? (
          <section className={styles.hubGrid}>{children}</section>
        ) : (
          <div className={styles.grid}>
            <article className={styles.content}>{children}</article>

            <aside className={styles.sideCard}>
              <h2>Helpful pages</h2>
              <div className={styles.sideLinks}>
                {legalLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <span>Kerb Car is a marketplace, not a direct car seller.</span>
        <span>
          <Link href="/legal">Legal hub</Link>
        </span>
      </footer>
    </main>
  );
}

export { styles as legalStyles };

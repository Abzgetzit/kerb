import Link from "next/link";

export const metadata = {
  title: "Car guides | Kerb",
  description: "Helpful Kerb guides for buying and selling cars safely.",
};

export default function GuidesPage() {
  return (
    <main className="page">
      <header className="navbar">
        <Link href="/" className="logo">Kerb</Link>
        <nav>
          <Link href="/browse">Browse cars</Link>
          <Link href="/sell-car">Sell your car</Link>
          <Link href="/new-cars">New cars</Link>
          <Link href="/electric-cars">Electric</Link>
          <Link href="/car-finance">Cars with finance available</Link>
        </nav>
      </header>

      <section className="hero">
        <span>Kerb guides</span>
        <h1>Helpful car guides</h1>
        <p>
          Simple guides for selling, buying and browsing cars on Kerb. Kerb is a marketplace,
          not a direct car seller, finance provider or vehicle inspection service.
        </p>
      </section>

      <section className="grid">
        <Link href="/guides/how-to-sell-your-car">
          <strong>Selling</strong>
          <h2>How to sell your car</h2>
          <p>Create a clean listing, upload the right photos and manage buyer enquiries.</p>
        </Link>

        <Link href="/guides/buying-a-used-car-safely">
          <strong>Buying safely</strong>
          <h2>Buying a used car safely</h2>
          <p>What to check before viewing, test driving, paying for or collecting a car.</p>
        </Link>

        <Link href="/electric-cars">
          <strong>Electric cars</strong>
          <h2>Browse electric and hybrid cars</h2>
          <p>Find electric and hybrid listings currently available on Kerb.</p>
        </Link>
      </section>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f9fd; }
  .page { min-height: 100vh; padding: 22px 40px 44px; color: #071126; font-family: Inter, Arial, sans-serif; background: #f7f9fd; }
  .navbar { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 24px; }
  .logo { font-size: 38px; font-weight: 950; color: #0048ff; text-decoration: none; letter-spacing: -2px; }
  nav { display: flex; flex-wrap: wrap; gap: 16px; font-weight: 900; }
  nav a { color: #101832; text-decoration: none; }
  .hero { border: 1px solid #dfe8f7; border-radius: 34px; background: linear-gradient(135deg, #fff, #eef5ff); padding: 44px; box-shadow: 0 24px 60px rgba(14,30,70,.08); }
  .hero span { display: inline-flex; background: #eaf1ff; color: #0048ff; font-weight: 950; padding: 10px 16px; border-radius: 999px; margin-bottom: 20px; }
  h1 { margin: 0; font-size: clamp(42px, 7vw, 78px); letter-spacing: -4px; line-height: .95; }
  .hero p, .grid p { color: #53617a; font-weight: 750; line-height: 1.65; }
  .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 22px; }
  .grid a { background: #fff; border: 1px solid #dfe8f7; border-radius: 26px; padding: 26px; color: #071126; text-decoration: none; box-shadow: 0 18px 46px rgba(14,30,70,.06); }
  .grid strong { color: #0048ff; }
  .grid h2 { margin: 10px 0; }
  @media (max-width: 850px) { .page { padding: 16px; } nav { display: none; } .hero, .grid a { padding: 24px; } .grid { grid-template-columns: 1fr; } h1 { letter-spacing: -2px; } }
`;

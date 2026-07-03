import Link from "next/link";

export const metadata = {
  title: "Buying a used car safely | Kerb Guides",
  description: "Kerb safety advice for checking a used car before viewing, test driving, paying or collecting.",
};

export default function BuyingSafelyGuidePage() {
  return (
    <main className="page">
      <header className="navbar">
        <Link href="/" className="logo">Kerb</Link>
        <Link href="/guides" className="backLink">Back to guides</Link>
      </header>

      <article className="article">
        <span>Buyer guide</span>
        <h1>Buying a used car safely</h1>
        <p>Kerb connects buyers and sellers, but buyers should independently check every car before agreeing a sale. Kerb does not inspect, warrant, finance or deliver vehicles.</p>

        <h2>1. Check the advert carefully</h2>
        <p>Look for clear photos, matching details, sensible pricing, mileage, MOT information and honest condition notes.</p>

        <h2>2. View the car before paying</h2>
        <p>Where possible, see the car in person and check the V5C, MOT history, service history, mileage and seller identity.</p>

        <h2>3. Be careful with pressure tactics</h2>
        <p>Walk away if the seller rushes you, avoids basic checks, uses unusual payment links or says delivery is the only option.</p>

        <h2>4. Consider a vehicle history check</h2>
        <p>A history check can help identify finance, theft, write-off markers and mileage issues.</p>

        <h2>5. Pay safely</h2>
        <p>Make sure funds and documents are handled carefully. Do not send money if anything feels wrong.</p>

        <div className="cta">
          <h2>Browse cars on Kerb</h2>
          <p>Search live listings and message sellers directly.</p>
          <Link href="/browse">Browse cars</Link>
        </div>
      </article>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f9fd; }
  .page { min-height: 100vh; padding: 22px 40px 44px; color: #071126; font-family: Inter, Arial, sans-serif; background: #f7f9fd; }
  .navbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .logo { font-size: 38px; font-weight: 950; color: #0048ff; text-decoration: none; letter-spacing: -2px; }
  .backLink { color: #0048ff; font-weight: 950; text-decoration: none; }
  .article { max-width: 900px; margin: 0 auto; background: #fff; border: 1px solid #dfe8f7; border-radius: 34px; padding: 44px; box-shadow: 0 24px 60px rgba(14,30,70,.08); }
  span { display: inline-flex; background: #eaf1ff; color: #0048ff; font-weight: 950; padding: 10px 16px; border-radius: 999px; margin-bottom: 18px; }
  h1 { margin: 0 0 18px; font-size: clamp(40px, 7vw, 72px); letter-spacing: -4px; line-height: .95; }
  h2 { margin-top: 30px; }
  p { color: #53617a; font-weight: 750; line-height: 1.7; }
  .cta { margin-top: 32px; padding: 24px; border-radius: 24px; background: #eef5ff; border: 1px solid #d8e4ff; }
  .cta a { display: inline-flex; margin-top: 8px; background: #0048ff; color: #fff; text-decoration: none; padding: 14px 18px; border-radius: 16px; font-weight: 950; }
  @media (max-width: 760px) { .page { padding: 16px; } .article { padding: 24px; } h1 { letter-spacing: -2px; } }
`;

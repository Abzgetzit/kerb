import Link from "next/link";

export const metadata = {
  title: "How to sell your car | Kerb Guides",
  description: "A simple guide to selling your car on Kerb with clear details, real photos and safe buyer enquiries.",
};

export default function SellGuidePage() {
  return (
    <main className="page">
      <header className="navbar">
        <Link href="/" className="logo">Kerb</Link>
        <Link href="/guides" className="backLink">Back to guides</Link>
      </header>

      <article className="article">
        <span>Seller guide</span>
        <h1>How to sell your car on Kerb</h1>
        <p>Kerb helps you create a clear car advert and receive buyer enquiries. You remain responsible for the car, advert details, viewings, payment and ownership transfer.</p>

        <h2>1. Prepare your car details</h2>
        <p>Have the make, model, type, spec, year, mileage, fuel type, gearbox, body type, condition and asking price ready before starting.</p>

        <h2>2. Use real photos</h2>
        <p>Upload clear photos of the front, rear, sides, interior, dashboard, wheels and any marks buyers should know about.</p>

        <h2>3. Be honest about the condition</h2>
        <p>Mention issues such as finance, accident damage, warning lights, mileage concerns, category markers, service history gaps or mechanical problems.</p>

        <h2>4. Choose public contact options</h2>
        <p>Kerb lets you choose whether your name and phone number appear publicly. Buyers can still message you through Kerb if your phone number is hidden.</p>

        <h2>5. Manage enquiries safely</h2>
        <p>Reply clearly, arrange safe viewings and do not hand over keys, documents or the vehicle until payment has fully cleared.</p>

        <div className="cta">
          <h2>Ready to start?</h2>
          <p>Create your listing for free during Kerb early access.</p>
          <Link href="/sell-car">Start your free listing</Link>
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

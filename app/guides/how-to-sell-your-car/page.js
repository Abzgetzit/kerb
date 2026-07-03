import Link from "next/link";

export const metadata = {
  title: "How to Sell Your Car Online | Kerb Car Guide",
  description:
    "A simple Kerb Car guide to selling your car online with clear details, real photos and safe buyer enquiries.",
};

const steps = [
  {
    title: "Prepare your car details",
    text: "Have the make, model, spec, year, mileage, fuel type, gearbox, body type, condition and asking price ready before starting.",
  },
  {
    title: "Use real photos",
    text: "Upload clear photos of the front, rear, sides, interior, dashboard, wheels and any marks buyers should know about.",
  },
  {
    title: "Be honest about condition",
    text: "Mention finance, accident damage, warning lights, service history gaps, mileage concerns or mechanical problems.",
  },
  {
    title: "Choose contact options",
    text: "Choose whether your name and phone number appear publicly. Buyers can still message you if your phone number is hidden.",
  },
  {
    title: "Manage enquiries safely",
    text: "Reply clearly, arrange safe viewings and do not hand over keys, documents or the vehicle until payment has fully cleared.",
  },
];

export default function SellGuidePage() {
  return (
    <main className="guideArticlePage">
      <header className="navbar">
        <Link href="/" className="logo">Kerb</Link>
        <Link href="/guides" className="backLink">Back to guides</Link>
      </header>

      <section className="hero">
        <div>
          <span>Seller guide</span>
          <h1>How to sell your car on Kerb Car</h1>
          <p>
            Create a clearer advert, build buyer trust and manage enquiries safely.
            You remain responsible for the car, advert details, viewings, payment and ownership transfer.
          </p>
          <div className="heroActions">
            <Link href="/sell-car">Start your free listing</Link>
            <Link href="/contact" className="secondary">Contact support</Link>
          </div>
        </div>

        <aside>
          <strong>Seller checklist</strong>
          <ul>
            <li>Real photos</li>
            <li>Accurate mileage</li>
            <li>Honest condition</li>
            <li>Safe payment</li>
          </ul>
        </aside>
      </section>

      <section className="stepGrid">
        {steps.map((step, index) => (
          <article key={step.title}>
            <em>{String(index + 1).padStart(2, "0")}</em>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </article>
        ))}
      </section>

      <section className="cta">
        <div>
          <h2>Ready to start?</h2>
          <p>Create your listing for free during Kerb Car early access and manage buyer enquiries from your account.</p>
        </div>
        <Link href="/sell-car">Start selling</Link>
      </section>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f9fd; }
  .guideArticlePage { min-height: 100vh; padding: 22px 40px 44px; color: #071126; font-family: Inter, Arial, sans-serif; background: radial-gradient(circle at top left, rgba(0,72,255,.07), transparent 32%), #f7f9fd; }
  .navbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .logo { font-size: 38px; font-weight: 950; color: #0048ff; text-decoration: none; letter-spacing: -2px; }
  .backLink { color: #0048ff; font-weight: 950; text-decoration: none; }
  .hero { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 22px; align-items: stretch; border: 1px solid #dfe8f7; border-radius: 34px; padding: clamp(26px, 4vw, 44px); background: radial-gradient(circle at 82% 24%, rgba(0,72,255,.14), transparent 30%), linear-gradient(135deg, #fff, #eef5ff); box-shadow: 0 24px 60px rgba(14,30,70,.08); }
  .hero span { display: inline-flex; background: #eaf1ff; color: #0048ff; font-weight: 950; padding: 10px 16px; border-radius: 999px; margin-bottom: 18px; }
  h1 { margin: 0 0 18px; font-size: clamp(48px, 8vw, 86px); letter-spacing: -4px; line-height: .92; max-width: 900px; }
  .hero p, .stepGrid p, .cta p { color: #53617a; font-weight: 750; line-height: 1.7; }
  .heroActions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
  .heroActions a, .cta a { display: inline-flex; align-items: center; justify-content: center; min-height: 50px; border-radius: 16px; background: #0048ff; color: #fff; text-decoration: none; padding: 0 20px; font-weight: 950; box-shadow: 0 14px 30px rgba(0,72,255,.2); }
  .heroActions .secondary { background: #eef4ff; color: #0048ff; box-shadow: none; }
  aside { border: 1px solid #d9e5f8; border-radius: 28px; background: rgba(255,255,255,.88); padding: 24px; box-shadow: 0 18px 44px rgba(14,30,70,.08); }
  aside strong { display: block; font-size: 24px; letter-spacing: -.6px; margin-bottom: 16px; }
  aside ul { display: grid; gap: 10px; padding: 0; margin: 0; list-style: none; }
  aside li { background: #eef4ff; color: #0048ff; border-radius: 14px; padding: 12px 13px; font-weight: 950; }
  .stepGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
  .stepGrid article { border: 1px solid #dfe8f7; border-radius: 28px; background: #fff; padding: 26px; box-shadow: 0 18px 46px rgba(14,30,70,.06); }
  .stepGrid em { width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border-radius: 15px; background: #0048ff; color: #fff; font-style: normal; font-weight: 950; margin-bottom: 18px; }
  .stepGrid h2, .cta h2 { margin: 0 0 10px; font-size: clamp(26px, 3vw, 36px); letter-spacing: -1px; line-height: 1.05; }
  .cta { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 24px; border-radius: 28px; background: #071126; color: #fff; padding: 28px; box-shadow: 0 18px 46px rgba(14,30,70,.1); }
  .cta p { color: #c8d4ea; margin: 0; }
  .cta a { background: #fff; color: #0048ff; box-shadow: none; flex: 0 0 auto; }
  @media (max-width: 850px) { .guideArticlePage { padding: 16px; } .hero, .stepGrid { grid-template-columns: 1fr; } .cta { flex-direction: column; align-items: flex-start; } h1 { letter-spacing: -2.5px; } }
`;

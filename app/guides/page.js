import Link from "next/link";

export const metadata = {
  title: "Car Buying and Selling Guides | Kerb Car",
  description:
    "Read Kerb Car guides on selling your car, buying safely and using the marketplace with confidence.",
};

const guides = [
  {
    href: "/guides/how-to-sell-your-car",
    label: "Seller guide",
    title: "How to sell your car",
    text: "Prepare the advert, upload the right photos and handle buyer enquiries clearly.",
    points: ["Listing photos", "Advert wording", "Safe enquiries"],
  },
  {
    href: "/guides/buying-a-used-car-safely",
    label: "Buyer safety",
    title: "Buying a used car safely",
    text: "Know what to check before viewing, test driving, paying for or collecting a car.",
    points: ["MOT checks", "Payment safety", "Seller warning signs"],
  },
  {
    href: "/electric-cars",
    label: "Electric cars",
    title: "Browse electric and hybrid cars",
    text: "Compare EV and hybrid listings currently available from sellers on Kerb Car.",
    points: ["EV filters", "Hybrid listings", "Seller questions"],
  },
];

export default function GuidesPage() {
  return (
    <main className="guidesPage">
      <header className="navbar">
        <Link href="/" className="logo">Kerb</Link>
        <nav>
          <Link href="/browse">Browse cars</Link>
          <Link href="/sell-car">Sell your car</Link>
          <Link href="/new-cars">New cars</Link>
          <Link href="/electric-cars">Electric</Link>
          <Link href="/cars-on-finance">Cars with finance available</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="heroText">
          <span>Kerb Car guides</span>
          <h1>Helpful car guides</h1>
          <p>
            Quick, practical guides for buying, selling and browsing cars on Kerb Car.
            Kerb Car is a marketplace, not a direct seller, finance provider or inspection service.
          </p>
          <div className="heroActions">
            <Link href="/browse">Browse cars</Link>
            <Link href="/sell-car" className="secondary">Start selling</Link>
          </div>
        </div>

        <aside className="heroPanel">
          <strong>Use Kerb Car with confidence</strong>
          <p>Check listings carefully, ask sellers clear questions and use the support pages when something does not feel right.</p>
          <div>
            <span>Buyer checks</span>
            <span>Seller tips</span>
            <span>Safety advice</span>
          </div>
        </aside>
      </section>

      <section className="guideGrid">
        {guides.map((guide, index) => (
          <Link href={guide.href} className="guideCard" key={guide.href}>
            <em>{String(index + 1).padStart(2, "0")}</em>
            <span>{guide.label}</span>
            <h2>{guide.title}</h2>
            <p>{guide.text}</p>
            <ul>
              {guide.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
          </Link>
        ))}
      </section>

      <section className="trustStrip">
        <div>
          <h2>Simple advice, built around real marketplace use</h2>
          <p>These guides are made to support Kerb Car buyers and sellers before they enquire, view, list or manage a car.</p>
        </div>
        <Link href="/safety">Read safety advice</Link>
      </section>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f9fd; }
  .guidesPage { min-height: 100vh; padding: 22px 40px 44px; color: #071126; font-family: Inter, Arial, sans-serif; background: radial-gradient(circle at top left, rgba(0,72,255,.07), transparent 32%), #f7f9fd; }
  .navbar { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 24px; }
  .logo { font-size: 38px; font-weight: 950; color: #0048ff; text-decoration: none; letter-spacing: -2px; }
  nav { display: flex; flex-wrap: wrap; gap: 18px; font-weight: 900; }
  nav a { color: #101832; text-decoration: none; }
  nav a:hover { color: #0048ff; }
  .hero { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 22px; align-items: stretch; border: 1px solid #dfe8f7; border-radius: 34px; background: radial-gradient(circle at 82% 24%, rgba(0,72,255,.14), transparent 30%), linear-gradient(135deg, #fff, #eef5ff); padding: clamp(26px, 4vw, 44px); box-shadow: 0 24px 60px rgba(14,30,70,.08); }
  .heroText > span, .guideCard > span { display: inline-flex; background: #eaf1ff; color: #0048ff; font-weight: 950; padding: 10px 16px; border-radius: 999px; margin-bottom: 18px; }
  h1 { margin: 0; font-size: clamp(48px, 8vw, 86px); letter-spacing: -4px; line-height: .92; max-width: 850px; }
  .hero p, .guideCard p, .trustStrip p, .heroPanel p { color: #53617a; font-weight: 750; line-height: 1.65; }
  .heroActions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
  .heroActions a, .trustStrip a { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; border-radius: 16px; background: #0048ff; color: white; text-decoration: none; padding: 0 20px; font-weight: 950; box-shadow: 0 14px 30px rgba(0,72,255,.2); }
  .heroActions .secondary { background: #eef4ff; color: #0048ff; box-shadow: none; }
  .heroPanel { display: flex; flex-direction: column; justify-content: space-between; gap: 16px; border: 1px solid #d9e5f8; border-radius: 28px; background: rgba(255,255,255,.86); padding: 24px; box-shadow: 0 18px 44px rgba(14,30,70,.08); }
  .heroPanel strong { font-size: 24px; letter-spacing: -.6px; }
  .heroPanel div { display: flex; flex-wrap: wrap; gap: 8px; }
  .heroPanel div span { background: #eef4ff; color: #0048ff; border-radius: 999px; padding: 8px 10px; font-size: 12px; font-weight: 950; }
  .guideGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
  .guideCard { position: relative; display: flex; min-height: 330px; flex-direction: column; border: 1px solid #dfe8f7; border-radius: 28px; background: #fff; color: #071126; padding: 26px; text-decoration: none; box-shadow: 0 18px 46px rgba(14,30,70,.06); transition: transform .18s ease, box-shadow .18s ease; }
  .guideCard:hover { transform: translateY(-3px); box-shadow: 0 26px 60px rgba(14,30,70,.12); }
  .guideCard em { width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; border-radius: 15px; background: #0048ff; color: white; font-style: normal; font-weight: 950; margin-bottom: 18px; }
  .guideCard h2 { margin: 0 0 12px; font-size: 29px; letter-spacing: -.9px; line-height: 1.05; }
  .guideCard ul { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; margin: auto 0 0; list-style: none; }
  .guideCard li { background: #f0f5ff; color: #0048ff; border-radius: 999px; padding: 8px 10px; font-size: 12px; font-weight: 950; }
  .trustStrip { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-top: 24px; border: 1px solid #dfe8f7; border-radius: 28px; background: #071126; color: white; padding: 28px; box-shadow: 0 18px 46px rgba(14,30,70,.1); }
  .trustStrip h2 { margin: 0 0 8px; font-size: clamp(26px, 4vw, 42px); letter-spacing: -1.3px; }
  .trustStrip p { margin: 0; color: #c8d4ea; }
  .trustStrip a { background: white; color: #0048ff; box-shadow: none; flex: 0 0 auto; }
  @media (max-width: 950px) { .guidesPage { padding: 16px; } nav { display: none; } .hero { grid-template-columns: 1fr; } .guideGrid { grid-template-columns: 1fr; } .trustStrip { flex-direction: column; align-items: flex-start; } h1 { letter-spacing: -2.5px; } }
`;

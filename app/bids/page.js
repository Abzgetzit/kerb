import Link from "next/link";
import SiteMenu from "../components/SiteMenu";

export const metadata = {
  title: "Car Bids | Kerb Car",
  description:
    "Make private bids on cars listed on Kerb Car. Send the highest amount you would genuinely pay, visible only to the seller.",
};

const bidHeroImage =
  "data:image/webp;base64,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";

function Icon({ name }) {
  const icons = {
    car: <path d="M5 15h14l-1.8-5.2A3 3 0 0 0 14.4 8H9.6a3 3 0 0 0-2.8 1.8L5 15Zm1.5 0v3m11-3v3M8 18h.01M16 18h.01" />,
    bid: <path d="M20 12l-8 8-8-8V4h16v8Zm-9-4h2m-1-1v6m-3-3h6" />,
    new: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />,
    sell: <path d="M4 7h10l6 6-7 7-9-9V7Zm4 4h.01" />,
    electric: <path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" />,
    finance: <><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M3 10h18M7 15h3" /></>,
    guide: <><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z" /><path d="M9 8h6M9 12h5" /></>,
    heart: <path d="M20.8 8.6c0 5.2-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.6A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.8 1.9Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
    location: <><path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
    pound: <path d="M15 6.5a3.5 3.5 0 0 0-6.2 2.2V18m-2.3-5.5h7M6.5 18h10" />,
    mileage: <><path d="M5 16a7 7 0 1 1 14 0" /><path d="M12 16l4-5M4 20h16" /></>,
    fuel: <><path d="M7 3h7v18H7Z" /><path d="M9 7h3M14 8h2l2 2v8a2 2 0 0 0 4 0v-6l-3-3" /></>,
    transmission: <><circle cx="6" cy="7" r="2" /><circle cx="18" cy="7" r="2" /><circle cx="12" cy="17" r="2" /><path d="M8 7h8M12 9v6" /></>,
    filters: <path d="M4 7h10m4 0h2M4 17h2m4 0h10M14 5v4M8 15v4" />,
    shield: <><path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6l8-3Z" /><path d="M9 12l2 2 4-5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    tag: <><path d="M4 7h10l6 6-7 7-9-9V7Z" /><path d="M8 11h.01" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></>,
  };

  return (
    <svg className="bidIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export default function BidsPage() {
  return (
    <main className="bidsPage">
      <header className="bidsTopbar">
        <Link href="/" className="bidsLogo">Kerb</Link>

        <nav className="bidsNav" aria-label="Main navigation">
          <Link href="/browse"><Icon name="car" /> Browse cars</Link>
          <Link href="/bids" className="active"><Icon name="bid" /> Bids</Link>
          <Link href="/new-cars"><Icon name="new" /> New cars</Link>
          <Link href="/sell-car"><Icon name="sell" /> Sell your car</Link>
          <Link href="/electric-cars"><Icon name="electric" /> Electric</Link>
          <Link href="/cars-on-finance"><Icon name="finance" /> Finance</Link>
          <Link href="/guides"><Icon name="guide" /> Guides</Link>
        </nav>

        <div className="bidsActions">
          <Link href="/saved"><Icon name="heart" /> Saved</Link>
          <Link href="/account"><Icon name="user" /> My account</Link>
          <Link href="/post-car" className="postButton"><Icon name="plus" /> Post your car</Link>
        </div>

        <SiteMenu />
      </header>

      <section className="bidsHero">
        <div className="heroText">
          <h1>Make your best bid</h1>
          <p>Browse cars open to private bids and offer the highest amount you would genuinely pay.</p>
          <div className="privacyLine"><Icon name="shield" /> Your bid is private — only the seller can see it.</div>
        </div>

        <img className="heroCar" src={bidHeroImage} alt="Kerb white BMW bid hero car" />

        <form className="bidSearch" action="/bids">
          <label><Icon name="location" /><span>Location</span><strong>Any location</strong></label>
          <label><Icon name="car" /><span>Make</span><strong>Any make</strong></label>
          <label><Icon name="car" /><span>Model</span><strong>Any model</strong></label>
          <label><Icon name="pound" /><span>Max asking price</span><strong>Any price</strong></label>
          <button type="submit">Search bid cars</button>
        </form>

        <div className="filterPills">
          <button className="active" type="button"><Icon name="pound" /> Any price</button>
          <button type="button"><Icon name="mileage" /> Mileage</button>
          <button type="button"><Icon name="fuel" /> Fuel type</button>
          <button type="button"><Icon name="transmission" /> Transmission</button>
          <button type="button"><Icon name="filters" /> More filters</button>
        </div>
      </section>

      <section className="resultsHeader">
        <div><h2>Cars open to bids</h2><span>0 cars</span></div>
        <label>Sort:<select defaultValue="newest"><option value="newest">Newest</option><option value="price-low">Price low to high</option><option value="price-high">Price high to low</option></select></label>
      </section>

      <section className="emptyBids">
        <div className="emptyIcon"><Icon name="bid" /></div>
        <h2>No bid cars yet</h2>
        <p>Cars that sellers open to private bids will appear here. Buyers will be able to make their best private offer, and only the seller will see it.</p>
        <div className="emptyActions"><Link href="/browse">Browse cars</Link><Link href="/post-car">Post your car</Link></div>
      </section>

      <section className="bidSteps">
        <div><h2>Private bids,<br />simple decisions</h2><p>No payment is taken when you submit a bid.</p></div>
        <article><span>1</span><Icon name="car" /><div><strong>Choose a car</strong><p>Find a car you love that’s open to private bids.</p></div></article>
        <article><span>2</span><Icon name="tag" /><div><strong>Send your best bid</strong><p>Offer the amount you would genuinely pay.</p></div></article>
        <article><span>3</span><Icon name="mail" /><div><strong>The seller responds</strong><p>The seller will review your bid and get back to you.</p></div></article>
      </section>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  .bidsPage { min-height: 100vh; background: #f7f9fd; color: #0b1533; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding-bottom: 34px; }
  .bidsPage a { color: inherit; text-decoration: none; }
  .bidIcon { width: 18px; height: 18px; flex: 0 0 auto; }
  .bidsTopbar { height: 72px; display: flex; align-items: center; gap: 24px; padding: 0 52px; background: rgba(255,255,255,.96); border-bottom: 1px solid #e6edf8; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(14px); }
  .bidsLogo { color: #0048ff; font-size: 36px; font-weight: 950; letter-spacing: -2px; line-height: 1; }
  .bidsNav, .bidsActions { display: flex; align-items: center; gap: 18px; }
  .bidsNav { flex: 1; min-width: 0; }
  .bidsNav a, .bidsActions a { display: inline-flex; align-items: center; gap: 8px; color: #111a35; font-size: 14px; font-weight: 900; white-space: nowrap; padding: 10px 0; }
  .bidsNav a.active { color: #0048ff; position: relative; }
  .bidsNav a.active:after { content: ""; position: absolute; left: 0; right: 0; bottom: -17px; height: 3px; border-radius: 999px; background: #0048ff; }
  .bidsActions { margin-left: auto; }
  .bidsActions .postButton { height: 48px; padding: 0 20px; border-radius: 13px; background: #0048ff; color: white; box-shadow: 0 12px 28px rgba(0,72,255,.2); }
  .bidsTopbar :global(.siteMenu) { display: block; }
  .bidsHero, .resultsHeader, .emptyBids, .bidSteps { width: min(1432px, calc(100% - 104px)); margin-left: auto; margin-right: auto; }
  .bidsHero { position: relative; margin-top: 12px; min-height: 344px; border: 1px solid #dde7f7; border-radius: 18px; overflow: hidden; background: linear-gradient(105deg, #f8fbff 0%, #eef5ff 100%); padding: 32px 40px 24px; box-shadow: 0 12px 34px rgba(20,40,80,.05); }
  .bidsHero:before { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 80% 12%, rgba(60,110,255,.13), transparent 34%), linear-gradient(90deg, rgba(255,255,255,.82), rgba(255,255,255,.18)); pointer-events: none; }
  .heroText { position: relative; z-index: 2; width: 440px; }
  .heroText h1 { margin: 0 0 12px; font-size: 38px; line-height: 1; letter-spacing: -1.45px; font-weight: 950; }
  .heroText p { margin: 0; color: #34415d; font-size: 15px; line-height: 1.55; max-width: 390px; }
  .privacyLine { margin-top: 24px; display: inline-flex; align-items: center; gap: 12px; color: #35425e; font-size: 14px; font-weight: 700; }
  .privacyLine .bidIcon { color: #0b1533; }
  .heroCar { position: absolute; z-index: 1; top: 5px; right: 110px; width: 560px; height: 198px; object-fit: cover; object-position: right center; filter: drop-shadow(0 18px 22px rgba(20,35,70,.08)); }
  .bidSearch { position: absolute; z-index: 3; left: 40px; right: 86px; bottom: 63px; min-height: 88px; display: grid; grid-template-columns: 1.13fr 1.05fr 1.05fr .92fr 160px; gap: 14px; align-items: center; background: white; border: 1px solid #dce6f6; border-radius: 16px; padding: 14px 16px; box-shadow: 0 18px 48px rgba(20,45,85,.09); }
  .bidSearch label { min-width: 0; min-height: 60px; border: 1px solid #dfe7f5; border-radius: 14px; display: grid; grid-template-columns: 36px 1fr; align-content: center; column-gap: 10px; padding: 11px 14px; background: #fff; }
  .bidSearch label .bidIcon { grid-row: span 2; align-self: center; color: #07142d; }
  .bidSearch span { color: #62708b; font-size: 12px; font-weight: 900; }
  .bidSearch strong { color: #07142d; font-size: 14px; font-weight: 950; }
  .bidSearch button { height: 50px; border: none; border-radius: 12px; background: #0048ff; color: #fff; font-size: 14px; font-weight: 950; cursor: pointer; box-shadow: 0 10px 24px rgba(0,72,255,.22); }
  .filterPills { position: absolute; z-index: 3; left: 40px; bottom: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .filterPills button { height: 36px; display: inline-flex; align-items: center; gap: 10px; border: 1px solid #d9e4f5; border-radius: 9px; background: white; color: #15213c; padding: 0 14px; font-weight: 850; cursor: pointer; box-shadow: 0 7px 18px rgba(20,40,80,.04); }
  .filterPills button.active { color: #0048ff; border-color: #0048ff; background: #f3f7ff; }
  .resultsHeader { margin-top: 16px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
  .resultsHeader div { display: flex; align-items: baseline; gap: 14px; }
  .resultsHeader h2 { margin: 0; font-size: 20px; letter-spacing: -.45px; }
  .resultsHeader span, .resultsHeader label { color: #43516d; font-size: 13px; font-weight: 800; }
  .resultsHeader label { display: inline-flex; align-items: center; gap: 8px; }
  .resultsHeader select { border: none; background: transparent; color: #0b1533; font-weight: 950; outline: none; }
  .emptyBids { margin-top: 14px; min-height: 260px; border: 1px solid #dce6f6; border-radius: 16px; background: #fff; display: grid; place-items: center; text-align: center; padding: 40px 20px; box-shadow: 0 12px 28px rgba(20,40,80,.05); }
  .emptyIcon { width: 62px; height: 62px; border-radius: 18px; background: #eef4ff; color: #0048ff; display: grid; place-items: center; margin-bottom: 14px; }
  .emptyIcon .bidIcon { width: 28px; height: 28px; }
  .emptyBids h2 { margin: 0 0 8px; font-size: 24px; letter-spacing: -.65px; }
  .emptyBids p { margin: 0 auto; max-width: 540px; color: #5b6882; line-height: 1.55; font-weight: 700; }
  .emptyActions { margin-top: 20px; display: inline-flex; gap: 10px; }
  .emptyActions a { min-height: 42px; border-radius: 10px; border: 1px solid #dbe6f7; display: inline-flex; align-items: center; justify-content: center; padding: 0 16px; font-weight: 950; color: #0048ff; }
  .emptyActions a:last-child { background: #0048ff; color: #fff; border-color: #0048ff; }
  .bidSteps { margin-top: 14px; border: 1px solid #dce6f6; border-radius: 16px; background: white; min-height: 112px; display: grid; grid-template-columns: 1.05fr repeat(3, 1fr); gap: 0; box-shadow: 0 12px 30px rgba(20,40,80,.05); overflow: hidden; }
  .bidSteps > div, .bidSteps article { padding: 22px; }
  .bidSteps > div h2 { margin: 0 0 12px; font-size: 22px; line-height: 1.05; letter-spacing: -.55px; }
  .bidSteps > div p, .bidSteps article p { margin: 0; color: #52617c; line-height: 1.45; font-size: 13px; font-weight: 650; }
  .bidSteps article { display: grid; grid-template-columns: 46px 40px 1fr; gap: 14px; align-items: center; border-left: 1px solid #e2eaf7; }
  .bidSteps article > span { width: 46px; height: 46px; border-radius: 999px; border: 1px solid #cfe0ff; background: #eff5ff; display: grid; place-items: center; font-size: 22px; font-weight: 950; }
  .bidSteps article .bidIcon { width: 32px; height: 32px; color: #0b1533; }
  .bidSteps strong { display: block; margin-bottom: 5px; font-size: 14px; font-weight: 950; }
  @media (max-width: 1220px) { .bidsNav { display: none; } .bidsHero, .resultsHeader, .emptyBids, .bidSteps { width: min(100% - 40px, 1432px); } .heroCar { right: 30px; width: 500px; } .bidSearch { right: 40px; grid-template-columns: repeat(2,1fr); position: relative; left: auto; right: auto; bottom: auto; margin-top: 26px; } .filterPills { position: relative; left: auto; bottom: auto; margin-top: 12px; } .bidsHero { min-height: auto; } .bidSearch button { grid-column: 1 / -1; } }
  @media (max-width: 860px) { .bidsTopbar { padding: 14px 18px; height: auto; } .bidsLogo { font-size: 34px; } .bidsActions a:not(.postButton) { display: none; } .bidsActions .postButton { display: none; } .bidsHero, .resultsHeader, .emptyBids, .bidSteps { width: calc(100% - 28px); } .bidsHero { margin-top: 10px; padding: 26px 22px 18px; border-radius: 18px; } .heroText { width: 100%; } .heroText h1 { font-size: 36px; } .heroCar { position: relative; display: block; top: auto; right: auto; width: 100%; height: 190px; margin: 12px 0 -8px; object-fit: cover; object-position: right center; } .bidSearch { grid-template-columns: 1fr; padding: 12px; } .resultsHeader { align-items: flex-start; } .bidSteps { grid-template-columns: 1fr; } .bidSteps article { border-left: none; border-top: 1px solid #e2eaf7; } }
`;

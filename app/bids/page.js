import Link from "next/link";
import SiteMenu from "../components/SiteMenu";

export const metadata = {
  title: "Car Bids | Kerb Car",
  description:
    "Make private bids on cars listed on Kerb Car. Send the highest amount you would genuinely pay, visible only to the seller.",
};

const bidHeroImage = "/cars/bids-hero-car.png";

function Icon({ name }) {
  const icons = {
    car: (
      <path d="M5 16h14M7 16l1.2-4.4A3 3 0 0 1 11.1 9h1.8a3 3 0 0 1 2.9 2.6L17 16M7 16v2M17 16v2M8 18h.01M16 18h.01" />
    ),
    bid: (
      <path d="m10 3 10 10-7 7L3 10V3h7Zm-4 4h.01" />
    ),
    sparkle: (
      <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Zm6 10 .9 2.1L21 16l-2.1.9L18 19l-.9-2.1L15 16l2.1-.9L18 13Z" />
    ),
    tag: (
      <path d="m20 13-7 7L4 11V4h7l9 9ZM7.5 7.5h.01" />
    ),
    electric: (
      <path d="m13 2-7 12h6l-1 8 7-12h-6l1-8Z" />
    ),
    finance: (
      <path d="M4 7h16v10H4V7Zm0 4h16M7 15h3" />
    ),
    guide: (
      <path d="M6 4h12v16H6V4Zm3 4h6M9 12h6M9 16h4" />
    ),
    heart: (
      <path d="M20.8 7.2a5 5 0 0 0-7.1 0L12 8.9l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 23l8.8-8.7a5 5 0 0 0 0-7.1Z" />
    ),
    user: (
      <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
    ),
    plus: (
      <path d="M12 5v14M5 12h14" />
    ),
    location: (
      <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),
    pound: (
      <path d="M8 20h9M9 12h6M17 7.5A4.5 4.5 0 0 0 8 8v12" />
    ),
    mileage: (
      <path d="M5 16a7 7 0 0 1 14 0M12 16l4-4M8 16h.01M16 16h.01" />
    ),
    fuel: (
      <path d="M7 3h8v18H7V3Zm8 4 3 3v7a2 2 0 1 0 4 0v-4l-4-4" />
    ),
    transmission: (
      <path d="M4 7h16M7 7v10M17 7v10M12 7v10M4 17h16" />
    ),
    filter: (
      <path d="M4 7h16M7 7v.01M4 17h16M17 17v.01M4 12h16M12 12v.01" />
    ),
    shield: (
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    ),
    menu: (
      <path d="M4 7h16M4 12h16M4 17h16" />
    ),
  };

  return (
    <svg className="bidIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name] || icons.car}
    </svg>
  );
}

function NavLink({ href, icon, children, active }) {
  return (
    <Link href={href} className={active ? "active" : ""}>
      <Icon name={icon} />
      {children}
    </Link>
  );
}

export default function BidsPage() {
  return (
    <main className="bidsPage">
      <header className="bidsTopbar">
        <Link href="/" className="bidsLogo">Kerb</Link>

        <nav className="bidsNav" aria-label="Bids navigation">
          <NavLink href="/browse" icon="car">Browse cars</NavLink>
          <NavLink href="/bids" icon="bid" active>Bids</NavLink>
          <NavLink href="/new-cars" icon="sparkle">New cars</NavLink>
          <NavLink href="/sell-car" icon="tag">Sell your car</NavLink>
          <NavLink href="/electric-cars" icon="electric">Electric</NavLink>
          <NavLink href="/car-finance" icon="finance">Finance</NavLink>
          <NavLink href="/guides" icon="guide">Guides</NavLink>
        </nav>

        <div className="bidsActions">
          <Link href="/saved"><Icon name="heart" />Saved</Link>
          <Link href="/login"><Icon name="user" />My account</Link>
          <Link href="/post-car" className="postButton"><Icon name="plus" />Post your car</Link>
          <SiteMenu />
        </div>
      </header>

      <section className="bidsHero">
        <img className="heroCar" src={bidHeroImage} alt="Kerb white BMW bid hero car" loading="eager" />

        <div className="heroText">
          <h1>Make your best bid</h1>
          <p>Browse cars open to private bids and offer the highest amount you would genuinely pay.</p>
          <div className="privacyLine">
            <Icon name="shield" />
            <strong>Your bid is private — only the seller can see it.</strong>
          </div>
        </div>

        <form className="bidSearch">
          <label>
            <Icon name="location" />
            <span>Location</span>
            <strong>Any location</strong>
          </label>
          <label>
            <Icon name="car" />
            <span>Make</span>
            <strong>Any make</strong>
          </label>
          <label>
            <Icon name="car" />
            <span>Model</span>
            <strong>Any model</strong>
          </label>
          <label>
            <Icon name="pound" />
            <span>Max asking price</span>
            <strong>Any price</strong>
          </label>
          <button type="button">Search bid cars</button>
        </form>

        <div className="filterPills">
          <button type="button" className="active"><Icon name="pound" />Any price</button>
          <button type="button"><Icon name="mileage" />Mileage</button>
          <button type="button"><Icon name="fuel" />Fuel type</button>
          <button type="button"><Icon name="transmission" />Transmission</button>
          <button type="button"><Icon name="filter" />More filters</button>
        </div>
      </section>

      <section className="resultsHeader">
        <div>
          <h2>Cars open to bids</h2>
          <span>0 cars</span>
        </div>
        <label>
          Sort:
          <select defaultValue="newest" aria-label="Sort bid cars">
            <option value="newest">Newest</option>
            <option value="price-low">Price low to high</option>
            <option value="price-high">Price high to low</option>
          </select>
        </label>
      </section>

      <section className="emptyBids">
        <div>
          <div className="emptyIcon"><Icon name="bid" /></div>
          <h2>No bid cars yet</h2>
          <p>Cars that sellers open to private bids will appear here. Buyers will be able to make their best private offer, and only the seller will see it.</p>
          <div className="emptyActions">
            <Link href="/browse">Browse cars</Link>
            <Link href="/post-car">Post your car</Link>
          </div>
        </div>
      </section>

      <section className="bidSteps">
        <div>
          <h2>Private bids,<br />simple decisions</h2>
          <p>No payment is taken when you submit a bid.</p>
        </div>
        <article>
          <span>1</span>
          <Icon name="car" />
          <div>
            <strong>Choose a car</strong>
            <p>Find a car you love that&apos;s open to private bids.</p>
          </div>
        </article>
        <article>
          <span>2</span>
          <Icon name="bid" />
          <div>
            <strong>Send your best bid</strong>
            <p>Offer the amount you would genuinely pay.</p>
          </div>
        </article>
        <article>
          <span>3</span>
          <Icon name="guide" />
          <div>
            <strong>The seller responds</strong>
            <p>The seller will review your bid and get back to you.</p>
          </div>
        </article>
      </section>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  .bidsPage { min-height: 100vh; background: #f6f9fe; color: #09142d; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding-bottom: 34px; }
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
  .bidsHero { position: relative; margin-top: 12px; min-height: 344px; border: 1px solid #dde7f7; border-radius: 18px; overflow: hidden; background: #edf4ff; padding: 32px 40px 24px; box-shadow: 0 12px 34px rgba(20,40,80,.05); }
  .bidsHero:before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,.88) 30%, rgba(255,255,255,.18) 57%, rgba(255,255,255,0) 100%); pointer-events: none; }
  .heroText { position: relative; z-index: 2; width: 440px; }
  .heroText h1 { margin: 0 0 12px; font-size: 38px; line-height: 1; letter-spacing: -1.45px; font-weight: 950; }
  .heroText p { margin: 0; color: #34415d; font-size: 15px; line-height: 1.55; max-width: 390px; }
  .privacyLine { margin-top: 24px; display: inline-flex; align-items: center; gap: 12px; color: #35425e; font-size: 14px; font-weight: 700; }
  .privacyLine .bidIcon { color: #0b1533; }
  .heroCar { position: absolute; z-index: 0; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block; }
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
  .emptyIcon { width: 62px; height: 62px; border-radius: 18px; background: #eef4ff; color: #0048ff; display: grid; place-items: center; margin: 0 auto 14px; }
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
  @media (max-width: 1220px) { .bidsNav { display: none; } .bidsHero, .resultsHeader, .emptyBids, .bidSteps { width: min(100% - 40px, 1432px); } .bidSearch { right: 40px; grid-template-columns: repeat(2,1fr); position: relative; left: auto; right: auto; bottom: auto; margin-top: 26px; } .filterPills { position: relative; left: auto; bottom: auto; margin-top: 12px; } .bidsHero { min-height: auto; } .bidSearch button { grid-column: 1 / -1; } }
  @media (max-width: 860px) { .bidsTopbar { padding: 14px 18px; height: auto; } .bidsLogo { font-size: 34px; } .bidsActions a:not(.postButton) { display: none; } .bidsActions .postButton { display: none; } .bidsHero, .resultsHeader, .emptyBids, .bidSteps { width: calc(100% - 28px); } .bidsHero { margin-top: 10px; padding: 26px 22px 18px; border-radius: 18px; } .heroText { width: 100%; } .heroText h1 { font-size: 36px; } .heroCar { position: relative; display: block; width: 100%; height: 190px; margin: 12px 0 -8px; object-fit: cover; object-position: center center; border-radius: 14px; } .bidSearch { grid-template-columns: 1fr; padding: 12px; } .resultsHeader { align-items: flex-start; } .bidSteps { grid-template-columns: 1fr; } .bidSteps article { border-left: none; border-top: 1px solid #e2eaf7; } }
`;

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteMenu from "../components/SiteMenu";

const initialFilters = {
  location: "",
  make: "",
  model: "",
  minPrice: "",
  maxPrice: "",
  maxMileage: "",
  fuel: "",
  gearbox: "",
};

function Icon({ name, className = "" }) {
  const icons = {
    car: <path d="M5 16h14M7 16l1.2-4.4A3 3 0 0 1 11.1 9h1.8a3 3 0 0 1 2.9 2.6L17 16M7 16v2M17 16v2M8 18h.01M16 18h.01" />,
    bid: <path d="m10 3 10 10-7 7L3 10V3h7Zm-4 4h.01" />,
    sparkle: <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Zm6 10 .9 2.1L21 16l-2.1.9L18 19l-.9-2.1L15 16l2.1-.9L18 13Z" />,
    tag: <path d="m20 13-7 7L4 11V4h7l9 9ZM7.5 7.5h.01" />,
    electric: <path d="m13 2-7 12h6l-1 8 7-12h-6l1-8Z" />,
    finance: <path d="M4 7h16v10H4V7Zm0 4h16M7 15h3" />,
    guide: <path d="M6 4h12v16H6V4Zm3 4h6M9 12h6M9 16h4" />,
    heart: <path d="M20.8 7.2a5 5 0 0 0-7.1 0L12 8.9l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 23l8.8-8.7a5 5 0 0 0 0-7.1Z" />,
    user: <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    location: <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
    pound: <path d="M8 20h9M9 12h6M17 7.5A4.5 4.5 0 0 0 8 8v12" />,
    mileage: <path d="M5 16a7 7 0 0 1 14 0M12 16l4-4M8 16h.01M16 16h.01" />,
    fuel: <path d="M7 3h8v18H7V3Zm8 4 3 3v7a2 2 0 1 0 4 0v-4l-4-4" />,
    transmission: <path d="M4 7h16M7 7v10M17 7v10M12 7v10M4 17h16" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    search: <path d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />,
    chevron: <path d="m8 10 4 4 4-4" />,
  };

  return (
    <svg className={`bidLandingIcon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name] || icons.car}
    </svg>
  );
}

function NavLink({ href, icon, children, active = false }) {
  return (
    <Link href={href} className={active ? "active" : ""}>
      <Icon name={icon} />
      {children}
    </Link>
  );
}

function parsePhotos(listing) {
  const candidates = [listing?.photos, listing?.photo_urls, listing?.image_urls, listing?.images];
  const photos = [];

  candidates.forEach((candidate) => {
    if (Array.isArray(candidate)) photos.push(...candidate);
    if (typeof candidate === "string" && candidate.trim()) {
      try {
        const parsed = JSON.parse(candidate);
        if (Array.isArray(parsed)) photos.push(...parsed);
        else photos.push(candidate);
      } catch {
        photos.push(candidate);
      }
    }
  });

  [listing?.image_url, listing?.photo_url, listing?.main_photo_url].forEach((value) => {
    if (value) photos.unshift(value);
  });

  return [...new Set(photos.filter(Boolean))];
}

function listingTitle(listing) {
  return (
    listing?.title ||
    [listing?.year, listing?.make, listing?.model, listing?.model_detail, listing?.variant]
      .filter(Boolean)
      .join(" ") ||
    "Car listing"
  );
}

function formatMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "Price on request";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? new Intl.NumberFormat("en-GB").format(amount) : "";
}

export default function BidsClient() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [sort, setSort] = useState("best-fit");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (String(value || "").trim()) params.set(key, String(value).trim());
    });
    params.set("sort", sort);
    return params.toString();
  }, [appliedFilters, sort]);

  useEffect(() => {
    let active = true;

    async function loadListings() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/bids/listings?${queryString}`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not load bid cars.");
        if (active) setListings(Array.isArray(payload.listings) ? payload.listings : []);
      } catch (loadError) {
        if (active) {
          setListings([]);
          setError(loadError.message || "Could not load bid cars.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadListings();
    return () => {
      active = false;
    };
  }, [queryString]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function submitSearch(event) {
    event.preventDefault();
    setAppliedFilters(filters);
  }

  function resetFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setSort("best-fit");
  }

  return (
    <main className="bidLandingPage">
      <header className="bidLandingTopbar">
        <Link href="/" className="bidLandingLogo">Kerb</Link>

        <nav className="bidLandingNav" aria-label="Main navigation">
          <NavLink href="/browse" icon="car">Browse cars</NavLink>
          <NavLink href="/bids" icon="bid" active>Bids</NavLink>
          <NavLink href="/new-cars" icon="sparkle">New cars</NavLink>
          <NavLink href="/sell-car" icon="tag">Sell your car</NavLink>
          <NavLink href="/electric-cars" icon="electric">Electric</NavLink>
          <NavLink href="/car-finance" icon="finance">Finance</NavLink>
          <NavLink href="/guides" icon="guide">Guides</NavLink>
        </nav>

        <div className="bidLandingActions">
          <Link href="/saved"><Icon name="heart" />Saved</Link>
          <Link href="/account"><Icon name="user" />My account</Link>
          <Link href="/post-car" className="bidLandingPost"><Icon name="plus" />Post your car</Link>
          <SiteMenu />
        </div>
      </header>

      <section className="bidLandingHero">
        <img src="/cars/bids-hero-car.png" className="bidLandingHeroCar" alt="White BMW on the Kerb bids page" />
        <div className="bidLandingHeroCopy">
          <h1>Make your best bid</h1>
          <p>Browse cars open to bids and offer the highest amount you would genuinely pay.</p>
          <div><Icon name="shield" /><strong>Bid amounts are visible — buyer details stay private.</strong></div>
        </div>

        <form className="bidLandingSearch" onSubmit={submitSearch}>
          <label>
            <Icon name="location" />
            <span>Location</span>
            <input value={filters.location} onChange={(event) => updateFilter("location", event.target.value)} placeholder="Any location" />
          </label>
          <label>
            <Icon name="car" />
            <span>Make</span>
            <input value={filters.make} onChange={(event) => updateFilter("make", event.target.value)} placeholder="Any make" />
          </label>
          <label>
            <Icon name="car" />
            <span>Model</span>
            <input value={filters.model} onChange={(event) => updateFilter("model", event.target.value)} placeholder="Any model" />
          </label>
          <label>
            <Icon name="pound" />
            <span>From price</span>
            <input inputMode="numeric" value={filters.minPrice} onChange={(event) => updateFilter("minPrice", event.target.value)} placeholder="No minimum" />
          </label>
          <label>
            <Icon name="pound" />
            <span>To price</span>
            <input inputMode="numeric" value={filters.maxPrice} onChange={(event) => updateFilter("maxPrice", event.target.value)} placeholder="No maximum" />
          </label>
          <button type="submit"><Icon name="search" />Search bid cars</button>
        </form>

        <div className="bidLandingQuickFilters">
          <label>
            <Icon name="mileage" />
            <select value={filters.maxMileage} onChange={(event) => updateFilter("maxMileage", event.target.value)}>
              <option value="">Any mileage</option>
              <option value="10000">Up to 10,000</option>
              <option value="25000">Up to 25,000</option>
              <option value="50000">Up to 50,000</option>
              <option value="75000">Up to 75,000</option>
              <option value="100000">Up to 100,000</option>
            </select>
            <Icon name="chevron" />
          </label>
          <label>
            <Icon name="fuel" />
            <select value={filters.fuel} onChange={(event) => updateFilter("fuel", event.target.value)}>
              <option value="">Any fuel type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
            <Icon name="chevron" />
          </label>
          <label>
            <Icon name="transmission" />
            <select value={filters.gearbox} onChange={(event) => updateFilter("gearbox", event.target.value)}>
              <option value="">Any transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
              <option value="Semi-automatic">Semi-automatic</option>
            </select>
            <Icon name="chevron" />
          </label>
          <button type="button" onClick={resetFilters}>Clear filters</button>
        </div>
      </section>

      <section className="bidLandingResultsHeader">
        <div>
          <h2>Cars open to bids</h2>
          <span>{loading ? "Loading…" : `${listings.length} ${listings.length === 1 ? "car" : "cars"}`}</span>
        </div>
        <label>
          Sort:
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort bid cars">
            <option value="best-fit">Best fit</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price low to high</option>
            <option value="price-high">Price high to low</option>
            <option value="most-bids">Most bids</option>
          </select>
        </label>
      </section>

      {error ? (
        <section className="bidLandingState">
          <div className="bidLandingStateIcon"><Icon name="bid" /></div>
          <h2>Could not load bid cars</h2>
          <p>{error}</p>
        </section>
      ) : loading ? (
        <section className="bidLandingState">
          <div className="bidLandingLoader" />
          <h2>Loading bid cars</h2>
        </section>
      ) : listings.length === 0 ? (
        <section className="bidLandingState">
          <div className="bidLandingStateIcon"><Icon name="bid" /></div>
          <h2>No bid cars yet</h2>
          <p>Cars that sellers open to bids will appear here. Buyers can compare visible bid amounts while bidder details remain private.</p>
          <div className="bidLandingStateActions">
            <Link href="/browse">Browse cars</Link>
            <Link href="/post-car">Post your car</Link>
          </div>
        </section>
      ) : (
        <section className="bidLandingGrid">
          {listings.map((listing) => {
            const photo = parsePhotos(listing)[0] || "/cars/hero-car.png";
            const highestBid = Number(listing.highest_bid || 0);
            return (
              <article className="bidLandingCard" key={listing.id}>
                <Link href={`/bids/${listing.id}`} className="bidLandingCardImage">
                  <img src={photo} alt={listingTitle(listing)} />
                  <span><Icon name="heart" /></span>
                </Link>
                <div className="bidLandingCardBody">
                  <Link href={`/bids/${listing.id}`}><h3>{listingTitle(listing)}</h3></Link>
                  <p>{[
                    listing.mileage ? `${formatNumber(listing.mileage)} miles` : "",
                    listing.gearbox || listing.transmission,
                    listing.fuel_type || listing.fuel,
                  ].filter(Boolean).join(" · ")}</p>
                  <span className="bidLandingLocation"><Icon name="location" />{listing.location || "United Kingdom"}</span>
                  <div className="bidLandingPriceRow">
                    <div><small>Asking price</small><strong>{formatMoney(listing.asking_price || listing.price)}</strong></div>
                    <div><small>{highestBid > 0 ? "Highest bid" : "Bids"}</small><strong>{highestBid > 0 ? formatMoney(highestBid) : "Be first"}</strong></div>
                  </div>
                  <Link href={`/bids/${listing.id}`} className="bidLandingCardButton">
                    View car &amp; make a bid
                    {Number(listing.bid_count || 0) > 0 && <span>{listing.bid_count} bids</span>}
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="bidLandingSteps">
        <div>
          <h2>Open bids,<br />simple decisions</h2>
          <p>No payment is taken when you submit a bid.</p>
        </div>
        <article><span>1</span><Icon name="car" /><div><strong>Choose a car</strong><p>Find a car you love that is open to bids.</p></div></article>
        <article><span>2</span><Icon name="bid" /><div><strong>Send your best bid</strong><p>Offer the amount you would genuinely pay.</p></div></article>
        <article><span>3</span><Icon name="shield" /><div><strong>The seller decides</strong><p>The seller can review the bids and choose what to do next.</p></div></article>
      </section>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  *{box-sizing:border-box}.bidLandingPage{min-height:100vh;background:#f6f9fe;color:#09142d;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding-bottom:34px}.bidLandingPage a{color:inherit;text-decoration:none}.bidLandingIcon{width:18px;height:18px;flex:0 0 auto}.bidLandingTopbar{height:72px;display:flex;align-items:center;gap:24px;padding:0 52px;background:rgba(255,255,255,.96);border-bottom:1px solid #e6edf8;position:sticky;top:0;z-index:100;backdrop-filter:blur(14px)}.bidLandingLogo{color:#0048ff!important;font-size:36px;font-weight:950;letter-spacing:-2px;line-height:1}.bidLandingNav,.bidLandingActions{display:flex;align-items:center;gap:18px}.bidLandingNav{flex:1;min-width:0}.bidLandingNav a,.bidLandingActions>a{display:inline-flex;align-items:center;gap:8px;color:#111a35;font-size:14px;font-weight:900;white-space:nowrap;padding:10px 0}.bidLandingNav a.active{color:#0048ff;position:relative}.bidLandingNav a.active:after{content:"";position:absolute;left:0;right:0;bottom:-17px;height:3px;border-radius:999px;background:#0048ff}.bidLandingActions{margin-left:auto}.bidLandingActions .bidLandingPost{height:48px;padding:0 20px;border-radius:13px;background:#0048ff;color:#fff;box-shadow:0 12px 28px rgba(0,72,255,.2)}
  .bidLandingHero,.bidLandingResultsHeader,.bidLandingGrid,.bidLandingState,.bidLandingSteps{width:min(1432px,calc(100% - 104px));margin-left:auto;margin-right:auto}.bidLandingHero{position:relative;margin-top:12px;min-height:400px;border:1px solid #dde7f7;border-radius:18px;overflow:hidden;background:#edf4ff;padding:32px 40px 22px;box-shadow:0 12px 34px rgba(20,40,80,.05)}.bidLandingHero:before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(255,255,255,.97) 0%,rgba(255,255,255,.91) 30%,rgba(255,255,255,.18) 58%,rgba(255,255,255,0) 100%);pointer-events:none}.bidLandingHeroCar{position:absolute;z-index:0;right:3.5%;top:18px;width:61%;height:245px;object-fit:contain;object-position:right top;display:block}.bidLandingHeroCopy{position:relative;z-index:2;width:430px}.bidLandingHeroCopy h1{margin:0 0 12px;font-size:38px;line-height:1;letter-spacing:-1.45px;font-weight:950}.bidLandingHeroCopy>p{margin:0;color:#34415d;font-size:15px;line-height:1.55;max-width:390px}.bidLandingHeroCopy>div{margin-top:24px;display:inline-flex;align-items:center;gap:12px;color:#35425e;font-size:14px}.bidLandingHeroCopy>div strong{font-weight:850}
  .bidLandingSearch{position:absolute;z-index:3;left:40px;right:40px;bottom:66px;min-height:96px;display:grid;grid-template-columns:1.1fr 1fr 1fr .88fr .88fr 166px;gap:12px;align-items:center;background:#fff;border:1px solid #dce6f6;border-radius:16px;padding:14px 16px;box-shadow:0 18px 48px rgba(20,45,85,.09)}.bidLandingSearch label{min-width:0;min-height:64px;border:1px solid #dfe7f5;border-radius:14px;display:grid;grid-template-columns:34px 1fr;align-content:center;column-gap:9px;padding:9px 12px;background:#fff}.bidLandingSearch label>.bidLandingIcon{grid-row:span 2;align-self:center}.bidLandingSearch label span{color:#62708b;font-size:11px;font-weight:900}.bidLandingSearch input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:#07142d;font:inherit;font-size:14px;font-weight:950;padding:0}.bidLandingSearch input::placeholder{color:#07142d;opacity:1}.bidLandingSearch>button{height:52px;border:0;border-radius:12px;background:#0048ff;color:#fff;font-size:14px;font-weight:950;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 24px rgba(0,72,255,.22)}.bidLandingQuickFilters{position:absolute;z-index:3;left:40px;right:40px;bottom:17px;display:flex;align-items:center;gap:10px}.bidLandingQuickFilters label,.bidLandingQuickFilters button{height:38px;border:1px solid #d9e4f5;border-radius:9px;background:#fff;color:#15213c;box-shadow:0 7px 18px rgba(20,40,80,.04)}.bidLandingQuickFilters label{position:relative;display:flex;align-items:center;gap:8px;padding:0 12px}.bidLandingQuickFilters label>.bidLandingIcon:last-child{width:14px}.bidLandingQuickFilters select{appearance:none;border:0;outline:0;background:transparent;font:inherit;font-size:13px;font-weight:850;padding-right:4px;color:#15213c}.bidLandingQuickFilters button{padding:0 14px;font-weight:850;cursor:pointer;color:#0048ff}
  .bidLandingResultsHeader{margin-top:16px;display:flex;align-items:center;justify-content:space-between;gap:18px}.bidLandingResultsHeader>div{display:flex;align-items:baseline;gap:14px}.bidLandingResultsHeader h2{margin:0;font-size:20px;letter-spacing:-.45px}.bidLandingResultsHeader span,.bidLandingResultsHeader label{color:#43516d;font-size:13px;font-weight:800}.bidLandingResultsHeader label{display:inline-flex;align-items:center;gap:8px}.bidLandingResultsHeader select{border:0;background:transparent;color:#0b1533;font-weight:950;outline:0}
  .bidLandingGrid{margin-top:14px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.bidLandingCard{display:grid;grid-template-columns:49% 51%;min-height:218px;background:#fff;border:1px solid #dce6f6;border-radius:15px;overflow:hidden;box-shadow:0 10px 26px rgba(20,40,80,.045)}.bidLandingCardImage{position:relative;min-height:218px;background:#edf2f9}.bidLandingCardImage img{width:100%;height:100%;object-fit:cover;display:block}.bidLandingCardImage>span{position:absolute;right:10px;top:10px;width:34px;height:34px;border-radius:999px;background:#fff;display:grid;place-items:center;box-shadow:0 6px 18px rgba(8,22,50,.12)}.bidLandingCardBody{padding:13px;display:flex;flex-direction:column;min-width:0}.bidLandingCardBody h3{font-size:16px;line-height:1.12;letter-spacing:-.25px;margin:0 0 6px}.bidLandingCardBody>p{margin:0;color:#5b6882;font-size:11px;line-height:1.45}.bidLandingLocation{display:flex;align-items:center;gap:5px;color:#4f5e79;font-size:11px;margin-top:5px}.bidLandingLocation .bidLandingIcon{width:13px;height:13px}.bidLandingPriceRow{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.bidLandingPriceRow>div{min-width:0}.bidLandingPriceRow small{display:block;color:#5b6882;font-size:10px}.bidLandingPriceRow strong{display:block;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bidLandingPriceRow>div:last-child strong{color:#0048ff}.bidLandingCardButton{margin-top:auto;min-height:34px;border:1px solid #0048ff;border-radius:8px;color:#0048ff!important;display:flex;align-items:center;justify-content:center;gap:7px;font-size:11px;font-weight:950;padding:0 8px}.bidLandingCardButton span{font-size:10px;color:#53617c}
  .bidLandingState{margin-top:14px;min-height:280px;border:1px solid #dce6f6;border-radius:16px;background:#fff;display:grid;place-items:center;text-align:center;padding:44px 20px;box-shadow:0 12px 28px rgba(20,40,80,.05)}.bidLandingState>div,.bidLandingState>h2,.bidLandingState>p{grid-column:1;grid-row:auto}.bidLandingStateIcon{width:62px;height:62px;border-radius:18px;background:#eef4ff;color:#0048ff;display:grid;place-items:center;margin:0 auto 14px}.bidLandingStateIcon .bidLandingIcon{width:28px;height:28px}.bidLandingState h2{margin:0 0 8px;font-size:24px}.bidLandingState p{margin:0 auto;max-width:570px;color:#5b6882;line-height:1.55;font-weight:700}.bidLandingStateActions{margin-top:20px;display:inline-flex;gap:10px}.bidLandingStateActions a{min-height:42px;border-radius:10px;border:1px solid #dbe6f7;display:inline-flex;align-items:center;justify-content:center;padding:0 16px;font-weight:950;color:#0048ff}.bidLandingStateActions a:last-child{background:#0048ff;color:#fff}.bidLandingLoader{width:42px;height:42px;border:4px solid #dbe6ff;border-top-color:#0048ff;border-radius:999px;animation:bidSpin .8s linear infinite;margin-bottom:14px}@keyframes bidSpin{to{transform:rotate(360deg)}}
  .bidLandingSteps{margin-top:14px;border:1px solid #dce6f6;border-radius:16px;background:#fff;min-height:112px;display:grid;grid-template-columns:1.05fr repeat(3,1fr);box-shadow:0 12px 30px rgba(20,40,80,.05);overflow:hidden}.bidLandingSteps>div,.bidLandingSteps article{padding:22px}.bidLandingSteps>div h2{margin:0 0 12px;font-size:22px;line-height:1.05}.bidLandingSteps>div p,.bidLandingSteps article p{margin:0;color:#52617c;line-height:1.45;font-size:13px;font-weight:650}.bidLandingSteps article{display:grid;grid-template-columns:46px 38px 1fr;gap:12px;align-items:center;border-left:1px solid #e2eaf7}.bidLandingSteps article>span{width:46px;height:46px;border-radius:999px;border:1px solid #cfe0ff;background:#eff5ff;display:grid;place-items:center;font-size:22px;font-weight:950}.bidLandingSteps article>.bidLandingIcon{width:30px;height:30px}.bidLandingSteps strong{display:block;margin-bottom:5px;font-size:14px;font-weight:950}
  @media(max-width:1240px){.bidLandingNav{display:none}.bidLandingHero,.bidLandingResultsHeader,.bidLandingGrid,.bidLandingState,.bidLandingSteps{width:min(100% - 40px,1432px)}.bidLandingSearch{grid-template-columns:repeat(3,1fr);position:relative;left:auto;right:auto;bottom:auto;margin-top:150px}.bidLandingSearch>button{grid-column:span 1}.bidLandingQuickFilters{position:relative;left:auto;right:auto;bottom:auto;margin-top:12px}.bidLandingHero{min-height:auto}.bidLandingGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:860px){.bidLandingTopbar{height:auto;padding:14px 18px}.bidLandingLogo{font-size:34px}.bidLandingActions>a{display:none}.bidLandingHero,.bidLandingResultsHeader,.bidLandingGrid,.bidLandingState,.bidLandingSteps{width:calc(100% - 28px)}.bidLandingHero{padding:26px 20px 18px}.bidLandingHeroCopy{width:100%}.bidLandingHeroCopy h1{font-size:34px}.bidLandingHeroCar{position:relative;top:auto;right:auto;width:100%;height:180px;margin:8px 0 -118px;object-position:center}.bidLandingSearch{grid-template-columns:1fr;margin-top:120px;padding:12px}.bidLandingSearch>button{grid-column:auto}.bidLandingQuickFilters{display:grid;grid-template-columns:1fr 1fr}.bidLandingQuickFilters label,.bidLandingQuickFilters button{width:100%}.bidLandingResultsHeader{align-items:flex-start}.bidLandingGrid{grid-template-columns:1fr}.bidLandingCard{grid-template-columns:43% 57%}.bidLandingSteps{grid-template-columns:1fr}.bidLandingSteps article{border-left:0;border-top:1px solid #e2eaf7}}
  @media(max-width:520px){.bidLandingQuickFilters{grid-template-columns:1fr}.bidLandingCard{grid-template-columns:1fr}.bidLandingCardImage{min-height:210px}.bidLandingPriceRow strong{font-size:16px}}
`;

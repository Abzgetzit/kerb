"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteMenu from "../../components/SiteMenu";

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
    camera: <><path d="M4 7h4l2-3h4l2 3h4v13H4V7Z" /><circle cx="12" cy="13" r="4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    back: <path d="m15 18-6-6 6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return (
    <svg className={`bidDetailIcon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name] || icons.car}
    </svg>
  );
}

function NavLink({ href, icon, children, active = false }) {
  return <Link href={href} className={active ? "active" : ""}><Icon name={icon} />{children}</Link>;
}

function parseImageField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed].filter(Boolean);
  } catch {
    return [trimmed];
  }
}

function getPhotos(listing) {
  const photos = [
    ...parseImageField(listing.image_url),
    ...parseImageField(listing.photo_url),
    ...parseImageField(listing.main_photo_url),
    ...parseImageField(listing.photo_urls),
    ...parseImageField(listing.photos),
    ...parseImageField(listing.image_urls),
    ...parseImageField(listing.images),
  ];
  const unique = [...new Set(photos.filter(Boolean))];
  return unique.length ? unique : ["/cars/hero-car.png"];
}

function getTitle(listing) {
  return listing.title || [listing.year, listing.make, listing.model, listing.model_detail, listing.variant].filter(Boolean).join(" ") || "Car open to bids";
}

function formatMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "No bids yet";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(amount);
}

function formatNumber(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? new Intl.NumberFormat("en-GB").format(amount) : value || "";
}

function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BidDetailClient({ listing }) {
  const photos = useMemo(() => getPhotos(listing), [listing]);
  const title = useMemo(() => getTitle(listing), [listing]);
  const askingPrice = Number(listing.asking_price || listing.price || 0);
  const [activePhoto, setActivePhoto] = useState(0);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [loadingBids, setLoadingBids] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const highestBid = Number(bids[0]?.amount || 0);
  const difference = askingPrice > 0 && highestBid > 0 ? Math.abs(askingPrice - highestBid) : 0;
  const differenceDirection = highestBid > askingPrice ? "above" : "below";

  useEffect(() => {
    let active = true;

    async function loadBids() {
      setLoadingBids(true);
      setError("");
      try {
        const response = await fetch(`/api/bid-offers?listingId=${encodeURIComponent(listing.id)}`, { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not load bids.");
        if (active) setBids(Array.isArray(payload.bids) ? payload.bids : []);
      } catch (loadError) {
        if (active) setError(loadError.message || "Could not load bids.");
      } finally {
        if (active) setLoadingBids(false);
      }
    }

    loadBids();
    return () => {
      active = false;
    };
  }, [listing.id]);

  async function submitBid(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const amount = Number(String(bidAmount).replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(amount) || amount < 1) {
      setError("Enter a valid bid amount.");
      return;
    }

    const token = localStorage.getItem("kerbSessionToken");
    if (!token) {
      window.location.href = `/login?next=${encodeURIComponent(`/bids/${listing.id}`)}`;
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/bid-offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kerb-session-token": token,
        },
        body: JSON.stringify({ listing_id: listing.id, amount }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not submit your bid.");
      setBids(Array.isArray(payload.bids) ? payload.bids : []);
      setBidAmount("");
      setSuccess("Your bid has been submitted and added to the list.");
    } catch (submitError) {
      setError(submitError.message || "Could not submit your bid.");
    } finally {
      setSubmitting(false);
    }
  }

  const details = [
    { icon: "calendar", label: "Year", value: listing.year },
    { icon: "mileage", label: "Mileage", value: listing.mileage ? `${formatNumber(listing.mileage)} miles` : "" },
    { icon: "transmission", label: "Transmission", value: listing.gearbox || listing.transmission },
    { icon: "fuel", label: "Fuel type", value: listing.fuel_type || listing.fuel },
    { icon: "car", label: "Body type", value: listing.body_type },
    { icon: "shield", label: "Condition", value: listing.condition },
  ].filter((item) => item.value);

  return (
    <main className="bidDetailPage">
      <header className="bidDetailTopbar">
        <Link href="/" className="bidDetailLogo">Kerb</Link>
        <nav className="bidDetailNav" aria-label="Main navigation">
          <NavLink href="/browse" icon="car">Browse cars</NavLink>
          <NavLink href="/bids" icon="bid" active>Bids</NavLink>
          <NavLink href="/new-cars" icon="sparkle">New cars</NavLink>
          <NavLink href="/sell-car" icon="tag">Sell your car</NavLink>
          <NavLink href="/electric-cars" icon="electric">Electric</NavLink>
          <NavLink href="/car-finance" icon="finance">Finance</NavLink>
          <NavLink href="/guides" icon="guide">Guides</NavLink>
        </nav>
        <div className="bidDetailActions">
          <Link href="/saved"><Icon name="heart" />Saved</Link>
          <Link href="/account"><Icon name="user" />My account</Link>
          <Link href="/post-car" className="bidDetailPost"><Icon name="plus" />Post your car</Link>
          <SiteMenu />
        </div>
      </header>

      <div className="bidDetailShell">
        <div className="bidDetailCrumbs">
          <Link href="/bids"><Icon name="back" />Back to bids</Link>
          <span>›</span><Link href="/browse">Browse cars</Link><span>›</span><strong>{title}</strong>
        </div>

        <section className="bidDetailMain">
          <div className="bidDetailLeft">
            <div className="bidDetailGallery">
              <div className="bidDetailMainPhoto">
                <img src={photos[activePhoto]} alt={`${title} photo ${activePhoto + 1}`} />
                <button type="button" aria-label="Save listing"><Icon name="heart" /></button>
                <span><Icon name="camera" />{activePhoto + 1} / {photos.length} photos</span>
              </div>
              {photos.length > 1 && (
                <div className="bidDetailThumbs">
                  {photos.slice(0, 6).map((photo, index) => (
                    <button type="button" key={`${photo}-${index}`} className={index === activePhoto ? "active" : ""} onClick={() => setActivePhoto(index)}>
                      <img src={photo} alt={`${title} thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <section className="bidDetailVehicleCard">
              <h2>Vehicle details</h2>
              <div>
                {details.map((detail) => (
                  <article key={detail.label}>
                    <Icon name={detail.icon} />
                    <span><small>{detail.label}</small><strong>{detail.value}</strong></span>
                  </article>
                ))}
              </div>
            </section>

            {listing.description && (
              <section className="bidDetailDescription">
                <h2>Seller description</h2>
                <p>{listing.description}</p>
              </section>
            )}
          </div>

          <div className="bidDetailRight">
            <div className="bidDetailHeading">
              <h1>{title}</h1>
              <p>{[
                listing.mileage ? `${formatNumber(listing.mileage)} miles` : "",
                listing.gearbox || listing.transmission,
                listing.fuel_type || listing.fuel,
              ].filter(Boolean).join(" · ")}</p>
              <span><Icon name="location" />{listing.location || "United Kingdom"}</span>
            </div>

            <div className="bidDetailPriceCards">
              <article><small>Asking price</small><strong>{askingPrice > 0 ? formatMoney(askingPrice) : "Price on request"}</strong></article>
              <article className="highest"><small>Current highest bid</small><strong>{loadingBids ? "Loading…" : formatMoney(highestBid)}</strong><span>{bids.length} {bids.length === 1 ? "bid" : "bids"} submitted</span></article>
            </div>

            {highestBid > 0 && askingPrice > 0 && (
              <div className="bidDetailGap"><Icon name="bid" />The highest bid is <strong>{formatMoney(difference)}</strong> {differenceDirection} the asking price.</div>
            )}

            <div className="bidDetailBidArea">
              <form className="bidDetailForm" onSubmit={submitBid}>
                <h2>Make your best bid</h2>
                <p>Enter the highest amount you would genuinely pay.</p>
                <label><span>£</span><input inputMode="numeric" value={bidAmount} onChange={(event) => setBidAmount(event.target.value)} placeholder="Enter your bid" aria-label="Bid amount" /></label>
                <button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit my bid"}</button>
                {error && <div className="bidDetailMessage error">{error}</div>}
                {success && <div className="bidDetailMessage success"><Icon name="check" />{success}</div>}
                <small><Icon name="info" />This is not a timed auction. No payment is taken when you submit a bid.</small>
                <small><Icon name="lock" />Bid amounts are visible, but buyer names and contact details stay private.</small>
              </form>

              <section className="bidDetailAllBids">
                <div className="bidDetailAllBidsHead"><h2>All bids</h2><span>Highest first</span></div>
                {loadingBids ? (
                  <div className="bidDetailBidsState">Loading bids…</div>
                ) : bids.length === 0 ? (
                  <div className="bidDetailBidsState"><strong>No bids yet</strong><span>Be the first buyer to make an offer.</span></div>
                ) : (
                  <div className="bidDetailBidsList">
                    {bids.map((bid, index) => (
                      <article key={bid.id || `${bid.amount}-${bid.created_at}-${index}`} className={index === 0 ? "top" : ""}>
                        <span className="rank">{index + 1}</span>
                        <strong>{formatMoney(bid.amount)}</strong>
                        <time>{relativeTime(bid.created_at)}</time>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>

        <section className="bidDetailHow">
          <div><h2>How Kerb Bids works</h2><p>Simple offers with no payment taken.</p></div>
          <article><span>1</span><div><strong>Make your best bid</strong><p>Enter the highest amount you would genuinely pay.</p></div></article>
          <article><span>2</span><div><strong>Bids are ranked</strong><p>Every bid amount is displayed from highest to lowest.</p></div></article>
          <article><span>3</span><div><strong>The seller decides</strong><p>The seller reviews the bids and decides what to do next.</p></div></article>
          <article className="safe"><Icon name="shield" /><div><strong>No payment is taken</strong><p>Submitting a bid does not take any money.</p></div></article>
        </section>
      </div>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  *{box-sizing:border-box}.bidDetailPage{min-height:100vh;background:linear-gradient(180deg,#f8fbff 0%,#f4f8ff 100%);color:#09142d;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding-bottom:30px}.bidDetailPage a{color:inherit;text-decoration:none}.bidDetailIcon{width:18px;height:18px;flex:0 0 auto}.bidDetailTopbar{height:72px;display:flex;align-items:center;gap:24px;padding:0 40px;background:rgba(255,255,255,.97);border-bottom:1px solid #e6edf8;position:sticky;top:0;z-index:100;backdrop-filter:blur(14px)}.bidDetailLogo{color:#0048ff!important;font-size:36px;font-weight:950;letter-spacing:-2px;line-height:1}.bidDetailNav,.bidDetailActions{display:flex;align-items:center;gap:18px}.bidDetailNav{flex:1;min-width:0}.bidDetailNav a,.bidDetailActions>a{display:inline-flex;align-items:center;gap:8px;color:#111a35;font-size:14px;font-weight:900;white-space:nowrap;padding:10px 0}.bidDetailNav a.active{color:#0048ff;position:relative}.bidDetailNav a.active:after{content:"";position:absolute;left:0;right:0;bottom:-17px;height:3px;border-radius:999px;background:#0048ff}.bidDetailActions{margin-left:auto}.bidDetailActions .bidDetailPost{height:48px;padding:0 20px;border-radius:13px;background:#0048ff;color:#fff;box-shadow:0 12px 28px rgba(0,72,255,.2)}
  .bidDetailShell{width:min(1460px,calc(100% - 76px));margin:0 auto}.bidDetailCrumbs{min-height:54px;display:flex;align-items:center;gap:10px;color:#56647f;font-size:12px;white-space:nowrap;overflow:hidden}.bidDetailCrumbs a:first-child{display:inline-flex;align-items:center;gap:5px;color:#0048ff;font-weight:850}.bidDetailCrumbs strong{overflow:hidden;text-overflow:ellipsis}.bidDetailMain{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(440px,.95fr);gap:28px;align-items:start}.bidDetailLeft,.bidDetailRight{min-width:0}.bidDetailGallery,.bidDetailVehicleCard,.bidDetailDescription,.bidDetailPriceCards article,.bidDetailForm,.bidDetailAllBids,.bidDetailGap{background:#fff;border:1px solid #dce6f6;box-shadow:0 12px 30px rgba(25,45,85,.045)}.bidDetailGallery{border-radius:16px;overflow:hidden}.bidDetailMainPhoto{position:relative;aspect-ratio:1.47/1;background:#edf2f8}.bidDetailMainPhoto>img{width:100%;height:100%;object-fit:cover;display:block}.bidDetailMainPhoto>button{position:absolute;right:16px;top:16px;width:42px;height:42px;border:0;border-radius:999px;background:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 20px rgba(10,25,55,.14)}.bidDetailMainPhoto>span{position:absolute;left:16px;bottom:16px;height:36px;border-radius:10px;background:rgba(7,17,38,.78);color:#fff;padding:0 12px;display:flex;align-items:center;gap:7px;font-size:12px;font-weight:850}.bidDetailThumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:10px;background:#fff}.bidDetailThumbs button{height:122px;border:2px solid transparent;border-radius:10px;overflow:hidden;padding:0;background:#edf2f8;cursor:pointer}.bidDetailThumbs button.active{border-color:#0048ff}.bidDetailThumbs img{width:100%;height:100%;object-fit:cover;display:block}
  .bidDetailVehicleCard,.bidDetailDescription{margin-top:14px;border-radius:15px;padding:16px 18px}.bidDetailVehicleCard h2,.bidDetailDescription h2{font-size:18px;margin:0 0 14px;letter-spacing:-.35px}.bidDetailVehicleCard>div{display:grid;grid-template-columns:repeat(3,1fr);gap:0}.bidDetailVehicleCard article{display:flex;align-items:center;gap:11px;padding:9px 14px;border-right:1px solid #e6edf7}.bidDetailVehicleCard article:nth-child(3n){border-right:0}.bidDetailVehicleCard article:nth-child(n+4){border-top:1px solid #e6edf7}.bidDetailVehicleCard article>.bidDetailIcon{width:24px;height:24px}.bidDetailVehicleCard article span{display:grid;gap:2px}.bidDetailVehicleCard small{color:#68758e;font-size:11px}.bidDetailVehicleCard strong{font-size:13px}.bidDetailDescription p{white-space:pre-wrap;color:#53617b;line-height:1.65;margin:0;font-size:14px}
  .bidDetailHeading{padding:4px 4px 14px}.bidDetailHeading h1{margin:0 0 9px;font-size:34px;line-height:1.04;letter-spacing:-1.2px}.bidDetailHeading p{margin:0;color:#56647e;font-size:14px}.bidDetailHeading>span{margin-top:13px;display:flex;align-items:center;gap:7px;font-size:13px;font-weight:750}.bidDetailPriceCards{display:grid;grid-template-columns:1fr 1fr;gap:14px}.bidDetailPriceCards article{border-radius:14px;padding:20px}.bidDetailPriceCards small{display:block;color:#596780;font-size:13px}.bidDetailPriceCards strong{display:block;margin-top:7px;font-size:31px;letter-spacing:-1px}.bidDetailPriceCards .highest{background:linear-gradient(135deg,#f7faff,#edf4ff);border-color:#cbdcff}.bidDetailPriceCards .highest small,.bidDetailPriceCards .highest strong{color:#0048ff}.bidDetailPriceCards .highest span{display:block;color:#53617c;font-size:12px;margin-top:3px}.bidDetailGap{margin-top:14px;min-height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;gap:8px;color:#53617c;font-size:13px}.bidDetailGap strong{color:#0048ff}.bidDetailBidArea{display:grid;grid-template-columns:minmax(0,1fr) minmax(245px,.72fr);gap:14px;margin-top:16px}.bidDetailForm,.bidDetailAllBids{border-radius:15px;padding:18px}.bidDetailForm h2,.bidDetailAllBids h2{margin:0 0 5px;font-size:22px;letter-spacing:-.55px}.bidDetailForm>p{margin:0;color:#5b6880;font-size:12px}.bidDetailForm>label{height:56px;margin-top:12px;border:1px solid #d7e2f3;border-radius:11px;display:flex;align-items:center;overflow:hidden;background:#fbfcff}.bidDetailForm>label span{width:54px;height:100%;display:grid;place-items:center;font-size:23px;font-weight:900;background:#f1f5fc;border-right:1px solid #d7e2f3}.bidDetailForm input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;padding:0 15px;font:inherit;font-size:22px;font-weight:900;color:#09142d}.bidDetailForm>button{width:100%;height:46px;margin-top:10px;border:0;border-radius:9px;background:#0048ff;color:#fff;font:inherit;font-size:14px;font-weight:950;cursor:pointer;box-shadow:0 10px 24px rgba(0,72,255,.2)}.bidDetailForm>button:disabled{opacity:.65;cursor:wait}.bidDetailForm>small{display:flex;align-items:flex-start;gap:8px;color:#5b6880;font-size:10px;line-height:1.4;margin-top:10px}.bidDetailForm>small .bidDetailIcon{width:16px;height:16px}.bidDetailMessage{margin-top:10px;border-radius:9px;padding:10px 12px;font-size:12px;font-weight:750;display:flex;align-items:center;gap:7px}.bidDetailMessage.error{background:#fff1f1;color:#a61919;border:1px solid #ffd4d4}.bidDetailMessage.success{background:#edf9f2;color:#17663a;border:1px solid #ccebd9}
  .bidDetailAllBids{padding-right:10px}.bidDetailAllBidsHead{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-right:8px}.bidDetailAllBidsHead span{color:#0048ff;font-size:10px;font-weight:900;background:#edf3ff;border-radius:999px;padding:5px 8px}.bidDetailBidsList{max-height:302px;overflow:auto;padding-right:8px;margin-top:9px}.bidDetailBidsList article{min-height:55px;display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:8px;border-top:1px solid #e6edf7}.bidDetailBidsList article.top{background:linear-gradient(90deg,#f4f8ff,transparent);border-radius:9px;border-top:0;padding:0 8px}.bidDetailBidsList .rank{width:24px;height:24px;border-radius:999px;background:#eff4fd;display:grid;place-items:center;color:#53617c;font-size:11px;font-weight:900}.bidDetailBidsList .top .rank{background:#0048ff;color:#fff}.bidDetailBidsList strong{font-size:18px}.bidDetailBidsList time{color:#65728b;font-size:10px}.bidDetailBidsState{min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#65728b;font-size:12px}.bidDetailBidsState strong{color:#09142d;font-size:16px;margin-bottom:4px}
  .bidDetailHow{margin-top:18px;border:1px solid #dce6f6;border-radius:15px;background:#fff;display:grid;grid-template-columns:1.05fr repeat(3,1fr) 1.05fr;box-shadow:0 12px 30px rgba(25,45,85,.045);overflow:hidden}.bidDetailHow>div,.bidDetailHow article{padding:18px}.bidDetailHow>div h2{margin:0 0 5px;font-size:20px}.bidDetailHow>div p,.bidDetailHow article p{margin:0;color:#5b6880;font-size:11px;line-height:1.45}.bidDetailHow article{display:grid;grid-template-columns:42px 1fr;gap:11px;align-items:center;border-left:1px solid #e3ebf7}.bidDetailHow article>span{width:42px;height:42px;border-radius:999px;border:1px solid #cfe0ff;background:#f1f6ff;display:grid;place-items:center;font-size:20px;font-weight:950}.bidDetailHow article strong{display:block;font-size:13px;margin-bottom:4px}.bidDetailHow .safe{grid-template-columns:48px 1fr}.bidDetailHow .safe>.bidDetailIcon{width:42px;height:42px}
  @media(max-width:1250px){.bidDetailNav{display:none}.bidDetailMain{grid-template-columns:1fr}.bidDetailBidArea{grid-template-columns:1.1fr .9fr}.bidDetailHow{grid-template-columns:1fr 1fr}.bidDetailHow article{border-top:1px solid #e3ebf7}.bidDetailHow article:nth-child(even){border-left:0}}
  @media(max-width:820px){.bidDetailTopbar{height:auto;padding:14px 18px}.bidDetailLogo{font-size:34px}.bidDetailActions>a{display:none}.bidDetailShell{width:calc(100% - 28px)}.bidDetailCrumbs{font-size:11px}.bidDetailMainPhoto{aspect-ratio:1.15/1}.bidDetailThumbs{grid-template-columns:repeat(3,1fr)}.bidDetailThumbs button{height:82px}.bidDetailHeading h1{font-size:29px}.bidDetailPriceCards{grid-template-columns:1fr 1fr}.bidDetailPriceCards strong{font-size:24px}.bidDetailBidArea{grid-template-columns:1fr}.bidDetailVehicleCard>div{grid-template-columns:repeat(2,1fr)}.bidDetailVehicleCard article:nth-child(3n){border-right:1px solid #e6edf7}.bidDetailVehicleCard article:nth-child(2n){border-right:0}.bidDetailVehicleCard article:nth-child(n+3){border-top:1px solid #e6edf7}.bidDetailHow{grid-template-columns:1fr}.bidDetailHow article{border-left:0}}
  @media(max-width:500px){.bidDetailPriceCards{grid-template-columns:1fr}.bidDetailGap{padding:10px;text-align:center}.bidDetailVehicleCard>div{grid-template-columns:1fr}.bidDetailVehicleCard article{border-right:0!important;border-top:1px solid #e6edf7}.bidDetailVehicleCard article:first-child{border-top:0}.bidDetailThumbs{grid-template-columns:repeat(2,1fr)}}
`;

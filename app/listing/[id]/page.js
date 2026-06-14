"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "Price on request";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return value || "Not set";

  return new Intl.NumberFormat("en-GB").format(number);
}

function getTitle(car) {
  const title = [car.make, car.model].filter(Boolean).join(" ").trim();

  return car.title || title || "Car listing";
}

function getSubtitle(car) {
  return [
    car.engine_size,
    car.variant,
    car.fuel_type || car.fuel,
    car.gearbox || car.transmission,
    car.body_type,
  ]
    .filter(Boolean)
    .join(" ");
}

function getPhotos(car) {
  const fields = [car.photo_urls, car.photos, car.image_urls, car.images];

  for (const field of fields) {
    if (Array.isArray(field) && field.length > 0) return field.filter(Boolean);

    if (typeof field === "string" && field.trim()) {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(Boolean);
        }
      } catch {
        return [field];
      }
    }
  }

  const single =
    car.image_url ||
    car.photo_url ||
    car.main_photo_url ||
    car.cover_image_url;

  return single ? [single] : ["/cars/hero-car.png"];
}

function getFeatures(car) {
  const fallback = [
    "Apple CarPlay",
    "Parking sensors",
    "Bluetooth",
    "Cruise control",
    "Service history",
  ];

  if (Array.isArray(car.features) && car.features.length > 0) {
    return car.features;
  }

  if (typeof car.features === "string" && car.features.trim()) {
    try {
      const parsed = JSON.parse(car.features);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return car.features.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }

  return fallback;
}

function SvgIcon({ name }) {
  const icons = {
    car: (
      <>
        <path d="M5 17h14l-1.5-5h-11L5 17Z" />
        <path d="M7 17v2" />
        <path d="M17 17v2" />
        <path d="M7 12l1.5-4h7L17 12" />
      </>
    ),
    new: (
      <>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
      </>
    ),
    sell: (
      <>
        <path d="M4 7h10l6 6-7 7-9-9V7Z" />
        <path d="M8 11h.01" />
      </>
    ),
    electric: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" />,
    finance: (
      <>
        <path d="M4 7h16v10H4z" />
        <path d="M8 11h8" />
        <path d="M8 14h4" />
      </>
    ),
    guides: (
      <>
        <path d="M6 4h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2V4Z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    plus: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </>
    ),
    back: <path d="M19 12H5m7-7-7 7 7 7" />,
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 10.7 15.4 6.3" />
        <path d="M8.6 13.3 15.4 17.7" />
      </>
    ),
    phone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    ),
    message: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="M9 12l2 2 4-5" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8h4l2-3h4l2 3h4v11H4z" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
    mileage: (
      <>
        <path d="M4 14a8 8 0 0 1 16 0" />
        <path d="M12 14l4-4" />
        <path d="M4 14h16" />
      </>
    ),
    fuel: (
      <>
        <path d="M7 3h8v18H7z" />
        <path d="M15 8h2.5L20 10.5V18a2 2 0 0 1-2 2h-1" />
        <path d="M9 7h4" />
      </>
    ),
    gearbox: (
      <>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M6 8v8" />
        <path d="M18 8v8" />
        <path d="M8 6h8" />
      </>
    ),
    engine: (
      <>
        <path d="M4 10h3l2-3h6l2 3h3v8H4z" />
        <path d="M9 7V4" />
        <path d="M15 7V4" />
        <path d="M3 13H1" />
        <path d="M23 13h-2" />
      </>
    ),
    seats: (
      <>
        <path d="M7 11V6a3 3 0 0 1 6 0v5" />
        <path d="M5 11h11a3 3 0 0 1 3 3v5H5z" />
      </>
    ),
    doors: (
      <>
        <path d="M6 3h10l3 6v12H6z" />
        <path d="M9 12h4" />
      </>
    ),
    location: (
      <>
        <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
    star: (
      <path d="M12 2l3 6 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.9 3 1.1-6.5-4.7-4.6L9 8l3-6Z" />
    ),
  };

  return (
    <svg
      className="svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

export default function ListingPage() {
  const params = useParams();
  const id = params?.id;

  const [car, setCar] = useState(null);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      setErrorMessage("");

      if (!supabase) {
        setErrorMessage("Supabase environment variables are missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("kerb_listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setErrorMessage("This listing could not be found.");
        setCar(null);
      } else {
        setCar(data);
      }

      setLoading(false);
    }

    if (id) loadListing();
  }, [id]);

  const photos = useMemo(() => (car ? getPhotos(car) : []), [car]);
  const features = useMemo(() => (car ? getFeatures(car) : []), [car]);

  const title = car ? getTitle(car) : "";
  const subtitle = car ? getSubtitle(car) : "";
  const price = car
    ? car.asking_price || car.price || car.listing_price
    : "";
  const mileage = car ? car.mileage || car.miles : "";
  const fuel = car ? car.fuel_type || car.fuel : "";
  const gearbox = car ? car.gearbox || car.transmission : "";
  const engine = car ? car.engine_size || car.engine : "";
  const location = car ? car.location || car.city || car.postcode : "";
  const sellerType = car ? car.seller_type || "Private seller" : "";
  const sellerPhone = car ? car.seller_phone || car.phone : "";
  const sellerEmail = car ? car.seller_email || car.email : "";
  const sellerName = car ? car.seller_name || "Kerb seller" : "";
  const year = car ? car.year || car.registration_year : "";

  function nextPhoto() {
    setMainPhotoIndex((current) => (current + 1) % photos.length);
  }

  function previousPhoto() {
    setMainPhotoIndex((current) =>
      current === 0 ? photos.length - 1 : current - 1
    );
  }

  if (loading) {
    return (
      <main className="listing-page">
        <Header />
        <section className="loading-box">Loading listing...</section>
        <style jsx global>{styles}</style>
      </main>
    );
  }

  if (errorMessage || !car) {
    return (
      <main className="listing-page">
        <Header />
        <section className="empty-box">
          <h1>Listing not found</h1>
          <p>{errorMessage || "This listing is no longer available."}</p>
          <Link href="/browse">Back to browse</Link>
        </section>
        <style jsx global>{styles}</style>
      </main>
    );
  }

  return (
    <>
      <main className="listing-page">
        <Header />

        <section className="breadcrumb-row">
          <Link href="/browse" className="back-link">
            <SvgIcon name="back" />
            Back to results
          </Link>

          <span className="divider" />

          <Link href="/">Home</Link>
          <span>›</span>
          <Link href="/browse">Search results</Link>
          <span>›</span>
          <strong>{title}</strong>

          <div className="save-share">
            <button type="button">
              <SvgIcon name="heart" />
              Save
            </button>
            <button type="button">
              <SvgIcon name="share" />
              Share
            </button>
          </div>
        </section>

        <section className="main-layout">
          <div className="left-column">
            <section className="gallery-grid">
              <div className="main-photo">
                <img
                  src={photos[mainPhotoIndex]}
                  alt={title}
                  onError={(event) => {
                    event.currentTarget.src = "/cars/hero-car.png";
                  }}
                />

                <div className="reserve-pill">Available to reserve</div>

                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="gallery-arrow left"
                      onClick={previousPhoto}
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      className="gallery-arrow right"
                      onClick={nextPhoto}
                    >
                      ›
                    </button>
                  </>
                )}

                <button type="button" className="view-photos">
                  <SvgIcon name="camera" />
                  View all photos
                </button>

                <div className="photo-position">
                  {mainPhotoIndex + 1} / {photos.length}
                </div>
              </div>

              <div className="thumb-grid">
                {photos.slice(0, 5).map((photo, index) => (
                  <button
                    type="button"
                    key={`${photo}-${index}`}
                    className={`thumb ${index === mainPhotoIndex ? "active" : ""}`}
                    onClick={() => setMainPhotoIndex(index)}
                  >
                    <img
                      src={photo}
                      alt={`${title} ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.src = "/cars/hero-car.png";
                      }}
                    />

                    {index === 4 && photos.length > 5 && (
                      <span className="more-photos">+{photos.length - 5}</span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section className="title-section">
              {year && <span className="year-pill">{year}</span>}

              <div className="title-row">
                <div>
                  <h1>{title}</h1>
                  <p>{subtitle || "Used car listed on Kerb"}</p>
                </div>

                <div className="rating">
                  <strong>4.7</strong>
                  <span>★★★★★</span>
                  <small>(Kerb listing)</small>
                </div>
              </div>

              <div className="price-row">
                <h2>{formatPrice(price)}</h2>
                <span>Great price</span>
              </div>

              <div className="spec-row">
                <div>
                  <SvgIcon name="mileage" />
                  {mileage ? `${formatNumber(mileage)} miles` : "Mileage not set"}
                </div>

                <div>
                  <SvgIcon name="fuel" />
                  {fuel || "Fuel not set"}
                </div>

                <div>
                  <SvgIcon name="gearbox" />
                  {gearbox || "Gearbox not set"}
                </div>

                <div>
                  <SvgIcon name="engine" />
                  {engine || "Engine not set"}
                </div>

                <div>
                  <SvgIcon name="seats" />
                  {car.seats ? `${car.seats} seats` : "Seats not set"}
                </div>

                <div>
                  <SvgIcon name="doors" />
                  {car.doors ? `${car.doors} doors` : "Doors not set"}
                </div>

                <div>
                  <SvgIcon name="location" />
                  {location || "Location not set"}
                </div>
              </div>
            </section>

            <section className="features-card">
              {features.slice(0, 6).map((feature, index) => (
                <div key={`${feature}-${index}`}>
                  <SvgIcon name={index % 2 === 0 ? "star" : "shield"} />
                  {feature}
                </div>
              ))}

              {features.length > 6 && (
                <button type="button">View all features ›</button>
              )}
            </section>

            <section className="tabs-card">
              <div className="tabs">
                <button className="active" type="button">
                  Overview
                </button>
                <button type="button">Vehicle history</button>
                <button type="button">Finance</button>
                <button type="button">Running costs</button>
                <button type="button">Insurance</button>
                <button type="button">Delivery & collection</button>
              </div>

              <div className="overview">
                <h3>About this car</h3>
                <p>
                  {car.description ||
                    "This car has been listed on Kerb by a seller. Contact the seller for more information, viewings and availability."}
                </p>

                <div className="tag-row">
                  {features.slice(0, 5).map((feature, index) => (
                    <span key={`${feature}-tag-${index}`}>{feature}</span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="right-column">
            <section className="contact-card">
              <h2>Contact the seller</h2>

              {sellerEmail ? (
                <a
                  className="primary-contact"
                  href={`mailto:${sellerEmail}?subject=Kerb enquiry about ${encodeURIComponent(
                    title
                  )}`}
                >
                  <SvgIcon name="message" />
                  Message seller
                </a>
              ) : (
                <button className="primary-contact" type="button">
                  <SvgIcon name="message" />
                  Message seller
                </button>
              )}

              <button className="outline-contact" type="button">
                <SvgIcon name="shield" />
                Reserve this car
              </button>

              {sellerPhone ? (
                <a className="phone-box" href={`tel:${sellerPhone}`}>
                  <SvgIcon name="phone" />
                  <strong>{sellerPhone}</strong>
                  <span>Mon–Fri 9am–6pm · Sat 10am–4pm</span>
                </a>
              ) : (
                <div className="phone-box">
                  <SvgIcon name="phone" />
                  <strong>Phone not provided</strong>
                  <span>Message the seller instead</span>
                </div>
              )}

              <div className="trust-box">
                <SvgIcon name="shield" />
                <div>
                  <strong>Trusted seller</strong>
                  <span>Typically replies within 2 hours</span>
                </div>
              </div>
            </section>

            <section className="seller-card">
              <div className="seller-logo">
                {sellerName.slice(0, 1).toUpperCase()}
              </div>

              <h2>{sellerName}</h2>

              <div className="dealer-badge">
                <SvgIcon name="shield" />
                {sellerType}
              </div>

              <div className="seller-rating">
                <strong>4.7</strong>
                <span>★★★★★</span>
                <small>(128 reviews)</small>
              </div>

              <p>
                {location ? `${location} · Kerb seller` : "Kerb approved seller"}
              </p>

              <Link href="/browse" className="seller-link">
                View all cars →
              </Link>

              <div className="seller-benefits">
                <div>
                  <SvgIcon name="shield" />
                  Warranty available
                </div>
                <div>
                  <SvgIcon name="car" />
                  Part exchange
                </div>
                <div>
                  <SvgIcon name="location" />
                  Home delivery
                </div>
              </div>
            </section>
          </aside>
        </section>
      </main>

      <style jsx global>{styles}</style>
    </>
  );
}

function Header() {
  return (
    <header className="topbar">
      <Link href="/" className="logo">
        Kerb
      </Link>

      <nav className="nav">
        <Link href="/browse" className="nav-item">
          <SvgIcon name="car" />
          Browse cars
        </Link>

        <Link href="/browse" className="nav-item">
          <SvgIcon name="new" />
          New cars
        </Link>

        <Link href="/post-car" className="nav-item">
          <SvgIcon name="sell" />
          Sell your car
        </Link>

        <Link href="/browse" className="nav-item">
          <SvgIcon name="electric" />
          Electric
        </Link>

        <Link href="/browse" className="nav-item">
          <SvgIcon name="finance" />
          Finance
        </Link>

        <Link href="/browse" className="nav-item guides-link">
          <SvgIcon name="guides" />
          Guides
        </Link>
      </nav>

      <div className="top-actions">
        <button type="button">
          <SvgIcon name="heart" />
          Saved
        </button>

        <button type="button">
          <SvgIcon name="user" />
          Sign in
        </button>

        <Link href="/post-car" className="post-button">
          <SvgIcon name="plus" />
          Post your car
        </Link>
      </div>
    </header>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #fbfcff;
    color: #101832;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system,
      BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input,
  select {
    font-family: inherit;
  }

  .listing-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(0, 72, 255, 0.05), transparent 30%),
      #fbfcff;
  }

  .svg-icon {
    width: 20px;
    height: 20px;
    flex: 0 0 auto;
  }

  .topbar {
    height: 82px;
    padding: 0 72px;
    display: flex;
    align-items: center;
    gap: 32px;
    background: rgba(255, 255, 255, 0.96);
    border-bottom: 1px solid #e7edf7;
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(16px);
  }

  .logo {
    font-size: 42px;
    line-height: 1;
    font-weight: 950;
    color: #0b45ff;
    letter-spacing: -2px;
    margin-right: auto;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .nav-item {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: #111a36;
    font-size: 14px;
    font-weight: 850;
    white-space: nowrap;
  }

  .nav-item .svg-icon {
    width: 17px;
    height: 17px;
  }

  .top-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 22px;
  }

  .top-actions button {
    border: none;
    background: transparent;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #26304d;
    font-size: 14px;
    font-weight: 750;
    cursor: pointer;
  }

  .post-button {
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 0 22px;
    border-radius: 13px;
    background: #0b45ff;
    color: white;
    font-size: 14px;
    font-weight: 900;
    box-shadow: 0 12px 26px rgba(11, 69, 255, 0.2);
    white-space: nowrap;
  }

  .breadcrumb-row {
    max-width: 1760px;
    margin: 0 auto;
    padding: 32px 68px 26px;
    display: flex;
    align-items: center;
    gap: 18px;
    color: #44506c;
    font-size: 14px;
    font-weight: 700;
  }

  .breadcrumb-row strong {
    color: #101832;
  }

  .back-link {
    color: #0b45ff;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 850;
  }

  .divider {
    width: 1px;
    height: 20px;
    background: #d8dfeb;
  }

  .save-share {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 26px;
  }

  .save-share button {
    border: none;
    background: transparent;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #29324d;
    font-size: 14px;
    font-weight: 750;
    cursor: pointer;
  }

  .main-layout {
    max-width: 1760px;
    margin: 0 auto;
    padding: 0 68px 70px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 510px;
    gap: 46px;
    align-items: start;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
    gap: 14px;
  }

  .main-photo {
    position: relative;
    height: 410px;
    overflow: hidden;
    border-radius: 12px;
    background: #eef2f7;
  }

  .main-photo img,
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .reserve-pill {
    position: absolute;
    left: 20px;
    top: 20px;
    height: 34px;
    padding: 0 18px;
    border-radius: 8px;
    background: white;
    color: #15203b;
    display: inline-flex;
    align-items: center;
    font-size: 14px;
    font-weight: 800;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  }

  .gallery-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: white;
    color: #101832;
    font-size: 34px;
    line-height: 1;
    display: grid;
    place-items: center;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
  }

  .gallery-arrow.left {
    left: 20px;
  }

  .gallery-arrow.right {
    right: 20px;
  }

  .view-photos {
    position: absolute;
    left: 18px;
    bottom: 16px;
    border: none;
    border-radius: 10px;
    background: white;
    color: #14203b;
    height: 36px;
    padding: 0 15px;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    font-weight: 850;
    cursor: pointer;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  }

  .view-photos .svg-icon {
    width: 17px;
    height: 17px;
  }

  .photo-position {
    position: absolute;
    right: 16px;
    bottom: 16px;
    min-width: 58px;
    height: 36px;
    border-radius: 10px;
    background: rgba(16, 24, 50, 0.62);
    color: white;
    display: grid;
    place-items: center;
    font-weight: 850;
  }

  .thumb-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .thumb {
    position: relative;
    height: 128px;
    padding: 0;
    border: none;
    border-radius: 9px;
    overflow: hidden;
    background: #eef2f7;
    cursor: pointer;
  }

  .thumb.active {
    outline: 3px solid #0b45ff;
  }

  .more-photos {
    position: absolute;
    inset: 0;
    background: rgba(13, 20, 40, 0.62);
    color: white;
    display: grid;
    place-items: center;
    font-size: 25px;
    font-weight: 900;
  }

  .title-section {
    padding-top: 26px;
  }

  .year-pill {
    display: inline-flex;
    height: 28px;
    align-items: center;
    border-radius: 8px;
    background: #eef3ff;
    color: #101832;
    padding: 0 10px;
    font-size: 13px;
    font-weight: 850;
    margin-bottom: 10px;
  }

  .title-row {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 24px;
  }

  .title-row h1 {
    margin: 0 0 6px;
    font-size: 38px;
    line-height: 1;
    letter-spacing: -1.5px;
    color: #101832;
  }

  .title-row p {
    margin: 0;
    color: #3f4a66;
    font-size: 17px;
    font-weight: 650;
  }

  .rating {
    color: #0b45ff;
    display: flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 850;
  }

  .rating small {
    font-size: 13px;
  }

  .price-row {
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .price-row h2 {
    margin: 0;
    font-size: 31px;
    letter-spacing: -1px;
  }

  .price-row span {
    background: #daf8e5;
    color: #15803d;
    padding: 6px 11px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 850;
  }

  .spec-row {
    margin-top: 28px;
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 18px;
    border-bottom: 1px solid #e6ebf4;
    padding-bottom: 24px;
  }

  .spec-row div {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: #47526c;
    font-size: 14px;
    font-weight: 750;
    white-space: nowrap;
  }

  .spec-row .svg-icon {
    color: #0b45ff;
    width: 21px;
    height: 21px;
  }

  .features-card {
    margin-top: 28px;
    background: white;
    border: 1px solid #e4eaf4;
    border-radius: 16px;
    min-height: 86px;
    padding: 18px 24px;
    display: flex;
    align-items: center;
    gap: 28px;
    flex-wrap: wrap;
    box-shadow: 0 10px 30px rgba(18, 32, 70, 0.05);
  }

  .features-card div {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #26314d;
    font-size: 14px;
    font-weight: 750;
  }

  .features-card .svg-icon {
    color: #0b45ff;
  }

  .features-card button {
    margin-left: auto;
    height: 42px;
    border: 1px solid #b8c9ff;
    background: white;
    color: #0b45ff;
    border-radius: 10px;
    padding: 0 16px;
    font-weight: 850;
    cursor: pointer;
  }

  .tabs-card {
    margin-top: 22px;
    background: white;
    border: 1px solid #e4eaf4;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(18, 32, 70, 0.05);
    overflow: hidden;
  }

  .tabs {
    height: 64px;
    display: flex;
    align-items: stretch;
    gap: 18px;
    padding: 0 18px;
    border-bottom: 1px solid #e4eaf4;
    overflow-x: auto;
  }

  .tabs button {
    border: none;
    background: transparent;
    color: #101832;
    font-size: 14px;
    font-weight: 850;
    padding: 0 14px;
    border-bottom: 4px solid transparent;
    white-space: nowrap;
    cursor: pointer;
  }

  .tabs button.active {
    color: #0b45ff;
    border-bottom-color: #0b45ff;
  }

  .overview {
    padding: 28px;
  }

  .overview h3 {
    margin: 0 0 14px;
    font-size: 18px;
  }

  .overview p {
    margin: 0;
    color: #3f4a66;
    line-height: 1.65;
    max-width: 850px;
  }

  .tag-row {
    margin-top: 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .tag-row span {
    background: #f0f3f8;
    color: #25304c;
    border-radius: 9px;
    padding: 11px 16px;
    font-size: 13px;
    font-weight: 800;
  }

  .right-column {
    display: grid;
    gap: 18px;
    position: sticky;
    top: 110px;
  }

  .contact-card,
  .seller-card {
    background: white;
    border: 1px solid #e4eaf4;
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 16px 44px rgba(18, 32, 70, 0.08);
  }

  .contact-card h2,
  .seller-card h2 {
    margin: 0 0 22px;
    font-size: 24px;
    letter-spacing: -0.6px;
  }

  .primary-contact,
  .outline-contact,
  .phone-box {
    width: 100%;
    height: 62px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 900;
    cursor: pointer;
  }

  .primary-contact {
    border: none;
    background: #0b45ff;
    color: white;
    box-shadow: 0 12px 28px rgba(11, 69, 255, 0.22);
  }

  .outline-contact {
    margin-top: 16px;
    background: white;
    border: 1.5px solid #0b45ff;
    color: #0b45ff;
  }

  .phone-box {
    margin-top: 16px;
    height: 84px;
    flex-direction: column;
    border: 1.5px solid #0b45ff;
    color: #0b45ff;
    background: white;
  }

  .phone-box span {
    color: #48536e;
    font-size: 14px;
    font-weight: 600;
  }

  .trust-box {
    margin-top: 20px;
    background: #f3f6fb;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .trust-box .svg-icon {
    width: 34px;
    height: 34px;
    color: #101832;
  }

  .trust-box strong,
  .trust-box span {
    display: block;
  }

  .trust-box strong {
    margin-bottom: 4px;
  }

  .trust-box span {
    color: #4f5b76;
    font-size: 14px;
  }

  .seller-logo {
    width: 190px;
    height: 80px;
    background: linear-gradient(135deg, #111827, #363f55);
    color: white;
    display: grid;
    place-items: center;
    border-radius: 9px;
    font-size: 44px;
    font-weight: 950;
    margin-bottom: 22px;
  }

  .dealer-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #0b45ff;
    font-weight: 900;
    margin-bottom: 20px;
  }

  .seller-rating {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #0b45ff;
    font-weight: 850;
    margin-bottom: 18px;
  }

  .seller-card p {
    margin: 0;
    color: #4d5872;
  }

  .seller-link {
    margin-top: 26px;
    display: inline-flex;
    color: #0b45ff;
    font-size: 17px;
    font-weight: 950;
  }

  .seller-benefits {
    margin-top: 30px;
    border: 1px solid #e3e9f3;
    border-radius: 13px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow: hidden;
  }

  .seller-benefits div {
    padding: 18px 12px;
    display: grid;
    gap: 8px;
    justify-items: center;
    text-align: center;
    color: #33405d;
    font-size: 12px;
    font-weight: 750;
    border-right: 1px solid #e3e9f3;
  }

  .seller-benefits div:last-child {
    border-right: none;
  }

  .seller-benefits .svg-icon {
    color: #0b45ff;
  }

  .loading-box,
  .empty-box {
    max-width: 720px;
    margin: 100px auto;
    background: white;
    border: 1px solid #e4eaf4;
    border-radius: 18px;
    padding: 44px;
    text-align: center;
    box-shadow: 0 16px 44px rgba(18, 32, 70, 0.08);
  }

  .empty-box h1 {
    margin: 0 0 10px;
  }

  .empty-box p {
    color: #4f5b76;
  }

  .empty-box a {
    margin-top: 22px;
    display: inline-flex;
    background: #0b45ff;
    color: white;
    border-radius: 12px;
    padding: 14px 20px;
    font-weight: 900;
  }

  @media (max-width: 1450px) {
    .topbar {
      padding: 0 32px;
      gap: 18px;
    }

    .nav {
      gap: 14px;
    }

    .top-actions {
      gap: 14px;
    }

    .main-layout {
      grid-template-columns: minmax(0, 1fr) 420px;
      padding-left: 36px;
      padding-right: 36px;
      gap: 30px;
    }

    .breadcrumb-row {
      padding-left: 36px;
      padding-right: 36px;
    }

    .spec-row {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 1150px) {
    .topbar {
      height: auto;
      min-height: 82px;
      flex-wrap: wrap;
      padding: 18px 24px;
    }

    .logo {
      margin-right: auto;
    }

    .nav {
      order: 3;
      width: 100%;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .top-actions button {
      display: none;
    }

    .main-layout {
      grid-template-columns: 1fr;
    }

    .right-column {
      position: static;
    }

    .gallery-grid {
      grid-template-columns: 1fr;
    }

    .thumb-grid {
      grid-template-columns: repeat(5, 1fr);
    }

    .thumb {
      height: 100px;
    }
  }

  @media (max-width: 700px) {
    .breadcrumb-row {
      padding: 20px 18px;
      overflow-x: auto;
      white-space: nowrap;
    }

    .save-share {
      display: none;
    }

    .main-layout {
      padding: 0 18px 44px;
    }

    .main-photo {
      height: 280px;
    }

    .thumb-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .title-row {
      align-items: start;
      flex-direction: column;
    }

    .title-row h1 {
      font-size: 32px;
    }

    .spec-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .features-card {
      gap: 18px;
    }

    .seller-benefits {
      grid-template-columns: 1fr;
    }

    .seller-benefits div {
      border-right: none;
      border-bottom: 1px solid #e3e9f3;
    }

    .seller-benefits div:last-child {
      border-bottom: none;
    }
  }
`;

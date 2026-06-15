"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

function getTitle(car) {
  if (car.title) return car.title;

  const title = [car.make, car.model].filter(Boolean).join(" ").trim();

  return title || "Car listing";
}

function getSubtitle(car) {
  const subtitle = [
    car.variant,
    car.engine_size,
    car.fuel,
    car.transmission,
    car.body_type,
  ]
    .filter(Boolean)
    .join(" ");

  return subtitle || "Used car listed on Kerb";
}

function getImage(car) {
  if (car.image_url) return car.image_url;
  if (car.photo_url) return car.photo_url;
  if (car.main_photo_url) return car.main_photo_url;
  if (car.cover_image_url) return car.cover_image_url;

  if (Array.isArray(car.photos) && car.photos[0]) return car.photos[0];
  if (Array.isArray(car.images) && car.images[0]) return car.images[0];

  if (typeof car.photos === "string" && car.photos.trim()) {
    try {
      const parsed = JSON.parse(car.photos);
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
      return car.photos;
    }
  }

  if (typeof car.images === "string" && car.images.trim()) {
    try {
      const parsed = JSON.parse(car.images);
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
      return car.images;
    }
  }

  return "/cars/hero-car.png";
}

function getMileage(car) {
  const value = car.mileage || car.miles;
  const number = Number(value);

  if (!value) return "";
  if (!Number.isFinite(number)) return value;

  return `${new Intl.NumberFormat("en-GB").format(number)} miles`;
}

function getYearText(car) {
  if (car.year) return String(car.year);
  if (car.registration_year) return String(car.registration_year);
  return "";
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
    location: (
      <>
        <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
    price: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9.5A3 3 0 0 0 12.4 8H11a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-1.4A3 3 0 0 1 9 14.5" />
        <path d="M12 6v12" />
      </>
    ),
    mileage: (
      <>
        <path d="M4 14a8 8 0 0 1 16 0" />
        <path d="M12 14l4-4" />
        <path d="M4 14h16" />
      </>
    ),
    body: (
      <>
        <path d="M5 16h14l-1.2-4.5a3 3 0 0 0-2.9-2.2H9.1a3 3 0 0 0-2.9 2.2L5 16Z" />
        <circle cx="8" cy="17" r="2" />
        <circle cx="16" cy="17" r="2" />
      </>
    ),
    fuel: (
      <>
        <path d="M7 3h8v18H7z" />
        <path d="M15 8h2.5L20 10.5V18a2 2 0 0 1-2 2h-1" />
        <path d="M9 7h4" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 7h16" />
        <path d="M4 17h16" />
        <circle cx="9" cy="7" r="2" />
        <circle cx="15" cy="17" r="2" />
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

export default function BrowsePage() {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCars() {
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
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Browse page error:", error);
        setErrorMessage(error.message);
        setCars([]);
      } else {
        setCars(data || []);
      }

      setLoading(false);
    }

    loadCars();
  }, []);

  const visibleCars = useMemo(() => {
    let list = [...cars];

    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter((car) => {
        const searchableText = [
          car.title,
          car.make,
          car.model,
          car.variant,
          car.year,
          car.fuel,
          car.transmission,
          car.location,
          car.city,
          car.postcode,
          car.body_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    if (sort === "price-low") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sort === "price-high") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sort === "mileage-low") {
      list.sort(
        (a, b) =>
          Number(a.mileage || a.miles || 0) -
          Number(b.mileage || b.miles || 0)
      );
    }

    return list;
  }, [cars, search, sort]);

  return (
    <>
      <main className="browse-page">
        <header className="topbar">
          <Link href="/" className="logo">
            Kerb
          </Link>

          <nav className="nav">
            <Link href="/browse" className="nav-item active">
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
            <button className="saved-button" type="button">
              <SvgIcon name="heart" />
              Saved
            </button>

            <Link href="/login" className="signin-button">
              <SvgIcon name="user" />
              Sign in
            </Link>

            <Link href="/post-car" className="post-button">
              <SvgIcon name="plus" />
              Post your car
            </Link>
          </div>
        </header>

        <section className="filters-section">
          <div className="filters-grid">
            <div className="filter-card">
              <SvgIcon name="location" />
              <div>
                <p>Location</p>
                <strong>Leicester</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <div className="filter-card">
              <SvgIcon name="car" />
              <div>
                <p>Make & model</p>
                <strong>Any make</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <div className="filter-card">
              <SvgIcon name="price" />
              <div>
                <p>Price</p>
                <strong>Any price</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <div className="filter-card">
              <SvgIcon name="mileage" />
              <div>
                <p>Mileage</p>
                <strong>Any miles</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <div className="filter-card">
              <SvgIcon name="body" />
              <div>
                <p>Body type</p>
                <strong>Any</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <div className="filter-card">
              <SvgIcon name="fuel" />
              <div>
                <p>Fuel type</p>
                <strong>Any</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <button className="filter-button" type="button">
              <SvgIcon name="sliders" />
              Filter
            </button>
          </div>

          <div className="search-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search make, model, fuel, location..."
              className="search-input"
            />

            <div className="sort-box">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="mileage-low">Lowest mileage</option>
              </select>
            </div>
          </div>
        </section>

        <section className="results-section">
          <div className="results-heading">
            <h1>
              {loading
                ? "Loading cars..."
                : `${visibleCars.length} car${
                    visibleCars.length === 1 ? "" : "s"
                  } found`}
            </h1>
          </div>

          {errorMessage && <div className="error-box">{errorMessage}</div>}

          {loading && (
            <div className="cars-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="skeleton-card" />
              ))}
            </div>
          )}

          {!loading && !errorMessage && visibleCars.length === 0 && (
            <div className="empty-box">
              <h2>No cars found</h2>
              <p>
                Once you approve a listing in your admin page, it will appear
                here.
              </p>
              <Link href="/post-car">Post your car</Link>
            </div>
          )}

          {!loading && !errorMessage && visibleCars.length > 0 && (
            <div className="cars-grid">
              {visibleCars.map((car, index) => {
                const title = getTitle(car);
                const subtitle = getSubtitle(car);
                const image = getImage(car);
                const mileage = getMileage(car);
                const year = getYearText(car);
                const location = car.location || car.city || car.postcode || "";
                const price =
                  car.price || car.asking_price || car.listing_price;
                const sellerType =
                  car.seller_type ||
                  (index % 2 === 0 ? "Approved dealer" : "Private seller");

                return (
                  <article className="car-card" key={car.id || index}>
                    <div className="image-wrap">
                      <img
                        src={image}
                        alt={title}
                        onError={(event) => {
                          event.currentTarget.src = "/cars/hero-car.png";
                        }}
                      />

                      <div
                        className={
                          sellerType.toLowerCase().includes("private")
                            ? "seller-badge private"
                            : "seller-badge dealer"
                        }
                      >
                        <SvgIcon name="shield" />
                        {sellerType.toLowerCase().includes("private")
                          ? "Private seller"
                          : "Approved dealer"}
                      </div>

                      <button className="heart-button" type="button">
                        <SvgIcon name="heart" />
                      </button>

                      <div className="photo-count">
                        <SvgIcon name="camera" />
                        1/20
                      </div>
                    </div>

                    <div className="card-body">
                      <h2>{title}</h2>
                      <p className="subtitle">{subtitle}</p>

                      <div className="price-location">
                        <strong>{formatPrice(price)}</strong>
                        {location && <span>{location}</span>}
                      </div>

                      <div className="specs">
                        {mileage && <span>{mileage}</span>}
                        {year && <span>{year}</span>}
                        {car.fuel && <span>{car.fuel}</span>}
                        {car.transmission && <span>{car.transmission}</span>}
                      </div>

                      <Link href={`/listing/${car.id}`} className="view-link">
                        View listing
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f8faff;
          color: #12182f;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        button,
        input,
        select {
          font-family: inherit;
        }

        .browse-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top left,
              rgba(0, 72, 255, 0.06),
              transparent 34%
            ),
            #f8faff;
          overflow-x: hidden;
        }

        .svg-icon {
          width: 20px;
          height: 20px;
          flex: 0 0 auto;
        }

        .topbar {
          height: 92px;
          padding: 0 22px;
          display: flex;
          align-items: center;
          gap: 18px;
          background: rgba(255, 255, 255, 0.92);
          border-bottom: 1px solid #e9edf6;
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(16px);
          width: 100%;
          max-width: 100vw;
        }

        .logo {
          font-size: 42px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -2px;
          color: #0b45ff;
          margin-right: 24px;
          flex: 0 0 auto;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1 1 auto;
          min-width: 0;
          overflow: hidden;
        }

        .nav-item {
          height: 50px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #1b2240;
          white-space: nowrap;
          flex: 0 0 auto;
        }

        .nav-item .svg-icon {
          width: 18px;
          height: 18px;
        }

        .nav-item.active {
          color: #0b45ff;
          background: #eef3ff;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 0 0 auto;
        }

        .saved-button,
        .signin-button {
          border: none;
          background: transparent;
          color: #4b5575;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0;
          text-decoration: none;
        }

        .saved-button .svg-icon,
        .signin-button .svg-icon {
          width: 19px;
          height: 19px;
        }

        .post-button {
          height: 58px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 18px;
          border-radius: 16px;
          background: #083cff;
          color: white;
          font-size: 14px;
          font-weight: 900;
          box-shadow: 0 12px 26px rgba(8, 60, 255, 0.22);
          white-space: nowrap;
          flex: 0 0 auto;
        }

        .post-button .svg-icon {
          width: 20px;
          height: 20px;
        }

        .filters-section {
          padding: 26px 32px 0;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(130px, 1fr)) 160px;
          gap: 20px;
          align-items: center;
        }

        .filter-card {
          height: 64px;
          background: white;
          border: 1px solid #e5ebf5;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 16px;
          box-shadow: 0 8px 20px rgba(13, 23, 55, 0.04);
          min-width: 0;
        }

        .filter-card .svg-icon {
          width: 24px;
          height: 24px;
          color: #11182f;
        }

        .filter-card div {
          min-width: 0;
          flex: 1;
        }

        .filter-card p {
          margin: 0 0 2px;
          color: #6d7691;
          font-size: 13px;
          font-weight: 600;
        }

        .filter-card strong {
          display: block;
          color: #12182f;
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chevron {
          color: #1d2540;
          font-size: 18px;
        }

        .filter-button {
          height: 64px;
          border: none;
          border-radius: 16px;
          background: #083cff;
          color: white;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 12px 26px rgba(8, 60, 255, 0.22);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .search-row {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
        }

        .search-input {
          width: min(560px, 100%);
          height: 46px;
          border: 1px solid #e5ebf5;
          border-radius: 14px;
          background: white;
          padding: 0 16px;
          color: #12182f;
          font-size: 14px;
          outline: none;
          box-shadow: 0 8px 20px rgba(13, 23, 55, 0.04);
        }

        .search-input:focus {
          border-color: #0b45ff;
          box-shadow: 0 0 0 4px rgba(11, 69, 255, 0.1);
        }

        .sort-box {
          height: 46px;
          min-width: 250px;
          background: white;
          border: 1px solid #e5ebf5;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          box-shadow: 0 8px 20px rgba(13, 23, 55, 0.04);
        }

        .sort-box span {
          color: #68728d;
          font-size: 14px;
          font-weight: 600;
        }

        .sort-box select {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: #12182f;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .results-section {
          padding: 20px 32px 50px;
        }

        .results-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .results-heading h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 950;
          letter-spacing: -0.2px;
          color: #12182f;
        }

        .cars-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }

        .car-card {
          overflow: hidden;
          border-radius: 16px;
          background: white;
          border: 1px solid #e5ebf5;
          box-shadow: 0 12px 28px rgba(13, 23, 55, 0.06);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .car-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(13, 23, 55, 0.12);
        }

        .image-wrap {
          height: 205px;
          position: relative;
          background: #e9eef7;
          overflow: hidden;
        }

        .image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .seller-badge {
          position: absolute;
          left: 12px;
          top: 12px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 950;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .seller-badge .svg-icon {
          width: 14px;
          height: 14px;
        }

        .seller-badge.dealer {
          color: #0843ff;
          background: #eef3ff;
        }

        .seller-badge.private {
          color: #077245;
          background: #eafff3;
        }

        .heart-button {
          position: absolute;
          right: 12px;
          top: 12px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: rgba(16, 22, 42, 0.3);
          color: white;
          cursor: pointer;
          backdrop-filter: blur(5px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .heart-button .svg-icon {
          width: 21px;
          height: 21px;
        }

        .photo-count {
          position: absolute;
          right: 10px;
          bottom: 10px;
          height: 26px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0 9px;
          border-radius: 7px;
          background: white;
          color: #151b32;
          font-size: 12px;
          font-weight: 900;
        }

        .photo-count .svg-icon {
          width: 13px;
          height: 13px;
        }

        .card-body {
          padding: 15px 17px 16px;
        }

        .card-body h2 {
          margin: 0 0 6px;
          color: #151b32;
          font-size: 18px;
          font-weight: 950;
          letter-spacing: -0.3px;
        }

        .subtitle {
          margin: 0 0 12px;
          color: #5e6782;
          font-size: 13px;
          line-height: 1.35;
          min-height: 18px;
        }

        .price-location {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .price-location strong {
          color: #11182f;
          font-size: 21px;
          font-weight: 950;
          letter-spacing: -0.4px;
        }

        .price-location span {
          color: #65708d;
          font-size: 12px;
          font-weight: 700;
          text-align: right;
        }

        .specs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .specs span {
          display: inline-flex;
          align-items: center;
          height: 26px;
          padding: 0 12px;
          border-radius: 8px;
          background: #f0f3f8;
          color: #59627c;
          font-size: 12px;
          font-weight: 800;
        }

        .view-link {
          margin-top: 14px;
          height: 42px;
          border-radius: 12px;
          background: #f2f5ff;
          color: #0b45ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 950;
        }

        .error-box {
          background: #fff1f1;
          color: #c01818;
          border: 1px solid #ffd1d1;
          border-radius: 16px;
          padding: 16px;
          font-weight: 800;
        }

        .empty-box {
          background: white;
          border: 1px solid #e5ebf5;
          border-radius: 20px;
          padding: 50px 24px;
          text-align: center;
          box-shadow: 0 12px 28px rgba(13, 23, 55, 0.06);
        }

        .empty-box h2 {
          margin: 0;
          color: #11182f;
          font-size: 26px;
          font-weight: 950;
        }

        .empty-box p {
          margin: 10px 0 22px;
          color: #68728d;
          font-weight: 600;
        }

        .empty-box a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          padding: 0 22px;
          border-radius: 14px;
          background: #083cff;
          color: white;
          font-weight: 950;
        }

        .skeleton-card {
          height: 370px;
          border-radius: 16px;
          background: linear-gradient(90deg, #eef2f7, #ffffff, #eef2f7);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
          border: 1px solid #e5ebf5;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 1450px) {
          .topbar {
            padding: 0 18px;
            gap: 12px;
          }

          .logo {
            margin-right: 16px;
          }

          .nav {
            gap: 6px;
          }

          .nav-item {
            padding: 0 10px;
            font-size: 13px;
          }

          .saved-button,
          .signin-button {
            font-size: 13px;
          }

          .post-button {
            padding: 0 15px;
            font-size: 13px;
          }
        }

        @media (max-width: 1280px) {
          .guides-link {
            display: none;
          }

          .filters-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .cars-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1050px) {
          .topbar {
            height: auto;
            min-height: 92px;
            padding: 18px;
            flex-wrap: wrap;
            overflow: visible;
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

          .top-actions {
            gap: 8px;
          }

          .saved-button,
          .signin-button {
            display: none;
          }

          .filters-section,
          .results-section {
            padding-left: 18px;
            padding-right: 18px;
          }

          .filters-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .filter-button {
            grid-column: span 2;
          }

          .search-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input,
          .sort-box {
            width: 100%;
          }

          .cars-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 620px) {
          .topbar {
            padding: 16px;
          }

          .logo {
            font-size: 36px;
          }

          .post-button {
            height: 48px;
            padding: 0 16px;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .filter-button {
            grid-column: auto;
          }

          .cars-grid {
            grid-template-columns: 1fr;
          }

          .image-wrap {
            height: 220px;
          }
        }
      `}</style>
    </>
  );
}

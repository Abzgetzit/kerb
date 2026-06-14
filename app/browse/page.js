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

function Icon({ children }) {
  return <span className="icon">{children}</span>;
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
              <span>🚘</span> Browse cars
            </Link>
            <Link href="/browse" className="nav-item">
              <span>🆕</span> New cars
            </Link>
            <Link href="/post-car" className="nav-item">
              <span>🔁</span> Sell your car
            </Link>
            <Link href="/browse" className="nav-item">
              <span>⚡</span> Electric
            </Link>
            <Link href="/browse" className="nav-item">
              <span>💷</span> Finance
            </Link>
            <Link href="/browse" className="nav-item">
              <span>📋</span> Guides
            </Link>
          </nav>

          <div className="top-actions">
            <button className="saved-button">♡ Saved</button>
            <button className="signin-button">Sign in</button>
            <Link href="/post-car" className="post-button">
              + Post your car
            </Link>
          </div>
        </header>

        <section className="filters-section">
          <div className="filters-grid">
            <div className="filter-card">
              <Icon>📍</Icon>
              <div>
                <p>Location</p>
                <strong>Leicester (50 mi)</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <div className="filter-card">
              <Icon>🚗</Icon>
              <div>
                <p>Make & model</p>
                <strong>Any make</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <div className="filter-card">
              <Icon>£</Icon>
              <div>
                <p>Price</p>
                <strong>Any price</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <div className="filter-card">
              <Icon>⏱</Icon>
              <div>
                <p>Mileage</p>
                <strong>Any miles</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <div className="filter-card">
              <Icon>🚙</Icon>
              <div>
                <p>Body type</p>
                <strong>Any</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <div className="filter-card">
              <Icon>⛽</Icon>
              <div>
                <p>Fuel type</p>
                <strong>Any</strong>
              </div>
              <span className="chevron">⌄</span>
            </div>

            <button className="filter-button">☷ Filter</button>
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
              <p>Approved listings will appear here once they are live.</p>
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
                const price = car.price || car.asking_price || car.listing_price;
                const sellerType =
                  car.seller_type || (index % 2 === 0 ? "Approved dealer" : "Private seller");

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
                        {sellerType.toLowerCase().includes("private")
                          ? "▣ Private seller"
                          : "▣ Approved dealer"}
                      </div>

                      <button className="heart-button">♡</button>

                      <div className="photo-count">▣ 1/20</div>
                    </div>

                    <div className="card-body">
                      <h2>{title}</h2>
                      <p className="subtitle">{subtitle}</p>

                      <div className="price-location">
                        <strong>{formatPrice(price)}</strong>
                        {location && <span>📍 {location}</span>}
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
            radial-gradient(circle at top left, rgba(0, 72, 255, 0.06), transparent 34%),
            #f8faff;
        }

        .topbar {
          height: 92px;
          padding: 0 30px;
          display: flex;
          align-items: center;
          gap: 28px;
          background: rgba(255, 255, 255, 0.92);
          border-bottom: 1px solid #e9edf6;
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(16px);
        }

        .logo {
          font-size: 42px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -2px;
          color: #0b45ff;
          margin-right: 52px;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .nav-item {
          height: 50px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 18px;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 800;
          color: #1b2240;
          white-space: nowrap;
        }

        .nav-item.active {
          color: #0b45ff;
          background: #eef3ff;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .saved-button,
        .signin-button {
          border: none;
          background: transparent;
          color: #4b5575;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .post-button {
          height: 58px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 25px;
          border-radius: 16px;
          background: #083cff;
          color: white;
          font-size: 15px;
          font-weight: 900;
          box-shadow: 0 12px 26px rgba(8, 60, 255, 0.22);
          white-space: nowrap;
        }

        .filters-section {
          padding: 26px 30px 0;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(150px, 1fr)) 150px;
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

        .icon {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          color: #11182f;
          flex: 0 0 auto;
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
        }

        .search-row {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
        }

        .search-input {
          width: min(520px, 100%);
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
          min-width: 230px;
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
          padding: 20px 30px 50px;
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
          padding: 0 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 950;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
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
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(16, 22, 42, 0.3);
          color: white;
          font-size: 25px;
          line-height: 1;
          cursor: pointer;
          backdrop-filter: blur(5px);
        }

        .photo-count {
          position: absolute;
          right: 10px;
          bottom: 10px;
          height: 26px;
          display: inline-flex;
          align-items: center;
          padding: 0 9px;
          border-radius: 7px;
          background: white;
          color: #151b32;
          font-size: 12px;
          font-weight: 900;
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

        @media (max-width: 1300px) {
          .topbar {
            gap: 18px;
          }

          .logo {
            margin-right: 20px;
          }

          .nav {
            gap: 8px;
          }

          .nav-item {
            padding: 0 12px;
          }

          .filters-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .cars-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 950px) {
          .topbar {
            height: auto;
            padding: 18px;
            flex-wrap: wrap;
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

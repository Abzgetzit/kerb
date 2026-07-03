"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteMenu from "../components/SiteMenu";
import {
  getPublicVehicleMake,
  getVehicleMakeMatchKey,
  getVehicleModelsForPublicMake,
  publicVehicleMakeOptions,
} from "../lib/public-vehicle-makes";

const categoryLabels = {
  "first-car": "First cars",
  performance: "Performance cars",
  "family-suv": "Family SUV cars",
  "electric-hybrid": "Electric & hybrid cars",
  "newer-car": "New cars",
};

function price(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

function image(car) {
  const fields = [
    car.image_url,
    car.photo_url,
    car.main_photo_url,
    car.cover_image_url,
    car.photos,
    car.photo_urls,
    car.images,
    car.image_urls,
  ];

  for (const field of fields) {
    if (!field) continue;
    if (Array.isArray(field) && field[0]) return field[0];
    if (typeof field === "string") {
      const trimmed = field.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        if (typeof parsed === "string") return parsed;
      } catch {
        return trimmed;
      }
    }
  }

  return "/cars/hero-car.png";
}

function title(car) {
  return (
    car.title ||
    [car.year, car.make, car.model, car.model_detail, car.variant]
      .filter(Boolean)
      .join(" ") ||
    "Car listing"
  );
}

function mileage(car) {
  const n = Number(car.mileage || car.miles || 0);
  if (!Number.isFinite(n) || n <= 0) return "Mileage TBC";
  return `${n.toLocaleString("en-GB")} miles`;
}

function text(car) {
  return [
    car.title,
    car.make,
    car.model,
    car.model_detail,
    car.variant,
    car.fuel,
    car.fuel_type,
    car.gearbox,
    car.body_type,
    car.condition,
    car.location,
    car.description,
    Array.isArray(car.features) ? car.features.join(" ") : car.features,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasFinance(car) {
  const financeText = [
    car.finance,
    car.finance_available,
    car.finance_option,
    car.finance_options,
    car.payment_options,
    car.seller_finance,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    car.finance === true ||
    car.finance_available === true ||
    financeText.includes("finance") ||
    financeText.includes("available")
  );
}

function carPrice(car) {
  return Number(car.price || car.asking_price || car.listing_price || 0);
}

function carMileage(car) {
  return Number(car.mileage || car.miles || 0);
}

function categoryMatch(car, category) {
  if (!category) return true;
  if (String(car.listing_category || "").toLowerCase() === category) return true;

  const blob = text(car);
  const year = Number(car.year || 0);
  const miles = carMileage(car);
  const p = carPrice(car);
  const body = String(car.body_type || "").toLowerCase();
  const fuel = String(car.fuel || car.fuel_type || "").toLowerCase();
  const currentYear = new Date().getFullYear();

  if (category === "newer-car") {
    return year >= currentYear - 3 || String(car.condition || "").toLowerCase().includes("new");
  }

  if (category === "electric-hybrid") {
    return fuel.includes("electric") || fuel.includes("hybrid") || blob.includes("ev") || blob.includes("phev");
  }

  if (category === "family-suv") {
    return body.includes("suv") || body.includes("4x4") || body.includes("crossover") || blob.includes("family suv") || blob.includes("7 seats");
  }

  if (category === "first-car") {
    return (
      p > 0 &&
      p <= 10000 &&
      (!miles || miles <= 90000) &&
      (body.includes("hatchback") ||
        ["fiesta", "corsa", "polo", "yaris", "aygo", "i10", "picanto", "clio"].some((term) => blob.includes(term)))
    );
  }

  if (category === "performance") {
    return [
      "performance",
      "m sport",
      "amg",
      "s line",
      "gti",
      "golf r",
      "m3",
      "m4",
      "m5",
      "rs3",
      "rs4",
      "s3",
      "type r",
      "cupra",
      "vrs",
      "quadrifoglio",
    ].some((term) => blob.includes(term));
  }

  return true;
}

function sortCars(cars, sort) {
  const items = [...cars];
  if (sort === "price-low") return items.sort((a, b) => carPrice(a) - carPrice(b));
  if (sort === "price-high") return items.sort((a, b) => carPrice(b) - carPrice(a));
  if (sort === "mileage-low") return items.sort((a, b) => carMileage(a) - carMileage(b));
  return items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function makeMatches(carMake, selectedMake) {
  if (!selectedMake) return true;

  const selectedKey = getVehicleMakeMatchKey(selectedMake);
  const carKey = getVehicleMakeMatchKey(carMake);
  const rawCarMake = String(carMake || "").toLowerCase();
  const rawSelectedMake = String(selectedMake || "").toLowerCase();

  return carKey === selectedKey || rawCarMake.includes(rawSelectedMake);
}

function LandingContent({ content, count }) {
  if (!content) return null;

  return (
    <section className="landingIntro">
      <div className="landingCopy">
        <div>
          {content.kicker && <span>{content.kicker}</span>}
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <strong>{count} {count === 1 ? "listing" : "listings"} found</strong>
      </div>

      {content.points?.length ? (
        <div className="landingCards">
          {content.points.map((point, index) => (
            <article key={point.title}>
              <em>{String(index + 1).padStart(2, "0")}</em>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      ) : null}

      {content.faqs?.length ? (
        <div className="faqBlock">
          <div className="faqHeader">
            <span>Kerb Car FAQs</span>
            <h2>{content.faqTitle || "Common questions"}</h2>
          </div>

          <div className="faqGrid">
            {content.faqs.map((faq) => (
              <article key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function BrowseClient({
  initialCars = [],
  initialFilters = {},
  initialSearch = "",
  initialSort = "featured",
  initialLoadError = "",
  landingContent = null,
}) {
  const [filters, setFilters] = useState({ ...initialFilters });
  const [query, setQuery] = useState(initialSearch || "");
  const [sort, setSort] = useState(initialSort || "featured");

  const cars = useMemo(() => {
    const q = query.trim().toLowerCase();

    return sortCars(
      (initialCars || []).filter((car) => {
        const blob = text(car);
        if (q && !blob.includes(q)) return false;
        if (filters.make && !makeMatches(car.make, filters.make)) return false;
        if (filters.model && !blob.includes(String(filters.model).toLowerCase())) return false;
        if (filters.location && !String(car.location || "").toLowerCase().includes(String(filters.location).toLowerCase())) return false;
        if (filters.finance === "true" && !hasFinance(car)) return false;
        if (filters.priceMin && carPrice(car) < Number(filters.priceMin)) return false;
        if (filters.priceMax && carPrice(car) > Number(filters.priceMax)) return false;
        if (filters.mileageMax && carMileage(car) > Number(filters.mileageMax)) return false;
        if (!categoryMatch(car, filters.category)) return false;
        return true;
      }),
      sort
    );
  }, [initialCars, filters, query, sort]);

  const heading = filters.category
    ? categoryLabels[filters.category] || "Browse cars"
    : filters.finance === "true"
      ? "Cars with finance available"
      : "Browse cars for sale";
  const currentMake = getPublicVehicleMake(filters.make || "");
  const modelOptions = currentMake ? getVehicleModelsForPublicMake(currentMake) : [];

  function updateFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "make" ? { model: "" } : {}),
    }));
  }

  return (
    <main className="browseSeoPage">
      <header className="nav">
        <Link href="/" className="logo">Kerb</Link>
        <div className="links">
          <Link href="/browse">Browse cars</Link>
          <Link href="/new-cars">New cars</Link>
          <Link href="/sell-car">Sell your car</Link>
          <Link href="/electric-cars">Electric</Link>
          <Link href="/car-finance">Cars with finance available</Link>
          <Link href="/guides">Guides</Link>
        </div>
        <SiteMenu currentUser={null} />
      </header>

      <section className="hero">
        <div>
          <p>Kerb Car marketplace</p>
          <h1>{heading}</h1>
          <span>{cars.length} {cars.length === 1 ? "car" : "cars"} found</span>
        </div>
        <Link href="/sell-car" className="sellBtn">Sell your car for free</Link>
      </section>

      <LandingContent content={landingContent} count={cars.length} />

      <section className="filters" aria-label="Car search filters">
        <label>
          <span>Town or city</span>
          <input value={filters.location || ""} onChange={(event) => updateFilter("location", event.target.value)} placeholder="Any location" />
        </label>

        <label>
          <span>Make</span>
          <input
            list="kerb-make-options"
            value={filters.make || ""}
            onChange={(event) => updateFilter("make", event.target.value)}
            placeholder="Search make"
          />
          <datalist id="kerb-make-options">
            {publicVehicleMakeOptions.map((make) => (
              <option key={make} value={make} />
            ))}
          </datalist>
        </label>

        <label>
          <span>Model</span>
          <select value={filters.model || ""} onChange={(event) => updateFilter("model", event.target.value)} disabled={!currentMake}>
            <option value="">Any model</option>
            {modelOptions.map((model) => <option key={model}>{model}</option>)}
          </select>
        </label>

        <label>
          <span>Price from</span>
          <input value={filters.priceMin || ""} onChange={(event) => updateFilter("priceMin", event.target.value.replace(/[^0-9]/g, ""))} placeholder="£ Min" />
        </label>

        <label>
          <span>Price to</span>
          <input value={filters.priceMax || ""} onChange={(event) => updateFilter("priceMax", event.target.value.replace(/[^0-9]/g, ""))} placeholder="£ Max" />
        </label>

        <label>
          <span>Max mileage</span>
          <input value={filters.mileageMax || ""} onChange={(event) => updateFilter("mileageMax", event.target.value.replace(/[^0-9]/g, ""))} placeholder="Mileage max" />
        </label>

        <label>
          <span>Finance</span>
          <select value={filters.finance || ""} onChange={(event) => updateFilter("finance", event.target.value)}>
            <option value="">Any finance</option>
            <option value="true">Finance available</option>
          </select>
        </label>

        <label>
          <span>Category</span>
          <select value={filters.category || ""} onChange={(event) => updateFilter("category", event.target.value)}>
            <option value="">All categories</option>
            <option value="newer-car">New cars</option>
            <option value="electric-hybrid">Electric & hybrid</option>
            <option value="family-suv">Family SUV cars</option>
            <option value="first-car">First cars</option>
            <option value="performance">Performance cars</option>
          </select>
        </label>

        <label className="wide">
          <span>Keyword</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search make, model, fuel, location..." />
        </label>

        <label>
          <span>Sort by</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Newest first</option>
            <option value="price-low">Price low to high</option>
            <option value="price-high">Price high to low</option>
            <option value="mileage-low">Lowest mileage</option>
          </select>
        </label>
      </section>

      {initialLoadError && <div className="notice">{initialLoadError}</div>}

      {cars.length > 0 ? (
        <section className="grid">
          {cars.map((car) => (
            <Link className="card" href={`/listing/${car.id}`} key={car.id}>
              <img src={image(car)} alt={title(car)} />
              <div>
                <h2>{title(car)}</h2>
                <p>{[car.fuel_type || car.fuel, car.gearbox, car.body_type].filter(Boolean).join(" • ") || "Used car listed on Kerb Car"}</p>
                <div className="meta">
                  {car.location && <span>{car.location}</span>}
                  <span>{mileage(car)}</span>
                  {hasFinance(car) && <span>Finance available</span>}
                </div>
                <strong>{price(carPrice(car))}</strong>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="empty">
          <h2>No cars match these filters yet</h2>
          <p>Try widening your filters or browse all cars on Kerb Car.</p>
          <button type="button" onClick={() => setFilters({})}>Clear filters</button>
        </section>
      )}

      <style jsx global>{`
        .browseSeoPage {
          min-height: 100vh;
          padding: 22px 40px 50px;
          background: radial-gradient(circle at top left, rgba(0, 72, 255, 0.06), transparent 30%), #f7f9fd;
          color: #071126;
          font-family: Inter, Arial, sans-serif;
        }

        .browseSeoPage * { box-sizing: border-box; }
        .browseSeoPage .nav { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 24px; }
        .browseSeoPage .logo { font-size: 38px; font-weight: 950; color: #0048ff; text-decoration: none; letter-spacing: -2px; }
        .browseSeoPage .links { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; font-weight: 900; }
        .browseSeoPage .links a { color: #101832; text-decoration: none; }
        .browseSeoPage .links a:hover { color: #0048ff; }
        .browseSeoPage .hero { display: flex; justify-content: space-between; align-items: center; gap: 18px; border: 1px solid #dfe8f7; border-radius: 30px; padding: 38px; background: radial-gradient(circle at 85% 20%, rgba(0,72,255,.12), transparent 28%), linear-gradient(135deg, #ffffff, #eef5ff); box-shadow: 0 20px 50px rgba(14, 30, 70, 0.08); margin-bottom: 22px; }
        .browseSeoPage .hero p { margin: 0 0 8px; color: #0048ff; font-weight: 950; }
        .browseSeoPage h1 { margin: 0 0 10px; font-size: clamp(42px, 6vw, 78px); letter-spacing: -3px; line-height: 0.94; }
        .browseSeoPage .hero span { color: #53617a; font-weight: 900; }
        .browseSeoPage .sellBtn, .browseSeoPage .empty button { border: none; border-radius: 18px; background: #0048ff; color: white; padding: 15px 20px; text-decoration: none; font-weight: 950; cursor: pointer; box-shadow: 0 14px 30px rgba(0,72,255,.2); }
        .browseSeoPage .landingIntro { display: grid; gap: 18px; margin-bottom: 22px; }
        .browseSeoPage .landingCopy, .browseSeoPage .faqBlock { border: 1px solid #dfe8f7; border-radius: 28px; background: rgba(255,255,255,.96); padding: 28px; box-shadow: 0 16px 42px rgba(14, 30, 70, 0.06); }
        .browseSeoPage .landingCopy { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 20px; }
        .browseSeoPage .landingCopy span, .browseSeoPage .faqHeader span { display: inline-flex; color: #0048ff; background: #eaf1ff; border-radius: 999px; padding: 9px 13px; font-weight: 950; margin-bottom: 12px; }
        .browseSeoPage .landingCopy strong { color: #0048ff; background: #eef4ff; border-radius: 18px; padding: 14px 16px; white-space: nowrap; }
        .browseSeoPage .landingCopy h2, .browseSeoPage .faqBlock h2 { margin: 0 0 10px; font-size: clamp(30px, 4vw, 48px); letter-spacing: -1.8px; line-height: 1; }
        .browseSeoPage .landingCopy p, .browseSeoPage .landingCards p, .browseSeoPage .faqBlock p, .browseSeoPage .empty p { color: #53617a; line-height: 1.65; font-weight: 750; }
        .browseSeoPage .landingCards, .browseSeoPage .faqGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .browseSeoPage .landingCards article, .browseSeoPage .faqGrid article { border: 1px solid #dfe8f7; border-radius: 24px; background: #ffffff; padding: 22px; box-shadow: 0 14px 34px rgba(14,30,70,.05); }
        .browseSeoPage .landingCards article { background: linear-gradient(145deg, #ffffff, #f4f8ff); }
        .browseSeoPage .landingCards em { display: inline-flex; width: 38px; height: 38px; align-items: center; justify-content: center; border-radius: 14px; background: #0048ff; color: #fff; font-style: normal; font-weight: 950; margin-bottom: 14px; }
        .browseSeoPage .landingCards h3, .browseSeoPage .faqGrid h3 { margin: 0 0 8px; font-size: 20px; letter-spacing: -.2px; }
        .browseSeoPage .landingCards p, .browseSeoPage .faqGrid p { margin: 0; }
        .browseSeoPage .faqBlock { display: grid; gap: 18px; }
        .browseSeoPage .filters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 22px; border: 1px solid #dfe8f7; border-radius: 24px; background: white; padding: 16px; box-shadow: 0 14px 38px rgba(14,30,70,.05); }
        .browseSeoPage .filters label { display: grid; gap: 7px; }
        .browseSeoPage .filters label span { color: #53617a; font-size: 12px; font-weight: 950; }
        .browseSeoPage input, .browseSeoPage select { width: 100%; min-height: 46px; border: 1px solid #d8e3f3; border-radius: 14px; padding: 0 12px; font-weight: 800; background: #fbfdff; color: #071126; font-family: inherit; }
        .browseSeoPage .wide { grid-column: span 2; }
        .browseSeoPage .notice, .browseSeoPage .empty { border: 1px solid #dfe8f7; border-radius: 24px; background: white; padding: 24px; margin-bottom: 18px; }
        .browseSeoPage .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
        .browseSeoPage .card { background: white; color: inherit; text-decoration: none; border: 1px solid #dfe8f7; border-radius: 24px; overflow: hidden; box-shadow: 0 14px 40px rgba(14, 30, 70, 0.07); transition: transform .18s ease, box-shadow .18s ease; }
        .browseSeoPage .card:hover { transform: translateY(-3px); box-shadow: 0 22px 52px rgba(14, 30, 70, 0.12); }
        .browseSeoPage .card img { width: 100%; height: 220px; object-fit: cover; display: block; background: #eaf1ff; }
        .browseSeoPage .card div { padding: 18px; }
        .browseSeoPage .card h2 { margin: 0 0 8px; font-size: 20px; color: #071126; }
        .browseSeoPage .card p { margin: 0 0 10px; color: #56637a; font-weight: 750; }
        .browseSeoPage .meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .browseSeoPage .meta span { background: #eef4ff; color: #0048ff; border-radius: 999px; padding: 7px 10px; font-size: 12px; font-weight: 900; }
        .browseSeoPage .card strong { font-size: 24px; color: #071126; }

        @media (max-width: 900px) {
          .browseSeoPage { padding: 16px; }
          .browseSeoPage .links { display: none; }
          .browseSeoPage .hero { flex-direction: column; align-items: flex-start; }
          .browseSeoPage .filters, .browseSeoPage .grid, .browseSeoPage .landingCards, .browseSeoPage .faqGrid { grid-template-columns: 1fr 1fr; }
          .browseSeoPage .landingCopy { grid-template-columns: 1fr; }
          .browseSeoPage .landingCopy strong { width: fit-content; }
        }

        @media (max-width: 620px) {
          .browseSeoPage .filters, .browseSeoPage .grid, .browseSeoPage .landingCards, .browseSeoPage .faqGrid { grid-template-columns: 1fr; }
          .browseSeoPage .wide { grid-column: auto; }
          .browseSeoPage .hero, .browseSeoPage .landingCopy, .browseSeoPage .faqBlock { padding: 22px; }
          .browseSeoPage h1 { letter-spacing: -2px; }
        }
      `}</style>
    </main>
  );
}

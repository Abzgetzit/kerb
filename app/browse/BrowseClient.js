"use client";

import Link from "next/link";
import SiteMenu from "../components/SiteMenu";

function price(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

function image(car) {
  const fields = [car.image_url, car.photo_url, car.main_photo_url, car.cover_image_url, car.photos, car.photo_urls, car.images, car.image_urls];
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
  return car.title || [car.year, car.make, car.model, car.model_detail, car.variant].filter(Boolean).join(" ") || "Car listing";
}

function mileage(car) {
  const n = Number(car.mileage || car.miles || 0);
  if (!Number.isFinite(n) || n <= 0) return "Mileage TBC";
  return `${n.toLocaleString("en-GB")} miles`;
}

export default function BrowseClient({ initialCars = [], initialLoadError = "" }) {
  const cars = Array.isArray(initialCars) ? initialCars : [];

  return (
    <main className="page">
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
          <p>Kerb marketplace</p>
          <h1>Browse cars for sale</h1>
          <span>{cars.length} {cars.length === 1 ? "car" : "cars"} available</span>
        </div>
        <Link href="/sell-car" className="sellBtn">Sell your car for free</Link>
      </section>

      {initialLoadError && <div className="notice">{initialLoadError}</div>}

      {cars.length > 0 ? (
        <section className="grid">
          {cars.map((car) => (
            <Link className="card" href={`/listing/${car.id}`} key={car.id}>
              <img src={image(car)} alt={title(car)} />
              <div>
                <h2>{title(car)}</h2>
                <p>{[car.fuel_type || car.fuel, car.gearbox, car.body_type].filter(Boolean).join(" • ") || "Used car listed on Kerb"}</p>
                <div className="meta">
                  {car.location && <span>{car.location}</span>}
                  <span>{mileage(car)}</span>
                  {car.finance_available && <span>Finance available</span>}
                </div>
                <strong>{price(car.price || car.asking_price)}</strong>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="empty">
          <h2>No cars listed yet</h2>
          <p>New listings will appear here as soon as they go live.</p>
        </section>
      )}

      <style jsx>{`
        .page { min-height: 100vh; padding: 22px 40px 50px; background: #f7f9fd; color: #071126; font-family: Inter, Arial, sans-serif; }
        .nav { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 24px; }
        .logo { font-size: 38px; font-weight: 950; color: #0048ff; text-decoration: none; letter-spacing: -2px; }
        .links { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; font-weight: 900; }
        .links a { color: #101832; text-decoration: none; }
        .hero { display: flex; justify-content: space-between; align-items: center; gap: 18px; border: 1px solid #dfe8f7; border-radius: 30px; padding: 34px; background: linear-gradient(135deg, #ffffff, #eef5ff); box-shadow: 0 20px 50px rgba(14, 30, 70, 0.08); margin-bottom: 22px; }
        .hero p { margin: 0 0 8px; color: #0048ff; font-weight: 950; }
        h1 { margin: 0 0 10px; font-size: clamp(38px, 6vw, 72px); letter-spacing: -3px; line-height: 0.94; }
        .hero span { color: #53617a; font-weight: 900; }
        .sellBtn { border-radius: 18px; background: #0048ff; color: white; padding: 15px 20px; text-decoration: none; font-weight: 950; }
        .notice, .empty { border: 1px solid #dfe8f7; border-radius: 24px; background: white; padding: 24px; margin-bottom: 18px; }
        .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
        .card { background: white; color: inherit; text-decoration: none; border: 1px solid #dfe8f7; border-radius: 24px; overflow: hidden; box-shadow: 0 14px 40px rgba(14, 30, 70, 0.07); }
        .card img { width: 100%; height: 220px; object-fit: cover; display: block; background: #eaf1ff; }
        .card div { padding: 18px; }
        .card h2 { margin: 0 0 8px; font-size: 20px; }
        .card p { margin: 0 0 10px; color: #56637a; font-weight: 750; }
        .meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .meta span { background: #eef4ff; border-radius: 999px; padding: 7px 10px; font-size: 12px; font-weight: 900; }
        .card strong { font-size: 24px; }
        @media (max-width: 900px) { .page { padding: 16px; } .links { display: none; } .hero { flex-direction: column; align-items: flex-start; } .grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 620px) { .grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}

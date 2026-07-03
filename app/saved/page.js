"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteMenu from "../components/SiteMenu";

function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "POA";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatMileage(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "Mileage TBC";
  return `${new Intl.NumberFormat("en-GB").format(number)} miles`;
}

function getTitle(car) {
  return (
    car.title ||
    [car.year, car.make, car.model, car.model_detail, car.variant]
      .filter(Boolean)
      .join(" ") ||
    "Saved car"
  );
}

function parseImageField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  const text = String(value || "").trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
    if (typeof parsed === "string") return [parsed];
  } catch {
    return [text];
  }

  return [];
}

function getImage(car) {
  return (
    [
      ...parseImageField(car.image_url),
      ...parseImageField(car.photo_url),
      ...parseImageField(car.main_photo_url),
      ...parseImageField(car.cover_image_url),
      ...parseImageField(car.photos),
      ...parseImageField(car.photo_urls),
      ...parseImageField(car.images),
      ...parseImageField(car.image_urls),
    ].find(Boolean) || "/cars/hero-car.png"
  );
}

export default function SavedPage() {
  const [status, setStatus] = useState("checking");
  const [accountData, setAccountData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSavedCars() {
      const token = localStorage.getItem("kerbSessionToken");

      if (!token) {
        setStatus("logged-out");
        return;
      }

      try {
        const response = await fetch("/api/account", {
          headers: {
            "x-kerb-session-token": token,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          localStorage.removeItem("kerbSessionToken");
          localStorage.removeItem("kerbAccountEmail");
          localStorage.removeItem("kerbUser");
          setStatus("logged-out");
          return;
        }

        setAccountData(result);
        setStatus("loaded");
      } catch (error) {
        setErrorMessage(error.message || "Could not load saved cars.");
        setStatus("error");
      }
    }

    loadSavedCars();
  }, []);

  const savedCars = accountData?.saved_listings || [];

  if (status === "checking") {
    return (
      <main className="page">
        <section className="stateCard">
          <Link href="/" className="logo">Kerb</Link>
          <p>Loading your saved cars...</p>
        </section>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (status === "logged-out") {
    return (
      <main className="page">
        <header className="navbar">
          <Link href="/" className="logo">Kerb</Link>
          <SiteMenu currentUser={null} />
        </header>

        <section className="hero loggedOutHero">
          <span>Saved cars</span>
          <h1>Sign in to view your saved cars.</h1>
          <p>
            Save cars while browsing Kerb Car, then come back to compare price,
            mileage, photos and seller details from one place.
          </p>
          <div className="actions">
            <Link href="/login?next=/saved" className="primaryBtn">Sign in</Link>
            <Link href="/browse" className="secondaryBtn">Browse cars</Link>
          </div>
        </section>

        <style jsx>{styles}</style>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="page">
        <section className="stateCard">
          <Link href="/" className="logo">Kerb</Link>
          <h1>Saved cars error</h1>
          <p>{errorMessage}</p>
          <Link href="/login?next=/saved" className="primaryBtn">Sign in again</Link>
        </section>
        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="navbar">
        <Link href="/" className="logo">Kerb</Link>
        <nav>
          <Link href="/browse">Browse cars</Link>
          <Link href="/sell-car">Sell your car</Link>
          <Link href="/account">My account</Link>
        </nav>
        <SiteMenu currentUser={accountData?.account || accountData} />
      </header>

      <section className="hero">
        <span>Saved cars</span>
        <h1>Your saved cars</h1>
        <p>
          Keep track of cars you like and return to the listing when you are ready
          to compare details or message the seller.
        </p>
      </section>

      {savedCars.length === 0 ? (
        <section className="emptyBox">
          <h2>No saved cars yet</h2>
          <p>Tap the heart on a listing to save it here.</p>
          <Link href="/browse" className="primaryBtn">Browse cars</Link>
        </section>
      ) : (
        <section className="grid">
          {savedCars.map((car) => (
            <Link href={`/listing/${car.id}`} className="card" key={car.id}>
              <img src={getImage(car)} alt={getTitle(car)} />
              <div>
                <span>Saved</span>
                <h2>{getTitle(car)}</h2>
                <p>{car.location || "Location TBC"}</p>
                <div className="meta">
                  <em>{formatMileage(car.mileage || car.miles)}</em>
                  <em>{car.fuel || car.fuel_type || "Fuel TBC"}</em>
                </div>
                <strong>{formatPrice(car.price || car.asking_price)}</strong>
              </div>
            </Link>
          ))}
        </section>
      )}

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }
  .page { min-height: 100vh; padding: 22px 40px 50px; background: radial-gradient(circle at top left, rgba(0,72,255,.08), transparent 32%), #f7f9fd; color: #071126; font-family: Inter, Arial, sans-serif; }
  .navbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 24px; }
  .logo { color: #0048ff; font-size: 38px; font-weight: 950; letter-spacing: -2px; text-decoration: none; }
  nav { display: flex; gap: 18px; font-weight: 900; }
  nav a { color: #071126; text-decoration: none; }
  .hero, .stateCard, .emptyBox { border: 1px solid #dfe8f7; border-radius: 32px; background: linear-gradient(135deg, #fff, #eef5ff); padding: clamp(26px, 4vw, 42px); box-shadow: 0 22px 56px rgba(14,30,70,.08); }
  .hero span { display: inline-flex; background: #eaf1ff; color: #0048ff; border-radius: 999px; padding: 10px 16px; font-weight: 950; margin-bottom: 18px; }
  h1 { margin: 0 0 12px; font-size: clamp(44px, 7vw, 78px); line-height: .92; letter-spacing: -3px; }
  .hero p, .stateCard p, .emptyBox p, .card p { color: #53617a; font-weight: 750; line-height: 1.65; }
  .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 22px; }
  .primaryBtn, .secondaryBtn { display: inline-flex; align-items: center; justify-content: center; border-radius: 16px; min-height: 50px; padding: 0 20px; font-weight: 950; text-decoration: none; }
  .primaryBtn { background: #0048ff; color: white; box-shadow: 0 14px 30px rgba(0,72,255,.2); }
  .secondaryBtn { background: white; color: #0048ff; border: 1px solid #d8e4ff; }
  .grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 18px; margin-top: 24px; }
  .card { overflow: hidden; border: 1px solid #dfe8f7; border-radius: 26px; background: white; color: inherit; text-decoration: none; box-shadow: 0 16px 42px rgba(14,30,70,.07); }
  .card img { width: 100%; height: 220px; object-fit: cover; display: block; background: #eaf1ff; }
  .card div { padding: 20px; }
  .card span { display: inline-flex; color: #0048ff; background: #eef4ff; border-radius: 999px; padding: 7px 10px; font-size: 12px; font-weight: 950; margin-bottom: 12px; }
  .card h2 { margin: 0 0 8px; font-size: 22px; }
  .meta { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
  .meta em { color: #0048ff; background: #eef4ff; border-radius: 999px; padding: 7px 10px; font-size: 12px; font-style: normal; font-weight: 900; }
  .card strong { font-size: 24px; }
  .emptyBox { margin-top: 24px; background: white; }
  .stateCard { width: min(620px, 100%); margin: 15vh auto 0; background: white; }
  @media (max-width: 860px) { .page { padding: 16px; } nav { display: none; } .grid { grid-template-columns: 1fr; } h1 { letter-spacing: -2px; } }
`;

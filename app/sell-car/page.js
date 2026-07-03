"use client";

import Link from "next/link";
import SiteMenu from "../components/SiteMenu";

function startListing() {
  try {
    const token = localStorage.getItem("kerbSessionToken");

    window.location.href = token ? "/post-car" : "/login?next=/post-car";
  } catch {
    window.location.href = "/login?next=/post-car";
  }
}

export default function SellCarPage() {
  return (
    <main className="page">
      <header className="navbar">
        <Link href="/" className="logo">Kerb</Link>

        <nav className="navLinks">
          <Link href="/browse">Browse cars</Link>
          <Link href="/new-cars">New cars</Link>
          <Link href="/electric-cars">Electric</Link>
          <Link href="/car-finance">Cars with finance available</Link>
          <Link href="/guides">Guides</Link>
        </nav>

        <SiteMenu currentUser={null} />
      </header>

      <section className="hero">
        <div>
          <span className="pill">Free seller listings</span>
          <h1>Sell your car for free on Kerb</h1>
          <p>
            Create a clear car advert with real photos, buyer enquiries and a simple seller dashboard.
            Kerb connects buyers and sellers directly — Kerb is not a direct car seller.
          </p>

          <div className="heroActions">
            <button type="button" className="primaryBtn" onClick={startListing}>
              Start your free listing
            </button>
            <Link href="/guides/how-to-sell-your-car" className="secondaryBtn">
              Read the selling guide
            </Link>
          </div>
        </div>

        <div className="heroCard">
          <h2>What sellers get</h2>
          <ul>
            <li>Free car listing while Kerb is in early access</li>
            <li>Upload real photos and key vehicle details</li>
            <li>Receive buyer enquiries through Kerb</li>
            <li>Manage views, saves, enquiries and listing status</li>
          </ul>
        </div>
      </section>

      <section className="steps">
        <div>
          <strong>1</strong>
          <h3>Add your car details</h3>
          <p>Choose the make, model, type, spec, mileage, year, condition and asking price.</p>
        </div>
        <div>
          <strong>2</strong>
          <h3>Upload clear photos</h3>
          <p>Add front, rear, interior and wheel photos so buyers know what they are viewing.</p>
        </div>
        <div>
          <strong>3</strong>
          <h3>Receive enquiries</h3>
          <p>Buyers can message you from the listing page. You stay in control of the sale.</p>
        </div>
      </section>

      <section className="infoGrid">
        <div>
          <h2>How much does it cost?</h2>
          <p>
            Standard listings are free during Kerb early access. Optional paid boosts may be offered
            for extra visibility, but boosting does not guarantee enquiries or a sale.
          </p>
        </div>
        <div>
          <h2>What happens after posting?</h2>
          <p>
            Your listing goes live with your chosen public contact settings. You can edit it, mark it
            as sold, delete it, or boost it from your account.
          </p>
        </div>
        <div>
          <h2>Who handles the sale?</h2>
          <p>
            Buyers and sellers agree viewings, payment, collection and ownership transfer directly.
            Kerb does not inspect, sell, finance, warrant or deliver vehicles.
          </p>
        </div>
      </section>

      <section className="finalCta">
        <h2>Ready to list your car?</h2>
        <p>It only takes a few minutes to create your advert.</p>
        <button type="button" className="primaryBtn" onClick={startListing}>
          Start your free listing
        </button>
      </section>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }
  .page {
    min-height: 100vh;
    padding: 22px 40px 44px;
    background:
      radial-gradient(circle at top left, rgba(0, 72, 255, 0.08), transparent 32%),
      #f7f9fd;
    color: #071126;
    font-family: Inter, Arial, sans-serif;
  }
  .navbar {
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 22px;
    margin-bottom: 26px;
  }
  .logo {
    font-size: 38px;
    font-weight: 950;
    color: #0048ff;
    letter-spacing: -2px;
    text-decoration: none;
  }
  .navLinks {
    display: flex;
    align-items: center;
    gap: 18px;
    font-weight: 900;
    flex-wrap: wrap;
  }
  .navLinks a {
    color: #101832;
    text-decoration: none;
  }
  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
    gap: 28px;
    align-items: stretch;
    border: 1px solid #dfe8f7;
    border-radius: 34px;
    padding: 46px;
    background: linear-gradient(135deg, #ffffff, #eef5ff);
    box-shadow: 0 24px 60px rgba(14, 30, 70, 0.08);
  }
  .pill {
    display: inline-flex;
    border-radius: 999px;
    background: #eaf1ff;
    color: #0048ff;
    font-weight: 950;
    padding: 10px 16px;
    margin-bottom: 20px;
  }
  h1 {
    margin: 0;
    max-width: 760px;
    font-size: clamp(44px, 7vw, 84px);
    line-height: 0.92;
    letter-spacing: -4px;
  }
  .hero p,
  .infoGrid p,
  .steps p,
  .finalCta p {
    color: #53617a;
    line-height: 1.65;
    font-weight: 750;
  }
  .heroActions {
    display: flex;
    gap: 12px;
    margin-top: 26px;
    flex-wrap: wrap;
  }
  .primaryBtn,
  .secondaryBtn {
    border: none;
    border-radius: 18px;
    padding: 15px 20px;
    font-weight: 950;
    text-decoration: none;
    cursor: pointer;
  }
  .primaryBtn {
    background: #0048ff;
    color: white;
    box-shadow: 0 16px 32px rgba(0, 72, 255, 0.22);
  }
  .secondaryBtn {
    background: white;
    color: #0048ff;
    border: 1px solid #d8e4ff;
  }
  .heroCard,
  .steps > div,
  .infoGrid > div,
  .finalCta {
    border: 1px solid #dfe8f7;
    border-radius: 26px;
    background: rgba(255,255,255,0.92);
    padding: 26px;
    box-shadow: 0 18px 46px rgba(14, 30, 70, 0.06);
  }
  .heroCard h2,
  .infoGrid h2,
  .steps h3,
  .finalCta h2 {
    margin: 0 0 10px;
  }
  .heroCard ul {
    margin: 0;
    padding-left: 20px;
    color: #43506a;
    line-height: 1.85;
    font-weight: 850;
  }
  .steps,
  .infoGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin-top: 22px;
  }
  .steps strong {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: #0048ff;
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }
  .finalCta {
    margin-top: 22px;
    text-align: center;
  }
  @media (max-width: 920px) {
    .page { padding: 16px; }
    .navLinks { display: none; }
    .hero,
    .steps,
    .infoGrid {
      grid-template-columns: 1fr;
    }
    .hero { padding: 26px; }
    h1 { letter-spacing: -2px; }
  }
`;

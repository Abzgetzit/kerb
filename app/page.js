import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function Icon({ name }) {
  const icons = {
    car: (
      <>
        <path d="M5 13l1.5-4.5A3 3 0 0 1 9.35 6h5.3a3 3 0 0 1 2.85 2.5L19 13" />
        <path d="M4 13h16v4H4z" />
        <path d="M6.5 17.5v1" />
        <path d="M17.5 17.5v1" />
        <circle cx="7.5" cy="15" r="1" />
        <circle cx="16.5" cy="15" r="1" />
      </>
    ),
    new: (
      <>
        <path d="M12 3l1.6 5.1L19 10l-5.4 1.9L12 17l-1.6-5.1L5 10l5.4-1.9L12 3z" />
        <path d="M20 4v4" />
        <path d="M22 6h-4" />
      </>
    ),
    sell: (
      <>
        <path d="M7 11l3-3 4 4 3-3" />
        <path d="M5 19h14" />
        <path d="M6 15l4 4 8-8" />
      </>
    ),
    electric: (
      <>
        <path d="M13 2L5 14h6l-1 8 8-12h-6l1-8z" />
      </>
    ),
    finance: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="3" />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
      </>
    ),
    guide: (
      <>
        <path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4z" />
        <path d="M5 4v12" />
        <path d="M9 8h6" />
        <path d="M9 12h5" />
      </>
    ),
    heart: (
      <>
        <path d="M20.8 8.6c0 5.2-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.6A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.8 1.9z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
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
        <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    price: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M14.5 8.5h-3a2 2 0 0 0 0 4h1a2 2 0 0 1 0 4h-3" />
        <path d="M12 6.5v11" />
      </>
    ),
    mileage: (
      <>
        <path d="M5 16a7 7 0 1 1 14 0" />
        <path d="M12 16l4-5" />
        <path d="M4 20h16" />
      </>
    ),
    body: (
      <>
        <path d="M4 14h16l-2-5H6l-2 5z" />
        <path d="M6 14v4" />
        <path d="M18 14v4" />
        <circle cx="8" cy="18" r="1.5" />
        <circle cx="16" cy="18" r="1.5" />
      </>
    ),
    fuel: (
      <>
        <path d="M7 3h7v18H7z" />
        <path d="M9 7h3" />
        <path d="M14 8h2l2 2v8a2 2 0 0 0 4 0v-6l-3-3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6l8-3z" />
        <path d="M9 12l2 2 4-5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M4 7l8 6 8-6" />
      </>
    ),
  };

  return (
    <svg
      className="icon"
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

function getListingImage(car) {
  const directImage =
    car.main_photo ||
    car.photo_url ||
    car.image_url ||
    car.cover_image ||
    car.main_image;

  if (directImage) return directImage;

  const possibleArrays = [
    car.photos,
    car.photo_urls,
    car.image_urls,
    car.images,
  ];

  for (const item of possibleArrays) {
    if (Array.isArray(item) && item.length > 0) {
      return item[0];
    }

    if (typeof item === "string") {
      try {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch {
        if (item.startsWith("http")) return item;
      }
    }
  }

  return "/cars/hero-car.png";
}

function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "POA";
  return `£${number.toLocaleString("en-GB")}`;
}

function formatMileage(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Mileage TBC";
  return `${number.toLocaleString("en-GB")} miles`;
}

function carTitle(car) {
  return [car.year, car.make, car.model].filter(Boolean).join(" ") || "Car listing";
}

export default async function HomePage() {
  const { data } = await supabase
    .from("kerb_listings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  const approvedListings = data || [];

  const categories = [
    ["car", "Used cars", "Browse trusted second-hand cars"],
    ["new", "New cars", "Explore new models and deals"],
    ["electric", "Electric cars", "Find electric and hybrid cars"],
    ["body", "Family SUVs", "Practical cars for everyday life"],
    ["mileage", "Performance", "Powerful cars built for driving"],
  ];

  return (
    <main className="page">
      <header className="navbar">
        <a href="/" className="logo">Kerb</a>

        <nav className="navLinks">
          <a href="/browse"><Icon name="car" /> Browse cars</a>
          <a href="#coming-soon"><Icon name="new" /> New cars</a>
          <a href="/post-car"><Icon name="sell" /> Sell your car</a>
          <a href="#coming-soon"><Icon name="electric" /> Electric</a>
          <a href="#coming-soon"><Icon name="finance" /> Finance</a>
          <a href="#coming-soon"><Icon name="guide" /> Guides</a>
        </nav>

        <div className="navActions">
          <button className="ghostBtn" type="button">
            <Icon name="heart" /> Saved
          </button>

          <a href="/login" className="ghostBtn">
            <Icon name="user" /> Sign in
          </a>

          <a href="/post-car" className="primaryBtn">
            <Icon name="plus" /> Post your car
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="heroText">
          <div className="pill">New car marketplace launching soon</div>

          <h1>Find your next car with confidence</h1>

          <p>
            Kerb helps buyers discover trusted cars from private sellers and
            dealers, with simple filters, clear pricing and a smooth buying
            experience.
          </p>

          <div className="heroStats">
            <span><Icon name="car" /> Private sellers</span>
            <span><Icon name="shield" /> Approved dealers</span>
            <span><Icon name="new" /> Simple car search</span>
          </div>
        </div>

        <div className="heroCar">
          <div className="heroCarGlow" />
          <img src="/cars/hero-car.png" alt="White BMW on Kerb" />
        </div>

        <div className="searchBox">
          <div className="filterItem">
            <Icon name="location" />
            <div>
              <small>Location</small>
              <strong>Leicester</strong>
            </div>
          </div>

          <div className="filterItem">
            <Icon name="car" />
            <div>
              <small>Make & model</small>
              <strong>Any make</strong>
            </div>
          </div>

          <div className="filterItem">
            <Icon name="price" />
            <div>
              <small>Price</small>
              <strong>Any price</strong>
            </div>
          </div>

          <div className="filterItem">
            <Icon name="mileage" />
            <div>
              <small>Mileage</small>
              <strong>Any miles</strong>
            </div>
          </div>

          <div className="filterItem">
            <Icon name="body" />
            <div>
              <small>Body type</small>
              <strong>Any</strong>
            </div>
          </div>

          <a className="searchBtn" href="/browse">
            Search cars
          </a>
        </div>
      </section>

      <section className="categories">
        {categories.map((item, index) => (
          <div className="categoryCard" key={index}>
            <div className="categoryIcon">
              <Icon name={item[0]} />
            </div>

            <div>
              <h3>{item[1]}</h3>
              <p>{item[2]}</p>
            </div>

            <span className="arrow">›</span>
          </div>
        ))}
      </section>

      <section className="launchGrid" id="coming-soon">
        <div className="listingsPanel">
          <div className="sectionTitleRow">
            <div>
              <span className="sectionKicker">Approved listings</span>
              <h2>Latest cars on Kerb</h2>
            </div>

            <a href="/browse" className="browseAllLink">
              Browse all cars →
            </a>
          </div>

          {approvedListings.length > 0 ? (
            <div className="homeListingsGrid">
              {approvedListings.map((car) => (
                <article className="listingCard" key={car.id}>
                  <div className="listingImageWrap">
                    <img
                      src={getListingImage(car)}
                      alt={carTitle(car)}
                      className="listingImage"
                    />
                  </div>

                  <div className="listingContent">
                    <div>
                      <h3>{carTitle(car)}</h3>
                      <p className="listingLocation">
                        <Icon name="location" /> {car.location || "Location TBC"}
                      </p>
                    </div>

                    <div className="listingMeta">
                      <span>{formatMileage(car.mileage)}</span>
                      <span>{car.fuel_type || car.gearbox || "Approved"}</span>
                    </div>

                    <div className="listingFooter">
                      <strong>{formatPrice(car.price)}</strong>

                      <a href={`/listing/${car.id}`} className="viewCarBtn">
                        View car
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="emptyListings">
              <div className="emptyIcon">
                <Icon name="car" />
              </div>

              <h2>No approved cars yet</h2>

              <p>
                Once sellers submit cars and you approve them in the admin
                dashboard, they will appear here automatically.
              </p>

              <div className="emptyActions">
                <a href="/post-car" className="primaryBtn">
                  <Icon name="plus" /> Post your car
                </a>

                <a href="#early-access" className="secondaryBtn">
                  Join launch list
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="sellerBox">
          <h2>Sell your car the smart way</h2>

          <p>
            Create a clean listing, reach serious buyers and manage enquiries
            from one simple dashboard.
          </p>

          <div className="sellerSteps">
            <div>
              <strong>1</strong>
              <span>Add your car details</span>
            </div>

            <div>
              <strong>2</strong>
              <span>Upload photos</span>
            </div>

            <div>
              <strong>3</strong>
              <span>Wait for approval</span>
            </div>
          </div>

          <a href="/post-car" className="primaryBtn fullBtn">
            Start selling
          </a>
        </div>
      </section>

      <section className="trustGrid">
        <div className="trustCard">
          <span><Icon name="shield" /></span>
          <div>
            <h3>Trusted sellers</h3>
            <p>Built for verified private sellers and approved dealers.</p>
          </div>
        </div>

        <div className="trustCard">
          <span><Icon name="price" /></span>
          <div>
            <h3>Clear pricing</h3>
            <p>Simple prices with clean vehicle information.</p>
          </div>
        </div>

        <div className="trustCard">
          <span><Icon name="heart" /></span>
          <div>
            <h3>Save favourites</h3>
            <p>Buyers can save cars and compare their options.</p>
          </div>
        </div>

        <div className="trustCard">
          <span><Icon name="mail" /></span>
          <div>
            <h3>Easy enquiries</h3>
            <p>Simple contact flow between buyers and sellers.</p>
          </div>
        </div>
      </section>

      <section className="newsletter" id="early-access">
        <div>
          <h3>Get early access to Kerb</h3>
          <p>Be notified when the first cars go live.</p>
        </div>

        <div className="emailBox">
          <input placeholder="Enter your email address" />
          <button type="button">Notify me</button>
        </div>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f7f9fd;
          color: #071126;
          font-family: Inter, Arial, sans-serif;
        }

        .page {
          min-height: 100vh;
          padding: 22px 40px 40px;
        }

        .icon {
          width: 19px;
          height: 19px;
          flex-shrink: 0;
        }

        .navbar {
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 18px;
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
          gap: 30px;
          font-size: 14px;
          font-weight: 800;
          color: #12172c;
        }

        .navLinks a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          cursor: pointer;
          color: inherit;
          white-space: nowrap;
        }

        .navLinks .icon {
          width: 17px;
          height: 17px;
          color: #172033;
        }

        .navActions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        button {
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .ghostBtn {
          background: transparent;
          color: #11182e;
          font-size: 14px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          text-decoration: none;
          white-space: nowrap;
        }

        .primaryBtn {
          background: #0048ff;
          color: white;
          border-radius: 14px;
          padding: 14px 24px;
          font-weight: 900;
          box-shadow: 0 10px 25px rgba(0, 72, 255, 0.22);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .secondaryBtn {
          background: #eef3ff;
          color: #0048ff;
          border-radius: 14px;
          padding: 14px 24px;
          font-weight: 900;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .hero {
          position: relative;
          min-height: 395px;
          border-radius: 30px;
          overflow: hidden;
          background:
            radial-gradient(circle at 76% 42%, rgba(0,72,255,0.14), transparent 34%),
            radial-gradient(circle at 72% 72%, rgba(255,255,255,0.92), transparent 42%),
            linear-gradient(105deg, #f9fbff 0%, #f5f8ff 42%, #eaf2ff 100%);
          border: 1px solid #e5eaf5;
          padding: 46px 56px 104px;
          box-shadow: 0 16px 50px rgba(20, 35, 70, 0.08);
        }

        .pill {
          display: inline-flex;
          background: #eaf1ff;
          color: #0048ff;
          border: 1px solid #d7e4ff;
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 13px;
          font-weight: 950;
          margin-bottom: 18px;
        }

        .heroText {
          max-width: 540px;
          position: relative;
          z-index: 3;
        }

        .heroText h1 {
          font-size: 56px;
          line-height: 0.98;
          margin: 0 0 18px;
          letter-spacing: -2.8px;
        }

        .heroText p {
          color: #465269;
          font-size: 17px;
          line-height: 1.5;
          margin: 0 0 22px;
        }

        .heroStats {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          color: #203050;
          font-size: 14px;
          font-weight: 850;
        }

        .heroStats span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .heroStats .icon {
          color: #0048ff;
          width: 17px;
          height: 17px;
        }

        .heroCar {
          position: absolute;
          right: 46px;
          bottom: 92px;
          width: 640px;
          z-index: 1;
          pointer-events: none;
        }

        .heroCar::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 10px;
          width: 72%;
          height: 24px;
          transform: translateX(-50%);
          background: rgba(8, 18, 38, 0.14);
          filter: blur(18px);
          border-radius: 999px;
          z-index: 0;
        }

        .heroCarGlow {
          position: absolute;
          inset: -44px -58px -34px -58px;
          background:
            radial-gradient(circle at 58% 46%, rgba(255, 255, 255, 0.92), transparent 43%),
            radial-gradient(circle at 55% 58%, rgba(0, 72, 255, 0.12), transparent 52%);
          filter: blur(16px);
          z-index: 0;
        }

        .heroCar img {
          position: relative;
          z-index: 1;
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
          filter: drop-shadow(0 22px 26px rgba(8, 18, 38, 0.13));
        }

        .searchBox {
          position: absolute;
          left: 56px;
          right: 56px;
          bottom: 26px;
          z-index: 4;
          display: grid;
          grid-template-columns: repeat(5, 1fr) 170px;
          gap: 16px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          border: 1px solid #e4e9f3;
          border-radius: 22px;
          padding: 16px;
          box-shadow: 0 16px 40px rgba(12, 28, 58, 0.12);
        }

        .filterItem {
          background: white;
          border: 1px solid #e8edf5;
          border-radius: 16px;
          padding: 13px 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .filterItem .icon {
          color: #172033;
        }

        .filterItem small {
          display: block;
          color: #7a8398;
          font-size: 11px;
          margin-bottom: 2px;
          font-weight: 800;
        }

        .filterItem strong {
          font-size: 13px;
        }

        .searchBtn {
          border-radius: 16px;
          background: #0048ff;
          color: white;
          font-weight: 950;
          font-size: 14px;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .categories {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin: 20px 0;
        }

        .categoryCard {
          display: flex;
          align-items: center;
          gap: 14px;
          background: white;
          border: 1px solid #e6ebf4;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 8px 25px rgba(10, 20, 40, 0.04);
        }

        .categoryIcon {
          width: 52px;
          height: 46px;
          border-radius: 14px;
          background: #edf3ff;
          color: #0048ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .categoryCard h3 {
          margin: 0 0 4px;
          font-size: 15px;
        }

        .categoryCard p {
          margin: 0;
          font-size: 12px;
          color: #657189;
          line-height: 1.35;
        }

        .arrow {
          margin-left: auto;
          font-size: 26px;
          color: #172033;
        }

        .launchGrid {
          display: grid;
          grid-template-columns: 1.4fr 0.9fr;
          gap: 20px;
          margin-top: 20px;
        }

        .listingsPanel,
        .sellerBox {
          background: white;
          border: 1px solid #e6ebf4;
          border-radius: 24px;
          padding: 34px;
          box-shadow: 0 12px 30px rgba(10, 20, 40, 0.05);
        }

        .sectionTitleRow {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 18px;
          margin-bottom: 22px;
        }

        .sectionKicker {
          color: #0048ff;
          font-size: 13px;
          font-weight: 950;
          display: block;
          margin-bottom: 7px;
        }

        .sectionTitleRow h2 {
          margin: 0;
          font-size: 31px;
          letter-spacing: -1.1px;
        }

        .browseAllLink {
          color: #0048ff;
          text-decoration: none;
          font-weight: 950;
          white-space: nowrap;
          font-size: 14px;
        }

        .homeListingsGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .listingCard {
          border: 1px solid #e7edf6;
          border-radius: 20px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 8px 24px rgba(10, 20, 40, 0.04);
          transition: 0.2s ease;
        }

        .listingCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 44px rgba(10, 20, 40, 0.09);
        }

        .listingImageWrap {
          height: 170px;
          background: #edf3ff;
          overflow: hidden;
        }

        .listingImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .listingContent {
          padding: 16px;
        }

        .listingContent h3 {
          margin: 0;
          font-size: 17px;
          letter-spacing: -0.4px;
          color: #071126;
        }

        .listingLocation {
          margin: 7px 0 0;
          color: #657189;
          font-size: 13px;
          font-weight: 750;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .listingLocation .icon {
          width: 15px;
          height: 15px;
          color: #0048ff;
        }

        .listingMeta {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin: 16px 0;
          color: #657189;
          font-size: 12px;
          font-weight: 850;
        }

        .listingFooter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .listingFooter strong {
          font-size: 20px;
          color: #071126;
        }

        .viewCarBtn {
          background: #0048ff;
          color: white;
          border-radius: 13px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 950;
          text-decoration: none;
          white-space: nowrap;
        }

        .emptyListings {
          text-align: center;
          border: 1px dashed #c8d7f2;
          border-radius: 22px;
          background: #f8fbff;
          padding: 34px;
        }

        .emptyIcon {
          width: 76px;
          height: 76px;
          border-radius: 24px;
          background: #edf3ff;
          color: #0048ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
        }

        .emptyIcon .icon {
          width: 34px;
          height: 34px;
        }

        .emptyListings h2,
        .sellerBox h2 {
          margin: 0 0 10px;
          font-size: 31px;
          letter-spacing: -1.1px;
        }

        .emptyListings p,
        .sellerBox p {
          color: #657189;
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }

        .emptyActions {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
        }

        .sellerSteps {
          display: grid;
          gap: 12px;
          margin: 24px 0;
        }

        .sellerSteps div {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: #f7f9fd;
          border-radius: 14px;
          border: 1px solid #e8edf5;
        }

        .sellerSteps strong {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: #0048ff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        .sellerSteps span {
          font-weight: 850;
          color: #182238;
          font-size: 14px;
        }

        .fullBtn {
          width: 100%;
        }

        .trustGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin: 22px 0 14px;
        }

        .trustCard {
          display: flex;
          gap: 16px;
          align-items: center;
          background: white;
          border: 1px solid #e6ebf4;
          border-radius: 18px;
          padding: 18px;
        }

        .trustCard span {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: #edf3ff;
          color: #0048ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .trustCard h3 {
          margin: 0 0 4px;
          font-size: 15px;
        }

        .trustCard p {
          margin: 0;
          color: #657189;
          font-size: 12px;
          line-height: 1.45;
        }

        .newsletter {
          margin-top: 14px;
          background: white;
          border: 1px solid #e6ebf4;
          border-radius: 18px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .newsletter h3 {
          margin: 0 0 4px;
        }

        .newsletter p {
          margin: 0;
          color: #657189;
          font-size: 13px;
        }

        .emailBox {
          display: flex;
          gap: 10px;
          min-width: 440px;
        }

        .emailBox input {
          flex: 1;
          border: 1px solid #e0e6f0;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 14px;
          outline: none;
        }

        .emailBox button {
          border-radius: 12px;
          background: #0048ff;
          color: white;
          padding: 0 20px;
          font-weight: 850;
        }

        @media (max-width: 1250px) {
          .navLinks {
            display: none;
          }

          .heroCar {
            right: 20px;
            width: 560px;
            opacity: 0.42;
          }

          .searchBox {
            grid-template-columns: repeat(2, 1fr);
          }

          .searchBtn {
            min-height: 56px;
          }

          .categories {
            grid-template-columns: repeat(2, 1fr);
          }

          .launchGrid {
            grid-template-columns: 1fr;
          }

          .homeListingsGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .trustGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .page {
            padding: 16px;
          }

          .navbar {
            height: auto;
            align-items: flex-start;
          }

          .navActions {
            display: none;
          }

          .logo {
            font-size: 34px;
          }

          .hero {
            min-height: auto;
            padding: 32px 20px 20px;
          }

          .heroText h1 {
            font-size: 42px;
          }

          .heroText p {
            font-size: 15px;
          }

          .heroCar {
            position: relative;
            right: auto;
            bottom: auto;
            width: 100%;
            opacity: 1;
            margin: 18px 0 0;
          }

          .heroCar::after {
            bottom: 5px;
            width: 68%;
            height: 20px;
            filter: blur(16px);
          }

          .heroCarGlow {
            inset: -25px -20px -18px;
          }

          .searchBox {
            position: relative;
            left: auto;
            right: auto;
            bottom: auto;
            margin-top: 18px;
            grid-template-columns: 1fr;
          }

          .searchBtn {
            padding: 16px;
          }

          .categories,
          .trustGrid,
          .homeListingsGrid {
            grid-template-columns: 1fr;
          }

          .listingsPanel,
          .sellerBox {
            padding: 24px;
          }

          .sectionTitleRow {
            align-items: flex-start;
            flex-direction: column;
          }

          .emptyListings {
            padding: 24px;
          }

          .emptyActions {
            flex-direction: column;
          }

          .newsletter {
            flex-direction: column;
            align-items: stretch;
          }

          .emailBox {
            min-width: 0;
            width: 100%;
            flex-direction: column;
          }

          .emailBox button {
            padding: 14px;
          }
        }
      `}</style>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteMenu from "../components/SiteMenu";

function formatDate(value) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) return "POA";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(number);
}

function normaliseStatus(status) {
  return String(status || "new").trim().toLowerCase();
}

function getTitle(car) {
  if (car.title) return car.title;

  return (
    [car.year, car.make, car.model].filter(Boolean).join(" ") || "Car listing"
  );
}

function normaliseImageUrl(value) {
  if (!value) return "";

  const image = String(value).trim();

  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
    return image;
  }

  return image;
}

function parseImageField(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(normaliseImageUrl).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed.map(normaliseImageUrl).filter(Boolean);
      }

      if (typeof parsed === "string") {
        return [normaliseImageUrl(parsed)].filter(Boolean);
      }
    } catch {
      return [normaliseImageUrl(trimmed)].filter(Boolean);
    }
  }

  return [];
}

function getListingImages(car) {
  const images = [
    ...parseImageField(car.image_url),
    ...parseImageField(car.photo_url),
    ...parseImageField(car.main_photo_url),
    ...parseImageField(car.cover_image_url),
    ...parseImageField(car.photos),
    ...parseImageField(car.photo_urls),
    ...parseImageField(car.images),
    ...parseImageField(car.image_urls),
  ];

  return [...new Set(images)].filter(Boolean);
}

function getImage(car) {
  return getListingImages(car)[0] || "/cars/hero-car.png";
}

function createKerbUserFromAccount(result) {
  const account = result?.account || {};

  return {
    id: account.id || account.user_id || result?.id || result?.user_id || "",
    email: result?.email || account.email || "",
    name:
      account.name ||
      account.full_name ||
      account.fullName ||
      result?.name ||
      result?.full_name ||
      "",
    created_at: account.created_at || result?.created_at || "",
  };
}

export default function AccountPage() {
  const [accountData, setAccountData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  function syncKerbUser(result) {
    const kerbUser = createKerbUserFromAccount(result);

    if (kerbUser.email) {
      localStorage.setItem("kerbUser", JSON.stringify(kerbUser));
      localStorage.setItem("kerbAccountEmail", kerbUser.email);
      window.dispatchEvent(new Event("kerb-auth-change"));
    }
  }

  async function loadAccount() {
    setIsLoading(true);
    setErrorMessage("");

    const token = localStorage.getItem("kerbSessionToken");

    if (!token) {
      localStorage.removeItem("kerbUser");
      localStorage.removeItem("kerbAccountEmail");
      window.location.href = "/login";
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
        throw new Error(result.error || "Could not load account.");
      }

      syncKerbUser(result);
      setAccountData(result);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");

    if (["overview", "listings", "saved", "sent", "received"].includes(tab)) {
      setActiveTab(tab);
    }

    loadAccount();
  }, []);

  function logout() {
    localStorage.removeItem("kerbSessionToken");
    localStorage.removeItem("kerbAccountEmail");
    localStorage.removeItem("kerbUser");
    window.dispatchEvent(new Event("kerb-auth-change"));
    window.location.href = "/";
  }

  function goToPostCar() {
    if (accountData) {
      syncKerbUser(accountData);
    }

    window.location.href = "/post-car";
  }

  const stats = useMemo(() => {
    return {
      listings: accountData?.my_listings?.length || 0,
      sent: accountData?.sent_enquiries?.length || 0,
      received: accountData?.received_enquiries?.length || 0,
      saved: accountData?.saved_listings?.length || 0,
    };
  }, [accountData]);

  const latestListings = useMemo(
    () => (accountData?.my_listings || []).slice(0, 3),
    [accountData]
  );

  const savedPreview = useMemo(
    () => (accountData?.saved_listings || []).slice(0, 3),
    [accountData]
  );

  const recentActivity = useMemo(() => {
    const sent = (accountData?.sent_enquiries || []).map((enquiry) => ({
      ...enquiry,
      activity_type: "sent",
    }));
    const received = (accountData?.received_enquiries || []).map((enquiry) => ({
      ...enquiry,
      activity_type: "received",
    }));

    return [...sent, ...received]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);
  }, [accountData]);

  if (isLoading) {
    return (
      <main className="page">
        <section className="emptyCard">
          <Link href="/" className="logo">
            Kerb
          </Link>
          <p>Loading your account...</p>
        </section>

        <style jsx global>{styles}</style>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="page">
        <section className="emptyCard">
          <Link href="/" className="logo">
            Kerb
          </Link>

          <h1>Account error</h1>
          <p>{errorMessage}</p>

          <Link href="/login" className="primaryLink">
            Sign in again
          </Link>
        </section>

        <style jsx global>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="navbar">
        <Link href="/" className="logo">
          Kerb
        </Link>

        <div className="navActions">
          <Link href="/browse">Browse cars</Link>

          <button type="button" onClick={goToPostCar}>
            Post your car
          </button>

          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>

        <SiteMenu currentUser={accountData?.account || accountData} onLogout={logout} />
      </header>

      <section className="hero">
        <div>
          <div className="pill">Kerb account</div>
          <h1>My account</h1>
          <p>
            Signed in as <strong>{accountData?.email}</strong>. Manage your
            listings, saved cars and enquiries from one place.
          </p>
        </div>

        <div className="statsGrid">
          <div>
            <span>My listings</span>
            <strong>{stats.listings}</strong>
          </div>
          <div>
            <span>Saved cars</span>
            <strong>{stats.saved}</strong>
          </div>
          <div>
            <span>Enquiries sent</span>
            <strong>{stats.sent}</strong>
          </div>
          <div>
            <span>Enquiries received</span>
            <strong>{stats.received}</strong>
          </div>
        </div>
      </section>

      <section className="tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
          type="button"
        >
          Overview
        </button>

        <button
          className={activeTab === "listings" ? "active" : ""}
          onClick={() => setActiveTab("listings")}
          type="button"
        >
          My listings
        </button>

        <button
          className={activeTab === "saved" ? "active" : ""}
          onClick={() => setActiveTab("saved")}
          type="button"
        >
          Saved cars
        </button>

        <button
          className={activeTab === "sent" ? "active" : ""}
          onClick={() => setActiveTab("sent")}
          type="button"
        >
          Enquiries sent
        </button>

        <button
          className={activeTab === "received" ? "active" : ""}
          onClick={() => setActiveTab("received")}
          type="button"
        >
          Enquiries received
        </button>
      </section>

      {activeTab === "overview" && (
        <section className="overviewGrid">
          <div className="panel">
            <h2>Quick actions</h2>
            <p>Use these to manage your Kerb activity.</p>

            <div className="quickActions">
              <button
                type="button"
                className="primaryQuickAction"
                onClick={goToPostCar}
              >
                Post a car
              </button>

              <Link href="/browse" className="primaryQuickAction">
                Browse cars
              </Link>

              <button type="button" onClick={() => setActiveTab("listings")}>
                View my listings
              </button>

              <button type="button" onClick={() => setActiveTab("received")}>
                View received enquiries
              </button>
            </div>
          </div>

          <div className="panel">
            <h2>Account details</h2>

            <div className="detailsGrid one">
              <div>
                <span>Email</span>
                <strong>{accountData?.email}</strong>
              </div>

              <div>
                <span>Account created</span>
                <strong>{formatDate(accountData?.account?.created_at)}</strong>
              </div>
            </div>
          </div>

          <div className="panel widePanel">
            <div className="panelHeader">
              <div>
                <h2>Latest listings</h2>
                <p>Your newest cars and their current status.</p>
              </div>

              <button type="button" onClick={() => setActiveTab("listings")}>
                View all
              </button>
            </div>

            {latestListings.length === 0 ? (
              <div className="softEmpty">
                <p>Post a car and it will appear here for review and editing.</p>
                <button type="button" onClick={goToPostCar}>
                  Post your car
                </button>
              </div>
            ) : (
              <div className="miniList">
                {latestListings.map((car) => (
                  <ListingMiniCard
                    key={car.id}
                    car={car}
                    mode="listing"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panelHeader">
              <div>
                <h2>Saved cars</h2>
                <p>Cars you have kept for later.</p>
              </div>

              <button type="button" onClick={() => setActiveTab("saved")}>
                View
              </button>
            </div>

            {savedPreview.length === 0 ? (
              <div className="softEmpty">
                <p>No saved cars yet.</p>
                <Link href="/browse">Browse cars</Link>
              </div>
            ) : (
              <div className="miniList compact">
                {savedPreview.map((car) => (
                  <ListingMiniCard key={car.id} car={car} mode="saved" />
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panelHeader">
              <div>
                <h2>Recent activity</h2>
                <p>Latest buyer and seller messages.</p>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <div className="softEmpty">
                <p>No enquiry activity yet.</p>
                <Link href="/browse">Find cars</Link>
              </div>
            ) : (
              <div className="activityList">
                {recentActivity.map((activity) => (
                  <div
                    className="activityItem"
                    key={`${activity.activity_type}-${activity.id}`}
                  >
                    <span>
                      {activity.activity_type === "sent"
                        ? "Enquiry sent"
                        : "Enquiry received"}
                    </span>
                    <strong>{activity.listing_title || "Kerb listing"}</strong>
                    <small>{formatDate(activity.created_at)}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "listings" && (
        <section className="contentSection">
          <div className="sectionHeader">
            <h2>My listings</h2>

            <button
              type="button"
              className="sectionButton"
              onClick={goToPostCar}
            >
              Post another car
            </button>
          </div>

          {accountData.my_listings.length === 0 ? (
            <EmptyBox
              title="No listings yet"
              text="When you post a car using this account, it will appear here."
              buttonText="Post your car"
              onButtonClick={goToPostCar}
            />
          ) : (
            <div className="cardsGrid">
              {accountData.my_listings.map((car) => (
                <article className="card mediaCard" key={car.id}>
                  <ListingCardImage car={car} />

                  <div className="cardContent">
                    <span className={`status ${normaliseStatus(car.status)}`}>
                      {normaliseStatus(car.status)}
                    </span>

                    <h3>{getTitle(car)}</h3>

                    <p>
                      {car.location || "Location TBC"} ·{" "}
                      {formatDate(car.created_at)}
                    </p>

                    <div className="detailsGrid">
                      <div>
                        <span>Price</span>
                        <strong>
                          {formatPrice(car.price || car.asking_price)}
                        </strong>
                      </div>

                      <div>
                        <span>Mileage</span>
                        <strong>{car.mileage || "TBC"}</strong>
                      </div>
                    </div>

                    <div className="cardActions listingActions">
                      <Link href={`/listing/${car.id}`}>View listing</Link>
                      <Link href={`/listing/${car.id}/edit`}>Edit listing</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "saved" && (
        <section className="contentSection">
          <h2>Saved cars</h2>

          {!accountData.saved_listings ||
          accountData.saved_listings.length === 0 ? (
            <EmptyBox
              title="No saved cars yet"
              text="Tap the heart on a listing to save it here."
              link="/browse"
              linkText="Browse cars"
            />
          ) : (
            <div className="cardsGrid">
              {accountData.saved_listings.map((car) => (
                <article className="card mediaCard" key={car.id}>
                  <ListingCardImage car={car} />

                  <div className="cardContent">
                    <span className="status saved">Saved</span>

                    <h3>{getTitle(car)}</h3>

                    <p>
                      {car.location || "Location TBC"} · Saved{" "}
                      {formatDate(car.saved_at)}
                    </p>

                    <div className="detailsGrid">
                      <div>
                        <span>Price</span>
                        <strong>
                          {formatPrice(car.price || car.asking_price)}
                        </strong>
                      </div>

                      <div>
                        <span>Mileage</span>
                        <strong>{car.mileage || "TBC"}</strong>
                      </div>
                    </div>

                    <Link href={`/listing/${car.id}`} className="cardLink">
                      View listing
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "sent" && (
        <section className="contentSection">
          <h2>Enquiries sent</h2>

          {accountData.sent_enquiries.length === 0 ? (
            <EmptyBox
              title="No enquiries sent"
              text="When you message a seller, your enquiry will appear here."
              link="/browse"
              linkText="Browse cars"
            />
          ) : (
            <div className="cardsGrid">
              {accountData.sent_enquiries.map((enquiry) => (
                <EnquiryCard key={enquiry.id} enquiry={enquiry} mode="sent" />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "received" && (
        <section className="contentSection">
          <h2>Enquiries received</h2>

          {accountData.received_enquiries.length === 0 ? (
            <EmptyBox
              title="No enquiries received"
              text="When buyers message your listings, their enquiries will appear here."
              buttonText="Post a car"
              onButtonClick={goToPostCar}
            />
          ) : (
            <div className="cardsGrid">
              {accountData.received_enquiries.map((enquiry) => (
                <EnquiryCard
                  key={enquiry.id}
                  enquiry={enquiry}
                  mode="received"
                />
              ))}
            </div>
          )}
        </section>
      )}

      <style jsx global>{styles}</style>
    </main>
  );
}

function EmptyBox({ title, text, link, linkText, buttonText, onButtonClick }) {
  return (
    <div className="emptyBox">
      <h3>{title}</h3>
      <p>{text}</p>

      {link && (
        <Link href={link} className="primaryLink">
          {linkText}
        </Link>
      )}

      {buttonText && (
        <button type="button" className="primaryLink" onClick={onButtonClick}>
          {buttonText}
        </button>
      )}
    </div>
  );
}

function ListingCardImage({ car }) {
  return (
    <Link href={`/listing/${car.id}`} className="cardImage">
      <img
        src={getImage(car)}
        alt={getTitle(car)}
        onError={(event) => {
          event.currentTarget.src = "/cars/hero-car.png";
        }}
      />
    </Link>
  );
}

function ListingMiniCard({ car, mode }) {
  return (
    <article className="miniCard">
      <Link href={`/listing/${car.id}`} className="miniImage">
        <img
          src={getImage(car)}
          alt={getTitle(car)}
          onError={(event) => {
            event.currentTarget.src = "/cars/hero-car.png";
          }}
        />
      </Link>

      <div>
        <span className={`status ${mode === "saved" ? "saved" : normaliseStatus(car.status)}`}>
          {mode === "saved" ? "Saved" : normaliseStatus(car.status)}
        </span>
        <h3>{getTitle(car)}</h3>
        <p>
          {formatPrice(car.price || car.asking_price)} ·{" "}
          {car.location || "Location TBC"}
        </p>

        <div className="miniActions">
          <Link href={`/listing/${car.id}`}>View</Link>
          {mode === "listing" && (
            <Link href={`/listing/${car.id}/edit`}>Edit</Link>
          )}
        </div>
      </div>
    </article>
  );
}

function EnquiryCard({ enquiry, mode }) {
  const status = normaliseStatus(enquiry.status);
  const listing = enquiry.listing || {};
  const listingTitle = enquiry.listing_title || getTitle(listing);
  const listingPrice = listing.price || listing.asking_price;
  const listingLocation = listing.location || listing.city || "";

  return (
    <article className="card enquiryCard">
      <div className="enquiryHeader">
        <Link href={`/listing/${enquiry.listing_id}`} className="enquiryImage">
          <img
            src={getImage(listing)}
            alt={listingTitle}
            onError={(event) => {
              event.currentTarget.src = "/cars/hero-car.png";
            }}
          />
        </Link>

        <div>
          <span className={`status ${status}`}>{status}</span>
          <h3>{listingTitle}</h3>
          <p>
            {formatDate(enquiry.created_at)}
            {listingPrice ? ` · ${formatPrice(listingPrice)}` : ""}
            {listingLocation ? ` · ${listingLocation}` : ""}
          </p>
        </div>
      </div>

      <div className="messageBox">
        <span>{mode === "sent" ? "Your message" : "Buyer message"}</span>
        <p>{enquiry.message || "No message provided."}</p>
      </div>

      <div className="detailsGrid">
        {mode === "sent" ? (
          <>
            <div>
              <span>Seller email</span>
              <strong>{enquiry.seller_email || "Not provided"}</strong>
            </div>

            <div>
              <span>Seller phone</span>
              <strong>{enquiry.seller_phone || "Not provided"}</strong>
            </div>
          </>
        ) : (
          <>
            <div>
              <span>Buyer name</span>
              <strong>{enquiry.buyer_name || "Not provided"}</strong>
            </div>

            <div>
              <span>Buyer email</span>
              <strong>{enquiry.buyer_email || "Not provided"}</strong>
            </div>

            <div>
              <span>Buyer phone</span>
              <strong>{enquiry.buyer_phone || "Not provided"}</strong>
            </div>
          </>
        )}
      </div>

      <div className="cardActions">
        <Link href={`/listing/${enquiry.listing_id}`}>View listing</Link>

        {mode === "received" && enquiry.buyer_email && (
          <a
            href={`mailto:${enquiry.buyer_email}?subject=Kerb enquiry about ${encodeURIComponent(
              enquiry.listing_title || "your car"
            )}`}
          >
            Reply by email
          </a>
        )}

        {mode === "received" && enquiry.buyer_phone && (
          <a href={`tel:${enquiry.buyer_phone}`}>Call buyer</a>
        )}

        {mode === "sent" && enquiry.seller_email && (
          <a
            href={`mailto:${enquiry.seller_email}?subject=Kerb enquiry about ${encodeURIComponent(
              listingTitle
            )}`}
          >
            Email seller
          </a>
        )}
      </div>
    </article>
  );
}

const styles = `
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
    padding: 24px 36px 60px;
    background:
      radial-gradient(circle at top left, rgba(0, 72, 255, 0.06), transparent 32%),
      #f7f9fd;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 24px;
  }

  .logo {
    color: #0048ff;
    font-size: 38px;
    font-weight: 950;
    letter-spacing: -1.8px;
    text-decoration: none;
  }

  .navActions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .navActions a,
  .navActions button {
    border: none;
    border-radius: 14px;
    background: #eef3ff;
    color: #0048ff;
    padding: 13px 18px;
    font-weight: 950;
    text-decoration: none;
    cursor: pointer;
  }

  .hero {
    display: grid;
    grid-template-columns: 1fr 520px;
    gap: 22px;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 255, 0.98));
    border: 1px solid #e5eaf4;
    border-radius: 30px;
    padding: 42px;
    box-shadow: 0 16px 50px rgba(20, 35, 70, 0.08);
    margin-bottom: 22px;
    animation: fadeUp 0.42s ease both;
  }

  .pill {
    display: inline-flex;
    background: #eaf1ff;
    color: #0048ff;
    border: 1px solid #d7e4ff;
    border-radius: 999px;
    padding: 9px 14px;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 18px;
  }

  h1 {
    margin: 0 0 14px;
    font-size: 52px;
    line-height: 0.98;
    letter-spacing: -2px;
  }

  h2 {
    margin: 0;
    font-size: 30px;
    letter-spacing: -1px;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 22px;
    letter-spacing: -0.6px;
  }

  p {
    color: #59657a;
    line-height: 1.6;
    margin: 0;
  }

  p strong {
    color: #071126;
  }

  .statsGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .statsGrid div {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 20px;
    padding: 18px;
  }

  .statsGrid span {
    display: block;
    color: #657189;
    font-weight: 900;
    font-size: 13px;
    margin-bottom: 6px;
  }

  .statsGrid strong {
    font-size: 36px;
    color: #0048ff;
  }

  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 22px;
  }

  .tabs button {
    border: 1px solid #e2e8f3;
    background: white;
    border-radius: 999px;
    padding: 12px 18px;
    color: #43506a;
    font-weight: 900;
  }

  .tabs button.active {
    background: #0048ff;
    border-color: #0048ff;
    color: white;
  }

  .overviewGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }

  .widePanel {
    grid-column: span 2;
  }

  .panel,
  .card,
  .emptyBox,
  .emptyCard,
  .contentSection {
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 24px;
    padding: 26px;
    box-shadow: 0 12px 34px rgba(10, 20, 40, 0.06);
    animation: fadeUp 0.42s ease both;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .panel:hover,
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 44px rgba(10, 20, 40, 0.1);
  }

  .emptyCard {
    max-width: 620px;
    margin: 100px auto;
  }

  .quickActions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 22px;
  }

  .quickActions a,
  .quickActions button,
  .primaryLink,
  .sectionHeader a,
  .sectionButton,
  .cardLink,
  .cardActions a {
    border: none;
    background: #0048ff;
    color: white;
    border-radius: 13px;
    padding: 13px 18px;
    font-weight: 950;
    text-decoration: none;
    display: inline-flex;
    width: fit-content;
    cursor: pointer;
  }

  .quickActions button {
    background: #eef3ff;
    color: #0048ff;
  }

  .quickActions .primaryQuickAction {
    background: #0048ff;
    color: white;
  }

  .sectionButton {
    font-family: inherit;
  }

  .panelHeader {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .panelHeader h2 {
    margin-bottom: 6px;
  }

  .panelHeader button,
  .softEmpty a,
  .softEmpty button,
  .miniActions a {
    border: none;
    background: #eef3ff;
    color: #0048ff;
    border-radius: 12px;
    padding: 11px 14px;
    font-weight: 950;
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
  }

  .contentSection {
    display: grid;
    gap: 18px;
  }

  .sectionHeader {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
  }

  .cardsGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }

  .mediaCard {
    padding: 0;
    overflow: hidden;
  }

  .cardContent {
    padding: 22px;
  }

  .cardImage {
    display: block;
    height: 190px;
    background: #eef2f7;
    overflow: hidden;
  }

  .enquiryCard {
    display: grid;
    gap: 16px;
  }

  .enquiryHeader {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 16px;
    align-items: center;
  }

  .enquiryImage {
    display: block;
    width: 150px;
    aspect-ratio: 16 / 10;
    border-radius: 16px;
    overflow: hidden;
    background: #eef2f7;
    border: 1px solid #e5eaf4;
  }

  .enquiryImage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.28s ease;
  }

  .enquiryCard:hover .enquiryImage img {
    transform: scale(1.035);
  }

  .enquiryHeader .status {
    margin-bottom: 8px;
  }

  .enquiryHeader h3 {
    margin-bottom: 6px;
  }

  .enquiryHeader p {
    font-size: 13px;
    line-height: 1.45;
  }

  .cardImage img,
  .miniImage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.28s ease;
  }

  .mediaCard:hover .cardImage img,
  .miniCard:hover .miniImage img {
    transform: scale(1.035);
  }

  .status {
    display: inline-flex;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 900;
    text-transform: capitalize;
    margin-bottom: 12px;
  }

  .status.new,
  .status.pending {
    background: #fff7e8;
    color: #a15c00;
  }

  .status.contacted,
  .status.approved {
    background: #eef3ff;
    color: #0048ff;
  }

  .status.closed,
  .status.sold {
    background: #eafaf0;
    color: #137333;
  }

  .status.saved {
    background: #fff1f1;
    color: #d7193f;
  }

  .detailsGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 16px;
  }

  .detailsGrid.one {
    grid-template-columns: 1fr;
  }

  .detailsGrid div,
  .messageBox {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 14px;
    padding: 14px;
  }

  .detailsGrid span,
  .messageBox span {
    display: block;
    color: #657189;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 6px;
  }

  .detailsGrid strong {
    word-break: break-word;
    font-size: 14px;
  }

  .messageBox {
    margin-top: 16px;
  }

  .messageBox p {
    color: #172033;
    font-weight: 700;
  }

  .cardLink {
    margin-top: 18px;
  }

  .cardActions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  .cardActions a:nth-child(2),
  .cardActions a:nth-child(3) {
    background: #eef3ff;
    color: #0048ff;
  }

  .listingActions {
    margin-top: 18px;
  }

  .miniList,
  .activityList {
    display: grid;
    gap: 12px;
  }

  .miniList.compact {
    gap: 10px;
  }

  .miniCard {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 16px;
    align-items: center;
    border: 1px solid #e5eaf4;
    border-radius: 18px;
    padding: 12px;
    background: #fbfcff;
    transition: transform 0.18s ease, border-color 0.18s ease;
  }

  .miniCard:hover {
    transform: translateY(-2px);
    border-color: #cfdcff;
  }

  .miniImage {
    height: 108px;
    border-radius: 14px;
    background: #eef2f7;
    overflow: hidden;
  }

  .miniCard h3 {
    margin-bottom: 5px;
  }

  .miniCard p {
    font-size: 13px;
  }

  .miniActions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .miniActions a:first-child {
    background: #0048ff;
    color: white;
  }

  .softEmpty {
    border: 1px dashed #d7e1f2;
    border-radius: 18px;
    padding: 22px;
    background: #fbfcff;
  }

  .softEmpty p {
    margin-bottom: 14px;
  }

  .activityItem {
    border: 1px solid #e5eaf4;
    border-radius: 16px;
    padding: 14px;
    background: #fbfcff;
    display: grid;
    gap: 4px;
  }

  .activityItem span {
    color: #0048ff;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
  }

  .activityItem strong {
    color: #071126;
  }

  .activityItem small {
    color: #657189;
    font-weight: 750;
  }

  .emptyBox {
    text-align: center;
  }

  .emptyBox p {
    margin-bottom: 20px;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 1000px) {
    .hero,
    .overviewGrid,
    .cardsGrid {
      grid-template-columns: 1fr;
    }

    .widePanel {
      grid-column: auto;
    }
  }

  @media (max-width: 700px) {
    .page {
      padding: 18px;
    }

    .navbar {
      align-items: center;
    }

    .sectionHeader {
      align-items: flex-start;
      flex-direction: column;
    }

    .navActions {
      display: none;
    }

    h1 {
      font-size: 38px;
    }

    .hero {
      padding: 28px;
    }

    .statsGrid,
    .detailsGrid {
      grid-template-columns: 1fr;
    }

    .panelHeader {
      flex-direction: column;
    }

    .cardImage {
      height: 180px;
    }

    .miniCard {
      grid-template-columns: 1fr;
    }

    .miniImage {
      height: 170px;
    }

    .enquiryHeader {
      grid-template-columns: 1fr;
    }

    .enquiryImage {
      width: 100%;
    }
  }
`;

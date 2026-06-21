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

function getEnquiryActivityDate(enquiry) {
  return enquiry?.last_message_at || enquiry?.created_at || "";
}

function getListingStatusInfo(status) {
  const cleanStatus = normaliseStatus(status);

  const statuses = {
    pending: {
      className: "pending",
      label: "Pending review",
      short: "Waiting for approval",
      message:
        "This listing is saved but not live yet. Kerb will review it before buyers can see it.",
    },
    approved: {
      className: "approved",
      label: "Live",
      short: "Visible on Kerb",
      message: "This listing is live on Kerb and buyers can message you.",
    },
    rejected: {
      className: "rejected",
      label: "Not approved",
      short: "Needs changes",
      message:
        "This listing was not approved. Edit the details or photos, then resubmit it for review.",
    },
    sold: {
      className: "sold",
      label: "Sold",
      short: "Archived as sold",
      message:
        "This listing is marked as sold and hidden from public browse results.",
    },
  };

  return (
    statuses[cleanStatus] || {
      className: "pending",
      label: "Pending review",
      short: "Waiting for approval",
      message:
        "This listing is saved but not live yet. Kerb will review it before buyers can see it.",
    }
  );
}

function getTitle(car) {
  if (car.title) return car.title;

  return (
    [car.year, car.make, car.model].filter(Boolean).join(" ") || "Car listing"
  );
}

function formatMileage(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) return "TBC";

  return `${new Intl.NumberFormat("en-GB").format(number)} miles`;
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

  const listingStatusCounts = useMemo(() => {
    const listings = accountData?.my_listings || [];

    return {
      pending: listings.filter(
        (listing) => normaliseStatus(listing.status) === "pending"
      ).length,
      approved: listings.filter(
        (listing) => normaliseStatus(listing.status) === "approved"
      ).length,
      rejected: listings.filter(
        (listing) => normaliseStatus(listing.status) === "rejected"
      ).length,
      sold: listings.filter(
        (listing) => normaliseStatus(listing.status) === "sold"
      ).length,
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
      .sort(
        (a, b) =>
          new Date(getEnquiryActivityDate(b)) -
          new Date(getEnquiryActivityDate(a))
      )
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

      {stats.listings > 0 && (
        <section className="statusSummary" aria-label="Listing status summary">
          {[
            ["pending", "Pending review"],
            ["approved", "Live"],
            ["rejected", "Needs changes"],
            ["sold", "Sold"],
          ].map(([status, label]) => (
            <button
              type="button"
              key={status}
              className={`statusSummaryItem ${status}`}
              onClick={() => setActiveTab("listings")}
            >
              <span>{label}</span>
              <strong>{listingStatusCounts[status]}</strong>
            </button>
          ))}
        </section>
      )}

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
                    <small>{formatDate(getEnquiryActivityDate(activity))}</small>
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
              {accountData.my_listings.map((car) => {
                const statusInfo = getListingStatusInfo(car.status);
                const status = normaliseStatus(car.status);
                let viewLabel = "Preview listing";

                if (status === "approved") {
                  viewLabel = "View live listing";
                } else if (status === "sold") {
                  viewLabel = "View sold listing";
                }

                return (
                  <article className="card mediaCard" key={car.id}>
                    <ListingCardImage car={car} />

                    <div className="cardContent">
                      <span className={`status ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>

                      <h3>{getTitle(car)}</h3>

                      <p>
                        {car.location || "Location TBC"} ·{" "}
                        {formatDate(car.created_at)}
                      </p>

                      <div
                        className={`listingStatusNote ${statusInfo.className}`}
                      >
                        <strong>{statusInfo.short}</strong>
                        <span>{statusInfo.message}</span>
                      </div>

                      <div className="detailsGrid">
                        <div>
                          <span>Price</span>
                          <strong>
                            {formatPrice(car.price || car.asking_price)}
                          </strong>
                        </div>

                        <div>
                          <span>Mileage</span>
                          <strong>{formatMileage(car.mileage)}</strong>
                        </div>
                      </div>

                      <div className="cardActions listingActions">
                        <Link href={`/listing/${car.id}`}>
                          {viewLabel}
                        </Link>

                        <Link href={`/listing/${car.id}/edit`}>
                          {status === "rejected"
                            ? "Edit and resubmit"
                            : "Edit listing"}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
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
                        <strong>{formatMileage(car.mileage)}</strong>
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
  const statusInfo = getListingStatusInfo(car.status);
  const status = normaliseStatus(car.status);

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
        <span
          className={`status ${
            mode === "saved" ? "saved" : statusInfo.className
          }`}
        >
          {mode === "saved" ? "Saved" : statusInfo.label}
        </span>
        <h3>{getTitle(car)}</h3>
        <p>
          {formatPrice(car.price || car.asking_price)} ·{" "}
          {car.location || "Location TBC"}
        </p>

        {mode === "listing" && (
          <small className={`miniStatusText ${statusInfo.className}`}>
            {statusInfo.short}
          </small>
        )}

        <div className="miniActions">
          <Link href={`/listing/${car.id}`}>View</Link>
          {mode === "listing" && (
            <Link href={`/listing/${car.id}/edit`}>
              {status === "rejected" ? "Fix listing" : "Edit"}
            </Link>
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
  const latestMessage = enquiry.last_message_preview || enquiry.message;
  const latestMessageDate = getEnquiryActivityDate(enquiry);

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
            {formatDate(latestMessageDate)}
            {listingPrice ? ` · ${formatPrice(listingPrice)}` : ""}
            {listingLocation ? ` · ${listingLocation}` : ""}
          </p>
        </div>
      </div>

      <div className="messageBox">
        <span>Latest message</span>
        <p>{latestMessage || "No message provided."}</p>
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
        <Link href={`/enquiries/${enquiry.id}`}>Open chat</Link>

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

  .statusSummary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin: -4px 0 22px;
  }

  .statusSummaryItem {
    border: 1px solid #e5eaf4;
    border-radius: 18px;
    background: white;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 10px 28px rgba(10, 20, 40, 0.045);
    transition: transform 0.18s ease, box-shadow 0.18s ease,
      border-color 0.18s ease;
  }

  .statusSummaryItem:hover {
    transform: translateY(-2px);
    border-color: #cfdcff;
    box-shadow: 0 16px 34px rgba(10, 20, 40, 0.08);
  }

  .statusSummaryItem span {
    color: #657189;
    font-size: 13px;
    font-weight: 950;
  }

  .statusSummaryItem strong {
    color: #071126;
    font-size: 24px;
  }

  .statusSummaryItem.pending strong {
    color: #a15c00;
  }

  .statusSummaryItem.approved strong {
    color: #0048ff;
  }

  .statusSummaryItem.rejected strong {
    color: #b42318;
  }

  .statusSummaryItem.sold strong {
    color: #59657a;
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
    background: #f0f3f8;
    color: #59657a;
  }

  .status.rejected {
    background: #fff1f1;
    color: #b42318;
  }

  .status.saved {
    background: #fff1f1;
    color: #d7193f;
  }

  .listingStatusNote {
    border-radius: 16px;
    padding: 13px 14px;
    margin-top: 16px;
    display: grid;
    gap: 4px;
    border: 1px solid #e5eaf4;
    background: #f7f9fd;
  }

  .listingStatusNote strong {
    font-size: 13px;
    color: #071126;
  }

  .listingStatusNote span {
    color: #59657a;
    font-size: 13px;
    line-height: 1.45;
    font-weight: 700;
  }

  .listingStatusNote.pending {
    background: #fffaf0;
    border-color: #ffe0a8;
  }

  .listingStatusNote.approved {
    background: #eef3ff;
    border-color: #cfdcff;
  }

  .listingStatusNote.rejected {
    background: #fff5f5;
    border-color: #ffd1d1;
  }

  .listingStatusNote.sold {
    background: #f3f5f9;
    border-color: #e2e8f3;
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

  .cardActions a:not(:first-child) {
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

  .miniStatusText {
    display: block;
    margin-top: 7px;
    font-size: 12px;
    font-weight: 950;
  }

  .miniStatusText.pending {
    color: #a15c00;
  }

  .miniStatusText.approved {
    color: #0048ff;
  }

  .miniStatusText.rejected {
    color: #b42318;
  }

  .miniStatusText.sold {
    color: #59657a;
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
    .cardsGrid,
    .statusSummary {
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
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import SiteMenu from "./components/SiteMenu";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

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

function getListingImage(car) {
  const images = [
    ...parseImageField(car.main_photo),
    ...parseImageField(car.photo_url),
    ...parseImageField(car.image_url),
    ...parseImageField(car.cover_image),
    ...parseImageField(car.main_image),
    ...parseImageField(car.photos),
    ...parseImageField(car.photo_urls),
    ...parseImageField(car.image_urls),
    ...parseImageField(car.images),
  ];

  return [...new Set(images)].filter(Boolean)[0] || "/cars/hero-car.png";
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
  return (
    [car.year, car.make, car.model].filter(Boolean).join(" ") || "Car listing"
  );
}

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [approvedListings, setApprovedListings] = useState([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [listingError, setListingError] = useState("");
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const categories = [
    {
      icon: "car",
      title: "Browse cars",
      text: "Search cars listed on Kerb",
      href: "/browse",
      category: "general",
      image: "/cars/category-browse.png",
    },
    {
      icon: "new",
      title: "New cars",
      text: "Latest models and offers",
      href: "/browse?category=newer-car",
      category: "newer-car",
      image: "/cars/category-new.png",
    },
    {
      icon: "electric",
      title: "Electric cars",
      text: "Clean, efficient and future-ready",
      href: "/browse?category=electric-hybrid",
      category: "electric-hybrid",
      image: "/cars/category-electric.png",
    },
    {
      icon: "body",
      title: "Family SUVs",
      text: "Space, comfort and safety",
      href: "/browse?category=family-suv",
      category: "family-suv",
      image: "/cars/category-family-suv.png",
    },
    {
      icon: "shield",
      title: "First cars",
      text: "Affordable and reliable picks",
      href: "/browse?category=first-car",
      category: "first-car",
      image: "/cars/category-first-car.png",
    },
    {
      icon: "mileage",
      title: "Performance",
      text: "Power, style and thrill",
      href: "/browse?category=performance",
      category: "performance",
      image: "/cars/category-performance.png",
    },
  ];

  useEffect(() => {
    function syncKerbUser() {
      const savedUser = localStorage.getItem("kerbUser");
      const savedEmail = localStorage.getItem("kerbAccountEmail");
      const token = localStorage.getItem("kerbSessionToken");

      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
          return;
        } catch {
          localStorage.removeItem("kerbUser");
        }
      }

      if (token && savedEmail) {
        setCurrentUser({ email: savedEmail });
        return;
      }

      setCurrentUser(null);
    }

    syncKerbUser();

    window.addEventListener("storage", syncKerbUser);
    window.addEventListener("kerb-auth-change", syncKerbUser);

    return () => {
      window.removeEventListener("storage", syncKerbUser);
      window.removeEventListener("kerb-auth-change", syncKerbUser);
    };
  }, []);

  useEffect(() => {
    async function loadApprovedListings() {
      setIsLoadingListings(true);
      setListingError("");

      if (!supabase) {
        setApprovedListings([]);
        setListingError("Supabase environment variables are missing.");
        setIsLoadingListings(false);
        return;
      }

      const { data, error } = await supabase
        .from("kerb_listings")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Homepage listings error:", error);
        setApprovedListings([]);
        setListingError(error.message);
      } else {
        setApprovedListings(data || []);
      }

      setIsLoadingListings(false);
    }

    loadApprovedListings();
  }, []);

  function logout() {
    localStorage.removeItem("kerbSessionToken");
    localStorage.removeItem("kerbAccountEmail");
    localStorage.removeItem("kerbUser");
    window.dispatchEvent(new Event("kerb-auth-change"));
    window.location.href = "/";
  }

  function handleNewsletterSubmit(event) {
    event.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setNewsletterMessage("Enter your email first.");
      return;
    }

    localStorage.setItem("kerbLaunchEmail", cleanEmail);
    setNewsletterMessage("Nice — you are on the Kerb early access list.");
    setEmail("");
  }

  return (
    <main className="page">
      <header className="navbar">
        <Link href="/" className="logo">
          Kerb
        </Link>

        <nav className="navLinks">
          <Link href="/browse">
            <Icon name="car" /> Browse cars
          </Link>

          <Link href="/browse?category=newer-car">
            <Icon name="new" /> New cars
          </Link>

          <Link href="/post-car">
            <Icon name="sell" /> Sell your car
          </Link>

          <Link href="/browse?category=electric-hybrid">
            <Icon name="electric" /> Electric
          </Link>

          <Link href="/browse?finance=true">
            <Icon name="finance" /> Finance
          </Link>

          <a href="#guides">
            <Icon name="guide" /> Guides
          </a>
        </nav>

        <div className="navActions">
          <Link
            href={currentUser ? "/account?tab=saved" : "/login"}
            className="ghostBtn"
          >
            <Icon name="heart" /> Saved
          </Link>

          {currentUser ? (
            <>
              <Link href="/account" className="ghostBtn">
                <Icon name="user" /> My account
              </Link>

              <button className="ghostBtn logoutBtn" type="button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="ghostBtn">
              <Icon name="user" /> Sign in
            </Link>
          )}

          <Link href="/post-car" className="primaryBtn navPostBtn">
            <Icon name="plus" /> Post your car
          </Link>
        </div>

        <SiteMenu currentUser={currentUser} onLogout={logout} />
      </header>

      <section className="hero">
        <div className="heroText">
          <div className="pill">UK car marketplace</div>

          <h1>Find your next car with confidence</h1>

          <p>
            Browse cars from private sellers and dealers, save favourites and
            message sellers directly. Kerb is a marketplace, not a direct car
            seller.
          </p>

          <div className="heroStats">
            <span>
              <Icon name="car" /> Private sellers
            </span>
            <span>
              <Icon name="mail" /> Message sellers
            </span>
            <span>
              <Icon name="heart" /> Save favourites
            </span>
          </div>
        </div>

        <div className="heroCar">
          <div className="heroCarGlow" />
          <img src="/cars/hero-car.png" alt="White BMW on Kerb" />
        </div>

        <div className="searchBox">
          <Link className="filterItem" href="/browse?location=Leicester">
            <Icon name="location" />
            <div>
              <small>Location</small>
              <strong>Leicester</strong>
            </div>
          </Link>

          <Link className="filterItem" href="/browse">
            <Icon name="car" />
            <div>
              <small>Make & model</small>
              <strong>Any make</strong>
            </div>
          </Link>

          <Link className="filterItem" href="/browse?sort=price-low">
            <Icon name="price" />
            <div>
              <small>Price</small>
              <strong>Any price</strong>
            </div>
          </Link>

          <Link className="filterItem" href="/browse?sort=mileage-low">
            <Icon name="mileage" />
            <div>
              <small>Mileage</small>
              <strong>Any miles</strong>
            </div>
          </Link>

          <Link className="filterItem" href="/browse">
            <Icon name="body" />
            <div>
              <small>Body type</small>
              <strong>Any</strong>
            </div>
          </Link>

          <Link className="searchBtn" href="/browse">
            Search cars
          </Link>
        </div>
      </section>

      <section className="categories">
        {categories.map((item) => (
          <Link className="categoryCard" href={item.href} key={item.title}>
            <div className="categoryImage">
              <img src={item.image} alt="" />

              <span>
                <Icon name={item.icon} />
              </span>
            </div>

            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>

            <span className="arrow">›</span>
          </Link>
        ))}
      </section>

      <section className="launchGrid" id="latest-cars">
        <div className="listingsPanel">
          <div className="sectionTitleRow">
            <div>
              <span className="sectionKicker">Recently listed</span>
              <h2>Latest cars on Kerb</h2>
            </div>

            <Link href="/browse" className="browseAllLink">
              Browse all cars →
            </Link>
          </div>

          {listingError && <div className="errorBox">{listingError}</div>}

          {isLoadingListings && (
            <div className="loadingListings">
              <div />
              <div />
              <div />
              <div />
            </div>
          )}

          {!isLoadingListings && !listingError && approvedListings.length > 0 ? (
            <div className="homeListingsGrid">
              {approvedListings.map((car) => (
                <article className="listingCard" key={car.id}>
                  <div className="listingImageWrap">
                    <img
                      src={getListingImage(car)}
                      alt={carTitle(car)}
                      className="listingImage"
                      onError={(event) => {
                        event.currentTarget.src = "/cars/hero-car.png";
                      }}
                    />
                  </div>

                  <div className="listingContent">
                    <div>
                      <h3>{carTitle(car)}</h3>
                      <p className="listingLocation">
                        <Icon name="location" />{" "}
                        {car.location || "Location TBC"}
                      </p>
                    </div>

                    <div className="listingMeta">
                      <span>{formatMileage(car.mileage)}</span>
                      <span>{car.fuel_type || car.gearbox || "Approved"}</span>
                    </div>

                    <div className="listingFooter">
                      <strong>{formatPrice(car.price || car.asking_price)}</strong>

                      <Link href={`/listing/${car.id}`} className="viewCarBtn">
                        View car
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {!isLoadingListings && !listingError && approvedListings.length === 0 && (
            <div className="emptyListings">
              <div className="emptyIcon">
                <Icon name="car" />
              </div>

              <h2>No cars live yet</h2>

              <p>
                Once sellers submit cars and they are published, they will
                appear here automatically.
              </p>

              <div className="emptyActions">
                <Link href="/post-car" className="primaryBtn">
                  <Icon name="plus" /> Post your car
                </Link>

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
            Create a clean listing, add real photos and manage buyer enquiries
            from your Kerb account.
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
              <span>Manage enquiries</span>
            </div>
          </div>

          <Link href="/post-car" className="primaryBtn fullBtn">
            Start selling
          </Link>
        </div>
      </section>

      <section className="trustGrid">
        <div className="trustCard">
          <span>
            <Icon name="shield" />
          </span>
          <div>
            <h3>Trusted sellers</h3>
            <p>Built for verified private sellers and approved dealers.</p>
          </div>
        </div>

        <div className="trustCard">
          <span>
            <Icon name="price" />
          </span>
          <div>
            <h3>Clear pricing</h3>
            <p>Simple prices with clean vehicle information.</p>
          </div>
        </div>

        <div className="trustCard">
          <span>
            <Icon name="heart" />
          </span>
          <div>
            <h3>Save favourites</h3>
            <p>Buyers can save cars and compare their options.</p>
          </div>
        </div>

        <div className="trustCard">
          <span>
            <Icon name="mail" />
          </span>
          <div>
            <h3>Easy enquiries</h3>
            <p>Simple contact flow between buyers and sellers.</p>
          </div>
        </div>
      </section>

      <section className="guidesSection" id="guides">
        <div className="sectionTitleRow">
          <div>
            <span className="sectionKicker">Kerb guides</span>
            <h2>Helpful car guides</h2>
          </div>
        </div>

        <div className="guidesGrid">
          <Link href="/post-car" className="guideCard">
            <Icon name="sell" />
            <h3>How to sell your car</h3>
            <p>Start a listing, add photos and manage buyer enquiries.</p>
          </Link>

          <Link href="/browse" className="guideCard">
            <Icon name="shield" />
            <h3>Buying safely</h3>
            <p>Browse approved listings and contact sellers directly.</p>
          </Link>

          <Link href="/browse?category=electric-hybrid" className="guideCard">
            <Icon name="electric" />
            <h3>Electric cars</h3>
            <p>Filter Kerb listings to find electric and hybrid cars.</p>
          </Link>
        </div>
      </section>

      <section className="newsletter" id="early-access">
        <div>
          <h3>Get early access to Kerb</h3>
          <p>Be notified when the first cars go live.</p>
          {newsletterMessage && (
            <span className="newsletterMessage">{newsletterMessage}</span>
          )}
        </div>

        <form className="emailBox" onSubmit={handleNewsletterSubmit}>
          <input
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
          />
          <button type="submit">Notify me</button>
        </form>
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
          padding: 22px 40px 44px;
          background:
            radial-gradient(circle at top left, rgba(0, 72, 255, 0.06), transparent 30%),
            #f7f9fd;
        }

        .icon {
          width: 19px;
          height: 19px;
          flex-shrink: 0;
        }

        .navbar {
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          margin-bottom: 22px;
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
          gap: clamp(16px, 1.6vw, 30px);
          font-size: 14px;
          font-weight: 800;
          color: #12172c;
          min-width: 0;
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
          gap: 16px;
          flex: 0 0 auto;
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

        .logoutBtn {
          color: #c01818;
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
          line-height: 1;
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            background 0.18s ease;
        }

        .primaryBtn:hover,
        .searchBtn:hover,
        .viewCarBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(0, 72, 255, 0.28);
        }

        .navPostBtn {
          min-height: 54px;
          padding: 0 22px;
          border-radius: 17px;
          font-size: 15px;
          white-space: nowrap;
        }

        .navPostBtn .icon {
          width: 21px;
          height: 21px;
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
          min-height: 430px;
          border-radius: 30px;
          overflow: hidden;
          background:
            radial-gradient(circle at 76% 42%, rgba(0,72,255,0.14), transparent 34%),
            radial-gradient(circle at 72% 72%, rgba(255,255,255,0.92), transparent 42%),
            linear-gradient(105deg, #f9fbff 0%, #f5f8ff 42%, #eaf2ff 100%);
          border: 1px solid #e5eaf5;
          padding: 48px 56px 118px;
          box-shadow: 0 16px 50px rgba(20, 35, 70, 0.08);
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
          right: 54px;
          bottom: 106px;
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
          bottom: 28px;
          z-index: 4;
          display: grid;
          grid-template-columns: repeat(5, 1fr) 170px;
          gap: 16px;
          background: rgba(255,255,255,0.94);
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
          text-decoration: none;
          color: inherit;
          transition: transform 0.18s ease, border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .filterItem:hover {
          transform: translateY(-2px);
          border-color: #cfdbef;
          box-shadow: 0 12px 24px rgba(10, 20, 40, 0.08);
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
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .categories {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 13px;
          margin: 16px 8px 22px;
        }

        .categoryCard {
          display: grid;
          grid-template-columns: 84px minmax(0, 1fr) 14px;
          align-items: center;
          gap: 10px;
          background: white;
          border: 1px solid #e6ebf4;
          border-radius: 12px;
          padding: 10px 12px;
          box-shadow: 0 6px 18px rgba(10, 20, 40, 0.035);
          text-decoration: none;
          color: inherit;
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            border-color 0.18s ease;
          min-width: 0;
          min-height: 70px;
        }

        .categoryCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(10, 20, 40, 0.07);
          border-color: #d6e1f4;
        }

        .categoryImage {
          width: 84px;
          height: 46px;
          border-radius: 10px;
          background: white;
          overflow: hidden;
          position: relative;
        }

        .categoryImage img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .categoryImage span {
          display: none;
        }

        .categoryImage .icon {
          width: 15px;
          height: 15px;
        }

        .categoryCard h3 {
          margin: 0 0 3px;
          font-size: 13px;
          line-height: 1.15;
          letter-spacing: 0;
        }

        .categoryCard p {
          margin: 0;
          font-size: 11px;
          color: #657189;
          line-height: 1.3;
        }

        .arrow {
          margin-left: auto;
          font-size: 25px;
          color: #172033;
          line-height: 1;
        }

        .launchGrid {
          display: grid;
          grid-template-columns: 1.4fr 0.9fr;
          gap: 20px;
          margin-top: 20px;
          align-items: start;
        }

        .listingsPanel,
        .sellerBox,
        .guidesSection {
          background: white;
          border: 1px solid #e6ebf4;
          border-radius: 24px;
          padding: 34px;
          box-shadow: 0 12px 30px rgba(10, 20, 40, 0.05);
          animation: fadeUp 0.42s ease both;
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
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            border-color 0.18s ease;
        }

        .listingCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 44px rgba(10, 20, 40, 0.09);
          border-color: #d6e1f4;
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
          transition: transform 0.28s ease;
        }

        .listingCard:hover .listingImage {
          transform: scale(1.035);
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
          min-height: 64px;
          padding: 14px 16px;
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
          min-height: 54px;
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

        .guidesSection {
          margin-top: 20px;
        }

        .guidesGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .guideCard {
          border: 1px solid #e7edf6;
          background: #f8fbff;
          border-radius: 18px;
          padding: 20px;
          text-decoration: none;
          color: inherit;
          transition: 0.2s ease;
        }

        .guideCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 35px rgba(10, 20, 40, 0.08);
        }

        .guideCard .icon {
          color: #0048ff;
          width: 28px;
          height: 28px;
          margin-bottom: 12px;
        }

        .guideCard h3 {
          margin: 0 0 8px;
        }

        .guideCard p {
          margin: 0;
          color: #657189;
          font-size: 14px;
          line-height: 1.5;
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

        .newsletterMessage {
          display: block;
          color: #0048ff;
          font-weight: 900;
          font-size: 13px;
          margin-top: 8px;
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

        .loadingListings {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .loadingListings div {
          height: 290px;
          border-radius: 20px;
          background: linear-gradient(90deg, #eef2f7, #ffffff, #eef2f7);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
          border: 1px solid #e5ebf5;
        }

        .errorBox {
          background: #fff1f1;
          color: #c01818;
          border: 1px solid #ffd1d1;
          border-radius: 16px;
          padding: 16px;
          font-weight: 800;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
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

          .guidesGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .page {
            padding: 16px;
          }

          .navbar {
            height: auto;
            align-items: center;
            gap: 12px;
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
          .homeListingsGrid,
          .loadingListings {
            grid-template-columns: 1fr;
          }

          .listingsPanel,
          .sellerBox,
          .guidesSection {
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

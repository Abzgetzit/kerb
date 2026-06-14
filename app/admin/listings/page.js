"use client";

import { useEffect, useMemo, useState } from "react";

const VALID_STATUSES = ["pending", "approved", "sold", "rejected"];

function normaliseStatus(status) {
  const cleaned = String(status || "pending").trim().toLowerCase();
  return VALID_STATUSES.includes(cleaned) ? cleaned : "pending";
}

function formatMoney(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "Not set";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatMileage(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "Not set";

  return `${new Intl.NumberFormat("en-GB").format(number)} miles`;
}

function getPhotos(listing) {
  const possiblePhotoFields = [
    listing.photo_urls,
    listing.photos,
    listing.image_urls,
    listing.images,
  ];

  for (const field of possiblePhotoFields) {
    if (Array.isArray(field) && field.length > 0) {
      return field.filter(Boolean);
    }

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

  const singlePhoto =
    listing.image_url ||
    listing.photo_url ||
    listing.main_photo_url ||
    listing.cover_image_url;

  return singlePhoto ? [singlePhoto] : [];
}

function getListingTitle(listing) {
  const title = [listing.year, listing.make, listing.model, listing.variant]
    .filter(Boolean)
    .join(" ")
    .trim();

  return title || listing.title || "Untitled listing";
}

export default function AdminListingsPage() {
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    const storedPassword = localStorage.getItem("kerbAdminPassword");

    if (storedPassword) {
      setSavedPassword(storedPassword);
      fetchListings(storedPassword);
    }
  }, []);

  async function fetchListings(adminPassword) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/listings", {
        headers: {
          "x-admin-password": adminPassword,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load listings.");
      }

      const cleanedListings = (result.listings || []).map((listing) => ({
        ...listing,
        status: normaliseStatus(listing.status),
      }));

      setListings(cleanedListings);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
      localStorage.removeItem("kerbAdminPassword");
      setSavedPassword("");
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogin(e) {
    e.preventDefault();

    if (!password.trim()) return;

    localStorage.setItem("kerbAdminPassword", password.trim());
    setSavedPassword(password.trim());
    fetchListings(password.trim());
  }

  function handleLogout() {
    localStorage.removeItem("kerbAdminPassword");
    setSavedPassword("");
    setPassword("");
    setListings([]);
  }

  async function updateStatus(id, status) {
    const cleanStatus = normaliseStatus(status);

    setIsUpdatingId(id);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": savedPassword,
        },
        body: JSON.stringify({ id, status: cleanStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not update listing.");
      }

      const updatedListing = {
        ...result.listing,
        status: normaliseStatus(result.listing?.status),
      };

      setListings((currentListings) =>
        currentListings.map((listing) =>
          listing.id === id ? updatedListing : listing
        )
      );

      await fetchListings(savedPassword);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsUpdatingId("");
    }
  }

  async function deleteListing(id) {
    const confirmed = window.confirm(
      "Delete this listing permanently? This cannot be undone."
    );

    if (!confirmed) return;

    setIsUpdatingId(id);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/listings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": savedPassword,
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not delete listing.");
      }

      setListings((currentListings) =>
        currentListings.filter((listing) => listing.id !== id)
      );
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsUpdatingId("");
    }
  }

  const filteredListings = useMemo(() => {
    if (filter === "all") return listings;

    return listings.filter(
      (listing) => normaliseStatus(listing.status) === filter
    );
  }, [listings, filter]);

  const counts = useMemo(() => {
    return {
      all: listings.length,
      pending: listings.filter(
        (listing) => normaliseStatus(listing.status) === "pending"
      ).length,
      approved: listings.filter(
        (listing) => normaliseStatus(listing.status) === "approved"
      ).length,
      sold: listings.filter(
        (listing) => normaliseStatus(listing.status) === "sold"
      ).length,
      rejected: listings.filter(
        (listing) => normaliseStatus(listing.status) === "rejected"
      ).length,
    };
  }, [listings]);

  if (!savedPassword) {
    return (
      <main className="page">
        <a href="/" className="logo">
          Kerb
        </a>

        <section className="loginCard">
          <div className="pill">Admin access</div>
          <h1>Kerb listings admin</h1>
          <p>Enter your admin password to review submitted car listings.</p>

          <form onSubmit={handleLogin}>
            <label>
              Admin password
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {errorMessage && <div className="errorBox">{errorMessage}</div>}

            <button className="primaryBtn" type="submit">
              Open admin
            </button>
          </form>
        </section>

        <style>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="navbar">
        <a href="/" className="logo">
          Kerb
        </a>

        <div className="navActions">
          <a className="secondaryLink" href="/browse" target="_blank">
            View browse page
          </a>

          <button
            className="secondaryBtn"
            onClick={() => fetchListings(savedPassword)}
          >
            Refresh
          </button>

          <button className="ghostBtn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <div className="pill">Admin dashboard</div>
          <h1>Review car listings</h1>
          <p>
            New submissions stay pending until you approve them. Approved cars
            appear publicly on the browse page. Bad listings can be deleted.
          </p>
        </div>

        <div className="statsGrid">
          <div>
            <span>Pending</span>
            <strong>{counts.pending}</strong>
          </div>
          <div>
            <span>Approved</span>
            <strong>{counts.approved}</strong>
          </div>
          <div>
            <span>Sold</span>
            <strong>{counts.sold}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{counts.all}</strong>
          </div>
        </div>
      </section>

      <section className="filters">
        <button
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          Pending ({counts.pending})
        </button>

        <button
          className={filter === "approved" ? "active" : ""}
          onClick={() => setFilter("approved")}
        >
          Approved ({counts.approved})
        </button>

        <button
          className={filter === "sold" ? "active" : ""}
          onClick={() => setFilter("sold")}
        >
          Sold ({counts.sold})
        </button>

        {counts.rejected > 0 && (
          <button
            className={filter === "rejected" ? "active" : ""}
            onClick={() => setFilter("rejected")}
          >
            Rejected ({counts.rejected})
          </button>
        )}

        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All ({counts.all})
        </button>
      </section>

      {errorMessage && <div className="errorBox">{errorMessage}</div>}

      {isLoading ? (
        <div className="emptyBox">Loading listings...</div>
      ) : filteredListings.length === 0 ? (
        <div className="emptyBox">
          <h2>No listings found</h2>
          <p>There are no listings in this section yet.</p>
        </div>
      ) : (
        <section className="listingsGrid">
          {filteredListings.map((listing) => {
            const photos = getPhotos(listing);
            const status = normaliseStatus(listing.status);
            const isBusy = isUpdatingId === listing.id;

            return (
              <article className="listingCard" key={listing.id}>
                <div className="imageStrip">
                  {photos.length > 0 ? (
                    photos.slice(0, 4).map((url, index) => (
                      <img key={`${url}-${index}`} src={url} alt="Car photo" />
                    ))
                  ) : (
                    <div className="noImage">No photos</div>
                  )}
                </div>

                <div className="listingContent">
                  <div className="listingTop">
                    <div>
                      <span className={`status ${status}`}>{status}</span>

                      <h2>{getListingTitle(listing)}</h2>

                      <p>{listing.description || "No description added."}</p>
                    </div>

                    <div className="priceBox">
                      <span>Asking price</span>
                      <strong>
                        {formatMoney(
                          listing.asking_price ||
                            listing.price ||
                            listing.listing_price
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="detailsGrid">
                    <div>
                      <span>Mileage</span>
                      <strong>
                        {formatMileage(listing.mileage || listing.miles)}
                      </strong>
                    </div>

                    <div>
                      <span>Fuel</span>
                      <strong>
                        {listing.fuel_type || listing.fuel || "Not set"}
                      </strong>
                    </div>

                    <div>
                      <span>Gearbox</span>
                      <strong>
                        {listing.gearbox || listing.transmission || "Not set"}
                      </strong>
                    </div>

                    <div>
                      <span>Location</span>
                      <strong>{listing.location || "Not set"}</strong>
                    </div>

                    <div>
                      <span>Guide price</span>
                      <strong>
                        {listing.valuation_low && listing.valuation_high
                          ? `${formatMoney(
                              listing.valuation_low
                            )} - ${formatMoney(listing.valuation_high)}`
                          : "Not generated"}
                      </strong>
                    </div>

                    <div>
                      <span>Submitted</span>
                      <strong>
                        {listing.created_at
                          ? new Date(listing.created_at).toLocaleDateString(
                              "en-GB"
                            )
                          : "Unknown"}
                      </strong>
                    </div>
                  </div>

                  <div className="sellerBox">
                    <h3>Seller details</h3>

                    <div className="sellerGrid">
                      <div>
                        <span>Name</span>
                        <strong>{listing.seller_name || "Not set"}</strong>
                      </div>

                      <div>
                        <span>Email</span>
                        <strong>{listing.seller_email || "Not set"}</strong>
                      </div>

                      <div>
                        <span>Phone</span>
                        <strong>{listing.seller_phone || "Not set"}</strong>
                      </div>

                      <div>
                        <span>Seller type</span>
                        <strong>{listing.seller_type || "Private seller"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="actionRow">
                    <button
                      className="approveBtn"
                      disabled={isBusy}
                      onClick={() => updateStatus(listing.id, "approved")}
                    >
                      Approve
                    </button>

                    <button
                      className="pendingBtn"
                      disabled={isBusy}
                      onClick={() => updateStatus(listing.id, "pending")}
                    >
                      Move to pending
                    </button>

                    <button
                      className="soldBtn"
                      disabled={isBusy}
                      onClick={() => updateStatus(listing.id, "sold")}
                    >
                      Mark sold
                    </button>

                    <button
                      className="deleteBtn"
                      disabled={isBusy}
                      onClick={() => deleteListing(listing.id)}
                    >
                      Delete listing
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <style>{styles}</style>
    </main>
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
    padding: 24px 36px 50px;
  }

  .navbar {
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
    gap: 18px;
  }

  .logo {
    font-size: 36px;
    font-weight: 900;
    color: #0048ff;
    letter-spacing: -1.8px;
    text-decoration: none;
  }

  .navActions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
  }

  .ghostBtn {
    background: transparent;
    color: #172033;
    font-weight: 900;
    font-size: 14px;
  }

  .primaryBtn,
  .secondaryBtn,
  .secondaryLink {
    border-radius: 14px;
    padding: 14px 22px;
    font-weight: 900;
    text-decoration: none;
    font-size: 14px;
  }

  .primaryBtn {
    background: #0048ff;
    color: white;
    box-shadow: 0 10px 25px rgba(0, 72, 255, 0.22);
  }

  .secondaryBtn,
  .secondaryLink {
    background: #eef3ff;
    color: #0048ff;
  }

  .hero {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 24px;
    align-items: stretch;
    background:
      linear-gradient(90deg, rgba(246,249,255,0.98), rgba(235,242,255,0.92)),
      radial-gradient(circle at 80% 40%, rgba(0,72,255,0.15), transparent 35%);
    border: 1px solid #e4eaf5;
    border-radius: 30px;
    padding: 42px;
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
    font-weight: 900;
    margin-bottom: 18px;
  }

  h1 {
    font-size: 54px;
    line-height: 0.98;
    margin: 0 0 16px;
    letter-spacing: -2.4px;
  }

  p {
    color: #59657a;
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
  }

  .statsGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .statsGrid div {
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 18px;
    padding: 18px;
  }

  .statsGrid span {
    display: block;
    color: #657189;
    font-weight: 800;
    font-size: 13px;
    margin-bottom: 6px;
  }

  .statsGrid strong {
    font-size: 34px;
    color: #0048ff;
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 24px 0;
  }

  .filters button {
    background: white;
    border: 1px solid #e2e8f3;
    border-radius: 999px;
    padding: 12px 18px;
    color: #43506a;
    font-weight: 900;
  }

  .filters button.active {
    background: #0048ff;
    border-color: #0048ff;
    color: white;
  }

  .loginCard,
  .emptyBox {
    max-width: 620px;
    margin: 120px auto 0;
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 28px;
    padding: 40px;
    box-shadow: 0 16px 50px rgba(20, 35, 70, 0.08);
  }

  .loginCard h1,
  .emptyBox h2 {
    margin: 0 0 12px;
  }

  .loginCard form {
    display: grid;
    gap: 16px;
    margin-top: 24px;
  }

  label {
    display: grid;
    gap: 8px;
    font-weight: 900;
    font-size: 14px;
  }

  input {
    border: 1px solid #dfe6f1;
    border-radius: 14px;
    padding: 15px 16px;
    font-size: 15px;
    outline: none;
    background: #fbfcff;
  }

  input:focus {
    border-color: #0048ff;
    box-shadow: 0 0 0 4px rgba(0, 72, 255, 0.08);
  }

  .errorBox {
    background: #fff1f1;
    color: #b42318;
    border: 1px solid #ffd1d1;
    border-radius: 14px;
    padding: 14px 16px;
    font-weight: 800;
    margin-bottom: 18px;
  }

  .listingsGrid {
    display: grid;
    gap: 22px;
  }

  .listingCard {
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 26px;
    overflow: hidden;
    box-shadow: 0 12px 34px rgba(10, 20, 40, 0.06);
  }

  .imageStrip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;
    background: #eef2f8;
    min-height: 190px;
  }

  .imageStrip img {
    width: 100%;
    height: 220px;
    object-fit: cover;
  }

  .noImage {
    grid-column: 1 / -1;
    display: grid;
    place-items: center;
    color: #657189;
    font-weight: 900;
    min-height: 190px;
  }

  .listingContent {
    padding: 26px;
  }

  .listingTop {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px;
    align-items: start;
    margin-bottom: 20px;
  }

  .status {
    display: inline-flex;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 900;
    text-transform: capitalize;
    margin-bottom: 10px;
  }

  .status.pending {
    background: #fff7e8;
    color: #a15c00;
  }

  .status.approved {
    background: #eafaf0;
    color: #137333;
  }

  .status.rejected {
    background: #fff1f1;
    color: #b42318;
  }

  .status.sold {
    background: #eef3ff;
    color: #0048ff;
  }

  .listingTop h2 {
    margin: 0 0 8px;
    font-size: 30px;
    letter-spacing: -1px;
  }

  .priceBox {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 18px;
    padding: 16px;
    min-width: 180px;
  }

  .priceBox span,
  .detailsGrid span,
  .sellerGrid span {
    display: block;
    color: #657189;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 4px;
  }

  .priceBox strong {
    font-size: 24px;
    color: #0048ff;
  }

  .detailsGrid,
  .sellerGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .detailsGrid div,
  .sellerGrid div {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 14px;
    padding: 14px;
  }

  .detailsGrid strong,
  .sellerGrid strong {
    font-size: 14px;
    color: #172033;
    word-break: break-word;
  }

  .sellerBox {
    border-top: 1px solid #edf1f7;
    margin-top: 22px;
    padding-top: 22px;
  }

  .sellerBox h3 {
    margin: 0 0 14px;
    font-size: 20px;
  }

  .actionRow {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    border-top: 1px solid #edf1f7;
    margin-top: 22px;
    padding-top: 22px;
  }

  .actionRow button {
    border-radius: 12px;
    padding: 12px 18px;
    font-weight: 900;
  }

  .actionRow button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .approveBtn {
    background: #13a538;
    color: white;
  }

  .pendingBtn {
    background: #fff3da;
    color: #a15c00;
  }

  .soldBtn {
    background: #0048ff;
    color: white;
  }

  .deleteBtn {
    background: #ffe9e9;
    color: #b42318;
  }

  @media (max-width: 900px) {
    .page {
      padding: 18px;
    }

    .navbar {
      height: auto;
      align-items: flex-start;
      flex-direction: column;
    }

    .navActions {
      justify-content: flex-start;
    }

    .hero,
    .listingTop {
      grid-template-columns: 1fr;
    }

    h1 {
      font-size: 42px;
    }

    .statsGrid,
    .detailsGrid,
    .sellerGrid {
      grid-template-columns: 1fr;
    }

    .imageStrip {
      grid-template-columns: repeat(2, 1fr);
    }

    .imageStrip img {
      height: 170px;
    }
  }
`;

"use client";

import { useEffect, useMemo, useState } from "react";

const VALID_STATUSES = ["pending", "approved", "sold", "rejected"];

function normaliseStatus(status) {
  const cleaned = String(status || "pending").trim().toLowerCase();
  return VALID_STATUSES.includes(cleaned) ? cleaned : "pending";
}

function formatMoney(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) return "Not set";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatMileage(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) return "Not set";

  return `${new Intl.NumberFormat("en-GB").format(number)} miles`;
}

function formatDate(value) {
  if (!value) return "Not set";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseImageField(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
    } catch {
      return [value];
    }
  }

  return [];
}

function getPhotos(listing) {
  const images = [
    ...parseImageField(listing.image_url),
    ...parseImageField(listing.photo_url),
    ...parseImageField(listing.main_photo_url),
    ...parseImageField(listing.cover_image_url),
    ...parseImageField(listing.photos),
    ...parseImageField(listing.photo_urls),
    ...parseImageField(listing.images),
    ...parseImageField(listing.image_urls),
  ];

  return [...new Set(images)].filter(Boolean);
}

function getListingTitle(listing) {
  if (listing.title) return listing.title;

  return (
    [listing.year, listing.make, listing.model, listing.model_detail]
      .filter(Boolean)
      .join(" ") || "Untitled listing"
  );
}

function isListingFeatured(listing) {
  const rawFeatured = String(listing?.is_featured ?? "").toLowerCase();
  const markedFeatured =
    listing?.is_featured === true ||
    rawFeatured === "true" ||
    Number(listing?.featured_rank || 0) > 0 ||
    Boolean(listing?.boosted_at);

  if (!markedFeatured) return false;

  if (!listing?.featured_until) return true;

  const until = new Date(listing.featured_until).getTime();

  return Number.isFinite(until) && until > Date.now();
}

function getSearchText(listing) {
  return [
    listing.id,
    listing.title,
    listing.make,
    listing.model,
    listing.model_detail,
    listing.year,
    listing.location,
    listing.body_type,
    listing.fuel_type,
    listing.gearbox,
    listing.seller_name,
    listing.seller_email,
    listing.account_email,
    listing.seller_phone,
    listing.status,
    listing.price,
    listing.asking_price,
    listing.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function AdminListingsPage() {
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState("approved");
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedPassword = localStorage.getItem("kerbAdminPassword");

    if (storedPassword) {
      setSavedPassword(storedPassword);
      fetchListings(storedPassword);
    }
  }, []);

  async function fetchListings(adminPassword = savedPassword) {
    if (!adminPassword) return;

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

  function handleLogin(event) {
    event.preventDefault();

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

  async function updateListing(id, payload, fallbackError = "Could not update listing.") {
    setIsUpdatingId(id);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": savedPassword,
        },
        body: JSON.stringify({ id, ...payload }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || fallbackError);
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
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsUpdatingId("");
    }
  }

  async function updateStatus(id, status) {
    const cleanStatus = normaliseStatus(status);
    const payload = { status: cleanStatus };

    if (cleanStatus === "rejected") {
      payload.moderation_reason =
        window.prompt("Reason shown to seller:", "Listing needs changes") ||
        "Listing needs changes";
      payload.moderation_note =
        window.prompt("Optional internal note:", "") || "";
    }

    await updateListing(id, payload);
  }

  async function boostListing(id) {
    const days = window.prompt("Boost for how many days?", "14");

    if (days === null) return;

    const rank = window.prompt(
      "Featured rank? Higher ranks appear first. Use 100 for normal boosts.",
      "100"
    );

    if (rank === null) return;

    await updateListing(
      id,
      {
        action: "boost",
        days,
        rank,
      },
      "Could not boost listing."
    );
  }

  async function unboostListing(id) {
    const confirmed = window.confirm("Remove this listing from featured results?");

    if (!confirmed) return;

    await updateListing(id, { action: "unboost" }, "Could not remove boost.");
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

  function submitSearch(event) {
    event.preventDefault();
    setSearchTerm(searchDraft.trim().toLowerCase());
  }

  function clearSearch() {
    setSearchDraft("");
    setSearchTerm("");
  }

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
      featured: listings.filter(isListingFeatured).length,
    };
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const status = normaliseStatus(listing.status);

      if (filter === "featured" && !isListingFeatured(listing)) return false;
      if (filter !== "all" && filter !== "featured" && status !== filter) {
        return false;
      }

      if (searchTerm && !getSearchText(listing).includes(searchTerm)) {
        return false;
      }

      return true;
    });
  }, [listings, filter, searchTerm]);

  if (!savedPassword) {
    return (
      <main className="page">
        <a href="/" className="logo">
          Kerb
        </a>

        <section className="loginCard">
          <div className="pill">Admin access</div>
          <h1>Kerb listings admin</h1>
          <p>Enter your admin password to review, search and boost car listings.</p>

          <form onSubmit={handleLogin}>
            <label>
              Admin password
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {errorMessage && <div className="errorBox">{errorMessage}</div>}

            <button className="primaryBtn" type="submit">
              Open admin
            </button>
          </form>
        </section>

        <style jsx global>{styles}</style>
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

          <a className="secondaryLink" href="/admin/reports">
            Reports dashboard
          </a>

          <button className="secondaryBtn" onClick={() => fetchListings()}>
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
          <h1>Manage Kerb listings</h1>
          <p>
            Search listings, approve submissions, handle reports, mark cars as sold and manually
            boost cars into the featured positions.
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
            <span>Featured</span>
            <strong>{counts.featured}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{counts.all}</strong>
          </div>
        </div>
      </section>

      <section className="toolbar">
        <div className="filters">
          {[
            ["pending", `Pending (${counts.pending})`],
            ["approved", `Approved (${counts.approved})`],
            ["featured", `Featured (${counts.featured})`],
            ["sold", `Sold (${counts.sold})`],
            ["rejected", `Rejected (${counts.rejected})`],
            ["all", `All (${counts.all})`],
          ].map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <form className="adminSearch" onSubmit={submitSearch}>
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search by make, model, email, location, phone, ID..."
          />
          <button type="submit">Search</button>
          {(searchDraft || searchTerm) && (
            <button type="button" className="clearSearch" onClick={clearSearch}>
              Clear
            </button>
          )}
        </form>
      </section>

      {searchTerm && (
        <div className="searchNote">
          Showing {filteredListings.length} result
          {filteredListings.length === 1 ? "" : "s"} for “{searchTerm}”.
        </div>
      )}

      {errorMessage && <div className="errorBox">{errorMessage}</div>}

      {isLoading ? (
        <div className="emptyBox">Loading listings...</div>
      ) : filteredListings.length === 0 ? (
        <div className="emptyBox">
          <h2>No listings found</h2>
          <p>Try a different status filter or search term.</p>
        </div>
      ) : (
        <section className="listingsGrid">
          {filteredListings.map((listing) => {
            const photos = getPhotos(listing);
            const status = normaliseStatus(listing.status);
            const isBusy = isUpdatingId === listing.id;
            const featured = isListingFeatured(listing);

            return (
              <article className="listingCard" key={listing.id}>
                <div className="imageStrip">
                  {photos.length > 0 ? (
                    photos.slice(0, 4).map((url, index) => (
                      <img key={`${url}-${index}`} src={url} alt="Car" />
                    ))
                  ) : (
                    <div className="noImage">No photos</div>
                  )}
                </div>

                <div className="listingContent">
                  <div className="listingTop">
                    <div>
                      <div className="badgeRow">
                        <span className={`status ${status}`}>{status}</span>
                        {featured && <span className="featuredBadge">Featured</span>}
                      </div>

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
                      <strong>{formatMileage(listing.mileage || listing.miles)}</strong>
                    </div>
                    <div>
                      <span>Fuel</span>
                      <strong>{listing.fuel_type || listing.fuel || "Not set"}</strong>
                    </div>
                    <div>
                      <span>Gearbox</span>
                      <strong>
                        {listing.gearbox || listing.transmission || "Not set"}
                      </strong>
                    </div>
                    <div>
                      <span>Location</span>
                      <strong>{listing.location || listing.city || "Not set"}</strong>
                    </div>
                    <div>
                      <span>Seller</span>
                      <strong>
                        {listing.seller_name ||
                          listing.account_name ||
                          listing.seller_email ||
                          listing.account_email ||
                          "Not set"}
                      </strong>
                    </div>
                    <div>
                      <span>Featured until</span>
                      <strong>{featured ? formatDate(listing.featured_until) : "Not boosted"}</strong>
                    </div>
                  </div>

                  {status === "rejected" && listing.moderation_reason && (
                    <div className="moderationBox">
                      <strong>{listing.moderation_reason}</strong>
                      {listing.moderation_note && <p>{listing.moderation_note}</p>}
                    </div>
                  )}

                  <div className="actions">
                    <a href={`/listing/${listing.id}`} target="_blank">
                      View
                    </a>
                    <a href={`/listing/${listing.id}/edit`} target="_blank">
                      Edit
                    </a>

                    {status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(listing.id, "approved")}
                        disabled={isBusy}
                      >
                        Approve
                      </button>
                    )}

                    {status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(listing.id, "rejected")}
                        disabled={isBusy}
                      >
                        Reject
                      </button>
                    )}

                    {status !== "sold" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(listing.id, "sold")}
                        disabled={isBusy}
                      >
                        Mark sold
                      </button>
                    )}

                    {featured ? (
                      <button
                        type="button"
                        className="unboostBtn"
                        onClick={() => unboostListing(listing.id)}
                        disabled={isBusy}
                      >
                        Remove boost
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="boostBtn"
                        onClick={() => boostListing(listing.id)}
                        disabled={isBusy || status === "sold"}
                      >
                        Boost
                      </button>
                    )}

                    <button
                      type="button"
                      className="dangerBtn"
                      onClick={() => deleteListing(listing.id)}
                      disabled={isBusy}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <style jsx global>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: #f7f9fd;
    color: #10162f;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  a { color: inherit; text-decoration: none; }

  button, input { font-family: inherit; }

  .page {
    min-height: 100vh;
    padding: 26px 40px 50px;
    background:
      radial-gradient(circle at top left, rgba(0, 72, 255, 0.07), transparent 31%),
      #f7f9fd;
  }

  .logo {
    color: #0b4bff;
    font-size: 42px;
    font-weight: 1000;
    letter-spacing: -0.08em;
  }

  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  .navActions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .secondaryLink, .secondaryBtn, .ghostBtn, .primaryBtn {
    border: 0;
    border-radius: 16px;
    padding: 13px 16px;
    font-weight: 950;
    cursor: pointer;
  }

  .secondaryLink, .secondaryBtn {
    background: white;
    border: 1px solid #dfe7f7;
    color: #142044;
  }

  .ghostBtn {
    background: transparent;
    color: #dc2626;
  }

  .primaryBtn {
    background: #0b4bff;
    color: white;
    width: 100%;
  }

  .pill {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    background: #eaf1ff;
    color: #0b4bff;
    padding: 8px 12px;
    font-weight: 950;
    font-size: 13px;
  }

  .loginCard, .hero, .toolbar, .emptyBox, .listingCard, .errorBox, .searchNote {
    border: 1px solid #dfe7f7;
    background: rgba(255, 255, 255, 0.94);
    border-radius: 26px;
    box-shadow: 0 18px 45px rgba(19, 34, 79, 0.07);
  }

  .loginCard {
    max-width: 520px;
    margin: 70px auto;
    padding: 32px;
  }

  .loginCard h1, .hero h1 {
    margin: 14px 0 10px;
    letter-spacing: -0.05em;
  }

  .loginCard p, .hero p, .emptyBox p, .listingTop p {
    color: #66708d;
    line-height: 1.6;
  }

  form label {
    display: grid;
    gap: 8px;
    color: #64708f;
    font-weight: 900;
    margin: 20px 0;
  }

  input {
    border: 1px solid #dce5f7;
    border-radius: 16px;
    min-height: 48px;
    padding: 0 15px;
    color: #10162f;
    font-weight: 850;
    outline: none;
    background: white;
  }

  input:focus {
    border-color: #0b4bff;
    box-shadow: 0 0 0 4px rgba(11, 75, 255, 0.1);
  }

  .hero {
    padding: 28px;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 24px;
    align-items: center;
    margin-bottom: 18px;
  }

  .hero h1 {
    font-size: clamp(34px, 5vw, 62px);
  }

  .statsGrid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .statsGrid div {
    border-radius: 20px;
    background: #f4f7ff;
    border: 1px solid #e2eaf9;
    padding: 16px;
  }

  .statsGrid span {
    color: #64708f;
    font-weight: 900;
    font-size: 13px;
  }

  .statsGrid strong {
    display: block;
    font-size: 28px;
    margin-top: 6px;
    letter-spacing: -0.04em;
  }

  .toolbar {
    padding: 16px;
    display: grid;
    gap: 14px;
    margin-bottom: 16px;
  }

  .filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .filters button {
    border: 1px solid #dfe7f7;
    background: white;
    color: #142044;
    border-radius: 999px;
    padding: 11px 14px;
    font-weight: 950;
    cursor: pointer;
  }

  .filters button.active {
    background: #0b4bff;
    color: white;
    border-color: #0b4bff;
  }

  .adminSearch {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 10px;
    align-items: center;
  }

  .adminSearch button {
    border: 0;
    border-radius: 15px;
    background: #0b4bff;
    color: white;
    font-weight: 950;
    padding: 14px 17px;
    cursor: pointer;
  }

  .adminSearch .clearSearch {
    background: #eff4ff;
    color: #0b4bff;
  }

  .searchNote, .errorBox, .emptyBox {
    padding: 18px;
    margin-bottom: 16px;
    font-weight: 850;
  }

  .errorBox {
    background: #fff1f2;
    border-color: #fecdd3;
    color: #b91c1c;
  }

  .emptyBox {
    text-align: center;
    padding: 38px;
  }

  .listingsGrid {
    display: grid;
    gap: 18px;
  }

  .listingCard {
    overflow: hidden;
  }

  .imageStrip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    min-height: 140px;
    background: #dfe7f7;
  }

  .imageStrip img {
    width: 100%;
    height: 160px;
    object-fit: cover;
  }

  .noImage {
    grid-column: 1 / -1;
    min-height: 140px;
    display: grid;
    place-items: center;
    color: #64708f;
    font-weight: 950;
  }

  .listingContent {
    padding: 22px;
  }

  .listingTop {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 18px;
    align-items: start;
  }

  .badgeRow {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .status, .featuredBadge {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 1000;
    text-transform: capitalize;
  }

  .status.pending { background: #fff7ed; color: #c2410c; }
  .status.approved { background: #ecfdf5; color: #047857; }
  .status.sold { background: #eef2ff; color: #4338ca; }
  .status.rejected { background: #fff1f2; color: #be123c; }

  .featuredBadge {
    background: #eaf1ff;
    color: #0b4bff;
  }

  .listingTop h2 {
    margin: 0 0 8px;
    font-size: 26px;
    letter-spacing: -0.04em;
  }

  .priceBox {
    border-radius: 20px;
    border: 1px solid #e2eaf9;
    background: #f7faff;
    padding: 16px;
    min-width: 180px;
  }

  .priceBox span, .detailsGrid span {
    color: #64708f;
    font-size: 12px;
    font-weight: 950;
  }

  .priceBox strong {
    display: block;
    margin-top: 5px;
    font-size: 24px;
  }

  .detailsGrid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 10px;
    margin-top: 18px;
  }

  .detailsGrid div {
    border-radius: 16px;
    background: #f4f7ff;
    border: 1px solid #e2eaf9;
    padding: 12px;
  }

  .detailsGrid strong {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    word-break: break-word;
  }

  .moderationBox {
    margin-top: 16px;
    border-radius: 18px;
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
    padding: 14px;
  }

  .moderationBox p {
    margin: 6px 0 0;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 20px;
  }

  .actions a, .actions button {
    border: 1px solid #dfe7f7;
    background: white;
    color: #142044;
    border-radius: 14px;
    padding: 11px 13px;
    font-weight: 950;
    cursor: pointer;
  }

  .actions .boostBtn {
    background: #0b4bff;
    color: white;
    border-color: #0b4bff;
  }

  .actions .unboostBtn {
    background: #eff4ff;
    color: #0b4bff;
    border-color: #bfdbfe;
  }

  .actions .dangerBtn {
    color: #dc2626;
    border-color: #fecaca;
  }

  .actions button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 980px) {
    .page { padding: 18px; }
    .hero { grid-template-columns: 1fr; }
    .statsGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .detailsGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .listingTop { grid-template-columns: 1fr; }
    .adminSearch { grid-template-columns: 1fr; }
    .imageStrip { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 620px) {
    .navbar { align-items: flex-start; flex-direction: column; }
    .navActions { width: 100%; }
    .secondaryLink, .secondaryBtn, .ghostBtn { width: 100%; text-align: center; }
    .statsGrid { grid-template-columns: 1fr; }
    .detailsGrid { grid-template-columns: 1fr; }
    .actions a, .actions button { width: 100%; text-align: center; }
  }
`;

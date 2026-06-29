"use client";

import { useEffect, useMemo, useState } from "react";

const REPORT_STATUSES = ["new", "reviewing", "actioned", "dismissed"];

function normaliseStatus(status) {
  const cleaned = String(status || "new").trim().toLowerCase();

  return REPORT_STATUSES.includes(cleaned) ? cleaned : "new";
}

function formatDate(value) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function getListingImage(listing) {
  if (!listing) return "";

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

  return [...new Set(images)].filter(Boolean)[0] || "";
}

function getListingTitle(report) {
  if (report?.listing_title) return report.listing_title;

  const listing = report?.listing;

  if (!listing) return "Listing not found";
  if (listing.title) return listing.title;

  return (
    [listing.year, listing.make, listing.model, listing.model_detail]
      .filter(Boolean)
      .join(" ") || "Untitled listing"
  );
}

function getReportSearchText(report) {
  const listing = report.listing || {};

  return [
    report.id,
    report.reason,
    report.details,
    report.status,
    report.reporter_email,
    report.admin_note,
    getListingTitle(report),
    listing.id,
    listing.make,
    listing.model,
    listing.year,
    listing.location,
    listing.seller_name,
    listing.seller_email,
    listing.account_email,
    listing.seller_phone,
    listing.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function AdminReportsPage() {
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState("new");
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedPassword = localStorage.getItem("kerbAdminPassword");

    if (storedPassword) {
      setSavedPassword(storedPassword);
      fetchReports(storedPassword);
    }
  }, []);

  async function fetchReports(adminPassword = savedPassword) {
    if (!adminPassword) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/reports?status=all", {
        headers: {
          "x-admin-password": adminPassword,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load reports.");
      }

      setReports(
        (result.reports || []).map((report) => ({
          ...report,
          status: normaliseStatus(report.status),
        }))
      );
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
    fetchReports(password.trim());
  }

  function handleLogout() {
    localStorage.removeItem("kerbAdminPassword");
    setSavedPassword("");
    setPassword("");
    setReports([]);
  }

  async function updateReport(id, payload, fallbackError = "Could not update report.") {
    setIsUpdatingId(id);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/reports", {
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

      const updatedReport = {
        ...result.report,
        status: normaliseStatus(result.report?.status),
      };

      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === id ? updatedReport : report
        )
      );
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsUpdatingId("");
    }
  }

  async function markReviewing(report) {
    await updateReport(report.id, { action: "review" });
  }

  async function dismissReport(report) {
    const note = window.prompt(
      "Optional admin note for dismissing this report:",
      "No action needed"
    );

    if (note === null) return;

    await updateReport(report.id, {
      action: "dismiss",
      admin_note: note,
    });
  }

  async function actionReport(report) {
    const note = window.prompt(
      "Optional admin note after handling this report:",
      "Handled by admin"
    );

    if (note === null) return;

    await updateReport(report.id, {
      action: "actioned",
      admin_note: note,
    });
  }

  async function removeListing(report) {
    const title = getListingTitle(report);
    const confirmed = window.confirm(
      `Remove this listing from public browse?\n\n${title}\n\nThis will set the listing status to rejected, not permanently delete it.`
    );

    if (!confirmed) return;

    const moderationNote =
      window.prompt(
        "Internal moderation note:",
        `Removed after report: ${report.reason || "Reported listing"}`
      ) || `Removed after report: ${report.reason || "Reported listing"}`;

    await updateReport(
      report.id,
      {
        action: "remove-listing",
        moderation_reason: "Reported listing removed",
        moderation_note: moderationNote,
      },
      "Could not remove listing."
    );
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
      all: reports.length,
      new: reports.filter((report) => normaliseStatus(report.status) === "new").length,
      reviewing: reports.filter(
        (report) => normaliseStatus(report.status) === "reviewing"
      ).length,
      actioned: reports.filter(
        (report) => normaliseStatus(report.status) === "actioned"
      ).length,
      dismissed: reports.filter(
        (report) => normaliseStatus(report.status) === "dismissed"
      ).length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const status = normaliseStatus(report.status);

      if (filter !== "all" && status !== filter) return false;
      if (searchTerm && !getReportSearchText(report).includes(searchTerm)) {
        return false;
      }

      return true;
    });
  }, [reports, filter, searchTerm]);

  if (!savedPassword) {
    return (
      <main className="page">
        <a href="/" className="logo">
          Kerb
        </a>

        <section className="loginCard">
          <div className="pill">Admin access</div>
          <h1>Kerb reports admin</h1>
          <p>Enter your admin password to review reported listings.</p>

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
              Open reports
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
          <a className="secondaryLink" href="/admin/listings">
            Listings admin
          </a>

          <a className="secondaryLink" href="/browse" target="_blank">
            View browse page
          </a>

          <button className="secondaryBtn" onClick={() => fetchReports()}>
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
          <h1>Reported listings</h1>
          <p>
            Review buyer reports, check the listing and either dismiss the report
            or remove the advert from public browse.
          </p>
        </div>

        <div className="statsGrid">
          <div>
            <span>New</span>
            <strong>{counts.new}</strong>
          </div>
          <div>
            <span>Reviewing</span>
            <strong>{counts.reviewing}</strong>
          </div>
          <div>
            <span>Actioned</span>
            <strong>{counts.actioned}</strong>
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
            ["new", `New (${counts.new})`],
            ["reviewing", `Reviewing (${counts.reviewing})`],
            ["actioned", `Actioned (${counts.actioned})`],
            ["dismissed", `Dismissed (${counts.dismissed})`],
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
            placeholder="Search reason, email, listing, seller, location..."
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
          Showing {filteredReports.length} result
          {filteredReports.length === 1 ? "" : "s"} for “{searchTerm}”.
        </div>
      )}

      {errorMessage && <div className="errorBox">{errorMessage}</div>}

      {isLoading ? (
        <div className="emptyBox">Loading reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="emptyBox">
          <h2>No reports found</h2>
          <p>Try a different status filter or search term.</p>
        </div>
      ) : (
        <section className="reportsGrid">
          {filteredReports.map((report) => {
            const listing = report.listing;
            const image = getListingImage(listing);
            const status = normaliseStatus(report.status);
            const isBusy = isUpdatingId === report.id;

            return (
              <article className="reportCard" key={report.id}>
                <div className="reportTop">
                  <div className="reportInfo">
                    <div className="badgeRow">
                      <span className={`status ${status}`}>{status}</span>
                      <span className="dateBadge">{formatDate(report.created_at)}</span>
                    </div>

                    <h2>{report.reason || "Reported listing"}</h2>
                    <p>{report.details || "No extra details were provided."}</p>
                  </div>

                  <div className="reporterBox">
                    <span>Reporter</span>
                    <strong>{report.reporter_email || "Not provided"}</strong>
                  </div>
                </div>

                <div className="listingPreview">
                  {image ? (
                    <img src={image} alt={getListingTitle(report)} />
                  ) : (
                    <div className="noImage">No photo</div>
                  )}

                  <div>
                    <span>Reported listing</span>
                    <h3>{getListingTitle(report)}</h3>
                    <p>
                      {listing
                        ? `${formatMoney(
                            listing.asking_price || listing.price || listing.listing_price
                          )} · ${listing.location || "Location not set"} · ${listing.status || "status not set"}`
                        : "This listing was not found or may have been deleted."}
                    </p>
                    {listing && (
                      <small>
                        Seller: {listing.seller_name || listing.account_name || "Not set"} · {listing.seller_email || listing.account_email || "No email"}
                      </small>
                    )}
                  </div>
                </div>

                {report.admin_note && (
                  <div className="adminNote">
                    <strong>Admin note</strong>
                    <p>{report.admin_note}</p>
                  </div>
                )}

                <div className="actions">
                  {listing && (
                    <a href={`/listing/${listing.id}`} target="_blank">
                      View listing
                    </a>
                  )}

                  {status !== "reviewing" && status === "new" && (
                    <button
                      type="button"
                      onClick={() => markReviewing(report)}
                      disabled={isBusy}
                    >
                      Mark reviewing
                    </button>
                  )}

                  {status !== "dismissed" && (
                    <button
                      type="button"
                      onClick={() => dismissReport(report)}
                      disabled={isBusy}
                    >
                      Dismiss report
                    </button>
                  )}

                  {status !== "actioned" && (
                    <button
                      type="button"
                      onClick={() => actionReport(report)}
                      disabled={isBusy}
                    >
                      Mark actioned
                    </button>
                  )}

                  {listing && listing.status !== "rejected" && (
                    <button
                      type="button"
                      className="dangerBtn"
                      onClick={() => removeListing(report)}
                      disabled={isBusy}
                    >
                      Remove listing
                    </button>
                  )}
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

  .loginCard, .hero, .toolbar, .emptyBox, .reportCard, .errorBox, .searchNote {
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

  .loginCard p, .hero p, .emptyBox p, .reportInfo p, .listingPreview p, .adminNote p {
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
    text-transform: capitalize;
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

  .reportsGrid {
    display: grid;
    gap: 18px;
  }

  .reportCard {
    padding: 22px;
  }

  .reportTop {
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

  .status, .dateBadge {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 1000;
    text-transform: capitalize;
  }

  .status.new { background: #fff7ed; color: #c2410c; }
  .status.reviewing { background: #eaf1ff; color: #0b4bff; }
  .status.actioned { background: #ecfdf5; color: #047857; }
  .status.dismissed { background: #f1f5f9; color: #475569; }

  .dateBadge {
    background: #f4f7ff;
    color: #64708f;
  }

  .reportInfo h2 {
    margin: 0 0 8px;
    font-size: 28px;
    letter-spacing: -0.04em;
  }

  .reporterBox {
    border-radius: 20px;
    border: 1px solid #e2eaf9;
    background: #f7faff;
    padding: 16px;
    min-width: 230px;
  }

  .reporterBox span, .listingPreview span {
    color: #64708f;
    font-size: 12px;
    font-weight: 950;
  }

  .reporterBox strong {
    display: block;
    margin-top: 5px;
    font-size: 14px;
    word-break: break-word;
  }

  .listingPreview {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 16px;
    align-items: center;
    margin-top: 18px;
    border-radius: 22px;
    background: #f4f7ff;
    border: 1px solid #e2eaf9;
    padding: 14px;
  }

  .listingPreview img, .noImage {
    width: 100%;
    height: 120px;
    border-radius: 16px;
    object-fit: cover;
    background: #dfe7f7;
  }

  .noImage {
    display: grid;
    place-items: center;
    color: #64708f;
    font-weight: 950;
  }

  .listingPreview h3 {
    margin: 5px 0 6px;
    font-size: 24px;
    letter-spacing: -0.04em;
  }

  .listingPreview small {
    color: #64708f;
    font-weight: 850;
    word-break: break-word;
  }

  .adminNote {
    margin-top: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 14px;
  }

  .adminNote p {
    margin: 5px 0 0;
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

  .actions .dangerBtn {
    color: #dc2626;
    border-color: #fecaca;
    background: #fff7f7;
  }

  .actions button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 980px) {
    .page { padding: 18px; }
    .hero { grid-template-columns: 1fr; }
    .statsGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .reportTop { grid-template-columns: 1fr; }
    .adminSearch { grid-template-columns: 1fr; }
    .listingPreview { grid-template-columns: 1fr; }
    .listingPreview img, .noImage { height: 180px; }
    .reporterBox { min-width: 0; }
  }

  @media (max-width: 620px) {
    .navbar { align-items: flex-start; flex-direction: column; }
    .navActions { width: 100%; }
    .secondaryLink, .secondaryBtn, .ghostBtn { width: 100%; text-align: center; }
    .statsGrid { grid-template-columns: 1fr; }
    .actions a, .actions button { width: 100%; text-align: center; }
  }
`;

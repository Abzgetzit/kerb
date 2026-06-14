"use client";

import { useEffect, useMemo, useState } from "react";

const VALID_STATUSES = ["new", "contacted", "closed"];

function normaliseStatus(status) {
  const cleaned = String(status || "new").trim().toLowerCase();
  return VALID_STATUSES.includes(cleaned) ? cleaned : "new";
}

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

export default function AdminEnquiriesPage() {
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState("new");

  useEffect(() => {
    const storedPassword = localStorage.getItem("kerbAdminPassword");

    if (storedPassword) {
      setSavedPassword(storedPassword);
      fetchEnquiries(storedPassword);
    }
  }, []);

  async function fetchEnquiries(adminPassword) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/enquiries", {
        headers: {
          "x-admin-password": adminPassword,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load enquiries.");
      }

      const cleanedEnquiries = (result.enquiries || []).map((enquiry) => ({
        ...enquiry,
        status: normaliseStatus(enquiry.status),
      }));

      setEnquiries(cleanedEnquiries);
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
    fetchEnquiries(password.trim());
  }

  function handleLogout() {
    localStorage.removeItem("kerbAdminPassword");
    setSavedPassword("");
    setPassword("");
    setEnquiries([]);
  }

  async function updateStatus(id, status) {
    const cleanStatus = normaliseStatus(status);

    setIsUpdatingId(id);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": savedPassword,
        },
        body: JSON.stringify({ id, status: cleanStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not update enquiry.");
      }

      const updatedEnquiry = {
        ...result.enquiry,
        status: normaliseStatus(result.enquiry?.status),
      };

      setEnquiries((currentEnquiries) =>
        currentEnquiries.map((enquiry) =>
          enquiry.id === id ? updatedEnquiry : enquiry
        )
      );
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsUpdatingId("");
    }
  }

  async function deleteEnquiry(id) {
    const confirmed = window.confirm(
      "Delete this enquiry permanently? This cannot be undone."
    );

    if (!confirmed) return;

    setIsUpdatingId(id);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/enquiries", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": savedPassword,
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not delete enquiry.");
      }

      setEnquiries((currentEnquiries) =>
        currentEnquiries.filter((enquiry) => enquiry.id !== id)
      );
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsUpdatingId("");
    }
  }

  const filteredEnquiries = useMemo(() => {
    if (filter === "all") return enquiries;

    return enquiries.filter(
      (enquiry) => normaliseStatus(enquiry.status) === filter
    );
  }, [enquiries, filter]);

  const counts = useMemo(() => {
    return {
      all: enquiries.length,
      new: enquiries.filter(
        (enquiry) => normaliseStatus(enquiry.status) === "new"
      ).length,
      contacted: enquiries.filter(
        (enquiry) => normaliseStatus(enquiry.status) === "contacted"
      ).length,
      closed: enquiries.filter(
        (enquiry) => normaliseStatus(enquiry.status) === "closed"
      ).length,
    };
  }, [enquiries]);

  if (!savedPassword) {
    return (
      <main className="page">
        <a href="/" className="logo">
          Kerb
        </a>

        <section className="loginCard">
          <div className="pill">Admin access</div>
          <h1>Kerb enquiries admin</h1>
          <p>Enter your admin password to view buyer enquiries.</p>

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
              Open enquiries
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
          <a className="secondaryLink" href="/admin">
            Listings admin
          </a>

          <a className="secondaryLink" href="/browse" target="_blank">
            View browse
          </a>

          <button
            className="secondaryBtn"
            onClick={() => fetchEnquiries(savedPassword)}
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
          <div className="pill">Enquiry inbox</div>
          <h1>Buyer enquiries</h1>
          <p>
            View messages from buyers, contact them back, then mark the enquiry
            as contacted or closed.
          </p>
        </div>

        <div className="statsGrid">
          <div>
            <span>New</span>
            <strong>{counts.new}</strong>
          </div>
          <div>
            <span>Contacted</span>
            <strong>{counts.contacted}</strong>
          </div>
          <div>
            <span>Closed</span>
            <strong>{counts.closed}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{counts.all}</strong>
          </div>
        </div>
      </section>

      <section className="filters">
        <button
          className={filter === "new" ? "active" : ""}
          onClick={() => setFilter("new")}
        >
          New ({counts.new})
        </button>

        <button
          className={filter === "contacted" ? "active" : ""}
          onClick={() => setFilter("contacted")}
        >
          Contacted ({counts.contacted})
        </button>

        <button
          className={filter === "closed" ? "active" : ""}
          onClick={() => setFilter("closed")}
        >
          Closed ({counts.closed})
        </button>

        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All ({counts.all})
        </button>
      </section>

      {errorMessage && <div className="errorBox">{errorMessage}</div>}

      {isLoading ? (
        <div className="emptyBox">Loading enquiries...</div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="emptyBox">
          <h2>No enquiries found</h2>
          <p>There are no enquiries in this section yet.</p>
        </div>
      ) : (
        <section className="enquiriesGrid">
          {filteredEnquiries.map((enquiry) => {
            const status = normaliseStatus(enquiry.status);
            const isBusy = isUpdatingId === enquiry.id;

            return (
              <article className="enquiryCard" key={enquiry.id}>
                <div className="enquiryHeader">
                  <div>
                    <span className={`status ${status}`}>{status}</span>

                    <h2>{enquiry.listing_title || "Kerb listing"}</h2>

                    <p>
                      Sent by{" "}
                      <strong>{enquiry.buyer_name || "Unknown buyer"}</strong>{" "}
                      on {formatDate(enquiry.created_at)}
                    </p>
                  </div>

                  <a
                    className="viewListing"
                    href={`/listing/${enquiry.listing_id}`}
                    target="_blank"
                  >
                    View listing
                  </a>
                </div>

                <div className="messageBox">
                  <span>Buyer message</span>
                  <p>{enquiry.message || "No message provided."}</p>
                </div>

                <div className="detailsGrid">
                  <div>
                    <span>Buyer name</span>
                    <strong>{enquiry.buyer_name || "Not set"}</strong>
                  </div>

                  <div>
                    <span>Buyer email</span>
                    <strong>{enquiry.buyer_email || "Not set"}</strong>
                  </div>

                  <div>
                    <span>Buyer phone</span>
                    <strong>{enquiry.buyer_phone || "Not set"}</strong>
                  </div>

                  <div>
                    <span>Seller email</span>
                    <strong>{enquiry.seller_email || "Not set"}</strong>
                  </div>

                  <div>
                    <span>Seller phone</span>
                    <strong>{enquiry.seller_phone || "Not set"}</strong>
                  </div>

                  <div>
                    <span>Created</span>
                    <strong>{formatDate(enquiry.created_at)}</strong>
                  </div>
                </div>

                <div className="quickActions">
                  {enquiry.buyer_email && (
                    <a
                      className="emailBtn"
                      href={`mailto:${enquiry.buyer_email}?subject=Kerb enquiry about ${encodeURIComponent(
                        enquiry.listing_title || "your car"
                      )}`}
                    >
                      Reply by email
                    </a>
                  )}

                  {enquiry.buyer_phone && (
                    <a className="phoneBtn" href={`tel:${enquiry.buyer_phone}`}>
                      Call buyer
                    </a>
                  )}
                </div>

                <div className="actionRow">
                  <button
                    className="newBtn"
                    disabled={isBusy}
                    onClick={() => updateStatus(enquiry.id, "new")}
                  >
                    Mark new
                  </button>

                  <button
                    className="contactedBtn"
                    disabled={isBusy}
                    onClick={() => updateStatus(enquiry.id, "contacted")}
                  >
                    Mark contacted
                  </button>

                  <button
                    className="closedBtn"
                    disabled={isBusy}
                    onClick={() => updateStatus(enquiry.id, "closed")}
                  >
                    Mark closed
                  </button>

                  <button
                    className="deleteBtn"
                    disabled={isBusy}
                    onClick={() => deleteEnquiry(enquiry.id)}
                  >
                    Delete enquiry
                  </button>
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
    min-height: 58px;
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

  .enquiriesGrid {
    display: grid;
    gap: 22px;
  }

  .enquiryCard {
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 26px;
    padding: 26px;
    box-shadow: 0 12px 34px rgba(10, 20, 40, 0.06);
  }

  .enquiryHeader {
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

  .status.new {
    background: #fff7e8;
    color: #a15c00;
  }

  .status.contacted {
    background: #eef3ff;
    color: #0048ff;
  }

  .status.closed {
    background: #eafaf0;
    color: #137333;
  }

  .enquiryHeader h2 {
    margin: 0 0 8px;
    font-size: 30px;
    letter-spacing: -1px;
  }

  .enquiryHeader p strong {
    color: #071126;
  }

  .viewListing {
    background: #eef3ff;
    color: #0048ff;
    border-radius: 14px;
    padding: 13px 18px;
    text-decoration: none;
    font-weight: 900;
    white-space: nowrap;
  }

  .messageBox {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 18px;
    padding: 18px;
    margin-bottom: 16px;
  }

  .messageBox span,
  .detailsGrid span {
    display: block;
    color: #657189;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 6px;
  }

  .messageBox p {
    color: #172033;
    font-weight: 700;
  }

  .detailsGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .detailsGrid div {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 14px;
    padding: 14px;
  }

  .detailsGrid strong {
    font-size: 14px;
    color: #172033;
    word-break: break-word;
  }

  .quickActions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    border-top: 1px solid #edf1f7;
    margin-top: 22px;
    padding-top: 22px;
  }

  .quickActions a {
    border-radius: 12px;
    padding: 12px 18px;
    font-weight: 900;
    text-decoration: none;
  }

  .emailBtn {
    background: #0048ff;
    color: white;
  }

  .phoneBtn {
    background: #eef3ff;
    color: #0048ff;
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

  .newBtn {
    background: #fff3da;
    color: #a15c00;
  }

  .contactedBtn {
    background: #0048ff;
    color: white;
  }

  .closedBtn {
    background: #eafaf0;
    color: #137333;
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
    .enquiryHeader {
      grid-template-columns: 1fr;
    }

    h1 {
      font-size: 42px;
    }

    .statsGrid,
    .detailsGrid {
      grid-template-columns: 1fr;
    }
  }
`;

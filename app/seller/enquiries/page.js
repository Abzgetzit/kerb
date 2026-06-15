"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

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

function normaliseStatus(status) {
  const clean = String(status || "new").trim().toLowerCase();
  return ["new", "contacted", "closed"].includes(clean) ? clean : "new";
}

export default function SellerEnquiriesPage() {
  const [session, setSession] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setErrorMessage("Supabase environment variables are missing.");
        setIsLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const currentSession = data.session || null;

      setSession(currentSession);

      if (!currentSession) {
        setIsLoading(false);
        return;
      }

      await fetchEnquiries(currentSession.access_token);
    }

    load();

    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession || null);

      if (currentSession) {
        fetchEnquiries(currentSession.access_token);
      } else {
        setEnquiries([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchEnquiries(token) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/seller/enquiries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load enquiries.");
      }

      setEnquiries(result.enquiries || []);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(id, status) {
    if (!session?.access_token) return;

    setUpdatingId(id);
    setErrorMessage("");

    try {
      const response = await fetch("/api/seller/enquiries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not update enquiry.");
      }

      setEnquiries((current) =>
        current.map((enquiry) =>
          enquiry.id === id ? result.enquiry : enquiry
        )
      );
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setUpdatingId("");
    }
  }

  async function handleLogout() {
    if (!supabase) return;

    await supabase.auth.signOut();
    setSession(null);
    setEnquiries([]);
  }

  if (!session && !isLoading) {
    return (
      <main className="page">
        <section className="emptyCard">
          <Link href="/" className="logo">
            Kerb
          </Link>

          <h1>Sign in required</h1>

          <p>You need to sign in with your seller email to view enquiries.</p>

          <Link href="/login" className="primaryLink">
            Sign in
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
          <Link href="/account/enquiries">Buyer enquiries</Link>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <div className="pill">Seller account</div>

          <h1>Seller enquiries</h1>

          <p>
            These are enquiries received on listings using{" "}
            <strong>{session?.user?.email}</strong> as the seller email.
          </p>
        </div>

        <div className="statBox">
          <span>Total received</span>
          <strong>{enquiries.length}</strong>
        </div>
      </section>

      {errorMessage && <div className="errorBox">{errorMessage}</div>}

      {isLoading ? (
        <div className="emptyBox">Loading seller enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div className="emptyBox">
          <h2>No seller enquiries yet</h2>
          <p>
            Enquiries will appear here when buyers message cars listed with your
            email address.
          </p>
        </div>
      ) : (
        <section className="grid">
          {enquiries.map((enquiry) => {
            const status = normaliseStatus(enquiry.status);
            const isBusy = updatingId === enquiry.id;

            return (
              <article className="card" key={enquiry.id}>
                <div className="cardHeader">
                  <div>
                    <span className={`status ${status}`}>{status}</span>
                    <h2>{enquiry.listing_title || "Kerb listing"}</h2>
                    <p>Received {formatDate(enquiry.created_at)}</p>
                  </div>

                  <Link href={`/listing/${enquiry.listing_id}`}>
                    View listing
                  </Link>
                </div>

                <div className="messageBox">
                  <span>Buyer message</span>
                  <p>{enquiry.message || "No message provided."}</p>
                </div>

                <div className="details">
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
                </div>

                <div className="actions">
                  {enquiry.buyer_email && (
                    <a
                      className="replyButton"
                      href={`mailto:${enquiry.buyer_email}?subject=Kerb enquiry about ${encodeURIComponent(
                        enquiry.listing_title || "your car"
                      )}`}
                    >
                      Reply by email
                    </a>
                  )}

                  {enquiry.buyer_phone && (
                    <a className="callButton" href={`tel:${enquiry.buyer_phone}`}>
                      Call buyer
                    </a>
                  )}

                  <button
                    type="button"
                    disabled={isBusy}
                    className="contactedButton"
                    onClick={() => updateStatus(enquiry.id, "contacted")}
                  >
                    Mark contacted
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    className="closedButton"
                    onClick={() => updateStatus(enquiry.id, "closed")}
                  >
                    Mark closed
                  </button>
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
    grid-template-columns: 1fr 230px;
    gap: 22px;
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 30px;
    padding: 42px;
    box-shadow: 0 16px 50px rgba(20, 35, 70, 0.08);
    margin-bottom: 24px;
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

  p {
    color: #59657a;
    line-height: 1.6;
    margin: 0;
  }

  p strong {
    color: #071126;
  }

  .statBox {
    background: #eef3ff;
    border: 1px solid #d7e4ff;
    border-radius: 22px;
    padding: 22px;
    display: grid;
    align-content: center;
  }

  .statBox span {
    color: #59657a;
    font-weight: 900;
    margin-bottom: 8px;
  }

  .statBox strong {
    color: #0048ff;
    font-size: 44px;
  }

  .grid {
    display: grid;
    gap: 18px;
  }

  .card,
  .emptyBox,
  .emptyCard {
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 24px;
    padding: 26px;
    box-shadow: 0 12px 34px rgba(10, 20, 40, 0.06);
  }

  .emptyCard {
    max-width: 620px;
    margin: 100px auto;
  }

  .cardHeader {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 18px;
    align-items: start;
    margin-bottom: 18px;
  }

  .cardHeader h2 {
    margin: 0 0 8px;
    font-size: 28px;
    letter-spacing: -0.8px;
  }

  .cardHeader a,
  .primaryLink {
    background: #0048ff;
    color: white;
    border-radius: 13px;
    padding: 13px 18px;
    font-weight: 950;
    text-decoration: none;
    white-space: nowrap;
    display: inline-flex;
    width: fit-content;
    margin-top: 18px;
  }

  .cardHeader a {
    margin-top: 0;
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

  .messageBox {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 18px;
    padding: 18px;
    margin-bottom: 16px;
  }

  .messageBox span,
  .details span {
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

  .details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .details div {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 14px;
    padding: 14px;
  }

  .details strong {
    word-break: break-word;
    font-size: 14px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    border-top: 1px solid #edf1f7;
    margin-top: 22px;
    padding-top: 22px;
  }

  .actions a,
  .actions button {
    border: none;
    border-radius: 13px;
    padding: 13px 18px;
    font-weight: 950;
    text-decoration: none;
    cursor: pointer;
  }

  .actions button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .replyButton {
    background: #0048ff;
    color: white;
  }

  .callButton {
    background: #eef3ff;
    color: #0048ff;
  }

  .contactedButton {
    background: #fff7e8;
    color: #a15c00;
  }

  .closedButton {
    background: #eafaf0;
    color: #137333;
  }

  .errorBox {
    background: #fff1f1;
    color: #b42318;
    border: 1px solid #ffd1d1;
    border-radius: 14px;
    padding: 14px 16px;
    font-weight: 850;
    margin-bottom: 18px;
  }

  @media (max-width: 800px) {
    .page {
      padding: 18px;
    }

    .navbar,
    .hero,
    .cardHeader {
      grid-template-columns: 1fr;
      flex-direction: column;
      align-items: flex-start;
    }

    .hero {
      display: grid;
    }

    h1 {
      font-size: 38px;
    }

    .details {
      grid-template-columns: 1fr;
    }
  }
`;

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteMenu from "../../components/SiteMenu";

function cleanText(value) {
  return String(value || "").trim();
}

function normaliseEmail(value) {
  return cleanText(value).toLowerCase();
}

function formatDate(value) {
  if (!value) return "";

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

function getTitle(listing, enquiry) {
  if (enquiry?.listing_title) return enquiry.listing_title;
  if (listing?.title) return listing.title;

  return (
    [listing?.year, listing?.make, listing?.model]
      .filter(Boolean)
      .join(" ")
      .trim() || "Kerb listing"
  );
}

function parseImageField(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [trimmed];
    } catch {
      return [trimmed];
    }
  }

  return [];
}

function getImage(listing) {
  const images = [
    ...parseImageField(listing?.image_url),
    ...parseImageField(listing?.photo_url),
    ...parseImageField(listing?.photos),
    ...parseImageField(listing?.photo_urls),
    ...parseImageField(listing?.images),
    ...parseImageField(listing?.image_urls),
  ];

  return images[0] || "/cars/hero-car.png";
}

function getKerbUser() {
  try {
    const savedUser = localStorage.getItem("kerbUser");

    if (savedUser) return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("kerbUser");
  }

  const savedEmail = localStorage.getItem("kerbAccountEmail");

  return savedEmail ? { email: savedEmail } : null;
}

export default function EnquiryConversationPage() {
  const params = useParams();
  const enquiryId = params?.id;
  const messagesEndRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  function handleLogout() {
    localStorage.removeItem("kerbSessionToken");
    localStorage.removeItem("kerbAccountEmail");
    localStorage.removeItem("kerbUser");
    window.dispatchEvent(new Event("kerb-auth-change"));
    window.location.href = "/";
  }

  async function loadThread() {
    setIsLoading(true);
    setErrorMessage("");

    const token = localStorage.getItem("kerbSessionToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`/api/enquiries/${enquiryId}/messages`, {
        headers: {
          "x-kerb-session-token": token,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load this conversation.");
      }

      setThread(result);
      setMessages(result.messages || []);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendReply(event) {
    event.preventDefault();
    setNotice("");
    setErrorMessage("");

    const token = localStorage.getItem("kerbSessionToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const message = reply.trim();

    if (!message) {
      setErrorMessage("Write a message before sending.");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`/api/enquiries/${enquiryId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kerb-session-token": token,
        },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not send your reply.");
      }

      setMessages((currentMessages) => [...currentMessages, result.message]);
      setThread((currentThread) => ({
        ...(currentThread || {}),
        enquiry: result.enquiry || currentThread?.enquiry,
      }));
      setReply("");
      setNotice("Reply sent.");
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    setCurrentUser(getKerbUser());

    if (enquiryId) {
      loadThread();
    }
  }, [enquiryId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const enquiry = thread?.enquiry || {};
  const listing = thread?.listing || {};
  const listingTitle = getTitle(listing, enquiry);
  const accountEmail = normaliseEmail(thread?.account_email);
  const isSeller = thread?.participant_role === "seller";
  const otherPartyName = isSeller
    ? enquiry.buyer_name || "Buyer"
    : listing.seller_name || enquiry.seller_email || "Seller";
  const otherPartyEmail = isSeller ? enquiry.buyer_email : enquiry.seller_email;
  const otherPartyPhone = isSeller ? enquiry.buyer_phone : enquiry.seller_phone;

  return (
    <main className="page">
      <header className="navbar">
        <Link href="/" className="logo">
          Kerb
        </Link>

        <div className="navActions">
          <Link href="/browse">Browse cars</Link>
          <Link href="/account">My account</Link>
        </div>

        <SiteMenu currentUser={currentUser} onLogout={handleLogout} />
      </header>

      {isLoading ? (
        <section className="stateBox">
          <h1>Loading conversation...</h1>
        </section>
      ) : errorMessage && !thread ? (
        <section className="stateBox">
          <h1>Could not open this chat</h1>
          <p>{errorMessage}</p>
          <Link href="/account">Back to account</Link>
        </section>
      ) : (
        <section className="chatShell">
          <div className="chatHeader">
            <Link href="/account" className="backLink">
              Back to account
            </Link>

            <div className="listingPreview">
              <Link href={`/listing/${enquiry.listing_id}`} className="listingImage">
                <img
                  src={getImage(listing)}
                  alt={listingTitle}
                  onError={(event) => {
                    event.currentTarget.src = "/cars/hero-car.png";
                  }}
                />
              </Link>

              <div>
                <span>{isSeller ? "Buyer conversation" : "Seller conversation"}</span>
                <h1>{listingTitle}</h1>
                <p>
                  {formatPrice(listing.price || listing.asking_price)}
                  {listing.location ? ` · ${listing.location}` : ""}
                </p>
              </div>

              <Link href={`/listing/${enquiry.listing_id}`} className="listingButton">
                View listing
              </Link>
            </div>
          </div>

          <div className="chatGrid">
            <aside className="sidePanel">
              <span>{isSeller ? "Buyer" : "Seller"}</span>
              <h2>{otherPartyName}</h2>
              <p>{otherPartyEmail || "Email not provided"}</p>

              {otherPartyPhone && (
                <a href={`tel:${otherPartyPhone}`}>{otherPartyPhone}</a>
              )}

              <div className="threadMeta">
                <div>
                  <span>Status</span>
                  <strong>{enquiry.status || "new"}</strong>
                </div>
                <div>
                  <span>Started</span>
                  <strong>{formatDate(enquiry.created_at)}</strong>
                </div>
              </div>
            </aside>

            <section className="conversationPanel">
              <div className="messagesList">
                {messages.map((message) => {
                  const isMine =
                    normaliseEmail(message.sender_email) === accountEmail;

                  return (
                    <article
                      className={`messageBubble ${isMine ? "mine" : "theirs"}`}
                      key={message.id}
                    >
                      <div>
                        <strong>
                          {isMine
                            ? "You"
                            : message.sender_name ||
                              (message.sender_role === "seller"
                                ? "Seller"
                                : "Buyer")}
                        </strong>
                        <span>{formatDate(message.created_at)}</span>
                      </div>
                      <p>{message.message}</p>
                    </article>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              <form className="replyBox" onSubmit={sendReply}>
                <label>
                  Reply to {otherPartyName}
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Write your reply..."
                    maxLength={1200}
                  />
                </label>

                {notice && <div className="noticeBox">{notice}</div>}
                {errorMessage && <div className="errorBox">{errorMessage}</div>}

                <button type="submit" disabled={isSending}>
                  {isSending ? "Sending..." : "Send reply"}
                </button>
              </form>
            </section>
          </div>
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

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  textarea {
    font-family: inherit;
  }

  button {
    cursor: pointer;
  }

  .page {
    min-height: 100vh;
    padding: 24px 36px 56px;
    background:
      radial-gradient(circle at top left, rgba(0, 72, 255, 0.06), transparent 34%),
      #f7f9fd;
  }

  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 22px;
    margin-bottom: 28px;
  }

  .logo {
    color: #0048ff;
    font-size: 46px;
    font-weight: 950;
    letter-spacing: -2px;
  }

  .navActions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
  }

  .navActions a {
    border: 1px solid #e0e6f2;
    border-radius: 999px;
    padding: 11px 16px;
    background: white;
    color: #172033;
    font-weight: 900;
  }

  .stateBox,
  .chatShell {
    max-width: 1180px;
    margin: 0 auto;
  }

  .stateBox {
    border: 1px solid #e0e6f2;
    border-radius: 24px;
    background: white;
    padding: 42px;
    box-shadow: 0 18px 54px rgba(10, 20, 40, 0.08);
  }

  .stateBox h1 {
    margin: 0 0 12px;
    font-size: 34px;
  }

  .stateBox p {
    color: #59657a;
    font-weight: 750;
  }

  .stateBox a,
  .listingButton,
  .replyBox button {
    border: none;
    border-radius: 14px;
    background: #0048ff;
    color: white;
    padding: 14px 18px;
    font-weight: 950;
    display: inline-flex;
    width: fit-content;
  }

  .backLink {
    display: inline-flex;
    color: #0048ff;
    font-weight: 950;
    margin-bottom: 16px;
  }

  .listingPreview {
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr) auto;
    align-items: center;
    gap: 20px;
    border: 1px solid #e0e6f2;
    border-radius: 24px;
    padding: 18px;
    background: white;
    box-shadow: 0 18px 54px rgba(10, 20, 40, 0.08);
  }

  .listingImage {
    height: 110px;
    border-radius: 18px;
    background: #eef2f7;
    overflow: hidden;
    border: 1px solid #e5eaf4;
  }

  .listingImage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .listingPreview span,
  .sidePanel > span,
  .threadMeta span,
  .replyBox label {
    color: #657189;
    font-size: 13px;
    font-weight: 950;
  }

  .listingPreview h1 {
    margin: 6px 0;
    font-size: clamp(28px, 4vw, 42px);
    letter-spacing: -1px;
  }

  .listingPreview p {
    margin: 0;
    color: #59657a;
    font-weight: 850;
  }

  .chatGrid {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 20px;
    margin-top: 20px;
  }

  .sidePanel,
  .conversationPanel {
    border: 1px solid #e0e6f2;
    border-radius: 24px;
    background: white;
    box-shadow: 0 18px 54px rgba(10, 20, 40, 0.08);
  }

  .sidePanel {
    padding: 24px;
    align-self: start;
    display: grid;
    gap: 12px;
  }

  .sidePanel h2 {
    margin: 0;
    font-size: 24px;
  }

  .sidePanel p {
    margin: 0;
    color: #59657a;
    font-weight: 800;
    word-break: break-word;
  }

  .sidePanel a {
    color: #0048ff;
    font-weight: 950;
  }

  .threadMeta {
    display: grid;
    gap: 10px;
    margin-top: 12px;
  }

  .threadMeta div {
    border: 1px solid #e5eaf4;
    border-radius: 16px;
    background: #f7f9fd;
    padding: 14px;
  }

  .threadMeta strong {
    display: block;
    margin-top: 5px;
    text-transform: capitalize;
  }

  .conversationPanel {
    overflow: hidden;
  }

  .messagesList {
    min-height: 420px;
    max-height: 62vh;
    overflow: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: #fbfcff;
  }

  .messageBubble {
    max-width: min(72%, 620px);
    border: 1px solid #e5eaf4;
    border-radius: 20px;
    padding: 15px 16px;
    background: white;
    box-shadow: 0 10px 26px rgba(10, 20, 40, 0.06);
  }

  .messageBubble.mine {
    margin-left: auto;
    background: #0048ff;
    color: white;
    border-color: #0048ff;
  }

  .messageBubble div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .messageBubble span {
    color: #7a8499;
    font-size: 12px;
    font-weight: 850;
    white-space: nowrap;
  }

  .messageBubble.mine span {
    color: rgba(255, 255, 255, 0.78);
  }

  .messageBubble p {
    margin: 0;
    line-height: 1.55;
    font-weight: 750;
    white-space: pre-wrap;
  }

  .replyBox {
    border-top: 1px solid #e0e6f2;
    padding: 18px;
    display: grid;
    gap: 12px;
    background: white;
  }

  .replyBox label {
    display: grid;
    gap: 9px;
  }

  .replyBox textarea {
    min-height: 120px;
    resize: vertical;
    border: 1px solid #dbe3f0;
    border-radius: 16px;
    padding: 14px;
    color: #071126;
    font-size: 16px;
    font-weight: 750;
    outline: none;
  }

  .replyBox textarea:focus {
    border-color: #0048ff;
    box-shadow: 0 0 0 4px rgba(0, 72, 255, 0.12);
  }

  .replyBox button {
    justify-content: center;
  }

  .replyBox button:disabled {
    opacity: 0.62;
    cursor: not-allowed;
  }

  .noticeBox,
  .errorBox {
    border-radius: 14px;
    padding: 12px 14px;
    font-weight: 900;
  }

  .noticeBox {
    background: #ecfdf3;
    color: #067647;
  }

  .errorBox {
    background: #fff1f1;
    color: #b42318;
  }

  @media (max-width: 900px) {
    .page {
      padding: 18px;
    }

    .navActions {
      display: none;
    }

    .listingPreview,
    .chatGrid {
      grid-template-columns: 1fr;
    }

    .listingImage {
      height: 190px;
    }

    .listingButton {
      width: 100%;
      justify-content: center;
    }

    .messagesList {
      min-height: 360px;
      max-height: none;
    }

    .messageBubble {
      max-width: 92%;
    }
  }

  @media (max-width: 520px) {
    .logo {
      font-size: 40px;
    }

    .listingPreview,
    .sidePanel,
    .replyBox {
      padding: 16px;
    }

    .messagesList {
      padding: 16px;
    }

    .messageBubble {
      max-width: 100%;
    }

    .messageBubble div {
      flex-direction: column;
      gap: 3px;
    }
  }
`;

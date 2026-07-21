"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import BoostListingButton from "./BoostListingButton";

function formatCount(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-GB").format(amount)
    : "0";
}

function formatPrice(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) return "POA";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMileage(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) return "Mileage TBC";
  return `${formatCount(amount)} miles`;
}

function formatDate(value) {
  if (!value) return "Date unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unknown";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getListingViews(listing) {
  return Number(listing?.analytics?.view_count ?? listing?.view_count ?? 0) || 0;
}

function getAnalyticsValue(listing, key) {
  return Number(listing?.analytics?.[key] || 0) || 0;
}

function getListingTitle(listing) {
  return (
    listing?.title ||
    [
      listing?.year,
      listing?.make,
      listing?.model,
      listing?.model_detail,
      listing?.variant,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Car listing"
  );
}

function parseImages(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    const clean = value.trim();
    if (!clean) return [];

    try {
      const parsed = JSON.parse(clean);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed].filter(Boolean);
    } catch {
      return [clean];
    }
  }

  return [];
}

function getListingImage(listing) {
  const images = [
    ...parseImages(listing?.image_url),
    ...parseImages(listing?.photo_urls),
    ...parseImages(listing?.photos),
    ...parseImages(listing?.images),
  ];

  return images.find(Boolean) || "/cars/hero-car.png";
}

function isBidListing(listing) {
  const value = String(listing?.accept_bids ?? listing?.listing_type ?? "")
    .trim()
    .toLowerCase();

  return (
    listing?.accept_bids === true ||
    ["true", "1", "yes", "on", "bid", "bids"].includes(value)
  );
}

function getStatusInfo(status) {
  const clean = String(status || "pending").trim().toLowerCase();

  const statuses = {
    approved: { label: "Live", className: "live" },
    pending: { label: "Not live", className: "pending" },
    rejected: { label: "Needs changes", className: "rejected" },
    sold: { label: "Sold", className: "sold" },
  };

  return statuses[clean] || statuses.pending;
}

function isFeatured(listing) {
  const marked =
    listing?.is_featured === true ||
    String(listing?.is_featured || "").toLowerCase() === "true" ||
    Number(listing?.featured_rank || 0) > 0 ||
    Boolean(listing?.boosted_at);

  if (!marked) return false;
  if (!listing?.featured_until) return true;

  const end = new Date(listing.featured_until).getTime();
  return Number.isFinite(end) && end > Date.now();
}

function Icon({ name }) {
  const paths = {
    listings: (
      <>
        <path d="M5 5h14v14H5z" />
        <path d="M8 9h8M8 13h8M8 17h5" />
      </>
    ),
    messages: <path d="M4 5h16v12H8l-4 4V5z" />,
    saved: (
      <path d="M12 21 4.8 13.8a5 5 0 0 1 7.1-7.1L12 6.8l.1-.1a5 5 0 1 1 7.1 7.1L12 21z" />
    ),
    boosts: (
      <path d="m12 3 2.4 5.2L20 9l-4 3.9.9 5.6L12 16l-4.9 2.5.9-5.6L4 9l5.6-.8L12 3z" />
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    car: (
      <path d="M5 16h14M7 16l1.2-4.4A3 3 0 0 1 11.1 9h1.8a3 3 0 0 1 2.9 2.6L17 16M7 16v2M17 16v2" />
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M14 4h6v16h-6" />
      </>
    ),
    back: <path d="m15 18-6-6 6-6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg
      className="kerbMobileAccountIcon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.chevron}
    </svg>
  );
}

function DesktopListingsPanel({ accountData, loading }) {
  const [filter, setFilter] = useState("all");
  const listings = accountData?.my_listings || [];
  const normalListings = listings.filter((listing) => !isBidListing(listing));
  const bidListings = listings.filter(isBidListing);
  const visibleListings = listings.filter((listing) => {
    if (filter === "bid") return isBidListing(listing);
    if (filter === "normal") return !isBidListing(listing);
    return true;
  });

  if (loading && !accountData) {
    return <div className="kerbDesktopListingsLoading">Loading your listings…</div>;
  }

  return (
    <div className="kerbDesktopListingsPanel">
      <div className="kerbDesktopListingFilters" aria-label="Listing type filters">
        <button
          type="button"
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All <strong>{listings.length}</strong>
        </button>
        <button
          type="button"
          className={filter === "normal" ? "active" : ""}
          onClick={() => setFilter("normal")}
        >
          Normal listings <strong>{normalListings.length}</strong>
        </button>
        <button
          type="button"
          className={filter === "bid" ? "active bid" : "bid"}
          onClick={() => setFilter("bid")}
        >
          Bid listings <strong>{bidListings.length}</strong>
        </button>
      </div>

      {visibleListings.length === 0 ? (
        <div className="kerbDesktopListingsEmpty">
          <strong>
            {filter === "bid" ? "No bid listings saved" : "No listings found"}
          </strong>
          <span>
            {filter === "bid"
              ? "Choose Bid listing when posting a car and it will appear here."
              : "Post a car and it will appear in your account."}
          </span>
          <a href="/post-car">Post your car</a>
        </div>
      ) : (
        <div className="kerbDesktopListingsList">
          {visibleListings.map((listing) => {
            const bidListing = isBidListing(listing);
            const status = getStatusInfo(listing.status);
            const listingHref = bidListing
              ? `/bids/${listing.id}`
              : `/listing/${listing.id}`;
            const enquiries = getAnalyticsValue(listing, "enquiry_count");
            const saves = getAnalyticsValue(listing, "save_count");
            const unread = getAnalyticsValue(listing, "unread_enquiry_count");

            return (
              <article
                className={`kerbDesktopListingCard ${bidListing ? "bid" : "normal"}`}
                key={listing.id}
              >
                <a href={listingHref} className="kerbDesktopListingImage">
                  <img
                    src={getListingImage(listing)}
                    alt={getListingTitle(listing)}
                    onError={(event) => {
                      event.currentTarget.src = "/cars/hero-car.png";
                    }}
                  />
                </a>

                <div className="kerbDesktopListingMain">
                  <div className="kerbDesktopListingBadges">
                    <span className={`kerbCompactStatus ${status.className}`}>
                      {status.label}
                    </span>
                    <span className={`kerbListingTypePill ${bidListing ? "bid" : "normal"}`}>
                      {bidListing ? "Bid listing" : "Normal listing"}
                    </span>
                    {isFeatured(listing) && (
                      <span className="kerbListingBoostPill">Boost active</span>
                    )}
                  </div>

                  <div className="kerbDesktopListingHeading">
                    <div>
                      <h3>{getListingTitle(listing)}</h3>
                      <p>
                        {listing.location || "Location TBC"} · Listed {formatDate(listing.created_at)}
                      </p>
                    </div>
                    <strong>{formatPrice(listing.price || listing.asking_price)}</strong>
                  </div>

                  <div className="kerbDesktopListingMetrics">
                    <span>
                      <small>Mileage</small>
                      <strong>{formatMileage(listing.mileage)}</strong>
                    </span>
                    <span>
                      <small>Views</small>
                      <strong>{formatCount(getListingViews(listing))}</strong>
                    </span>
                    <span>
                      <small>Enquiries</small>
                      <strong>{formatCount(enquiries)}</strong>
                    </span>
                    <span>
                      <small>Saves</small>
                      <strong>{formatCount(saves)}</strong>
                    </span>
                    <span>
                      <small>Unread</small>
                      <strong>{formatCount(unread)}</strong>
                    </span>
                  </div>

                  <div className="kerbDesktopListingActions">
                    <a href={listingHref} className="primary">
                      {bidListing ? "View bid listing" : "View listing"}
                    </a>
                    <a href={`/listing/${listing.id}/edit`}>Edit</a>
                    {String(listing.status || "").toLowerCase() !== "sold" && (
                      <BoostListingButton
                        listingId={listing.id}
                        label={isFeatured(listing) ? "Extend boost" : "Boost"}
                        source="account-compact-listings"
                        small
                      />
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MobileAccountCompact() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState("");
  const [desktopListingsTarget, setDesktopListingsTarget] = useState(null);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    const onAccount = pathname === "/account";
    document.body.classList.toggle("kerbMobileAccountMode", onAccount && isMobile);
    document.body.classList.toggle("kerbDesktopAccountCompact", onAccount && !isMobile);

    if (!onAccount) {
      document.body.classList.remove(
        "kerbMobileAccountSectionOpen",
        "kerbMobileAccountMode",
        "kerbDesktopAccountCompact"
      );
      setOpenSection("");
      setDesktopListingsTarget(null);
      return undefined;
    }

    let cancelled = false;
    const token = localStorage.getItem("kerbSessionToken");

    if (!token) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    fetch("/api/account", {
      headers: { "x-kerb-session-token": token },
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not load account.");
        return payload;
      })
      .then((payload) => {
        if (!cancelled) setAccountData(payload);
      })
      .catch(() => {
        if (!cancelled) setAccountData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      document.body.classList.remove(
        "kerbMobileAccountMode",
        "kerbMobileAccountSectionOpen",
        "kerbDesktopAccountCompact"
      );
    };
  }, [pathname, isMobile]);

  useEffect(() => {
    if (pathname !== "/account" || isMobile) {
      setDesktopListingsTarget(null);
      return undefined;
    }

    let currentTarget = null;

    function mountCompactListings() {
      const sections = [...document.querySelectorAll("main.page > .contentSection")];
      const listingSection = sections.find(
        (section) =>
          section.querySelector(".sectionHeader h2")?.textContent?.trim() ===
          "My listings"
      );

      if (!listingSection) {
        if (currentTarget) setDesktopListingsTarget(null);
        currentTarget = null;
        return;
      }

      listingSection.classList.add("kerbDesktopListingsSection");
      let target = listingSection.querySelector("#kerbDesktopListingsHost");

      if (!target) {
        target = document.createElement("div");
        target.id = "kerbDesktopListingsHost";
        const originalGrid = listingSection.querySelector(".cardsGrid, .emptyBox");

        if (originalGrid) originalGrid.before(target);
        else listingSection.appendChild(target);
      }

      if (target !== currentTarget) {
        currentTarget = target;
        setDesktopListingsTarget(target);
      }
    }

    mountCompactListings();
    const observer = new MutationObserver(mountCompactListings);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document
        .querySelectorAll(".kerbDesktopListingsSection")
        .forEach((section) => section.classList.remove("kerbDesktopListingsSection"));
      document.getElementById("kerbDesktopListingsHost")?.remove();
      setDesktopListingsTarget(null);
    };
  }, [pathname, isMobile]);

  useEffect(() => {
    if (pathname !== "/account" || !accountData?.my_listings) return undefined;

    const listingsById = new Map(
      accountData.my_listings.map((listing) => [String(listing.id), listing])
    );

    function decorateOriginalCards() {
      document
        .querySelectorAll("main.page article.mediaCard, main.page article.miniCard")
        .forEach((card) => {
          const listingLink = [...card.querySelectorAll('a[href*="/listing/"]')].find(
            (link) => /\/listing\/[^/]+/.test(link.getAttribute("href") || "")
          );
          const listingId = (listingLink?.getAttribute("href") || "")
            .split("/listing/")[1]
            ?.split("/")[0];
          const listing = listingsById.get(String(listingId || ""));

          if (!listing) return;

          const bidListing = isBidListing(listing);
          card.classList.toggle("kerbOriginalBidListing", bidListing);
          card.classList.toggle("kerbOriginalNormalListing", !bidListing);

          if (!card.querySelector(".kerbOriginalListingType")) {
            const badge = document.createElement("span");
            badge.className = `kerbOriginalListingType ${bidListing ? "bid" : "normal"}`;
            badge.textContent = bidListing ? "Bid listing" : "Normal listing";
            const content = card.querySelector(".cardContent") || card.lastElementChild;
            content?.prepend(badge);
          }
        });
    }

    decorateOriginalCards();
    const observer = new MutationObserver(decorateOriginalCards);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname, accountData]);

  const stats = useMemo(() => {
    const listings = accountData?.my_listings || [];
    return {
      listings: listings.length,
      normalListings: listings.filter((listing) => !isBidListing(listing)).length,
      bidListings: listings.filter(isBidListing).length,
      views: listings.reduce((total, listing) => total + getListingViews(listing), 0),
      saved: accountData?.saved_listings?.length || 0,
      unread: accountData?.unread_total || 0,
      messages: accountData?.message_count || accountData?.messages?.length || 0,
      sent: accountData?.sent_enquiries?.length || 0,
      received: accountData?.received_enquiries?.length || 0,
      boosts: accountData?.boost_history?.length || 0,
    };
  }, [accountData]);

  const account = accountData?.account || {};
  const accountName =
    account.full_name || account.name || accountData?.name || "My account";
  const accountEmail = account.email || accountData?.email || "";

  function clickOriginalTab(tabName) {
    const buttons = [...document.querySelectorAll("main.page .tabs button")];
    const labels = {
      messages: "Messages",
      listings: "My listings",
      boosts: "Boosts",
      saved: "Saved cars",
      settings: "Settings",
    };
    const button = buttons.find((item) =>
      item.textContent.trim().startsWith(labels[tabName])
    );
    button?.click();
  }

  function openTab(tabName, label) {
    clickOriginalTab(tabName);
    setOpenSection(label);
    document.body.classList.add("kerbMobileAccountSectionOpen");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function closeSection() {
    setOpenSection("");
    document.body.classList.remove("kerbMobileAccountSectionOpen");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function logout() {
    localStorage.removeItem("kerbSessionToken");
    localStorage.removeItem("kerbAccountEmail");
    localStorage.removeItem("kerbUser");
    window.dispatchEvent(new Event("kerb-auth-change"));
    window.location.href = "/";
  }

  if (pathname !== "/account") return null;

  return (
    <>
      {!isMobile && desktopListingsTarget &&
        createPortal(
          <DesktopListingsPanel accountData={accountData} loading={loading} />,
          desktopListingsTarget
        )}

      {isMobile &&
        (openSection ? (
          <header className="kerbMobileAccountSectionHeader">
            <button type="button" onClick={closeSection} aria-label="Back to account menu">
              <Icon name="back" />
            </button>
            <div>
              <span>My account</span>
              <strong>{openSection}</strong>
            </div>
            <a href="/">Kerb</a>
          </header>
        ) : (
          <section className="kerbMobileAccountHome">
            <header className="kerbMobileAccountTopbar">
              <a href="/" className="kerbMobileAccountLogo">
                Kerb
              </a>
              <a href="/post-car" className="kerbMobileAccountPost">
                <Icon name="plus" /> Post car
              </a>
            </header>

            <div className="kerbMobileAccountProfile">
              <div className="kerbMobileAccountAvatar">
                {String(accountName).charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>{accountName}</strong>
                <span>{accountEmail}</span>
              </div>
            </div>

            <div className="kerbMobileAccountStats" aria-label="Account summary">
              <button type="button" onClick={() => openTab("listings", "My listings")}>
                <span>Listings</span>
                <strong>{formatCount(stats.listings)}</strong>
              </button>
              <button type="button" onClick={() => openTab("listings", "My listings")}>
                <span>Views</span>
                <strong>{formatCount(stats.views)}</strong>
              </button>
              <button type="button" onClick={() => openTab("saved", "Saved cars")}>
                <span>Saved</span>
                <strong>{formatCount(stats.saved)}</strong>
              </button>
              <button type="button" onClick={() => openTab("messages", "Messages")}>
                <span>Unread</span>
                <strong>{formatCount(stats.unread)}</strong>
              </button>
            </div>

            <div className="kerbMobileAccountListingTypes">
              <button type="button" onClick={() => openTab("listings", "My listings")}>
                <span>Normal listings</span>
                <strong>{stats.normalListings}</strong>
              </button>
              <button type="button" className="bid" onClick={() => openTab("listings", "My listings")}>
                <span>Bid listings</span>
                <strong>{stats.bidListings}</strong>
              </button>
            </div>

            <div className="kerbMobileAccountGroups">
              <section>
                <h2>Buying &amp; selling</h2>
                <button type="button" onClick={() => openTab("listings", "My listings")}>
                  <Icon name="listings" />
                  <span>
                    <strong>My listings</strong>
                    <small>
                      {stats.normalListings} normal · {stats.bidListings} bid
                    </small>
                  </span>
                  <b>{stats.listings}</b>
                  <Icon name="chevron" />
                </button>
                <button type="button" onClick={() => openTab("messages", "Messages")}>
                  <Icon name="messages" />
                  <span>
                    <strong>Messages and enquiries</strong>
                    <small>
                      {stats.sent} sent · {stats.received} received
                    </small>
                  </span>
                  {stats.unread > 0 && <b className="alert">{stats.unread}</b>}
                  <Icon name="chevron" />
                </button>
                <button type="button" onClick={() => openTab("saved", "Saved cars")}>
                  <Icon name="saved" />
                  <span>
                    <strong>Saved cars</strong>
                    <small>Cars kept for later</small>
                  </span>
                  <b>{stats.saved}</b>
                  <Icon name="chevron" />
                </button>
                <button type="button" onClick={() => openTab("boosts", "Boosts")}>
                  <Icon name="boosts" />
                  <span>
                    <strong>Boosts and payments</strong>
                    <small>Manage priority placement</small>
                  </span>
                  <b>{stats.boosts}</b>
                  <Icon name="chevron" />
                </button>
              </section>

              <section>
                <h2>Account</h2>
                <button type="button" onClick={() => openTab("settings", "Personal details")}>
                  <Icon name="settings" />
                  <span>
                    <strong>Personal details</strong>
                    <small>Name, phone and privacy</small>
                  </span>
                  <Icon name="chevron" />
                </button>
                <a href="/post-car">
                  <Icon name="plus" />
                  <span>
                    <strong>Post a car</strong>
                    <small>Create a normal or bid listing</small>
                  </span>
                  <Icon name="chevron" />
                </a>
                <a href="/browse">
                  <Icon name="car" />
                  <span>
                    <strong>Browse cars</strong>
                    <small>Find cars currently for sale</small>
                  </span>
                  <Icon name="chevron" />
                </a>
                <button type="button" onClick={logout} className="logout">
                  <Icon name="logout" />
                  <span>
                    <strong>Log out</strong>
                    <small>Sign out of this device</small>
                  </span>
                  <Icon name="chevron" />
                </button>
              </section>
            </div>

            {loading && (
              <div className="kerbMobileAccountLoading">Refreshing your account…</div>
            )}
          </section>
        ))}

      <style>{styles}</style>
    </>
  );
}

const styles = `
  .kerbMobileAccountHome,.kerbMobileAccountSectionHeader{display:none}
  .kerbOriginalListingType{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:950;margin-bottom:8px}
  .kerbOriginalListingType.normal{background:#edf3ff;color:#0048ff;border:1px solid #d7e4ff}
  .kerbOriginalListingType.bid{background:#fff1e8;color:#b54708;border:1px solid #ffd7bd}

  @media(min-width:701px){
    body.kerbDesktopAccountCompact main.page{max-width:1540px;margin:0 auto}
    body.kerbDesktopAccountCompact main.page>.hero{grid-template-columns:minmax(0,1fr) minmax(330px,430px);padding:30px;border-radius:24px}
    body.kerbDesktopAccountCompact main.page>.hero h1{font-size:44px}
    body.kerbDesktopAccountCompact main.page>.hero .heroListingCard{margin-top:18px}
    body.kerbDesktopAccountCompact main.page>.statusSummary{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
    body.kerbDesktopAccountCompact main.page>.tabs{padding:7px;gap:5px;border-radius:16px}
    body.kerbDesktopAccountCompact main.page>.tabs button{padding:11px 15px}
    .kerbDesktopListingsSection>.cardsGrid,
    .kerbDesktopListingsSection>.emptyBox{display:none!important}
    #kerbDesktopListingsHost{display:block;margin-top:14px}
    .kerbDesktopListingsLoading{border:1px solid #e0e7f2;background:#fff;border-radius:18px;padding:24px;text-align:center;color:#657189;font-weight:800}
    .kerbDesktopListingsPanel{display:grid;gap:12px}
    .kerbDesktopListingFilters{display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:#fff;border:1px solid #e1e7f1;border-radius:16px;padding:8px}
    .kerbDesktopListingFilters button{border:0;background:transparent;color:#526078;border-radius:11px;padding:9px 12px;font-size:12px;font-weight:900;display:inline-flex;align-items:center;gap:7px}
    .kerbDesktopListingFilters button strong{min-width:23px;height:23px;padding:0 6px;border-radius:999px;background:#eef2f8;color:#23304a;display:grid;place-items:center;font-size:11px}
    .kerbDesktopListingFilters button.active{background:#eaf1ff;color:#0048ff}
    .kerbDesktopListingFilters button.active strong{background:#0048ff;color:#fff}
    .kerbDesktopListingFilters button.bid.active{background:#fff1e8;color:#b54708}
    .kerbDesktopListingFilters button.bid.active strong{background:#b54708;color:#fff}
    .kerbDesktopListingsList{display:grid;gap:12px}
    .kerbDesktopListingCard{display:grid;grid-template-columns:235px minmax(0,1fr);overflow:hidden;background:#fff;border:1px solid #dfe6f1;border-radius:20px;box-shadow:0 9px 26px rgba(20,35,70,.055)}
    .kerbDesktopListingCard.bid{border-color:#ffd8bf}
    .kerbDesktopListingImage{display:block;min-height:210px;background:#edf2f8;overflow:hidden}
    .kerbDesktopListingImage img{width:100%;height:100%;min-height:210px;object-fit:cover;display:block;transition:transform .25s ease}
    .kerbDesktopListingImage:hover img{transform:scale(1.025)}
    .kerbDesktopListingMain{padding:17px 18px;display:grid;gap:12px;min-width:0}
    .kerbDesktopListingBadges{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
    .kerbCompactStatus,.kerbListingTypePill,.kerbListingBoostPill{display:inline-flex;align-items:center;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:950;line-height:1}
    .kerbCompactStatus.live{background:#e8f8ef;color:#147a43}
    .kerbCompactStatus.pending{background:#fff4d8;color:#855900}
    .kerbCompactStatus.rejected{background:#fff0f0;color:#b42318}
    .kerbCompactStatus.sold{background:#edf0f5;color:#556176}
    .kerbListingTypePill.normal{background:#edf3ff;color:#0048ff;border:1px solid #d7e4ff}
    .kerbListingTypePill.bid{background:#fff1e8;color:#b54708;border:1px solid #ffd7bd}
    .kerbListingBoostPill{background:#f1eaff;color:#6f3cc3;border:1px solid #dfd0ff}
    .kerbDesktopListingHeading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;min-width:0}
    .kerbDesktopListingHeading>div{min-width:0}
    .kerbDesktopListingHeading h3{margin:0 0 4px!important;font-size:21px!important;line-height:1.18!important;letter-spacing:-.5px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .kerbDesktopListingHeading p{font-size:12px!important;line-height:1.35!important;color:#69758a!important}
    .kerbDesktopListingHeading>strong{font-size:22px;color:#071126;white-space:nowrap}
    .kerbDesktopListingMetrics{display:grid;grid-template-columns:1.35fr repeat(4,minmax(74px,1fr));gap:7px}
    .kerbDesktopListingMetrics span{min-width:0;border:1px solid #e6ebf3;background:#f8fafd;border-radius:12px;padding:9px 10px;display:grid;gap:3px}
    .kerbDesktopListingMetrics small{color:#748097;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.4px}
    .kerbDesktopListingMetrics strong{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .kerbDesktopListingActions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .kerbDesktopListingActions>a,.kerbDesktopListingActions button{min-height:36px!important;border-radius:10px!important;padding:0 13px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;font-size:11px!important;font-weight:950!important;text-decoration:none!important;border:1px solid #dfe6f1!important;background:#fff!important;color:#23304a!important;box-shadow:none!important}
    .kerbDesktopListingActions>a.primary{background:#0048ff!important;border-color:#0048ff!important;color:#fff!important}
    .kerbDesktopListingsEmpty{border:1px dashed #ccd6e6;background:#fff;border-radius:18px;padding:30px;display:grid;justify-items:center;text-align:center;gap:7px}
    .kerbDesktopListingsEmpty strong{font-size:18px}
    .kerbDesktopListingsEmpty span{color:#68758c;font-size:13px}
    .kerbDesktopListingsEmpty a{margin-top:7px;border-radius:11px;background:#0048ff;color:#fff!important;padding:10px 14px;font-size:12px;font-weight:950;text-decoration:none}
  }

  @media(max-width:700px){
    body.kerbMobileAccountMode{background:#f7f9fd!important}
    body.kerbMobileAccountMode main.page{min-height:0!important;padding:0 14px 28px!important;background:#f7f9fd!important}
    body.kerbMobileAccountMode main.page>.navbar,
    body.kerbMobileAccountMode main.page>.hero,
    body.kerbMobileAccountMode main.page>.statusSummary,
    body.kerbMobileAccountMode main.page>.tabs{display:none!important}
    body.kerbMobileAccountMode:not(.kerbMobileAccountSectionOpen) main.page>*{display:none!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page>.overviewGrid{display:none!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page>.contentSection,
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page>.cardsGrid{margin-top:12px!important}
    .kerbMobileAccountHome{display:block;min-height:100svh;background:#f7f9fd;padding:12px 14px calc(30px + env(safe-area-inset-bottom));font-family:Inter,Arial,sans-serif;color:#071126}
    .kerbMobileAccountTopbar{height:54px;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .kerbMobileAccountLogo{color:#0048ff!important;font-size:32px;font-weight:950;letter-spacing:-1.6px;text-decoration:none}
    .kerbMobileAccountPost{height:40px;border-radius:12px;background:#0048ff;color:#fff!important;padding:0 13px;display:inline-flex;align-items:center;gap:7px;text-decoration:none;font-size:13px;font-weight:950}
    .kerbMobileAccountIcon{width:19px;height:19px;flex:0 0 auto}
    .kerbMobileAccountProfile{margin-top:8px;border:1px solid #e1e8f4;background:#fff;border-radius:18px;padding:14px;display:flex;align-items:center;gap:12px;box-shadow:0 10px 25px rgba(20,35,70,.045)}
    .kerbMobileAccountAvatar{width:46px;height:46px;border-radius:15px;background:#eaf1ff;color:#0048ff;display:grid;place-items:center;font-size:22px;font-weight:950;flex:0 0 auto}
    .kerbMobileAccountProfile>div:last-child{display:grid;gap:2px;min-width:0}
    .kerbMobileAccountProfile strong{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .kerbMobileAccountProfile span{font-size:12px;color:#657189;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .kerbMobileAccountStats{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:10px 0 7px}
    .kerbMobileAccountStats button{min-width:0;border:1px solid #e1e8f4;border-radius:14px;background:#fff;padding:10px 5px;text-align:center;display:grid;gap:3px;box-shadow:none}
    .kerbMobileAccountStats span{font-size:10px;color:#68758c;font-weight:850}
    .kerbMobileAccountStats strong{font-size:19px;color:#0048ff}
    .kerbMobileAccountListingTypes{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px}
    .kerbMobileAccountListingTypes button{border:1px solid #d7e4ff;background:#edf3ff;color:#0048ff;border-radius:13px;padding:9px 11px;display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:900}
    .kerbMobileAccountListingTypes button.bid{border-color:#ffd7bd;background:#fff1e8;color:#b54708}
    .kerbMobileAccountListingTypes strong{font-size:15px}
    .kerbMobileAccountGroups{display:grid;gap:10px}
    .kerbMobileAccountGroups section{border:1px solid #e1e8f4;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 25px rgba(20,35,70,.04)}
    .kerbMobileAccountGroups h2{margin:0!important;padding:13px 14px 8px!important;font-size:14px!important;letter-spacing:0!important;color:#35415a}
    .kerbMobileAccountGroups button,.kerbMobileAccountGroups a{width:100%;min-height:58px;border:0;border-top:1px solid #edf1f7;background:#fff;padding:9px 12px;display:grid;grid-template-columns:32px minmax(0,1fr) auto 18px;gap:9px;align-items:center;text-align:left;text-decoration:none;color:#071126}
    .kerbMobileAccountGroups section>*:nth-child(2){border-top:0}
    .kerbMobileAccountGroups button>.kerbMobileAccountIcon:first-child,.kerbMobileAccountGroups a>.kerbMobileAccountIcon:first-child{width:31px;height:31px;border-radius:10px;background:#eef4ff;color:#0048ff;padding:7px}
    .kerbMobileAccountGroups button>span,.kerbMobileAccountGroups a>span{display:grid;gap:2px;min-width:0}
    .kerbMobileAccountGroups strong{font-size:14px}
    .kerbMobileAccountGroups small{font-size:10px;color:#6b778d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .kerbMobileAccountGroups b{min-width:23px;height:23px;border-radius:999px;background:#eef3ff;color:#0048ff;display:grid;place-items:center;padding:0 6px;font-size:11px}
    .kerbMobileAccountGroups b.alert{background:#d7193f;color:#fff}
    .kerbMobileAccountGroups .logout strong{color:#b42318}
    .kerbMobileAccountGroups .logout>.kerbMobileAccountIcon:first-child{background:#fff1f1;color:#b42318}
    .kerbMobileAccountLoading{text-align:center;color:#68758c;font-size:11px;padding:12px}
    .kerbMobileAccountSectionHeader{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:10px;position:sticky;top:0;z-index:200;height:66px;padding:8px 14px;background:rgba(255,255,255,.96);border-bottom:1px solid #e1e8f4;backdrop-filter:blur(14px);font-family:Inter,Arial,sans-serif}
    .kerbMobileAccountSectionHeader button{width:40px;height:40px;border:1px solid #e1e8f4;border-radius:12px;background:#fff;color:#071126;display:grid;place-items:center}
    .kerbMobileAccountSectionHeader>div{display:grid;gap:1px;min-width:0}
    .kerbMobileAccountSectionHeader span{font-size:10px;color:#68758c;font-weight:850}
    .kerbMobileAccountSectionHeader strong{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .kerbMobileAccountSectionHeader>a{color:#0048ff!important;font-size:23px;font-weight:950;letter-spacing:-1px;text-decoration:none}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .panel,
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .contentSection{border-radius:18px!important;padding:14px!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .sectionHeader h2{font-size:25px!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .cardsGrid{display:grid!important;grid-template-columns:1fr!important;gap:10px!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard{display:grid!important;grid-template-columns:118px minmax(0,1fr)!important;padding:0!important;border-radius:16px!important;overflow:hidden!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard .cardImage{height:100%!important;min-height:175px!important;border-radius:0!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard .cardContent{padding:11px!important;gap:7px!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard h3{font-size:16px!important;line-height:1.2!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard .listingStatusNote,
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard .listingInsight{display:none!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard .detailsGrid{grid-template-columns:1fr 1fr!important;gap:5px!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard .detailsGrid>div{padding:7px!important;border-radius:9px!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard .detailsGrid>div:nth-child(n+5){display:none!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard .listingActions{gap:5px!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard .listingActions a,
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .mediaCard .listingActions button{font-size:10px!important;padding:8px!important;border-radius:9px!important}
    .kerbOriginalListingType{padding:5px 8px;font-size:9px;margin-bottom:3px}
  }

  @media(max-width:1050px) and (min-width:701px){
    .kerbDesktopListingCard{grid-template-columns:190px minmax(0,1fr)}
    .kerbDesktopListingMetrics{grid-template-columns:repeat(3,minmax(0,1fr))}
    .kerbDesktopListingMetrics span:nth-child(n+5){display:none}
  }
`;

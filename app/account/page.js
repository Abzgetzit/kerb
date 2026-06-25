"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteMenu from "../components/SiteMenu";
import BoostListingButton from "../components/BoostListingButton";

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

function formatCount(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) return "0";

  return new Intl.NumberFormat("en-GB").format(number);
}

function isEnquiryUnread(enquiry) {
  return enquiry?.is_unread === true;
}

function getLatestSenderLabel(enquiry, mode) {
  const senderRole = normaliseStatus(enquiry?.last_message_sender_role);

  if (!senderRole) return "Latest message";
  if (mode === "received" && senderRole === "buyer") return "Latest from buyer";
  if (mode === "received" && senderRole === "seller") return "Your latest reply";
  if (mode === "sent" && senderRole === "seller") return "Latest from seller";
  if (mode === "sent" && senderRole === "buyer") return "Your latest message";

  return "Latest message";
}

function getListingAnalytics(car) {
  return car?.analytics || {};
}

function getAnalyticsCount(car, key, fallbackKey) {
  const analytics = getListingAnalytics(car);

  return Number(analytics[key] ?? car?.[fallbackKey] ?? 0);
}

function getListingInsight(car) {
  const analytics = getListingAnalytics(car);
  const views = Number(analytics.view_count || car?.view_count || 0);
  const viewsLast30 = Number(analytics.views_last_30_days || 0);
  const saves = Number(analytics.save_count || 0);
  const enquiries = Number(analytics.enquiry_count || 0);
  const photoCount = getListingImages(car).length;
  const status = normaliseStatus(car.status);

  if (status === "rejected") {
    return {
      type: "warning",
      title: car.moderation_reason || "Listing needs changes",
      text:
        car.moderation_note ||
        "Review the listing details and photos, then resubmit it for approval.",
    };
  }

  if (photoCount > 0 && photoCount < 6) {
    return {
      type: "tip",
      title: "Add more photos",
      text: "Listings with front, rear, interior and wheel photos usually feel more trustworthy.",
    };
  }

  if (views >= 25 && enquiries === 0) {
    return {
      type: "warning",
      title: "Getting views, but no messages yet",
      text: "Try checking the price, description and first photo to make the listing more convincing.",
    };
  }

  if (saves > 0 && enquiries === 0) {
    return {
      type: "tip",
      title: "Buyers are saving this car",
      text: "A small price adjustment or more detail in the description may help turn saves into messages.",
    };
  }

  if (viewsLast30 > 0) {
    return {
      type: "good",
      title: "Your listing is being seen",
      text: `${formatCount(viewsLast30)} view${viewsLast30 === 1 ? "" : "s"} in the last 30 days.`,
    };
  }

  return {
    type: "tip",
    title: "Keep the listing complete",
    text: "Clear photos, honest condition notes and a realistic price help buyers trust the advert.",
  };
}

function getConversationMode(enquiry) {
  return enquiry?.conversation_mode || enquiry?.activity_type || "sent";
}

function getConversationModeLabel(enquiry) {
  return getConversationMode(enquiry) === "received"
    ? "Buyer enquiry"
    : "Seller chat";
}

function getOtherPartyName(enquiry) {
  const mode = getConversationMode(enquiry);

  if (mode === "received") {
    return enquiry.buyer_name || enquiry.buyer_email || "Buyer";
  }

  return enquiry.listing?.seller_name || enquiry.seller_email || "Seller";
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

function isListingFeatured(car) {
  const rawFeatured = String(car?.is_featured ?? "").toLowerCase();
  const markedFeatured =
    car?.is_featured === true ||
    rawFeatured === "true" ||
    Number(car?.featured_rank || 0) > 0 ||
    Boolean(car?.boosted_at);

  if (!markedFeatured) return false;
  if (!car?.featured_until) return true;

  const until = new Date(car.featured_until).getTime();

  return Number.isFinite(until) && until > Date.now();
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
    const nextTab =
      tab === "sent" || tab === "received" ? "messages" : tab || "overview";

    if (["overview", "messages", "listings", "saved"].includes(nextTab)) {
      setActiveTab(nextTab);
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
    const myListings = accountData?.my_listings || [];

    return {
      listings: myListings.length,
      views: myListings.reduce(
        (total, listing) =>
          total + getAnalyticsCount(listing, "view_count", "view_count"),
        0
      ),
      messages: accountData?.message_count || accountData?.messages?.length || 0,
      sent: accountData?.sent_enquiries?.length || 0,
      received: accountData?.received_enquiries?.length || 0,
      saved: accountData?.saved_listings?.length || 0,
      unreadSent: accountData?.unread_sent_count || 0,
      unreadReceived: accountData?.unread_received_count || 0,
      unreadTotal: accountData?.unread_total || 0,
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
    return [...(accountData?.messages || [])]
      .sort(
        (a, b) =>
          new Date(getEnquiryActivityDate(b)) -
          new Date(getEnquiryActivityDate(a))
      )
      .slice(0, 4);
  }, [accountData]);

  const heroListing = useMemo(() => {
    const listings = accountData?.my_listings || [];

    return (
      listings.find((listing) => normaliseStatus(listing.status) === "approved") ||
      listings[0] ||
      null
    );
  }, [accountData]);

  const heroListingStatus = heroListing
    ? getListingStatusInfo(heroListing.status)
    : null;

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

        <SiteMenu
          currentUser={accountData?.account || accountData}
          onLogout={logout}
          unreadCount={stats.unreadTotal}
        />
      </header>

      <section className="hero">
        <div className="heroMain">
          <div className="pill">Kerb account</div>
          <h1>My account</h1>
          <p>
            Signed in as <strong>{accountData?.email}</strong>. Manage your
            listings, saved cars and enquiries from one place.
          </p>

          {heroListing ? (
            <div className="heroListingCard">
              <Link href={`/listing/${heroListing.id}`} className="heroListingImage">
                <img
                  src={getImage(heroListing)}
                  alt={getTitle(heroListing)}
                  onError={(event) => {
                    event.currentTarget.src = "/cars/hero-car.png";
                  }}
                />
              </Link>

              <div className="heroListingBody">
                <div className="heroListingTop">
                  <span className={`status ${heroListingStatus.className}`}>
                    {heroListingStatus.label}
                  </span>
                  {isListingFeatured(heroListing) && (
                    <span className="privateBoostPill">
                      Boost active
                    </span>
                  )}
                </div>

                <h2>{getTitle(heroListing)}</h2>

                <p>
                  {formatPrice(heroListing.price || heroListing.asking_price)}
                  {heroListing.location ? ` · ${heroListing.location}` : ""}
                </p>

                <div className="heroListingStats">
                  <span>
                    <strong>
                      {formatCount(
                        getAnalyticsCount(heroListing, "view_count", "view_count")
                      )}
                    </strong>
                    Views
                  </span>
                  <span>
                    <strong>
                      {formatCount(getAnalyticsCount(heroListing, "save_count"))}
                    </strong>
                    Saves
                  </span>
                  <span>
                    <strong>
                      {formatCount(getAnalyticsCount(heroListing, "enquiry_count"))}
                    </strong>
                    Enquiries
                  </span>
                </div>

                <div className="heroListingActions">
                  <Link href={`/listing/${heroListing.id}`}>View listing</Link>
                  <Link href={`/listing/${heroListing.id}/edit`}>Edit</Link>

                  {normaliseStatus(heroListing.status) !== "sold" && (
                    <BoostListingButton
                      listingId={heroListing.id}
                      label={
                        isListingFeatured(heroListing)
                          ? "Extend boost"
                          : "Boost listing"
                      }
                      source="account-hero"
                      small
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="heroEmptyCard">
              <strong>Ready to sell?</strong>
              <span>
                Post your first car and manage views, saves, enquiries and
                boosts from this page.
              </span>
              <button type="button" onClick={goToPostCar}>
                Post your car
              </button>
            </div>
          )}
        </div>

        <div className="statsGrid">
          <div>
            <span>My listings</span>
            <strong>{stats.listings}</strong>
          </div>
          <div>
            <span>Listing views</span>
            <strong>{formatCount(stats.views)}</strong>
          </div>
          <div>
            <span>Saved cars</span>
            <strong>{stats.saved}</strong>
          </div>
          <div>
            <span>Unread chats</span>
            <strong>{stats.unreadTotal}</strong>
          </div>
          <div>
            <span>Messages</span>
            <strong>{stats.messages}</strong>
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
          className={activeTab === "messages" ? "active" : ""}
          onClick={() => setActiveTab("messages")}
          type="button"
        >
          Messages
          {stats.unreadTotal > 0 && (
            <span className="tabBadge">{stats.unreadTotal}</span>
          )}
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
      </section>

      {activeTab === "overview" && (
        <section className="overviewGrid">
          <div className="panel widePanel boostExplainPanel">
            <div>
              <span className="sectionKicker">Seller visibility</span>
              <h2>What boosting does</h2>
              <p>
                Boosting moves your car into Kerb’s priority listing positions
                so it has a better chance of being seen near the top of Browse
                Cars and Featured Cars. Buyers do not see a public boosted badge.
              </p>
            </div>

            <div className="boostExplainGrid">
              <div>
                <strong>Higher placement</strong>
                <span>Priority chance to appear above normal listings.</span>
              </div>
              <div>
                <strong>Fair rotation</strong>
                <span>Boosted cars rotate with other boosted cars.</span>
              </div>
              <div>
                <strong>No guarantee</strong>
                <span>Good photos, fair price and clear notes still matter.</span>
              </div>
            </div>
          </div>

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

              <button type="button" onClick={() => setActiveTab("messages")}>
                Open messages
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
                  <Link
                    href={`/enquiries/${activity.id}`}
                    className={`activityItem ${
                      isEnquiryUnread(activity) ? "unread" : ""
                    }`}
                    key={`message-${activity.id}`}
                  >
                    <div className="activityMeta">
                      <span>{getConversationModeLabel(activity)}</span>
                      {isEnquiryUnread(activity) && <b>Unread</b>}
                    </div>
                    <strong>{activity.listing_title || "Kerb listing"}</strong>
                    <em>{getOtherPartyName(activity)}</em>
                    <small>{formatDate(getEnquiryActivityDate(activity))}</small>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "messages" && (
        <section className="contentSection">
          <div className="sectionHeader">
            <div>
              <h2>Messages</h2>
              <p>
                All buyer and seller conversations, newest replies first.
              </p>
            </div>
          </div>

          {!accountData.messages || accountData.messages.length === 0 ? (
            <EmptyBox
              title="No messages yet"
              text="When you contact a seller or a buyer messages your listing, the chat will appear here."
              link="/browse"
              linkText="Browse cars"
            />
          ) : (
            <div className="inboxList">
              {accountData.messages.map((enquiry) => (
                <MessageThreadCard key={enquiry.id} enquiry={enquiry} />
              ))}
            </div>
          )}
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

                      {(car.moderation_reason || car.moderation_note) && (
                        <div className="moderationNote">
                          <strong>
                            {car.moderation_reason || "Admin note"}
                          </strong>
                          {car.moderation_note && (
                            <span>{car.moderation_note}</span>
                          )}
                        </div>
                      )}

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

                        <div>
                          <span>Featured</span>
                          <strong>
                            {isListingFeatured(car)
                              ? `Until ${formatDate(car.featured_until)}`
                              : "Not boosted"}
                          </strong>
                        </div>

                        <div>
                          <span>Views</span>
                          <strong>
                            {formatCount(
                              getAnalyticsCount(car, "view_count", "view_count")
                            )}{" "}
                            views
                          </strong>
                        </div>

                        <div>
                          <span>Views this week</span>
                          <strong>
                            {formatCount(
                              getAnalyticsCount(car, "views_last_7_days")
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Views 30 days</span>
                          <strong>
                            {formatCount(
                              getAnalyticsCount(car, "views_last_30_days")
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Saves</span>
                          <strong>
                            {formatCount(getAnalyticsCount(car, "save_count"))}
                          </strong>
                        </div>

                        <div>
                          <span>Enquiries</span>
                          <strong>
                            {formatCount(
                              getAnalyticsCount(car, "enquiry_count")
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Unread</span>
                          <strong>
                            {formatCount(
                              getAnalyticsCount(car, "unread_enquiry_count")
                            )}
                          </strong>
                        </div>

                        {(car.analytics?.last_enquiry_at || car.last_viewed_at) && (
                          <div>
                            <span>
                              {car.analytics?.last_enquiry_at
                                ? "Last enquiry"
                                : "Last viewed"}
                            </span>
                            <strong>
                              {formatDate(
                                car.analytics?.last_enquiry_at ||
                                  car.last_viewed_at
                              )}
                            </strong>
                          </div>
                        )}
                      </div>

                      {(() => {
                        const insight = getListingInsight(car);

                        return (
                          <div className={`listingInsight ${insight.type}`}>
                            <strong>{insight.title}</strong>
                            <span>{insight.text}</span>
                          </div>
                        );
                      })()}

                      <div className="cardActions listingActions">
                        <Link href={`/listing/${car.id}`}>
                          {viewLabel}
                        </Link>

                        <Link href={`/listing/${car.id}/edit`}>
                          {status === "rejected"
                            ? "Edit and resubmit"
                            : "Edit listing"}
                        </Link>

                        {status !== "sold" && (
                          <BoostListingButton
                            listingId={car.id}
                            label={
                              isListingFeatured(car)
                                ? "Extend boost"
                                : "Boost listing"
                            }
                            source="account-listings"
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
            {statusInfo.short} ·{" "}
            {formatCount(getAnalyticsCount(car, "view_count", "view_count"))} views
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

function MessageThreadCard({ enquiry }) {
  const mode = getConversationMode(enquiry);
  const unread = isEnquiryUnread(enquiry);
  const listing = enquiry.listing || {};
  const listingTitle = enquiry.listing_title || getTitle(listing);
  const latestMessage = enquiry.last_message_preview || enquiry.message;
  const latestMessageDate = getEnquiryActivityDate(enquiry);
  const latestSenderLabel = getLatestSenderLabel(enquiry, mode);
  const listingPrice = listing.price || listing.asking_price;
  const listingLocation = listing.location || listing.city || "";
  const otherPartyName = getOtherPartyName(enquiry);

  return (
    <article className={`inboxThread ${unread ? "unread" : ""}`}>
      <Link href={`/listing/${enquiry.listing_id}`} className="inboxImage">
        <img
          src={getImage(listing)}
          alt={listingTitle}
          onError={(event) => {
            event.currentTarget.src = "/cars/hero-car.png";
          }}
        />
      </Link>

      <div className="inboxBody">
        <div className="inboxTopLine">
          <span>{getConversationModeLabel(enquiry)}</span>
          {unread && <b>Unread</b>}
        </div>

        <h3>{listingTitle}</h3>

        <p className="inboxMeta">
          {otherPartyName}
          {listingPrice ? ` · ${formatPrice(listingPrice)}` : ""}
          {listingLocation ? ` · ${listingLocation}` : ""}
        </p>

        <div className="inboxMessage">
          <span>{latestSenderLabel}</span>
          <p>{latestMessage || "No message provided."}</p>
        </div>
      </div>

      <div className="inboxActions">
        <small>{formatDate(latestMessageDate)}</small>
        <Link href={`/enquiries/${enquiry.id}`}>Open chat</Link>
        <Link href={`/listing/${enquiry.listing_id}`}>View listing</Link>
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

  .heroMain {
    min-width: 0;
  }

  .heroListingCard {
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr);
    gap: 16px;
    align-items: stretch;
    margin-top: 24px;
    background: white;
    border: 1px solid #dfe8fb;
    border-radius: 22px;
    padding: 14px;
    box-shadow: 0 14px 34px rgba(10, 20, 40, 0.07);
  }

  .heroListingImage {
    min-height: 145px;
    border-radius: 16px;
    overflow: hidden;
    background: #eef3ff;
  }

  .heroListingImage img,
  .miniImage img,
  .cardImage img,
  .inboxImage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .heroListingBody {
    display: grid;
    gap: 9px;
    min-width: 0;
  }

  .heroListingTop {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .privateBoostPill {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    background: #eef3ff;
    color: #0048ff;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 950;
  }

  .heroListingBody h2 {
    font-size: 24px;
    line-height: 1.05;
  }

  .heroListingBody p {
    font-weight: 850;
  }

  .heroListingStats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .heroListingStats span {
    display: grid;
    gap: 2px;
    border: 1px solid #e5eaf4;
    border-radius: 13px;
    background: #f7f9fd;
    padding: 9px 10px;
    color: #657189;
    font-size: 11px;
    font-weight: 900;
  }

  .heroListingStats strong {
    color: #071126;
    font-size: 16px;
  }

  .heroListingActions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .heroListingActions a,
  .heroEmptyCard button {
    border: none;
    background: #eef3ff;
    color: #0048ff;
    border-radius: 12px;
    padding: 11px 13px;
    font-weight: 950;
    text-decoration: none;
    cursor: pointer;
  }

  .heroListingActions a:first-child,
  .heroEmptyCard button {
    background: #0048ff;
    color: white;
  }

  .heroEmptyCard {
    display: grid;
    gap: 10px;
    margin-top: 24px;
    background: white;
    border: 1px solid #dfe8fb;
    border-radius: 22px;
    padding: 20px;
    max-width: 620px;
  }

  .heroEmptyCard strong {
    font-size: 20px;
    letter-spacing: -0.4px;
  }

  .heroEmptyCard span {
    color: #59657a;
    line-height: 1.55;
    font-weight: 750;
  }

  .boostExplainPanel {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 20px;
    align-items: center;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 245, 255, 0.98));
  }

  .sectionKicker {
    display: inline-flex;
    color: #0048ff;
    font-size: 12px;
    font-weight: 950;
    margin-bottom: 8px;
  }

  .boostExplainGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .boostExplainGrid div {
    border: 1px solid #dfe8fb;
    border-radius: 16px;
    background: white;
    padding: 15px;
    display: grid;
    gap: 6px;
  }

  .boostExplainGrid strong {
    color: #071126;
    font-weight: 950;
  }

  .boostExplainGrid span {
    color: #657189;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.45;
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
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .tabs button.active {
    background: #0048ff;
    border-color: #0048ff;
    color: white;
  }

  .tabBadge {
    min-width: 24px;
    height: 24px;
    border-radius: 999px;
    background: #d7193f;
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 7px;
    font-size: 12px;
    font-weight: 950;
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

  .enquiryCard.unread {
    border-color: #b9caff;
    box-shadow: 0 18px 44px rgba(0, 72, 255, 0.12);
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

  .enquiryStatusRow {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  }

  .enquiryStatusRow .status {
    margin-bottom: 0;
  }

  .latestSender {
    color: #657189;
    font-size: 12px;
    font-weight: 950;
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

  .inboxList {
    display: grid;
    gap: 14px;
  }

  .inboxThread {
    border: 1px solid #e5eaf4;
    border-radius: 20px;
    background: #fbfcff;
    padding: 14px;
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr) 180px;
    gap: 16px;
    align-items: center;
    transition: transform 0.18s ease, box-shadow 0.18s ease,
      border-color 0.18s ease;
  }

  .inboxThread:hover {
    transform: translateY(-2px);
    border-color: #cfdcff;
    box-shadow: 0 16px 38px rgba(10, 20, 40, 0.08);
  }

  .inboxThread.unread {
    background: #eef3ff;
    border-color: #bdd0ff;
  }

  .inboxImage {
    display: block;
    height: 118px;
    border-radius: 16px;
    overflow: hidden;
    background: #eef2f7;
    border: 1px solid #e5eaf4;
  }

  .inboxImage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .inboxBody {
    min-width: 0;
  }

  .inboxTopLine {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 7px;
  }

  .inboxTopLine span,
  .inboxMessage span {
    color: #0048ff;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
  }

  .inboxTopLine b {
    border-radius: 999px;
    background: #d7193f;
    color: white;
    padding: 5px 8px;
    font-size: 11px;
    line-height: 1;
  }

  .inboxThread h3 {
    margin-bottom: 4px;
  }

  .inboxMeta {
    font-size: 13px;
    line-height: 1.45;
  }

  .inboxMessage {
    margin-top: 12px;
    border: 1px solid #e5eaf4;
    border-radius: 14px;
    background: white;
    padding: 12px;
  }

  .inboxMessage p {
    margin-top: 4px;
    color: #172033;
    font-size: 14px;
    line-height: 1.45;
    font-weight: 800;
  }

  .inboxActions {
    display: grid;
    gap: 10px;
    justify-items: stretch;
  }

  .inboxActions small {
    color: #657189;
    font-weight: 850;
    text-align: right;
  }

  .inboxActions a {
    min-height: 44px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 950;
    text-decoration: none;
  }

  .inboxActions a:first-of-type {
    background: #0048ff;
    color: white;
  }

  .inboxActions a:last-of-type {
    background: white;
    color: #0048ff;
    border: 1px solid #d8e2f4;
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

  .status.unreadStatus {
    background: #0048ff;
    color: white;
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

  .moderationNote,
  .listingInsight {
    border-radius: 16px;
    padding: 13px 14px;
    margin-top: 12px;
    display: grid;
    gap: 4px;
    border: 1px solid #e5eaf4;
    background: #f7f9fd;
  }

  .moderationNote {
    background: #fffaf0;
    border-color: #ffe0a8;
  }

  .moderationNote strong,
  .listingInsight strong {
    color: #071126;
    font-size: 13px;
  }

  .moderationNote span,
  .listingInsight span {
    color: #59657a;
    font-size: 13px;
    line-height: 1.45;
    font-weight: 750;
  }

  .listingInsight.good {
    background: #eafaf0;
    border-color: #c9efd6;
  }

  .listingInsight.tip {
    background: #eef3ff;
    border-color: #cfdcff;
  }

  .listingInsight.warning {
    background: #fff7e8;
    border-color: #ffe0a8;
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

  .messageBox.unread {
    background: #eef3ff;
    border-color: #cbd9ff;
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

  .activityItem.unread {
    background: #eef3ff;
    border-color: #cbd9ff;
  }

  .activityMeta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .activityItem span {
    color: #0048ff;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
  }

  .activityItem b {
    border-radius: 999px;
    background: #d7193f;
    color: white;
    padding: 4px 8px;
    font-size: 11px;
    line-height: 1;
  }

  .activityItem strong {
    color: #071126;
  }

  .activityItem em {
    color: #59657a;
    font-size: 13px;
    font-style: normal;
    font-weight: 850;
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
    .statusSummary,
    .boostExplainPanel {
      grid-template-columns: 1fr;
    }

    .widePanel {
      grid-column: auto;
    }

    .boostExplainGrid {
      grid-template-columns: 1fr;
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
    .detailsGrid,
    .heroListingCard,
    .heroListingStats {
      grid-template-columns: 1fr;
    }

    .heroListingImage {
      min-height: 190px;
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

    .inboxThread {
      grid-template-columns: 1fr;
    }

    .inboxImage {
      height: 190px;
    }

    .inboxActions small {
      text-align: left;
    }
  }
`;

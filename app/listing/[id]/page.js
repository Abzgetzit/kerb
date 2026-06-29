"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import SiteMenu from "../../components/SiteMenu";
import BoostListingButton from "../../components/BoostListingButton";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) return "Price on request";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return value || "";

  return new Intl.NumberFormat("en-GB").format(number);
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(value) {
  const status = String(value || "").trim();

  if (!status) return "";

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function getTitle(car) {
  const title = [car.year, car.make, car.model].filter(Boolean).join(" ").trim();

  return car.title || title || "Car listing";
}

function getSubtitle(car) {
  return [
    car.condition,
    car.fuel_type || car.fuel,
    car.gearbox || car.transmission,
    car.body_type,
  ]
    .filter(Boolean)
    .join(" ");
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

function getPhotos(car) {
  const photos = [
    ...parseImageField(car.image_url),
    ...parseImageField(car.photo_url),
    ...parseImageField(car.main_photo_url),
    ...parseImageField(car.cover_image_url),
    ...parseImageField(car.photo_urls),
    ...parseImageField(car.photos),
    ...parseImageField(car.image_urls),
    ...parseImageField(car.images),
  ];

  const uniquePhotos = [...new Set(photos)].filter(Boolean);

  return uniquePhotos.length > 0 ? uniquePhotos : ["/cars/hero-car.png"];
}

function getFeatures(car) {
  if (Array.isArray(car.features) && car.features.length > 0) {
    return car.features.filter(Boolean);
  }

  if (typeof car.features === "string" && car.features.trim()) {
    try {
      const parsed = JSON.parse(car.features);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      return car.features
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function getOwnerInsight(car, analytics, photoCount) {
  const views = Number(analytics?.views_last_30_days || car?.view_count || 0);
  const enquiries = Number(analytics?.enquiries || 0);
  const saves = Number(analytics?.saves || 0);

  if (photoCount < 6) {
    return {
      title: "Add more photos",
      body: "Listings with front, rear, interior and wheel photos usually feel more trustworthy.",
    };
  }

  if (views >= 25 && enquiries === 0) {
    return {
      title: "Getting views, no messages yet",
      body: "Try sharpening the description, checking the price, or adding a clearer first photo.",
    };
  }

  if (saves > 0 && enquiries === 0) {
    return {
      title: "Buyers are saving this car",
      body: "That is interest. A small price change or more detail may turn saves into enquiries.",
    };
  }

  return {
    title: "Listing looks active",
    body: "Keep the price, mileage and seller notes fresh so buyers know the advert is current.",
  };
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

function SvgIcon({ name }) {
  const icons = {
    car: (
      <>
        <path d="M5 17h14l-1.5-5h-11L5 17Z" />
        <path d="M7 17v2" />
        <path d="M17 17v2" />
        <path d="M7 12l1.5-4h7L17 12" />
      </>
    ),
    new: (
      <>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
      </>
    ),
    sell: (
      <>
        <path d="M4 7h10l6 6-7 7-9-9V7Z" />
        <path d="M8 11h.01" />
      </>
    ),
    electric: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" />,
    finance: (
      <>
        <path d="M4 7h16v10H4z" />
        <path d="M8 11h8" />
        <path d="M8 14h4" />
      </>
    ),
    guides: (
      <>
        <path d="M6 4h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2V4Z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    plus: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </>
    ),
    back: <path d="M19 12H5m7-7-7 7 7 7" />,
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 10.7 15.4 6.3" />
        <path d="M8.6 13.3 15.4 17.7" />
      </>
    ),
    phone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    ),
    message: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="M9 12l2 2 4-5" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8h4l2-3h4l2 3h4v11H4z" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
    mileage: (
      <>
        <path d="M4 14a8 8 0 0 1 16 0" />
        <path d="M12 14l4-4" />
        <path d="M4 14h16" />
      </>
    ),
    fuel: (
      <>
        <path d="M7 3h8v18H7z" />
        <path d="M15 8h2.5L20 10.5V18a2 2 0 0 1-2 2h-1" />
        <path d="M9 7h4" />
      </>
    ),
    gearbox: (
      <>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M6 8v8" />
        <path d="M18 8v8" />
        <path d="M8 6h8" />
      </>
    ),
    body: (
      <>
        <path d="M5 16h14l-1.2-4.5a3 3 0 0 0-2.9-2.2H9.1a3 3 0 0 0-2.9 2.2L5 16Z" />
        <circle cx="8" cy="17" r="2" />
        <circle cx="16" cy="17" r="2" />
      </>
    ),
    condition: (
      <>
        <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 18l.9-5.4-3.9-3.8 5.4-.8L12 3Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M4 10h16" />
      </>
    ),
    location: (
      <>
        <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M6 6l1 15h10l1-15" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
      </>
    ),
    sold: (
      <>
        <path d="M20 6 9 17l-5-5" />
      </>
    ),
  };

  return (
    <svg
      className="svg-icon"
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

export default function ListingPage() {
  const params = useParams();
  const id = params?.id;

  const [car, setCar] = useState(null);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ownerAnalytics, setOwnerAnalytics] = useState(null);
  const [hasCheckedCurrentUser, setHasCheckedCurrentUser] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingListing, setIsSavingListing] = useState(false);

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState("");
  const [enquiryError, setEnquiryError] = useState("");
  const [sentEnquiryId, setSentEnquiryId] = useState("");
  const [enquiryForm, setEnquiryForm] = useState({
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    message: "Hi, is this car still available?",
  });
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportForm, setReportForm] = useState({
    reason: "Misleading information",
    reporter_email: "",
    details: "",
  });

  useEffect(() => {
    function syncKerbUser() {
      setHasCheckedCurrentUser(false);

      const savedUser = localStorage.getItem("kerbUser");
      const savedEmail = localStorage.getItem("kerbAccountEmail");
      const token = localStorage.getItem("kerbSessionToken");

      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
          setHasCheckedCurrentUser(true);
          return;
        } catch {
          localStorage.removeItem("kerbUser");
        }
      }

      if (token && savedEmail) {
        setCurrentUser({ email: savedEmail });
        setHasCheckedCurrentUser(true);
        return;
      }

      setCurrentUser(null);
      setHasCheckedCurrentUser(true);
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
    if (!currentUser) return;

    setEnquiryForm((current) => ({
      ...current,
      buyer_name:
        current.buyer_name ||
        currentUser.name ||
        currentUser.full_name ||
        currentUser.fullName ||
        "",
      buyer_email: current.buyer_email || currentUser.email || "",
    }));

    setReportForm((current) => ({
      ...current,
      reporter_email: current.reporter_email || currentUser.email || "",
    }));
  }, [currentUser]);

  useEffect(() => {
    async function loadSavedState() {
      const token = localStorage.getItem("kerbSessionToken");

      if (!token || !currentUser || !id) {
        setIsSaved(false);
        return;
      }

      try {
        const response = await fetch("/api/saved-listings", {
          headers: {
            "x-kerb-session-token": token,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not load saved cars.");
        }

        setIsSaved((result.saved_listing_ids || []).includes(String(id)));
      } catch (error) {
        console.error("Saved listing state error:", error);
        setIsSaved(false);
      }
    }

    loadSavedState();

    window.addEventListener("kerb-saved-change", loadSavedState);

    return () => {
      window.removeEventListener("kerb-saved-change", loadSavedState);
    };
  }, [currentUser, id]);

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      setErrorMessage("");

      if (!supabase) {
        setErrorMessage("Supabase environment variables are missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("kerb_listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setErrorMessage("This listing could not be found.");
        setCar(null);
      } else {
        setCar(data);
      }

      setLoading(false);
    }

    if (id) loadListing();
  }, [id]);

  const photos = useMemo(() => (car ? getPhotos(car) : []), [car]);
  const features = useMemo(() => (car ? getFeatures(car) : []), [car]);

  const title = car ? getTitle(car) : "";
  const subtitle = car ? getSubtitle(car) : "";
  const price = car ? car.asking_price || car.price || car.listing_price : "";
  const mileage = car ? car.mileage || car.miles : "";
  const fuel = car ? car.fuel_type || car.fuel : "";
  const gearbox = car ? car.gearbox || car.transmission : "";
  const bodyType = car ? car.body_type : "";
  const condition = car ? car.condition : "";
  const location = car ? car.location || car.city || car.postcode : "";
  const sellerType = car ? car.seller_type || "Seller" : "";
  const sellerName = car
    ? car.seller_name || car.account_name || car.owner_name || ""
    : "";
  const sellerPhone = car ? car.seller_phone || car.phone : "";
  const showSellerName = car ? car.show_seller_name !== false : true;
  const showSellerPhone = car
    ? car.show_seller_phone === true ||
      String(car.show_seller_phone || "").toLowerCase() === "true"
    : false;
  const publicSellerName =
    showSellerName && sellerName ? sellerName : sellerType || "Seller";
  const canShowSellerPhone = Boolean(showSellerPhone && sellerPhone);
  const year = car ? car.year || car.registration_year : "";
  const financeAvailable = car ? car.finance_available === true : false;
  const status = car ? String(car.status || "").toLowerCase() : "";
  const postedDate = car ? formatDate(car.created_at) : "";
  const listingReference = car?.id ? String(car.id).slice(0, 8).toUpperCase() : "";

  const currentEmail = String(currentUser?.email || "").toLowerCase();
  const ownerEmails = [
    car?.account_email,
    car?.seller_email,
  ]
    .filter(Boolean)
    .map((email) => String(email).toLowerCase());

  const isSellerOwner = Boolean(currentEmail && ownerEmails.includes(currentEmail));
  const ownerInsight = isSellerOwner
    ? getOwnerInsight(car, ownerAnalytics, photos.length)
    : null;

  useEffect(() => {
    async function loadAccountDetails() {
      const token = localStorage.getItem("kerbSessionToken");

      if (!token || !currentUser) {
        setUnreadCount(0);
        setOwnerAnalytics(null);
        return;
      }

      try {
        const response = await fetch("/api/account", {
          headers: {
            "x-kerb-session-token": token,
          },
        });

        const result = await response.json();

        if (!response.ok) return;

        setUnreadCount(Number(result.unread_total || 0));

        const matchingListing = (result.my_listings || []).find(
          (listing) => String(listing.id) === String(id)
        );

        setOwnerAnalytics(matchingListing?.analytics || null);
      } catch (error) {
        console.error("Listing account details error:", error);
      }
    }

    loadAccountDetails();

    window.addEventListener("kerb-message-change", loadAccountDetails);

    return () => {
      window.removeEventListener("kerb-message-change", loadAccountDetails);
    };
  }, [currentUser, id]);

  useEffect(() => {
    async function trackListingView() {
      if (!id || !car?.id || !hasCheckedCurrentUser || isSellerOwner) return;

      const storageKey = `kerb-listing-viewed:${id}`;
      const lastViewedAt = Number(localStorage.getItem(storageKey) || 0);
      const thirtyMinutes = 30 * 60 * 1000;

      if (lastViewedAt && Date.now() - lastViewedAt < thirtyMinutes) return;

      localStorage.setItem(storageKey, String(Date.now()));

      try {
        const response = await fetch("/api/listing-views", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listing_id: String(id),
            viewer_email: currentEmail,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not record listing view.");
        }

        if (!result.skipped && result.view_count) {
          setCar((current) =>
            current
              ? {
                  ...current,
                  view_count: result.view_count,
                  last_viewed_at: result.last_viewed_at || current.last_viewed_at,
                }
              : current
          );
        }
      } catch (error) {
        localStorage.removeItem(storageKey);
        console.error("Listing view tracking error:", error);
      }
    }

    trackListingView();
  }, [id, car?.id, hasCheckedCurrentUser, isSellerOwner, currentEmail]);

  const specItems = [
    mileage
      ? {
          icon: "mileage",
          label: "Mileage",
          value: `${formatNumber(mileage)} miles`,
        }
      : null,
    fuel
      ? {
          icon: "fuel",
          label: "Fuel",
          value: fuel,
        }
      : null,
    gearbox
      ? {
          icon: "gearbox",
          label: "Gearbox",
          value: gearbox,
        }
      : null,
    bodyType
      ? {
          icon: "body",
          label: "Body type",
          value: bodyType,
        }
      : null,
    condition
      ? {
          icon: "condition",
          label: "Condition",
          value: condition,
        }
      : null,
    location
      ? {
          icon: "location",
          label: "Location",
          value: location,
        }
      : null,
    financeAvailable
      ? {
          icon: "finance",
          label: "Finance",
          value: "Seller/dealer finance available",
        }
      : null,
  ].filter(Boolean);

  const listingItems = [
    {
      label: "Seller type",
      value: sellerType,
    },
    {
      label: "Seller",
      value: publicSellerName,
    },
    {
      label: "Listed",
      value: postedDate,
    },
    {
      label: "Status",
      value: formatStatus(status),
    },
    {
      label: "Listing ref",
      value: listingReference,
    },
    isSellerOwner
      ? {
          label: "Views",
          value: `${formatNumber(car?.view_count || 0)} views`,
        }
      : null,
    isSellerOwner && car?.last_viewed_at
      ? {
          label: "Last viewed",
          value: formatDate(car.last_viewed_at),
        }
      : null,
  ].filter((item) => item?.value);

  function nextPhoto() {
    if (photos.length <= 1) return;
    setMainPhotoIndex((current) => (current + 1) % photos.length);
  }

  function previousPhoto() {
    if (photos.length <= 1) return;
    setMainPhotoIndex((current) =>
      current === 0 ? photos.length - 1 : current - 1
    );
  }

  function handleLogout() {
    localStorage.removeItem("kerbSessionToken");
    localStorage.removeItem("kerbAccountEmail");
    localStorage.removeItem("kerbUser");
    setIsSaved(false);
    window.dispatchEvent(new Event("kerb-auth-change"));
    window.location.href = "/";
  }

  async function toggleSavedListing() {
    const token = localStorage.getItem("kerbSessionToken");

    if (!token || !currentUser) {
      window.location.href = "/login";
      return;
    }

    if (!id) return;

    const wasSaved = isSaved;

    setIsSaved(!wasSaved);
    setIsSavingListing(true);

    try {
      const response = await fetch("/api/saved-listings", {
        method: wasSaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kerb-session-token": token,
        },
        body: JSON.stringify({
          listing_id: String(id),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not update saved cars.");
      }

      window.dispatchEvent(new Event("kerb-saved-change"));
    } catch (error) {
      console.error("Save listing error:", error);
      setIsSaved(wasSaved);
    } finally {
      setIsSavingListing(false);
    }
  }

  async function shareListing() {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch {
        return;
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setActionMessage("Listing link copied.");
    }
  }

  async function runOwnerAction(action) {
    setActionMessage("");
    setActionError("");

    const token = localStorage.getItem("kerbSessionToken");

    if (!token) {
      setActionError("Please sign in again to manage this listing.");
      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this listing? This cannot be undone."
      );

      if (!confirmed) return;
    }

    setIsActionLoading(true);

    try {
      const response = await fetch("/api/listing-owner-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kerb-session-token": token,
        },
        body: JSON.stringify({
          listing_id: id,
          action,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not update listing.");
      }

      if (action === "delete") {
        window.location.href = "/account";
        return;
      }

      setCar(result.listing);
      setActionMessage(
        action === "sold"
          ? "Listing marked as sold."
          : "Listing updated successfully."
      );
    } catch (error) {
      setActionError(
        error.message ||
          "Could not update listing. We need to add the owner action API route next."
      );
    } finally {
      setIsActionLoading(false);
    }
  }

  async function submitEnquiry(event) {
    event.preventDefault();

    setIsSendingEnquiry(true);
    setEnquirySuccess("");
    setEnquiryError("");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listing_id: id,
          buyer_name: enquiryForm.buyer_name,
          buyer_email: enquiryForm.buyer_email,
          buyer_phone: enquiryForm.buyer_phone,
          message: enquiryForm.message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not send enquiry.");
      }

      setEnquirySuccess(
        "Message sent to the seller. Your chat has been started."
      );
      setSentEnquiryId(result.enquiry?.id || "");
      setEnquiryForm((current) => ({
        ...current,
        message: "Hi, is this car still available?",
      }));
    } catch (error) {
      setEnquiryError(error.message || "Something went wrong.");
    } finally {
      setIsSendingEnquiry(false);
    }
  }

  async function submitReport(event) {
    event.preventDefault();

    setIsSendingReport(true);
    setReportSuccess("");
    setReportError("");

    try {
      const token = localStorage.getItem("kerbSessionToken");
      const response = await fetch("/api/listing-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-kerb-session-token": token } : {}),
        },
        body: JSON.stringify({
          listing_id: id,
          reason: reportForm.reason,
          reporter_email: reportForm.reporter_email,
          details: reportForm.details,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not send this report.");
      }

      setReportSuccess("Thanks. Kerb will review this listing.");
      setReportForm((current) => ({
        ...current,
        details: "",
      }));
    } catch (error) {
      setReportError(error.message || "Something went wrong.");
    } finally {
      setIsSendingReport(false);
    }
  }

  if (loading) {
    return (
      <main className="listing-page">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          unreadCount={unreadCount}
        />
        <section className="loading-box">Loading listing...</section>
        <style jsx global>{styles}</style>
      </main>
    );
  }

  if (errorMessage || !car) {
    return (
      <main className="listing-page">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          unreadCount={unreadCount}
        />
        <section className="empty-box">
          <h1>Listing not found</h1>
          <p>{errorMessage || "This listing is no longer available."}</p>
          <Link href="/browse">Back to browse</Link>
        </section>
        <style jsx global>{styles}</style>
      </main>
    );
  }

  return (
    <>
      <main className="listing-page">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          unreadCount={unreadCount}
        />

        <section className="breadcrumb-row">
          <Link href="/browse" className="back-link">
            <SvgIcon name="back" />
            Back to cars
          </Link>

          <span className="divider" />

          <Link href="/">Home</Link>
          <span>›</span>
          <Link href="/browse">Browse cars</Link>
          <span>›</span>
          <strong>{title}</strong>

          <div className="save-share">
            <button
              type="button"
              className={isSaved ? "save-button saved" : "save-button"}
              onClick={toggleSavedListing}
              disabled={isSavingListing}
            >
              <SvgIcon name="heart" />
              {isSaved ? "Saved" : "Save"}
            </button>

            <button type="button" onClick={shareListing}>
              <SvgIcon name="share" />
              Share
            </button>
          </div>
        </section>

        <section className="main-layout">
          <div className="left-column">
            <section className="gallery-card">
              <div className="main-photo">
                <img
                  src={photos[mainPhotoIndex]}
                  alt={title}
                  onError={(event) => {
                    event.currentTarget.src = "/cars/hero-car.png";
                  }}
                />

                {status === "sold" && <div className="sold-ribbon">Sold</div>}

                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="gallery-arrow left"
                      onClick={previousPhoto}
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      className="gallery-arrow right"
                      onClick={nextPhoto}
                    >
                      ›
                    </button>
                  </>
                )}

                <div className="photo-position">
                  {mainPhotoIndex + 1} / {photos.length}
                </div>
              </div>

              {photos.length > 1 && (
                <div className="thumb-row">
                  {photos.slice(0, 6).map((photo, index) => (
                    <button
                      type="button"
                      key={`${photo}-${index}`}
                      className={`thumb ${
                        index === mainPhotoIndex ? "active" : ""
                      }`}
                      onClick={() => setMainPhotoIndex(index)}
                    >
                      <img
                        src={photo}
                        alt={`${title} ${index + 1}`}
                        onError={(event) => {
                          event.currentTarget.src = "/cars/hero-car.png";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="title-section">
              <div className="title-top">
                {year && <span className="year-pill">{year}</span>}
                {status === "sold" && <span className="status-pill sold">Sold</span>}
                {status === "pending" && (
                  <span className="status-pill pending">Pending approval</span>
                )}
              </div>

              <h1>{title}</h1>

              {subtitle && <p className="subtitle">{subtitle}</p>}

              <h2>{formatPrice(price)}</h2>

              <div className="listing-summary-row">
                {location && (
                  <span>
                    <SvgIcon name="location" />
                    {location}
                  </span>
                )}

                {postedDate && (
                  <span>
                    <SvgIcon name="calendar" />
                    Listed {postedDate}
                  </span>
                )}

                {sellerType && (
                  <span>
                    <SvgIcon name="shield" />
                    {sellerType}
                  </span>
                )}
              </div>

              {specItems.length > 0 && (
                <div className="spec-grid">
                  {specItems.map((item) => (
                    <div className="spec-item" key={item.label}>
                      <SvgIcon name={item.icon} />
                      <div>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="details-card">
              <div className="section-heading">
                <span>Seller notes</span>
                <h2>Description</h2>
              </div>

              <p className="description-copy">
                {car.description ||
                  "No description has been added by the seller yet."}
              </p>
            </section>

            {features.length > 0 && (
              <section className="details-card">
                <div className="section-heading">
                  <span>Selected by seller</span>
                  <h2>Features</h2>
                </div>

                <div className="feature-grid">
                  {features.map((feature, index) => (
                    <span key={`${feature}-${index}`}>
                      <SvgIcon name="shield" />
                      {feature}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {listingItems.length > 0 && (
              <section className="details-card">
                <div className="section-heading">
                  <span>Listing details</span>
                  <h2>Seller and advert information</h2>
                </div>

                <div className="detail-list">
                  {listingItems.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="right-column">
            {isSellerOwner && (
              <section className="owner-card">
                <h2>Manage your listing</h2>

                <p>
                  These controls are only shown because this listing belongs to
                  your signed-in account.
                </p>

                <div className="owner-stats">
                  <div>
                    <span>Views</span>
                    <strong>{formatNumber(car.view_count || 0)}</strong>
                  </div>

                  {ownerAnalytics && (
                    <>
                      <div>
                        <span>7 days</span>
                        <strong>
                          {formatNumber(ownerAnalytics.views_last_7_days || 0)}
                        </strong>
                      </div>

                      <div>
                        <span>30 days</span>
                        <strong>
                          {formatNumber(ownerAnalytics.views_last_30_days || 0)}
                        </strong>
                      </div>

                      <div>
                        <span>Saves</span>
                        <strong>{formatNumber(ownerAnalytics.saves || 0)}</strong>
                      </div>

                      <div>
                        <span>Enquiries</span>
                        <strong>
                          {formatNumber(ownerAnalytics.enquiries || 0)}
                        </strong>
                      </div>
                    </>
                  )}

                  <div>
                    <span>Last viewed</span>
                    <strong>{formatDate(car.last_viewed_at) || "Not yet"}</strong>
                  </div>
                </div>

                {ownerInsight && (
                  <div className="owner-insight">
                    <strong>{ownerInsight.title}</strong>
                    <span>{ownerInsight.body}</span>
                  </div>
                )}

                {status !== "sold" && (
                  <div className="boost-panel">
                    <div className="boost-panel-heading">
                      <span>Optional paid boost</span>
                      <strong>
                        {isListingFeatured(car)
                          ? `Boost active${car.featured_until ? ` until ${formatDate(car.featured_until)}` : ""}`
                          : "Boost this listing"}
                      </strong>
                    </div>

                    <p>
                      Move this car into Kerb’s priority listing positions so it
                      has a better chance of being seen near the top of Browse
                      Cars and Featured Cars. Buyers will not see a public
                      boosted badge.
                    </p>

                    <div className="boost-benefits">
                      <span>Higher placement</span>
                      <span>Rotates fairly</span>
                      <span>No sale guarantee</span>
                    </div>

                    <div className="boost-prices">
                      <div>
                        <span>1 week</span>
                        <strong>£7.99</strong>
                      </div>
                      <div>
                        <span>2 weeks</span>
                        <strong>£13.99</strong>
                      </div>
                      <div>
                        <span>1 month</span>
                        <strong>£19.99</strong>
                      </div>
                    </div>

                    <div className="boost-action-grid">
                      <BoostListingButton
                        listingId={id}
                        planId="7-days"
                        label="1 week · £7.99"
                        source="listing-owner-card"
                        small
                      />
                      <BoostListingButton
                        listingId={id}
                        planId="14-days"
                        label="2 weeks · £13.99"
                        source="listing-owner-card"
                        small
                      />
                      <BoostListingButton
                        listingId={id}
                        planId="30-days"
                        label="1 month · £19.99"
                        source="listing-owner-card"
                        small
                      />
                    </div>
                  </div>
                )}

                {actionMessage && (
                  <div className="success-message">{actionMessage}</div>
                )}

                {actionError && (
                  <div className="error-message">{actionError}</div>
                )}

                <div className="owner-actions">
                  <Link href={`/listing/${id}/edit`} className="owner-button">
                    <SvgIcon name="edit" />
                    Edit listing
                  </Link>

                  {status !== "sold" && (
                    <button
                      type="button"
                      className="owner-button"
                      onClick={() => runOwnerAction("sold")}
                      disabled={isActionLoading}
                    >
                      <SvgIcon name="sold" />
                      Mark as sold
                    </button>
                  )}

                  <button
                    type="button"
                    className="owner-button danger"
                    onClick={() => runOwnerAction("delete")}
                    disabled={isActionLoading}
                  >
                    <SvgIcon name="trash" />
                    Delete listing
                  </button>
                </div>
              </section>
            )}

            <section className="contact-card">
              <h2>Contact the seller</h2>

              <div className="seller-mini">
                <div className="seller-icon">
                  <SvgIcon name="shield" />
                </div>

                <div>
                  <strong>{publicSellerName}</strong>
                  {showSellerName && sellerName && sellerType && (
                    <small>{sellerType}</small>
                  )}
                  {location && <span>{location}</span>}
                </div>
              </div>

              <div className="seller-facts">
                {postedDate && (
                  <div>
                    <span>Listed</span>
                    <strong>{postedDate}</strong>
                  </div>
                )}

                {listingReference && (
                  <div>
                    <span>Reference</span>
                    <strong>{listingReference}</strong>
                  </div>
                )}
              </div>

              {financeAvailable && (
                <div className="finance-note">
                  <SvgIcon name="finance" />
                  <div>
                    <strong>Finance available</strong>
                    <span>
                      This may be available from the seller or dealer. Kerb does
                      not provide finance directly.
                    </span>
                  </div>
                </div>
              )}

              <button
                className="primary-contact"
                type="button"
                onClick={() => {
                  setIsEnquiryOpen(true);
                  setEnquirySuccess("");
                  setEnquiryError("");
                }}
              >
                <SvgIcon name="message" />
                Message seller
              </button>

              {canShowSellerPhone && (
                <a className="phone-box" href={`tel:${sellerPhone}`}>
                  <SvgIcon name="phone" />
                  <strong>{sellerPhone}</strong>
                  <span>Call the seller directly</span>
                </a>
              )}

              <button
                type="button"
                className="report-link"
                onClick={() => {
                  setIsReportOpen(true);
                  setReportSuccess("");
                  setReportError("");
                }}
              >
                Report this listing
              </button>
            </section>

            <section className="trust-card">
              <h2>Buyer safety</h2>

              <ul>
                <li>View the car in daylight and check the V5C before paying.</li>
                <li>Never send a deposit if you have not seen the car or seller.</li>
                <li>Use secure payment and be careful with pressure to act fast.</li>
              </ul>

              <button
                type="button"
                onClick={() => {
                  setIsReportOpen(true);
                  setReportSuccess("");
                  setReportError("");
                }}
              >
                Report a concern
              </button>
            </section>
          </aside>
        </section>

        {isEnquiryOpen && (
          <div className="modal-backdrop">
            <div className="enquiry-modal">
              <button
                className="modal-close"
                type="button"
                onClick={() => setIsEnquiryOpen(false)}
              >
                ×
              </button>

              <h2>Message the seller</h2>
              <p>
                Send an enquiry about <strong>{title}</strong>. The seller can
                reply in Kerb chat. Your email is needed so they can respond.
              </p>

              <div className="enquiry-listing-preview">
                <img
                  src={photos[mainPhotoIndex] || photos[0] || "/cars/hero-car.png"}
                  alt={title}
                  onError={(event) => {
                    event.currentTarget.src = "/cars/hero-car.png";
                  }}
                />

                <div>
                  <strong>{title}</strong>
                  <span>
                    {formatPrice(price)}
                    {location ? ` · ${location}` : ""}
                  </span>
                </div>
              </div>

              {enquirySuccess ? (
                <div className="enquiry-complete">
                  <div className="success-message">{enquirySuccess}</div>

                  <div className="enquiry-complete-actions">
                    <button
                      type="button"
                      onClick={() => setIsEnquiryOpen(false)}
                    >
                      Close
                    </button>

                    <Link href="/account?tab=sent">View sent enquiries</Link>
                    {sentEnquiryId && (
                      <Link href={`/enquiries/${sentEnquiryId}`}>Open chat</Link>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={submitEnquiry} className="enquiry-form">
                  <label>
                    Your email
                    <input
                      type="email"
                      value={enquiryForm.buyer_email}
                      onChange={(event) =>
                        setEnquiryForm((current) => ({
                          ...current,
                          buyer_email: event.target.value,
                        }))
                      }
                      placeholder="Enter your email"
                      required
                    />
                  </label>

                  <div className="enquiry-fields optional-contact-fields">
                    <label>
                      Your name
                      <input
                        value={enquiryForm.buyer_name}
                        onChange={(event) =>
                          setEnquiryForm((current) => ({
                            ...current,
                            buyer_name: event.target.value,
                          }))
                        }
                        placeholder="Your name"
                        required
                      />
                    </label>

                    <label>
                      Your phone <span>Optional</span>
                      <input
                        value={enquiryForm.buyer_phone}
                        onChange={(event) =>
                          setEnquiryForm((current) => ({
                            ...current,
                            buyer_phone: event.target.value,
                          }))
                        }
                        placeholder="Phone number"
                      />
                    </label>
                  </div>

                  <label>
                    Message
                    <textarea
                      value={enquiryForm.message}
                      onChange={(event) =>
                        setEnquiryForm((current) => ({
                          ...current,
                          message: event.target.value,
                        }))
                      }
                      placeholder="Write your message"
                      required
                    />
                  </label>

                  {enquiryError && (
                    <div className="error-message">{enquiryError}</div>
                  )}

                  <button
                    className="send-enquiry-button"
                    type="submit"
                    disabled={isSendingEnquiry}
                  >
                    {isSendingEnquiry ? "Sending..." : "Send message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {isReportOpen && (
          <div className="modal-backdrop">
            <div className="enquiry-modal report-modal">
              <button
                className="modal-close"
                type="button"
                onClick={() => setIsReportOpen(false)}
              >
                ×
              </button>

              <h2>Report this listing</h2>
              <p>
                Tell Kerb what looks wrong with <strong>{title}</strong>. This
                does not message the seller.
              </p>

              {reportSuccess ? (
                <div className="enquiry-complete">
                  <div className="success-message">{reportSuccess}</div>

                  <div className="enquiry-complete-actions">
                    <button
                      type="button"
                      onClick={() => setIsReportOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitReport} className="enquiry-form">
                  <label>
                    Reason
                    <select
                      value={reportForm.reason}
                      onChange={(event) =>
                        setReportForm((current) => ({
                          ...current,
                          reason: event.target.value,
                        }))
                      }
                    >
                      <option value="Misleading information">
                        Misleading information
                      </option>
                      <option value="Suspicious price">Suspicious price</option>
                      <option value="Poor or fake photos">
                        Poor or fake photos
                      </option>
                      <option value="Seller behaviour">Seller behaviour</option>
                      <option value="Already sold">Already sold</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label>
                    Your email
                    <input
                      type="email"
                      value={reportForm.reporter_email}
                      onChange={(event) =>
                        setReportForm((current) => ({
                          ...current,
                          reporter_email: event.target.value,
                        }))
                      }
                      placeholder="Optional"
                    />
                  </label>

                  <label>
                    Details
                    <textarea
                      value={reportForm.details}
                      onChange={(event) =>
                        setReportForm((current) => ({
                          ...current,
                          details: event.target.value,
                        }))
                      }
                      placeholder="Add anything useful for moderation"
                    />
                  </label>

                  {reportError && (
                    <div className="error-message">{reportError}</div>
                  )}

                  <button
                    className="send-enquiry-button"
                    type="submit"
                    disabled={isSendingReport}
                  >
                    {isSendingReport ? "Sending..." : "Send report"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <style jsx global>{styles}</style>
    </>
  );
}

function Header({ currentUser, onLogout, unreadCount = 0 }) {
  return (
    <header className="topbar">
      <Link href="/" className="logo">
        Kerb
      </Link>

      <nav className="nav">
        <Link href="/browse" className="nav-item">
          <SvgIcon name="car" />
          Browse cars
        </Link>

        <Link href="/browse?category=newer-car" className="nav-item">
          <SvgIcon name="new" />
          New cars
        </Link>

        <Link href="/post-car" className="nav-item">
          <SvgIcon name="sell" />
          Sell your car
        </Link>

        <Link href="/browse?category=electric-hybrid" className="nav-item">
          <SvgIcon name="electric" />
          Electric
        </Link>

        <Link href="/browse?finance=true" className="nav-item">
          <SvgIcon name="finance" />
          Finance
        </Link>

        <Link href="/#guides" className="nav-item guides-link">
          <SvgIcon name="guides" />
          Guides
        </Link>
      </nav>

      <div className="top-actions">
        <Link
          href={currentUser ? "/account?tab=saved" : "/login"}
          className="saved-link"
        >
          <SvgIcon name="heart" />
          Saved
        </Link>

        {currentUser ? (
          <>
            <Link href="/account" className="signin-link">
              <SvgIcon name="user" />
              My account
              {unreadCount > 0 && (
                <span className="top-badge">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <button type="button" className="logout-link" onClick={onLogout}>
              Log out
            </button>
          </>
        ) : (
          <Link href="/login" className="signin-link">
            <SvgIcon name="user" />
            Sign in
          </Link>
        )}

        <Link href="/post-car" className="post-button">
          <SvgIcon name="plus" />
          Post your car
        </Link>
      </div>

      <SiteMenu
        currentUser={currentUser}
        onLogout={onLogout}
        unreadCount={unreadCount}
      />
    </header>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #f7f9fd;
    color: #101832;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system,
      BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input,
  textarea,
  select {
    font-family: inherit;
  }

  .listing-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(0, 72, 255, 0.05), transparent 30%),
      #f7f9fd;
  }

  .svg-icon {
    width: 20px;
    height: 20px;
    flex: 0 0 auto;
  }

  .topbar {
    min-height: 82px;
    padding: 0 44px;
    display: flex;
    align-items: center;
    gap: 22px;
    background: rgba(255, 255, 255, 0.96);
    border-bottom: 1px solid #e7edf7;
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(16px);
  }

  .logo {
    font-size: 42px;
    line-height: 1;
    font-weight: 950;
    color: #0b45ff;
    letter-spacing: -2px;
    white-space: nowrap;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .nav-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #111a36;
    font-size: 14px;
    font-weight: 850;
    white-space: nowrap;
    padding: 10px 8px;
  }

  .nav-item .svg-icon {
    width: 17px;
    height: 17px;
  }

  .top-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-left: auto;
  }

  .saved-link,
  .signin-link,
  .logout-link {
    border: none;
    background: transparent;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #26304d;
    font-size: 14px;
    font-weight: 750;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
  }

  .logout-link {
    color: #c01818;
  }

  .top-badge {
    min-width: 18px;
    height: 18px;
    border-radius: 999px;
    background: #d7193f;
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    font-size: 10px;
    font-weight: 950;
    line-height: 1;
  }

  .post-button {
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 0 20px;
    border-radius: 13px;
    background: #0b45ff;
    color: white;
    font-size: 14px;
    font-weight: 900;
    box-shadow: 0 12px 26px rgba(11, 69, 255, 0.2);
    white-space: nowrap;
  }

  .breadcrumb-row {
    max-width: 1380px;
    margin: 0 auto;
    padding: 24px 28px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #44506c;
    font-size: 14px;
    font-weight: 700;
  }

  .breadcrumb-row strong {
    color: #101832;
  }

  .back-link {
    color: #0b45ff;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 850;
  }

  .divider {
    width: 1px;
    height: 20px;
    background: #d8dfeb;
  }

  .save-share {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .save-share a,
  .save-share button {
    border: none;
    background: transparent;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #29324d;
    font-size: 14px;
    font-weight: 750;
    cursor: pointer;
  }

  .save-share .save-button.saved {
    color: #d7193f;
  }

  .save-share .save-button.saved .svg-icon path {
    fill: currentColor;
  }

  .save-share .save-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .main-layout {
    max-width: 1380px;
    margin: 0 auto;
    padding: 0 28px 60px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 390px;
    gap: 26px;
    align-items: start;
  }

  .left-column {
    display: grid;
    gap: 18px;
  }

  .right-column {
    display: grid;
    gap: 18px;
    position: sticky;
    top: 104px;
  }

  .gallery-card,
  .title-section,
  .details-card,
  .contact-card,
  .owner-card,
  .trust-card {
    background: white;
    border: 1px solid #e4eaf4;
    border-radius: 20px;
    box-shadow: 0 12px 34px rgba(18, 32, 70, 0.06);
    animation: listingFadeUp 0.42s ease both;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .gallery-card:hover,
  .title-section:hover,
  .details-card:hover,
  .contact-card:hover,
  .owner-card:hover,
  .trust-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 46px rgba(18, 32, 70, 0.1);
  }

  .gallery-card {
    overflow: hidden;
  }

  .main-photo {
    position: relative;
    height: clamp(520px, 42vw, 620px);
    overflow: hidden;
    background: #eef2f7;
  }

  .main-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    display: block;
    background: #eef2f7;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.22s ease;
  }

  .thumb:hover img {
    transform: scale(1.04);
  }

  .sold-ribbon {
    position: absolute;
    left: 18px;
    top: 18px;
    background: #101832;
    color: white;
    border-radius: 999px;
    padding: 9px 16px;
    font-size: 13px;
    font-weight: 950;
  }

  .gallery-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: white;
    color: #101832;
    font-size: 34px;
    line-height: 1;
    display: grid;
    place-items: center;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .gallery-arrow:hover {
    transform: translateY(-50%) scale(1.04);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
  }

  .gallery-arrow.left {
    left: 18px;
  }

  .gallery-arrow.right {
    right: 18px;
  }

  .photo-position {
    position: absolute;
    right: 16px;
    bottom: 16px;
    min-width: 58px;
    height: 36px;
    border-radius: 10px;
    background: rgba(16, 24, 50, 0.68);
    color: white;
    display: grid;
    place-items: center;
    font-weight: 850;
  }

  .thumb-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    padding: 12px;
  }

  .thumb {
    position: relative;
    height: 92px;
    padding: 0;
    border: none;
    border-radius: 12px;
    overflow: hidden;
    background: #eef2f7;
    cursor: pointer;
  }

  .thumb.active {
    outline: 3px solid #0b45ff;
  }

  .title-section {
    padding: 26px;
  }

  .title-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .year-pill,
  .status-pill {
    display: inline-flex;
    height: 30px;
    align-items: center;
    border-radius: 999px;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 900;
  }

  .year-pill {
    background: #eef3ff;
    color: #101832;
  }

  .status-pill.sold {
    background: #101832;
    color: white;
  }

  .status-pill.pending {
    background: #fff7e8;
    color: #a15c00;
  }

  .title-section h1 {
    margin: 0 0 8px;
    font-size: 38px;
    line-height: 1;
    letter-spacing: -1.4px;
    color: #101832;
  }

  .subtitle {
    margin: 0 0 18px;
    color: #3f4a66;
    font-size: 17px;
    font-weight: 650;
  }

  .title-section h2 {
    margin: 0;
    font-size: 32px;
    letter-spacing: -1px;
  }

  .listing-summary-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  .listing-summary-row span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    color: #3f4a66;
    border-radius: 999px;
    padding: 9px 12px;
    font-size: 13px;
    font-weight: 850;
  }

  .listing-summary-row .svg-icon {
    width: 16px;
    height: 16px;
    color: #0b45ff;
  }

  .spec-grid {
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .spec-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 15px;
    padding: 15px;
  }

  .spec-item .svg-icon {
    color: #0b45ff;
    width: 22px;
    height: 22px;
    margin-top: 2px;
  }

  .spec-item span {
    display: block;
    color: #647089;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 4px;
  }

  .spec-item strong {
    color: #101832;
    font-size: 14px;
    font-weight: 950;
  }

  .details-card {
    padding: 26px;
  }

  .section-heading {
    margin-bottom: 18px;
  }

  .section-heading span {
    display: block;
    color: #0b45ff;
    font-size: 12px;
    font-weight: 950;
    margin-bottom: 6px;
    text-transform: uppercase;
  }

  .section-heading h2,
  .details-card h2 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.7px;
  }

  .details-card p {
    margin: 0;
    color: #3f4a66;
    line-height: 1.7;
    white-space: pre-wrap;
  }

  .description-copy {
    border-left: 4px solid #dce6ff;
    padding-left: 16px;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .detail-item {
    min-height: 74px;
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 15px;
    padding: 14px;
    display: grid;
    align-content: center;
    gap: 5px;
  }

  .detail-item span,
  .detail-list span,
  .seller-facts span {
    color: #647089;
    font-size: 12px;
    font-weight: 900;
  }

  .detail-item strong,
  .detail-list strong,
  .seller-facts strong {
    color: #101832;
    font-size: 15px;
    font-weight: 950;
    word-break: break-word;
  }

  .detail-list {
    border: 1px solid #e5eaf4;
    border-radius: 16px;
    overflow: hidden;
  }

  .detail-list div {
    min-height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 14px 16px;
    background: white;
  }

  .detail-list div + div {
    border-top: 1px solid #e5eaf4;
  }

  .detail-list div:nth-child(odd) {
    background: #f9fbff;
  }

  .feature-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .feature-grid span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #f0f3f8;
    color: #25304c;
    border-radius: 999px;
    padding: 11px 15px;
    font-size: 13px;
    font-weight: 850;
  }

  .feature-grid .svg-icon {
    color: #0b45ff;
    width: 17px;
    height: 17px;
  }

  .contact-card,
  .owner-card,
  .trust-card {
    padding: 24px;
  }

  .contact-card h2,
  .owner-card h2,
  .trust-card h2 {
    margin: 0 0 16px;
    font-size: 24px;
    letter-spacing: -0.6px;
  }

  .owner-card p {
    margin: 0 0 16px;
    color: #5b667d;
    line-height: 1.5;
  }

  .owner-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .owner-stats div {
    border: 1px solid #e5eaf4;
    background: #f7f9fd;
    border-radius: 14px;
    padding: 13px;
  }

  .owner-stats span {
    display: block;
    color: #647089;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 5px;
  }

  .owner-stats strong {
    color: #101832;
    font-size: 15px;
    font-weight: 950;
  }

  .owner-insight {
    display: grid;
    gap: 6px;
    border: 1px solid #dbe7ff;
    border-radius: 16px;
    background: #f3f7ff;
    padding: 14px;
    margin-bottom: 16px;
  }

  .owner-insight strong {
    color: #0b45ff;
    font-weight: 950;
  }

  .owner-insight span {
    color: #59667f;
    font-size: 13px;
    font-weight: 750;
    line-height: 1.45;
  }

  .boost-panel {
    display: grid;
    gap: 13px;
    border: 1px solid #dbe7ff;
    border-radius: 18px;
    background:
      linear-gradient(135deg, #f7faff, #ffffff);
    padding: 16px;
    margin-bottom: 16px;
  }

  .boost-panel-heading {
    display: grid;
    gap: 4px;
  }

  .boost-panel-heading span {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    background: #eaf1ff;
    color: #0b45ff;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 950;
  }

  .boost-panel-heading strong {
    color: #101832;
    font-size: 19px;
    font-weight: 950;
    letter-spacing: -0.4px;
  }

  .boost-panel p {
    color: #59667f;
    font-size: 13px;
    font-weight: 760;
    line-height: 1.5;
    margin: 0;
  }

  .boost-benefits {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
  }

  .boost-benefits span {
    border: 1px solid #dfe7f7;
    background: white;
    color: #25304a;
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 11px;
    font-weight: 950;
  }

  .boost-prices {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .boost-prices div {
    border: 1px solid #dfe7f7;
    background: white;
    border-radius: 14px;
    padding: 11px;
    display: grid;
    gap: 3px;
  }

  .boost-prices span {
    color: #657089;
    font-size: 11px;
    font-weight: 950;
  }

  .boost-prices strong {
    color: #0b45ff;
    font-size: 17px;
    font-weight: 950;
  }

  .boost-action-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .boost-action-grid .boostButtonWrap {
    width: 100%;
  }

  .boost-action-grid button {
    width: 100%;
  }

  .owner-actions {
    display: grid;
    gap: 10px;
  }

  .owner-button {
    min-height: 50px;
    border-radius: 13px;
    border: 1px solid #dce6ff;
    background: #eef3ff;
    color: #0b45ff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    font-size: 14px;
    font-weight: 950;
    cursor: pointer;
  }

  .owner-button.danger {
    background: #fff1f1;
    border-color: #ffd1d1;
    color: #b42318;
  }

  .owner-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .seller-mini {
    display: flex;
    align-items: center;
    gap: 13px;
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 15px;
    padding: 15px;
    margin-bottom: 16px;
  }

  .seller-icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: #eef3ff;
    color: #0b45ff;
    display: grid;
    place-items: center;
  }

  .seller-mini strong,
  .seller-mini small,
  .seller-mini span {
    display: block;
  }

  .seller-mini strong {
    color: #101832;
    font-weight: 950;
  }

  .seller-mini span {
    color: #5b667d;
    font-size: 14px;
    margin-top: 3px;
  }

  .seller-mini small {
    color: #0b45ff;
    font-size: 12px;
    font-weight: 900;
    margin-top: 2px;
  }

  .seller-facts {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .seller-facts div {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 14px;
    padding: 13px;
    display: grid;
    gap: 5px;
  }

  .finance-note {
    display: flex;
    gap: 12px;
    background: #f8fbff;
    border: 1px solid #dce8ff;
    border-radius: 15px;
    padding: 15px;
    margin-bottom: 16px;
  }

  .finance-note .svg-icon {
    color: #0b45ff;
  }

  .finance-note strong,
  .finance-note span {
    display: block;
  }

  .finance-note span {
    color: #5b667d;
    font-size: 13px;
    line-height: 1.5;
    margin-top: 4px;
  }

  .primary-contact,
  .phone-box {
    width: 100%;
    min-height: 58px;
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 900;
    cursor: pointer;
  }

  .primary-contact {
    border: none;
    background: #0b45ff;
    color: white;
    box-shadow: 0 12px 28px rgba(11, 69, 255, 0.22);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .primary-contact:hover,
  .phone-box:hover,
  .owner-button:hover,
  .post-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 34px rgba(11, 69, 255, 0.22);
  }

  .phone-box {
    margin-top: 12px;
    min-height: 74px;
    flex-direction: column;
    border: 1.5px solid #0b45ff;
    color: #0b45ff;
    background: white;
  }

  .phone-box.inactive {
    border-color: #dfe6f1;
    color: #647089;
    cursor: default;
  }

  .phone-box span {
    color: #48536e;
    font-size: 13px;
    font-weight: 650;
  }

  .report-link,
  .trust-card button {
    border: none;
    background: transparent;
    color: #0b45ff;
    font-size: 14px;
    font-weight: 950;
    cursor: pointer;
    padding: 0;
    width: fit-content;
  }

  .report-link {
    margin-top: 8px;
  }

  .trust-card {
    background: white;
    border: 1px solid #e4eaf4;
    border-radius: 20px;
    box-shadow: 0 12px 34px rgba(18, 32, 70, 0.06);
    display: grid;
    gap: 4px;
    animation: listingFadeUp 0.42s ease both;
  }

  .trust-card ul {
    margin: 0 0 4px;
    padding-left: 18px;
    display: grid;
    gap: 9px;
    color: #59667f;
    font-size: 13px;
    font-weight: 750;
    line-height: 1.45;
  }

  .loading-box,
  .empty-box {
    max-width: 720px;
    margin: 100px auto;
    background: white;
    border: 1px solid #e4eaf4;
    border-radius: 18px;
    padding: 44px;
    text-align: center;
    box-shadow: 0 16px 44px rgba(18, 32, 70, 0.08);
  }

  .empty-box h1 {
    margin: 0 0 10px;
  }

  .empty-box p {
    color: #4f5b76;
  }

  .empty-box a {
    margin-top: 22px;
    display: inline-flex;
    background: #0b45ff;
    color: white;
    border-radius: 12px;
    padding: 14px 20px;
    font-weight: 900;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(8, 15, 35, 0.55);
    display: grid;
    place-items: center;
    padding: 20px;
  }

  .enquiry-modal {
    width: min(520px, 100%);
    max-height: calc(100dvh - 40px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    position: relative;
    background: white;
    border: 1px solid #e4eaf4;
    border-radius: 22px;
    padding: 30px;
    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.24);
  }

  .modal-close {
    position: absolute;
    right: 18px;
    top: 16px;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: #f2f5fb;
    color: #101832;
    font-size: 26px;
    line-height: 1;
    cursor: pointer;
  }

  .enquiry-modal h2 {
    margin: 0 0 10px;
    font-size: 28px;
    letter-spacing: -0.8px;
  }

  .enquiry-modal p {
    margin: 0 0 22px;
    color: #4f5b76;
    line-height: 1.55;
  }

  .enquiry-listing-preview {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 14px;
    align-items: center;
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 16px;
    padding: 12px;
    margin-bottom: 18px;
  }

  .enquiry-listing-preview img {
    width: 110px;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    border-radius: 12px;
    background: #eef2f7;
  }

  .enquiry-listing-preview strong,
  .enquiry-listing-preview span {
    display: block;
  }

  .enquiry-listing-preview strong {
    margin-bottom: 4px;
    color: #071126;
  }

  .enquiry-listing-preview span {
    color: #657189;
    font-weight: 800;
    font-size: 13px;
  }

  .enquiry-form {
    display: grid;
    gap: 14px;
  }

  .enquiry-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .enquiry-form label {
    display: grid;
    gap: 8px;
    color: #101832;
    font-size: 14px;
    font-weight: 900;
  }

  .enquiry-form label span {
    color: #7a8598;
    font-size: 12px;
    font-weight: 800;
  }

  .optional-contact-fields {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .enquiry-form input,
  .enquiry-form select,
  .enquiry-form textarea {
    width: 100%;
    border: 1px solid #dfe6f1;
    border-radius: 13px;
    background: #fbfcff;
    color: #101832;
    padding: 14px 15px;
    font-size: 15px;
    outline: none;
  }

  .enquiry-form select {
    height: 48px;
    background: white;
  }

  .enquiry-form textarea {
    min-height: 120px;
    resize: vertical;
  }

  .enquiry-form input:focus,
  .enquiry-form select:focus,
  .enquiry-form textarea:focus {
    border-color: #0b45ff;
    box-shadow: 0 0 0 4px rgba(11, 69, 255, 0.1);
  }

  .success-message {
    background: #eafaf0;
    color: #137333;
    border: 1px solid #bce8ca;
    border-radius: 12px;
    padding: 13px 14px;
    font-weight: 850;
  }

  .error-message {
    background: #fff1f1;
    color: #b42318;
    border: 1px solid #ffd1d1;
    border-radius: 12px;
    padding: 13px 14px;
    font-weight: 850;
  }

  .send-enquiry-button {
    height: 52px;
    border: none;
    border-radius: 14px;
    background: #0b45ff;
    color: white;
    font-size: 15px;
    font-weight: 950;
    cursor: pointer;
    box-shadow: 0 12px 26px rgba(11, 69, 255, 0.22);
  }

  .send-enquiry-button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .enquiry-complete {
    display: grid;
    gap: 14px;
  }

  .enquiry-complete-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .enquiry-complete-actions button,
  .enquiry-complete-actions a {
    border: none;
    border-radius: 13px;
    padding: 13px 18px;
    font-weight: 950;
    text-decoration: none;
    cursor: pointer;
  }

  .enquiry-complete-actions button {
    background: #eef3ff;
    color: #0048ff;
  }

  .enquiry-complete-actions a {
    background: #0b45ff;
    color: white;
  }

  @keyframes listingFadeUp {
    from {
      opacity: 0;
      transform: translateY(14px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 1200px) {
    .topbar {
      min-height: auto;
      padding: 18px 22px;
      flex-wrap: wrap;
      gap: 14px;
    }

    .logo {
      margin-right: auto;
    }

    .nav {
      order: 3;
      width: 100%;
      overflow-x: auto;
      padding-bottom: 4px;
      flex: 0 0 100%;
    }

    .saved-link,
    .signin-link,
    .logout-link {
      display: none;
    }

    .main-layout {
      grid-template-columns: 1fr;
    }

    .right-column {
      position: static;
    }

    .spec-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .detail-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .topbar {
      padding: 12px 14px;
      flex-wrap: nowrap;
      min-height: 72px;
    }

    .logo {
      font-size: 34px;
    }

    .nav {
      display: none;
    }

    .post-button {
      height: 46px;
      padding: 0 12px;
      font-size: 13px;
    }

    .breadcrumb-row {
      padding: 14px 16px;
      overflow-x: auto;
      white-space: nowrap;
      gap: 10px;
    }

    .save-share {
      display: none;
    }

    .main-layout {
      padding: 0 16px 44px;
      gap: 18px;
    }

    .main-photo {
      height: 330px;
    }

    .thumb-row {
      grid-template-columns: repeat(4, minmax(78px, 1fr));
      overflow-x: auto;
      padding-bottom: 14px;
    }

    .thumb {
      height: 72px;
    }

    .title-section,
    .details-card,
    .contact-card,
    .owner-card,
    .trust-card {
      padding: 20px;
    }

    .title-section h1 {
      font-size: 30px;
    }

    .title-section h2 {
      font-size: 28px;
    }

    .spec-grid {
      grid-template-columns: 1fr;
    }

    .seller-facts {
      grid-template-columns: 1fr;
    }

    .primary-contact,
    .phone-box {
      min-height: 54px;
      font-size: 15px;
    }

    .modal-backdrop {
      align-items: start;
      place-items: start center;
      padding: max(10px, env(safe-area-inset-top)) 10px max(22px, env(safe-area-inset-bottom));
    }

    .enquiry-modal {
      width: min(100%, 430px);
      max-height: calc(100dvh - 20px);
      padding: 20px;
      border-radius: 24px;
    }

    .modal-close {
      position: sticky;
      top: 0;
      margin-left: auto;
      display: flex;
      z-index: 2;
    }

    .enquiry-modal h2 {
      font-size: 32px;
      line-height: 1;
      margin-top: -38px;
      padding-right: 54px;
    }

    .enquiry-modal p {
      font-size: 16px;
      line-height: 1.45;
      margin-bottom: 16px;
    }

    .enquiry-fields,
    .enquiry-listing-preview {
      grid-template-columns: 1fr;
    }

    .enquiry-listing-preview {
      margin-bottom: 14px;
      padding: 10px;
    }

    .enquiry-listing-preview img {
      width: 100%;
      max-height: 210px;
      object-fit: cover;
    }

    .enquiry-form {
      gap: 12px;
      padding-bottom: 18px;
    }

    .enquiry-form input,
    .enquiry-form textarea {
      min-height: 52px;
      font-size: 16px;
    }

    .enquiry-form textarea {
      min-height: 96px;
    }

    .send-enquiry-button {
      min-height: 54px;
    }
  }
`;

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

const currentYear = new Date().getFullYear();

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

function getCarPrice(car) {
  return Number(car.price || car.asking_price || car.listing_price || 0);
}

function normaliseCategory(value) {
  const category = String(value || "").trim().toLowerCase();

  return [
    "general",
    "first-car",
    "performance",
    "family-suv",
    "electric-hybrid",
    "newer-car",
  ].includes(category)
    ? category
    : "";
}

function categoryText(car) {
  return [
    car.title,
    car.make,
    car.model,
    car.variant,
    car.model_detail,
    car.fuel,
    car.fuel_type,
    car.body_type,
    car.condition,
    car.description,
    Array.isArray(car.features) ? car.features.join(" ") : car.features,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function listingMatchesCategory(car, category) {
  const selectedCategory = normaliseCategory(category);

  if (!selectedCategory || selectedCategory === "general") return true;

  const listingCategory = normaliseCategory(car.listing_category);

  if (listingCategory === selectedCategory) return true;

  const text = categoryText(car);
  const fuel = String(car.fuel || car.fuel_type || "").toLowerCase();
  const bodyType = String(car.body_type || "").toLowerCase();
  const condition = String(car.condition || "").toLowerCase();
  const price = getCarPrice(car);
  const year = Number(car.year || car.registration_year || 0);

  if (selectedCategory === "first-car") {
    return (
      (price > 0 && price <= 8000) ||
      includesAny(text, [
        "first car",
        "learner",
        "cheap insurance",
        "low insurance",
        "new driver",
      ])
    );
  }

  if (selectedCategory === "performance") {
    return includesAny(text, [
      "performance",
      "m sport",
      "amg",
      "s line",
      "gti",
      "gtd",
      "golf r",
      "m135",
      "m140",
      "m240",
      "m340",
      "m3",
      "m4",
      "m5",
      "rs3",
      "rs4",
      "rs5",
      "s3",
      "s4",
      "s5",
      "type r",
      "vrs",
      "cupra",
      "nismo",
    ]);
  }

  if (selectedCategory === "family-suv") {
    return (
      bodyType.includes("suv") ||
      bodyType.includes("4x4") ||
      includesAny(text, ["family suv", "seven seats", "7 seats"])
    );
  }

  if (selectedCategory === "electric-hybrid") {
    return fuel.includes("electric") || fuel.includes("hybrid");
  }

  if (selectedCategory === "newer-car") {
    return (
      condition.includes("new") ||
      condition.includes("nearly new") ||
      year >= currentYear - 1
    );
  }

  return false;
}

function getCategoryImage(category, listings) {
  const match = listings.find(
    (car) =>
      listingMatchesCategory(car, category) &&
      getListingImage(car) !== "/cars/hero-car.png"
  );

  return match
    ? getListingImage(match)
    : getListingImage(listings[0] || {});
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
    },
    {
      icon: "new",
      title: "New cars",
      text: "Browse newer cars listed on Kerb",
      href: "/browse?category=newer-car",
      category: "newer-car",
    },
    {
      icon: "electric",
      title: "Electric cars",
      text: "Find electric and hybrid cars",
      href: "/browse?category=electric-hybrid",
      category: "electric-hybrid",
    },
    {
      icon: "body",
      title: "Family SUVs",
      text: "Practical cars for everyday life",
      href: "/browse?category=family-suv",
      category: "family-suv",
    },
    {
      icon: "shield",
      title: "First cars",
      text: "Affordable, easy-going picks",
      href: "/browse?category=first-car",
      category: "first-car",
    },
    {
      icon: "mileage",
      title: "Performance",
      text: "Powerful cars built for driving",
      href: "/browse?category=performance",
      category: "performance",
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
              <img
                src={getCategoryImage(item.category, approvedListings)}
                alt=""
              />

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
          gap: 14px;
          margin: 20px 0;
        }

        .categoryCard {
          display: grid;
          grid-template-columns: 76px minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
          background: white;
          border: 1px solid #e6ebf4;
          border-radius: 18px;
          padding: 12px;
          box-shadow: 0 8px 25px rgba(10, 20, 40, 0.04);
          text-decoration: none;
          color: inherit;
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            border-color 0.18s ease;
          min-width: 0;
          min-height: 82px;
        }

        .categoryCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 35px rgba(10, 20, 40, 0.08);
          border-color: #d6e1f4;
        }

        .categoryImage {
          width: 76px;
          height: 54px;
          border-radius: 14px;
          background: #edf3ff;
          overflow: hidden;
          position: relative;
        }

        .categoryImage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .categoryImage span {
          position: absolute;
          left: 6px;
          bottom: 6px;
          width: 24px;
          height: 24px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.92);
          color: #0048ff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 12px rgba(10, 20, 40, 0.12);
        }

        .categoryImage .icon {
          width: 15px;
          height: 15px;
        }

        .categoryCard h3 {
          margin: 0 0 4px;
          font-size: 14px;
          line-height: 1.1;
        }

        .categoryCard p {
          margin: 0;
          font-size: 11px;
          color: #657189;
          line-height: 1.35;
        }

        .arrow {
          margin-left: auto;
          font-size: 26px;
          color: #172033;
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

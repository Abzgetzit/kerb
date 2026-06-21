"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import SiteMenu from "../components/SiteMenu";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const currentYear = new Date().getFullYear();

const defaultFilters = {
  location: "",
  make: "",
  model: "",
  priceMin: "",
  priceMax: "",
  mileageMin: "",
  mileageMax: "",
  bodyType: "",
  fuel: "",
  condition: "",
  finance: "",
  category: "",
};

const categoryOptions = [
  { value: "", label: "All categories" },
  { value: "first-car", label: "First cars" },
  { value: "performance", label: "Performance cars" },
  { value: "family-suv", label: "Family SUVs" },
  { value: "electric-hybrid", label: "Electric & hybrid" },
  { value: "newer-car", label: "Newer cars" },
];

const categoryLabels = new Map(
  categoryOptions.map((category) => [category.value, category.label])
);

const mileageOptions = Array.from({ length: 16 }, (_, index) => index * 10000);

const approximateUkLocations = [
  { keys: ["leicester", "le1", "le2", "le3", "le4", "le5"], lat: 52.6369, lng: -1.1398 },
  { keys: ["birmingham", "b1", "b2", "b3", "b4", "b5"], lat: 52.4862, lng: -1.8904 },
  { keys: ["london", "e1", "ec1", "n1", "nw1", "se1", "sw1", "w1"], lat: 51.5072, lng: -0.1276 },
  { keys: ["manchester", "m1", "m2", "m3", "m4"], lat: 53.4808, lng: -2.2426 },
  { keys: ["nottingham", "ng1", "ng2", "ng3"], lat: 52.9548, lng: -1.1581 },
  { keys: ["coventry", "cv1", "cv2", "cv3"], lat: 52.4068, lng: -1.5197 },
  { keys: ["derby", "de1", "de2", "de3"], lat: 52.9225, lng: -1.4746 },
  { keys: ["loughborough", "le11", "le12"], lat: 52.7721, lng: -1.2062 },
  { keys: ["northampton", "nn1", "nn2", "nn3"], lat: 52.2405, lng: -0.9027 },
  { keys: ["sheffield", "s1", "s2", "s3"], lat: 53.3811, lng: -1.4701 },
  { keys: ["leeds", "ls1", "ls2", "ls3"], lat: 53.8008, lng: -1.5491 },
  { keys: ["bristol", "bs1", "bs2", "bs3"], lat: 51.4545, lng: -2.5879 },
  { keys: ["liverpool", "l1", "l2", "l3"], lat: 53.4084, lng: -2.9916 },
  { keys: ["cardiff", "cf10", "cf11", "cf14"], lat: 51.4816, lng: -3.1791 },
  { keys: ["glasgow", "g1", "g2", "g3"], lat: 55.8642, lng: -4.2518 },
  { keys: ["edinburgh", "eh1", "eh2", "eh3"], lat: 55.9533, lng: -3.1883 },
];

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "Price on request";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatMileageOption(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "Any";
  if (number === 0) return "0 miles";
  if (number >= 150000) return "150,000+ miles";

  return `${new Intl.NumberFormat("en-GB").format(number)} miles`;
}

function getTitle(car) {
  if (car.title) return car.title;

  const title = [car.make, car.model].filter(Boolean).join(" ").trim();

  return title || "Car listing";
}

function getSubtitle(car) {
  const subtitle = [
    car.variant,
    car.engine_size,
    car.fuel,
    car.fuel_type,
    car.transmission,
    car.gearbox,
    car.body_type,
  ]
    .filter(Boolean)
    .join(" ");

  return subtitle || "Used car listed on Kerb";
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

function getMileage(car) {
  const value = car.mileage || car.miles;
  const number = Number(value);

  if (!value) return "";
  if (!Number.isFinite(number)) return value;

  return `${new Intl.NumberFormat("en-GB").format(number)} miles`;
}

function getYearText(car) {
  if (car.year) return String(car.year);
  if (car.registration_year) return String(car.registration_year);
  return "";
}

function getCarPrice(car) {
  return Number(car.price || car.asking_price || car.listing_price || 0);
}

function getCarMileage(car) {
  return Number(car.mileage || car.miles || 0);
}

function includesText(value, query) {
  return String(value || "").toLowerCase().includes(String(query || "").toLowerCase());
}

function cleanMoneyInput(value) {
  return String(value || "").replace(/[^0-9]/g, "").slice(0, 9);
}

function normaliseLocationText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getApproximateLocation(value) {
  const text = normaliseLocationText(value);

  if (!text) return null;

  return (
    approximateUkLocations.find((location) =>
      location.keys.some((key) => text.includes(key))
    ) || null
  );
}

function carHasFinance(car) {
  const financeText = [
    car.finance,
    car.finance_available,
    car.finance_option,
    car.finance_options,
    car.payment_options,
    car.seller_finance,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    car.finance === true ||
    car.finance_available === true ||
    financeText.includes("finance") ||
    financeText.includes("available")
  );
}

const listingCategoryValues = new Set([
  "first-car",
  "performance",
  "family-suv",
  "electric-hybrid",
  "newer-car",
]);

function normaliseCategory(value) {
  const category = String(value || "").trim().toLowerCase();

  if (category === "general") return "";

  return listingCategoryValues.has(category) ? category : "";
}

function getCategoryLabel(value) {
  const category = normaliseCategory(value);

  if (!category) return "";

  return categoryLabels.get(category) || "";
}

function textValue(value) {
  if (!value) return "";

  if (Array.isArray(value)) return value.join(" ");

  if (typeof value === "object") {
    return Object.values(value).filter(Boolean).join(" ");
  }

  return String(value);
}

function categorySearchText(car) {
  return [
    car.title,
    car.make,
    car.model,
    car.variant,
    car.model_detail,
    car.listing_category,
    car.fuel,
    car.fuel_type,
    car.body_type,
    car.condition,
    car.description,
    car.features,
  ]
    .map(textValue)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function carMatchesCategory(car, category) {
  const selectedCategory = normaliseCategory(category);

  if (!selectedCategory || selectedCategory === "general") return true;

  const listingCategory = normaliseCategory(car.listing_category);

  if (listingCategory === selectedCategory) return true;

  const text = categorySearchText(car);
  const fuel = String(car.fuel || car.fuel_type || "").toLowerCase();
  const bodyType = String(car.body_type || "").toLowerCase();
  const condition = String(car.condition || "").toLowerCase();
  const year = Number(car.year || car.registration_year || 0);
  const price = getCarPrice(car);
  const mileage = getCarMileage(car);

  if (selectedCategory === "first-car") {
    const isSmallOrEasyCar = includesAny(text, [
      "abarth 595",
      "aygo",
      "c1",
      "citigo",
      "clio",
      "corsa",
      "fabia",
      "fiat 500",
      "fiesta",
      "hatchback",
      "i10",
      "i20",
      "ibiza",
      "jazz",
      "mazda2",
      "micra",
      "panda",
      "picanto",
      "polo",
      "rio",
      "sandero",
      "swift",
      "up",
      "yaris",
    ]);

    return (
      includesAny(text, [
        "first car",
        "learner",
        "cheap insurance",
        "low insurance",
        "new driver",
        "ideal first",
      ]) ||
      (price > 0 &&
        price <= 10000 &&
        (!mileage || mileage <= 90000) &&
        (bodyType.includes("hatchback") || isSmallOrEasyCar))
    );
  }

  if (selectedCategory === "performance") {
    return includesAny(text, [
      "performance",
      "hot hatch",
      "sports",
      "sport",
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
      "f-type",
      "v6",
      "v8",
      "quadrifoglio",
    ]);
  }

  if (selectedCategory === "family-suv") {
    return (
      bodyType.includes("suv") ||
      bodyType.includes("4x4") ||
      bodyType.includes("crossover") ||
      includesAny(text, [
        "family suv",
        "seven seats",
        "7 seats",
        "7-seater",
        "qashqai",
        "sportage",
        "tucson",
        "tiguan",
        "kuga",
        "rav4",
        "x3",
        "x5",
        "q5",
        "glc",
        "xc60",
        "xc90",
      ])
    );
  }

  if (selectedCategory === "electric-hybrid") {
    return (
      fuel.includes("electric") ||
      fuel.includes("hybrid") ||
      includesAny(text, [
        "bev",
        "ev",
        "phev",
        "plug-in",
        "e-tron",
        "ioniq",
        "leaf",
        "model 3",
        "model y",
        "taycan",
        "id.3",
        "id.4",
      ])
    );
  }

  if (selectedCategory === "newer-car") {
    return (
      condition.includes("new") ||
      condition.includes("nearly new") ||
      year >= currentYear - 2 ||
      (year >= currentYear - 3 && mileage > 0 && mileage <= 15000)
    );
  }

  return false;
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
    location: (
      <>
        <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
    price: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9.5A3 3 0 0 0 12.4 8H11a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-1.4A3 3 0 0 1 9 14.5" />
        <path d="M12 6v12" />
      </>
    ),
    mileage: (
      <>
        <path d="M4 14a8 8 0 0 1 16 0" />
        <path d="M12 14l4-4" />
        <path d="M4 14h16" />
      </>
    ),
    body: (
      <>
        <path d="M5 16h14l-1.2-4.5a3 3 0 0 0-2.9-2.2H9.1a3 3 0 0 0-2.9 2.2L5 16Z" />
        <circle cx="8" cy="17" r="2" />
        <circle cx="16" cy="17" r="2" />
      </>
    ),
    fuel: (
      <>
        <path d="M7 3h8v18H7z" />
        <path d="M15 8h2.5L20 10.5V18a2 2 0 0 1-2 2h-1" />
        <path d="M9 7h4" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 7h16" />
        <path d="M4 17h16" />
        <circle cx="9" cy="7" r="2" />
        <circle cx="15" cy="17" r="2" />
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

export default function BrowsePage() {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [savedListingIds, setSavedListingIds] = useState([]);
  const [savingListingIds, setSavingListingIds] = useState([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  useEffect(() => {
    function applyUrlFilters() {
      const params = new URLSearchParams(window.location.search);

      const urlFilters = {
        location: params.get("location") || "",
        make: params.get("make") || "",
        model: params.get("model") || "",
        priceMin: params.get("priceMin") || "",
        priceMax: params.get("priceMax") || "",
        mileageMin: params.get("mileageMin") || "",
        mileageMax: params.get("mileageMax") || "",
        bodyType: params.get("body_type") || params.get("bodyType") || "",
        fuel: params.get("fuel") || "",
        condition: params.get("condition") || "",
        finance: params.get("finance") || "",
        category: normaliseCategory(params.get("category")),
      };

      setFilters(urlFilters);
      setSearch(params.get("keyword") || params.get("q") || "");
      setSort(params.get("sort") || "newest");
    }

    applyUrlFilters();

    window.addEventListener("popstate", applyUrlFilters);

    return () => {
      window.removeEventListener("popstate", applyUrlFilters);
    };
  }, []);

  useEffect(() => {
    async function loadSavedListings() {
      const token = localStorage.getItem("kerbSessionToken");

      if (!token || !currentUser) {
        setSavedListingIds([]);
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

        setSavedListingIds(result.saved_listing_ids || []);
      } catch (error) {
        console.error("Saved listings error:", error);
        setSavedListingIds([]);
      }
    }

    loadSavedListings();

    window.addEventListener("kerb-saved-change", loadSavedListings);

    return () => {
      window.removeEventListener("kerb-saved-change", loadSavedListings);
    };
  }, [currentUser]);

  useEffect(() => {
    async function loadCars() {
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
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Browse page error:", error);
        setErrorMessage(error.message);
        setCars([]);
      } else {
        setCars(data || []);
      }

      setLoading(false);
    }

    loadCars();
  }, []);

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

  function updateUrl(nextFilters = filters, nextSearch = search, nextSort = sort) {
    const params = new URLSearchParams();

    if (nextFilters.location) params.set("location", nextFilters.location);
    if (nextFilters.make) params.set("make", nextFilters.make);
    if (nextFilters.model) params.set("model", nextFilters.model);
    if (nextFilters.priceMin) params.set("priceMin", nextFilters.priceMin);
    if (nextFilters.priceMax) params.set("priceMax", nextFilters.priceMax);
    if (nextFilters.mileageMin) params.set("mileageMin", nextFilters.mileageMin);
    if (nextFilters.mileageMax) params.set("mileageMax", nextFilters.mileageMax);
    if (nextFilters.bodyType) params.set("body_type", nextFilters.bodyType);
    if (nextFilters.fuel) params.set("fuel", nextFilters.fuel);
    if (nextFilters.condition) params.set("condition", nextFilters.condition);
    if (nextFilters.finance) params.set("finance", nextFilters.finance);
    if (nextFilters.category) params.set("category", nextFilters.category);
    if (nextSearch.trim()) params.set("keyword", nextSearch.trim());
    if (nextSort && nextSort !== "newest") params.set("sort", nextSort);

    const query = params.toString();
    const nextUrl = query ? `/browse?${query}` : "/browse";

    window.history.pushState({}, "", nextUrl);
  }

  function setFilter(key, value) {
    const nextFilters = {
      ...filters,
      [key]: value,
    };

    if (key === "make") {
      nextFilters.model = "";
    }

    setFilters(nextFilters);
    updateUrl(nextFilters);
  }

  function applyPreset(event, presetFilters = {}, nextSearch = "") {
    event.preventDefault();

    const nextFilters = {
      ...defaultFilters,
      ...presetFilters,
    };

    setFilters(nextFilters);
    setSearch(nextSearch);
    setSort("newest");
    updateUrl(nextFilters, nextSearch, "newest");
  }

  function clearFilters() {
    setFilters(defaultFilters);
    setSearch("");
    setSort("newest");
    window.history.pushState({}, "", "/browse");
  }

  function handleLogout() {
    localStorage.removeItem("kerbSessionToken");
    localStorage.removeItem("kerbAccountEmail");
    localStorage.removeItem("kerbUser");
    setCurrentUser(null);
    setSavedListingIds([]);
    window.dispatchEvent(new Event("kerb-auth-change"));
    window.location.href = "/";
  }

  async function toggleSavedListing(listingId) {
    const listingIdText = String(listingId || "");

    if (!listingIdText) return;

    const token = localStorage.getItem("kerbSessionToken");

    if (!token || !currentUser) {
      window.location.href = "/login";
      return;
    }

    const wasSaved = savedListingIds.includes(listingIdText);

    setSavingListingIds((current) => [...new Set([...current, listingIdText])]);
    setSavedListingIds((current) =>
      wasSaved
        ? current.filter((id) => id !== listingIdText)
        : [...new Set([...current, listingIdText])]
    );

    try {
      const response = await fetch("/api/saved-listings", {
        method: wasSaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kerb-session-token": token,
        },
        body: JSON.stringify({
          listing_id: listingIdText,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not update saved cars.");
      }

      window.dispatchEvent(new Event("kerb-saved-change"));
    } catch (error) {
      console.error("Save listing error:", error);
      setSavedListingIds((current) =>
        wasSaved
          ? [...new Set([...current, listingIdText])]
          : current.filter((id) => id !== listingIdText)
      );
    } finally {
      setSavingListingIds((current) =>
        current.filter((id) => id !== listingIdText)
      );
    }
  }

  const availableMakes = useMemo(() => {
    return [...new Set(cars.map((car) => car.make).filter(Boolean))].sort();
  }, [cars]);

  const availableModels = useMemo(() => {
    if (!filters.make) return [];

    const selectedMake = String(filters.make).trim().toLowerCase();

    return [
      ...new Set(
        cars
          .filter(
            (car) =>
              String(car.make || "").trim().toLowerCase() === selectedMake
          )
          .map((car) => car.model)
          .filter(Boolean)
      ),
    ].sort();
  }, [cars, filters.make]);

  const visibleCars = useMemo(() => {
    let list = [...cars];

    const query = search.trim().toLowerCase();
    const searchLocation = getApproximateLocation(filters.location);

    list = list.filter((car) => {
      const searchableText = [
        car.title,
        car.make,
        car.model,
        car.variant,
        car.model_detail,
        car.year,
        car.fuel,
        car.fuel_type,
        car.transmission,
        car.gearbox,
        car.location,
        car.city,
        car.postcode,
        car.body_type,
        car.listing_category,
        car.features,
        car.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (query && !searchableText.includes(query)) return false;

      if (filters.location) {
        const carLocationText = [car.location, car.city, car.postcode]
          .filter(Boolean)
          .join(" ");
        const carLocation = getApproximateLocation(carLocationText);
        const directLocationMatch = includesText(
          carLocationText,
          filters.location
        );
        const approximateLocationMatch =
          searchLocation && carLocation && searchLocation === carLocation;

        if (!directLocationMatch && !approximateLocationMatch) {
          return false;
        }
      }

      if (filters.make && !includesText(car.make, filters.make)) {
        return false;
      }

      if (
        filters.model &&
        !includesText(
          [car.model, car.model_detail, car.variant].filter(Boolean).join(" "),
          filters.model
        )
      ) {
        return false;
      }

      if (filters.priceMin) {
        const price = getCarPrice(car);
        const minPrice = Number(filters.priceMin);

        if (minPrice > 0 && (!price || price < minPrice)) return false;
      }

      if (filters.priceMax) {
        const price = getCarPrice(car);
        const maxPrice = Number(filters.priceMax);

        if (maxPrice > 0 && (!price || price > maxPrice)) return false;
      }

      if (filters.mileageMin) {
        const mileage = getCarMileage(car);
        const minMileage = Number(filters.mileageMin);

        if (minMileage > 0 && (!mileage || mileage < minMileage)) return false;
      }

      if (filters.mileageMax) {
        const mileage = getCarMileage(car);
        const maxMileage = Number(filters.mileageMax);

        if (maxMileage < 150000 && (!mileage || mileage > maxMileage)) {
          return false;
        }
      }

      if (filters.bodyType && !includesText(car.body_type, filters.bodyType)) {
        return false;
      }

      if (filters.fuel) {
        const fuel = String(car.fuel || car.fuel_type || "").toLowerCase();

        if (filters.fuel === "electric-hybrid") {
          if (!fuel.includes("electric") && !fuel.includes("hybrid")) return false;
        } else if (!fuel.includes(filters.fuel.toLowerCase())) {
          return false;
        }
      }

      if (filters.condition === "new") {
        const condition = String(car.condition || "").toLowerCase();
        const year = Number(car.year || car.registration_year || 0);
        const isNewCar =
          condition.includes("new") ||
          condition.includes("nearly new") ||
          year >= currentYear - 1;

        if (!isNewCar) return false;
      }

      if (filters.finance === "true" && !carHasFinance(car)) {
        return false;
      }

      if (filters.category && !carMatchesCategory(car, filters.category)) {
        return false;
      }

      return true;
    });

    if (sort === "price-low") {
      list.sort((a, b) => {
        const aPrice = getCarPrice(a) || Number.MAX_SAFE_INTEGER;
        const bPrice = getCarPrice(b) || Number.MAX_SAFE_INTEGER;

        return aPrice - bPrice;
      });
    }

    if (sort === "price-high") {
      list.sort((a, b) => getCarPrice(b) - getCarPrice(a));
    }

    if (sort === "mileage-low") {
      list.sort((a, b) => {
        const aMileage = getCarMileage(a) || Number.MAX_SAFE_INTEGER;
        const bMileage = getCarMileage(b) || Number.MAX_SAFE_INTEGER;

        return aMileage - bMileage;
      });
    }

    return list;
  }, [cars, search, sort, filters]);

  const hasActiveFilters =
    search.trim() ||
    sort !== "newest" ||
    Object.values(filters).some(Boolean);

  const activeFilterCount =
    Object.values(filters).filter(Boolean).length +
    (search.trim() ? 1 : 0) +
    (sort !== "newest" ? 1 : 0);

  const selectedCategoryLabel = getCategoryLabel(filters.category);

  return (
    <>
      <main className="browse-page">
        <header className="topbar">
          <Link href="/" className="logo">
            Kerb
          </Link>

          <nav className="nav">
            <Link
              href="/browse"
              className={
                !hasActiveFilters ? "nav-item active" : "nav-item"
              }
              onClick={(event) => applyPreset(event)}
            >
              <SvgIcon name="car" />
              Browse cars
            </Link>

            <Link
              href="/browse?category=newer-car"
              className={
                filters.category === "newer-car" ||
                filters.condition === "new"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={(event) =>
                applyPreset(event, { category: "newer-car" })
              }
            >
              <SvgIcon name="new" />
              New cars
            </Link>

            <Link href="/post-car" className="nav-item">
              <SvgIcon name="sell" />
              Sell your car
            </Link>

            <Link
              href="/browse?category=electric-hybrid"
              className={
                filters.category === "electric-hybrid" ||
                filters.fuel === "electric" ||
                filters.fuel === "electric-hybrid"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={(event) =>
                applyPreset(event, { category: "electric-hybrid" })
              }
            >
              <SvgIcon name="electric" />
              Electric
            </Link>

            <Link
              href="/browse?finance=true"
              className={
                filters.finance === "true" ? "nav-item active" : "nav-item"
              }
              onClick={(event) => applyPreset(event, { finance: "true" })}
            >
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
              className="saved-button"
            >
              <SvgIcon name="heart" />
              Saved
            </Link>

            {currentUser ? (
              <>
                <Link href="/account" className="signin-button">
                  <SvgIcon name="user" />
                  My account
                </Link>

                <button
                  className="logout-button"
                  type="button"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" className="signin-button">
                <SvgIcon name="user" />
                Sign in
              </Link>
            )}

            <Link href="/post-car" className="post-button">
              <SvgIcon name="plus" />
              Post your car
            </Link>
          </div>

          <SiteMenu currentUser={currentUser} onLogout={handleLogout} />
        </header>

        <section
          className={
            isFilterPanelOpen
              ? "filters-section filters-open"
              : "filters-section"
          }
        >
          <div className="mobile-filter-bar">
            <button
              className="mobile-filter-toggle"
              type="button"
              onClick={() => setIsFilterPanelOpen((current) => !current)}
            >
              <SvgIcon name="sliders" />
              {isFilterPanelOpen ? "Hide filters" : "Filter cars"}
            </button>

            <span>
              {hasActiveFilters
                ? `${activeFilterCount} active`
                : `${visibleCars.length} cars`}
            </span>

            {hasActiveFilters && (
              <button
                className="mobile-clear-button"
                type="button"
                onClick={clearFilters}
              >
                Clear
              </button>
            )}
          </div>

          <div className="filters-panel">
            <div className="filters-grid">
              <label className="filter-card location-card">
                <SvgIcon name="location" />
                <div className="location-content">
                  <p>Town or city</p>
                  <input
                    value={filters.location}
                    onChange={(event) =>
                      setFilter("location", event.target.value)
                    }
                    placeholder="Any location"
                  />
                </div>
              </label>

              <label className="filter-card">
                <SvgIcon name="car" />
                <div>
                  <p>Make</p>
                  <select
                    value={filters.make}
                    onChange={(event) => setFilter("make", event.target.value)}
                  >
                    <option value="">Any make</option>
                    {availableMakes.map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              {filters.make && availableModels.length > 0 && (
                <label className="filter-card">
                  <SvgIcon name="car" />
                  <div>
                    <p>Model</p>
                    <select
                      value={filters.model}
                      onChange={(event) =>
                        setFilter("model", event.target.value)
                      }
                    >
                      <option value="">Any model</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
              )}

              <div className="filter-card range-card">
                <SvgIcon name="price" />
                <div className="range-content">
                  <p>Price</p>
                  <div className="range-controls price-controls">
                    <div className="price-input-wrap">
                      <span>£</span>
                      <input
                        value={filters.priceMin}
                        onChange={(event) =>
                          setFilter(
                            "priceMin",
                            cleanMoneyInput(event.target.value)
                          )
                        }
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="From"
                        aria-label="Minimum price"
                      />
                    </div>

                    <div className="price-input-wrap">
                      <span>£</span>
                      <input
                        value={filters.priceMax}
                        onChange={(event) =>
                          setFilter(
                            "priceMax",
                            cleanMoneyInput(event.target.value)
                          )
                        }
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="To"
                        aria-label="Maximum price"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <label className="filter-card range-card">
                <SvgIcon name="mileage" />
                <div className="range-content">
                  <p>Mileage</p>
                  <div className="range-controls">
                    <select
                      value={filters.mileageMin}
                      onChange={(event) =>
                        setFilter("mileageMin", event.target.value)
                      }
                      aria-label="Minimum mileage"
                    >
                      <option value="">From</option>
                      {mileageOptions.map((mileage) => (
                        <option key={`mileage-min-${mileage}`} value={mileage}>
                          {formatMileageOption(mileage)}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filters.mileageMax}
                      onChange={(event) =>
                        setFilter("mileageMax", event.target.value)
                      }
                      aria-label="Maximum mileage"
                    >
                      <option value="">To</option>
                      {mileageOptions
                        .filter((mileage) => mileage > 0)
                        .map((mileage) => (
                          <option key={`mileage-max-${mileage}`} value={mileage}>
                            {formatMileageOption(mileage)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </label>

              <label className="filter-card">
                <SvgIcon name="body" />
                <div>
                  <p>Body type</p>
                  <select
                    value={filters.bodyType}
                    onChange={(event) =>
                      setFilter("bodyType", event.target.value)
                    }
                  >
                    <option value="">Any body</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Saloon">Saloon</option>
                    <option value="Estate">Estate</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Convertible">Convertible</option>
                  </select>
                </div>
              </label>

              <label className="filter-card">
                <SvgIcon name="fuel" />
                <div>
                  <p>Fuel type</p>
                  <select
                    value={filters.fuel}
                    onChange={(event) => setFilter("fuel", event.target.value)}
                  >
                    <option value="">Any fuel</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                    <option value="electric-hybrid">Electric & hybrid</option>
                  </select>
                </div>
              </label>

              <label className="filter-card">
                <SvgIcon name="sliders" />
                <div>
                  <p>Category</p>
                  <select
                    value={filters.category}
                    onChange={(event) =>
                      setFilter("category", event.target.value)
                    }
                  >
                    {categoryOptions.map((category) => (
                      <option key={category.value || "all"} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <button
                className="filter-button"
                type="button"
                onClick={() => {
                  updateUrl();
                  setIsFilterPanelOpen(false);
                }}
              >
                <SvgIcon name="sliders" />
                Filter
              </button>
            </div>

            <div className="search-row">
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  updateUrl(filters, event.target.value, sort);
                }}
                placeholder="Search make, model, fuel, location..."
                className="search-input"
              />

              <div className="sort-box">
                <span>Sort by</span>
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    updateUrl(filters, search, event.target.value);
                  }}
                >
                  <option value="newest">Newest first</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="mileage-low">Lowest mileage</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="clear-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="results-section">
          <div className="results-heading">
            <h1>
              {loading
                ? "Loading cars..."
                : selectedCategoryLabel
                  ? `${visibleCars.length} ${selectedCategoryLabel.toLowerCase()} found`
                  : `${visibleCars.length} car${
                      visibleCars.length === 1 ? "" : "s"
                    } found`}
            </h1>
          </div>

          {errorMessage && <div className="error-box">{errorMessage}</div>}

          {loading && (
            <div className="cars-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="skeleton-card" />
              ))}
            </div>
          )}

          {!loading && !errorMessage && visibleCars.length === 0 && (
            <div className="empty-box">
              <h2>No cars found</h2>
              <p>
                Try clearing your filters or post a new listing for review.
              </p>
              <div className="empty-actions">
                <button type="button" onClick={clearFilters}>
                  Clear filters
                </button>
                <Link href="/post-car">Post your car</Link>
              </div>
            </div>
          )}

          {!loading && !errorMessage && visibleCars.length > 0 && (
            <div className="cars-grid">
              {visibleCars.map((car, index) => {
                const title = getTitle(car);
                const subtitle = getSubtitle(car);
                const images = getListingImages(car);
                const image = getImage(car);
                const photoCount = images.length || 1;
                const mileage = getMileage(car);
                const year = getYearText(car);
                const location = car.location || car.city || car.postcode || "";
                const price =
                  car.price || car.asking_price || car.listing_price;
                const sellerType =
                  car.seller_type ||
                  (index % 2 === 0 ? "Approved dealer" : "Private seller");
                const listingId = String(car.id || "");
                const isSaved = savedListingIds.includes(listingId);
                const isSaving = savingListingIds.includes(listingId);

                return (
                  <article
                    className="car-card"
                    key={car.id || index}
                    style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                  >
                    <div className="image-wrap">
                      <img
                        src={image}
                        alt={title}
                        onError={(event) => {
                          event.currentTarget.src = "/cars/hero-car.png";
                        }}
                      />

                      <div
                        className={
                          String(sellerType).toLowerCase().includes("private")
                            ? "seller-badge private"
                            : "seller-badge dealer"
                        }
                      >
                        <SvgIcon name="shield" />
                        {String(sellerType).toLowerCase().includes("private")
                          ? "Private seller"
                          : "Approved dealer"}
                      </div>

                      <button
                        type="button"
                        className={
                          isSaved ? "heart-button saved" : "heart-button"
                        }
                        onClick={() => toggleSavedListing(listingId)}
                        disabled={isSaving}
                        aria-label={
                          isSaved ? "Remove saved car" : "Save this car"
                        }
                      >
                        <SvgIcon name="heart" />
                      </button>

                      <div className="photo-count">
                        <SvgIcon name="camera" />
                        {`1/${photoCount}`}
                      </div>
                    </div>

                    <div className="card-body">
                      <h2>{title}</h2>
                      <p className="subtitle">{subtitle}</p>

                      <div className="price-location">
                        <strong>{formatPrice(price)}</strong>
                        {location && <span>{location}</span>}
                      </div>

                      <div className="specs">
                        {mileage && <span>{mileage}</span>}
                        {year && <span>{year}</span>}
                        {car.fuel && <span>{car.fuel}</span>}
                        {car.fuel_type && !car.fuel && (
                          <span>{car.fuel_type}</span>
                        )}
                        {car.transmission && <span>{car.transmission}</span>}
                        {car.gearbox && !car.transmission && (
                          <span>{car.gearbox}</span>
                        )}
                      </div>

                      <Link href={`/listing/${car.id}`} className="view-link">
                        View listing
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f8faff;
          color: #12182f;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        button,
        input,
        select {
          font-family: inherit;
        }

        .browse-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top left,
              rgba(0, 72, 255, 0.06),
              transparent 34%
            ),
            #f8faff;
          overflow-x: hidden;
        }

        .svg-icon {
          width: 20px;
          height: 20px;
          flex: 0 0 auto;
        }

        .topbar {
          height: 92px;
          padding: 0 22px;
          display: flex;
          align-items: center;
          gap: 18px;
          background: rgba(255, 255, 255, 0.92);
          border-bottom: 1px solid #e9edf6;
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(16px);
          width: 100%;
          max-width: 100vw;
        }

        .logo {
          font-size: 42px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -2px;
          color: #0b45ff;
          margin-right: 24px;
          flex: 0 0 auto;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1 1 auto;
          min-width: 0;
          overflow: hidden;
        }

        .nav-item {
          height: 50px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          color: #1b2240;
          white-space: nowrap;
          flex: 0 0 auto;
        }

        .nav-item .svg-icon {
          width: 18px;
          height: 18px;
        }

        .nav-item.active {
          color: #0b45ff;
          background: #eef3ff;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 0 0 auto;
        }

        .saved-button,
        .signin-button,
        .logout-button {
          border: none;
          background: transparent;
          color: #4b5575;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0;
          text-decoration: none;
          white-space: nowrap;
        }

        .saved-button .svg-icon,
        .signin-button .svg-icon {
          width: 19px;
          height: 19px;
        }

        .logout-button {
          color: #c01818;
        }

        .post-button {
          height: 58px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 18px;
          border-radius: 16px;
          background: #083cff;
          color: white;
          font-size: 14px;
          font-weight: 900;
          box-shadow: 0 12px 26px rgba(8, 60, 255, 0.22);
          white-space: nowrap;
          flex: 0 0 auto;
        }

        .post-button .svg-icon {
          width: 20px;
          height: 20px;
        }

        .filters-section {
          padding: 26px 32px 0;
        }

        .filters-panel {
          max-width: 100%;
          overflow: hidden;
        }

        .mobile-filter-bar {
          display: none;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(205px, 1fr));
          gap: 14px;
          align-items: center;
        }

        .filter-card {
          min-height: 64px;
          background: white;
          border: 1px solid #e5ebf5;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 16px;
          box-shadow: 0 8px 20px rgba(13, 23, 55, 0.04);
          min-width: 0;
          transition: transform 0.18s ease, border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .filter-card:hover {
          transform: translateY(-2px);
          border-color: #d4def0;
          box-shadow: 0 12px 28px rgba(13, 23, 55, 0.08);
        }

        .filter-card .svg-icon {
          width: 24px;
          height: 24px;
          color: #11182f;
        }

        .filter-card > div {
          min-width: 0;
          flex: 1;
        }

        .filter-card p {
          margin: 0 0 2px;
          color: #6d7691;
          font-size: 13px;
          font-weight: 600;
        }

        .filter-card select {
          width: 100%;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #12182f;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          padding: 0;
        }

        .filter-card input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #12182f;
          font-size: 13px;
          font-weight: 900;
          min-width: 0;
          padding: 0;
        }

        .filter-card input::placeholder {
          color: #12182f;
          opacity: 1;
        }

        .location-card,
        .range-card {
          padding-top: 9px;
          padding-bottom: 9px;
          align-items: center;
        }

        .location-content,
        .range-content {
          display: grid;
          gap: 5px;
        }

        .range-controls {
          display: grid;
          gap: 7px;
          align-items: center;
        }

        .range-controls {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }

        .range-controls select {
          min-width: 0;
          height: 29px;
          border: 1px solid #e5ebf5;
          border-radius: 9px;
          background: #f7f9fd;
          padding: 0 7px;
          font-size: 12px;
        }

        .price-input-wrap {
          min-width: 0;
          height: 29px;
          border: 1px solid #e5ebf5;
          border-radius: 9px;
          background: #f7f9fd;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 7px;
        }

        .price-input-wrap span {
          color: #6d7691;
          font-size: 12px;
          font-weight: 900;
          line-height: 1;
        }

        .price-input-wrap input {
          height: 100%;
          min-width: 0;
          font-size: 12px;
        }

        .filter-button {
          height: 64px;
          border: none;
          border-radius: 16px;
          background: #083cff;
          color: white;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 12px 26px rgba(8, 60, 255, 0.22);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-width: 0;
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            background 0.18s ease;
        }

        .filter-button:hover,
        .post-button:hover,
        .view-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(8, 60, 255, 0.28);
        }

        .mobile-filter-toggle,
        .mobile-clear-button {
          border: none;
          font-family: inherit;
          cursor: pointer;
        }

        .search-row {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
        }

        .search-input {
          width: min(560px, 100%);
          height: 46px;
          border: 1px solid #e5ebf5;
          border-radius: 14px;
          background: white;
          padding: 0 16px;
          color: #12182f;
          font-size: 14px;
          outline: none;
          box-shadow: 0 8px 20px rgba(13, 23, 55, 0.04);
        }

        .search-input:focus {
          border-color: #0b45ff;
          box-shadow: 0 0 0 4px rgba(11, 69, 255, 0.1);
        }

        .sort-box {
          height: 46px;
          min-width: 250px;
          background: white;
          border: 1px solid #e5ebf5;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          box-shadow: 0 8px 20px rgba(13, 23, 55, 0.04);
        }

        .sort-box span {
          color: #68728d;
          font-size: 14px;
          font-weight: 600;
        }

        .sort-box select {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: #12182f;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .clear-button {
          height: 46px;
          border: none;
          border-radius: 14px;
          background: #eef3ff;
          color: #0b45ff;
          padding: 0 18px;
          font-weight: 950;
          white-space: nowrap;
          cursor: pointer;
        }

        .results-section {
          padding: 20px 32px 50px;
        }

        .results-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .results-heading h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 950;
          letter-spacing: -0.2px;
          color: #12182f;
        }

        .cars-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }

        .car-card {
          overflow: hidden;
          border-radius: 16px;
          background: white;
          border: 1px solid #e5ebf5;
          box-shadow: 0 12px 28px rgba(13, 23, 55, 0.06);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          animation: browseCardIn 0.42s ease both;
        }

        .car-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(13, 23, 55, 0.12);
        }

        .image-wrap {
          height: 205px;
          position: relative;
          background: #e9eef7;
          overflow: hidden;
        }

        .image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.32s ease;
        }

        .car-card:hover .image-wrap img {
          transform: scale(1.035);
        }

        .seller-badge {
          position: absolute;
          left: 12px;
          top: 12px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 950;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .seller-badge .svg-icon {
          width: 14px;
          height: 14px;
        }

        .seller-badge.dealer {
          color: #0843ff;
          background: #eef3ff;
        }

        .seller-badge.private {
          color: #077245;
          background: #eafff3;
        }

        .heart-button {
          position: absolute;
          right: 12px;
          top: 12px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: rgba(16, 22, 42, 0.3);
          color: white;
          cursor: pointer;
          backdrop-filter: blur(5px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .heart-button.saved {
          background: #fff1f1;
          color: #d7193f;
          box-shadow: 0 10px 24px rgba(215, 25, 63, 0.22);
        }

        .heart-button:disabled {
          opacity: 0.72;
          cursor: not-allowed;
        }

        .heart-button .svg-icon {
          width: 21px;
          height: 21px;
        }

        .heart-button.saved .svg-icon path {
          fill: currentColor;
        }

        .photo-count {
          position: absolute;
          right: 10px;
          bottom: 10px;
          height: 26px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0 9px;
          border-radius: 7px;
          background: white;
          color: #151b32;
          font-size: 12px;
          font-weight: 900;
        }

        .photo-count .svg-icon {
          width: 13px;
          height: 13px;
        }

        .card-body {
          padding: 15px 17px 16px;
        }

        .card-body h2 {
          margin: 0 0 6px;
          color: #151b32;
          font-size: 18px;
          font-weight: 950;
          letter-spacing: -0.3px;
        }

        .subtitle {
          margin: 0 0 12px;
          color: #5e6782;
          font-size: 13px;
          line-height: 1.35;
          min-height: 18px;
        }

        .price-location {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .price-location strong {
          color: #11182f;
          font-size: 21px;
          font-weight: 950;
          letter-spacing: -0.4px;
        }

        .price-location span {
          color: #65708d;
          font-size: 12px;
          font-weight: 700;
          text-align: right;
        }

        .specs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .specs span {
          display: inline-flex;
          align-items: center;
          height: 26px;
          padding: 0 12px;
          border-radius: 8px;
          background: #f0f3f8;
          color: #59627c;
          font-size: 12px;
          font-weight: 800;
        }

        .view-link {
          margin-top: 14px;
          height: 42px;
          border-radius: 12px;
          background: #f2f5ff;
          color: #0b45ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 950;
        }

        .error-box {
          background: #fff1f1;
          color: #c01818;
          border: 1px solid #ffd1d1;
          border-radius: 16px;
          padding: 16px;
          font-weight: 800;
        }

        .empty-box {
          background: white;
          border: 1px solid #e5ebf5;
          border-radius: 20px;
          padding: 50px 24px;
          text-align: center;
          box-shadow: 0 12px 28px rgba(13, 23, 55, 0.06);
        }

        .empty-box h2 {
          margin: 0;
          color: #11182f;
          font-size: 26px;
          font-weight: 950;
        }

        .empty-box p {
          margin: 10px 0 22px;
          color: #68728d;
          font-weight: 600;
        }

        .empty-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .empty-actions a,
        .empty-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          padding: 0 22px;
          border-radius: 14px;
          background: #083cff;
          color: white;
          font-weight: 950;
        }

        .empty-actions button {
          background: #eef3ff;
          color: #0b45ff;
        }

        .skeleton-card {
          height: 370px;
          border-radius: 16px;
          background: linear-gradient(90deg, #eef2f7, #ffffff, #eef2f7);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
          border: 1px solid #e5ebf5;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes browseCardIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1450px) {
          .topbar {
            padding: 0 18px;
            gap: 12px;
          }

          .logo {
            margin-right: 16px;
          }

          .nav {
            gap: 6px;
          }

          .nav-item {
            padding: 0 10px;
            font-size: 13px;
          }

          .saved-button,
          .signin-button,
          .logout-button {
            font-size: 13px;
          }

          .post-button {
            padding: 0 15px;
            font-size: 13px;
          }
        }

        @media (max-width: 1280px) {
          .guides-link {
            display: none;
          }

          .filters-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .cars-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1050px) {
          .topbar {
            height: auto;
            min-height: 92px;
            padding: 18px;
            flex-wrap: wrap;
            overflow: visible;
          }

          .logo {
            margin-right: auto;
          }

          .top-actions {
            gap: 8px;
            margin-left: auto;
          }

          .saved-button,
          .signin-button,
          .logout-button {
            display: none;
          }

          .filters-section,
          .results-section {
            padding-left: 18px;
            padding-right: 18px;
          }

          .filters-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .filter-button {
            grid-column: span 2;
          }

          .search-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input,
          .sort-box,
          .clear-button {
            width: 100%;
          }

          .cars-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 620px) {
          .topbar {
            min-height: 72px;
            padding: 12px 14px;
            gap: 10px;
            flex-wrap: nowrap;
          }

          .logo {
            font-size: 34px;
            margin-right: auto;
          }

          .nav {
            display: none;
          }

          .top-actions {
            flex: 0 0 auto;
          }

          .post-button {
            height: 46px;
            padding: 0 12px;
            border-radius: 14px;
            font-size: 13px;
          }

          .post-button .svg-icon {
            width: 18px;
            height: 18px;
          }

          .filters-section {
            padding: 14px 14px 0;
          }

          .mobile-filter-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            background: white;
            border: 1px solid #e5ebf5;
            border-radius: 16px;
            padding: 10px;
            box-shadow: 0 8px 20px rgba(13, 23, 55, 0.04);
          }

          .mobile-filter-toggle {
            height: 42px;
            border-radius: 12px;
            padding: 0 14px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #083cff;
            color: white;
            font-size: 14px;
            font-weight: 950;
          }

          .mobile-filter-bar span {
            color: #68728d;
            font-size: 12px;
            font-weight: 850;
            margin-right: auto;
          }

          .mobile-clear-button {
            height: 36px;
            border-radius: 10px;
            padding: 0 12px;
            background: #eef3ff;
            color: #0b45ff;
            font-size: 12px;
            font-weight: 950;
          }

          .filters-panel {
            display: block;
            margin-top: 12px;
            animation: panelIn 0.24s ease both;
          }

          .filters-grid {
            display: none;
          }

          .filters-section.filters-open .filters-grid {
            display: grid;
          }

          .filters-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .filter-card {
            min-height: 58px;
            border-radius: 15px;
            padding-top: 9px;
            padding-bottom: 9px;
          }

          .filter-button {
            height: 58px;
          }

          .filter-button {
            grid-column: auto;
          }

          .search-row {
            margin-top: 12px;
            gap: 10px;
          }

          .results-section {
            padding: 16px 14px 44px;
          }

          .cars-grid {
            grid-template-columns: 1fr;
          }

          .image-wrap {
            height: 220px;
          }
        }

        @keyframes panelIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

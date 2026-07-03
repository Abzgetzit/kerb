"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteMenu from "../components/SiteMenu";
import { bodyTypeOptions } from "../lib/vehicle-data";
import {
  getPublicVehicleMake,
  getVehicleMakeMatchKey,
  getVehicleModelsForPublicMake,
  publicVehicleMakeOptions,
} from "../lib/public-vehicle-makes";

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

const categoryLabels = new Map(categoryOptions.map((category) => [category.value, category.label]));
const mileageOptions = Array.from({ length: 16 }, (_, index) => index * 10000);

function SvgIcon({ name }) {
  const icons = {
    car: <><path d="M5 17h14l-1.5-5h-11L5 17Z" /><path d="M7 17v2" /><path d="M17 17v2" /><path d="M7 12l1.5-4h7L17 12" /></>,
    new: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>,
    sell: <><path d="M4 7h10l6 6-7 7-9-9V7Z" /><path d="M8 11h.01" /></>,
    electric: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" />,
    finance: <><path d="M4 7h16v10H4z" /><path d="M8 11h8" /><path d="M8 14h4" /></>,
    guides: <><path d="M6 4h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2V4Z" /><path d="M9 8h6" /><path d="M9 12h6" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />,
    user: <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></>,
    plus: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8" /><path d="M8 12h8" /></>,
    location: <><path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></>,
    price: <><circle cx="12" cy="12" r="9" /><path d="M15 9.5A3 3 0 0 0 12.4 8H11a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-1.4A3 3 0 0 1 9 14.5" /><path d="M12 6v12" /></>,
    mileage: <><path d="M4 14a8 8 0 0 1 16 0" /><path d="M12 14l4-4" /><path d="M4 14h16" /></>,
    body: <><path d="M5 16h14l-1.2-4.5a3 3 0 0 0-2.9-2.2H9.1a3 3 0 0 0-2.9 2.2L5 16Z" /><circle cx="8" cy="17" r="2" /><circle cx="16" cy="17" r="2" /></>,
    fuel: <><path d="M7 3h8v18H7z" /><path d="M15 8h2.5L20 10.5V18a2 2 0 0 1-2 2h-1" /><path d="M9 7h4" /></>,
    sliders: <><path d="M4 7h16" /><path d="M4 17h16" /><circle cx="9" cy="7" r="2" /><circle cx="15" cy="17" r="2" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="M9 12l2 2 4-5" /></>,
    camera: <><path d="M4 8h4l2-3h4l2 3h4v11H4z" /><circle cx="12" cy="13" r="3" /></>,
  };

  return <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
}

function formatPrice(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return "Price on request";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(number);
}

function formatMileageOption(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Any";
  if (number === 0) return "0 miles";
  if (number >= 150000) return "150,000+ miles";
  return `${new Intl.NumberFormat("en-GB").format(number)} miles`;
}

function cleanMoneyInput(value) {
  return String(value || "").replace(/[^0-9]/g, "").slice(0, 9);
}

function getCarPrice(car) {
  return Number(car.price || car.asking_price || car.listing_price || 0);
}

function getCarMileage(car) {
  return Number(car.mileage || car.miles || 0);
}

function getDateScore(value) {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function parseImageField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      if (typeof parsed === "string") return [parsed];
    } catch {
      return [trimmed];
    }
  }
  return [];
}

function getListingImages(car) {
  return [...new Set([
    ...parseImageField(car.image_url),
    ...parseImageField(car.photo_url),
    ...parseImageField(car.main_photo_url),
    ...parseImageField(car.cover_image_url),
    ...parseImageField(car.photos),
    ...parseImageField(car.photo_urls),
    ...parseImageField(car.images),
    ...parseImageField(car.image_urls),
  ])].filter(Boolean);
}

function getImage(car) {
  return getListingImages(car)[0] || "/cars/hero-car.png";
}

function getTitle(car) {
  return car.title || [car.year, car.make, car.model, car.model_detail, car.variant].filter(Boolean).join(" ").trim() || "Car listing";
}

function getSubtitle(car) {
  return [car.variant, car.model_detail, car.engine_size, car.fuel, car.fuel_type, car.transmission, car.gearbox, car.body_type].filter(Boolean).join(" • ") || "Used car listed on Kerb";
}

function textValue(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(" ");
  if (typeof value === "object") return Object.values(value).filter(Boolean).join(" ");
  return String(value);
}

function carHasFinance(car) {
  const financeText = [car.finance, car.finance_available, car.finance_option, car.finance_options, car.payment_options, car.seller_finance].filter(Boolean).join(" ").toLowerCase();
  return car.finance === true || car.finance_available === true || financeText.includes("finance") || financeText.includes("available");
}

function carMatchesCategory(car, category) {
  const selectedCategory = String(category || "").trim().toLowerCase();
  if (!selectedCategory || selectedCategory === "general") return true;
  if (String(car.listing_category || "").trim().toLowerCase() === selectedCategory) return true;
  const text = [car.title, car.make, car.model, car.variant, car.model_detail, car.listing_category, car.fuel, car.fuel_type, car.body_type, car.condition, car.description, car.features].map(textValue).filter(Boolean).join(" ").toLowerCase();
  const fuel = String(car.fuel || car.fuel_type || "").toLowerCase();
  const bodyType = String(car.body_type || "").toLowerCase();
  const condition = String(car.condition || "").toLowerCase();
  const year = Number(car.year || car.registration_year || 0);
  const price = getCarPrice(car);
  const mileage = getCarMileage(car);
  if (selectedCategory === "newer-car") return condition.includes("new") || year >= currentYear - 2 || (year >= currentYear - 3 && mileage > 0 && mileage <= 15000);
  if (selectedCategory === "electric-hybrid") return fuel.includes("electric") || fuel.includes("hybrid") || ["bev", "ev", "phev", "plug-in", "e-tron", "ioniq", "leaf", "model 3", "model y"].some((term) => text.includes(term));
  if (selectedCategory === "family-suv") return bodyType.includes("suv") || bodyType.includes("4x4") || bodyType.includes("crossover") || ["family suv", "seven seats", "7 seats", "7-seater", "qashqai", "sportage", "tucson", "tiguan", "kuga"].some((term) => text.includes(term));
  if (selectedCategory === "first-car") return price > 0 && price <= 10000 && (!mileage || mileage <= 90000) && (bodyType.includes("hatchback") || ["aygo", "corsa", "fiesta", "polo", "yaris", "i10", "picanto", "clio", "fiat 500"].some((term) => text.includes(term)));
  if (selectedCategory === "performance") return ["performance", "hot hatch", "sports", "m sport", "amg", "s line", "gti", "golf r", "m3", "m4", "rs3", "s3", "type r", "vrs", "cupra"].some((term) => text.includes(term));
  return true;
}

function sortListings(listings, sort) {
  const list = [...listings];
  if (sort === "price-low") return list.sort((a, b) => (getCarPrice(a) || Number.MAX_SAFE_INTEGER) - (getCarPrice(b) || Number.MAX_SAFE_INTEGER));
  if (sort === "price-high") return list.sort((a, b) => getCarPrice(b) - getCarPrice(a));
  if (sort === "mileage-low") return list.sort((a, b) => (getCarMileage(a) || Number.MAX_SAFE_INTEGER) - (getCarMileage(b) || Number.MAX_SAFE_INTEGER));
  return list.sort((a, b) => getDateScore(b.created_at || b.boosted_at) - getDateScore(a.created_at || a.boosted_at));
}

function makeMatches(carMake, selectedMake) {
  if (!selectedMake) return true;
  const selectedKey = getVehicleMakeMatchKey(selectedMake);
  const carKey = getVehicleMakeMatchKey(carMake);
  return carKey === selectedKey || String(carMake || "").toLowerCase().includes(String(selectedMake || "").toLowerCase());
}

function normaliseInitialFilters(initialFilters = {}) {
  return { ...defaultFilters, ...initialFilters, bodyType: initialFilters.bodyType || initialFilters.body_type || "" };
}

export default function BrowseClient({ initialCars = [], initialFilters = {}, initialSearch = "", initialSort = "newest", initialLoadError = "" }) {
  const [filters, setFilters] = useState(() => normaliseInitialFilters(initialFilters));
  const [search, setSearch] = useState(initialSearch || "");
  const [sort, setSort] = useState(initialSort === "featured" ? "newest" : initialSort || "newest");
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [savedListingIds, setSavedListingIds] = useState([]);
  const [savingListingIds, setSavingListingIds] = useState([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  useEffect(() => {
    function syncKerbUser() {
      const savedUser = localStorage.getItem("kerbUser");
      const savedEmail = localStorage.getItem("kerbAccountEmail");
      const token = localStorage.getItem("kerbSessionToken");
      if (savedUser) {
        try { setCurrentUser(JSON.parse(savedUser)); return; } catch { localStorage.removeItem("kerbUser"); }
      }
      if (token && savedEmail) { setCurrentUser({ email: savedEmail }); return; }
      setCurrentUser(null);
    }
    syncKerbUser();
    window.addEventListener("storage", syncKerbUser);
    window.addEventListener("kerb-auth-change", syncKerbUser);
    return () => { window.removeEventListener("storage", syncKerbUser); window.removeEventListener("kerb-auth-change", syncKerbUser); };
  }, []);

  useEffect(() => {
    async function loadSavedListings() {
      const token = localStorage.getItem("kerbSessionToken");
      if (!token || !currentUser) { setSavedListingIds([]); setUnreadCount(0); return; }
      try {
        const [savedResponse, accountResponse] = await Promise.all([fetch("/api/saved-listings", { headers: { "x-kerb-session-token": token } }), fetch("/api/account", { headers: { "x-kerb-session-token": token } })]);
        const savedResult = await savedResponse.json();
        if (savedResponse.ok) setSavedListingIds(savedResult.saved_listing_ids || []);
        const accountResult = await accountResponse.json();
        if (accountResponse.ok) setUnreadCount(Number(accountResult.unread_total || 0));
      } catch { setSavedListingIds([]); }
    }
    loadSavedListings();
    window.addEventListener("kerb-saved-change", loadSavedListings);
    return () => window.removeEventListener("kerb-saved-change", loadSavedListings);
  }, [currentUser]);

  const availableMakes = useMemo(() => [...new Set([...publicVehicleMakeOptions, ...initialCars.map((car) => getPublicVehicleMake(car.make)).filter(Boolean)])], [initialCars]);
  const availableModels = useMemo(() => (filters.make ? getVehicleModelsForPublicMake(filters.make) : []), [filters.make]);

  const visibleCars = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = (initialCars || []).filter((car) => {
      const searchableText = [car.title, car.make, car.model, car.variant, car.model_detail, car.year, car.fuel, car.fuel_type, car.transmission, car.gearbox, car.location, car.city, car.postcode, car.body_type, car.listing_category, car.features, car.description].map(textValue).filter(Boolean).join(" ").toLowerCase();
      if (query && !searchableText.includes(query)) return false;
      if (filters.location && !String([car.location, car.city, car.postcode].filter(Boolean).join(" ")).toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.make && !makeMatches(car.make, filters.make)) return false;
      if (filters.model && !searchableText.includes(String(filters.model).toLowerCase())) return false;
      if (filters.priceMin && getCarPrice(car) < Number(filters.priceMin)) return false;
      if (filters.priceMax && getCarPrice(car) > Number(filters.priceMax)) return false;
      if (filters.mileageMin && getCarMileage(car) < Number(filters.mileageMin)) return false;
      if (filters.mileageMax && Number(filters.mileageMax) < 150000 && getCarMileage(car) > Number(filters.mileageMax)) return false;
      if (filters.bodyType && !String(car.body_type || "").toLowerCase().includes(filters.bodyType.toLowerCase())) return false;
      if (filters.fuel) {
        const fuel = String(car.fuel || car.fuel_type || "").toLowerCase();
        if (filters.fuel === "electric-hybrid") { if (!fuel.includes("electric") && !fuel.includes("hybrid")) return false; }
        else if (!fuel.includes(filters.fuel.toLowerCase())) return false;
      }
      if (filters.finance === "true" && !carHasFinance(car)) return false;
      if (filters.category && !carMatchesCategory(car, filters.category)) return false;
      return true;
    });
    return sortListings(filtered, sort);
  }, [initialCars, filters, search, sort]);

  const selectedCategoryLabel = categoryLabels.get(filters.category) || "";
  const hasActiveFilters = search.trim() || sort !== "newest" || Object.values(filters).some(Boolean);
  const activeFilterCount = Object.values(filters).filter(Boolean).length + (search.trim() ? 1 : 0) + (sort !== "newest" ? 1 : 0);
  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.location) chips.push({ key: "location", label: `Location: ${filters.location}` });
    if (filters.make) chips.push({ key: "make", label: `Make: ${filters.make}` });
    if (filters.model) chips.push({ key: "model", label: `Model: ${filters.model}` });
    if (filters.priceMin || filters.priceMax) chips.push({ key: "price", label: `Price: ${filters.priceMin ? formatPrice(filters.priceMin) : "Any"} to ${filters.priceMax ? formatPrice(filters.priceMax) : "Any"}` });
    if (filters.mileageMin || filters.mileageMax) chips.push({ key: "mileage", label: `Mileage: ${filters.mileageMin ? formatMileageOption(filters.mileageMin) : "Any"} to ${filters.mileageMax ? formatMileageOption(filters.mileageMax) : "Any"}` });
    if (filters.bodyType) chips.push({ key: "bodyType", label: `Body: ${filters.bodyType}` });
    if (filters.fuel) chips.push({ key: "fuel", label: `Fuel: ${filters.fuel === "electric-hybrid" ? "Electric & hybrid" : filters.fuel}` });
    if (filters.finance === "true") chips.push({ key: "finance", label: "Finance" });
    if (filters.category) chips.push({ key: "category", label: `Category: ${categoryLabels.get(filters.category) || filters.category}` });
    if (search.trim()) chips.push({ key: "search", label: `Keyword: ${search.trim()}` });
    return chips;
  }, [filters, search]);

  function getBrowseQueryString(nextFilters = filters, nextSearch = search, nextSort = sort) {
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
    if (nextFilters.finance) params.set("finance", nextFilters.finance);
    if (nextFilters.category) params.set("category", nextFilters.category);
    if (nextSearch.trim()) params.set("keyword", nextSearch.trim());
    if (nextSort && nextSort !== "newest") params.set("sort", nextSort);
    return params.toString();
  }

  function updateUrl(nextFilters = filters, nextSearch = search, nextSort = sort) {
    if (typeof window === "undefined") return;
    const query = getBrowseQueryString(nextFilters, nextSearch, nextSort);
    const path = window.location.pathname || "/browse";
    window.history.replaceState({}, "", query ? `${path}?${query}` : path);
  }

  function setFilter(key, value) {
    const nextFilters = { ...filters, [key]: value };
    if (key === "make") nextFilters.model = "";
    setFilters(nextFilters);
    updateUrl(nextFilters);
  }

  function clearFilters() {
    const baseFilters = normaliseInitialFilters(initialFilters);
    setFilters(baseFilters);
    setSearch("");
    setSort("newest");
    if (typeof window !== "undefined") window.history.replaceState({}, "", window.location.pathname || "/browse");
  }

  function clearFilterChip(key) {
    if (key === "search") { setSearch(""); updateUrl(filters, "", sort); return; }
    const nextFilters = { ...filters };
    if (key === "price") { nextFilters.priceMin = ""; nextFilters.priceMax = ""; }
    else if (key === "mileage") { nextFilters.mileageMin = ""; nextFilters.mileageMax = ""; }
    else if (key === "make") { nextFilters.make = ""; nextFilters.model = ""; }
    else nextFilters[key] = "";
    setFilters(nextFilters); updateUrl(nextFilters);
  }

  function handleLogout() {
    localStorage.removeItem("kerbSessionToken"); localStorage.removeItem("kerbAccountEmail"); localStorage.removeItem("kerbUser"); setCurrentUser(null); setSavedListingIds([]); window.dispatchEvent(new Event("kerb-auth-change")); window.location.href = "/";
  }

  async function toggleSavedListing(listingId) {
    const listingIdText = String(listingId || "");
    if (!listingIdText) return;
    const token = localStorage.getItem("kerbSessionToken");
    if (!token || !currentUser) { window.location.href = `/login?next=/listing/${listingIdText}`; return; }
    const wasSaved = savedListingIds.includes(listingIdText);
    setSavingListingIds((current) => [...new Set([...current, listingIdText])]);
    setSavedListingIds((current) => wasSaved ? current.filter((id) => id !== listingIdText) : [...new Set([...current, listingIdText])]);
    try {
      const response = await fetch("/api/saved-listings", { method: wasSaved ? "DELETE" : "POST", headers: { "Content-Type": "application/json", "x-kerb-session-token": token }, body: JSON.stringify({ listing_id: listingIdText }) });
      if (!response.ok) throw new Error("Could not update saved cars.");
      window.dispatchEvent(new Event("kerb-saved-change"));
    } catch {
      setSavedListingIds((current) => wasSaved ? [...new Set([...current, listingIdText])] : current.filter((id) => id !== listingIdText));
    } finally { setSavingListingIds((current) => current.filter((id) => id !== listingIdText)); }
  }

  const filterControls = <>
    <label className="filter-card location-card"><SvgIcon name="location" /><div><p>Town or city</p><input value={filters.location} onChange={(event) => setFilter("location", event.target.value)} placeholder="Any location" /></div></label>
    <label className="filter-card"><SvgIcon name="car" /><div><p>Make</p><select value={filters.make} onChange={(event) => setFilter("make", event.target.value)}><option value="">Any make</option>{availableMakes.map((make) => <option key={make} value={make}>{make}</option>)}</select></div></label>
    <label className="filter-card"><SvgIcon name="car" /><div><p>Model</p><select value={filters.model} onChange={(event) => setFilter("model", event.target.value)} disabled={!filters.make}><option value="">Any model</option>{availableModels.map((model) => <option key={model} value={model}>{model}</option>)}</select></div></label>
    <div className="filter-card range-card"><SvgIcon name="price" /><div><p>Price</p><div className="range-controls price-controls"><div className="price-input-wrap"><span>£</span><input value={filters.priceMin} onChange={(event) => setFilter("priceMin", cleanMoneyInput(event.target.value))} inputMode="numeric" placeholder="From" /></div><div className="price-input-wrap"><span>£</span><input value={filters.priceMax} onChange={(event) => setFilter("priceMax", cleanMoneyInput(event.target.value))} inputMode="numeric" placeholder="To" /></div></div></div></div>
    <label className="filter-card range-card"><SvgIcon name="mileage" /><div><p>Mileage</p><div className="range-controls"><select value={filters.mileageMin} onChange={(event) => setFilter("mileageMin", event.target.value)}><option value="">From</option>{mileageOptions.map((mileage) => <option key={`min-${mileage}`} value={mileage}>{formatMileageOption(mileage)}</option>)}</select><select value={filters.mileageMax} onChange={(event) => setFilter("mileageMax", event.target.value)}><option value="">To</option>{mileageOptions.filter((mileage) => mileage > 0).map((mileage) => <option key={`max-${mileage}`} value={mileage}>{formatMileageOption(mileage)}</option>)}</select></div></div></label>
    <label className="filter-card"><SvgIcon name="body" /><div><p>Body type</p><select value={filters.bodyType} onChange={(event) => setFilter("bodyType", event.target.value)}><option value="">Any body</option>{bodyTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div></label>
    <label className="filter-card"><SvgIcon name="fuel" /><div><p>Fuel type</p><select value={filters.fuel} onChange={(event) => setFilter("fuel", event.target.value)}><option value="">Any fuel</option><option value="petrol">Petrol</option><option value="diesel">Diesel</option><option value="hybrid">Hybrid</option><option value="electric">Electric</option><option value="electric-hybrid">Electric & hybrid</option></select></div></label>
    <label className="filter-card"><SvgIcon name="finance" /><div><p>Finance</p><select value={filters.finance} onChange={(event) => setFilter("finance", event.target.value)}><option value="">Any</option><option value="true">Finance</option></select></div></label>
    <label className="filter-card"><SvgIcon name="sliders" /><div><p>Category</p><select value={filters.category} onChange={(event) => setFilter("category", event.target.value)}>{categoryOptions.map((category) => <option key={category.value || "all"} value={category.value}>{category.label}</option>)}</select></div></label>
  </>;

  return <>
    <main className="browse-page">
      <header className="topbar"><Link href="/" className="logo">Kerb</Link><nav className="nav"><Link href="/browse" className={!filters.category && !filters.finance ? "nav-item active" : "nav-item"}><SvgIcon name="car" />Browse cars</Link><Link href="/new-cars" className={filters.category === "newer-car" ? "nav-item active" : "nav-item"}><SvgIcon name="new" />New cars</Link><Link href="/sell-car" className="nav-item"><SvgIcon name="sell" />Sell your car</Link><Link href="/electric-cars" className={filters.category === "electric-hybrid" ? "nav-item active" : "nav-item"}><SvgIcon name="electric" />Electric</Link><Link href="/cars-on-finance" className={filters.finance === "true" ? "nav-item active" : "nav-item"}><SvgIcon name="finance" />Finance</Link><Link href="/guides" className="nav-item guides-link"><SvgIcon name="guides" />Guides</Link></nav><div className="top-actions"><Link href="/saved" className="saved-button"><SvgIcon name="heart" />Saved</Link>{currentUser ? <><Link href="/account" className="signin-button"><SvgIcon name="user" />My account{unreadCount > 0 && <span className="top-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}</Link><button className="logout-button" type="button" onClick={handleLogout}>Log out</button></> : <Link href="/login" className="signin-button"><SvgIcon name="user" />Sign in</Link>}<Link href="/sell-car" className="post-button"><SvgIcon name="plus" />Post your car</Link></div><SiteMenu currentUser={currentUser} onLogout={handleLogout} unreadCount={unreadCount} /></header>
      <section className="top-filters-section" aria-label="Browse filters"><div className="filters-panel"><div className="filters-grid">{filterControls}<button className="filter-button" type="button" onClick={() => setIsFilterPanelOpen(true)}><SvgIcon name="sliders" />More filters</button></div><div className="search-row"><input value={search} onChange={(event) => { setSearch(event.target.value); updateUrl(filters, event.target.value, sort); }} placeholder="Search make, model, fuel, location..." className="search-input" /><div className="sort-box"><span>Sort by</span><select value={sort} onChange={(event) => { setSort(event.target.value); updateUrl(filters, search, event.target.value); }}><option value="newest">Newest first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="mileage-low">Lowest mileage</option></select></div>{hasActiveFilters && <button type="button" className="clear-button" onClick={clearFilters}>Clear filters</button>}</div>{activeFilterChips.length > 0 && <div className="filter-tools"><div className="filter-chips">{activeFilterChips.map((chip) => <button type="button" className="filter-chip" key={chip.key} onClick={() => clearFilterChip(chip.key)}><span>{chip.label}</span><strong>×</strong></button>)}</div></div>}</div></section>
      <button className="floating-filter-button" type="button" onClick={() => setIsFilterPanelOpen(true)} aria-expanded={isFilterPanelOpen}><SvgIcon name="sliders" /><span>Filters</span>{activeFilterCount > 0 && <strong>{activeFilterCount}</strong>}</button>{isFilterPanelOpen && <button className="filter-backdrop" type="button" aria-label="Close filters" onClick={() => setIsFilterPanelOpen(false)} />}
      <section className={isFilterPanelOpen ? "filters-section filters-open" : "filters-section"} aria-hidden={!isFilterPanelOpen}><div className="mobile-filter-bar"><button className="mobile-filter-toggle" type="button" onClick={() => setIsFilterPanelOpen(false)}><SvgIcon name="sliders" />Close filters</button><span>{hasActiveFilters ? `${activeFilterCount} active` : `${visibleCars.length} cars`}</span>{hasActiveFilters && <button className="mobile-clear-button" type="button" onClick={clearFilters}>Clear</button>}</div><div className="filters-panel"><div className="filters-grid">{filterControls}<button className="filter-button" type="button" onClick={() => setIsFilterPanelOpen(false)}><SvgIcon name="sliders" />Filter</button></div></div></section>
      <section className="results-section"><div className="results-heading"><h1>{selectedCategoryLabel ? `${visibleCars.length} ${selectedCategoryLabel.toLowerCase()} found` : filters.finance === "true" ? `${visibleCars.length} finance car${visibleCars.length === 1 ? "" : "s"} found` : `${visibleCars.length} car${visibleCars.length === 1 ? "" : "s"} found`}</h1></div>{initialLoadError && <div className="error-box">{initialLoadError}</div>}{!initialLoadError && visibleCars.length === 0 && <div className="empty-box"><h2>No cars found</h2><p>Try clearing your filters or post a new listing.</p><div className="empty-actions"><button type="button" onClick={clearFilters}>Clear filters</button><Link href="/sell-car">Post your car</Link></div></div>}{!initialLoadError && visibleCars.length > 0 && <div className="cars-grid">{visibleCars.map((car, index) => { const title = getTitle(car); const images = getListingImages(car); const image = getImage(car); const photoCount = images.length || 1; const mileage = getCarMileage(car) ? `${new Intl.NumberFormat("en-GB").format(getCarMileage(car))} miles` : ""; const year = car.year || car.registration_year || ""; const location = car.location || car.city || car.postcode || ""; const price = car.price || car.asking_price || car.listing_price; const rawSellerType = String(car.seller_type || "").toLowerCase(); const sellerTypeLabel = rawSellerType.includes("private") ? "Private seller" : rawSellerType.includes("dealer") ? "Dealer" : "Seller"; const sellerBadgeClass = rawSellerType.includes("private") ? "private" : rawSellerType.includes("dealer") ? "dealer" : "seller"; const listingId = String(car.id || ""); const isSaved = savedListingIds.includes(listingId); const isSaving = savingListingIds.includes(listingId); return <article className="car-card clickable-card" key={car.id || index} role="link" tabIndex={0} aria-label={`View ${title}`} onClick={() => { if (listingId) window.location.href = `/listing/${listingId}`; }} style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}><div className="image-wrap"><img src={image} alt={title} onError={(event) => { event.currentTarget.src = "/cars/hero-car.png"; }} /><div className={`seller-badge ${sellerBadgeClass}`}><SvgIcon name="shield" />{sellerTypeLabel}</div><button type="button" className={isSaved ? "heart-button saved" : "heart-button"} onClick={(event) => { event.stopPropagation(); toggleSavedListing(listingId); }} disabled={isSaving} aria-label={isSaved ? "Remove saved car" : "Save this car"}><SvgIcon name="heart" /></button><div className="photo-count"><SvgIcon name="camera" />{`1/${photoCount}`}</div></div><div className="card-body"><h2>{title}</h2><p className="subtitle">{getSubtitle(car)}</p><div className="price-location"><strong>{formatPrice(price)}</strong>{location && <span>{location}</span>}</div><div className="specs">{mileage && <span>{mileage}</span>}{year && <span>{year}</span>}{(car.fuel || car.fuel_type) && <span>{car.fuel || car.fuel_type}</span>}{(car.transmission || car.gearbox) && <span>{car.transmission || car.gearbox}</span>}</div><Link href={`/listing/${car.id}`} className="view-link" onClick={(event) => event.stopPropagation()}>View listing</Link></div></article>; })}</div>}</section>
    </main>
    <style jsx global>{styles}</style>
  </>;
}

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #f8faff; color: #12182f; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  a { text-decoration: none; color: inherit; } button, input, select { font-family: inherit; }
  .browse-page { min-height: 100vh; background: radial-gradient(circle at top left, rgba(0,72,255,.06), transparent 34%), #f8faff; overflow-x: hidden; }
  .svg-icon { width: 20px; height: 20px; flex: 0 0 auto; }
  .topbar { height: 92px; padding: 0 22px; display: flex; align-items: center; gap: 18px; background: rgba(255,255,255,.92); border-bottom: 1px solid #e9edf6; position: sticky; top: 0; z-index: 20; backdrop-filter: blur(16px); width: 100%; max-width: 100vw; }
  .logo { font-size: 42px; line-height: 1; font-weight: 950; letter-spacing: -2px; color: #0b45ff; margin-right: 24px; flex: 0 0 auto; }
  .nav { display: flex; align-items: center; gap: 8px; flex: 1 1 auto; min-width: 0; overflow: hidden; }
  .nav-item { height: 50px; display: inline-flex; align-items: center; gap: 8px; padding: 0 12px; border-radius: 16px; font-size: 14px; font-weight: 800; color: #1b2240; white-space: nowrap; flex: 0 0 auto; }
  .nav-item .svg-icon { width: 18px; height: 18px; } .nav-item.active { color: #0b45ff; background: #eef3ff; }
  .top-actions { display: flex; align-items: center; gap: 10px; flex: 0 0 auto; }
  .saved-button, .signin-button, .logout-button { border: none; background: transparent; color: #4b5575; font-size: 14px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; padding: 0; white-space: nowrap; } .logout-button { color: #c01818; }
  .top-badge { min-width: 18px; height: 18px; border-radius: 999px; background: #d7193f; color: white; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; font-size: 10px; font-weight: 950; }
  .post-button { height: 58px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; padding: 0 18px; border-radius: 16px; background: #083cff; color: white; font-size: 14px; font-weight: 900; box-shadow: 0 12px 26px rgba(8,60,255,.22); white-space: nowrap; flex: 0 0 auto; }
  .top-filters-section { padding: 32px 34px 0; } .top-filters-section .filters-grid { display: grid; grid-template-columns: repeat(5, minmax(190px, 1fr)); gap: 14px; align-items: stretch; } .top-filters-section .filter-card, .top-filters-section .filter-button { min-height: 72px; border-radius: 18px; }
  .filters-section { position: fixed; top: 0; right: 0; z-index: 80; width: min(450px, 100vw); height: 100vh; padding: 18px; background: #f8faff; border-left: 1px solid #dfe7f5; box-shadow: -24px 0 70px rgba(10,20,40,.16); overflow: auto; transform: translateX(calc(100% + 28px)); transition: transform .24s ease; pointer-events: none; } .filters-section.filters-open { transform: translateX(0); pointer-events: auto; }
  .filter-backdrop { position: fixed; inset: 0; z-index: 70; border: none; background: rgba(7,17,38,.34); backdrop-filter: blur(3px); cursor: pointer; }
  .floating-filter-button { position: fixed; top: 118px; right: 28px; z-index: 60; min-height: 52px; border: none; border-radius: 999px; background: #083cff; color: white; display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 0 18px; font-size: 14px; font-weight: 950; box-shadow: 0 18px 42px rgba(8,60,255,.26); cursor: pointer; } .floating-filter-button strong { min-width: 22px; height: 22px; border-radius: 999px; background: white; color: #083cff; display: inline-flex; align-items: center; justify-content: center; padding: 0 7px; font-size: 11px; }
  .filters-section .filters-grid { display: grid; grid-template-columns: 1fr; gap: 12px; align-items: center; }
  .mobile-filter-bar { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e5ebf5; border-radius: 16px; padding: 10px; box-shadow: 0 8px 20px rgba(13,23,55,.04); margin-bottom: 14px; } .mobile-filter-toggle, .mobile-clear-button { border: none; cursor: pointer; } .mobile-filter-toggle { height: 42px; border-radius: 12px; padding: 0 14px; display: inline-flex; align-items: center; gap: 8px; background: #083cff; color: white; font-size: 14px; font-weight: 950; } .mobile-filter-bar span { color: #68728d; font-size: 12px; font-weight: 850; margin-right: auto; } .mobile-clear-button { height: 36px; border-radius: 10px; padding: 0 12px; background: #eef3ff; color: #0b45ff; font-size: 12px; font-weight: 950; }
  .filter-card { min-height: 64px; background: white; border: 1px solid #e5ebf5; border-radius: 16px; display: flex; align-items: center; gap: 14px; padding: 0 16px; box-shadow: 0 8px 20px rgba(13,23,55,.04); min-width: 0; transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; } .filter-card:hover { transform: translateY(-2px); border-color: #d4def0; box-shadow: 0 12px 28px rgba(13,23,55,.08); } .filter-card .svg-icon { width: 24px; height: 24px; color: #11182f; } .filter-card > div { min-width: 0; flex: 1; } .filter-card p { margin: 0 0 2px; color: #6d7691; font-size: 13px; font-weight: 600; } .filter-card select, .filter-card input { width: 100%; min-width: 0; border: none; outline: none; background: transparent; color: #12182f; font-size: 13px; font-weight: 900; padding: 0; } .filter-card input::placeholder { color: #12182f; opacity: 1; }
  .range-card { padding-top: 9px; padding-bottom: 9px; align-items: center; } .range-controls { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 7px; align-items: center; } .range-controls select, .price-input-wrap { min-width: 0; height: 29px; border: 1px solid #e5ebf5; border-radius: 9px; background: #f7f9fd; padding: 0 7px; font-size: 12px; } .price-input-wrap { display: flex; align-items: center; gap: 4px; } .price-input-wrap span { color: #6d7691; font-size: 12px; font-weight: 900; }
  .filter-button { height: 64px; width: 100%; border: none; border-radius: 16px; background: #083cff; color: white; font-size: 15px; font-weight: 950; cursor: pointer; box-shadow: 0 12px 26px rgba(8,60,255,.22); display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-width: 0; }
  .search-row { margin-top: 18px; display: grid; grid-template-columns: minmax(280px, 520px) 240px auto; align-items: center; justify-content: space-between; gap: 14px; } .search-input { width: 100%; height: 46px; border: 1px solid #e5ebf5; border-radius: 14px; background: white; padding: 0 16px; color: #12182f; font-size: 14px; outline: none; box-shadow: 0 8px 20px rgba(13,23,55,.04); } .sort-box { height: 46px; width: 100%; min-width: 0; background: white; border: 1px solid #e5ebf5; border-radius: 16px; display: flex; align-items: center; gap: 12px; padding: 0 16px; box-shadow: 0 8px 20px rgba(13,23,55,.04); } .sort-box span { color: #68728d; font-size: 14px; font-weight: 600; } .sort-box select { flex: 1; border: none; outline: none; background: transparent; color: #12182f; font-size: 14px; font-weight: 900; cursor: pointer; } .clear-button { height: 46px; border: none; border-radius: 14px; background: #eef3ff; color: #0b45ff; padding: 0 18px; font-weight: 950; white-space: nowrap; cursor: pointer; width: auto; }
  .filter-tools { margin-top: 14px; display: grid; gap: 12px; } .filter-chips { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; min-width: 0; } .filter-chip { min-height: 34px; border: 1px solid #dfe7f5; border-radius: 999px; background: white; color: #1a2442; display: inline-flex; align-items: center; gap: 8px; padding: 0 12px; font-size: 12px; font-weight: 900; box-shadow: 0 6px 18px rgba(13,23,55,.04); cursor: pointer; } .filter-chip strong { width: 18px; height: 18px; border-radius: 50%; background: #eef3ff; color: #0b45ff; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; line-height: 1; }
  .results-section { padding: 34px 32px 50px; } .results-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; } .results-heading h1 { margin: 0; font-size: 18px; font-weight: 950; letter-spacing: -.2px; color: #12182f; } .cars-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; } .car-card { overflow: hidden; border-radius: 16px; background: white; border: 1px solid #e5ebf5; box-shadow: 0 12px 28px rgba(13,23,55,.06); transition: transform .18s ease, box-shadow .18s ease; animation: browseCardIn .42s ease both; cursor: pointer; } .car-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(13,23,55,.12); }
  .image-wrap { height: 205px; position: relative; background: #e9eef7; overflow: hidden; } .image-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .32s ease; } .car-card:hover .image-wrap img { transform: scale(1.035); } .seller-badge { position: absolute; left: 12px; top: 12px; height: 30px; display: inline-flex; align-items: center; gap: 6px; padding: 0 12px; border-radius: 8px; font-size: 12px; font-weight: 950; box-shadow: 0 8px 20px rgba(0,0,0,.08); } .seller-badge .svg-icon { width: 14px; height: 14px; } .seller-badge.dealer { color: #0843ff; background: #eef3ff; } .seller-badge.private { color: #077245; background: #eafff3; } .seller-badge.seller { color: #4b5575; background: #f2f5fb; }
  .heart-button { position: absolute; z-index: 4; right: 12px; top: 12px; width: 38px; height: 38px; border-radius: 50%; border: none; background: rgba(16,22,42,.3); color: white; cursor: pointer; backdrop-filter: blur(5px); display: inline-flex; align-items: center; justify-content: center; } .heart-button.saved { background: #fff1f1; color: #d7193f; box-shadow: 0 10px 24px rgba(215,25,63,.22); } .heart-button.saved .svg-icon path { fill: currentColor; } .photo-count { position: absolute; right: 10px; bottom: 10px; height: 26px; display: inline-flex; align-items: center; gap: 5px; padding: 0 9px; border-radius: 7px; background: white; color: #151b32; font-size: 12px; font-weight: 900; } .photo-count .svg-icon { width: 13px; height: 13px; }
  .card-body { padding: 15px 17px 16px; } .card-body h2 { margin: 0 0 6px; color: #151b32; font-size: 18px; font-weight: 950; letter-spacing: -.3px; } .subtitle { margin: 0 0 12px; color: #5e6782; font-size: 13px; line-height: 1.35; min-height: 18px; } .price-location { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; } .price-location strong { color: #11182f; font-size: 21px; font-weight: 950; letter-spacing: -.4px; } .price-location span { color: #65708d; font-size: 12px; font-weight: 700; text-align: right; } .specs { display: flex; flex-wrap: wrap; gap: 8px; } .specs span { display: inline-flex; align-items: center; height: 26px; padding: 0 12px; border-radius: 8px; background: #f0f3f8; color: #59627c; font-size: 12px; font-weight: 800; } .view-link { position: relative; z-index: 4; margin-top: 14px; height: 42px; border-radius: 12px; background: #f2f5ff; color: #0b45ff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 950; }
  .error-box, .empty-box { background: white; border: 1px solid #e5ebf5; border-radius: 20px; padding: 28px; box-shadow: 0 12px 28px rgba(13,23,55,.06); } .empty-box { padding: 50px 24px; text-align: center; } .empty-box h2 { margin: 0; color: #11182f; font-size: 26px; font-weight: 950; } .empty-box p { margin: 10px 0 22px; color: #68728d; font-weight: 600; } .empty-actions { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; } .empty-actions a, .empty-actions button { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 22px; border-radius: 14px; background: #083cff; color: white; font-weight: 950; border: none; cursor: pointer; } .empty-actions button { background: #eef3ff; color: #0b45ff; }
  @keyframes browseCardIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 1280px) { .guides-link { display: none; } .cars-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .top-filters-section .filters-grid { grid-template-columns: repeat(3, minmax(190px, 1fr)); } }
  @media (max-width: 1050px) { .topbar { height: auto; min-height: 92px; padding: 18px; flex-wrap: wrap; overflow: visible; } .logo { margin-right: auto; } .top-actions { gap: 8px; margin-left: auto; } .saved-button, .signin-button, .logout-button { display: none; } .top-filters-section { display: none; } .results-section { padding-left: 18px; padding-right: 18px; } .cars-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; } }
  @media (max-width: 620px) { .topbar { min-height: 72px; padding: 12px 14px; gap: 10px; flex-wrap: nowrap; } .logo { font-size: 34px; margin-right: auto; } .nav { display: none; } .top-actions { flex: 0 0 auto; } .post-button { height: 46px; padding: 0 12px; border-radius: 14px; font-size: 13px; } .filters-section { width: min(390px, 100vw); padding: 14px; } .results-section { padding: 16px 14px 44px; } .floating-filter-button { top: auto; right: 16px; bottom: 18px; min-height: 50px; } .cars-grid { grid-template-columns: 1fr; } .image-wrap { height: 220px; } .search-row { grid-template-columns: 1fr; } }
`;

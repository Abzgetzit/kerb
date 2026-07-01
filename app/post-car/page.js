"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteMenu from "../components/SiteMenu";
import {
  bodyTypeOptions,
  conditionOptions,
  vehicleMakes,
} from "../lib/vehicle-data";

const MAX_LISTING_PHOTOS = 30;

const modelDetails = {
  Audi: {
    A3: ["30 TFSI", "35 TFSI", "35 TDI", "40 TFSI e", "S3", "RS3"],
    A4: ["35 TFSI", "40 TFSI", "35 TDI", "40 TDI", "S4", "RS4"],
    A5: ["35 TFSI", "40 TFSI", "35 TDI", "S5", "RS5"],
    Q5: ["40 TDI", "45 TFSI", "50 TFSI e", "SQ5"],
  },
  BMW: {
    "1 Series": ["116i", "118i", "118d", "120i", "120d", "128ti", "M135i"],
    "2 Series": ["218i", "220i", "220d", "225e", "M235i", "M240i"],
    "3 Series": [
      "318i",
      "318i M Sport",
      "318d",
      "318d M Sport",
      "320i",
      "320i M Sport",
      "320d",
      "320d M Sport",
      "330i",
      "330i M Sport",
      "330d",
      "330d M Sport",
      "330e",
      "330e M Sport",
      "335d",
      "335i",
      "M340i",
      "M340d",
      "M3",
    ],
    "4 Series": ["420i", "420d", "430i", "430d", "435d", "M440i", "M440d", "M4"],
    "5 Series": ["520i", "520d", "530i", "530d", "530e", "540i", "M550i", "M5"],
    X3: ["xDrive20d", "xDrive30e", "xDrive30d", "M40i", "M40d", "X3 M"],
    X5: ["xDrive30d", "xDrive40i", "xDrive45e", "xDrive50e", "M50d", "X5 M"],
  },
  Ford: {
    Fiesta: ["1.0 EcoBoost", "1.5 TDCi", "ST-Line", "ST"],
    Focus: ["1.0 EcoBoost", "1.5 EcoBlue", "ST-Line", "ST", "RS"],
    Kuga: ["EcoBoost", "EcoBlue", "PHEV", "ST-Line"],
  },
  "Mercedes-Benz": {
    "A-Class": ["A180", "A200", "A220", "A250e", "A35 AMG", "A45 AMG"],
    "C-Class": ["C180", "C200", "C220d", "C300", "C300e", "C43 AMG", "C63 AMG"],
    "E-Class": ["E220d", "E300", "E300e", "E400d", "E53 AMG", "E63 AMG"],
    GLC: ["GLC 220d", "GLC 300", "GLC 300e", "GLC 43 AMG", "GLC 63 AMG"],
  },
  Tesla: {
    "Model 3": ["Rear-Wheel Drive", "Long Range", "Performance"],
    "Model Y": ["Rear-Wheel Drive", "Long Range", "Performance"],
    "Model S": ["Long Range", "Plaid"],
    "Model X": ["Long Range", "Plaid"],
  },
  Volkswagen: {
    Golf: ["1.0 TSI", "1.5 TSI", "2.0 TDI", "GTE", "GTI", "GTD", "R"],
    Passat: ["1.5 TSI", "2.0 TDI", "GTE", "R-Line"],
    Polo: ["1.0 MPI", "1.0 TSI", "GTI"],
    Tiguan: ["1.5 TSI", "2.0 TDI", "eHybrid", "R-Line", "R"],
  },
};

const makeFallbackGuide = {
  Abarth: 22000,
  "Alfa Romeo": 30000,
  Audi: 36000,
  BMW: 38000,
  Citroen: 21000,
  Cupra: 34000,
  Dacia: 17000,
  DS: 31000,
  Fiat: 18000,
  Ford: 26000,
  Honda: 28000,
  Hyundai: 28000,
  Jaguar: 45000,
  Jeep: 36000,
  Kia: 29000,
  "Land Rover": 56000,
  Lexus: 43000,
  Mazda: 28000,
  "Mercedes-Benz": 40000,
  MINI: 27000,
  Nissan: 27000,
  Peugeot: 26000,
  Polestar: 48000,
  Porsche: 72000,
  Renault: 24000,
  SEAT: 24000,
  Skoda: 28000,
  Smart: 21000,
  Subaru: 33000,
  Suzuki: 21000,
  Tesla: 46000,
  Toyota: 29000,
  Vauxhall: 23000,
  Volkswagen: 30000,
  Volvo: 44000,
};

const carFeatureOptions = [
  "Apple CarPlay",
  "Android Auto",
  "Bluetooth",
  "Satellite navigation",
  "Parking sensors",
  "Reversing camera",
  "Heated seats",
  "Leather seats",
  "Cruise control",
  "Adaptive cruise control",
  "Air conditioning",
  "Climate control",
  "Keyless entry",
  "Panoramic roof",
  "DAB radio",
  "Service history",
  "MOT included",
  "ULEZ compliant",
  "Alloy wheels",
  "Electric folding mirrors",
  "Lane assist",
  "Blind spot monitoring",
];

const listingCategoryOptions = [
  { value: "general", label: "General listing" },
  { value: "first-car", label: "First car" },
  { value: "performance", label: "Performance" },
  { value: "family-suv", label: "Family SUVs" },
  { value: "electric-hybrid", label: "Electric or hybrid" },
  { value: "newer-car", label: "Newer car" },
];

const boostPlanOptions = [
  {
    value: "none",
    label: "No boost",
    price: "Free",
    description: "List your car normally with no paid boost.",
  },
  {
    value: "7-days",
    label: "1 week",
    price: "£7.99",
    description: "Priority placement for 7 days.",
  },
  {
    value: "14-days",
    label: "2 weeks",
    price: "£13.99",
    description: "Priority placement for 14 days.",
  },
  {
    value: "30-days",
    label: "1 month",
    price: "£19.99",
    description: "Priority placement for 30 days.",
  },
];

const modelValueGuide = {
  "BMW|1 Series": 31000,
  "BMW|2 Series": 34000,
  "BMW|3 Series": 39000,
  "BMW|4 Series": 45000,
  "BMW|5 Series": 51000,
  "BMW|X3": 51000,
  "BMW|X5": 72000,
  "Audi|A3": 33000,
  "Audi|A4": 39000,
  "Audi|A5": 46000,
  "Audi|Q5": 53000,
  "Ford|Fiesta": 21000,
  "Ford|Focus": 26000,
  "Ford|Kuga": 33000,
  "Mercedes-Benz|A-Class": 34000,
  "Mercedes-Benz|C-Class": 47000,
  "Mercedes-Benz|E-Class": 56000,
  "Mercedes-Benz|GLC": 57000,
  "Tesla|Model 3": 43000,
  "Tesla|Model Y": 46000,
  "Volkswagen|Golf": 30000,
  "Volkswagen|Passat": 36000,
  "Volkswagen|Polo": 21000,
  "Volkswagen|Tiguan": 38000,
};

const modelDetailValueGuide = {
  "BMW|3 Series|318i": 36000,
  "BMW|3 Series|318i M Sport": 38500,
  "BMW|3 Series|318d": 35000,
  "BMW|3 Series|318d M Sport": 37500,
  "BMW|3 Series|320d": 36000,
  "BMW|3 Series|320d M Sport": 41000,
  "BMW|3 Series|320i": 39000,
  "BMW|3 Series|320i M Sport": 41500,
  "BMW|3 Series|330i M Sport": 50000,
  "BMW|3 Series|330e": 47000,
  "BMW|3 Series|330e M Sport": 50000,
  "BMW|3 Series|330d": 48000,
  "BMW|3 Series|330d M Sport": 51000,
  "BMW|3 Series|335d": 50000,
  "BMW|3 Series|335i": 47000,
  "BMW|3 Series|M340i": 58000,
  "BMW|3 Series|M340d": 57000,
  "BMW|3 Series|M3": 82000,
  "BMW|4 Series|M4": 85000,
  "BMW|5 Series|M5": 112000,
  "Audi|A3|S3": 46000,
  "Audi|A3|RS3": 62000,
  "Audi|A4|RS4": 78000,
  "Audi|A5|RS5": 82000,
  "Ford|Focus|ST": 36000,
  "Ford|Focus|RS": 43000,
  "Mercedes-Benz|A-Class|A35 AMG": 46000,
  "Mercedes-Benz|A-Class|A45 AMG": 64000,
  "Mercedes-Benz|C-Class|C63 AMG": 91000,
  "Tesla|Model 3|Performance": 56000,
  "Tesla|Model Y|Performance": 60000,
  "Volkswagen|Golf|GTI": 39000,
  "Volkswagen|Golf|GTD": 37000,
  "Volkswagen|Golf|R": 50000,
};

function normaliseModelDetail(value) {
  return String(value || "")
    .replace(/\s+(M Sport|AMG Line|S Line|S-Line|ST-Line|ST Line|R-Line|R Line|GT Line|Titanium|Vignale|Black Edition)$/i, "")
    .trim();
}

function getTrimMultiplier(value) {
  const detail = String(value || "").toLowerCase();

  if (detail.includes("black edition")) return 1.08;
  if (detail.includes("m sport")) return 1.07;
  if (detail.includes("amg line")) return 1.07;
  if (detail.includes("s line") || detail.includes("s-line")) return 1.06;
  if (detail.includes("r line") || detail.includes("r-line")) return 1.05;
  if (detail.includes("st line") || detail.includes("st-line")) return 1.04;
  if (detail.includes("gt line")) return 1.04;
  if (detail.includes("titanium")) return 1.03;
  if (detail.includes("vignale")) return 1.05;

  return 1;
}

function getGuidePrice({ make, model, modelDetail }) {
  const detailKey = `${make}|${model}|${modelDetail}`;
  const modelKey = `${make}|${model}`;
  const exactDetailGuide = modelDetailValueGuide[detailKey];

  if (exactDetailGuide) return exactDetailGuide;

  const normalisedDetail = normaliseModelDetail(modelDetail);
  const normalisedDetailKey = `${make}|${model}|${normalisedDetail}`;
  const baseGuide =
    modelDetailValueGuide[normalisedDetailKey] ||
    modelValueGuide[modelKey] ||
    makeFallbackGuide[make] ||
    22000;

  return roundToNearestHundred(baseGuide * getTrimMultiplier(modelDetail));
}

function cleanNumber(value) {
  const number = Number(String(value || "").replace(/[^0-9.]/g, ""));

  return Number.isFinite(number) ? number : 0;
}

function roundToNearestHundred(value) {
  return Math.round(value / 100) * 100;
}

function getAgeFactor(age) {
  const factors = [
    0.92,
    0.78,
    0.68,
    0.6,
    0.53,
    0.46,
    0.39,
    0.32,
    0.26,
    0.21,
    0.17,
    0.135,
    0.105,
    0.085,
    0.07,
    0.06,
  ];

  if (age < factors.length) return factors[age];

  return Math.max(0.04, 0.06 * Math.pow(0.9, age - 15));
}

export default function PostCarPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedListing, setSubmittedListing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [boostCheckoutError, setBoostCheckoutError] = useState("");

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [modelDetail, setModelDetail] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [fuel, setFuel] = useState("");
  const [gearbox, setGearbox] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [condition, setCondition] = useState("");
  const [financeAvailable, setFinanceAvailable] = useState("false");
  const [listingCategory, setListingCategory] = useState("general");
  const [selectedBoostPlan, setSelectedBoostPlan] = useState("none");
  const [showSellerName, setShowSellerName] = useState(true);
  const [showSellerPhone, setShowSellerPhone] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [photos, setPhotos] = useState([]);
  const photoUrlsRef = useRef([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("kerbUser");
    const savedEmail = localStorage.getItem("kerbAccountEmail");
    const token = localStorage.getItem("kerbSessionToken");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        setShowSellerName(parsedUser.default_show_seller_name !== false);
        setShowSellerPhone(
          parsedUser.default_show_seller_phone === true && Boolean(parsedUser.phone)
        );
        setIsCheckingAuth(false);
        return;
      } catch {
        localStorage.removeItem("kerbUser");
      }
    }

    if (token && savedEmail) {
      setCurrentUser({ email: savedEmail });
      setIsCheckingAuth(false);
      return;
    }

    window.location.href = "/login";
  }, []);

  const availableModels = make ? vehicleMakes[make] || [] : [];
  const availableModelDetails =
    make && model ? modelDetails[make]?.[model] || [] : [];

  const finalModel =
    model === "Other"
      ? customModel
      : [model, modelDetail].filter(Boolean).join(" ") || customModel;

  const valuation = useMemo(() => {
    if (!make || !year || !mileage) return null;

    const carAge = new Date().getFullYear() - Number(year);
    const mileageNumber = cleanNumber(mileage);
    const askingPriceNumber = cleanNumber(askingPrice);

    if (!Number.isFinite(carAge) || !Number.isFinite(mileageNumber)) return null;

    const cleanAge = Math.max(carAge, 0);
    const guidePrice = getGuidePrice({ make, model, modelDetail });
    const depreciationFactor = getAgeFactor(cleanAge);
    const expectedMileage = Math.max(cleanAge, 1) * 9000;
    const mileageDelta = mileageNumber - expectedMileage;
    const mileageRate = guidePrice >= 50000 ? 0.035 : 0.02;

    let estimate = guidePrice * depreciationFactor - mileageDelta * mileageRate;

    if (fuel === "Electric") estimate *= 1.06;
    if (fuel === "Hybrid") estimate *= 1.04;
    if (fuel === "Diesel" && cleanAge >= 8) estimate *= 0.94;
    if (gearbox === "Automatic") estimate *= 1.02;
    if (condition === "New") estimate = guidePrice * 0.95;

    if (askingPriceNumber > 0 && estimate > askingPriceNumber * 1.35) {
      estimate = askingPriceNumber * 0.98;
    }

    estimate = Math.max(estimate, 1200);

    return {
      low: roundToNearestHundred(estimate * 0.92),
      high: roundToNearestHundred(estimate * 1.08),
    };
  }, [
    make,
    model,
    modelDetail,
    year,
    mileage,
    askingPrice,
    fuel,
    gearbox,
    condition,
  ]);

  function handleLogout() {
    localStorage.removeItem("kerbSessionToken");
    localStorage.removeItem("kerbAccountEmail");
    localStorage.removeItem("kerbUser");
    window.dispatchEvent(new Event("kerb-auth-change"));
    window.location.href = "/";
  }

  useEffect(() => {
    return () => {
      photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      photoUrlsRef.current = [];
    };
  }, []);

  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => {
      const url = URL.createObjectURL(file);
      photoUrlsRef.current.push(url);

      return {
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        name: file.name,
        url,
      };
    });

    setPhotos((currentPhotos) => {
      const nextPhotos = [...currentPhotos, ...previews].slice(0, MAX_LISTING_PHOTOS);
      const keptUrls = new Set(nextPhotos.map((photo) => photo.url));

      photoUrlsRef.current = photoUrlsRef.current.filter((url) => {
        if (keptUrls.has(url)) return true;

        URL.revokeObjectURL(url);
        return false;
      });

      return nextPhotos;
    });

    e.target.value = "";
  }

  function removePhoto(photoId) {
    setPhotos((currentPhotos) => {
      const photoToRemove = currentPhotos.find((photo) => photo.id === photoId);

      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.url);
        photoUrlsRef.current = photoUrlsRef.current.filter(
          (url) => url !== photoToRemove.url
        );
      }

      return currentPhotos.filter((photo) => photo.id !== photoId);
    });
  }

  async function startBoostCheckout({ listingId, token, planId }) {
    const response = await fetch("/api/listing-boosts/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-kerb-session-token": token,
      },
      body: JSON.stringify({
        listing_id: listingId,
        plan_id: planId,
        source: "post-car-create",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not start boost checkout.");
    }

    if (!result.url) {
      throw new Error("Stripe checkout link was not created.");
    }

    return result.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setBoostCheckoutError("");

    const token = localStorage.getItem("kerbSessionToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    photos.forEach((photo) => {
      formData.append("photos", photo.file);
    });

    formData.set("model", finalModel);
    formData.set("model_detail", modelDetail);
    formData.set("body_type", bodyType);
    formData.set("condition", condition);
    formData.set("finance_available", financeAvailable);
    formData.set("listing_category", listingCategory);
    formData.set("show_seller_name", showSellerName ? "true" : "false");
    formData.set("show_seller_phone", showSellerPhone ? "true" : "false");
    formData.set("terms_accepted", acceptedTerms ? "true" : "false");
    formData.set("terms_version", "2026-06-28");

    if (currentUser?.id) {
      formData.set("account_id", currentUser.id);
    }

    if (currentUser?.email) {
      formData.set("account_email", currentUser.email);
      formData.set("seller_email", currentUser.email);
    }

    if (currentUser?.name) {
      formData.set("account_name", currentUser.name);
    }

    if (currentUser?.full_name && !currentUser?.name) {
      formData.set("account_name", currentUser.full_name);
    }

    if (valuation) {
      formData.set("valuation_low", valuation.low);
      formData.set("valuation_high", valuation.high);
    }

    try {
      const response = await fetch("/api/post-car", {
        method: "POST",
        headers: {
          "x-kerb-session-token": token,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not submit listing.");
      }

      setSubmittedListing(result.listing);

      if (selectedBoostPlan !== "none" && result.listing?.id) {
        try {
          const checkoutUrl = await startBoostCheckout({
            listingId: result.listing.id,
            token,
            planId: selectedBoostPlan,
          });

          window.location.href = checkoutUrl;
          return;
        } catch (checkoutError) {
          setBoostCheckoutError(
            `Your listing is live, but the boost checkout could not start. ${checkoutError.message || ""}`.trim()
          );
          setSubmitted(true);
          return;
        }
      }

      if (result.listing?.id) {
        window.location.href = `/listing/${result.listing.id}`;
        return;
      }

      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="page">
        <div className="loadingBox">Checking your account...</div>
        <style>{styles}</style>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="page">
        <div className="successBox">
          <a href="/" className="logo">Kerb</a>
          <div className="successIcon">✅</div>
          <h1>Your listing is live</h1>
          <p>
            Your car listing has been saved and is now live on Kerb.
          </p>

          {boostCheckoutError && (
            <div className="warningBox">{boostCheckoutError}</div>
          )}

          {submittedListing && (
            <div className="listingSummary">
              <strong>
                {submittedListing.year} {submittedListing.make} {submittedListing.model}
              </strong>
              <span>{submittedListing.location}</span>
            </div>
          )}

          <div className="successActions">
            <a href="/account" className="secondaryBtn">My account</a>
            {submittedListing?.id && (
              <a href={`/listing/${submittedListing.id}`} className="secondaryBtn">
                View live listing
              </a>
            )}
            <a href="/browse" className="primaryBtn">Browse cars</a>
          </div>
        </div>

        <style>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="navbar">
        <a href="/" className="logo">Kerb</a>

        <div className="navActions">
          <a href="/browse" className="navLink">Browse cars</a>
          <a href="/account" className="accountButton">My account</a>
          <button className="logoutButton" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <SiteMenu currentUser={currentUser} onLogout={handleLogout} />
      </header>

      <section className="hero">
        <div>
          <div className="pill">Seller early access</div>
          <h1>Post your car on Kerb</h1>
          <p>
            Create your car listing with vehicle details, photos, seller
            information and a basic guide price estimate.
          </p>
        </div>

        <div className="heroCard">
          <h3>Listing checklist</h3>
          <ul>
            <li>Choose the make, model and body type</li>
            <li>Add mileage, year, condition and price</li>
            <li>Upload clear car photos</li>
            <li>Submit your seller details</li>
          </ul>
        </div>
      </section>

      <section className="formSection">
        <form className="formCard" onSubmit={handleSubmit}>
          <div className="formHeader">
            <div>
              <h2>Car details</h2>
              <p>Start with the basic information buyers care about most.</p>
            </div>
          </div>

          <div className="grid">
            <label>
              Make
              <select
                name="make"
                required
                value={make}
                onChange={(e) => {
                  setMake(e.target.value);
                  setModel("");
                  setModelDetail("");
                  setCustomModel("");
                }}
              >
                <option value="">Select make</option>
                {Object.keys(vehicleMakes).map((makeName) => (
                  <option key={makeName} value={makeName}>
                    {makeName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Model
              {make === "Other" || availableModels.length === 0 ? (
                <input
                  name="model_manual"
                  placeholder="Type the model"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  required
                />
              ) : (
                <>
                  <select
                    value={model}
                    onChange={(e) => {
                      setModel(e.target.value);
                      setModelDetail("");
                    }}
                    required={!customModel}
                  >
                    <option value="">Select model</option>
                    {availableModels.map((modelName) => (
                      <option key={modelName} value={modelName}>
                        {modelName}
                      </option>
                    ))}
                    <option value="Other">Other / type manually</option>
                  </select>

                  {model === "Other" && (
                    <input
                      className="manualInput"
                      name="model_manual"
                      placeholder="Type the model"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      required
                    />
                  )}
                </>
              )}
              <input type="hidden" name="model" value={finalModel} />
            </label>

            {availableModelDetails.length > 0 && (
              <label>
                Model detail
                <select
                  value={modelDetail}
                  onChange={(e) => setModelDetail(e.target.value)}
                >
                  <option value="">I am not sure / standard model</option>
                  {availableModelDetails.map((detail) => (
                    <option key={detail} value={detail}>
                      {detail}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              Year
              <input
                name="year"
                placeholder="2020"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </label>

            <label>
              Mileage
              <input
                name="mileage"
                placeholder="45,000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                required
              />
            </label>

            <label>
              Body type
              <select
                name="body_type"
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                required
              >
                <option value="">Select body type</option>
                {bodyTypeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              Condition
              <select
                name="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
              >
                <option value="">Select condition</option>
                {conditionOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              Fuel type
              <select
                name="fuel_type"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                required
              >
                <option value="">Select fuel type</option>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Hybrid</option>
                <option>Electric</option>
              </select>
            </label>

            <label>
              Gearbox
              <select
                name="gearbox"
                value={gearbox}
                onChange={(e) => setGearbox(e.target.value)}
                required
              >
                <option value="">Select gearbox</option>
                <option>Manual</option>
                <option>Automatic</option>
              </select>
            </label>

            <label>
              Asking price
              <input
                name="asking_price"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="£12,995"
                required
              />
            </label>

            <label>
              Location
              <input name="location" placeholder="Leicester" required />
            </label>

            <label>
              Finance available from seller/dealer?
              <select
                name="finance_available"
                value={financeAvailable}
                onChange={(e) => setFinanceAvailable(e.target.value)}
                required
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </label>

            <label>
              Best fit
              <select
                name="listing_category"
                value={listingCategory}
                onChange={(e) => setListingCategory(e.target.value)}
              >
                {listingCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="infoBox">
            <strong>Finance note</strong>
            <p>
              This only tells buyers whether the seller or dealer may offer finance.
              Kerb does not provide finance or sell cars directly.
            </p>
          </div>

          {valuation && (
            <div className="valuationBox">
              <div>
                <span>Rough guide price</span>
                <strong>
                  £{valuation.low.toLocaleString()} - £{valuation.high.toLocaleString()}
                </strong>
              </div>
              <p>
                This is a conservative Kerb estimate using make, model, version,
                age, mileage, fuel, condition and your asking price. It is not a
                guaranteed sale price.
              </p>
            </div>
          )}

          <input type="hidden" name="valuation_low" value={valuation?.low || ""} />
          <input type="hidden" name="valuation_high" value={valuation?.high || ""} />

          <section className="featuresSection">
            <div>
              <h2>Features</h2>
              <p>Select only the features this car actually has.</p>
            </div>

            <div className="featureChecklist">
              {carFeatureOptions.map((feature) => (
                <label className="featureOption" key={feature}>
                  <input name="features" type="checkbox" value={feature} />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </section>

          <label>
            Short description
            <textarea
              name="description"
              placeholder="Tell buyers about condition, service history, features, MOT, ownership, modifications or damage."
            />
          </label>

          <div className="photoSection">
            <div>
              <h2>Photos</h2>
              <p>Add up to {MAX_LISTING_PHOTOS} photos. Clear photos help buyers trust the listing.</p>
            </div>

            <label className="uploadBox">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
              />
              <span>📸</span>
              <strong>Upload car photos</strong>
              <small>Front, rear, sides, interior, wheels and dashboard</small>
            </label>

            {photos.length > 0 && (
              <div className="photoGrid">
                {photos.map((photo, index) => (
                  <div className="photoPreview" key={photo.id}>
                    <img src={photo.url} alt={photo.name} />
                    <button
                      type="button"
                      className="removePhotoButton"
                      onClick={() => removePhoto(photo.id)}
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h2>Seller details</h2>

          <div className="grid">
            <label>
              Full name
              <input
                name="seller_name"
                placeholder="Your name"
                defaultValue={
                  currentUser?.name ||
                  currentUser?.full_name ||
                  ""
                }
                required
              />
            </label>

            <label>
              Email address
              <input
                name="seller_email"
                type="email"
                placeholder="you@example.com"
                defaultValue={currentUser?.email || ""}
                readOnly={Boolean(currentUser?.email)}
                required
              />
            </label>

            <label>
              Phone number <span className="optionalText">Optional</span>
              <input
                name="seller_phone"
                placeholder="07..."
                defaultValue={currentUser?.phone || ""}
                required={showSellerPhone}
              />
            </label>

            <label>
              Seller type
              <select name="seller_type" required>
                <option value="">Select seller type</option>
                <option>Private seller</option>
                <option>Dealer</option>
              </select>
            </label>
          </div>

          <section className="privacySection">
            <div>
              <span className="privacyKicker">Public contact options</span>
              <h2>Choose what buyers can see</h2>
              <p>
                Your email is kept for Kerb messages and account checks. Choose
                whether your public listing shows your name or phone number.
              </p>
            </div>

            <div className="privacyOptions">
              <label className="privacyOption">
                <input
                  type="checkbox"
                  checked={showSellerName}
                  onChange={(event) => setShowSellerName(event.target.checked)}
                />
                <span>
                  <strong>Show my name on the listing</strong>
                  <em>Turn this off to show only your seller type, like Private seller.</em>
                </span>
              </label>

              <label className="privacyOption">
                <input
                  type="checkbox"
                  checked={showSellerPhone}
                  onChange={(event) => setShowSellerPhone(event.target.checked)}
                />
                <span>
                  <strong>Show my phone number on the listing</strong>
                  <em>If this is off, buyers can still message you through Kerb.</em>
                </span>
              </label>
            </div>
          </section>

          <section className="boostPreviewSection">
            <div>
              <span className="boostKicker">Optional listing boost</span>
              <h2>Choose visibility before submitting</h2>
              <p>
                Boost your listing to give it higher placement in Kerb’s
                priority listing positions across Browse Cars and Featured Cars.
                Boosting increases visibility but does not guarantee enquiries
                or a sale.
              </p>

              <ul className="boostBenefits">
                <li>Listing goes live immediately</li>
                <li>Paid boosts start after Stripe confirms payment</li>
                <li>If checkout is cancelled, the listing stays live</li>
              </ul>
            </div>

            <div className="boostChoiceGrid">
              {boostPlanOptions.map((plan) => (
                <label
                  className={
                    selectedBoostPlan === plan.value
                      ? "boostChoice active"
                      : "boostChoice"
                  }
                  key={plan.value}
                >
                  <input
                    type="radio"
                    name="boost_plan"
                    value={plan.value}
                    checked={selectedBoostPlan === plan.value}
                    onChange={() => setSelectedBoostPlan(plan.value)}
                  />
                  <span>
                    <strong>{plan.label}</strong>
                    <em>{plan.description}</em>
                  </span>
                  <b>{plan.price}</b>
                </label>
              ))}
            </div>
          </section>

          <section className="termsSection">
            <label className="termsOption">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                required
              />
              <span>
                <strong>I agree to Kerb’s Terms and Conditions</strong>
                <em>
                  I understand Kerb is a marketplace, not a direct car seller,
                  and I am responsible for making sure my listing is accurate,
                  honest and allowed under Kerb’s rules.
                </em>
                <a href="/terms" target="_blank" rel="noreferrer">
                  Read Terms and Conditions
                </a>
              </span>
            </label>
          </section>

          {errorMessage && <div className="errorBox">{errorMessage}</div>}

          <button className="primaryBtn" type="submit" disabled={isSubmitting || !acceptedTerms}>
            {isSubmitting
              ? selectedBoostPlan === "none"
                ? "Submitting listing..."
                : "Creating listing..."
              : selectedBoostPlan === "none"
                ? "Submit listing"
                : "Submit listing and continue to boost"}
          </button>
        </form>
      </section>

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
    height: 58px;
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
  }

  .navLink,
  .accountButton,
  .logoutButton {
    font-size: 14px;
    font-weight: 900;
    text-decoration: none;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
  }

  .navLink {
    color: #172033;
  }

  .accountButton {
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #eef3ff;
    color: #0048ff;
    padding: 0 16px;
    border-radius: 13px;
  }

  .logoutButton {
    color: #c01818;
    padding: 0;
  }

  .hero {
    display: grid;
    grid-template-columns: 1.3fr 0.7fr;
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
    font-size: 56px;
    line-height: 0.98;
    margin: 0 0 18px;
    letter-spacing: -2.6px;
  }

  p {
    color: #59657a;
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
  }

  .heroCard {
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 22px;
    padding: 24px;
  }

  .heroCard h3 {
    margin: 0 0 14px;
    font-size: 22px;
    letter-spacing: -0.5px;
  }

  .heroCard ul {
    margin: 0;
    padding-left: 20px;
    color: #4d596f;
    line-height: 1.9;
    font-weight: 700;
  }

  .formSection {
    margin-top: 24px;
  }

  .formCard {
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 26px;
    padding: 32px;
    box-shadow: 0 12px 30px rgba(10, 20, 40, 0.05);
  }

  .formHeader {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 18px;
  }

  .formCard h2 {
    margin: 0 0 8px;
    font-size: 24px;
    letter-spacing: -0.7px;
  }

  .formCard p {
    color: #657189;
    font-size: 14px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
    margin-bottom: 24px;
  }

  label {
    display: grid;
    gap: 8px;
    font-weight: 800;
    font-size: 14px;
    color: #172033;
  }

  .optionalText {
    color: #7a8499;
    font-size: 12px;
    font-weight: 850;
  }

  input,
  select,
  textarea {
    width: 100%;
    border: 1px solid #dfe6f1;
    border-radius: 14px;
    padding: 15px 16px;
    font-size: 15px;
    outline: none;
    background: #fbfcff;
    font-family: inherit;
  }

  input[readonly] {
    background: #f1f4fa;
    color: #5d6778;
    cursor: not-allowed;
  }

  .manualInput {
    margin-top: 8px;
  }

  textarea {
    min-height: 130px;
    resize: vertical;
    margin-bottom: 24px;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: #0048ff;
    box-shadow: 0 0 0 4px rgba(0, 72, 255, 0.08);
  }

  .infoBox {
    margin: -4px 0 24px;
    background: #f8fbff;
    border: 1px solid #dce8ff;
    border-radius: 18px;
    padding: 16px;
  }

  .infoBox strong {
    display: block;
    color: #0048ff;
    font-size: 14px;
    font-weight: 950;
    margin-bottom: 4px;
  }

  .infoBox p {
    color: #657189;
    font-size: 13px;
    line-height: 1.5;
  }

  .valuationBox {
    margin: -4px 0 24px;
    background: linear-gradient(90deg, #edf4ff, #ffffff);
    border: 1px solid #dce8ff;
    border-radius: 20px;
    padding: 20px;
    display: grid;
    gap: 8px;
  }

  .valuationBox span {
    display: block;
    color: #657189;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 4px;
  }

  .valuationBox strong {
    display: block;
    color: #0048ff;
    font-size: 30px;
    letter-spacing: -1px;
  }

  .valuationBox p {
    font-size: 13px;
    color: #657189;
  }

  .featuresSection {
    margin: 0 0 24px;
    border: 1px solid #e5eaf4;
    border-radius: 22px;
    padding: 22px;
    background: #fbfcff;
  }

  .featuresSection h2 {
    margin-bottom: 8px;
  }

  .featureChecklist {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 18px;
  }

  .featureOption {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 46px;
    border: 1px solid #dfe6f1;
    border-radius: 14px;
    padding: 10px 12px;
    background: white;
    color: #172033;
    font-size: 13px;
    font-weight: 850;
    cursor: pointer;
  }

  .featureOption input {
    width: 18px;
    height: 18px;
    margin: 0;
    accent-color: #0048ff;
  }

  .photoSection {
    border-top: 1px solid #edf1f7;
    border-bottom: 1px solid #edf1f7;
    padding: 26px 0;
    margin-bottom: 26px;
  }

  .uploadBox {
    margin-top: 18px;
    border: 2px dashed #cfdaf0;
    border-radius: 22px;
    padding: 32px;
    background: #f8fbff;
    text-align: center;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .uploadBox:hover {
    border-color: #0048ff;
    background: #f3f7ff;
  }

  .uploadBox input {
    display: none;
  }

  .uploadBox span {
    font-size: 34px;
  }

  .uploadBox strong {
    display: block;
    margin-top: 8px;
    font-size: 18px;
  }

  .uploadBox small {
    color: #657189;
    font-weight: 700;
  }

  .photoGrid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    margin-top: 18px;
  }

  .photoPreview {
    position: relative;
    height: 110px;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e5eaf4;
    background: #f1f4fa;
  }

  .photoPreview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .removePhotoButton {
    position: absolute;
    right: 8px;
    top: 8px;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
    background: rgba(7, 17, 38, 0.78);
    color: white;
    font-size: 22px;
    line-height: 1;
    display: grid;
    place-items: center;
    cursor: pointer;
    opacity: 0;
    transform: scale(0.92);
    transition: opacity 0.18s ease, transform 0.18s ease, background 0.18s ease;
  }

  .photoPreview:hover .removePhotoButton,
  .removePhotoButton:focus-visible {
    opacity: 1;
    transform: scale(1);
  }

  .removePhotoButton:hover {
    background: #d7193f;
  }

  .privacySection {
    margin: -6px 0 24px;
    background: linear-gradient(135deg, #f8fbff, #ffffff);
    border: 1px solid #dce8ff;
    border-radius: 24px;
    padding: 22px;
    display: grid;
    gap: 16px;
  }

  .privacyKicker {
    display: inline-flex;
    width: fit-content;
    background: #eaf1ff;
    color: #0048ff;
    border: 1px solid #d7e4ff;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 950;
    margin-bottom: 10px;
  }

  .privacySection h2 {
    margin: 0 0 8px;
    font-size: 24px;
    letter-spacing: -0.7px;
  }

  .privacySection p {
    margin: 0;
    color: #5f6a82;
    font-weight: 760;
    line-height: 1.58;
  }

  .privacyOptions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .privacyOption {
    background: white;
    border: 1px solid #dfe7f6;
    border-radius: 18px;
    padding: 15px;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
    gap: 12px;
    cursor: pointer;
  }

  .privacyOption input {
    width: 20px;
    height: 20px;
    margin: 2px 0 0;
    accent-color: #0048ff;
  }

  .privacyOption span {
    display: grid;
    gap: 4px;
  }

  .privacyOption strong {
    font-size: 14px;
    font-weight: 950;
    color: #172033;
  }

  .privacyOption em {
    color: #69758d;
    font-size: 12px;
    font-style: normal;
    font-weight: 760;
    line-height: 1.4;
  }

  .boostPreviewSection {
    margin: 0 0 24px;
    background: linear-gradient(135deg, #f7faff, #ffffff);
    border: 1px solid #dce8ff;
    border-radius: 24px;
    padding: 22px;
    display: grid;
    gap: 18px;
  }

  .boostKicker {
    display: inline-flex;
    width: fit-content;
    background: #eaf1ff;
    color: #0048ff;
    border: 1px solid #d7e4ff;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 950;
    margin-bottom: 10px;
  }

  .boostPreviewSection h2 {
    margin: 0 0 8px;
    font-size: 24px;
    letter-spacing: -0.7px;
  }

  .boostPreviewSection p {
    margin: 0;
    color: #5f6a82;
    font-weight: 760;
    line-height: 1.58;
  }

  .boostBenefits {
    margin: 14px 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .boostBenefits li {
    background: #eef4ff;
    border: 1px solid #dbe7ff;
    color: #172033;
    border-radius: 999px;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 900;
  }

  .boostChoiceGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .boostChoice {
    background: white;
    border: 1px solid #dfe7f6;
    border-radius: 18px;
    padding: 15px;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  }

  .boostChoice:hover {
    border-color: #b9ccff;
    box-shadow: 0 16px 34px rgba(18, 45, 105, 0.08);
    transform: translateY(-1px);
  }

  .boostChoice.active {
    border-color: #0b4bff;
    box-shadow: 0 18px 38px rgba(11, 75, 255, 0.12);
  }

  .boostChoice input {
    width: 18px;
    height: 18px;
    accent-color: #0b4bff;
  }

  .boostChoice span {
    display: grid;
    min-width: 0;
    gap: 3px;
  }

  .boostChoice strong {
    font-size: 13px;
    font-weight: 950;
    color: #172033;
  }

  .boostChoice em {
    color: #69758d;
    font-size: 12px;
    font-style: normal;
    font-weight: 760;
    line-height: 1.35;
  }

  .boostChoice b {
    color: #0048ff;
    font-size: 16px;
    font-weight: 950;
    white-space: nowrap;
  }

  .termsSection {
    margin: 0 0 24px;
    background: #fbfcff;
    border: 1px solid #dfe7f6;
    border-radius: 20px;
    padding: 18px;
  }

  .termsOption {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    cursor: pointer;
  }

  .termsOption input {
    width: 20px;
    height: 20px;
    margin-top: 2px;
    accent-color: #0048ff;
    flex: 0 0 auto;
  }

  .termsOption span {
    display: grid;
    gap: 5px;
  }

  .termsOption strong {
    color: #172033;
    font-size: 14px;
    font-weight: 950;
  }

  .termsOption em {
    color: #657189;
    font-size: 13px;
    font-style: normal;
    font-weight: 760;
    line-height: 1.45;
  }

  .termsOption a {
    color: #0048ff;
    width: fit-content;
    font-size: 13px;
    font-weight: 950;
    text-decoration: none;
  }

  .termsOption a:hover {
    text-decoration: underline;
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

  .warningBox {
    background: #fff7ed;
    color: #9a3412;
    border: 1px solid #fed7aa;
    border-radius: 14px;
    padding: 14px 16px;
    font-weight: 850;
    line-height: 1.5;
    margin: 18px 0;
  }

  .primaryBtn,
  .secondaryBtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 14px;
    padding: 15px 26px;
    font-weight: 900;
    font-size: 15px;
    text-decoration: none;
    cursor: pointer;
  }

  .primaryBtn {
    background: #0048ff;
    color: white;
    box-shadow: 0 10px 25px rgba(0, 72, 255, 0.22);
  }

  .secondaryBtn {
    background: #eef3ff;
    color: #0048ff;
  }

  .primaryBtn:disabled,
  .secondaryBtn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .loadingBox,
  .successBox {
    max-width: 620px;
    margin: 120px auto 0;
    text-align: center;
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 28px;
    padding: 44px;
    box-shadow: 0 16px 50px rgba(20, 35, 70, 0.08);
  }

  .successIcon {
    width: 76px;
    height: 76px;
    margin: 28px auto 18px;
    border-radius: 24px;
    background: #edf3ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
  }

  .successBox h1 {
    font-size: 42px;
  }

  .successBox p {
    margin-bottom: 24px;
  }

  .successActions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .listingSummary {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 16px;
    padding: 16px;
    margin: 20px 0;
    display: grid;
    gap: 5px;
  }

  .listingSummary strong {
    font-size: 18px;
  }

  .listingSummary span {
    color: #657189;
    font-weight: 700;
  }

  @media (max-width: 1100px) {
    .featureChecklist {
      grid-template-columns: repeat(2, 1fr);
    }

    .photoGrid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 800px) {
    .page {
      padding: 18px;
    }

    .navbar {
      height: auto;
      align-items: center;
    }

    .navActions {
      display: none;
    }

    .hero {
      grid-template-columns: 1fr;
      padding: 28px;
    }

    h1 {
      font-size: 42px;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .featureChecklist {
      grid-template-columns: 1fr;
    }

    .formCard {
      padding: 24px;
    }

    .photoGrid {
      grid-template-columns: repeat(2, 1fr);
    }

    .boostChoiceGrid,
    .boostBenefits,
    .privacyOptions {
      grid-template-columns: 1fr;
    }

    .removePhotoButton {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

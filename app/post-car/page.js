"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteMenu from "../components/SiteMenu";
import {
  bodyTypeOptions,
  conditionOptions,
  getVehicleModelDetailOptions,
  getVehicleModelDetailYears,
  getVehicleSpecOptions,
  isVehicleModelDetailYearCompatible,
  vehicleMakes,
} from "../lib/vehicle-data";

import {
  calculateKerbMarketGuide,
  getKerbPricePosition,
} from "../lib/kerb-valuation";

const MAX_LISTING_PHOTOS = 30;

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
  const [modelSpec, setModelSpec] = useState("");
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

    window.location.replace("/login?next=/post-car");
  }, []);

  const availableModels = make ? vehicleMakes[make] || [] : [];
  const selectedModel = model === "Other" ? customModel.trim() : model;
  const availableModelDetails =
    make && selectedModel && model !== "Other"
      ? getVehicleModelDetailOptions({ make, model: selectedModel, year })
      : [];
  const availableModelSpecs =
    make && selectedModel && model !== "Other"
      ? getVehicleSpecOptions({ make, model: selectedModel })
      : [];
  const selectedVariantYears = modelDetail
    ? getVehicleModelDetailYears({ make, model: selectedModel, detail: modelDetail })
    : "";
  const variantYearError =
    modelDetail &&
    year &&
    !isVehicleModelDetailYearCompatible({
      make,
      model: selectedModel,
      detail: modelDetail,
      year,
    })
      ? `${modelDetail} does not match ${year}${
          selectedVariantYears ? ` (${selectedVariantYears})` : ""
        }. Choose a matching year or variant.`
      : "";

  const finalModel =
    model === "Other" ? customModel.trim() : selectedModel || customModel.trim();

  const valuation = useMemo(() => {
    if (!make || !finalModel || !year || !mileage || variantYearError) return null;

    return calculateKerbMarketGuide({
      make,
      model: finalModel,
      modelDetail,
      year,
      mileage,
      fuelType: fuel,
      gearbox,
      bodyType,
      condition,
      variant: modelSpec,
    });
  }, [
    make,
    finalModel,
    modelDetail,
    year,
    mileage,
    fuel,
    gearbox,
    bodyType,
    condition,
    modelSpec,
    variantYearError,
  ]);

  const pricePosition = useMemo(
    () =>
      getKerbPricePosition({
        askingPrice,
        valuation,
      }),
    [askingPrice, valuation]
  );

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

    if (variantYearError) {
      setErrorMessage(variantYearError);
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem("kerbSessionToken");

    if (!token) {
      window.location.href = "/login?next=/post-car";
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    photos.forEach((photo) => {
      formData.append("photos", photo.file);
    });

    formData.set("model", finalModel);
    formData.set("model_detail", modelDetail);
    formData.set("variant", modelSpec);
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
        <div className="loadingBox">Opening your listing form...</div>
        <style>{styles}</style>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="page">
        <div className="successBox">
          <a href="/" className="logo">Kerb</a>
          <h1>Your listing is live</h1>
          <p>Buyers can now find it on Kerb.</p>
          {submittedListing?.id && (
            <a href={`/listing/${submittedListing.id}`} className="primaryButton">View listing</a>
          )}
          <a href="/account" className="secondaryLink">Go to account</a>
          {boostCheckoutError && <div className="errorBox">{boostCheckoutError}</div>}
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
          <a href="/browse">Browse cars</a>
          <a href="/account">My account</a>
          <button type="button" onClick={handleLogout}>Log out</button>
        </div>
        <SiteMenu currentUser={currentUser} onLogout={handleLogout} />
      </header>

      <section className="hero">
        <div>
          <p>Sell on Kerb</p>
          <h1>Post your car</h1>
          <span>Complete the details below to create your listing.</span>
        </div>
        <div className="heroSteps">
          <strong>1. Details</strong>
          <strong>2. Photos</strong>
          <strong>3. Enquiries</strong>
        </div>
      </section>

      <form className="formShell" onSubmit={handleSubmit}>
        <section className="formSection">
          <div className="sectionIntro">
            <span>Vehicle details</span>
            <h2>Tell buyers what you are selling</h2>
            <p>Choose the closest details. You can use “Other” if your model is not listed.</p>
          </div>

          <div className="grid two">
            <label>
              Make
              <select name="make" value={make} onChange={(event) => { setMake(event.target.value); setModel(""); setModelDetail(""); setModelSpec(""); }} required>
                <option value="">Select make</option>
                {Object.keys(vehicleMakes).map((makeOption) => <option key={makeOption}>{makeOption}</option>)}
              </select>
            </label>

            <label>
              Model
              <select name="model_select" value={model} onChange={(event) => { setModel(event.target.value); setModelDetail(""); setModelSpec(""); }} required>
                <option value="">Select model</option>
                {availableModels.map((modelOption) => <option key={modelOption}>{modelOption}</option>)}
                <option>Other</option>
              </select>
            </label>

            {model === "Other" && (
              <label>
                Custom model
                <input value={customModel} onChange={(event) => setCustomModel(event.target.value)} placeholder="e.g. XE" required />
              </label>
            )}

            <label>
              Year
              <input name="year" value={year} onChange={(event) => setYear(event.target.value.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="2019" required />
            </label>

            <label>
              Variant / type
              <select name="model_detail_select" value={modelDetail} onChange={(event) => setModelDetail(event.target.value)}>
                <option value="">Select variant</option>
                {availableModelDetails.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label>
              Spec / trim
              <select name="variant_select" value={modelSpec} onChange={(event) => setModelSpec(event.target.value)}>
                <option value="">Select spec</option>
                {availableModelSpecs.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label>
              Mileage
              <input name="mileage" value={mileage} onChange={(event) => setMileage(event.target.value.replace(/[^0-9]/g, ""))} placeholder="45000" required />
            </label>

            <label>
              Asking price
              <input name="price" value={askingPrice} onChange={(event) => setAskingPrice(event.target.value.replace(/[^0-9]/g, ""))} placeholder="12000" required />
            </label>

            <label>
              Fuel
              <select name="fuel" value={fuel} onChange={(event) => setFuel(event.target.value)} required>
                <option value="">Select fuel</option>
                <option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option>
              </select>
            </label>

            <label>
              Gearbox
              <select name="gearbox" value={gearbox} onChange={(event) => setGearbox(event.target.value)} required>
                <option value="">Select gearbox</option>
                <option>Manual</option><option>Automatic</option><option>Semi-automatic</option>
              </select>
            </label>

            <label>
              Body type
              <select name="body_type_select" value={bodyType} onChange={(event) => setBodyType(event.target.value)} required>
                <option value="">Select body</option>
                {bodyTypeOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label>
              Condition
              <select name="condition_select" value={condition} onChange={(event) => setCondition(event.target.value)} required>
                <option value="">Select condition</option>
                {conditionOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </div>

          {variantYearError && <div className="errorBox">{variantYearError}</div>}
          {valuation && (
            <div className={`valuationBox ${pricePosition?.status || ""}`}>
              <strong>Kerb market guide: £{valuation.low.toLocaleString()} – £{valuation.high.toLocaleString()}</strong>
              {pricePosition?.label && <span>{pricePosition.label}</span>}
            </div>
          )}
        </section>

        <section className="formSection">
          <div className="sectionIntro">
            <span>Photos and description</span>
            <h2>Make the advert feel trustworthy</h2>
            <p>Add clear photos and describe the car honestly.</p>
          </div>

          <label>
            Description
            <textarea name="description" rows={7} placeholder="Tell buyers about the car, history, condition and any issues." required />
          </label>

          <label>
            Location
            <input name="location" placeholder="Leicester" required />
          </label>

          <label className="photoDrop">
            Upload photos
            <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
            <span>Add up to {MAX_LISTING_PHOTOS} photos.</span>
          </label>

          {photos.length > 0 && (
            <div className="photoGrid">
              {photos.map((photo) => (
                <div key={photo.id}>
                  <img src={photo.url} alt={photo.name} />
                  <button type="button" onClick={() => removePhoto(photo.id)}>Remove</button>
                </div>
              ))}
            </div>
          )}

          <div className="featuresGrid">
            {carFeatureOptions.map((feature) => (
              <label key={feature} className="checkPill">
                <input type="checkbox" name="features" value={feature} />
                {feature}
              </label>
            ))}
          </div>
        </section>

        <section className="formSection">
          <div className="sectionIntro">
            <span>Seller options</span>
            <h2>Choose how buyers contact you</h2>
            <p>Kerb is a marketplace. You control the listing and buyer conversations.</p>
          </div>

          <div className="grid two">
            <label>
              Category
              <select value={listingCategory} onChange={(event) => setListingCategory(event.target.value)}>
                {listingCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>

            <label>
              Finance availability
              <select value={financeAvailable} onChange={(event) => setFinanceAvailable(event.target.value)}>
                <option value="false">No finance option shown</option>
                <option value="true">Seller says finance may be available</option>
              </select>
            </label>
          </div>

          <label className="checkRow">
            <input type="checkbox" checked={showSellerName} onChange={(event) => setShowSellerName(event.target.checked)} />
            Show my name on this listing
          </label>

          <label className="checkRow">
            <input type="checkbox" checked={showSellerPhone} onChange={(event) => setShowSellerPhone(event.target.checked)} />
            Show my phone number on this listing
          </label>

          <div className="boostGrid">
            {boostPlanOptions.map((plan) => (
              <label key={plan.value} className={selectedBoostPlan === plan.value ? "boostPlan active" : "boostPlan"}>
                <input type="radio" name="boost_plan" value={plan.value} checked={selectedBoostPlan === plan.value} onChange={(event) => setSelectedBoostPlan(event.target.value)} />
                <strong>{plan.label}</strong>
                <span>{plan.price}</span>
                <em>{plan.description}</em>
              </label>
            ))}
          </div>

          <label className="termsBox">
            <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required />
            <span>I confirm the listing is accurate and agree to Kerb’s marketplace terms.</span>
          </label>

          {errorMessage && <div className="errorBox">{errorMessage}</div>}

          <button type="submit" className="primaryButton" disabled={isSubmitting}>
            {isSubmitting ? "Posting your car..." : "Post car"}
          </button>
        </section>
      </form>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }
  .page { min-height: 100vh; background: #f7f9fd; color: #071126; font-family: Inter, Arial, sans-serif; padding: 22px 40px 50px; }
  .navbar { display: flex; justify-content: space-between; align-items: center; gap: 18px; margin-bottom: 24px; }
  .logo { color: #0048ff; font-size: 38px; font-weight: 950; text-decoration: none; letter-spacing: -2px; }
  .navActions { display: flex; gap: 14px; align-items: center; font-weight: 900; }
  .navActions a { color: #071126; text-decoration: none; }
  .navActions button { border: none; background: #eef4ff; color: #0048ff; border-radius: 14px; padding: 12px 14px; font-weight: 950; cursor: pointer; }
  .hero, .formSection, .successBox { border: 1px solid #dfe8f7; border-radius: 30px; background: white; box-shadow: 0 18px 46px rgba(14,30,70,.06); }
  .hero { display: flex; justify-content: space-between; gap: 20px; padding: 34px; background: linear-gradient(135deg, #fff, #eef5ff); margin-bottom: 20px; }
  .hero p, .sectionIntro span { color: #0048ff; font-weight: 950; margin: 0 0 8px; }
  .hero h1 { margin: 0; font-size: clamp(42px, 7vw, 76px); letter-spacing: -3px; line-height: .92; }
  .hero span, .sectionIntro p { color: #53617a; font-weight: 750; }
  .heroSteps { display: grid; gap: 10px; min-width: 220px; }
  .heroSteps strong { background: #fff; border: 1px solid #dbe7fb; border-radius: 16px; padding: 14px; }
  .formShell { display: grid; gap: 20px; }
  .formSection { padding: 28px; }
  .sectionIntro h2 { margin: 0 0 8px; font-size: 32px; letter-spacing: -1px; }
  .grid.two { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }
  label { display: grid; gap: 8px; font-weight: 900; margin-top: 14px; }
  input, select, textarea { width: 100%; border: 1px solid #dce5f3; border-radius: 14px; padding: 14px; font: inherit; font-weight: 750; background: #fbfdff; }
  textarea { resize: vertical; }
  .valuationBox, .errorBox { margin-top: 16px; border-radius: 16px; padding: 14px 16px; font-weight: 850; }
  .valuationBox { background: #eef4ff; border: 1px solid #d6e4ff; color: #0048ff; display: grid; gap: 6px; }
  .errorBox { background: #fff1f1; border: 1px solid #ffd1d1; color: #b42318; }
  .photoDrop { border: 1px dashed #b8c8e6; border-radius: 18px; padding: 20px; background: #f8fbff; }
  .photoDrop input { padding: 0; border: none; background: transparent; }
  .photoDrop span { color: #53617a; font-size: 13px; }
  .photoGrid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
  .photoGrid div { position: relative; overflow: hidden; border-radius: 16px; border: 1px solid #dfe8f7; background: #eef4ff; }
  .photoGrid img { width: 100%; height: 120px; object-fit: cover; display: block; }
  .photoGrid button { width: 100%; border: none; background: #071126; color: white; padding: 9px; font-weight: 900; cursor: pointer; }
  .featuresGrid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
  .checkPill, .checkRow, .termsBox { display: flex; align-items: center; gap: 10px; margin: 10px 0 0; }
  .checkPill { border: 1px solid #dfe8f7; border-radius: 999px; background: #fff; padding: 9px 12px; }
  .checkPill input, .checkRow input, .termsBox input { width: auto; }
  .boostGrid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; margin-top: 18px; }
  .boostPlan { border: 1px solid #dfe8f7; border-radius: 18px; padding: 16px; background: #fff; cursor: pointer; }
  .boostPlan.active { border-color: #0048ff; background: #eef4ff; }
  .boostPlan input { width: auto; }
  .boostPlan strong, .boostPlan span, .boostPlan em { display: block; margin-top: 6px; }
  .boostPlan span { color: #0048ff; font-weight: 950; }
  .boostPlan em { color: #53617a; font-size: 13px; font-style: normal; line-height: 1.45; }
  .termsBox { border: 1px solid #dfe8f7; border-radius: 16px; background: #f8fbff; padding: 15px; }
  .primaryButton { margin-top: 18px; border: none; border-radius: 16px; background: #0048ff; color: white; padding: 16px 22px; font-weight: 950; cursor: pointer; box-shadow: 0 14px 30px rgba(0,72,255,.2); }
  .primaryButton:disabled { opacity: .65; cursor: not-allowed; }
  .loadingBox { width: min(520px, 100%); margin: 18vh auto 0; border: 1px solid #dfe8f7; border-radius: 24px; background: white; padding: 26px; text-align: center; color: #53617a; font-weight: 900; }
  .successBox { width: min(720px, 100%); margin: 14vh auto 0; padding: 36px; display: grid; gap: 14px; }
  .successBox h1 { margin: 0; font-size: 48px; letter-spacing: -2px; }
  .secondaryLink { color: #0048ff; font-weight: 950; }
  @media (max-width: 860px) { .page { padding: 16px; } .navActions { display: none; } .hero { flex-direction: column; padding: 24px; } .grid.two, .boostGrid, .photoGrid { grid-template-columns: 1fr; } .formSection { padding: 22px; } }
`;

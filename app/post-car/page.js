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
          <div className="successIcon">✓</div>
          <h1>Your listing is live</h1>
          <p>Your car listing has been saved and is now live on Kerb Car.</p>

          {boostCheckoutError && <div className="warningBox">{boostCheckoutError}</div>}

          {submittedListing && (
            <div className="listingSummary">
              <strong>
                {[submittedListing.year, submittedListing.make, submittedListing.model, submittedListing.model_detail, submittedListing.variant]
                  .filter(Boolean)
                  .join(" ")}
              </strong>
              <span>{submittedListing.location}</span>
            </div>
          )}

          <div className="successActions">
            <a href="/account" className="secondaryBtn">My account</a>
            {submittedListing?.id && (
              <a href={`/listing/${submittedListing.id}`} className="secondaryBtn">View live listing</a>
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
          <button className="logoutButton" type="button" onClick={handleLogout}>Log out</button>
        </div>

        <SiteMenu currentUser={currentUser} onLogout={handleLogout} />
      </header>

      <section className="hero">
        <div>
          <div className="pill">Seller early access</div>
          <h1>Post your car on Kerb</h1>
          <p>
            Create a clean listing with vehicle details, clear photos, seller information and a Kerb Market Guide estimate.
          </p>
        </div>

        <div className="heroCard">
          <h3>Listing checklist</h3>
          <ul>
            <li>Add make, model, spec and body style</li>
            <li>Enter mileage, year, condition and price</li>
            <li>Upload clear car photos</li>
            <li>Choose contact and boost options</li>
          </ul>
        </div>
      </section>

      <section className="formSection">
        <form className="formCard" onSubmit={handleSubmit}>
          <div className="formHeader">
            <div>
              <span>Step 1</span>
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
                  setModelSpec("");
                  setCustomModel("");
                }}
              >
                <option value="">Select make</option>
                {Object.keys(vehicleMakes).map((makeName) => (
                  <option key={makeName} value={makeName}>{makeName}</option>
                ))}
              </select>
            </label>

            <label>
              Model line
              {make === "Other" || availableModels.length === 0 ? (
                <input name="model_manual" placeholder="Type the model" value={customModel} onChange={(e) => setCustomModel(e.target.value)} required />
              ) : (
                <>
                  <select
                    value={model}
                    onChange={(e) => {
                      setModel(e.target.value);
                      setModelDetail("");
                      setModelSpec("");
                    }}
                    required={!customModel}
                  >
                    <option value="">Select model</option>
                    {availableModels.map((modelName) => (
                      <option key={modelName} value={modelName}>{modelName}</option>
                    ))}
                    <option value="Other">Other / type manually</option>
                  </select>

                  {model === "Other" && (
                    <input className="manualInput" name="model_manual" placeholder="Type the model" value={customModel} onChange={(e) => setCustomModel(e.target.value)} required />
                  )}
                </>
              )}
              <input type="hidden" name="model" value={finalModel} />
            </label>

            {(availableModelDetails.length > 0 || modelDetail) && (
              <label>
                Type / engine
                <select value={modelDetail} onChange={(e) => setModelDetail(e.target.value)}>
                  <option value="">I am not sure / standard type</option>
                  {modelDetail && !availableModelDetails.includes(modelDetail) && <option value={modelDetail}>{modelDetail}</option>}
                  {availableModelDetails.map((detail) => {
                    const years = getVehicleModelDetailYears({ make, model: selectedModel, detail });
                    return <option key={detail} value={detail}>{years ? `${detail} (${years})` : detail}</option>;
                  })}
                </select>
                {variantYearError && <small className="fieldNotice errorNotice">{variantYearError}</small>}
              </label>
            )}

            {(availableModelSpecs.length > 0 || modelSpec) && (
              <label>
                Spec / trim
                <select name="variant" value={modelSpec} onChange={(e) => setModelSpec(e.target.value)}>
                  <option value="">I am not sure / standard spec</option>
                  {modelSpec && !availableModelSpecs.includes(modelSpec) && <option value={modelSpec}>{modelSpec}</option>}
                  {availableModelSpecs.map((spec) => <option key={spec} value={spec}>{spec}</option>)}
                </select>
              </label>
            )}

            <label>
              Year
              <input name="year" placeholder="2020" value={year} onChange={(e) => setYear(e.target.value)} required />
            </label>

            <label>
              Mileage
              <input name="mileage" placeholder="45,000" value={mileage} onChange={(e) => setMileage(e.target.value)} required />
            </label>

            <label>
              Body type
              <select name="body_type" value={bodyType} onChange={(e) => setBodyType(e.target.value)} required>
                <option value="">Select body type</option>
                {bodyTypeOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label>
              Condition
              <select name="condition" value={condition} onChange={(e) => setCondition(e.target.value)} required>
                <option value="">Select condition</option>
                {conditionOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label>
              Fuel type
              <select name="fuel_type" value={fuel} onChange={(e) => setFuel(e.target.value)} required>
                <option value="">Select fuel type</option>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Hybrid</option>
                <option>Electric</option>
              </select>
            </label>

            <label>
              Gearbox
              <select name="gearbox" value={gearbox} onChange={(e) => setGearbox(e.target.value)} required>
                <option value="">Select gearbox</option>
                <option>Manual</option>
                <option>Automatic</option>
                <option>Semi-automatic</option>
              </select>
            </label>

            <label>
              Asking price
              <input name="asking_price" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} placeholder="£12,995" required />
            </label>

            <label>
              Location
              <input name="location" placeholder="Leicester" required />
            </label>

            <label>
              Finance available from seller/dealer?
              <select name="finance_available" value={financeAvailable} onChange={(e) => setFinanceAvailable(e.target.value)} required>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </label>

            <label>
              Best fit
              <select name="listing_category" value={listingCategory} onChange={(e) => setListingCategory(e.target.value)}>
                {listingCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="infoBox">
            <strong>Finance note</strong>
            <p>
              This only tells buyers whether the seller or dealer may offer finance. Kerb Car does not provide finance or sell cars directly.
            </p>
          </div>

          {valuation && (
            <div className="valuationBox">
              <div>
                <span>Kerb Market Guide</span>
                <strong>£{valuation.low.toLocaleString()} - £{valuation.high.toLocaleString()}</strong>
                {valuation.mid && <small>Mid guide: £{valuation.mid.toLocaleString()}</small>}
              </div>
              <p>We only show an estimate. This is a guide, not a guaranteed sale price.</p>
              {pricePosition && (
                <div className={`valuationStatus ${pricePosition.tone}`}>
                  <b>{pricePosition.label}</b>
                  <span>{pricePosition.text}</span>
                </div>
              )}
            </div>
          )}

          <input type="hidden" name="valuation_low" value={valuation?.low || ""} />
          <input type="hidden" name="valuation_high" value={valuation?.high || ""} />

          <section className="featuresSection">
            <div>
              <span>Step 2</span>
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
            <textarea name="description" placeholder="Tell buyers about condition, service history, features, MOT, ownership, modifications or damage." />
          </label>

          <div className="photoSection">
            <div>
              <span>Step 3</span>
              <h2>Photos</h2>
              <p>Add up to {MAX_LISTING_PHOTOS} photos. Clear photos help buyers trust the listing.</p>
            </div>

            <label className="uploadBox">
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
              <span>📸</span>
              <strong>Upload car photos</strong>
              <small>Front, rear, sides, interior, wheels and dashboard</small>
            </label>

            {photos.length > 0 && (
              <div className="photoGrid">
                {photos.map((photo, index) => (
                  <div className="photoPreview" key={photo.id}>
                    <img src={photo.url} alt={photo.name} />
                    <button type="button" className="removePhotoButton" onClick={() => removePhoto(photo.id)} aria-label={`Remove photo ${index + 1}`}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <section className="sellerSection">
            <div>
              <span>Step 4</span>
              <h2>Seller details</h2>
              <p>These details help buyers enquire and help you manage the listing from your account.</p>
            </div>

            <div className="grid">
              <label>
                Full name
                <input name="seller_name" placeholder="Your name" defaultValue={currentUser?.name || currentUser?.full_name || ""} required />
              </label>

              <label>
                Email address
                <input name="seller_email" type="email" placeholder="you@example.com" defaultValue={currentUser?.email || ""} readOnly={Boolean(currentUser?.email)} required />
              </label>

              <label>
                Phone number <span className="optionalText">Optional</span>
                <input name="seller_phone" placeholder="07..." defaultValue={currentUser?.phone || ""} required={showSellerPhone} />
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
          </section>

          <section className="privacySection">
            <div>
              <span className="privacyKicker">Public contact options</span>
              <h2>Choose what buyers can see</h2>
              <p>Your email is kept for Kerb messages and account checks. Choose whether your public listing shows your name or phone number.</p>
            </div>

            <div className="privacyOptions">
              <label className="privacyOption">
                <input type="checkbox" checked={showSellerName} onChange={(event) => setShowSellerName(event.target.checked)} />
                <span>
                  <strong>Show my name on the listing</strong>
                  <em>Turn this off to show only your seller type, like Private seller.</em>
                </span>
              </label>

              <label className="privacyOption">
                <input type="checkbox" checked={showSellerPhone} onChange={(event) => setShowSellerPhone(event.target.checked)} />
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
                Boost your listing to give it higher placement in Kerb’s priority listing positions across Browse Cars and Featured Cars. Boosting increases visibility but does not guarantee enquiries or a sale.
              </p>
              <ul className="boostBenefits">
                <li>Listing goes live immediately</li>
                <li>Paid boosts start after Stripe confirms payment</li>
                <li>If checkout is cancelled, the listing stays live</li>
              </ul>
            </div>

            <div className="boostChoiceGrid">
              {boostPlanOptions.map((plan) => (
                <label className={selectedBoostPlan === plan.value ? "boostChoice active" : "boostChoice"} key={plan.value}>
                  <input type="radio" name="boost_plan" value={plan.value} checked={selectedBoostPlan === plan.value} onChange={() => setSelectedBoostPlan(plan.value)} />
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
              <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required />
              <span>
                <strong>I agree to Kerb’s Terms and Conditions</strong>
                <em>I understand Kerb Car is a marketplace, not a direct car seller, and I am responsible for making sure my listing is accurate, honest and allowed under Kerb’s rules.</em>
                <a href="/terms" target="_blank" rel="noreferrer">Read Terms and Conditions</a>
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
  * { box-sizing: border-box; }
  body { margin: 0; background: #f7f9fd; color: #071126; font-family: Inter, Arial, sans-serif; }
  .page { min-height: 100vh; padding: 24px 36px 50px; background: radial-gradient(circle at top left, rgba(0,72,255,.08), transparent 30%), #f7f9fd; }
  .navbar { height: 58px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; gap: 18px; }
  .logo { font-size: 36px; font-weight: 950; color: #0048ff; letter-spacing: -1.8px; text-decoration: none; }
  .navActions { display: flex; align-items: center; gap: 12px; }
  .navLink, .accountButton, .logoutButton { font-size: 14px; font-weight: 950; text-decoration: none; border: none; background: transparent; cursor: pointer; font-family: inherit; white-space: nowrap; }
  .navLink { color: #172033; }
  .accountButton { height: 42px; display: inline-flex; align-items: center; justify-content: center; background: #eef3ff; color: #0048ff; padding: 0 16px; border-radius: 13px; }
  .logoutButton { color: #c01818; padding: 0; }
  .hero { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 24px; align-items: stretch; background: linear-gradient(90deg, rgba(246,249,255,0.98), rgba(235,242,255,0.92)), radial-gradient(circle at 80% 40%, rgba(0,72,255,0.15), transparent 35%); border: 1px solid #e4eaf5; border-radius: 30px; padding: 42px; box-shadow: 0 16px 50px rgba(20, 35, 70, 0.08); }
  .pill, .formHeader span, .featuresSection > div > span, .photoSection > div > span, .sellerSection > div > span, .privacyKicker, .boostKicker { display: inline-flex; background: #eaf1ff; color: #0048ff; border: 1px solid #d7e4ff; border-radius: 999px; padding: 9px 14px; font-size: 13px; font-weight: 950; margin-bottom: 14px; }
  h1 { font-size: clamp(48px, 7vw, 76px); line-height: 0.94; margin: 0 0 18px; letter-spacing: -3.2px; }
  p { color: #59657a; font-size: 16px; line-height: 1.6; margin: 0; }
  .heroCard { background: white; border: 1px solid #e5eaf4; border-radius: 22px; padding: 24px; box-shadow: 0 16px 36px rgba(14,30,70,.06); }
  .heroCard h3 { margin: 0 0 14px; font-size: 22px; letter-spacing: -0.5px; }
  .heroCard ul { margin: 0; padding-left: 20px; color: #4d596f; line-height: 1.9; font-weight: 800; }
  .formSection { margin-top: 24px; }
  .formCard { background: white; border: 1px solid #e5eaf4; border-radius: 28px; padding: 34px; box-shadow: 0 18px 48px rgba(10, 20, 40, 0.07); }
  .formHeader { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
  .formCard h2 { margin: 0 0 8px; font-size: 28px; letter-spacing: -0.9px; }
  .formCard p { color: #657189; font-size: 14px; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-bottom: 24px; }
  label { display: grid; gap: 8px; font-weight: 850; font-size: 14px; color: #172033; }
  .optionalText { color: #7a8499; font-size: 12px; font-weight: 850; }
  input, select, textarea { width: 100%; border: 1px solid #dfe6f1; border-radius: 15px; padding: 15px 16px; font-size: 15px; outline: none; background: #fbfcff; font-family: inherit; }
  input:focus, select:focus, textarea:focus { border-color: #0048ff; box-shadow: 0 0 0 4px rgba(0,72,255,.08); }
  input[readonly] { background: #f1f4fa; color: #5d6778; cursor: not-allowed; }
  .manualInput { margin-top: 8px; }
  .fieldNotice { color: #657189; font-size: 12px; font-weight: 850; line-height: 1.45; }
  .errorNotice { color: #b42318; }
  textarea { min-height: 130px; resize: vertical; margin-bottom: 24px; }
  .infoBox { background: #f7f9fd; border: 1px solid #e5eaf4; border-radius: 18px; padding: 18px; margin: 0 0 24px; }
  .infoBox strong { display: block; margin-bottom: 6px; color: #071126; }
  .valuationBox { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: center; border-radius: 22px; background: linear-gradient(135deg, #eef4ff, #ffffff); border: 1px solid #d7e4ff; padding: 22px; margin-bottom: 24px; }
  .valuationBox span { color: #0048ff; font-weight: 950; }
  .valuationBox strong { display: block; font-size: 30px; letter-spacing: -1px; margin-top: 6px; }
  .valuationBox small { display: block; color: #657189; margin-top: 4px; }
  .valuationStatus { grid-column: span 2; border-radius: 16px; background: white; border: 1px solid #dfe6f1; padding: 14px; display: grid; gap: 4px; }
  .valuationStatus b { color: #071126; }
  .valuationStatus span { color: #59657a; font-weight: 750; }
  .featuresSection, .photoSection, .sellerSection, .privacySection, .boostPreviewSection, .termsSection { border-top: 1px solid #edf1f8; padding-top: 26px; margin-top: 26px; }
  .featureChecklist { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 18px 0 24px; }
  .featureOption { display: flex; align-items: center; gap: 9px; background: #fbfcff; border: 1px solid #e5eaf4; border-radius: 999px; padding: 10px 12px; cursor: pointer; }
  .featureOption input { width: auto; }
  .featureOption span { font-size: 13px; font-weight: 850; color: #334055; }
  .uploadBox { margin-top: 18px; min-height: 180px; border: 2px dashed #b8c8e8; border-radius: 24px; background: #f8fbff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; cursor: pointer; padding: 26px; }
  .uploadBox input { display: none; }
  .uploadBox > span { font-size: 38px; margin-bottom: 8px; }
  .uploadBox strong { color: #0048ff; font-size: 18px; }
  .uploadBox small { color: #657189; margin-top: 4px; }
  .photoGrid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
  .photoPreview { position: relative; border-radius: 18px; overflow: hidden; background: #eef3ff; aspect-ratio: 1.25 / 1; border: 1px solid #e5eaf4; }
  .photoPreview img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .removePhotoButton { position: absolute; top: 8px; right: 8px; width: 30px; height: 30px; border: none; border-radius: 999px; background: rgba(7,17,38,.85); color: white; font-size: 20px; line-height: 1; cursor: pointer; }
  .privacySection, .boostPreviewSection { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 22px; background: #f8fbff; border: 1px solid #e5eaf4; border-radius: 24px; padding: 24px; }
  .privacySection { margin-top: 4px; }
  .privacyOptions { display: grid; gap: 12px; }
  .privacyOption, .termsOption { display: flex; align-items: flex-start; gap: 12px; background: white; border: 1px solid #e5eaf4; border-radius: 18px; padding: 16px; }
  .privacyOption input, .termsOption input { width: 18px; height: 18px; margin-top: 3px; accent-color: #0048ff; }
  .privacyOption span, .termsOption span { display: grid; gap: 4px; }
  .privacyOption em, .termsOption em { color: #657189; font-size: 13px; font-style: normal; line-height: 1.45; }
  .boostBenefits { margin: 16px 0 0; padding-left: 20px; color: #4d596f; font-weight: 800; line-height: 1.8; }
  .boostChoiceGrid { display: grid; gap: 10px; }
  .boostChoice { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; background: white; border: 1px solid #e5eaf4; border-radius: 18px; padding: 14px; cursor: pointer; }
  .boostChoice.active { border-color: #0048ff; box-shadow: 0 0 0 4px rgba(0,72,255,.08); }
  .boostChoice input { width: 18px; height: 18px; accent-color: #0048ff; }
  .boostChoice span { display: grid; gap: 3px; }
  .boostChoice em { color: #657189; font-size: 13px; font-style: normal; }
  .boostChoice b { color: #0048ff; }
  .termsSection { border-top: none; }
  .termsOption a { color: #0048ff; font-weight: 950; text-decoration: none; width: fit-content; }
  .errorBox, .warningBox { background: #fff1f1; color: #b42318; border: 1px solid #ffd1d1; border-radius: 14px; padding: 14px 16px; font-weight: 850; margin: 16px 0; }
  .primaryBtn, .secondaryBtn { min-height: 52px; border: none; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; padding: 0 22px; font-weight: 950; font-family: inherit; cursor: pointer; }
  .primaryBtn { width: 100%; background: #0048ff; color: white; box-shadow: 0 12px 28px rgba(0,72,255,.22); }
  .primaryBtn:disabled { opacity: .55; cursor: not-allowed; }
  .secondaryBtn { background: #eef3ff; color: #0048ff; }
  .loadingBox, .successBox { width: min(680px, 100%); margin: 12vh auto 0; background: white; border: 1px solid #e5eaf4; border-radius: 28px; padding: 36px; box-shadow: 0 18px 60px rgba(20,35,70,.1); text-align: center; }
  .successIcon { width: 58px; height: 58px; border-radius: 999px; background: #eafaf0; color: #137333; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin: 18px 0; }
  .successBox h1 { font-size: 48px; margin: 0 0 10px; }
  .listingSummary { display: grid; gap: 4px; border: 1px solid #e5eaf4; border-radius: 18px; background: #f8fbff; padding: 16px; margin: 20px 0; }
  .listingSummary span { color: #657189; }
  .successActions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .successActions .primaryBtn, .successActions .secondaryBtn { width: auto; }
  @media (max-width: 900px) {
    .page { padding: 16px; }
    .navActions { display: none; }
    .hero, .privacySection, .boostPreviewSection, .valuationBox { grid-template-columns: 1fr; padding: 26px; }
    .valuationStatus { grid-column: auto; }
    .formCard { padding: 22px; }
    .grid, .featureChecklist, .photoGrid { grid-template-columns: 1fr; }
    h1 { letter-spacing: -2px; }
  }
`;

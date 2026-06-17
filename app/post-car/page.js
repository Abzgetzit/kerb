"use client";

import { useEffect, useMemo, useState } from "react";

const carMakes = {
  Audi: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7", "TT"],
  BMW: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "X1", "X3", "X5", "i3", "i4"],
  Mercedes: ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "CLA"],
  Volkswagen: ["Polo", "Golf", "Passat", "Tiguan", "T-Roc", "Touareg"],
  Ford: ["Fiesta", "Focus", "Kuga", "Puma", "Mondeo", "Transit"],
  Vauxhall: ["Corsa", "Astra", "Insignia", "Mokka", "Grandland"],
  Toyota: ["Yaris", "Corolla", "Auris", "C-HR", "RAV4", "Prius"],
  Nissan: ["Micra", "Juke", "Qashqai", "X-Trail", "Leaf"],
  Hyundai: ["i10", "i20", "i30", "Tucson", "Kona", "Ioniq"],
  Kia: ["Picanto", "Rio", "Ceed", "Sportage", "Niro", "EV6"],
  Peugeot: ["208", "308", "508", "2008", "3008", "5008"],
  Renault: ["Clio", "Megane", "Captur", "Kadjar", "Zoe"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
  Volvo: ["V40", "XC40", "XC60", "XC90", "S60", "V60"],
  "Land Rover": ["Range Rover Evoque", "Discovery Sport", "Range Rover Sport", "Defender"],
  MINI: ["Hatch", "Clubman", "Countryman", "Convertible"],
  Honda: ["Civic", "Jazz", "CR-V", "HR-V"],
  Mazda: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-5"],
  Skoda: ["Fabia", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq"],
  SEAT: ["Ibiza", "Leon", "Ateca", "Arona"],
  Other: [],
};

export default function PostCarPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedListing, setSubmittedListing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel] = useState("");
  const [gearbox, setGearbox] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [condition, setCondition] = useState("");
  const [financeAvailable, setFinanceAvailable] = useState("false");
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("kerbUser");
    const savedEmail = localStorage.getItem("kerbAccountEmail");
    const token = localStorage.getItem("kerbSessionToken");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
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

  const availableModels = make ? carMakes[make] || [] : [];

  const finalModel = model === "Other" ? customModel : model || customModel;

  const valuation = useMemo(() => {
    if (!make || !year || !mileage) return null;

    const carAge = new Date().getFullYear() - Number(year);
    const mileageNumber = Number(String(mileage).replace(/[^0-9]/g, ""));

    if (!Number.isFinite(carAge) || !Number.isFinite(mileageNumber)) return null;

    let base = 12000;

    if (["BMW", "Mercedes", "Audi", "Land Rover", "Tesla", "Volvo"].includes(make)) {
      base = 22000;
    }

    if (["Volkswagen", "Toyota", "Kia", "Hyundai", "Skoda"].includes(make)) {
      base = 15000;
    }

    if (["Ford", "Vauxhall", "Peugeot", "Renault", "Nissan"].includes(make)) {
      base = 11000;
    }

    const ageDeduction = carAge * 1100;
    const mileageDeduction = Math.floor(mileageNumber / 10000) * 550;

    if (fuel === "Electric") base += 2500;
    if (fuel === "Hybrid") base += 1200;
    if (gearbox === "Automatic") base += 700;
    if (condition === "New") base += 2500;
    if (condition === "Nearly new") base += 1500;

    const estimate = Math.max(base - ageDeduction - mileageDeduction, 1500);

    return {
      low: Math.round((estimate * 0.9) / 100) * 100,
      high: Math.round((estimate * 1.1) / 100) * 100,
    };
  }, [make, year, mileage, fuel, gearbox, condition]);

  function handleLogout() {
    localStorage.removeItem("kerbSessionToken");
    localStorage.removeItem("kerbAccountEmail");
    localStorage.removeItem("kerbUser");
    window.dispatchEvent(new Event("kerb-auth-change"));
    window.location.href = "/";
  }

  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPhotos(previews.slice(0, 12));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.set("model", finalModel);
    formData.set("body_type", bodyType);
    formData.set("condition", condition);
    formData.set("finance_available", financeAvailable);

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
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not submit listing.");
      }

      setSubmittedListing(result.listing);
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
          <h1>Listing request received</h1>
          <p>
            Your car listing has been saved. It is currently marked as pending
            and can be reviewed before being shown publicly.
          </p>

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
                  setCustomModel("");
                }}
              >
                <option value="">Select make</option>
                {Object.keys(carMakes).map((makeName) => (
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
                    onChange={(e) => setModel(e.target.value)}
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
                <option>Hatchback</option>
                <option>Saloon</option>
                <option>Estate</option>
                <option>SUV</option>
                <option>Coupe</option>
                <option>Convertible</option>
                <option>MPV</option>
                <option>Pickup</option>
                <option>Van</option>
                <option>Other</option>
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
                <option>New</option>
                <option>Nearly new</option>
                <option>Used</option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Needs work</option>
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
              <input name="asking_price" placeholder="£12,995" required />
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
                <span>Estimated guide price</span>
                <strong>
                  £{valuation.low.toLocaleString()} - £{valuation.high.toLocaleString()}
                </strong>
              </div>
              <p>
                This is a basic estimate only. A real valuation will later compare
                similar cars listed on Kerb.
              </p>
            </div>
          )}

          <input type="hidden" name="valuation_low" value={valuation?.low || ""} />
          <input type="hidden" name="valuation_high" value={valuation?.high || ""} />

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
              <p>Add up to 12 photos. Clear photos help buyers trust the listing.</p>
            </div>

            <label className="uploadBox">
              <input
                name="photos"
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
                  <div className="photoPreview" key={`${photo.name}-${index}`}>
                    <img src={photo.url} alt={photo.name} />
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
              Phone number
              <input name="seller_phone" placeholder="07..." required />
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

          {errorMessage && <div className="errorBox">{errorMessage}</div>}

          <button className="primaryBtn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting listing..." : "Submit listing request"}
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

  .errorBox {
    background: #fff1f1;
    color: #b42318;
    border: 1px solid #ffd1d1;
    border-radius: 14px;
    padding: 14px 16px;
    font-weight: 800;
    margin-bottom: 18px;
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
      align-items: flex-start;
      flex-direction: column;
    }

    .navActions {
      width: 100%;
      flex-wrap: wrap;
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

    .formCard {
      padding: 24px;
    }

    .photoGrid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

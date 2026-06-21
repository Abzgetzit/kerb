"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteMenu from "../../../components/SiteMenu";

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

const bodyTypeOptions = [
  "Hatchback",
  "Saloon",
  "Estate",
  "SUV",
  "Coupe",
  "Convertible",
  "MPV",
  "Pickup",
  "Van",
  "Other",
];

const conditionOptions = [
  "New",
  "Nearly new",
  "Used",
  "Excellent",
  "Good",
  "Fair",
  "Needs work",
];

const fuelOptions = ["Petrol", "Diesel", "Hybrid", "Electric"];
const gearboxOptions = ["Manual", "Automatic"];
const listingCategoryOptions = [
  { value: "general", label: "General listing" },
  { value: "first-car", label: "First car" },
  { value: "performance", label: "Performance" },
  { value: "family-suv", label: "Family SUV" },
  { value: "electric-hybrid", label: "Electric or hybrid" },
  { value: "newer-car", label: "Newer car" },
];

const emptyForm = {
  asking_price: "",
  mileage: "",
  condition: "",
  body_type: "",
  finance_available: "false",
  description: "",
  seller_phone: "",
  location: "",
  fuel_type: "",
  gearbox: "",
  listing_category: "general",
  features: [],
};

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

function getTitle(car) {
  if (!car) return "Edit listing";

  const fallback = [car.year, car.make, car.model]
    .filter(Boolean)
    .join(" ")
    .trim();

  return car.title || fallback || "Car listing";
}

function normaliseStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function getStatusLabel(status) {
  const labels = {
    pending: "Pending review",
    approved: "Live",
    rejected: "Not approved",
    sold: "Sold",
  };

  return labels[normaliseStatus(status)] || "Kerb listing";
}

function getFeatures(car) {
  if (Array.isArray(car?.features)) {
    return car.features.filter(Boolean);
  }

  if (typeof car?.features === "string" && car.features.trim()) {
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

function normaliseImageUrl(value) {
  if (!value) return "";

  return String(value).trim();
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
    ...parseImageField(car?.photo_urls),
    ...parseImageField(car?.photos),
    ...parseImageField(car?.image_urls),
    ...parseImageField(car?.images),
    ...parseImageField(car?.image_url),
  ];

  return [...new Set(images)].filter(Boolean);
}

function createKerbUserFromStorage() {
  const savedUser = localStorage.getItem("kerbUser");
  const savedEmail = localStorage.getItem("kerbAccountEmail");
  const token = localStorage.getItem("kerbSessionToken");

  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("kerbUser");
    }
  }

  if (token && savedEmail) {
    return { email: savedEmail };
  }

  return null;
}

export default function EditListingPage() {
  const params = useParams();
  const listingId = params?.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [listing, setListing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const photoUrlsRef = useRef([]);

  const title = useMemo(() => getTitle(listing), [listing]);
  const totalPhotoCount = existingPhotos.length + newPhotos.length;
  const remainingPhotoSlots = Math.max(12 - totalPhotoCount, 0);

  useEffect(() => {
    const user = createKerbUserFromStorage();
    const token = localStorage.getItem("kerbSessionToken");

    if (!user || !token) {
      window.location.href = "/login";
      return;
    }

    setCurrentUser(user);
  }, []);

  useEffect(() => {
    async function loadListingForEdit() {
      const token = localStorage.getItem("kerbSessionToken");

      if (!token || !listingId) return;

      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(
          `/api/listing-editor?listing_id=${encodeURIComponent(listingId)}`,
          {
            headers: {
              "x-kerb-session-token": token,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not load this listing.");
        }

        const car = result.listing;

        setListing(car);
        setExistingPhotos(getListingImages(car));
        setNewPhotos([]);
        setForm({
          asking_price: car.asking_price || car.price || "",
          mileage: car.mileage || "",
          condition: car.condition || "",
          body_type: car.body_type || "",
          finance_available: car.finance_available ? "true" : "false",
          description: car.description || "",
          seller_phone: car.seller_phone || "",
          location: car.location || "",
          fuel_type: car.fuel_type || car.fuel || "",
          gearbox: car.gearbox || car.transmission || "",
          listing_category: car.listing_category || "general",
          features: getFeatures(car),
        });
      } catch (error) {
        setErrorMessage(error.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }

    loadListingForEdit();
  }, [listingId]);

  useEffect(() => {
    return () => {
      photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      photoUrlsRef.current = [];
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("kerbSessionToken");
    localStorage.removeItem("kerbAccountEmail");
    localStorage.removeItem("kerbUser");
    window.dispatchEvent(new Event("kerb-auth-change"));
    window.location.href = "/";
  }

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function toggleFeature(feature) {
    setForm((current) => {
      const hasFeature = current.features.includes(feature);

      return {
        ...current,
        features: hasFeature
          ? current.features.filter((item) => item !== feature)
          : [...current.features, feature],
      };
    });
  }

  function handlePhotoUpload(event) {
    const files = Array.from(event.target.files || []).slice(
      0,
      remainingPhotoSlots
    );

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

    setNewPhotos((currentPhotos) =>
      [...currentPhotos, ...previews].slice(0, 12 - existingPhotos.length)
    );

    event.target.value = "";
  }

  function removeExistingPhoto(photoUrl) {
    setExistingPhotos((currentPhotos) =>
      currentPhotos.filter((url) => url !== photoUrl)
    );
  }

  function removeNewPhoto(photoId) {
    setNewPhotos((currentPhotos) => {
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

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("kerbSessionToken");

    if (!token) {
      setErrorMessage("Please sign in again to edit this listing.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();

      formData.set("listing_id", listingId);
      formData.set("asking_price", form.asking_price);
      formData.set("mileage", form.mileage);
      formData.set("condition", form.condition);
      formData.set("body_type", form.body_type);
      formData.set("finance_available", form.finance_available);
      formData.set("description", form.description);
      formData.set("seller_phone", form.seller_phone);
      formData.set("location", form.location);
      formData.set("fuel_type", form.fuel_type);
      formData.set("gearbox", form.gearbox);
      formData.set("listing_category", form.listing_category);
      formData.set("existing_photo_urls", JSON.stringify(existingPhotos));

      form.features.forEach((feature) => {
        formData.append("features", feature);
      });

      newPhotos.forEach((photo) => {
        formData.append("new_photos", photo.file);
      });

      const response = await fetch("/api/listing-editor", {
        method: "PATCH",
        headers: {
          "x-kerb-session-token": token,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save changes.");
      }

      const wasRejected = normaliseStatus(listing?.status) === "rejected";

      setListing(result.listing);
      setExistingPhotos(getListingImages(result.listing));
      newPhotos.forEach((photo) => URL.revokeObjectURL(photo.url));
      photoUrlsRef.current = [];
      setNewPhotos([]);
      setSuccessMessage(
        wasRejected
          ? "Listing changes saved and sent back for review."
          : "Listing changes saved."
      );
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="edit-page">
        <Header currentUser={currentUser} onLogout={handleLogout} />

        <section className="state-card">
          <h1>Loading listing...</h1>
        </section>

        <style jsx global>{styles}</style>
      </main>
    );
  }

  if (errorMessage && !listing) {
    return (
      <main className="edit-page">
        <Header currentUser={currentUser} onLogout={handleLogout} />

        <section className="state-card">
          <h1>Could not edit listing</h1>
          <p>{errorMessage}</p>
          <Link href="/account?tab=listings">Back to my listings</Link>
        </section>

        <style jsx global>{styles}</style>
      </main>
    );
  }

  return (
    <main className="edit-page">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <section className="hero">
        <div>
          <div className="pill">Edit listing</div>
          <h1>{title}</h1>
          <p>
            {listing?.status
              ? `Status: ${getStatusLabel(listing.status)}`
              : "Kerb listing"}
          </p>
        </div>

        <div className="vehicleSummary">
          <div>
            <span>Current price</span>
            <strong>{formatPrice(listing?.price || listing?.asking_price)}</strong>
          </div>
          <div>
            <span>Mileage</span>
            <strong>
              {listing?.mileage ? `${formatNumber(listing.mileage)} miles` : "TBC"}
            </strong>
          </div>
          <div>
            <span>Location</span>
            <strong>{listing?.location || "TBC"}</strong>
          </div>
        </div>
      </section>

      <form className="edit-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <div className="section-heading">
            <h2>Listing details</h2>
          </div>

          <div className="grid">
            <label>
              Asking price
              <input
                value={form.asking_price}
                onChange={(event) =>
                  updateField("asking_price", event.target.value)
                }
                placeholder="12995"
                required
              />
            </label>

            <label>
              Mileage
              <input
                value={form.mileage}
                onChange={(event) => updateField("mileage", event.target.value)}
                placeholder="45000"
                required
              />
            </label>

            <label>
              Condition
              <select
                value={form.condition}
                onChange={(event) => updateField("condition", event.target.value)}
                required
              >
                <option value="">Select condition</option>
                {conditionOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              Body type
              <select
                value={form.body_type}
                onChange={(event) => updateField("body_type", event.target.value)}
                required
              >
                <option value="">Select body type</option>
                {bodyTypeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              Fuel type
              <select
                value={form.fuel_type}
                onChange={(event) => updateField("fuel_type", event.target.value)}
                required
              >
                <option value="">Select fuel type</option>
                {fuelOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              Gearbox
              <select
                value={form.gearbox}
                onChange={(event) => updateField("gearbox", event.target.value)}
                required
              >
                <option value="">Select gearbox</option>
                {gearboxOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              Location
              <input
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="Leicester"
                required
              />
            </label>

            <label>
              Phone number
              <input
                value={form.seller_phone}
                onChange={(event) =>
                  updateField("seller_phone", event.target.value)
                }
                placeholder="07..."
                required
              />
            </label>

            <label>
              Finance available from seller/dealer?
              <select
                value={form.finance_available}
                onChange={(event) =>
                  updateField("finance_available", event.target.value)
                }
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </label>

            <label>
              Best fit
              <select
                value={form.listing_category}
                onChange={(event) =>
                  updateField("listing_category", event.target.value)
                }
              >
                {listingCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading photoHeading">
            <div>
              <h2>Photos</h2>
              <p>
                Keep up to 12 photos. Remove individual images or add new ones.
              </p>
            </div>

            <span>{totalPhotoCount}/12 photos</span>
          </div>

          <label className="photoUpload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              disabled={remainingPhotoSlots === 0}
            />
            <strong>
              {remainingPhotoSlots === 0
                ? "Photo limit reached"
                : "Add car photos"}
            </strong>
            <span>
              {remainingPhotoSlots === 0
                ? "Remove a photo before adding another."
                : `${remainingPhotoSlots} slot${
                    remainingPhotoSlots === 1 ? "" : "s"
                  } remaining`}
            </span>
          </label>

          {totalPhotoCount > 0 ? (
            <div className="photoGrid">
              {existingPhotos.map((photoUrl, index) => (
                <div className="photoTile" key={photoUrl}>
                  <img src={photoUrl} alt={`Current car photo ${index + 1}`} />

                  {index === 0 && <span className="coverBadge">Cover</span>}

                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(photoUrl)}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}

              {newPhotos.map((photo) => (
                <div className="photoTile newPhoto" key={photo.id}>
                  <img src={photo.url} alt={photo.name} />
                  <span className="coverBadge">New</span>

                  <button
                    type="button"
                    onClick={() => removeNewPhoto(photo.id)}
                    aria-label="Remove new photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="noPhotos">
              Add at least one clear photo before submitting changes.
            </div>
          )}
        </section>

        <section className="form-section">
          <div className="section-heading">
            <h2>Features</h2>
          </div>

          <div className="featureChecklist">
            {carFeatureOptions.map((feature) => (
              <label className="featureOption" key={feature}>
                <input
                  type="checkbox"
                  checked={form.features.includes(feature)}
                  onChange={() => toggleFeature(feature)}
                />
                <span>{feature}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <h2>Description</h2>
          </div>

          <label>
            Seller description
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Tell buyers about the car."
            />
          </label>
        </section>

        {errorMessage && <div className="errorBox">{errorMessage}</div>}
        {successMessage && <div className="successBox">{successMessage}</div>}

        <div className="actions">
          <button type="submit" className="primaryButton" disabled={isSaving}>
            {isSaving ? "Saving changes..." : "Save changes"}
          </button>

          <Link href={`/listing/${listingId}`} className="secondaryButton">
            View listing
          </Link>

          <Link href="/account?tab=listings" className="secondaryButton">
            My listings
          </Link>
        </div>
      </form>

      <style jsx global>{styles}</style>
    </main>
  );
}

function Header({ currentUser, onLogout }) {
  return (
    <header className="topbar">
      <Link href="/" className="logo">
        Kerb
      </Link>

      <nav className="nav">
        <Link href="/browse">Browse cars</Link>
        <Link href="/account?tab=listings">My listings</Link>
        <Link href="/post-car">Post your car</Link>
      </nav>

      <div className="top-actions">
        <Link href="/account" className="accountLink">
          My account
        </Link>

        <button type="button" onClick={onLogout}>
          Log out
        </button>
      </div>

      <SiteMenu currentUser={currentUser} onLogout={onLogout} />
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
    color: #071126;
    font-family: Inter, Arial, sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input,
  select,
  textarea {
    font-family: inherit;
  }

  .edit-page {
    min-height: 100vh;
    padding: 24px 36px 60px;
  }

  .topbar {
    min-height: 62px;
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
  }

  .logo {
    color: #0048ff;
    font-size: 38px;
    font-weight: 950;
    letter-spacing: 0;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
  }

  .nav a,
  .top-actions a,
  .top-actions button {
    border: none;
    background: #eef3ff;
    color: #0048ff;
    border-radius: 13px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
  }

  .top-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .top-actions button {
    background: transparent;
    color: #c01818;
    padding-inline: 6px;
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 430px;
    gap: 22px;
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 28px;
    padding: 34px;
    box-shadow: 0 16px 45px rgba(20, 35, 70, 0.08);
    margin-bottom: 22px;
  }

  .pill {
    display: inline-flex;
    background: #eaf1ff;
    color: #0048ff;
    border: 1px solid #d7e4ff;
    border-radius: 999px;
    padding: 8px 13px;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 16px;
  }

  h1 {
    margin: 0 0 12px;
    font-size: 44px;
    line-height: 1.02;
    letter-spacing: 0;
  }

  h2 {
    margin: 0;
    font-size: 24px;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: #59657a;
    line-height: 1.6;
  }

  .vehicleSummary {
    display: grid;
    gap: 12px;
  }

  .vehicleSummary div {
    background: #f7f9fd;
    border: 1px solid #e5eaf4;
    border-radius: 16px;
    padding: 15px;
  }

  .vehicleSummary span {
    display: block;
    color: #657189;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 5px;
  }

  .vehicleSummary strong {
    color: #071126;
    font-size: 18px;
  }

  .edit-form {
    display: grid;
    gap: 18px;
  }

  .form-section,
  .state-card {
    background: white;
    border: 1px solid #e5eaf4;
    border-radius: 24px;
    padding: 26px;
    box-shadow: 0 12px 34px rgba(10, 20, 40, 0.06);
  }

  .state-card {
    max-width: 660px;
    margin: 90px auto;
    text-align: center;
  }

  .state-card p {
    margin: 12px 0 22px;
  }

  .state-card a {
    display: inline-flex;
    background: #0048ff;
    color: white;
    border-radius: 13px;
    padding: 13px 18px;
    font-weight: 950;
  }

  .section-heading {
    margin-bottom: 18px;
  }

  .photoHeading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .photoHeading p {
    margin-top: 6px;
  }

  .photoHeading > span {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    border-radius: 999px;
    padding: 0 12px;
    background: #eef3ff;
    color: #0048ff;
    font-size: 13px;
    font-weight: 950;
    white-space: nowrap;
  }

  .photoUpload {
    min-height: 118px;
    border: 2px dashed #cfdcff;
    border-radius: 20px;
    background: #f8fbff;
    display: grid;
    place-items: center;
    gap: 6px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    color: #071126;
    margin-bottom: 18px;
  }

  .photoUpload input {
    display: none;
  }

  .photoUpload strong {
    font-size: 18px;
  }

  .photoUpload span {
    color: #657189;
    font-size: 13px;
    font-weight: 850;
  }

  .photoUpload:has(input:disabled) {
    cursor: not-allowed;
    opacity: 0.72;
  }

  .photoGrid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .photoTile {
    position: relative;
    aspect-ratio: 16 / 10;
    border-radius: 16px;
    overflow: hidden;
    background: #eef2f7;
    border: 1px solid #dfe6f1;
  }

  .photoTile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .photoTile button {
    position: absolute;
    top: 9px;
    right: 9px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: rgba(7, 17, 38, 0.78);
    color: white;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  }

  .coverBadge {
    position: absolute;
    left: 9px;
    bottom: 9px;
    min-height: 28px;
    border-radius: 999px;
    padding: 0 10px;
    background: white;
    color: #0048ff;
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    font-weight: 950;
  }

  .newPhoto {
    border-color: #0048ff;
  }

  .noPhotos {
    border: 1px dashed #d7e1f2;
    border-radius: 16px;
    padding: 18px;
    background: #fbfcff;
    color: #657189;
    font-weight: 850;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }

  label {
    display: grid;
    gap: 8px;
    color: #172033;
    font-size: 14px;
    font-weight: 850;
  }

  input,
  select,
  textarea {
    width: 100%;
    border: 1px solid #dfe6f1;
    border-radius: 14px;
    padding: 15px 16px;
    background: #fbfcff;
    color: #071126;
    font-size: 15px;
    outline: none;
  }

  textarea {
    min-height: 170px;
    resize: vertical;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: #0048ff;
    box-shadow: 0 0 0 4px rgba(0, 72, 255, 0.08);
  }

  .featureChecklist {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .featureOption {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 46px;
    border: 1px solid #dfe6f1;
    border-radius: 14px;
    padding: 10px 12px;
    background: #fbfcff;
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

  .errorBox,
  .successBox {
    border-radius: 14px;
    padding: 14px 16px;
    font-weight: 850;
  }

  .errorBox {
    background: #fff1f1;
    color: #b42318;
    border: 1px solid #ffd1d1;
  }

  .successBox {
    background: #eafaf0;
    color: #137333;
    border: 1px solid #c9efd7;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .primaryButton,
  .secondaryButton {
    min-height: 50px;
    border: none;
    border-radius: 14px;
    padding: 0 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 950;
    cursor: pointer;
  }

  .primaryButton {
    background: #0048ff;
    color: white;
    box-shadow: 0 10px 25px rgba(0, 72, 255, 0.22);
  }

  .secondaryButton {
    background: #eef3ff;
    color: #0048ff;
  }

  .primaryButton:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 1050px) {
    .hero {
      grid-template-columns: 1fr;
    }

    .featureChecklist {
      grid-template-columns: repeat(2, 1fr);
    }

    .photoGrid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .edit-page {
      padding: 18px;
    }

    .nav,
    .top-actions {
      display: none;
    }

    .hero {
      padding: 26px;
    }

    h1 {
      font-size: 34px;
    }

    .grid,
    .featureChecklist,
    .photoGrid {
      grid-template-columns: 1fr;
    }

    .photoHeading {
      flex-direction: column;
    }

    .form-section {
      padding: 22px;
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr;
    }

    .primaryButton,
    .secondaryButton {
      width: 100%;
    }
  }
`;

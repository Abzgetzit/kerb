"use client";

import { useEffect } from "react";

function money(value) {
  const amount = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? `£${amount.toLocaleString("en-GB")}` : "";
}

function imageFor(listing) {
  if (Array.isArray(listing.photos) && listing.photos[0]) return listing.photos[0];
  if (Array.isArray(listing.photo_urls) && listing.photo_urls[0]) return listing.photo_urls[0];
  return listing.image_url || "/cars/hero-car.png";
}

function titleFor(listing) {
  return (
    listing.title ||
    [listing.year, listing.make, listing.model, listing.model_detail, listing.variant]
      .filter(Boolean)
      .join(" ") ||
    "Car listing"
  );
}

function addPostCarBidOption() {
  if (window.location.pathname !== "/post-car") return;
  if (document.getElementById("kerb-accept-bids")) return;

  const form = document.querySelector("form.formCard");
  const boostSection = document.querySelector(".boostPreviewSection");
  if (!form || !boostSection) return;

  const section = document.createElement("section");
  section.className = "kerbBidListingSection";
  section.innerHTML = `
    <div>
      <span class="kerbBidKicker">Private bids</span>
      <h2>Open this listing to private bids</h2>
      <p>Buyers can send the highest amount they would genuinely pay. Every bid stays private and is only visible to you.</p>
    </div>
    <label class="kerbBidToggle">
      <input id="kerb-accept-bids" type="checkbox" />
      <span>
        <strong>Allow buyers to make private bids</strong>
        <em>Your asking price will still be shown. Buyers cannot see anyone else’s bid.</em>
      </span>
    </label>
  `;

  boostSection.parentNode.insertBefore(section, boostSection);
}

function installPostCarFetchPatch() {
  if (window.__kerbBidFetchPatched) return;
  window.__kerbBidFetchPatched = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const rawUrl = typeof input === "string" ? input : input?.url || "";

    if (rawUrl === "/api/post-car" && init?.body instanceof FormData) {
      const checkbox = document.getElementById("kerb-accept-bids");
      init.body.set("accept_bids", checkbox?.checked ? "true" : "false");
      return originalFetch("/api/post-car-bids", init);
    }

    return originalFetch(input, init);
  };
}

function installBidSearch() {
  if (window.location.pathname !== "/bids") return;
  if (document.querySelector(".bidSearch[data-kerb-ready='true']")) return;

  const form = document.querySelector(".bidSearch");
  const pills = document.querySelector(".filterPills");
  const results = document.querySelector(".emptyBids");
  const count = document.querySelector(".resultsHeader span");
  const sort = document.querySelector(".resultsHeader select");
  if (!form || !pills || !results || !count) return;

  form.dataset.kerbReady = "true";
  form.setAttribute("action", "/bids");
  form.innerHTML = `
    <label><span>Location</span><input name="location" placeholder="Any location" /></label>
    <label><span>Make</span><input name="make" placeholder="Any make" /></label>
    <label><span>Model</span><input name="model" placeholder="Any model" /></label>
    <label><span>Max asking price</span><input name="maxPrice" inputmode="numeric" placeholder="Any price" /></label>
    <button type="submit">Search bid cars</button>
  `;

  const panel = document.createElement("div");
  panel.className = "kerbBidAdvanced";
  panel.hidden = true;
  panel.innerHTML = `
    <label>Maximum mileage<input name="maxMileage" form="kerb-bid-search-form" inputmode="numeric" placeholder="Any mileage" /></label>
    <label>Fuel type<select name="fuel" form="kerb-bid-search-form"><option value="">Any fuel</option><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></label>
    <label>Transmission<select name="gearbox" form="kerb-bid-search-form"><option value="">Any transmission</option><option>Manual</option><option>Automatic</option><option>Semi-automatic</option></select></label>
    <button type="button" class="kerbClearBidFilters">Clear filters</button>
  `;
  form.id = "kerb-bid-search-form";
  pills.after(panel);

  const originalEmpty = results.innerHTML;

  async function loadListings() {
    const params = new URLSearchParams(new FormData(form));
    panel.querySelectorAll("input, select").forEach((field) => {
      if (field.value) params.set(field.name, field.value);
    });
    if (sort?.value) params.set("sort", sort.value);

    results.classList.add("loading");

    try {
      const response = await fetch(`/api/bids/listings?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();
      const listings = Array.isArray(payload.listings) ? payload.listings : [];
      count.textContent = `${listings.length} ${listings.length === 1 ? "car" : "cars"}`;

      if (!response.ok) throw new Error(payload.error || "Could not load bid cars.");

      if (listings.length === 0) {
        results.className = "emptyBids";
        results.innerHTML = originalEmpty;
        return;
      }

      results.className = "emptyBids kerbBidResults";
      results.innerHTML = listings
        .map(
          (listing) => `
            <article class="kerbBidCard">
              <a href="/listing/${listing.id}" class="kerbBidImage"><img src="${imageFor(listing)}" alt="${titleFor(listing).replaceAll('"', '&quot;')}" /></a>
              <div class="kerbBidCardBody">
                <a href="/listing/${listing.id}"><h3>${titleFor(listing)}</h3></a>
                <p>${[listing.mileage ? `${Number(listing.mileage).toLocaleString("en-GB")} miles` : "", listing.gearbox, listing.fuel_type].filter(Boolean).join(" · ")}</p>
                <span>${listing.location || "UK"}</span>
                <small>Asking price</small>
                <strong>${money(listing.asking_price || listing.price)}</strong>
                <a class="kerbBidCardAction" href="/listing/${listing.id}">View car &amp; make a bid</a>
              </div>
            </article>
          `
        )
        .join("");
    } catch (error) {
      results.className = "emptyBids";
      results.innerHTML = `<div><h2>Could not load bid cars</h2><p>${error.message || "Please try again."}</p></div>`;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    loadListings();
  });

  pills.querySelectorAll("button").forEach((button, index) => {
    button.addEventListener("click", () => {
      if (index === 0) {
        form.querySelector('[name="maxPrice"]')?.focus();
        return;
      }
      panel.hidden = false;
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (index === 1) panel.querySelector('[name="maxMileage"]')?.focus();
      if (index === 2) panel.querySelector('[name="fuel"]')?.focus();
      if (index === 3) panel.querySelector('[name="gearbox"]')?.focus();
    });
  });

  panel.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("change", loadListings);
  });

  panel.querySelector(".kerbClearBidFilters")?.addEventListener("click", () => {
    form.reset();
    panel.querySelectorAll("input, select").forEach((field) => {
      field.value = "";
    });
    loadListings();
  });

  sort?.addEventListener("change", loadListings);
  loadListings();
}

function addStyles() {
  if (document.getElementById("kerb-bid-feature-styles")) return;
  const style = document.createElement("style");
  style.id = "kerb-bid-feature-styles";
  style.textContent = `
    .kerbBidListingSection{border-top:1px solid #edf1f8;padding-top:26px;margin-top:26px;display:grid;grid-template-columns:.9fr 1.1fr;gap:24px;align-items:center}.kerbBidKicker{display:inline-flex;background:#eaf1ff;color:#0048ff;border:1px solid #d7e4ff;border-radius:999px;padding:9px 14px;font-size:13px;font-weight:950;margin-bottom:14px}.kerbBidListingSection h2{margin:0 0 8px}.kerbBidListingSection p{margin:0;color:#657189}.kerbBidToggle{display:flex;align-items:flex-start;gap:13px;border:1px solid #dce6f7;border-radius:18px;background:#f8fbff;padding:18px;cursor:pointer}.kerbBidToggle input{width:20px;height:20px;margin-top:2px;accent-color:#0048ff}.kerbBidToggle span{display:grid;gap:5px}.kerbBidToggle em{font-style:normal;color:#657189;font-size:13px;line-height:1.45}.kerbBidAdvanced{width:min(1432px,calc(100% - 104px));margin:10px auto 0;background:#fff;border:1px solid #dce6f7;border-radius:14px;padding:14px;display:grid;grid-template-columns:repeat(3,1fr) 140px;gap:12px}.kerbBidAdvanced[hidden]{display:none}.kerbBidAdvanced label{display:grid;gap:6px;font-size:12px;font-weight:900;color:#52617c}.kerbBidAdvanced input,.kerbBidAdvanced select{height:42px;border:1px solid #dce6f7;border-radius:10px;padding:0 12px;background:#fbfcff;font:inherit;color:#0b1533}.kerbClearBidFilters{border:0;border-radius:10px;background:#eef4ff;color:#0048ff;font-weight:950;cursor:pointer}.kerbBidResults{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;place-items:stretch!important;text-align:left!important;padding:16px!important;background:transparent!important;border:0!important;box-shadow:none!important}.kerbBidCard{display:grid;grid-template-columns:48% 52%;background:#fff;border:1px solid #dce6f7;border-radius:14px;overflow:hidden;min-height:190px}.kerbBidImage img{width:100%;height:100%;object-fit:cover;display:block}.kerbBidCardBody{padding:14px;display:flex;flex-direction:column;align-items:flex-start}.kerbBidCardBody h3{margin:0 0 6px;font-size:17px;line-height:1.1}.kerbBidCardBody p,.kerbBidCardBody span{margin:0;color:#5b6882;font-size:12px}.kerbBidCardBody small{margin-top:12px;color:#5b6882}.kerbBidCardBody>strong{font-size:22px;margin-top:2px}.kerbBidCardAction{margin-top:auto;width:100%;min-height:34px;border:1px solid #0048ff;border-radius:8px;color:#0048ff!important;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:950}.bidSearch label input{grid-column:2;border:0;outline:0;background:transparent;font:inherit;font-weight:950;color:#07142d;min-width:0}.bidSearch label input::placeholder{color:#07142d;opacity:1}.emptyBids.loading{opacity:.6}.bidsPage .heroCar{right:5%!important}
    @media(max-width:900px){.kerbBidListingSection{grid-template-columns:1fr}.kerbBidAdvanced{width:calc(100% - 28px);grid-template-columns:1fr}.kerbBidResults{grid-template-columns:1fr!important}.kerbBidCard{grid-template-columns:42% 58%}}
  `;
  document.head.appendChild(style);
}

export default function BidFeatureEnhancements() {
  useEffect(() => {
    addStyles();
    installPostCarFetchPatch();

    let timer;
    const run = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        addPostCarBidOption();
        installBidSearch();
      }, 80);
    };

    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return null;
}

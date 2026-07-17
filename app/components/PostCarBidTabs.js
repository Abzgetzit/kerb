"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function installStyles() {
  if (document.getElementById("kerb-listing-type-tab-styles")) return;

  const style = document.createElement("style");
  style.id = "kerb-listing-type-tab-styles";
  style.textContent = `
    .kerbBidListingSection{display:none!important}.kerbListingTypeSection{border-top:1px solid #edf1f8;padding-top:28px;margin-top:28px}.kerbListingTypeHeader{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:16px}.kerbListingTypeHeader h2{margin:0 0 7px!important;font-size:28px!important;letter-spacing:-.8px}.kerbListingTypeHeader p{max-width:700px;margin:0!important;color:#657189!important}.kerbListingTypeBadge{display:inline-flex;background:#eaf1ff;color:#0048ff;border:1px solid #d7e4ff;border-radius:999px;padding:8px 13px;font-size:12px;font-weight:950;margin-bottom:11px}.kerbListingTypeTabs{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:7px;background:#eef3fb;border:1px solid #dce6f5;border-radius:17px}.kerbListingTypeTab{min-height:72px;border:1px solid transparent;border-radius:13px;background:transparent;color:#33415a;padding:12px 16px;text-align:left;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:12px}.kerbListingTypeTabIcon{width:40px;height:40px;border-radius:12px;background:#fff;border:1px solid #dce6f5;color:#0048ff;display:grid;place-items:center;font-size:20px;font-weight:950;flex:0 0 auto}.kerbListingTypeTab span{display:grid;gap:3px}.kerbListingTypeTab strong{font-size:15px;color:#111b32}.kerbListingTypeTab em{font-style:normal;font-size:12px;color:#69758b;line-height:1.35}.kerbListingTypeTab.active{background:#fff;border-color:#0048ff;box-shadow:0 8px 22px rgba(0,72,255,.1)}.kerbListingTypeTab.active .kerbListingTypeTabIcon{background:#0048ff;color:#fff;border-color:#0048ff}.kerbListingTypePanel{margin-top:14px;border:1px solid #dce6f5;border-radius:19px;background:linear-gradient(135deg,#f8fbff,#fff);padding:22px;display:grid;grid-template-columns:.9fr 1.1fr;gap:24px;align-items:center}.kerbListingTypePanel h3{margin:0 0 8px;font-size:22px;letter-spacing:-.5px}.kerbListingTypePanel p{margin:0!important;color:#657189!important;font-size:14px!important;line-height:1.55!important}.kerbListingTypePoints{display:grid;grid-template-columns:1fr 1fr;gap:10px}.kerbListingTypePoint{min-height:78px;border:1px solid #e0e8f5;border-radius:14px;background:#fff;padding:13px;display:flex;gap:10px;align-items:flex-start}.kerbListingTypePoint b{width:25px;height:25px;border-radius:999px;background:#edf3ff;color:#0048ff;display:grid;place-items:center;flex:0 0 auto;font-size:12px}.kerbListingTypePoint span{display:grid;gap:3px}.kerbListingTypePoint strong{font-size:13px}.kerbListingTypePoint small{color:#68758c;font-size:11px;line-height:1.35}.kerbListingTypeStatus{margin-top:14px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-radius:13px;padding:13px 15px;background:#f4f7fc;border:1px solid #e1e8f4}.kerbListingTypeStatus strong{font-size:13px}.kerbListingTypeStatus span{font-size:12px;color:#68758c}.kerbListingTypeStatus.bid{background:#edf4ff;border-color:#cfe0ff}.kerbListingTypeStatus.bid strong{color:#0048ff}
    @media(max-width:850px){.kerbListingTypeHeader{align-items:flex-start;flex-direction:column}.kerbListingTypeTabs{grid-template-columns:1fr}.kerbListingTypePanel{grid-template-columns:1fr}.kerbListingTypePoints{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function installTabs() {
  if (window.location.pathname !== "/post-car") return;
  if (document.querySelector(".kerbListingTypeSection")) return;

  const form = document.querySelector("form.formCard");
  const boostSection = document.querySelector(".boostPreviewSection");
  if (!form || !boostSection) return;

  let bidCheckbox = document.getElementById("kerb-accept-bids");
  if (!bidCheckbox) {
    bidCheckbox = document.createElement("input");
    bidCheckbox.type = "checkbox";
    bidCheckbox.id = "kerb-accept-bids";
    bidCheckbox.hidden = true;
    form.appendChild(bidCheckbox);
  }

  const section = document.createElement("section");
  section.className = "kerbListingTypeSection";
  section.innerHTML = `
    <div class="kerbListingTypeHeader">
      <div>
        <span class="kerbListingTypeBadge">Listing type</span>
        <h2>Choose how to list your car</h2>
        <p>Stay on this page and choose a standard advert or open the car to bids. You can still use the same photos, details, asking price and boost options.</p>
      </div>
    </div>
    <div class="kerbListingTypeTabs" role="tablist" aria-label="Choose listing type">
      <button type="button" class="kerbListingTypeTab active" data-mode="standard" role="tab" aria-selected="true">
        <span class="kerbListingTypeTabIcon">A</span>
        <span><strong>Standard listing</strong><em>Buyers view the advert and contact you through Kerb.</em></span>
      </button>
      <button type="button" class="kerbListingTypeTab" data-mode="bid" role="tab" aria-selected="false">
        <span class="kerbListingTypeTabIcon">£</span>
        <span><strong>Bid listing</strong><em>Buyers submit offers and bid amounts are ranked highest first.</em></span>
      </button>
    </div>
    <div class="kerbListingTypePanel"></div>
    <div class="kerbListingTypeStatus"><strong>Standard listing selected</strong><span>Your car will appear as a normal Kerb advert.</span></div>
  `;

  boostSection.parentNode.insertBefore(section, boostSection);

  const tabs = [...section.querySelectorAll(".kerbListingTypeTab")];
  const panel = section.querySelector(".kerbListingTypePanel");
  const status = section.querySelector(".kerbListingTypeStatus");

  const standardPanel = `
    <div><h3>Standard advert</h3><p>Your asking price is shown and buyers can view the car, save it and contact you through Kerb. This is the normal marketplace listing.</p></div>
    <div class="kerbListingTypePoints">
      <div class="kerbListingTypePoint"><b>1</b><span><strong>Show your asking price</strong><small>Buyers see the price you have chosen.</small></span></div>
      <div class="kerbListingTypePoint"><b>2</b><span><strong>Receive enquiries</strong><small>Interested buyers can contact you through Kerb.</small></span></div>
      <div class="kerbListingTypePoint"><b>3</b><span><strong>Manage from your account</strong><small>Your advert stays connected to your Kerb account.</small></span></div>
      <div class="kerbListingTypePoint"><b>4</b><span><strong>Boost if needed</strong><small>You can still choose a visibility boost below.</small></span></div>
    </div>
  `;

  const bidPanel = `
    <div><h3>Post as a bid listing</h3><p>Your asking price remains visible, while buyers submit the highest amount they would genuinely pay. Bid amounts are shown from highest to lowest, but buyer names and contact details stay private.</p></div>
    <div class="kerbListingTypePoints">
      <div class="kerbListingTypePoint"><b>1</b><span><strong>Asking price stays visible</strong><small>Buyers can compare their offer with your price.</small></span></div>
      <div class="kerbListingTypePoint"><b>2</b><span><strong>All amounts are ranked</strong><small>The highest bid appears first on the bid page.</small></span></div>
      <div class="kerbListingTypePoint"><b>3</b><span><strong>Buyer details stay private</strong><small>Only bid amounts and times are shown publicly.</small></span></div>
      <div class="kerbListingTypePoint"><b>4</b><span><strong>No payment is taken</strong><small>A bid is an offer, not an automatic purchase.</small></span></div>
    </div>
  `;

  function setMode(mode) {
    const isBid = mode === "bid";
    bidCheckbox.checked = isBid;
    bidCheckbox.dispatchEvent(new Event("change", { bubbles: true }));

    tabs.forEach((tab) => {
      const active = tab.dataset.mode === mode;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    panel.innerHTML = isBid ? bidPanel : standardPanel;
    status.className = `kerbListingTypeStatus${isBid ? " bid" : ""}`;
    status.innerHTML = isBid
      ? "<strong>Bid listing selected</strong><span>Your car will appear on the Bids page after submission.</span>"
      : "<strong>Standard listing selected</strong><span>Your car will appear as a normal Kerb advert.</span>";
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
  setMode(bidCheckbox.checked ? "bid" : "standard");
}

export default function PostCarBidTabs() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/post-car") return undefined;

    installStyles();
    let timer;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(installTabs, 80);
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

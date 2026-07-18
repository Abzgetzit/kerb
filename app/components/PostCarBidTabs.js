"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function installStyles() {
  if (document.getElementById("kerb-listing-type-tab-styles")) return;

  const style = document.createElement("style");
  style.id = "kerb-listing-type-tab-styles";
  style.textContent = `
    .kerbBidListingSection{display:none!important}.kerbListingTypeSection{border-top:1px solid #edf1f8;padding-top:28px;margin-top:28px}.kerbListingTypeHeader{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:16px}.kerbListingTypeHeader h2{margin:0 0 7px!important;font-size:28px!important;letter-spacing:-.8px}.kerbListingTypeHeader p{max-width:720px;margin:0!important;color:#657189!important}.kerbListingTypeBadge{display:inline-flex;background:#eaf1ff;color:#0048ff;border:1px solid #d7e4ff;border-radius:999px;padding:8px 13px;font-size:12px;font-weight:950;margin-bottom:11px}.kerbListingTypeTabs{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:7px;background:#eef3fb;border:1px solid #dce6f5;border-radius:17px}.kerbListingTypeTab{min-height:72px;border:1px solid transparent;border-radius:13px;background:transparent;color:#33415a;padding:12px 16px;text-align:left;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:12px}.kerbListingTypeTabIcon{width:40px;height:40px;border-radius:12px;background:#fff;border:1px solid #dce6f5;color:#0048ff;display:grid;place-items:center;font-size:20px;font-weight:950;flex:0 0 auto}.kerbListingTypeTab span{display:grid;gap:3px}.kerbListingTypeTab strong{font-size:15px;color:#111b32}.kerbListingTypeTab em{font-style:normal;font-size:12px;color:#69758b;line-height:1.35}.kerbListingTypeTab.active{background:#fff;border-color:#0048ff;box-shadow:0 8px 22px rgba(0,72,255,.1)}.kerbListingTypeTab.active .kerbListingTypeTabIcon{background:#0048ff;color:#fff;border-color:#0048ff}.kerbListingTypePanel{margin-top:14px;border:1px solid #dce6f5;border-radius:19px;background:linear-gradient(135deg,#f8fbff,#fff);padding:20px;display:grid;grid-template-columns:.85fr 1.15fr;gap:20px;align-items:center}.kerbListingTypePanel h3{margin:0 0 7px;font-size:21px;letter-spacing:-.45px}.kerbListingTypePanel p{margin:0!important;color:#657189!important;font-size:13px!important;line-height:1.5!important}.kerbListingTypeFacts{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.kerbListingTypeFact{min-height:72px;border:1px solid #e0e8f5;border-radius:13px;background:#fff;padding:11px;display:grid;gap:4px}.kerbListingTypeFact b{width:23px;height:23px;border-radius:999px;background:#edf3ff;color:#0048ff;display:grid;place-items:center;font-size:11px}.kerbListingTypeFact strong{font-size:12px}.kerbListingTypeFact small{color:#68758c;font-size:10px;line-height:1.3}.kerbListingTypeStatus{margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-radius:13px;padding:12px 14px;background:#f4f7fc;border:1px solid #e1e8f4}.kerbListingTypeStatus strong{font-size:13px}.kerbListingTypeStatus span{font-size:11px;color:#68758c}.kerbListingTypeStatus.bid{background:#edf4ff;border-color:#cfe0ff}.kerbListingTypeStatus.bid strong{color:#0048ff}
    @media(max-width:850px){.kerbListingTypeHeader{align-items:flex-start;flex-direction:column}.kerbListingTypePanel{grid-template-columns:1fr}.kerbListingTypeFacts{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:720px){.kerbListingTypeSection{padding:14px!important;margin:0 0 10px!important;border:1px solid #e3e9f3!important;border-radius:17px!important;background:#fff!important}.kerbListingTypeHeader{margin-bottom:10px!important}.kerbListingTypeBadge{padding:6px 10px!important;font-size:10px!important;margin-bottom:7px!important}.kerbListingTypeHeader h2{font-size:21px!important;margin-bottom:4px!important}.kerbListingTypeHeader p{font-size:11px!important;line-height:1.4!important}.kerbListingTypeTabs{grid-template-columns:1fr 1fr!important;gap:7px!important;padding:5px!important;border-radius:13px!important}.kerbListingTypeTab{min-height:58px!important;padding:8px!important;gap:8px!important;border-radius:10px!important}.kerbListingTypeTabIcon{width:31px!important;height:31px!important;border-radius:9px!important;font-size:15px!important}.kerbListingTypeTab strong{font-size:12px!important}.kerbListingTypeTab em{display:none!important}.kerbListingTypePanel{padding:12px!important;margin-top:9px!important;border-radius:13px!important;gap:10px!important}.kerbListingTypePanel h3{font-size:17px!important;margin-bottom:4px!important}.kerbListingTypePanel p{font-size:10px!important;line-height:1.4!important}.kerbListingTypeFacts{grid-template-columns:repeat(3,1fr)!important;gap:6px!important}.kerbListingTypeFact{min-height:61px!important;padding:8px!important;border-radius:10px!important}.kerbListingTypeFact b{width:19px!important;height:19px!important;font-size:9px!important}.kerbListingTypeFact strong{font-size:9px!important;line-height:1.2!important}.kerbListingTypeFact small{display:none!important}.kerbListingTypeStatus{display:none!important}}
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
    bidCheckbox.name = "accept_bids";
    bidCheckbox.value = "true";
    bidCheckbox.hidden = true;
    form.appendChild(bidCheckbox);
  } else {
    bidCheckbox.name = "accept_bids";
    bidCheckbox.value = "true";
  }

  const section = document.createElement("section");
  section.className = "kerbListingTypeSection";
  section.innerHTML = `
    <div class="kerbListingTypeHeader">
      <div>
        <span class="kerbListingTypeBadge">Listing type</span>
        <h2>Choose how to list your car</h2>
        <p>Choose a standard advert or a bid listing. Your photos, vehicle details, asking price and boost choices remain the same.</p>
      </div>
    </div>
    <div class="kerbListingTypeTabs" role="tablist" aria-label="Choose listing type">
      <button type="button" class="kerbListingTypeTab active" data-mode="standard" role="tab" aria-selected="true">
        <span class="kerbListingTypeTabIcon">A</span>
        <span><strong>Standard listing</strong><em>Buyers view the advert and contact you through Kerb.</em></span>
      </button>
      <button type="button" class="kerbListingTypeTab" data-mode="bid" role="tab" aria-selected="false">
        <span class="kerbListingTypeTabIcon">£</span>
        <span><strong>Bid listing</strong><em>Buyers submit offers ranked from highest to lowest.</em></span>
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
    <div><h3>Standard advert</h3><p>Your asking price is shown and interested buyers contact you through Kerb.</p></div>
    <div class="kerbListingTypeFacts">
      <div class="kerbListingTypeFact"><b>1</b><strong>Price shown</strong><small>Buyers see your asking price.</small></div>
      <div class="kerbListingTypeFact"><b>2</b><strong>Receive enquiries</strong><small>Buyers contact you through Kerb.</small></div>
      <div class="kerbListingTypeFact"><b>3</b><strong>Manage advert</strong><small>Edit, boost or mark it sold.</small></div>
    </div>
  `;

  const bidPanel = `
    <div><h3>Bid listing</h3><p>Your asking price remains visible. Bid amounts are shown highest first, while buyer names and contact details stay private.</p></div>
    <div class="kerbListingTypeFacts">
      <div class="kerbListingTypeFact"><b>1</b><strong>Price stays visible</strong><small>Buyers compare bids with your price.</small></div>
      <div class="kerbListingTypeFact"><b>2</b><strong>Highest first</strong><small>All bid amounts are ranked.</small></div>
      <div class="kerbListingTypeFact"><b>3</b><strong>No payment taken</strong><small>A bid is an offer, not a purchase.</small></div>
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

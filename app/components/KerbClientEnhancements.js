"use client";

import { useEffect } from "react";

function cleanText(value) {
  return String(value || "").trim();
}

function getListingIdFromUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    const match = url.pathname.match(/^\/listing\/([^/?#]+)/);

    return match ? decodeURIComponent(match[1]) : "";
  } catch {
    return "";
  }
}

function getInitials(name) {
  const parts = cleanText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "K";

  return parts.map((part) => part[0]).join("").toUpperCase();
}

function addEnhancementStyles() {
  if (document.getElementById("kerb-client-enhancement-styles")) return;

  const style = document.createElement("style");
  style.id = "kerb-client-enhancement-styles";
  style.textContent = `
    .kerbHiddenEmailRow {
      display: block !important;
    }

    .kerbHiddenEmailText {
      color: #657189 !important;
      font-weight: 850 !important;
      word-break: break-word !important;
    }

    .kerbInlineToggle {
      display: none !important;
    }

    .seller-icon.kerbSellerPhotoIcon,
    .kerbSellerPhotoIcon {
      overflow: hidden !important;
      background: #eef3ff !important;
      padding: 0 !important;
    }

    .seller-icon.kerbSellerPhotoIcon img,
    .kerbSellerPhotoIcon img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      display: block !important;
    }

    .kerbListingAvatar {
      width: 22px !important;
      height: 22px !important;
      border-radius: 999px !important;
      object-fit: cover !important;
      display: inline-block !important;
      margin-right: 7px !important;
      border: 1px solid rgba(255, 255, 255, 0.7) !important;
      vertical-align: middle !important;
    }

    .kerbChatAvatar {
      width: 72px !important;
      height: 72px !important;
      border-radius: 999px !important;
      display: grid !important;
      place-items: center !important;
      margin: 0 0 14px !important;
      background: linear-gradient(180deg, #4f86ff, #0048ff) !important;
      color: #ffffff !important;
      font-size: 26px !important;
      font-weight: 950 !important;
      letter-spacing: -0.04em !important;
      box-shadow: 0 18px 42px rgba(0, 72, 255, 0.22) !important;
    }
  `;
  document.head.appendChild(style);
}

async function loadListingProfile(listingId) {
  if (!listingId) return null;

  window.__kerbListingProfileCache = window.__kerbListingProfileCache || {};

  if (listingId in window.__kerbListingProfileCache) {
    return window.__kerbListingProfileCache[listingId];
  }

  try {
    const response = await fetch(
      `/api/listing-profile-photo?listing_id=${encodeURIComponent(listingId)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      window.__kerbListingProfileCache[listingId] = null;
      return null;
    }

    const result = await response.json();
    window.__kerbListingProfileCache[listingId] = result;

    return result;
  } catch {
    window.__kerbListingProfileCache[listingId] = null;
    return null;
  }
}

function maskChatEmails() {
  if (!window.location.pathname.startsWith("/enquiries/")) return;

  document.querySelectorAll(".sidePanel").forEach((panel) => {
    const emailNode = Array.from(panel.querySelectorAll("p")).find((node) => {
      const text = cleanText(node.textContent);
      return text.includes("@") || text.toLowerCase().includes("email hidden") || text.toLowerCase() === "email not provided";
    });

    if (!emailNode) return;

    emailNode.textContent = "";
    emailNode.classList.add("kerbHiddenEmailRow");

    const textSpan = document.createElement("span");
    textSpan.className = "kerbHiddenEmailText";
    textSpan.textContent = "Email hidden";
    emailNode.appendChild(textSpan);
    emailNode.dataset.kerbEmailEnhanced = "true";
  });
}

function enhanceChatSidebarAvatar() {
  if (!window.location.pathname.startsWith("/enquiries/")) return;

  document.querySelectorAll(".sidePanel").forEach((panel) => {
    if (panel.dataset.kerbChatAvatarEnhanced === "true") return;

    const nameNode = panel.querySelector("h2");
    const labelNode = panel.querySelector(":scope > span");

    if (!nameNode || !labelNode) return;

    const avatar = document.createElement("div");
    avatar.className = "kerbChatAvatar";
    avatar.textContent = getInitials(nameNode.textContent);
    avatar.setAttribute("aria-hidden", "true");

    panel.insertBefore(avatar, labelNode);
    panel.dataset.kerbChatAvatarEnhanced = "true";
  });
}

function addBuyerEmailPrivacyOption() {
  if (!window.location.pathname.startsWith("/listing/")) return;

  const enquiryForm = document.querySelector(".enquiry-form");
  if (!enquiryForm || enquiryForm.dataset.kerbBuyerEmailPrivacy === "true") return;

  const emailInput = enquiryForm.querySelector('input[type="email"]');
  const emailLabel = emailInput?.closest("label");
  if (!emailLabel) return;

  const privacyLabel = document.createElement("label");
  privacyLabel.className = "kerbEmailPrivacyOption";
  privacyLabel.innerHTML = `
    <input id="kerbBuyerEmailVisible" type="checkbox" />
    <span>
      <strong>Show my email to the seller in chat</strong>
      <em>Leave this off to keep your email hidden. The seller can still reply through Kerb.</em>
    </span>
  `;

  emailLabel.insertAdjacentElement("afterend", privacyLabel);
  enquiryForm.dataset.kerbBuyerEmailPrivacy = "true";
}

function addSellerEmailPrivacyOption() {
  if (window.location.pathname !== "/post-car") return;

  const privacyOptions = document.querySelector(".privacyOptions");
  if (!privacyOptions || privacyOptions.dataset.kerbSellerEmailPrivacy === "true") return;

  const privacyLabel = document.createElement("label");
  privacyLabel.className = "privacyOption kerbEmailPrivacyOption";
  privacyLabel.innerHTML = `
    <input name="show_seller_email" type="checkbox" value="true" />
    <span>
      <strong>Show my email in Kerb chat</strong>
      <em>Leave this off to keep your email hidden from buyers. Buyers can still message you through Kerb.</em>
    </span>
  `;

  privacyOptions.appendChild(privacyLabel);
  privacyOptions.dataset.kerbSellerEmailPrivacy = "true";
}

function patchFetchForEmailPrivacy() {
  if (window.__kerbEmailPrivacyFetchPatched) return;
  window.__kerbEmailPrivacyFetchPatched = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    try {
      const url = typeof input === "string" ? input : input?.url || "";

      if (url === "/api/enquiries" && init?.body && typeof init.body === "string") {
        const body = JSON.parse(init.body);
        const buyerEmailVisible = document.getElementById("kerbBuyerEmailVisible")?.checked === true;
        init = {
          ...init,
          body: JSON.stringify({
            ...body,
            buyer_email_visible: buyerEmailVisible,
          }),
        };
      }

      if (url === "/api/post-car" && init?.body instanceof FormData) {
        const sellerEmailVisible = document.querySelector('input[name="show_seller_email"]')?.checked === true;
        init.body.set("show_seller_email", sellerEmailVisible ? "true" : "false");
      }
    } catch {
      // Do not block the normal request if a privacy enhancement cannot run.
    }

    return originalFetch(input, init);
  };
}

async function enhanceListingDetailAvatar() {
  if (!window.location.pathname.startsWith("/listing/")) return;

  const listingId = getListingIdFromUrl(window.location.href);
  const sellerIcon = document.querySelector(".contact-card .seller-icon");

  if (!listingId || !sellerIcon || sellerIcon.dataset.kerbAvatarEnhanced === "true") return;

  sellerIcon.dataset.kerbAvatarEnhanced = "true";
  const profile = await loadListingProfile(listingId);
  const profilePhotoUrl = cleanText(profile?.profile_photo_url);

  if (!profilePhotoUrl) return;

  sellerIcon.classList.add("kerbSellerPhotoIcon");
  sellerIcon.innerHTML = "";

  const image = document.createElement("img");
  image.src = profilePhotoUrl;
  image.alt = "Seller profile photo";
  image.loading = "lazy";
  sellerIcon.appendChild(image);
}

async function enhanceListingCardAvatars() {
  const links = Array.from(document.querySelectorAll('a[href*="/listing/"]')).slice(0, 60);
  const cardsByListingId = new Map();

  links.forEach((link) => {
    const listingId = getListingIdFromUrl(link.href || link.getAttribute("href"));
    if (!listingId || cardsByListingId.has(listingId)) return;

    const card = link.closest("article, .card, .listingCard, .carCard");
    if (!card || card.dataset.kerbAvatarEnhanced === "true") return;

    cardsByListingId.set(listingId, card);
  });

  for (const [listingId, card] of cardsByListingId.entries()) {
    card.dataset.kerbAvatarEnhanced = "true";

    const badge = Array.from(card.querySelectorAll("span, b, strong, div")).find((node) => {
      if (node.querySelector("img")) return false;

      const text = cleanText(node.textContent).toLowerCase();
      return text === "private seller" || text === "dealer" || text === "seller";
    });

    if (!badge) continue;

    const profile = await loadListingProfile(listingId);
    const profilePhotoUrl = cleanText(profile?.profile_photo_url);

    if (!profilePhotoUrl || badge.querySelector(".kerbListingAvatar")) continue;

    const image = document.createElement("img");
    image.className = "kerbListingAvatar";
    image.src = profilePhotoUrl;
    image.alt = "Seller profile photo";
    image.loading = "lazy";
    badge.prepend(image);
  }
}

function runEnhancements() {
  addEnhancementStyles();
  patchFetchForEmailPrivacy();
  maskChatEmails();
  addBuyerEmailPrivacyOption();
  addSellerEmailPrivacyOption();
  enhanceChatSidebarAvatar();
  enhanceListingDetailAvatar();
  enhanceListingCardAvatars();
}

export default function KerbClientEnhancements() {
  useEffect(() => {
    let timer;

    function scheduleRun() {
      window.clearTimeout(timer);
      timer = window.setTimeout(runEnhancements, 120);
    }

    runEnhancements();

    const observer = new MutationObserver(scheduleRun);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("kerb-auth-change", scheduleRun);
    window.addEventListener("kerb-message-change", scheduleRun);
    window.addEventListener("popstate", scheduleRun);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener("kerb-auth-change", scheduleRun);
      window.removeEventListener("kerb-message-change", scheduleRun);
      window.removeEventListener("popstate", scheduleRun);
    };
  }, []);

  return null;
}

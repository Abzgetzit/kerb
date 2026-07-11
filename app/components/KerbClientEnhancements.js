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
      display: flex !important;
      align-items: center !important;
      flex-wrap: wrap !important;
      gap: 8px !important;
    }

    .kerbHiddenEmailText {
      color: inherit !important;
      word-break: break-word !important;
    }

    .kerbInlineToggle {
      border: 1px solid #dbe5f5 !important;
      border-radius: 999px !important;
      background: #eef3ff !important;
      color: #0048ff !important;
      padding: 6px 10px !important;
      font: inherit !important;
      font-size: 12px !important;
      font-weight: 950 !important;
      line-height: 1 !important;
      cursor: pointer !important;
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
      return text.includes("@") || text.toLowerCase() === "email not provided";
    });

    if (!emailNode || emailNode.dataset.kerbEmailEnhanced === "true") return;

    const email = cleanText(emailNode.textContent);
    emailNode.dataset.kerbEmailEnhanced = "true";

    if (!email || email.toLowerCase() === "email not provided") {
      emailNode.textContent = "Email hidden";
      return;
    }

    let isVisible = localStorage.getItem("kerbChatEmailsVisible") === "true";
    const textSpan = document.createElement("span");
    const toggleButton = document.createElement("button");

    textSpan.className = "kerbHiddenEmailText";
    toggleButton.type = "button";
    toggleButton.className = "kerbInlineToggle";

    function render() {
      textSpan.textContent = isVisible ? email : "Email hidden";
      toggleButton.textContent = isVisible ? "Hide email" : "Show email";
    }

    toggleButton.addEventListener("click", () => {
      isVisible = !isVisible;
      localStorage.setItem("kerbChatEmailsVisible", isVisible ? "true" : "false");
      render();
    });

    emailNode.textContent = "";
    emailNode.classList.add("kerbHiddenEmailRow");
    emailNode.append(textSpan, toggleButton);
    render();
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
  maskChatEmails();
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

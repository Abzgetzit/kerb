"use client";

import { useEffect } from "react";

const bidHeroImage = "data:image/webp;base64,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";

function addBidsToHomepageNav() {
  if (window.location.pathname !== "/") return;

  const nav = document.querySelector(".navbar .navLinks");
  if (!nav || nav.querySelector('a[href="/bids"]')) return;

  const browseLink = nav.querySelector('a[href="/browse"]');
  const bidsLink = document.createElement("a");
  bidsLink.href = "/bids";
  bidsLink.className = "kerbInjectedBidsLink";
  bidsLink.innerHTML = `
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 12l-8 8-8-8V4h16v8Z"></path>
      <path d="M9 10h6"></path>
      <path d="M12 7v6"></path>
    </svg>
    Bids
  `;

  if (browseLink?.nextElementSibling) {
    nav.insertBefore(bidsLink, browseLink.nextElementSibling);
  } else if (browseLink) {
    browseLink.insertAdjacentElement("afterend", bidsLink);
  } else {
    nav.prepend(bidsLink);
  }
}

function fixBidHeroImage() {
  if (window.location.pathname !== "/bids") return;

  const images = Array.from(document.querySelectorAll("img"));
  const heroImage = images.find((image) => {
    const alt = String(image.alt || "").toLowerCase();
    const parentText = String(image.parentElement?.textContent || "").toLowerCase();

    return (
      alt.includes("bid hero") ||
      alt.includes("white bmw") ||
      alt.includes("white bmw on kerb bids") ||
      parentText.includes("kerb white bmw bid hero car")
    );
  });

  if (!heroImage) return;

  heroImage.dataset.kerbBidHeroFixed = "true";
  heroImage.src = bidHeroImage;
  heroImage.alt = "Kerb white BMW bid hero car";
  heroImage.loading = "eager";
  heroImage.decoding = "async";
  heroImage.style.objectFit = "cover";
  heroImage.style.objectPosition = "center right";
  heroImage.style.width = "100%";
  heroImage.style.height = "100%";
  heroImage.style.display = "block";
  heroImage.style.filter = "none";

  const imageParent = heroImage.parentElement;
  if (imageParent) {
    imageParent.style.overflow = "hidden";
    imageParent.style.background =
      "linear-gradient(110deg, #f8fbff 0%, #eef5ff 100%)";
  }
}

function fixKerbLogoColour() {
  document.querySelectorAll('a[href="/"]').forEach((link) => {
    if (String(link.textContent || "").trim() === "Kerb") {
      link.style.color = "#0048ff";
    }
  });
}

function addStyles() {
  if (document.getElementById("kerb-home-bids-hero-fix-styles")) return;

  const style = document.createElement("style");
  style.id = "kerb-home-bids-hero-fix-styles";
  style.textContent = `
    .logo,
    .navbar .logo,
    header .logo,
    a[href="/"].logo {
      color: #0048ff !important;
    }

    .navbar .navLinks .kerbInjectedBidsLink {
      color: #0048ff !important;
    }

    .navbar .navLinks .kerbInjectedBidsLink .icon {
      color: #0048ff !important;
    }

    body:has(.bid-page) .logo,
    body:has(.bids-page) .logo {
      color: #0048ff !important;
    }

    @media (max-width: 1100px) {
      .navbar .navLinks .kerbInjectedBidsLink {
        display: inline-flex !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function runFixes() {
  addStyles();
  addBidsToHomepageNav();
  fixBidHeroImage();
  fixKerbLogoColour();
}

export default function HomeBidsAndBidHeroFix() {
  useEffect(() => {
    let timer;

    function scheduleRun() {
      window.clearTimeout(timer);
      timer = window.setTimeout(runFixes, 80);
    }

    runFixes();

    const observer = new MutationObserver(scheduleRun);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("popstate", scheduleRun);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener("popstate", scheduleRun);
    };
  }, []);

  return null;
}

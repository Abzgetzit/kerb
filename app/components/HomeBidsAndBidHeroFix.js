"use client";

import { useEffect } from "react";

const bidHeroFallback = "/cars/hero-car.png";

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

  if (browseLink?.nextSibling) {
    nav.insertBefore(bidsLink, browseLink.nextSibling);
  } else if (browseLink) {
    nav.appendChild(bidsLink);
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
      parentText.includes("kerb white bmw bid hero car")
    );
  });

  if (!heroImage || heroImage.dataset.kerbBidHeroFixed === "true") return;

  heroImage.dataset.kerbBidHeroFixed = "true";
  heroImage.src = bidHeroFallback;
  heroImage.alt = "White BMW on Kerb bids";
  heroImage.loading = "eager";
  heroImage.decoding = "async";
  heroImage.style.objectFit = "contain";
  heroImage.style.objectPosition = "right center";
  heroImage.style.width = "100%";
  heroImage.style.height = "100%";
  heroImage.onerror = () => {
    heroImage.style.display = "none";
  };
}

function addStyles() {
  if (document.getElementById("kerb-home-bids-hero-fix-styles")) return;

  const style = document.createElement("style");
  style.id = "kerb-home-bids-hero-fix-styles";
  style.textContent = `
    .navbar .navLinks .kerbInjectedBidsLink {
      color: #0048ff !important;
    }

    .navbar .navLinks .kerbInjectedBidsLink .icon {
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

"use client";

import { useEffect } from "react";

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

  if (browseLink) {
    browseLink.insertAdjacentElement("afterend", bidsLink);
  } else {
    nav.prepend(bidsLink);
  }
}

function addStyles() {
  if (document.getElementById("kerb-home-bids-hero-fix-styles")) return;

  const style = document.createElement("style");
  style.id = "kerb-home-bids-hero-fix-styles";
  style.textContent = `
    .navbar .logo,
    .bidsLogo {
      color: #0048ff !important;
    }

    .navbar .navLinks .kerbInjectedBidsLink {
      color: #0048ff !important;
    }

    .navbar .navLinks .kerbInjectedBidsLink .icon {
      color: #0048ff !important;
    }
  `;
  document.head.appendChild(style);
}

function runFixes() {
  addStyles();
  addBidsToHomepageNav();
}

export default function HomeBidsAndBidHeroFix() {
  useEffect(() => {
    let timer;

    function scheduleRun() {
      window.clearTimeout(timer);
      timer = window.setTimeout(runFixes, 80);
    }

    scheduleRun();

    const observer = new MutationObserver(scheduleRun);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return null;
}

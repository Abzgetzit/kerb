"use client";

import { useEffect } from "react";

function addMobileContactStyles() {
  if (document.getElementById("kerb-mobile-listing-contact-styles")) return;

  const style = document.createElement("style");
  style.id = "kerb-mobile-listing-contact-styles";
  style.textContent = `
    .kerbMobileContactShortcut {
      display: none;
    }

    @media (max-width: 700px) {
      .kerbMobileContactShortcut {
        display: block;
        margin-top: 12px;
      }

      .kerbMobileContactShortcut button {
        width: 100%;
        min-height: 58px;
        border: none;
        border-radius: 16px;
        background: #0b45ff;
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 17px;
        font-weight: 950;
        box-shadow: 0 14px 30px rgba(11, 69, 255, 0.24);
        cursor: pointer;
      }

      .kerbMobileContactShortcut svg {
        width: 21px;
        height: 21px;
      }
    }
  `;

  document.head.appendChild(style);
}

function addMobileContactShortcut() {
  if (!window.location.pathname.startsWith("/listing/")) return;

  const gallery = document.querySelector(".listing-page .gallery-card");
  const originalButton = document.querySelector(".listing-page .contact-card .primary-contact");

  if (!gallery || !originalButton) return;

  if (document.querySelector(".kerbMobileContactShortcut")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "kerbMobileContactShortcut";

  const button = document.createElement("button");
  button.type = "button";
  button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
    Message seller
  `;

  button.addEventListener("click", () => {
    originalButton.click();
  });

  wrapper.appendChild(button);
  gallery.insertAdjacentElement("afterend", wrapper);
}

export default function MobileListingContactButton() {
  useEffect(() => {
    let timer;

    function run() {
      addMobileContactStyles();
      addMobileContactShortcut();
    }

    function scheduleRun() {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, 120);
    }

    run();

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

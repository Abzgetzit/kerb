"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function addBidsLink() {
  if (!window.location.pathname.startsWith("/listing/")) return;

  const nav = document.querySelector("header.topbar nav.nav");
  if (!nav || nav.querySelector('[data-kerb-bids-link="true"]')) return;

  const browseLink = [...nav.querySelectorAll("a")].find(
    (link) => link.getAttribute("href") === "/browse"
  );
  if (!browseLink) return;

  const link = document.createElement("a");
  link.href = "/bids";
  link.className = browseLink.className || "nav-item";
  link.dataset.kerbBidsLink = "true";
  link.innerHTML = `
    <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 12 12 20 4 12V4h8l8 8Z"></path>
      <path d="M8.5 8.5h.01"></path>
    </svg>
    Bids
  `;

  browseLink.insertAdjacentElement("afterend", link);
}

export default function ListingBidsNavFix() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname?.startsWith("/listing/")) return undefined;

    const listingId = pathname.split("/").filter(Boolean)[1] || "";
    const pendingBidId = sessionStorage.getItem("kerbNewBidListingId") || "";

    if (listingId && pendingBidId === listingId) {
      sessionStorage.removeItem("kerbNewBidListingId");
      window.location.replace(`/bids/${listingId}`);
      return undefined;
    }

    addBidsLink();
    const observer = new MutationObserver(addBidsLink);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

"use client";

import { useEffect } from "react";

function installPostCarFetchPatch() {
  if (window.__kerbBidFetchPatched) return;
  window.__kerbBidFetchPatched = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const rawUrl = typeof input === "string" ? input : input?.url || "";

    if (rawUrl !== "/api/post-car" || !(init?.body instanceof FormData)) {
      return originalFetch(input, init);
    }

    const checkbox = document.getElementById("kerb-accept-bids");
    const acceptBids = checkbox?.checked === true;
    init.body.set("accept_bids", acceptBids ? "true" : "false");

    const response = await originalFetch(input, init);

    if (!response.ok) return response;

    const payload = await response.clone().json().catch(() => null);
    const listingId = payload?.listing?.id;

    if (!listingId) return response;

    const token = localStorage.getItem("kerbSessionToken") || "";

    try {
      const settingResponse = await originalFetch("/api/listing-bid-setting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kerb-session-token": token,
        },
        body: JSON.stringify({
          listing_id: listingId,
          accept_bids: acceptBids,
        }),
      });

      if (!settingResponse.ok) {
        const settingResult = await settingResponse.json().catch(() => ({}));
        console.error(
          "Kerb bid listing setting could not be saved:",
          settingResult.error || settingResponse.statusText
        );
      }
    } catch (error) {
      console.error("Kerb bid listing setting request failed:", error);
    }

    return response;
  };
}

export default function BidFeatureEnhancements() {
  useEffect(() => {
    installPostCarFetchPatch();
  }, []);

  return null;
}

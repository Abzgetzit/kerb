"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function isPostCarRequest(input, init) {
  const url = typeof input === "string" ? input : input?.url;
  return (
    url === "/api/post-car" &&
    String(init?.method || "GET").toUpperCase() === "POST" &&
    init?.body instanceof FormData
  );
}

function isBidSelected(formData) {
  const submittedValue = String(formData?.get("accept_bids") || "").toLowerCase();
  if (["true", "1", "yes", "on"].includes(submittedValue)) return true;

  const checkbox = document.getElementById("kerb-accept-bids");
  return checkbox?.checked === true;
}

export default function BidListingSubmissionFix() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/post-car") return undefined;

    const previousFetch = window.fetch.bind(window);

    window.fetch = async function kerbBidListingFetch(input, init) {
      if (!isPostCarRequest(input, init)) {
        return previousFetch(input, init);
      }

      const acceptBids = isBidSelected(init.body);
      init.body.set("accept_bids", acceptBids ? "true" : "false");
      init.body.set("listing_type", acceptBids ? "bid" : "standard");

      const response = await previousFetch(input, init);
      if (!response.ok || !acceptBids) return response;

      let result;
      try {
        result = await response.clone().json();
      } catch {
        return response;
      }

      const listingId = result?.listing?.id;
      if (!listingId) return response;

      const token =
        init?.headers?.["x-kerb-session-token"] ||
        init?.headers?.get?.("x-kerb-session-token") ||
        localStorage.getItem("kerbSessionToken") ||
        "";

      const modeResponse = await previousFetch("/api/listing-bid-mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kerb-session-token": token,
        },
        body: JSON.stringify({ listing_id: listingId, accept_bids: true }),
      });

      if (!modeResponse.ok) {
        let modeError = "Could not save the listing as a bid listing.";
        try {
          const modeResult = await modeResponse.json();
          modeError = modeResult.error || modeError;
        } catch {}

        return new Response(JSON.stringify({ error: modeError }), {
          status: modeResponse.status || 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      sessionStorage.setItem("kerbNewBidListingId", String(listingId));
      result.listing = { ...result.listing, accept_bids: true, listing_type: "bid" };

      return new Response(JSON.stringify(result), {
        status: response.status,
        statusText: response.statusText,
        headers: { "Content-Type": "application/json" },
      });
    };

    return () => {
      window.fetch = previousFetch;
    };
  }, [pathname]);

  return null;
}

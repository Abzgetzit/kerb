"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BidsClient from "../bids/BidsClient";

export default function BidPageReplacement() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (pathname !== "/bids") {
      setReady(false);
      return undefined;
    }

    const originalFetch = window.fetch.bind(window);

    window.fetch = (input, init) => {
      const rawUrl = typeof input === "string" ? input : input?.url || "";

      if (rawUrl.startsWith("/api/bids/listings?")) {
        return originalFetch(rawUrl.replace("/api/bids/listings?", "/api/bid-cars?"), init);
      }

      return originalFetch(input, init);
    };

    setReady(true);

    return () => {
      window.fetch = originalFetch;
      setReady(false);
    };
  }, [pathname]);

  if (pathname !== "/bids" || !ready) return null;

  return (
    <>
      <div className="kerbBidPageReplacement">
        <BidsClient />
      </div>
      <style>{`
        body > .bidsPage,
        body > main.bidsPage,
        .bidsPage:not(.kerbBidPageReplacement .bidsPage) {
          display: none !important;
        }
        .kerbBidPageReplacement {
          display: block;
          min-height: 100vh;
        }
      `}</style>
    </>
  );
}

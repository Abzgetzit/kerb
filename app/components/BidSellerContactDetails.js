"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function installStyles() {
  if (document.getElementById("kerb-bid-seller-contact-styles")) return;
  const style = document.createElement("style");
  style.id = "kerb-bid-seller-contact-styles";
  style.textContent = `
    .kerbSellerBidNotice{margin:0 0 12px;padding:12px 14px;border:1px solid #cfe0ff;border-radius:11px;background:#edf4ff;color:#12356f;font-size:12px;font-weight:800;line-height:1.45}
    .kerbBidContact{grid-column:1/-1;margin:0 0 8px 38px;padding:10px 11px;border:1px solid #dce6f6;border-radius:10px;background:#f8faff;display:grid;gap:6px}
    .kerbBidContact strong{font-size:12px!important;color:#09142d}
    .kerbBidContactLinks{display:flex;flex-wrap:wrap;gap:7px}
    .kerbBidContactLinks a,.kerbBidContactLinks span{display:inline-flex;align-items:center;min-height:30px;padding:6px 9px;border-radius:8px;background:#fff;border:1px solid #dbe5f5;color:#0048ff!important;font-size:11px;font-weight:850;text-decoration:none;word-break:break-all}
    @media(max-width:720px){.kerbBidContact{margin-left:0}.kerbBidContactLinks{display:grid}.kerbBidContactLinks a,.kerbBidContactLinks span{width:100%}}
  `;
  document.head.appendChild(style);
}

export default function BidSellerContactDetails() {
  const pathname = usePathname();

  useEffect(() => {
    const match = pathname?.match(/^\/bids\/([^/]+)$/);
    if (!match) return undefined;

    installStyles();
    let cancelled = false;
    let observer;
    const listingId = match[1];

    async function loadSellerBids() {
      const token = localStorage.getItem("kerbSessionToken") || "";
      if (!token) return;

      try {
        const response = await fetch(`/api/bid-offers?listingId=${encodeURIComponent(listingId)}`, {
          cache: "no-store",
          headers: { "x-kerb-session-token": token },
        });
        const payload = await response.json();
        if (!response.ok || !payload.seller_view || cancelled) return;

        const decorate = () => {
          const list = document.querySelector(".bidDetailBidsList");
          if (!list) return false;

          const form = document.querySelector(".bidDetailForm");
          if (form && !form.querySelector(".kerbSellerBidNotice")) {
            const notice = document.createElement("div");
            notice.className = "kerbSellerBidNotice";
            notice.textContent = "You are viewing your own bid listing. Buyer contact details are shown privately to you below.";
            form.prepend(notice);
          }

          const cards = [...list.querySelectorAll(":scope > article")];
          cards.forEach((card, index) => {
            const bid = payload.bids?.[index];
            if (!bid || card.querySelector(".kerbBidContact")) return;

            const contact = document.createElement("div");
            contact.className = "kerbBidContact";
            const name = bid.bidder_name || "Buyer";
            const email = bid.bidder_email || "";
            const phone = bid.bidder_phone || "";
            contact.innerHTML = `
              <strong>${name.replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]))}</strong>
              <div class="kerbBidContactLinks">
                ${email ? `<a href="mailto:${encodeURIComponent(email)}">${email.replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]))}</a>` : "<span>Email unavailable</span>"}
                ${phone ? `<a href="tel:${phone.replace(/[^0-9+]/g, "")}">${phone.replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]))}</a>` : "<span>Phone unavailable</span>"}
              </div>`;
            card.appendChild(contact);
          });
          return cards.length > 0;
        };

        decorate();
        observer = new MutationObserver(decorate);
        observer.observe(document.body, { childList: true, subtree: true });
      } catch (error) {
        console.error("Seller bid contact details error:", error);
      }
    }

    loadSellerBids();
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}

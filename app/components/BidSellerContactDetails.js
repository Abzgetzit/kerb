"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function installStyles() {
  if (document.getElementById("kerb-bid-seller-contact-styles")) return;
  const style = document.createElement("style");
  style.id = "kerb-bid-seller-contact-styles";
  style.textContent = `
    .kerbSellerBidNotice{margin:0 0 12px;padding:12px 14px;border:1px solid #cfe0ff;border-radius:11px;background:#edf4ff;color:#12356f;font-size:12px;font-weight:800;line-height:1.45}
    .kerbBidPrivacyNotice{display:flex;align-items:flex-start;gap:8px;margin-top:10px;padding:10px 11px;border:1px solid #d7e2f3;border-radius:9px;background:#f7faff;color:#41516f;font-size:10px;font-weight:750;line-height:1.45}
    .kerbBidPrivacyNotice svg{width:16px;height:16px;flex:0 0 auto;margin-top:1px;color:#0048ff}
    .kerbOwnerBidLocked{margin-top:10px;padding:14px;border:1px solid #cfe0ff;border-radius:11px;background:#f4f8ff;color:#12356f;font-size:12px;font-weight:800;line-height:1.5}
    .kerbBidContact{grid-column:1/-1;margin:0 0 8px 38px;padding:10px 11px;border:1px solid #dce6f6;border-radius:10px;background:#f8faff;display:grid;gap:6px}
    .kerbBidContact strong{font-size:12px!important;color:#09142d}
    .kerbBidContactLinks{display:flex;flex-wrap:wrap;gap:7px}
    .kerbBidContactLinks a,.kerbBidContactLinks span{display:inline-flex;align-items:center;min-height:30px;padding:6px 9px;border-radius:8px;background:#fff;border:1px solid #dbe5f5;color:#0048ff!important;font-size:11px;font-weight:850;text-decoration:none;word-break:break-all}
    @media(max-width:720px){.kerbBidContact{margin-left:0}.kerbBidContactLinks{display:grid}.kerbBidContactLinks a,.kerbBidContactLinks span{width:100%}}
  `;
  document.head.appendChild(style);
}

function addBuyerDisclosure() {
  const form = document.querySelector(".bidDetailForm");
  if (!form || form.querySelector(".kerbBidPrivacyNotice")) return false;

  const notice = document.createElement("div");
  notice.className = "kerbBidPrivacyNotice";
  notice.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path></svg>
    <span>When you submit a bid, the seller will be able to see your name and the contact details saved on your Kerb account. Other buyers will only see the bid amount.</span>`;

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.insertAdjacentElement("afterend", notice);
  else form.appendChild(notice);
  return true;
}

function lockSellerForm(form) {
  if (!form || form.dataset.kerbOwnerLocked === "true") return;
  form.dataset.kerbOwnerLocked = "true";

  const heading = form.querySelector("h2");
  const intro = form.querySelector(":scope > p");
  const amountLabel = form.querySelector(":scope > label");
  const submitButton = form.querySelector('button[type="submit"]');
  const privacyNotice = form.querySelector(".kerbBidPrivacyNotice");

  if (heading) heading.textContent = "Your bid listing";
  if (intro) intro.textContent = "You can review buyer bids and contact details in the list beside this panel.";
  if (amountLabel) amountLabel.style.display = "none";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.style.display = "none";
  }
  if (privacyNotice) privacyNotice.style.display = "none";

  const existingSmall = [...form.querySelectorAll(":scope > small")];
  existingSmall.forEach((item) => { item.style.display = "none"; });

  if (!form.querySelector(".kerbOwnerBidLocked")) {
    const locked = document.createElement("div");
    locked.className = "kerbOwnerBidLocked";
    locked.textContent = "You cannot submit a bid on your own listing. Buyer contact details are shown privately to you under each bid.";
    form.appendChild(locked);
  }
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

    const decorateBuyerView = () => addBuyerDisclosure();
    decorateBuyerView();

    observer = new MutationObserver(() => {
      decorateBuyerView();
    });
    observer.observe(document.body, { childList: true, subtree: true });

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

        const decorateSellerView = () => {
          const list = document.querySelector(".bidDetailBidsList");
          const form = document.querySelector(".bidDetailForm");
          if (!list || !form) return false;

          lockSellerForm(form);

          if (!form.querySelector(".kerbSellerBidNotice")) {
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
              <strong>${escapeHtml(name)}</strong>
              <div class="kerbBidContactLinks">
                ${email ? `<a href="mailto:${encodeURIComponent(email)}">${escapeHtml(email)}</a>` : "<span>Email unavailable</span>"}
                ${phone ? `<a href="tel:${phone.replace(/[^0-9+]/g, "")}">${escapeHtml(phone)}</a>` : "<span>Phone unavailable</span>"}
              </div>`;
            card.appendChild(contact);
          });
          return cards.length > 0;
        };

        decorateSellerView();
        observer?.disconnect();
        observer = new MutationObserver(() => {
          decorateBuyerView();
          decorateSellerView();
        });
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

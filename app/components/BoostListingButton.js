"use client";

import { useState } from "react";

export default function BoostListingButton({
  listingId,
  label = "Boost this listing",
  source = "listing",
  small = false,
  disabled = false,
  className = "",
  planId = "14-days",
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function startBoost() {
    const listingIdText = String(listingId || "").trim();
    const planIdText = String(planId || "14-days").trim();

    if (!listingIdText || disabled || isLoading) return;

    const token = localStorage.getItem("kerbSessionToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/listing-boosts/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kerb-session-token": token,
        },
        body: JSON.stringify({
          listing_id: listingIdText,
          plan_id: planIdText,
          source,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not start boost checkout.");
      }

      if (!result.url) {
        throw new Error("Checkout link was not created.");
      }

      window.location.href = result.url;
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <span className={`boostButtonWrap ${className}`.trim()}>
      <button
        type="button"
        className={small ? "boostButton small" : "boostButton"}
        onClick={startBoost}
        disabled={disabled || isLoading || !listingId}
      >
        <span>★</span>
        {isLoading ? "Opening checkout..." : label}
      </button>

      {errorMessage && <small className="boostError">{errorMessage}</small>}

      <style jsx>{`
        .boostButtonWrap {
          display: inline-flex;
          flex-direction: column;
          gap: 7px;
          width: fit-content;
        }

        .boostButton {
          border: 0;
          border-radius: 18px;
          background: linear-gradient(135deg, #0b4bff, #1033d9);
          color: white;
          padding: 15px 20px;
          font-weight: 950;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(11, 75, 255, 0.24);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 48px;
          transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
        }

        .boostButton.small {
          min-height: 42px;
          padding: 11px 14px;
          border-radius: 14px;
          font-size: 13px;
          box-shadow: 0 10px 20px rgba(11, 75, 255, 0.18);
        }

        .boostButton:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 18px 35px rgba(11, 75, 255, 0.28);
        }

        .boostButton:disabled {
          cursor: not-allowed;
          opacity: 0.62;
          box-shadow: none;
        }

        .boostError {
          color: #dc2626;
          font-weight: 800;
          line-height: 1.4;
          max-width: 280px;
        }
      `}</style>
    </span>
  );
}

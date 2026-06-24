"use client";

import { useState } from "react";

const boostPlans = [
  { id: "7-days", label: "1 week", price: "£7.99", note: "7 days" },
  { id: "14-days", label: "2 weeks", price: "£13.99", note: "Best value" },
  { id: "30-days", label: "1 month", price: "£19.99", note: "30 days" },
];

export default function BoostListingButton({
  listingId,
  label = "Boost this listing",
  source = "listing",
  small = false,
  disabled = false,
  className = "",
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("14-days");

  async function startBoost() {
    const listingIdText = String(listingId || "").trim();

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
          plan_id: selectedPlanId,
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
    <span className={`boostButtonWrap ${small ? "compact" : ""} ${className}`.trim()}>
      <span className="boostPlanGrid" aria-label="Choose boost length">
        {boostPlans.map((plan) => (
          <button
            type="button"
            key={plan.id}
            className={selectedPlanId === plan.id ? "selected" : ""}
            onClick={() => setSelectedPlanId(plan.id)}
            disabled={disabled || isLoading}
          >
            <strong>{plan.label}</strong>
            <em>{plan.price}</em>
            <small>{plan.note}</small>
          </button>
        ))}
      </span>

      <button
        type="button"
        className={small ? "boostButton small" : "boostButton"}
        onClick={startBoost}
        disabled={disabled || isLoading || !listingId}
      >
        <span>★</span>
        {isLoading ? "Opening checkout..." : label}
      </button>

      <small className="boostSmallPrint">
        Featured placement helps your car appear higher, but it does not guarantee a sale.
      </small>

      {errorMessage && <small className="boostError">{errorMessage}</small>}

      <style jsx>{`
        .boostButtonWrap {
          display: inline-flex;
          flex-direction: column;
          gap: 9px;
          width: min(100%, 380px);
        }

        .boostButtonWrap.compact {
          width: min(100%, 320px);
        }

        .boostPlanGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 7px;
          width: 100%;
        }

        .boostPlanGrid button {
          border: 1px solid #dce6f8;
          background: #ffffff;
          border-radius: 14px;
          padding: 10px 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          color: #101935;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
          transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
        }

        .boostPlanGrid button:hover:not(:disabled),
        .boostPlanGrid button.selected {
          border-color: #1247ff;
          box-shadow: 0 12px 24px rgba(18, 71, 255, 0.12);
          transform: translateY(-1px);
        }

        .boostPlanGrid button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .boostPlanGrid strong {
          font-size: 12px;
          font-weight: 950;
        }

        .boostPlanGrid em {
          font-style: normal;
          font-size: 15px;
          font-weight: 950;
          color: #1247ff;
        }

        .boostPlanGrid small {
          font-size: 10px;
          color: #6f7895;
          font-weight: 850;
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
          width: 100%;
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

        .boostSmallPrint {
          color: #6f7895;
          font-size: 11px;
          font-weight: 750;
          line-height: 1.4;
        }

        .boostError {
          color: #dc2626;
          font-weight: 850;
          line-height: 1.4;
        }

        @media (max-width: 520px) {
          .boostButtonWrap,
          .boostButtonWrap.compact {
            width: 100%;
          }

          .boostPlanGrid {
            grid-template-columns: 1fr;
          }

          .boostPlanGrid button {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
      `}</style>
    </span>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function SiteMenu({ currentUser, onLogout, unreadCount = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuUnreadCount, setMenuUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const suppliedUnreadCount = Number(unreadCount);
  const hasSuppliedUnreadCount =
    unreadCount !== null &&
    unreadCount !== undefined &&
    Number.isFinite(suppliedUnreadCount);
  const displayUnreadCount = hasSuppliedUnreadCount
    ? Math.max(0, suppliedUnreadCount)
    : menuUnreadCount;
  const unreadLabel = displayUnreadCount > 9 ? "9+" : String(displayUnreadCount);

  useEffect(() => {
    function handleClick(event) {
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setMenuUnreadCount(0);
      return;
    }

    if (hasSuppliedUnreadCount) return;

    let isMounted = true;

    async function loadUnreadCount() {
      const token = localStorage.getItem("kerbSessionToken");

      if (!token) {
        if (isMounted) setMenuUnreadCount(0);
        return;
      }

      try {
        const response = await fetch("/api/account", {
          headers: {
            "x-kerb-session-token": token,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not load unread messages.");
        }

        if (isMounted) {
          setMenuUnreadCount(Number(result.unread_total || 0));
        }
      } catch (error) {
        console.error("Kerb unread count error:", error);
        if (isMounted) setMenuUnreadCount(0);
      }
    }

    loadUnreadCount();

    window.addEventListener("kerb-message-change", loadUnreadCount);

    return () => {
      isMounted = false;
      window.removeEventListener("kerb-message-change", loadUnreadCount);
    };
  }, [currentUser, hasSuppliedUnreadCount]);

  function closeMenu() {
    setIsOpen(false);
  }

  function handleLogoutClick() {
    closeMenu();

    if (onLogout) onLogout();
  }

  return (
    <div className={isOpen ? "siteMenu open" : "siteMenu"} ref={menuRef}>
      <button
        className={isOpen ? "menuButton open" : "menuButton"}
        type="button"
        aria-label={
          displayUnreadCount > 0
            ? `${isOpen ? "Close" : "Open"} menu, ${displayUnreadCount} unread message${displayUnreadCount === 1 ? "" : "s"}`
            : isOpen
              ? "Close menu"
              : "Open menu"
        }
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="menuLines">
          <span />
          <span />
          <span />
        </span>
        {displayUnreadCount > 0 && (
          <strong className="menuButtonBadge">{unreadLabel}</strong>
        )}
      </button>

      {isOpen && (
        <>
          <button
            className="menuBackdrop"
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div className="menuPanel">
          <Link href="/browse" onClick={closeMenu}>
            Browse cars
          </Link>
          <Link href="/browse?category=newer-car" onClick={closeMenu}>
            New cars
          </Link>
          <Link href="/post-car" onClick={closeMenu}>
            Sell your car
          </Link>
          <Link href="/browse?category=electric-hybrid" onClick={closeMenu}>
            Electric
          </Link>
          <Link href="/browse?finance=true" onClick={closeMenu}>
            Finance
          </Link>
          <Link href="/#guides" onClick={closeMenu}>
            Guides
          </Link>
          <Link href="/safety" onClick={closeMenu}>
            Safety
          </Link>
          <Link
            href={currentUser ? "/account?tab=saved" : "/login"}
            onClick={closeMenu}
          >
            Saved cars
          </Link>

          <div className="menuDivider" />

          {currentUser ? (
            <>
              <Link href="/account?tab=messages" onClick={closeMenu}>
                <span>Messages</span>
                {displayUnreadCount > 0 && (
                  <strong className="menuBadge">{unreadLabel}</strong>
                )}
              </Link>
              <Link href="/account" onClick={closeMenu}>
                <span>My account</span>
                {displayUnreadCount > 0 && (
                  <strong className="menuBadge">{unreadLabel}</strong>
                )}
              </Link>
              <button type="button" onClick={handleLogoutClick}>
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={closeMenu}>
              Sign in
            </Link>
          )}

          <div className="menuDivider" />

          <Link href="/legal" onClick={closeMenu}>
            Legal hub
          </Link>
          <Link href="/terms" onClick={closeMenu}>
            Terms
          </Link>
          <Link href="/privacy" onClick={closeMenu}>
            Privacy
          </Link>
          <Link href="/cookies" onClick={closeMenu}>
            Cookies
          </Link>

          <Link href="/post-car" className="primaryMenuLink" onClick={closeMenu}>
            Post your car
          </Link>
          </div>
        </>
      )}

      <style jsx>{`
        .siteMenu {
          position: relative;
          z-index: 600;
          flex: 0 0 auto;
        }

        .menuBackdrop {
          display: none;
        }

        .menuButton {
          position: relative;
          width: 48px;
          height: 48px;
          border: 1px solid #dfe7f5;
          border-radius: 15px;
          background: #ffffff;
          color: #101832;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(14, 30, 70, 0.08);
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            border-color 0.18s ease;
        }

        .menuButton:hover {
          transform: translateY(-2px);
          border-color: #cfdcff;
          box-shadow: 0 14px 30px rgba(14, 30, 70, 0.12);
        }

        .menuLines {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .menuLines span {
          width: 20px;
          height: 2px;
          border-radius: 999px;
          background: currentColor;
          transition: transform 0.18s ease, opacity 0.18s ease;
        }

        .menuButton.open .menuLines span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .menuButton.open .menuLines span:nth-child(2) {
          opacity: 0;
        }

        .menuButton.open .menuLines span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        .menuButtonBadge,
        .menuBadge {
          min-width: 22px;
          height: 22px;
          border-radius: 999px;
          background: #d7193f;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 7px;
          font-size: 11px;
          font-weight: 950;
          line-height: 1;
        }

        .menuButtonBadge {
          position: absolute;
          top: -7px;
          right: -7px;
          border: 2px solid #ffffff;
          box-shadow: 0 8px 18px rgba(215, 25, 63, 0.22);
        }

        .menuPanel {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 270px;
          max-width: calc(100vw - 24px);
          border: 1px solid #dfe7f5;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 22px 60px rgba(13, 24, 52, 0.18);
          padding: 10px;
          display: grid;
          gap: 4px;
          backdrop-filter: blur(16px);
          animation: menuEnter 0.2s ease both;
        }

        .menuPanel a,
        .menuPanel button {
          width: 100%;
          border: none;
          border-radius: 13px;
          background: transparent;
          color: #172033;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 44px;
          padding: 0 14px;
          text-align: left;
          font: inherit;
          font-size: 14px;
          font-weight: 850;
          text-decoration: none;
          cursor: pointer;
        }

        .menuPanel a:hover,
        .menuPanel button:hover {
          background: #f2f5ff;
          color: #0048ff;
        }

        .menuDivider {
          height: 1px;
          background: #e6ebf4;
          margin: 6px 4px;
        }

        .menuPanel .primaryMenuLink {
          justify-content: center;
          background: #0048ff;
          color: #ffffff;
          margin-top: 6px;
          box-shadow: 0 10px 24px rgba(0, 72, 255, 0.2);
        }

        .menuPanel .primaryMenuLink:hover {
          background: #003ee0;
          color: #ffffff;
        }

        @keyframes menuEnter {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 700px) {
          .siteMenu {
            z-index: 900;
          }

          .menuButton {
            width: 46px;
            height: 46px;
            border-radius: 14px;
            position: relative;
            z-index: 902;
          }

          .menuBackdrop {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 900;
            border: 0;
            background: rgba(10, 18, 35, 0.18);
            backdrop-filter: blur(4px);
          }

          .menuPanel {
            position: fixed;
            top: 92px;
            left: 16px;
            right: 16px;
            width: auto;
            max-width: none;
            max-height: calc(100vh - 112px);
            overflow: auto;
            z-index: 901;
            border-radius: 22px;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}

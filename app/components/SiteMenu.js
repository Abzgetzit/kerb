"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function SiteMenu({ currentUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

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

  function closeMenu() {
    setIsOpen(false);
  }

  function handleLogoutClick() {
    closeMenu();

    if (onLogout) onLogout();
  }

  return (
    <div className="siteMenu" ref={menuRef}>
      <button
        className={isOpen ? "menuButton open" : "menuButton"}
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      {isOpen && (
        <div className="menuPanel">
          <Link href="/browse" onClick={closeMenu}>
            Browse cars
          </Link>
          <Link href="/browse?condition=new" onClick={closeMenu}>
            New cars
          </Link>
          <Link href="/post-car" onClick={closeMenu}>
            Sell your car
          </Link>
          <Link href="/browse?fuel=electric" onClick={closeMenu}>
            Electric
          </Link>
          <Link href="/browse?finance=true" onClick={closeMenu}>
            Finance
          </Link>
          <Link href="/#guides" onClick={closeMenu}>
            Guides
          </Link>
          <Link href={currentUser ? "/account" : "/login"} onClick={closeMenu}>
            Saved cars
          </Link>

          <div className="menuDivider" />

          {currentUser ? (
            <>
              <Link href="/account" onClick={closeMenu}>
                My account
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

          <Link href="/post-car" className="primaryMenuLink" onClick={closeMenu}>
            Post your car
          </Link>
        </div>
      )}

      <style jsx>{`
        .siteMenu {
          position: relative;
          z-index: 200;
          flex: 0 0 auto;
        }

        .menuButton {
          width: 48px;
          height: 48px;
          border: 1px solid #dfe7f5;
          border-radius: 15px;
          background: #ffffff;
          color: #101832;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(14, 30, 70, 0.08);
        }

        .menuButton span {
          width: 20px;
          height: 2px;
          border-radius: 999px;
          background: currentColor;
          transition: transform 0.18s ease, opacity 0.18s ease;
        }

        .menuButton.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .menuButton.open span:nth-child(2) {
          opacity: 0;
        }

        .menuButton.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
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

        @media (max-width: 700px) {
          .menuButton {
            width: 46px;
            height: 46px;
            border-radius: 14px;
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function SiteMenu({ currentUser, onLogout, unreadCount = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const count = Number(unreadCount || 0);
  const badge = count > 9 ? "9+" : String(count);

  useEffect(() => {
    function closeFromOutside(event) {
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      setIsOpen(false);
    }

    function closeFromKey(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", closeFromOutside);
    document.addEventListener("keydown", closeFromKey);

    return () => {
      document.removeEventListener("mousedown", closeFromOutside);
      document.removeEventListener("keydown", closeFromKey);
    };
  }, []);

  function closeMenu() {
    setIsOpen(false);
  }

  function logout() {
    closeMenu();
    if (onLogout) onLogout();
  }

  return (
    <div className="siteMenu" ref={menuRef}>
      <button
        type="button"
        className={isOpen ? "menuButton open" : "menuButton"}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <span /><span /><span />
        {count > 0 && <strong>{badge}</strong>}
      </button>

      {isOpen && (
        <>
          <button className="backdrop" type="button" aria-label="Close menu" onClick={closeMenu} />
          <nav className="panel">
            <Link href="/browse" onClick={closeMenu}>Browse cars</Link>
            <Link href="/new-cars" onClick={closeMenu}>New cars</Link>
            <Link href="/sell-car" onClick={closeMenu}>Sell your car</Link>
            <Link href="/electric-cars" onClick={closeMenu}>Electric cars</Link>
            <Link href="/cars-on-finance" onClick={closeMenu}>Cars with finance available</Link>
            <Link href="/guides" onClick={closeMenu}>Guides</Link>
            <Link href="/guides/how-to-sell-your-car" onClick={closeMenu}>How to sell your car</Link>
            <Link href="/guides/buying-a-used-car-safely" onClick={closeMenu}>Buying safely</Link>
            <Link href="/safety" onClick={closeMenu}>Safety</Link>
            <Link href="/contact" onClick={closeMenu}>Contact Kerb Car support</Link>
            <Link href={currentUser ? "/account?tab=saved" : "/login"} onClick={closeMenu}>Saved cars</Link>

            <div className="line" />

            {currentUser ? (
              <>
                <Link href="/account?tab=messages" onClick={closeMenu}>Messages {count > 0 && <em>{badge}</em>}</Link>
                <Link href="/account" onClick={closeMenu}>My account</Link>
                <button type="button" onClick={logout}>Log out</button>
              </>
            ) : (
              <Link href="/login" onClick={closeMenu}>Sign in</Link>
            )}

            <div className="line" />

            <Link href="/legal" onClick={closeMenu}>Legal hub</Link>
            <Link href="/terms" onClick={closeMenu}>Terms</Link>
            <Link href="/privacy" onClick={closeMenu}>Privacy</Link>
            <Link href="/cookies" onClick={closeMenu}>Cookies</Link>
            <Link href="/sell-car" className="primary" onClick={closeMenu}>Start selling</Link>
          </nav>
        </>
      )}

      <style jsx>{`
        .siteMenu { position: relative; z-index: 800; flex: 0 0 auto; }
        .menuButton { position: relative; width: 48px; height: 48px; border: 1px solid #dfe7f5; border-radius: 15px; background: #fff; color: #101832; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; cursor: pointer; box-shadow: 0 10px 24px rgba(14, 30, 70, 0.08); }
        .menuButton span { width: 20px; height: 2px; border-radius: 999px; background: currentColor; transition: transform .18s ease, opacity .18s ease; }
        .menuButton.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .menuButton.open span:nth-child(2) { opacity: 0; }
        .menuButton.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .menuButton strong, .panel em { min-width: 22px; height: 22px; border-radius: 999px; background: #d7193f; color: #fff; display: inline-flex; align-items: center; justify-content: center; padding: 0 7px; font-size: 11px; font-style: normal; font-weight: 950; }
        .menuButton strong { position: absolute; top: -7px; right: -7px; border: 2px solid #fff; }
        .backdrop { display: none; }
        .panel { position: absolute; top: calc(100% + 12px); right: 0; width: 290px; max-width: calc(100vw - 24px); border: 1px solid #dfe7f5; border-radius: 20px; background: rgba(255,255,255,.98); box-shadow: 0 22px 60px rgba(13,24,52,.18); padding: 10px; display: grid; gap: 4px; backdrop-filter: blur(16px); }
        .panel a, .panel button { width: 100%; border: none; border-radius: 13px; background: transparent; color: #172033; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 13px; text-decoration: none; font: inherit; font-weight: 900; cursor: pointer; text-align: left; }
        .panel a:hover, .panel button:hover { background: #f1f5ff; color: #0048ff; }
        .panel .primary { justify-content: center; background: #0048ff; color: #fff; margin-top: 4px; }
        .panel .primary:hover { background: #003ee0; color: #fff; }
        .line { height: 1px; background: #e7edf8; margin: 6px 4px; }
        @media (max-width: 760px) { .backdrop { display: block; position: fixed; inset: 0; background: rgba(9,18,40,.28); } .panel { position: fixed; top: 84px; right: 14px; left: 14px; width: auto; max-height: calc(100vh - 110px); overflow: auto; } }
      `}</style>
    </div>
  );
}

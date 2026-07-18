"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

function formatCount(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? new Intl.NumberFormat("en-GB").format(amount) : "0";
}

function getListingViews(listing) {
  return Number(listing?.analytics?.view_count ?? listing?.view_count ?? 0) || 0;
}

function Icon({ name }) {
  const paths = {
    listings: <><path d="M5 5h14v14H5z" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
    messages: <path d="M4 5h16v12H8l-4 4V5z" />,
    saved: <path d="M12 21 4.8 13.8a5 5 0 0 1 7.1-7.1L12 6.8l.1-.1a5 5 0 1 1 7.1 7.1L12 21z" />,
    boosts: <path d="m12 3 2.4 5.2L20 9l-4 3.9.9 5.6L12 16l-4.9 2.5.9-5.6L4 9l5.6-.8L12 3z" />,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    car: <path d="M5 16h14M7 16l1.2-4.4A3 3 0 0 1 11.1 9h1.8a3 3 0 0 1 2.9 2.6L17 16M7 16v2M17 16v2" />,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M14 4h6v16h-6" /></>,
    back: <path d="m15 18-6-6 6-6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg className="kerbMobileAccountIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.chevron}
    </svg>
  );
}

export default function MobileAccountCompact() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState("");

  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    const active = pathname === "/account" && isMobile;
    document.body.classList.toggle("kerbMobileAccountMode", active);

    if (!active) {
      document.body.classList.remove("kerbMobileAccountSectionOpen");
      setOpenSection("");
      return undefined;
    }

    let cancelled = false;
    const token = localStorage.getItem("kerbSessionToken");

    if (!token) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    fetch("/api/account", {
      headers: { "x-kerb-session-token": token },
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not load account.");
        return payload;
      })
      .then((payload) => {
        if (!cancelled) setAccountData(payload);
      })
      .catch(() => {
        if (!cancelled) setAccountData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      document.body.classList.remove("kerbMobileAccountMode", "kerbMobileAccountSectionOpen");
    };
  }, [pathname, isMobile]);

  const stats = useMemo(() => {
    const listings = accountData?.my_listings || [];
    return {
      listings: listings.length,
      views: listings.reduce((total, listing) => total + getListingViews(listing), 0),
      saved: accountData?.saved_listings?.length || 0,
      unread: accountData?.unread_total || 0,
      messages: accountData?.message_count || accountData?.messages?.length || 0,
      sent: accountData?.sent_enquiries?.length || 0,
      received: accountData?.received_enquiries?.length || 0,
      boosts: accountData?.boost_history?.length || 0,
    };
  }, [accountData]);

  if (pathname !== "/account" || !isMobile) return null;

  const account = accountData?.account || {};
  const accountName = account.full_name || account.name || accountData?.name || "My account";
  const accountEmail = account.email || accountData?.email || "";

  function clickOriginalTab(tabName) {
    const buttons = [...document.querySelectorAll("main.page .tabs button")];
    const labels = {
      messages: "Messages",
      listings: "My listings",
      boosts: "Boosts",
      saved: "Saved cars",
      settings: "Settings",
    };
    const button = buttons.find((item) => item.textContent.trim().startsWith(labels[tabName]));
    button?.click();
  }

  function openTab(tabName, label) {
    clickOriginalTab(tabName);
    setOpenSection(label);
    document.body.classList.add("kerbMobileAccountSectionOpen");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function closeSection() {
    setOpenSection("");
    document.body.classList.remove("kerbMobileAccountSectionOpen");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function logout() {
    localStorage.removeItem("kerbSessionToken");
    localStorage.removeItem("kerbAccountEmail");
    localStorage.removeItem("kerbUser");
    window.dispatchEvent(new Event("kerb-auth-change"));
    window.location.href = "/";
  }

  return (
    <>
      {openSection ? (
        <header className="kerbMobileAccountSectionHeader">
          <button type="button" onClick={closeSection} aria-label="Back to account menu"><Icon name="back" /></button>
          <div><span>My account</span><strong>{openSection}</strong></div>
          <a href="/">Kerb</a>
        </header>
      ) : (
        <section className="kerbMobileAccountHome">
          <header className="kerbMobileAccountTopbar">
            <a href="/" className="kerbMobileAccountLogo">Kerb</a>
            <a href="/post-car" className="kerbMobileAccountPost"><Icon name="plus" />Post car</a>
          </header>

          <div className="kerbMobileAccountProfile">
            <div className="kerbMobileAccountAvatar">{String(accountName).charAt(0).toUpperCase()}</div>
            <div><strong>{accountName}</strong><span>{accountEmail}</span></div>
          </div>

          <div className="kerbMobileAccountStats" aria-label="Account summary">
            <button type="button" onClick={() => openTab("listings", "My listings")}><span>Listings</span><strong>{formatCount(stats.listings)}</strong></button>
            <button type="button" onClick={() => openTab("listings", "My listings")}><span>Views</span><strong>{formatCount(stats.views)}</strong></button>
            <button type="button" onClick={() => openTab("saved", "Saved cars")}><span>Saved</span><strong>{formatCount(stats.saved)}</strong></button>
            <button type="button" onClick={() => openTab("messages", "Messages")}><span>Unread</span><strong>{formatCount(stats.unread)}</strong></button>
          </div>

          <div className="kerbMobileAccountGroups">
            <section>
              <h2>Buying &amp; selling</h2>
              <button type="button" onClick={() => openTab("listings", "My listings")}><Icon name="listings" /><span><strong>My listings</strong><small>{stats.listings} total · {stats.views} views</small></span><b>{stats.listings}</b><Icon name="chevron" /></button>
              <button type="button" onClick={() => openTab("messages", "Messages")}><Icon name="messages" /><span><strong>Messages and enquiries</strong><small>{stats.sent} sent · {stats.received} received</small></span>{stats.unread > 0 && <b className="alert">{stats.unread}</b>}<Icon name="chevron" /></button>
              <button type="button" onClick={() => openTab("saved", "Saved cars")}><Icon name="saved" /><span><strong>Saved cars</strong><small>Cars kept for later</small></span><b>{stats.saved}</b><Icon name="chevron" /></button>
              <button type="button" onClick={() => openTab("boosts", "Boosts")}><Icon name="boosts" /><span><strong>Boosts and payments</strong><small>Manage priority placement</small></span><b>{stats.boosts}</b><Icon name="chevron" /></button>
            </section>

            <section>
              <h2>Account</h2>
              <button type="button" onClick={() => openTab("settings", "Personal details")}><Icon name="settings" /><span><strong>Personal details</strong><small>Name, phone and privacy</small></span><Icon name="chevron" /></button>
              <a href="/post-car"><Icon name="plus" /><span><strong>Post a car</strong><small>Create a standard or bid listing</small></span><Icon name="chevron" /></a>
              <a href="/browse"><Icon name="car" /><span><strong>Browse cars</strong><small>Find cars currently for sale</small></span><Icon name="chevron" /></a>
              <button type="button" onClick={logout} className="logout"><Icon name="logout" /><span><strong>Log out</strong><small>Sign out of this device</small></span><Icon name="chevron" /></button>
            </section>
          </div>

          {loading && <div className="kerbMobileAccountLoading">Refreshing your account…</div>}
        </section>
      )}

      <style>{styles}</style>
    </>
  );
}

const styles = `
  .kerbMobileAccountHome,.kerbMobileAccountSectionHeader{display:none}
  @media(max-width:700px){
    body.kerbMobileAccountMode{background:#f7f9fd!important}
    body.kerbMobileAccountMode main.page{min-height:0!important;padding:0 14px 28px!important;background:#f7f9fd!important}
    body.kerbMobileAccountMode main.page>.navbar,
    body.kerbMobileAccountMode main.page>.hero,
    body.kerbMobileAccountMode main.page>.statusSummary,
    body.kerbMobileAccountMode main.page>.tabs{display:none!important}
    body.kerbMobileAccountMode:not(.kerbMobileAccountSectionOpen) main.page>*{display:none!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page>.overviewGrid{display:none!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page>.contentSection,
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page>.cardsGrid{margin-top:12px!important}
    .kerbMobileAccountHome{display:block;min-height:100svh;background:#f7f9fd;padding:12px 14px calc(30px + env(safe-area-inset-bottom));font-family:Inter,Arial,sans-serif;color:#071126}
    .kerbMobileAccountTopbar{height:54px;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .kerbMobileAccountLogo{color:#0048ff!important;font-size:32px;font-weight:950;letter-spacing:-1.6px;text-decoration:none}
    .kerbMobileAccountPost{height:40px;border-radius:12px;background:#0048ff;color:#fff!important;padding:0 13px;display:inline-flex;align-items:center;gap:7px;text-decoration:none;font-size:13px;font-weight:950}
    .kerbMobileAccountIcon{width:19px;height:19px;flex:0 0 auto}
    .kerbMobileAccountProfile{margin-top:8px;border:1px solid #e1e8f4;background:#fff;border-radius:18px;padding:14px;display:flex;align-items:center;gap:12px;box-shadow:0 10px 25px rgba(20,35,70,.045)}
    .kerbMobileAccountAvatar{width:46px;height:46px;border-radius:15px;background:#eaf1ff;color:#0048ff;display:grid;place-items:center;font-size:22px;font-weight:950;flex:0 0 auto}
    .kerbMobileAccountProfile>div:last-child{display:grid;gap:2px;min-width:0}
    .kerbMobileAccountProfile strong{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .kerbMobileAccountProfile span{font-size:12px;color:#657189;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .kerbMobileAccountStats{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:10px 0}
    .kerbMobileAccountStats button{min-width:0;border:1px solid #e1e8f4;border-radius:14px;background:#fff;padding:10px 5px;text-align:center;display:grid;gap:3px;box-shadow:none}
    .kerbMobileAccountStats span{font-size:10px;color:#68758c;font-weight:850}
    .kerbMobileAccountStats strong{font-size:19px;color:#0048ff}
    .kerbMobileAccountGroups{display:grid;gap:10px}
    .kerbMobileAccountGroups section{border:1px solid #e1e8f4;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 25px rgba(20,35,70,.04)}
    .kerbMobileAccountGroups h2{margin:0!important;padding:13px 14px 8px!important;font-size:14px!important;letter-spacing:0!important;color:#35415a}
    .kerbMobileAccountGroups button,.kerbMobileAccountGroups a{width:100%;min-height:58px;border:0;border-top:1px solid #edf1f7;background:#fff;padding:9px 12px;display:grid;grid-template-columns:32px minmax(0,1fr) auto 18px;gap:9px;align-items:center;text-align:left;text-decoration:none;color:#071126}
    .kerbMobileAccountGroups section>*:nth-child(2){border-top:0}
    .kerbMobileAccountGroups button>.kerbMobileAccountIcon:first-child,.kerbMobileAccountGroups a>.kerbMobileAccountIcon:first-child{width:31px;height:31px;border-radius:10px;background:#eef4ff;color:#0048ff;padding:7px}
    .kerbMobileAccountGroups button>span,.kerbMobileAccountGroups a>span{display:grid;gap:2px;min-width:0}
    .kerbMobileAccountGroups strong{font-size:14px}
    .kerbMobileAccountGroups small{font-size:10px;color:#6b778d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .kerbMobileAccountGroups b{min-width:23px;height:23px;border-radius:999px;background:#eef3ff;color:#0048ff;display:grid;place-items:center;padding:0 6px;font-size:11px}
    .kerbMobileAccountGroups b.alert{background:#d7193f;color:#fff}
    .kerbMobileAccountGroups .logout strong{color:#b42318}
    .kerbMobileAccountGroups .logout>.kerbMobileAccountIcon:first-child{background:#fff1f1;color:#b42318}
    .kerbMobileAccountLoading{text-align:center;color:#68758c;font-size:11px;padding:12px}
    .kerbMobileAccountSectionHeader{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:10px;position:sticky;top:0;z-index:200;height:66px;padding:8px 14px;background:rgba(255,255,255,.96);border-bottom:1px solid #e1e8f4;backdrop-filter:blur(14px);font-family:Inter,Arial,sans-serif}
    .kerbMobileAccountSectionHeader button{width:40px;height:40px;border:1px solid #e1e8f4;border-radius:12px;background:#fff;color:#071126;display:grid;place-items:center}
    .kerbMobileAccountSectionHeader>div{display:grid;gap:1px;min-width:0}
    .kerbMobileAccountSectionHeader span{font-size:10px;color:#68758c;font-weight:850}
    .kerbMobileAccountSectionHeader strong{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .kerbMobileAccountSectionHeader>a{color:#0048ff!important;font-size:23px;font-weight:950;letter-spacing:-1px;text-decoration:none}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .panel,
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .contentSection,
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .card{border-radius:18px!important;padding:16px!important}
    body.kerbMobileAccountMode.kerbMobileAccountSectionOpen main.page .sectionHeader h2{font-size:25px!important}
  }
`;

import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BoostCancelPage({ searchParams }) {
  const listingId = String(searchParams?.listing_id || "").trim();

  return (
    <main className="page">
      <section className="card">
        <Link href="/" className="logo">
          Kerb
        </Link>

        <div className="pill">Boost not completed</div>
        <h1>Your listing is still live</h1>
        <p>
          Stripe checkout was cancelled or closed before payment was confirmed.
          Your advert remains live on Kerb, but no paid boost has been applied.
        </p>

        <div className="noteBox">
          You can start a boost again from My Account or from the owner controls
          on your listing page.
        </div>

        <div className="actions">
          {listingId && <Link href={`/listing/${listingId}`}>View listing</Link>}
          <Link href="/account?tab=listings">My listings</Link>
          <Link href="/browse">Browse cars</Link>
        </div>
      </section>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  body { margin: 0; background: #f7f9fd; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #10162f; }
  a { color: inherit; text-decoration: none; }
  .page { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at top left, rgba(11,75,255,.08), transparent 34%), #f7f9fd; }
  .card { width: min(620px, 100%); background: white; border: 1px solid #fed7aa; border-radius: 30px; padding: 34px; box-shadow: 0 24px 60px rgba(19,34,79,.09); }
  .logo { color: #0b4bff; font-size: 42px; font-weight: 1000; letter-spacing: -0.08em; }
  .pill { display: inline-flex; margin-top: 24px; border-radius: 999px; background: #fff7ed; color: #c2410c; padding: 8px 12px; font-weight: 950; font-size: 13px; }
  h1 { margin: 14px 0 10px; font-size: clamp(34px, 6vw, 58px); letter-spacing: -0.06em; line-height: .95; }
  p { color: #66708d; line-height: 1.65; font-weight: 700; margin: 0; }
  .noteBox { margin-top: 18px; background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; border-radius: 18px; padding: 14px 16px; font-size: 14px; font-weight: 850; line-height: 1.55; }
  .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
  .actions a { border-radius: 16px; padding: 14px 18px; font-weight: 950; border: 1px solid #dfe7f7; }
  .actions a:first-child { background: #0b4bff; color: white; border-color: #0b4bff; }
`;

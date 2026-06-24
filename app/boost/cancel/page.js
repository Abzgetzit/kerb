import Link from "next/link";

export default function BoostSuccessPage() {
  return (
    <main className="page">
      <section className="card">
        <Link href="/" className="logo">
          Kerb
        </Link>

        <div className="pill">Boost payment received</div>
        <h1>Your listing boost is being applied</h1>
        <p>
          Thanks — once Stripe confirms the payment webhook, your listing will be
          marked as featured and can appear higher in Kerb browse results.
        </p>

        <div className="actions">
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
  .card { width: min(620px, 100%); background: white; border: 1px solid #dfe7f7; border-radius: 30px; padding: 34px; box-shadow: 0 24px 60px rgba(19,34,79,.09); }
  .logo { color: #0b4bff; font-size: 42px; font-weight: 1000; letter-spacing: -0.08em; }
  .pill { display: inline-flex; margin-top: 24px; border-radius: 999px; background: #eaf1ff; color: #0b4bff; padding: 8px 12px; font-weight: 950; font-size: 13px; }
  h1 { margin: 14px 0 10px; font-size: clamp(34px, 6vw, 58px); letter-spacing: -0.06em; line-height: .95; }
  p { color: #66708d; line-height: 1.65; font-weight: 700; }
  .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
  .actions a { border-radius: 16px; padding: 14px 18px; font-weight: 950; border: 1px solid #dfe7f7; }
  .actions a:first-child { background: #0b4bff; color: white; border-color: #0b4bff; }
`;

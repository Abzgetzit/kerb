import Link from "next/link";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

async function getSessionStatus(sessionId) {
  const cleanSessionId = String(sessionId || "").trim();

  if (!cleanSessionId) {
    return {
      state: "missing",
      title: "Boost payment not completed",
      pill: "No payment confirmed",
      text:
        "No Stripe checkout session was found on this page. Your listing has not been boosted from this visit.",
      listingId: "",
      checkoutUrl: "",
    };
  }

  if (!stripe) {
    return {
      state: "unknown",
      title: "Boost status needs checking",
      pill: "Stripe not configured",
      text:
        "Stripe is not configured on this deployment, so Kerb could not confirm whether this boost payment was completed.",
      listingId: "",
      checkoutUrl: "",
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(cleanSessionId);
    const paymentStatus = String(session.payment_status || "").toLowerCase();
    const checkoutStatus = String(session.status || "").toLowerCase();
    const listingId =
      session.metadata?.listing_id || session.client_reference_id || "";

    if (paymentStatus === "paid" || paymentStatus === "no_payment_required") {
      return {
        state: "paid",
        title: "Your listing boost is being applied",
        pill: "Payment confirmed",
        text:
          "Stripe has confirmed your payment. The webhook will mark your listing as boosted and it can appear higher in Kerb browse results.",
        listingId,
        checkoutUrl: "",
      };
    }

    if (checkoutStatus === "open") {
      return {
        state: "open",
        title: "Boost payment not completed",
        pill: "Payment still open",
        text:
          "You opened the Stripe checkout but the payment has not been completed yet. Your listing has not been boosted.",
        listingId,
        checkoutUrl: session.url || "",
      };
    }

    return {
      state: "unpaid",
      title: "Boost payment not completed",
      pill: "No payment taken",
      text:
        "Stripe has not confirmed a paid checkout for this boost. Your listing has not been boosted from this attempt.",
      listingId,
      checkoutUrl: "",
    };
  } catch {
    return {
      state: "error",
      title: "Boost status could not be checked",
      pill: "Could not verify payment",
      text:
        "Kerb could not verify this checkout session. Check your Stripe dashboard or try starting the boost again from My Account.",
      listingId: "",
      checkoutUrl: "",
    };
  }
}

export default async function BoostSuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id || "";
  const status = await getSessionStatus(sessionId);
  const isPaid = status.state === "paid";

  return (
    <main className="page">
      <section className={isPaid ? "card paid" : "card warning"}>
        <Link href="/" className="logo">
          Kerb
        </Link>

        <div className="pill">{status.pill}</div>
        <h1>{status.title}</h1>
        <p>{status.text}</p>

        {!isPaid && (
          <div className="noteBox">
            Testing note: going back from Stripe or typing this URL yourself does
            not count as a paid boost. Only a completed Stripe payment and webhook
            should activate the boost.
          </div>
        )}

        <div className="actions">
          <Link href="/account?tab=listings">My listings</Link>

          {status.listingId && (
            <Link href={`/listing/${status.listingId}`}>View listing</Link>
          )}

          {status.checkoutUrl && <a href={status.checkoutUrl}>Return to checkout</a>}

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
  .card { width: min(680px, 100%); background: white; border: 1px solid #dfe7f7; border-radius: 30px; padding: 34px; box-shadow: 0 24px 60px rgba(19,34,79,.09); }
  .card.warning { border-color: #fed7aa; }
  .card.paid { border-color: #bfdbfe; }
  .logo { color: #0b4bff; font-size: 42px; font-weight: 1000; letter-spacing: -0.08em; }
  .pill { display: inline-flex; margin-top: 24px; border-radius: 999px; background: #eaf1ff; color: #0b4bff; padding: 8px 12px; font-weight: 950; font-size: 13px; }
  .warning .pill { background: #fff7ed; color: #c2410c; }
  h1 { margin: 14px 0 10px; font-size: clamp(34px, 6vw, 58px); letter-spacing: -0.06em; line-height: .95; }
  p { color: #66708d; line-height: 1.65; font-weight: 700; margin: 0; }
  .noteBox { margin-top: 18px; background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; border-radius: 18px; padding: 14px 16px; font-size: 14px; font-weight: 850; line-height: 1.55; }
  .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
  .actions a { border-radius: 16px; padding: 14px 18px; font-weight: 950; border: 1px solid #dfe7f7; }
  .actions a:first-child { background: #0b4bff; color: white; border-color: #0b4bff; }
`;

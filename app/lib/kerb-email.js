import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.KERB_FROM_EMAIL || "Kerb <onboarding@resend.dev>";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function getSiteUrl(request) {
  const origin = request?.headers?.get("origin");
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return String(configuredUrl || origin || "https://kerb-ten.vercel.app")
    .trim()
    .replace(/\/$/, "");
}

export function getListingTitle(listing) {
  const generatedTitle = [
    listing?.year,
    listing?.make,
    listing?.model,
    listing?.variant,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return listing?.title || generatedTitle || "your Kerb listing";
}

export async function sendKerbEmail({ to, subject, html, replyTo }) {
  if (!resend || !to) {
    return {
      sent: false,
      skipped: true,
      error: !to ? "Missing recipient email." : "RESEND_API_KEY is not set.",
    };
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      replyTo,
    });

    return { sent: true, skipped: false, error: "" };
  } catch (error) {
    console.error("Kerb email error:", error);

    return {
      sent: false,
      skipped: false,
      error: error?.message || "Email could not be sent.",
    };
  }
}

function emailShell({ title, body, buttonText, buttonUrl, footnote }) {
  return `
    <div style="font-family: Arial, sans-serif; background:#f6f8fc; padding:28px;">
      <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:18px; padding:28px; border:1px solid #e5eaf4;">
        <div style="font-size:28px; font-weight:900; color:#0048ff; letter-spacing:-1px; margin-bottom:24px;">Kerb</div>
        <h1 style="margin:0 0 12px; color:#071126; font-size:26px; line-height:1.18;">${title}</h1>
        <div style="color:#59657a; line-height:1.65; font-size:15px;">${body}</div>
        ${
          buttonUrl
            ? `<a href="${escapeHtml(buttonUrl)}" style="display:inline-block; background:#0048ff; color:#ffffff; text-decoration:none; padding:14px 20px; border-radius:12px; font-weight:bold; margin-top:22px;">${escapeHtml(buttonText || "Open Kerb")}</a>`
            : ""
        }
        <p style="margin:24px 0 0; color:#7a8499; font-size:13px; line-height:1.5;">
          ${escapeHtml(footnote || "Thanks for using Kerb.")}
        </p>
      </div>
    </div>
  `;
}

export function createAccountWelcomeEmail({ name, siteUrl }) {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi,";

  return emailShell({
    title: "Welcome to Kerb",
    body: `
      <p style="margin:0 0 14px;">${greeting}</p>
      <p style="margin:0 0 14px;">Your Kerb account has been created. You can now post cars, manage your listings and message sellers from one account.</p>
      <p style="margin:0;">Kerb is a marketplace, so buyers and sellers speak directly with each other.</p>
    `,
    buttonText: "Go to my account",
    buttonUrl: `${siteUrl}/account`,
  });
}

export function createListingSubmittedEmail({ listing, siteUrl }) {
  const title = escapeHtml(getListingTitle(listing));

  return emailShell({
    title: "Your listing has been received",
    body: `
      <p style="margin:0 0 14px;">We have saved your listing for <strong>${title}</strong>.</p>
      <p style="margin:0 0 14px;">It is currently pending review. Once it is approved, it will appear publicly on Kerb.</p>
      <p style="margin:0;">You can view and manage your listings from your account dashboard.</p>
    `,
    buttonText: "Open my account",
    buttonUrl: `${siteUrl}/account`,
  });
}

export function createListingLiveEmail({ listing, siteUrl }) {
  const listingTitle = escapeHtml(getListingTitle(listing));
  const listingUrl = `${siteUrl}/listing/${listing.id}`;

  return emailShell({
    title: "Your listing is now live",
    body: `
      <p style="margin:0 0 14px;">Good news. Your listing for <strong>${listingTitle}</strong> has been approved and is now live on Kerb.</p>
      <p style="margin:0;">Buyers can now view the car and send enquiries directly to you.</p>
    `,
    buttonText: "View listing",
    buttonUrl: listingUrl,
  });
}

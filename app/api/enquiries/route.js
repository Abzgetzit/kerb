import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.KERB_FROM_EMAIL || "Kerb <hello@kerbcar.co.uk>";

export const runtime = "nodejs";

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function clean(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getListingTitle(listing) {
  return [
    listing?.year,
    listing?.make,
    listing?.model,
    listing?.model_detail,
    listing?.variant,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getMessagePreview(message) {
  const text = clean(message).replace(/\s+/g, " ");

  return text.length > 220 ? `${text.slice(0, 217)}...` : text;
}

function getSiteUrl(request) {
  return String(
    process.env.NEXT_PUBLIC_KERB_SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get("origin") ||
      "https://kerbcar.co.uk"
  )
    .trim()
    .replace(/\/$/, "");
}

function createSellerEmailHtml({
  buyerName,
  buyerEmail,
  buyerPhone,
  message,
  listingTitle,
  conversationUrl,
}) {
  return `
    <div style="font-family: Arial, sans-serif; background:#f6f8fc; padding:28px;">
      <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:18px; padding:28px; border:1px solid #e5eaf4;">
        <h1 style="margin:0 0 12px; color:#071126; font-size:26px;">New enquiry on Kerb</h1>

        <p style="margin:0 0 22px; color:#59657a; line-height:1.6;">
          Someone has sent an enquiry about <strong>${escapeHtml(listingTitle)}</strong>.
        </p>

        <div style="background:#f7f9fd; border:1px solid #e5eaf4; border-radius:14px; padding:18px; margin-bottom:18px;">
          <p style="margin:0 0 8px;"><strong>Buyer name:</strong> ${escapeHtml(buyerName || "Not provided")}</p>
          <p style="margin:0 0 8px;"><strong>Buyer email:</strong> ${escapeHtml(buyerEmail)}</p>
          <p style="margin:0;"><strong>Buyer phone:</strong> ${escapeHtml(buyerPhone || "Not provided")}</p>
        </div>

        <div style="background:#f7f9fd; border:1px solid #e5eaf4; border-radius:14px; padding:18px; margin-bottom:22px;">
          <p style="margin:0 0 8px;"><strong>Message:</strong></p>
          <p style="margin:0; color:#172033; line-height:1.6;">${escapeHtml(message)}</p>
        </div>

        <a href="${escapeHtml(conversationUrl)}" style="display:inline-block; background:#0048ff; color:#ffffff; text-decoration:none; padding:14px 20px; border-radius:12px; font-weight:bold;">
          Open conversation
        </a>

        <p style="margin:24px 0 0; color:#7a8499; font-size:13px;">
          You can reply from your Kerb account, or contact the buyer using their details above.
        </p>
      </div>
    </div>
  `;
}

function createBuyerEmailHtml({ buyerName, listingTitle, conversationUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; background:#f6f8fc; padding:28px;">
      <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:18px; padding:28px; border:1px solid #e5eaf4;">
        <h1 style="margin:0 0 12px; color:#071126; font-size:26px;">Your enquiry has been sent</h1>

        <p style="margin:0 0 18px; color:#59657a; line-height:1.6;">
          Hi ${escapeHtml(buyerName)}, your enquiry about <strong>${escapeHtml(listingTitle)}</strong> has been sent to the seller.
        </p>

        <p style="margin:0 0 22px; color:#59657a; line-height:1.6;">
          The seller can now reply in your Kerb conversation.
        </p>

        <a href="${escapeHtml(conversationUrl)}" style="display:inline-block; background:#0048ff; color:#ffffff; text-decoration:none; padding:14px 20px; border-radius:12px; font-weight:bold;">
          Open conversation
        </a>

        <p style="margin:24px 0 0; color:#7a8499; font-size:13px;">
          Thanks for using Kerb.
        </p>
      </div>
    </div>
  `;
}

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const listingId = clean(body.listing_id);
  const buyerName = clean(body.buyer_name);
  const buyerEmail = clean(body.buyer_email);
  const buyerPhone = clean(body.buyer_phone);
  const message = clean(body.message);

  if (!listingId) {
    return NextResponse.json(
      { error: "Listing ID is required." },
      { status: 400 }
    );
  }

  if (!buyerName) {
    return NextResponse.json(
      { error: "Your name is required." },
      { status: 400 }
    );
  }

  if (!buyerEmail || !buyerEmail.includes("@")) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  if (!message) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  if (message.length < 8) {
    return NextResponse.json(
      { error: "Please write a little more detail in your message." },
      { status: 400 }
    );
  }

  if (message.length > 1200) {
    return NextResponse.json(
      { error: "Please keep your message under 1,200 characters." },
      { status: 400 }
    );
  }

  const { data: listing, error: listingError } = await supabase
    .from("kerb_listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return NextResponse.json(
      { error: "Listing could not be found." },
      { status: 404 }
    );
  }

  const listingTitle =
    listing.title || getListingTitle(listing) || "Kerb listing";

  const sellerEmail = clean(listing.seller_email);
  const sellerPhone = clean(listing.seller_phone);
  const now = new Date().toISOString();
  const messagePreview = getMessagePreview(message);
  let reusedExistingEnquiry = false;
  let enquiry = null;

  const { data: existingEnquiries, error: existingEnquiryError } = await supabase
    .from("kerb_enquiries")
    .select("*")
    .eq("listing_id", listingId)
    .ilike("buyer_email", buyerEmail)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingEnquiryError) {
    return NextResponse.json(
      { error: existingEnquiryError.message },
      { status: 500 }
    );
  }

  const existingEnquiry = existingEnquiries?.[0] || null;

  if (existingEnquiry) {
    reusedExistingEnquiry = true;

    const { error: messageError } = await supabase
      .from("kerb_enquiry_messages")
      .insert({
        enquiry_id: existingEnquiry.id,
        sender_role: "buyer",
        sender_email: buyerEmail,
        sender_name: buyerName,
        message,
        created_at: now,
      });

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 500 });
    }

    const { data: updatedEnquiry, error: updateError } = await supabase
      .from("kerb_enquiries")
      .update({
        buyer_name: buyerName,
        buyer_phone: buyerPhone || null,
        message,
        seller_email: sellerEmail || null,
        seller_phone: sellerPhone || null,
        listing_title: listingTitle,
        status: "new",
        last_message_at: now,
        last_message_preview: messagePreview,
        last_message_sender_role: "buyer",
        buyer_last_read_at: now,
        seller_last_read_at: null,
      })
      .eq("id", existingEnquiry.id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    enquiry = updatedEnquiry;
  } else {
    const { data: newEnquiry, error: enquiryError } = await supabase
      .from("kerb_enquiries")
      .insert({
        listing_id: listingId,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone || null,
        message,
        seller_email: sellerEmail || null,
        seller_phone: sellerPhone || null,
        listing_title: listingTitle,
        status: "new",
        last_message_at: now,
        last_message_preview: messagePreview,
        last_message_sender_role: "buyer",
        buyer_last_read_at: now,
        seller_last_read_at: null,
      })
      .select("*")
      .single();

    if (enquiryError) {
      return NextResponse.json({ error: enquiryError.message }, { status: 500 });
    }

    const { error: messageError } = await supabase
      .from("kerb_enquiry_messages")
      .insert({
        enquiry_id: newEnquiry.id,
        sender_role: "buyer",
        sender_email: buyerEmail,
        sender_name: buyerName,
        message,
        created_at: newEnquiry.created_at || now,
      });

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 500 });
    }

    enquiry = newEnquiry;
  }

  const siteUrl = getSiteUrl(request);
  const conversationUrl = `${siteUrl}/enquiries/${enquiry.id}`;

  const emailResults = {
    seller_email_sent: false,
    buyer_email_sent: false,
    seller_email_error: "",
    buyer_email_error: "",
  };

  if (resend) {
    if (sellerEmail) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: sellerEmail,
          replyTo: buyerEmail,
          subject: `New enquiry about ${listingTitle}`,
          html: createSellerEmailHtml({
            buyerName: buyerName || "Not provided",
            buyerEmail,
            buyerPhone,
            message,
            listingTitle,
            conversationUrl,
          }),
        });

        emailResults.seller_email_sent = true;
      } catch (error) {
        console.error("Seller email error:", error);
        emailResults.seller_email_error =
          error?.message || "Seller email could not be sent.";
      }
    }

    try {
      await resend.emails.send({
        from: fromEmail,
        to: buyerEmail,
        replyTo: sellerEmail || undefined,
        subject: `Your Kerb enquiry has been sent`,
        html: createBuyerEmailHtml({
          buyerName,
          listingTitle,
          conversationUrl,
        }),
      });

      emailResults.buyer_email_sent = true;
    } catch (error) {
      console.error("Buyer email error:", error);
      emailResults.buyer_email_error =
        error?.message || "Buyer confirmation email could not be sent.";
    }
  }

  return NextResponse.json({
    success: true,
    enquiry,
    reused_existing_enquiry: reusedExistingEnquiry,
    emails: emailResults,
  });
}

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  escapeHtml,
  getListingTitle,
  getSiteUrl,
  sendKerbEmail,
} from "../../../../lib/kerb-email";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

function cleanText(value) {
  return String(value || "").trim();
}

function normaliseEmail(value) {
  return cleanText(value).toLowerCase();
}

function getToken(request) {
  return cleanText(request.headers.get("x-kerb-session-token"));
}

function getMessagePreview(message) {
  const text = cleanText(message).replace(/\s+/g, " ");

  return text.length > 220 ? `${text.slice(0, 217)}...` : text;
}

function getDisplayName(account, fallbackEmail) {
  return (
    cleanText(account?.full_name) ||
    cleanText(account?.name) ||
    cleanText(fallbackEmail).split("@")[0] ||
    "Kerb user"
  );
}

async function getSession(request) {
  const token = getToken(request);

  if (!token) return { error: "Not logged in.", status: 401 };

  const now = new Date().toISOString();

  const { data: session, error: sessionError } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", now)
    .maybeSingle();

  if (sessionError) return { error: sessionError.message, status: 500 };

  if (!session) {
    return { error: "Session expired. Please log in again.", status: 401 };
  }

  const { data: account, error: accountError } = await supabase
    .from("kerb_accounts")
    .select("*")
    .eq("id", session.account_id)
    .maybeSingle();

  if (accountError) return { error: accountError.message, status: 500 };

  return { session, account };
}

function getParticipantRole({ enquiry, email }) {
  const normalisedEmail = normaliseEmail(email);
  const buyerEmail = normaliseEmail(enquiry?.buyer_email);
  const sellerEmail = normaliseEmail(enquiry?.seller_email);

  if (normalisedEmail && normalisedEmail === buyerEmail) return "buyer";
  if (normalisedEmail && normalisedEmail === sellerEmail) return "seller";

  return "";
}

async function getThread(request, enquiryId) {
  if (!supabase) {
    return {
      error: NextResponse.json(
        { error: "Supabase server client is not configured." },
        { status: 500 }
      ),
    };
  }

  const sessionResult = await getSession(request);

  if (sessionResult.error) {
    return {
      error: NextResponse.json(
        { error: sessionResult.error },
        { status: sessionResult.status }
      ),
    };
  }

  const { session, account } = sessionResult;
  const accountEmail = normaliseEmail(session.email || account?.email);

  const { data: enquiry, error: enquiryError } = await supabase
    .from("kerb_enquiries")
    .select("*")
    .eq("id", enquiryId)
    .maybeSingle();

  if (enquiryError) {
    return {
      error: NextResponse.json(
        { error: enquiryError.message },
        { status: 500 }
      ),
    };
  }

  if (!enquiry) {
    return {
      error: NextResponse.json(
        { error: "Conversation could not be found." },
        { status: 404 }
      ),
    };
  }

  const participantRole = getParticipantRole({
    enquiry,
    email: accountEmail,
  });

  if (!participantRole) {
    return {
      error: NextResponse.json(
        { error: "You do not have access to this conversation." },
        { status: 403 }
      ),
    };
  }

  let listing = null;

  if (enquiry.listing_id) {
    const { data: listingData, error: listingError } = await supabase
      .from("kerb_listings")
      .select("*")
      .eq("id", enquiry.listing_id)
      .maybeSingle();

    if (listingError) {
      return {
        error: NextResponse.json(
          { error: listingError.message },
          { status: 500 }
        ),
      };
    }

    listing = listingData || null;
  }

  return {
    session,
    account,
    accountEmail,
    enquiry,
    listing,
    participantRole,
  };
}

function createReplyEmailHtml({
  senderName,
  listingTitle,
  message,
  conversationUrl,
}) {
  return `
    <div style="font-family: Arial, sans-serif; background:#f6f8fc; padding:28px;">
      <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:18px; padding:28px; border:1px solid #e5eaf4;">
        <div style="font-size:28px; font-weight:900; color:#0048ff; letter-spacing:-1px; margin-bottom:24px;">Kerb</div>
        <h1 style="margin:0 0 12px; color:#071126; font-size:26px; line-height:1.18;">New message about ${escapeHtml(listingTitle)}</h1>
        <p style="margin:0 0 18px; color:#59657a; line-height:1.6;">
          ${escapeHtml(senderName)} replied to your Kerb conversation.
        </p>
        <div style="background:#f7f9fd; border:1px solid #e5eaf4; border-radius:14px; padding:18px; margin-bottom:22px;">
          <p style="margin:0; color:#172033; line-height:1.6;">${escapeHtml(message)}</p>
        </div>
        <a href="${escapeHtml(conversationUrl)}" style="display:inline-block; background:#0048ff; color:#ffffff; text-decoration:none; padding:14px 20px; border-radius:12px; font-weight:bold;">
          Open conversation
        </a>
        <p style="margin:24px 0 0; color:#7a8499; font-size:13px; line-height:1.5;">
          You can reply from your Kerb account.
        </p>
      </div>
    </div>
  `;
}

async function getEnquiryId(params) {
  const resolvedParams = await params;

  return cleanText(resolvedParams?.id);
}

function getReadColumn(participantRole) {
  return participantRole === "seller" ? "seller_last_read_at" : "buyer_last_read_at";
}

async function markThreadRead({ enquiryId, participantRole, readAt }) {
  const readColumn = getReadColumn(participantRole);

  const { error } = await supabase
    .from("kerb_enquiries")
    .update({ [readColumn]: readAt })
    .eq("id", enquiryId);

  return error;
}

export async function GET(request, { params }) {
  const enquiryId = await getEnquiryId(params);

  if (!enquiryId) {
    return NextResponse.json(
      { error: "Conversation id is required." },
      { status: 400 }
    );
  }

  const thread = await getThread(request, enquiryId);

  if (thread.error) return thread.error;

  const readAt = new Date().toISOString();
  const readError = await markThreadRead({
    enquiryId,
    participantRole: thread.participantRole,
    readAt,
  });

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }

  const { data: messages, error: messagesError } = await supabase
    .from("kerb_enquiry_messages")
    .select("*")
    .eq("enquiry_id", enquiryId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  const fallbackMessages =
    (messages || []).length > 0
      ? messages
      : [
          {
            id: `${thread.enquiry.id}-initial`,
            enquiry_id: thread.enquiry.id,
            sender_role: "buyer",
            sender_email: thread.enquiry.buyer_email,
            sender_name: thread.enquiry.buyer_name,
            message: thread.enquiry.message,
            created_at: thread.enquiry.created_at,
          },
        ];

  return NextResponse.json({
    success: true,
    enquiry: {
      ...thread.enquiry,
      [getReadColumn(thread.participantRole)]: readAt,
    },
    listing: thread.listing,
    messages: fallbackMessages,
    participant_role: thread.participantRole,
    account_email: thread.accountEmail,
  });
}

export async function POST(request, { params }) {
  const enquiryId = await getEnquiryId(params);

  if (!enquiryId) {
    return NextResponse.json(
      { error: "Conversation id is required." },
      { status: 400 }
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

  const message = cleanText(body?.message);

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (message.length < 2) {
    return NextResponse.json(
      { error: "Please write a little more detail." },
      { status: 400 }
    );
  }

  if (message.length > 1200) {
    return NextResponse.json(
      { error: "Please keep your message under 1,200 characters." },
      { status: 400 }
    );
  }

  const thread = await getThread(request, enquiryId);

  if (thread.error) return thread.error;

  const senderName = getDisplayName(thread.account, thread.accountEmail);
  const now = new Date().toISOString();

  const { data: newMessage, error: insertError } = await supabase
    .from("kerb_enquiry_messages")
    .insert({
      enquiry_id: enquiryId,
      sender_role: thread.participantRole,
      sender_email: thread.accountEmail,
      sender_name: senderName,
      message,
      created_at: now,
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const nextStatus =
    thread.participantRole === "seller" &&
    normaliseEmail(thread.enquiry.status) !== "closed"
      ? "contacted"
      : thread.enquiry.status || "new";

  const { data: updatedEnquiry, error: updateError } = await supabase
    .from("kerb_enquiries")
    .update({
      status: nextStatus,
      last_message_at: now,
      last_message_preview: getMessagePreview(message),
      last_message_sender_role: thread.participantRole,
      [getReadColumn(thread.participantRole)]: now,
    })
    .eq("id", enquiryId)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const recipientEmail =
    thread.participantRole === "buyer"
      ? thread.enquiry.seller_email
      : thread.enquiry.buyer_email;

  const siteUrl = getSiteUrl(request);
  const conversationUrl = `${siteUrl}/enquiries/${enquiryId}`;
  const listingTitle =
    updatedEnquiry.listing_title ||
    getListingTitle(thread.listing) ||
    "a Kerb listing";

  const email = await sendKerbEmail({
    to: recipientEmail,
    replyTo: thread.accountEmail,
    subject: `New Kerb message about ${listingTitle}`,
    html: createReplyEmailHtml({
      senderName,
      listingTitle,
      message,
      conversationUrl,
    }),
  });

  return NextResponse.json({
    success: true,
    enquiry: updatedEnquiry,
    message: newMessage,
    email,
  });
}

import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function cleanText(value) {
  if (value === null || value === undefined) return "";

  return String(value).trim();
}

function normaliseEmail(value) {
  return cleanText(value).toLowerCase();
}

async function findAccountFromToken(supabase, token) {
  if (!token) return null;

  const attempts = [
    {
      table: "kerb_accounts",
      column: "session_token",
    },
    {
      table: "kerb_accounts",
      column: "token",
    },
    {
      table: "kerb_accounts",
      column: "auth_token",
    },
    {
      table: "kerb_sessions",
      column: "token",
    },
    {
      table: "kerb_account_sessions",
      column: "session_token",
    },
    {
      table: "kerb_account_sessions",
      column: "token",
    },
  ];

  for (const attempt of attempts) {
    const { data, error } = await supabase
      .from(attempt.table)
      .select("*")
      .eq(attempt.column, token)
      .maybeSingle();

    if (!error && data) {
      return data;
    }
  }

  return null;
}

function getAccountEmail(account) {
  return normaliseEmail(
    account?.email ||
      account?.account_email ||
      account?.user_email ||
      account?.owner_email
  );
}

function getAccountId(account) {
  return cleanText(
    account?.id ||
      account?.account_id ||
      account?.user_id
  );
}

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const token = cleanText(request.headers.get("x-kerb-session-token"));
    const body = await request.json();

    const listingId = cleanText(body.listing_id);
    const action = cleanText(body.action).toLowerCase();

    if (!token) {
      return Response.json(
        { error: "Missing session token. Please sign in again." },
        { status: 401 }
      );
    }

    if (!listingId) {
      return Response.json(
        { error: "Missing listing ID." },
        { status: 400 }
      );
    }

    if (!["sold", "delete"].includes(action)) {
      return Response.json(
        { error: "Invalid listing action." },
        { status: 400 }
      );
    }

    const account = await findAccountFromToken(supabase, token);

    if (!account) {
      return Response.json(
        {
          error:
            "Could not verify your session. Please sign out, sign back in and try again.",
        },
        { status: 401 }
      );
    }

    const accountEmail = getAccountEmail(account);
    const accountId = getAccountId(account);

    if (!accountEmail && !accountId) {
      return Response.json(
        { error: "Could not verify account ownership." },
        { status: 401 }
      );
    }

    const { data: listing, error: listingError } = await supabase
      .from("kerb_listings")
      .select("*")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError || !listing) {
      return Response.json(
        { error: "Listing could not be found." },
        { status: 404 }
      );
    }

    const listingOwnerEmails = [
      listing.account_email,
      listing.seller_email,
    ]
      .filter(Boolean)
      .map(normaliseEmail);

    const listingOwnerIds = [
      listing.account_id,
      listing.user_id,
      listing.owner_id,
    ]
      .filter(Boolean)
      .map(cleanText);

    const ownsByEmail =
      accountEmail && listingOwnerEmails.includes(accountEmail);

    const ownsById =
      accountId && listingOwnerIds.includes(accountId);

    if (!ownsByEmail && !ownsById) {
      return Response.json(
        { error: "You do not have permission to manage this listing." },
        { status: 403 }
      );
    }

    if (action === "delete") {
      const { error: deleteError } = await supabase
        .from("kerb_listings")
        .delete()
        .eq("id", listingId);

      if (deleteError) {
        return Response.json(
          { error: deleteError.message },
          { status: 400 }
        );
      }

      return Response.json({
        success: true,
        action: "delete",
      });
    }

    if (action === "sold") {
      const { data: updatedListing, error: updateError } = await supabase
        .from("kerb_listings")
        .update({
          status: "sold",
          sold_at: new Date().toISOString(),
        })
        .eq("id", listingId)
        .select()
        .single();

      if (updateError) {
        return Response.json(
          { error: updateError.message },
          { status: 400 }
        );
      }

      return Response.json({
        success: true,
        action: "sold",
        listing: updatedListing,
      });
    }

    return Response.json(
      { error: "Action not handled." },
      { status: 400 }
    );
  } catch (error) {
    return Response.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

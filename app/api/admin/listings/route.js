import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

const VALID_STATUSES = ["pending", "approved", "sold", "rejected"];

function checkAdmin(request) {
  const suppliedPassword = request.headers.get("x-admin-password");

  if (!adminPassword) {
    return "ADMIN_PASSWORD is missing in Vercel environment variables.";
  }

  if (!supabase) {
    return "Supabase admin client is not configured.";
  }

  if (!suppliedPassword || suppliedPassword !== adminPassword) {
    return "Unauthorised.";
  }

  return "";
}

function cleanStatus(status) {
  return String(status || "pending").trim().toLowerCase();
}

function cleanAction(action) {
  return String(action || "status").trim().toLowerCase();
}

function cleanNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

export async function GET(request) {
  const authError = checkAdmin(request);

  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("kerb_listings")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("featured_rank", { ascending: false })
    .order("boosted_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listings: data || [] });
}

export async function PATCH(request) {
  const authError = checkAdmin(request);

  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = body?.id;
  const action = cleanAction(body?.action);

  if (!id) {
    return NextResponse.json({ error: "Listing id is required." }, { status: 400 });
  }

  let updatePayload = {};

  if (action === "boost") {
    const days = Math.min(Math.max(cleanNumber(body?.days, 14), 1), 90);
    const rank = Math.min(Math.max(cleanNumber(body?.rank, 100), 1), 9999);

    updatePayload = {
      is_featured: true,
      featured_until: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
      featured_rank: rank,
      boosted_at: new Date().toISOString(),
    };
  } else if (action === "unboost") {
    updatePayload = {
      is_featured: false,
      featured_until: null,
      featured_rank: 0,
      boosted_at: null,
    };
  } else {
    const status = cleanStatus(body?.status);

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid listing status." }, { status: 400 });
    }

    updatePayload = {
      status,
      sold_at: status === "sold" ? new Date().toISOString() : null,
    };

    if (status === "rejected") {
      updatePayload.moderation_reason = String(
        body?.moderation_reason || "Not approved"
      ).slice(0, 160);
      updatePayload.moderation_note = String(body?.moderation_note || "").slice(
        0,
        800
      );
    }

    if (status === "approved") {
      updatePayload.moderation_reason = null;
      updatePayload.moderation_note = null;
    }
  }

  const { data, error } = await supabase
    .from("kerb_listings")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listing: data });
}

export async function DELETE(request) {
  const authError = checkAdmin(request);

  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = body?.id;

  if (!id) {
    return NextResponse.json({ error: "Listing id is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("kerb_listings")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true, listing: data });
}

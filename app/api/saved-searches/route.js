import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

async function getSession(request) {
  const token = cleanText(request.headers.get("x-kerb-session-token"));

  if (!token) return { error: "Not logged in.", status: 401 };

  const { data: session, error } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) return { error: error.message, status: 500 };
  if (!session) return { error: "Session expired. Please log in again.", status: 401 };

  return { session };
}

export async function GET(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  const sessionResult = await getSession(request);

  if (sessionResult.error) {
    return NextResponse.json(
      { error: sessionResult.error },
      { status: sessionResult.status }
    );
  }

  const { session } = sessionResult;

  const { data, error } = await supabase
    .from("kerb_saved_searches")
    .select("*")
    .eq("account_id", session.account_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved_searches: data || [] });
}

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  const sessionResult = await getSession(request);

  if (sessionResult.error) {
    return NextResponse.json(
      { error: sessionResult.error },
      { status: sessionResult.status }
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

  const { session } = sessionResult;
  const name = cleanText(body?.name) || "Saved search";
  const filters =
    body?.filters && typeof body.filters === "object" ? body.filters : {};
  const searchText = cleanText(body?.search_text);
  const sort = cleanText(body?.sort) || "newest";
  const queryString = cleanText(body?.query_string);

  if (name.length > 80) {
    return NextResponse.json(
      { error: "Saved search name is too long." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("kerb_saved_searches")
    .insert({
      account_id: session.account_id,
      account_email: session.email,
      name,
      filters,
      search_text: searchText || null,
      sort,
      query_string: queryString || null,
      last_seen_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, saved_search: data });
}

export async function DELETE(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  const sessionResult = await getSession(request);

  if (sessionResult.error) {
    return NextResponse.json(
      { error: sessionResult.error },
      { status: sessionResult.status }
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

  const id = cleanText(body?.id);

  if (!id) {
    return NextResponse.json(
      { error: "Saved search id is required." },
      { status: 400 }
    );
  }

  const { session } = sessionResult;
  const { error } = await supabase
    .from("kerb_saved_searches")
    .delete()
    .eq("id", id)
    .eq("account_id", session.account_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: true });
}

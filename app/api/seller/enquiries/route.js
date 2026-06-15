import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const authClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const adminClient =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

const VALID_STATUSES = ["new", "contacted", "closed"];

function getToken(request) {
  const header = request.headers.get("authorization") || "";
  return header.replace("Bearer ", "").trim();
}

function cleanStatus(status) {
  const cleaned = String(status || "new").trim().toLowerCase();
  return VALID_STATUSES.includes(cleaned) ? cleaned : "new";
}

async function getLoggedInUser(request) {
  if (!authClient || !adminClient) {
    return {
      error: NextResponse.json(
        { error: "Supabase clients are not configured." },
        { status: 500 }
      ),
    };
  }

  const token = getToken(request);

  if (!token) {
    return {
      error: NextResponse.json({ error: "Not logged in." }, { status: 401 }),
    };
  }

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user?.email) {
    return {
      error: NextResponse.json({ error: "Invalid session." }, { status: 401 }),
    };
  }

  return { user };
}

export async function GET(request) {
  const { user, error: authError } = await getLoggedInUser(request);

  if (authError) return authError;

  const { data, error } = await adminClient
    .from("kerb_enquiries")
    .select("*")
    .ilike("seller_email", user.email)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    enquiries: data || [],
    user: {
      email: user.email,
    },
  });
}

export async function PATCH(request) {
  const { user, error: authError } = await getLoggedInUser(request);

  if (authError) return authError;

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const id = body?.id;
  const status = cleanStatus(body?.status);

  if (!id) {
    return NextResponse.json(
      { error: "Enquiry id is required." },
      { status: 400 }
    );
  }

  const { data: existingEnquiry, error: existingError } = await adminClient
    .from("kerb_enquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (existingError || !existingEnquiry) {
    return NextResponse.json(
      { error: "Enquiry could not be found." },
      { status: 404 }
    );
  }

  if (
    String(existingEnquiry.seller_email || "").toLowerCase() !==
    String(user.email || "").toLowerCase()
  ) {
    return NextResponse.json(
      { error: "You do not have access to this enquiry." },
      { status: 403 }
    );
  }

  const { data, error } = await adminClient
    .from("kerb_enquiries")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enquiry: data });
}

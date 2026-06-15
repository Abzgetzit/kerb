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

function getToken(request) {
  const header = request.headers.get("authorization") || "";
  return header.replace("Bearer ", "").trim();
}

export async function GET(request) {
  if (!authClient || !adminClient) {
    return NextResponse.json(
      { error: "Supabase clients are not configured." },
      { status: 500 }
    );
  }

  const token = getToken(request);

  if (!token) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user?.email) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const { data, error } = await adminClient
    .from("kerb_enquiries")
    .select("*")
    .ilike("buyer_email", user.email)
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

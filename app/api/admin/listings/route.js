import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawSupabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabaseUrl = rawSupabaseUrl
    .trim()
    .replace("/rest/v1", "")
    .replace(/\/$/, "");

  return createClient(supabaseUrl, serviceRoleKey);
}

function checkAdminPassword(request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const suppliedPassword = request.headers.get("x-admin-password");

  if (!adminPassword) {
    return false;
  }

  return suppliedPassword === adminPassword;
}

export async function GET(request) {
  try {
    if (!checkAdminPassword(request)) {
      return Response.json(
        { error: "Unauthorised admin access." },
        { status: 401 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("kerb_listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      listings: data,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    if (!checkAdminPassword(request)) {
      return Response.json(
        { error: "Unauthorised admin access." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    const allowedStatuses = ["pending", "approved", "rejected", "sold"];

    if (!id || !allowedStatuses.includes(status)) {
      return Response.json(
        { error: "Invalid listing ID or status." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("kerb_listings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      listing: data,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

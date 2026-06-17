import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const DVLA_VES_URL =
  process.env.DVLA_VES_API_URL ||
  "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";

function cleanText(value) {
  if (value === null || value === undefined) return "";

  return String(value).trim();
}

function cleanRegistration(value) {
  return cleanText(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function cleanYear(value) {
  const year = Number(value);

  if (!Number.isInteger(year)) return null;
  if (year < 1900 || year > new Date().getFullYear() + 1) return null;

  return year;
}

function mapFuelType(value) {
  const fuelType = cleanText(value).toLowerCase();

  if (!fuelType) return null;
  if (fuelType.includes("electric") && !fuelType.includes("hybrid")) {
    return "Electric";
  }
  if (fuelType.includes("hybrid")) return "Hybrid";
  if (fuelType.includes("diesel") || fuelType.includes("heavy oil")) {
    return "Diesel";
  }
  if (fuelType.includes("petrol")) return "Petrol";

  return cleanText(value);
}

async function verifySession(supabase, token) {
  if (!token) return null;

  const now = new Date().toISOString();

  const { data: session, error } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", now)
    .maybeSingle();

  if (error || !session) return null;

  return session;
}

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const dvlaApiKey = process.env.DVLA_VES_API_KEY || process.env.DVLA_API_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const token = cleanText(request.headers.get("x-kerb-session-token"));
    const session = await verifySession(supabase, token);

    if (!session) {
      return Response.json(
        { error: "Please sign in again before looking up a registration." },
        { status: 401 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const registration = cleanRegistration(body.registration);

    if (!registration || registration.length < 2 || registration.length > 8) {
      return Response.json(
        { error: "Enter a valid UK registration number." },
        { status: 400 }
      );
    }

    if (!dvlaApiKey) {
      return Response.json(
        {
          error:
            "Vehicle lookup is not configured yet. Add DVLA_VES_API_KEY in Vercel to enable it.",
        },
        { status: 503 }
      );
    }

    const dvlaResponse = await fetch(DVLA_VES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": dvlaApiKey,
      },
      body: JSON.stringify({
        registrationNumber: registration,
      }),
      cache: "no-store",
    });

    const vehicle = await dvlaResponse.json().catch(() => null);

    if (!dvlaResponse.ok) {
      const status = dvlaResponse.status === 404 ? 404 : 400;

      return Response.json(
        {
          error:
            status === 404
              ? "No vehicle was found for that registration."
              : vehicle?.errors?.[0]?.detail ||
                vehicle?.message ||
                "Could not look up that registration.",
        },
        { status }
      );
    }

    return Response.json({
      success: true,
      vehicle: {
        registration:
          cleanRegistration(vehicle?.registrationNumber) || registration,
        make: cleanText(vehicle?.make) || null,
        model: null,
        year:
          cleanYear(vehicle?.yearOfManufacture) ||
          cleanYear(String(vehicle?.monthOfFirstRegistration || "").slice(0, 4)),
        mileage: null,
        fuel_type: mapFuelType(vehicle?.fuelType),
        mot_status: cleanText(vehicle?.motStatus) || null,
        tax_status: cleanText(vehicle?.taxStatus) || null,
        colour: cleanText(vehicle?.colour) || null,
      },
      message:
        "DVLA returned the make, year and fuel type. Model, mileage and gearbox still need to be checked manually.",
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

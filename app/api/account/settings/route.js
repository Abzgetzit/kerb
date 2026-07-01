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

function cleanBoolean(value, fallback = false) {
  if (value === true) return true;
  if (value === false) return false;

  const text = cleanText(value).toLowerCase();

  if (["true", "yes", "1", "on"].includes(text)) return true;
  if (["false", "no", "0", "off"].includes(text)) return false;

  return fallback;
}

function getFileExtension(fileName = "") {
  const extension = String(fileName).split(".").pop();

  if (!extension || extension === fileName) return "jpg";

  return extension.toLowerCase();
}

function getStoragePathFromPublicUrl(url) {
  const marker = "/storage/v1/object/public/kerb-account-photos/";
  const text = cleanText(url);
  const markerIndex = text.indexOf(marker);

  if (markerIndex === -1) return "";

  return decodeURIComponent(text.slice(markerIndex + marker.length));
}

async function uploadProfilePhoto({ accountId, file }) {
  if (!file || typeof file === "string" || file.size <= 0) return "";

  if (!String(file.type || "").startsWith("image/")) {
    throw new Error("Profile photo must be an image file.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Please keep your profile photo under 5MB.");
  }

  const fileExt = getFileExtension(file.name);
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `accounts/${accountId}/${fileName}`;
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("kerb-account-photos")
    .upload(filePath, fileBuffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("kerb-account-photos")
    .getPublicUrl(filePath);

  return publicUrlData?.publicUrl || "";
}

async function removeProfilePhoto(url) {
  const path = getStoragePathFromPublicUrl(url);

  if (!path) return;

  const { error } = await supabase.storage
    .from("kerb-account-photos")
    .remove([path]);

  if (error) {
    console.error("Kerb profile photo delete error:", error);
  }
}

async function getSignedInAccount(request) {
  const token = cleanText(request.headers.get("x-kerb-session-token"));

  if (!token) {
    return { error: "Not logged in.", status: 401 };
  }

  const { data: session, error: sessionError } = await supabase
    .from("kerb_account_sessions")
    .select("*")
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError) {
    return { error: sessionError.message, status: 500 };
  }

  if (!session) {
    return { error: "Session expired. Please log in again.", status: 401 };
  }

  const { data: account, error: accountError } = await supabase
    .from("kerb_accounts")
    .select("*")
    .eq("id", session.account_id)
    .maybeSingle();

  if (accountError) {
    return { error: accountError.message, status: 500 };
  }

  if (!account) {
    return { error: "Account could not be found.", status: 404 };
  }

  return { session, account };
}

export async function PATCH(request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client is not configured." },
      { status: 500 }
    );
  }

  const signedIn = await getSignedInAccount(request);

  if (signedIn.error) {
    return NextResponse.json(
      { error: signedIn.error },
      { status: signedIn.status || 401 }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  let body;
  let profilePhoto = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      body = {
        full_name: formData.get("full_name"),
        phone: formData.get("phone"),
        default_show_seller_name: formData.get("default_show_seller_name"),
        default_show_seller_phone: formData.get("default_show_seller_phone"),
        remove_profile_photo: formData.get("remove_profile_photo"),
      };

      const uploadedPhoto = formData.get("profile_photo");

      if (
        uploadedPhoto &&
        typeof uploadedPhoto !== "string" &&
        uploadedPhoto.size > 0
      ) {
        profilePhoto = uploadedPhoto;
      }
    } else {
      body = await request.json();
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const fullName = cleanText(body.full_name);
  const phone = cleanText(body.phone);
  const defaultShowSellerName = cleanBoolean(
    body.default_show_seller_name,
    true
  );
  const defaultShowSellerPhone = cleanBoolean(
    body.default_show_seller_phone,
    false
  );

  if (!fullName) {
    return NextResponse.json(
      { error: "Enter your full name." },
      { status: 400 }
    );
  }

  if (fullName.length > 120) {
    return NextResponse.json(
      { error: "Please keep your name under 120 characters." },
      { status: 400 }
    );
  }

  if (phone.length > 40) {
    return NextResponse.json(
      { error: "Please keep your phone number under 40 characters." },
      { status: 400 }
    );
  }

  const removeProfilePhotoRequest = cleanBoolean(body.remove_profile_photo);
  const existingProfilePhotoUrl = cleanText(signedIn.account.profile_photo_url);
  let uploadedProfilePhotoUrl = "";
  let profilePhotoUrl = removeProfilePhotoRequest ? "" : existingProfilePhotoUrl;

  try {
    uploadedProfilePhotoUrl = await uploadProfilePhoto({
      accountId: signedIn.account.id,
      file: profilePhoto,
    });

    if (uploadedProfilePhotoUrl) {
      profilePhotoUrl = uploadedProfilePhotoUrl;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Could not upload profile photo." },
      { status: 400 }
    );
  }

  const { data: account, error } = await supabase
    .from("kerb_accounts")
    .update({
      full_name: fullName,
      phone: phone || null,
      default_show_seller_name: defaultShowSellerName,
      default_show_seller_phone: defaultShowSellerPhone && Boolean(phone),
      profile_photo_url: profilePhotoUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", signedIn.account.id)
    .select("*")
    .single();

  if (error) {
    if (uploadedProfilePhotoUrl) {
      await removeProfilePhoto(uploadedProfilePhotoUrl);
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (
    existingProfilePhotoUrl &&
    existingProfilePhotoUrl !== profilePhotoUrl &&
    (uploadedProfilePhotoUrl || removeProfilePhotoRequest)
  ) {
    await removeProfilePhoto(existingProfilePhotoUrl);
  }

  return NextResponse.json({
    success: true,
    account,
  });
}

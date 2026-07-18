"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function isPostCarRequest(input, init) {
  const url = typeof input === "string" ? input : input?.url;
  return (
    url === "/api/post-car" &&
    String(init?.method || "GET").toUpperCase() === "POST" &&
    init?.body instanceof FormData
  );
}

function uploadWithXhr(input, init) {
  const url = typeof input === "string" ? input : input.url;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.responseType = "text";

    const token = String(
      init?.headers?.["x-kerb-session-token"] ||
        init?.headers?.get?.("x-kerb-session-token") ||
        localStorage.getItem("kerbSessionToken") ||
        ""
    ).trim();

    if (token) {
      try {
        xhr.setRequestHeader("x-kerb-session-token", token);
      } catch (headerError) {
        reject(headerError);
        return;
      }
    }

    xhr.onload = () => {
      const responseText = xhr.responseText || "";
      resolve(
        new Response(responseText, {
          status: xhr.status || 500,
          statusText: xhr.statusText || "",
          headers: {
            "Content-Type": xhr.getResponseHeader("content-type") || "application/json",
          },
        })
      );
    };

    xhr.onerror = () => reject(new TypeError("Could not connect to Kerb to submit the listing."));
    xhr.onabort = () => reject(new DOMException("The listing upload was cancelled.", "AbortError"));

    if (init?.signal) {
      if (init.signal.aborted) {
        xhr.abort();
        return;
      }
      init.signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(init.body);
  });
}

export default function PostCarSafariUploadFix() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/post-car") return undefined;

    const originalFetch = window.fetch.bind(window);

    window.fetch = function kerbPostCarFetch(input, init) {
      if (isPostCarRequest(input, init)) {
        return uploadWithXhr(input, init);
      }
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [pathname]);

  return null;
}

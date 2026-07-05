"use client";

import { useEffect } from "react";

export default function BrowseHeadingCleaner() {
  useEffect(() => {
    function cleanBrowseHeading() {
      document
        .querySelectorAll(".browse-page .results-heading h1")
        .forEach((heading) => {
          const text = heading.textContent?.trim() || "";
          const match = text.match(/^(\d+)\s+all categories found$/i);

          if (match) {
            heading.textContent = `${match[1]} found`;
          }
        });
    }

    cleanBrowseHeading();

    const observer = new MutationObserver(cleanBrowseHeading);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}

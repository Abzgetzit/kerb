"use client";

import { useEffect } from "react";

const popularMakes = [
  "Audi",
  "BMW",
  "Mercedes-Benz",
  "Volkswagen",
  "Ford",
  "Vauxhall",
];

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

    function organiseMakeDropdowns() {
      document
        .querySelectorAll(".browse-page .filter-card")
        .forEach((card) => {
          const label = card.querySelector("p")?.textContent?.trim().toLowerCase();
          const select = card.querySelector("select");

          if (label !== "make" || !select || select.dataset.kerbMakeGrouped === "true") return;

          const options = Array.from(select.querySelectorAll("option"));
          const anyOption = options.find((option) => option.value === "");
          const popular = options.filter((option) => popularMakes.includes(option.value));
          const all = options.filter(
            (option) => option.value && !popularMakes.includes(option.value)
          );

          if (!anyOption || popular.length === 0 || all.length === 0) return;

          select.innerHTML = "";
          select.appendChild(anyOption);

          const popularGroup = document.createElement("optgroup");
          popularGroup.label = "Popular makes";
          popular.forEach((option) => popularGroup.appendChild(option));
          select.appendChild(popularGroup);

          const allGroup = document.createElement("optgroup");
          allGroup.label = "All makes";
          all.forEach((option) => allGroup.appendChild(option));
          select.appendChild(allGroup);

          select.dataset.kerbMakeGrouped = "true";
        });
    }

    function runFixes() {
      cleanBrowseHeading();
      organiseMakeDropdowns();
    }

    runFixes();

    const observer = new MutationObserver(runFixes);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}

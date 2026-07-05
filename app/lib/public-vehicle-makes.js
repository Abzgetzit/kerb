import { vehicleMakes } from "./vehicle-data";

export const popularVehicleMakeOptions = [
  "Audi",
  "BMW",
  "Mercedes-Benz",
  "Volkswagen",
  "Ford",
  "Vauxhall",
];

const makeDisplayAliases = {
  mercedes: "Mercedes-Benz",
  mercedesbenz: "Mercedes-Benz",
  ds: "DS Automobiles",
  dsautomobiles: "DS Automobiles",
  cupra: "Cupra",
  citroen: "Citroen",
  citroën: "Citroen",
};

const sourceMakeByPublicMake = {
  "DS Automobiles": "DS AUTOMOBILES",
  Cupra: vehicleMakes.Cupra ? "Cupra" : "CUPRA",
};

function makeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

export function getPublicVehicleMake(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";

  const key = makeKey(clean);
  return makeDisplayAliases[key] || clean;
}

export function getVehicleMakeMatchKey(value) {
  return makeKey(getPublicVehicleMake(value));
}

const rawPublicMakes = Object.keys(vehicleMakes)
  .map(getPublicVehicleMake)
  .filter(Boolean);

const publicMakeSet = new Set(rawPublicMakes);
for (const make of popularVehicleMakeOptions) publicMakeSet.add(make);

const alphabeticMakes = [...publicMakeSet]
  .filter((make) => !popularVehicleMakeOptions.includes(make))
  .sort((a, b) => a.localeCompare(b, "en-GB", { sensitivity: "base" }));

export const publicVehicleMakeOptions = [
  ...popularVehicleMakeOptions.filter((make) => publicMakeSet.has(make)),
  ...alphabeticMakes,
];

export function getVehicleModelsForPublicMake(make) {
  const publicMake = getPublicVehicleMake(make);
  const sourceMake = sourceMakeByPublicMake[publicMake] || publicMake;

  return vehicleMakes[sourceMake] || vehicleMakes[make] || [];
}

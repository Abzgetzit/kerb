import { vehicleMakes } from "./vehicle-data";

const popularMakes = [
  "Audi",
  "BMW",
  "Mercedes-Benz",
  "Volkswagen",
  "Ford",
  "Vauxhall",
  "Toyota",
  "Nissan",
  "Kia",
  "Hyundai",
  "Peugeot",
  "Renault",
  "Land Rover",
  "Tesla",
  "Volvo",
  "Honda",
  "Mazda",
  "MINI",
  "Skoda",
  "SEAT",
  "Cupra",
  "DS Automobiles",
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
for (const make of popularMakes) publicMakeSet.add(make);

const alphabeticMakes = [...publicMakeSet]
  .filter((make) => !popularMakes.includes(make))
  .sort((a, b) => a.localeCompare(b, "en-GB", { sensitivity: "base" }));

export const publicVehicleMakeOptions = [
  ...popularMakes.filter((make) => publicMakeSet.has(make)),
  ...alphabeticMakes,
];

export function getVehicleModelsForPublicMake(make) {
  const publicMake = getPublicVehicleMake(make);
  const sourceMake = sourceMakeByPublicMake[publicMake] || publicMake;

  return vehicleMakes[sourceMake] || vehicleMakes[make] || [];
}

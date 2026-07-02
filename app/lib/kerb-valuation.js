// Kerb market guide helper.
// This is a guide engine for marketplace asking prices, not an official valuation.
// It intentionally returns a range and wording that avoids guaranteed value claims.

const CURRENT_YEAR = new Date().getFullYear();

const makeFallbackNewPriceGuide = {
  Abarth: 22000,
  "Alfa Romeo": 36000,
  Audi: 39000,
  BMW: 42000,
  Citroen: 23000,
  Cupra: 36000,
  Dacia: 19000,
  DS: 33000,
  Fiat: 20000,
  Ford: 28000,
  Honda: 32000,
  Hyundai: 30000,
  Jaguar: 50000,
  Jeep: 40000,
  Kia: 31000,
  "Land Rover": 62000,
  Lexus: 46000,
  Mazda: 30000,
  "Mercedes-Benz": 44000,
  Mercedes: 44000,
  MINI: 29000,
  Nissan: 29000,
  Peugeot: 28000,
  Polestar: 50000,
  Porsche: 78000,
  Renault: 26000,
  SEAT: 26000,
  Skoda: 30000,
  Smart: 22000,
  Subaru: 36000,
  Suzuki: 22000,
  Tesla: 47000,
  Toyota: 31000,
  Vauxhall: 24000,
  Volkswagen: 33000,
  Volvo: 47000,
};

const modelNewPriceGuide = {
  "BMW|1 Series": 33000,
  "BMW|2 Series": 37000,
  "BMW|3 Series": 43000,
  "BMW|4 Series": 49000,
  "BMW|5 Series": 57000,
  "BMW|X1": 39000,
  "BMW|X3": 54000,
  "BMW|X5": 76000,
  "BMW|M2": 62000,
  "BMW|M3": 85000,
  "BMW|M4": 88000,
  "BMW|M5": 115000,
  "Audi|S3": 50000,
  "Audi|RS3": 65000,
  "Audi|S4": 62000,
  "Audi|RS4": 85000,
  "Audi|S5": 67000,
  "Audi|RS5": 90000,
  "Mercedes-Benz|AMG GT": 125000,

  "Audi|A1": 25000,
  "Audi|A3": 35000,
  "Audi|A4": 42000,
  "Audi|A5": 50000,
  "Audi|Q2": 32000,
  "Audi|Q3": 41000,
  "Audi|Q5": 56000,

  "Mercedes-Benz|A-Class": 36000,
  "Mercedes-Benz|C-Class": 50000,
  "Mercedes-Benz|E-Class": 62000,
  "Mercedes-Benz|GLA": 41000,
  "Mercedes-Benz|GLC": 60000,

  "Ford|Fiesta": 21000,
  "Ford|Focus": 28000,
  "Ford|Kuga": 36000,
  "Ford|Puma": 29000,

  "Vauxhall|Corsa": 21000,
  "Vauxhall|Astra": 29000,
  "Vauxhall|Mokka": 30000,

  "Volkswagen|Golf": 33000,
  "Volkswagen|Polo": 22000,
  "Volkswagen|Tiguan": 41000,
  "Volkswagen|T-Roc": 35000,

  "Toyota|Yaris": 24000,
  "Toyota|Corolla": 31000,
  "Toyota|C-HR": 34000,
  "Toyota|RAV4": 44000,

  "Nissan|Qashqai": 33000,
  "Nissan|Juke": 27000,
  "Nissan|Leaf": 30000,

  "Kia|Sportage": 36000,
  "Kia|Niro": 35000,
  "Hyundai|Tucson": 36000,
  "Hyundai|Kona": 30000,

  "Tesla|Model 3": 43000,
  "Tesla|Model Y": 48000,
};

// Anchors are approximate UK retail/private-market guide bands around the base year/mileage.
// They make common cars much more realistic than pure new-price depreciation.
const marketAnchors = [
  // BMW
  { make: "BMW", model: "1 Series", detailIncludes: "118i", baseYear: 2021, baseMileage: 45000, low: 14500, high: 19500, mileageRate: 0.055 },
  { make: "BMW", model: "1 Series", detailIncludes: "118d", baseYear: 2021, baseMileage: 45000, low: 14000, high: 19000, mileageRate: 0.055 },
  { make: "BMW", model: "1 Series", detailIncludes: "M135i", baseYear: 2021, baseMileage: 45000, low: 23000, high: 31000, mileageRate: 0.09 },
  { make: "BMW", model: "2 Series", detailIncludes: "220i", baseYear: 2021, baseMileage: 45000, low: 18500, high: 25000, mileageRate: 0.075 },
  { make: "BMW", model: "2 Series", detailIncludes: "M240i", baseYear: 2021, baseMileage: 45000, low: 28500, high: 39000, mileageRate: 0.12 },
  { make: "BMW", model: "3 Series", detailIncludes: "318i", baseYear: 2021, baseMileage: 45000, low: 16000, high: 21000, mileageRate: 0.08 },
  { make: "BMW", model: "3 Series", detailIncludes: "320i", baseYear: 2021, baseMileage: 45000, low: 17500, high: 22500, mileageRate: 0.095 },
  { make: "BMW", model: "3 Series", detailIncludes: "320d", baseYear: 2021, baseMileage: 45000, low: 16500, high: 21500, mileageRate: 0.09 },
  { make: "BMW", model: "3 Series", detailIncludes: "330e", baseYear: 2021, baseMileage: 45000, low: 16500, high: 22000, mileageRate: 0.09 },
  { make: "BMW", model: "3 Series", detailIncludes: "330i", baseYear: 2021, baseMileage: 45000, low: 20500, high: 28500, mileageRate: 0.11 },
  { make: "BMW", model: "3 Series", detailIncludes: "330d", baseYear: 2021, baseMileage: 45000, low: 21500, high: 30000, mileageRate: 0.12 },
  { make: "BMW", model: "3 Series", detailIncludes: "M340i", baseYear: 2021, baseMileage: 45000, low: 35000, high: 46500, mileageRate: 0.16 },
  { make: "BMW", model: "3 Series", detailIncludes: "M340d", baseYear: 2021, baseMileage: 45000, low: 33000, high: 45000, mileageRate: 0.16 },
  { make: "BMW", model: "4 Series", detailIncludes: "420i", baseYear: 2021, baseMileage: 45000, low: 19000, high: 24500, mileageRate: 0.10 },
  { make: "BMW", model: "4 Series", detailIncludes: "420d", baseYear: 2021, baseMileage: 45000, low: 18500, high: 24500, mileageRate: 0.10 },
  { make: "BMW", model: "4 Series", detailIncludes: "428i", baseYear: 2015, baseMileage: 65000, low: 9500, high: 13500, mileageRate: 0.07 },
  { make: "BMW", model: "4 Series", detailIncludes: "430i", baseYear: 2021, baseMileage: 45000, low: 22000, high: 29000, mileageRate: 0.12 },
  { make: "BMW", model: "4 Series", detailIncludes: "M440i", baseYear: 2021, baseMileage: 45000, low: 34500, high: 46000, mileageRate: 0.16 },

  { make: "BMW", model: "M2", detailIncludes: "", baseYear: 2021, baseMileage: 35000, low: 36500, high: 52000, mileageRate: 0.16 },
  { make: "BMW", model: "M3", detailIncludes: "", baseYear: 2021, baseMileage: 35000, low: 54000, high: 72000, mileageRate: 0.22 },
  { make: "BMW", model: "M4", detailIncludes: "", baseYear: 2021, baseMileage: 35000, low: 54000, high: 75000, mileageRate: 0.22 },
  { make: "BMW", model: "M5", detailIncludes: "", baseYear: 2021, baseMileage: 40000, low: 56000, high: 78000, mileageRate: 0.24 },
  { make: "BMW", model: "5 Series", detailIncludes: "520d", baseYear: 2021, baseMileage: 50000, low: 18500, high: 26000, mileageRate: 0.12 },
  { make: "BMW", model: "5 Series", detailIncludes: "530e", baseYear: 2021, baseMileage: 50000, low: 20000, high: 29000, mileageRate: 0.12 },
  { make: "BMW", model: "X3", detailIncludes: "xDrive20d", baseYear: 2021, baseMileage: 50000, low: 24500, high: 33500, mileageRate: 0.14 },
  { make: "BMW", model: "X5", detailIncludes: "xDrive30d", baseYear: 2021, baseMileage: 50000, low: 39000, high: 53500, mileageRate: 0.20 },

  // Audi
  { make: "Audi", model: "A1", detailIncludes: "", baseYear: 2021, baseMileage: 40000, low: 12500, high: 18000, mileageRate: 0.05 },
  { make: "Audi", model: "A3", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 15500, high: 22500, mileageRate: 0.075 },
  { make: "Audi", model: "A4", detailIncludes: "", baseYear: 2021, baseMileage: 50000, low: 16500, high: 24000, mileageRate: 0.09 },
  { make: "Audi", model: "A5", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 21000, high: 31000, mileageRate: 0.11 },
  { make: "Audi", model: "Q3", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 20500, high: 29500, mileageRate: 0.10 },
  { make: "Audi", model: "Q5", detailIncludes: "", baseYear: 2021, baseMileage: 50000, low: 26500, high: 38500, mileageRate: 0.14 },
  { make: "Audi", model: "S3", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 25500, high: 36000, mileageRate: 0.12 },
  { make: "Audi", model: "RS3", detailIncludes: "", baseYear: 2021, baseMileage: 40000, low: 41000, high: 56000, mileageRate: 0.18 },
  { make: "Audi", model: "S4", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 28500, high: 40000, mileageRate: 0.14 },
  { make: "Audi", model: "RS4", detailIncludes: "", baseYear: 2021, baseMileage: 40000, low: 50000, high: 67500, mileageRate: 0.22 },
  { make: "Audi", model: "S5", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 32000, high: 45500, mileageRate: 0.15 },
  { make: "Audi", model: "RS5", detailIncludes: "", baseYear: 2021, baseMileage: 40000, low: 51000, high: 70000, mileageRate: 0.22 },

  // Mercedes
  { make: "Mercedes-Benz", model: "A-Class", detailIncludes: "A180", baseYear: 2021, baseMileage: 45000, low: 15000, high: 22000, mileageRate: 0.075 },
  { make: "Mercedes-Benz", model: "A-Class", detailIncludes: "A200", baseYear: 2021, baseMileage: 45000, low: 16500, high: 23500, mileageRate: 0.08 },
  { make: "Mercedes-Benz", model: "A-Class", detailIncludes: "A35", baseYear: 2021, baseMileage: 45000, low: 27000, high: 38500, mileageRate: 0.13 },
  { make: "Mercedes-Benz", model: "C-Class", detailIncludes: "C200", baseYear: 2021, baseMileage: 45000, low: 22500, high: 32500, mileageRate: 0.12 },
  { make: "Mercedes-Benz", model: "C-Class", detailIncludes: "C220", baseYear: 2021, baseMileage: 50000, low: 22000, high: 32000, mileageRate: 0.12 },
  { make: "Mercedes-Benz", model: "GLC", detailIncludes: "", baseYear: 2021, baseMileage: 50000, low: 29000, high: 42000, mileageRate: 0.15 },

  // VW Group / mainstream
  { make: "Volkswagen", model: "Golf", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 14500, high: 21500, mileageRate: 0.07 },
  { make: "Volkswagen", model: "Golf", detailIncludes: "GTI", baseYear: 2021, baseMileage: 45000, low: 24500, high: 34000, mileageRate: 0.11 },
  { make: "Volkswagen", model: "Golf", detailIncludes: "R", baseYear: 2021, baseMileage: 45000, low: 30000, high: 42000, mileageRate: 0.14 },
  { make: "Volkswagen", model: "Polo", detailIncludes: "", baseYear: 2021, baseMileage: 40000, low: 10000, high: 15500, mileageRate: 0.045 },
  { make: "Volkswagen", model: "Tiguan", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 19000, high: 28500, mileageRate: 0.10 },
  { make: "SEAT", model: "Leon", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 12500, high: 19000, mileageRate: 0.06 },
  { make: "Skoda", model: "Octavia", detailIncludes: "", baseYear: 2021, baseMileage: 50000, low: 13000, high: 21000, mileageRate: 0.07 },

  // Ford / Vauxhall
  { make: "Ford", model: "Fiesta", detailIncludes: "", baseYear: 2021, baseMileage: 40000, low: 8500, high: 14000, mileageRate: 0.04 },
  { make: "Ford", model: "Focus", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 11000, high: 17500, mileageRate: 0.055 },
  { make: "Ford", model: "Focus", detailIncludes: "ST", baseYear: 2021, baseMileage: 45000, low: 20500, high: 29500, mileageRate: 0.09 },
  { make: "Ford", model: "Kuga", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 14500, high: 22000, mileageRate: 0.07 },
  { make: "Vauxhall", model: "Corsa", detailIncludes: "", baseYear: 2021, baseMileage: 40000, low: 8500, high: 14500, mileageRate: 0.04 },
  { make: "Vauxhall", model: "Astra", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 10000, high: 17000, mileageRate: 0.05 },
  { make: "Vauxhall", model: "Mokka", detailIncludes: "", baseYear: 2021, baseMileage: 40000, low: 12000, high: 19000, mileageRate: 0.055 },

  // Asian / EV
  { make: "Nissan", model: "Qashqai", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 13500, high: 21000, mileageRate: 0.06 },
  { make: "Nissan", model: "Juke", detailIncludes: "", baseYear: 2021, baseMileage: 40000, low: 10500, high: 17000, mileageRate: 0.05 },
  { make: "Toyota", model: "Yaris", detailIncludes: "", baseYear: 2021, baseMileage: 40000, low: 10500, high: 17000, mileageRate: 0.045 },
  { make: "Toyota", model: "Corolla", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 14500, high: 22000, mileageRate: 0.06 },
  { make: "Toyota", model: "C-HR", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 14500, high: 22500, mileageRate: 0.06 },
  { make: "Kia", model: "Sportage", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 14500, high: 22500, mileageRate: 0.06 },
  { make: "Hyundai", model: "Tucson", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 15000, high: 23000, mileageRate: 0.06 },
  { make: "Tesla", model: "Model 3", detailIncludes: "Performance", baseYear: 2021, baseMileage: 45000, low: 23500, high: 32500, mileageRate: 0.10, ev: true },
  { make: "Tesla", model: "Model 3", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 18000, high: 27500, mileageRate: 0.085, ev: true },
  { make: "Tesla", model: "Model Y", detailIncludes: "", baseYear: 2022, baseMileage: 35000, low: 25000, high: 36000, mileageRate: 0.10, ev: true },

  // Model-level fallbacks for premium/common if detail is not selected
  { make: "BMW", model: "3 Series", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 16500, high: 24000, mileageRate: 0.095 },
  { make: "BMW", model: "4 Series", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 19000, high: 28500, mileageRate: 0.11 },
  { make: "BMW", model: "5 Series", detailIncludes: "", baseYear: 2021, baseMileage: 50000, low: 19500, high: 30000, mileageRate: 0.12 },
  { make: "Mercedes-Benz", model: "A-Class", detailIncludes: "", baseYear: 2021, baseMileage: 45000, low: 15500, high: 23500, mileageRate: 0.08 },
  { make: "Mercedes-Benz", model: "C-Class", detailIncludes: "", baseYear: 2021, baseMileage: 48000, low: 22500, high: 33500, mileageRate: 0.12 },
];

function cleanText(value) {
  return String(value || "").trim();
}

function cleanNumber(value) {
  const number = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function roundToNearestHundred(value) {
  return Math.round(value / 100) * 100;
}

function normalise(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normaliseMake(make) {
  const text = cleanText(make);
  if (text === "Mercedes") return "Mercedes-Benz";
  return text;
}

function includesDetail(modelDetail, detailIncludes) {
  if (!detailIncludes) return true;
  return normalise(modelDetail).includes(normalise(detailIncludes));
}

function getAnchor({ make, model, modelDetail }) {
  const cleanMake = normaliseMake(make);
  const cleanModel = cleanText(model);
  const detailText = cleanText(modelDetail);

  const matches = marketAnchors
    .filter((anchor) => {
      if (normalise(anchor.make) !== normalise(cleanMake)) return false;
      if (normalise(anchor.model) !== normalise(cleanModel)) return false;
      return includesDetail(detailText, anchor.detailIncludes);
    })
    .sort((a, b) => cleanText(b.detailIncludes).length - cleanText(a.detailIncludes).length);

  return matches[0] || null;
}

function getTrimFactor(modelDetail, variant) {
  const detail = `${cleanText(modelDetail)} ${cleanText(variant)}`.toLowerCase();
  let factor = 1;

  if (detail.includes("black edition")) factor *= 1.06;
  if (detail.includes("m sport")) factor *= 1.05;
  if (detail.includes("amg line")) factor *= 1.05;
  if (detail.includes("s line") || detail.includes("s-line")) factor *= 1.045;
  if (detail.includes("r line") || detail.includes("r-line")) factor *= 1.035;
  if (detail.includes("st line") || detail.includes("st-line")) factor *= 1.03;
  if (detail.includes("gt line")) factor *= 1.03;
  if (detail.includes("titanium")) factor *= 1.02;
  if (detail.includes("vignale")) factor *= 1.04;
  if (detail.includes("performance")) factor *= 1.08;
  if (detail.includes("competition")) factor *= 1.08;

  return factor;
}

function getBodyFactor(bodyType, modelDetail, variant) {
  const text = `${bodyType || ""} ${modelDetail || ""} ${variant || ""}`.toLowerCase();
  let factor = 1;

  if (text.includes("convertible")) factor *= 1.06;
  if (text.includes("coupe")) factor *= 1.03;
  if (text.includes("estate") || text.includes("touring") || text.includes("avant")) factor *= 1.02;
  if (text.includes("gran coupe")) factor *= 0.99;
  if (text.includes("mpv")) factor *= 0.96;
  if (text.includes("van")) factor *= 0.94;

  return factor;
}

function getFuelFactor(fuelType, age, anchor) {
  const fuel = cleanText(fuelType).toLowerCase();
  let factor = 1;

  if (fuel.includes("electric")) {
    factor *= age <= 3 ? 0.97 : 0.92;
  }

  if (fuel.includes("hybrid")) {
    factor *= age <= 5 ? 1.01 : 0.98;
  }

  if (fuel.includes("diesel")) {
    if (age >= 10) factor *= 0.92;
    else if (age >= 7) factor *= 0.96;
  }

  if (anchor?.ev) {
    factor *= age >= 4 ? 0.96 : 1;
  }

  return factor;
}

function getGearboxFactor(gearbox, modelDetail) {
  const box = cleanText(gearbox).toLowerCase();
  const detail = cleanText(modelDetail).toLowerCase();

  if (box.includes("automatic")) return 1.015;
  if (box.includes("manual") && (detail.includes("m3") || detail.includes("m4") || detail.includes("gt3"))) {
    return 1.03;
  }
  if (box.includes("manual")) return 0.975;

  return 1;
}

function yearFactor(year, baseYear, fuelType, anchor) {
  const numericYear = cleanNumber(year);
  const delta = numericYear - baseYear;
  const isElectric = cleanText(fuelType).toLowerCase().includes("electric") || anchor?.ev;

  if (delta === 0) return 1;

  if (delta > 0) {
    const rate = isElectric ? 1.045 : 1.075;
    return Math.pow(rate, Math.min(delta, 5)) * Math.pow(1.03, Math.max(delta - 5, 0));
  }

  const olderYears = Math.abs(delta);
  const rate = isElectric ? 0.875 : 0.895;
  return Math.pow(rate, Math.min(olderYears, 8)) * Math.pow(0.94, Math.max(olderYears - 8, 0));
}

function fallbackAgeFactor(age, fuelType) {
  const isElectric = cleanText(fuelType).toLowerCase().includes("electric");
  const base = isElectric
    ? [0.78, 0.67, 0.58, 0.49, 0.42, 0.36, 0.31, 0.27, 0.23, 0.20]
    : [0.86, 0.76, 0.67, 0.59, 0.51, 0.45, 0.39, 0.34, 0.30, 0.26, 0.23, 0.20, 0.18, 0.16, 0.145, 0.13];

  if (age < base.length) return base[age];

  return Math.max(0.08, base[base.length - 1] * Math.pow(0.94, age - base.length + 1));
}

function getNewPriceGuide({ make, model, modelDetail, variant }) {
  const cleanMake = normaliseMake(make);
  const modelKey = `${cleanMake}|${cleanText(model)}`;
  const base = modelNewPriceGuide[modelKey] || makeFallbackNewPriceGuide[cleanMake] || 24000;
  return roundToNearestHundred(base * getTrimFactor(modelDetail, variant));
}

function buildFallbackRange(input) {
  const year = cleanNumber(input.year);
  const mileage = cleanNumber(input.mileage);
  const age = Math.max(CURRENT_YEAR - year, 0);
  const newPriceGuide = getNewPriceGuide(input);
  const expectedMileage = Math.max(age, 1) * 8500;
  const mileageDelta = mileage - expectedMileage;
  const mileageRate = Math.max(0.035, Math.min(0.16, newPriceGuide * 0.0000022));

  let mid =
    newPriceGuide *
      fallbackAgeFactor(age, input.fuelType) *
      getTrimFactor(input.modelDetail, input.variant) *
      getBodyFactor(input.bodyType, input.modelDetail, input.variant) *
      getFuelFactor(input.fuelType, age, null) *
      getGearboxFactor(input.gearbox, input.modelDetail) -
    mileageDelta * mileageRate;

  mid = Math.max(mid, 1000);

  const spread =
    mid < 6000 ? 0.18 :
    mid < 12000 ? 0.15 :
    mid < 25000 ? 0.13 :
    mid < 50000 ? 0.12 :
    0.11;

  return {
    low: roundToNearestHundred(mid * (1 - spread)),
    mid: roundToNearestHundred(mid),
    high: roundToNearestHundred(mid * (1 + spread)),
    confidence: "guide",
    source: "fallback",
  };
}

function buildAnchorRange(input, anchor) {
  const year = cleanNumber(input.year);
  const mileage = cleanNumber(input.mileage);
  const age = Math.max(CURRENT_YEAR - year, 0);
  const yFactor = yearFactor(year, anchor.baseYear, input.fuelType, anchor);
  const bodyFactor = getBodyFactor(input.bodyType, input.modelDetail, input.variant);
  const trimFactor = anchor.detailIncludes ? getTrimFactor("", input.variant) : getTrimFactor(input.modelDetail, input.variant);
  const fuelFactor = getFuelFactor(input.fuelType, age, anchor);
  const gearboxFactor = getGearboxFactor(input.gearbox, input.modelDetail);
  const mileageAdjustment = (mileage - anchor.baseMileage) * (anchor.mileageRate || 0.08);

  const low = Math.max(
    1000,
    anchor.low * yFactor * bodyFactor * trimFactor * fuelFactor * gearboxFactor - mileageAdjustment
  );
  const high = Math.max(
    low + 900,
    anchor.high * yFactor * bodyFactor * trimFactor * fuelFactor * gearboxFactor - mileageAdjustment
  );
  const mid = (low + high) / 2;

  return {
    low: roundToNearestHundred(low),
    mid: roundToNearestHundred(mid),
    high: roundToNearestHundred(high),
    confidence: anchor.detailIncludes ? "strong guide" : "model guide",
    source: "anchor",
  };
}

function normaliseRange(range) {
  if (!range) return null;

  let low = cleanNumber(range.low);
  let mid = cleanNumber(range.mid);
  let high = cleanNumber(range.high);

  if (!low || !high) return null;
  if (!mid) mid = (low + high) / 2;

  low = Math.max(500, roundToNearestHundred(low));
  mid = Math.max(low, roundToNearestHundred(mid));
  high = Math.max(mid + 500, roundToNearestHundred(high));

  // Keep a minimum range so Kerb does not look falsely exact.
  const minimumSpread = Math.max(900, mid * 0.08);

  if (mid - low < minimumSpread / 2) low = roundToNearestHundred(mid - minimumSpread / 2);
  if (high - mid < minimumSpread / 2) high = roundToNearestHundred(mid + minimumSpread / 2);

  low = Math.max(500, low);
  high = Math.max(low + 500, high);

  return { ...range, low, mid, high };
}

export function calculateKerbMarketGuide(input = {}) {
  const make = normaliseMake(input.make);
  const model = cleanText(input.model);
  const year = cleanNumber(input.year);
  const mileage = cleanNumber(input.mileage);

  if (!make || !model || !year || !mileage) return null;

  if (year < 1980 || year > CURRENT_YEAR + 1 || mileage < 0 || mileage > 300000) {
    return null;
  }

  const cleanInput = {
    make,
    model,
    modelDetail: cleanText(input.modelDetail || input.model_detail),
    variant: cleanText(input.variant || input.spec),
    year,
    mileage,
    fuelType: cleanText(input.fuelType || input.fuel || input.fuel_type),
    gearbox: cleanText(input.gearbox || input.transmission),
    bodyType: cleanText(input.bodyType || input.body_type),
    condition: cleanText(input.condition),
  };

  if (cleanInput.condition.toLowerCase() === "new") {
    const newPriceGuide = getNewPriceGuide(cleanInput);
    return normaliseRange({
      low: newPriceGuide * 0.92,
      mid: newPriceGuide * 0.96,
      high: newPriceGuide * 1.02,
      confidence: "new guide",
      source: "new-price",
    });
  }

  const anchor = getAnchor(cleanInput);
  const range = anchor ? buildAnchorRange(cleanInput, anchor) : buildFallbackRange(cleanInput);

  return normaliseRange(range);
}

export function getKerbPricePosition({ askingPrice, valuation } = {}) {
  const price = cleanNumber(askingPrice);

  if (!price || !valuation?.low || !valuation?.high) return null;

  const low = cleanNumber(valuation.low);
  const high = cleanNumber(valuation.high);

  if (price < low * 0.92) {
    return {
      label: "Below guide",
      tone: "good",
      text: "Your asking price sits below the Kerb guide, which may attract more interest.",
    };
  }

  if (price <= high) {
    return {
      label: "Looks fairly priced",
      tone: "fair",
      text: "Your asking price sits inside the Kerb guide range.",
    };
  }

  if (price <= high * 1.12) {
    return {
      label: "Slightly above guide",
      tone: "watch",
      text: "Your asking price is a little above the guide, so strong photos and service history will matter.",
    };
  }

  return {
    label: "High compared with guide",
    tone: "high",
    text: "Your asking price is noticeably above the guide, so buyers may compare it closely against similar cars.",
  };
}

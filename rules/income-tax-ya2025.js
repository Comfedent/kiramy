(function (root, factory) {
  const rules = factory();
  if (typeof module === "object" && module.exports) module.exports = rules;
  else root.KiraMYIncomeTaxYA2025Rules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return {
    ruleVersion: "MY-INCOME-TAX-YA2025-v1",
    effectiveYear: "YA 2025",
    sourceName: "LHDN Malaysia — Individual tax guidance",
    sourceUrl: "https://www.hasil.gov.my/en/individual/",
    lastUpdated: "2026-06-21",
    assumptions: [
      "Resident individual progressive tax brackets for Year of Assessment 2025.",
      "Personal relief is treated as RM9,000.",
      "EPF relief is capped at RM4,000.",
      "Optional relief inputs are capped at the limits shown in the calculator UI.",
      "Zakat is treated as a direct deduction from tax payable.",
    ],
    knownLimitations: [
      "Does not replace LHDN e-Filing, PCB/MTD records, EA forms, or professional advice.",
      "Does not cover every special relief condition, spouse assessment detail, business income, tax resident edge case, or foreign-source income scenario.",
      "Future Budget announcements or LHDN guidance may change rates, rebates, or relief eligibility.",
    ],
    personalRelief: 9000,
    epfReliefCap: 4000,
    rebate: {
      chargeableIncomeMax: 35000,
      single: 400,
      married: 800,
    },
    reliefCaps: {
      lifestyle: 2500,
      insurance: 3000,
      lifeInsurance: 3000,
      education: 7000,
      medical: 8000,
      parentsMedical: 8000,
      sspn: 8000,
      travel: 1000,
    },
    brackets: [
      { min: 0, max: 5000, rate: 0 },
      { min: 5001, max: 20000, rate: 0.01 },
      { min: 20001, max: 35000, rate: 0.03 },
      { min: 35001, max: 50000, rate: 0.06 },
      { min: 50001, max: 70000, rate: 0.11 },
      { min: 70001, max: 100000, rate: 0.19 },
      { min: 100001, max: 400000, rate: 0.25 },
      { min: 400001, max: 600000, rate: 0.26 },
      { min: 600001, max: 2000000, rate: 0.28 },
      { min: 2000001, max: Infinity, rate: 0.30 },
    ],
  };
});

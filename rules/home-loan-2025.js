(function (root, factory) {
  const rules = factory();
  if (typeof module === "object" && module.exports) module.exports = rules;
  else root.KiraMYHomeLoan2025Rules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return {
    ruleVersion: "MY-HOME-LOAN-AMORTISATION-2025-v1",
    effectiveYear: "2025",
    sourceName: "Bank Negara Malaysia — Consumer information",
    sourceUrl: "https://www.bnm.gov.my/consumer-info",
    lastUpdated: "2026-06-21",
    assumptions: [
      "Uses the standard reducing-balance amortisation formula with a fixed monthly instalment.",
      "Interest rate is treated as a nominal annual rate divided into 12 monthly periods.",
      "Down payment is calculated as a percentage of property price.",
      "Yearly amortisation is grouped from monthly calculations.",
    ],
    knownLimitations: [
      "Actual bank quotations may use different daily-rest calculations, fees, lock-in terms, insurance, and approval conditions.",
      "Does not include legal fees, valuation fees, MRTA/MLTA, stamp duty, late charges, or early settlement rules.",
      "Does not assess affordability, credit eligibility, DSR, or property-specific approval constraints.",
    ],
  };
});

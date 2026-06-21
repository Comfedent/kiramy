(function (root, factory) {
  const rules = factory();
  if (typeof module === "object" && module.exports) module.exports = rules;
  else root.KiraMYCarLoan2025Rules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return {
    ruleVersion: "MY-HIRE-PURCHASE-FLAT-RATE-2025-v1",
    effectiveYear: "2025",
    sourceName: "Bank Negara Malaysia — Consumer information",
    sourceUrl: "https://www.bnm.gov.my/consumer-info",
    lastUpdated: "2026-06-21",
    assumptions: [
      "Uses the common Malaysian hire-purchase flat-rate illustration.",
      "Interest is calculated on the original financed amount for the full tenure.",
      "Monthly payment is total repayment divided by tenure in months.",
    ],
    knownLimitations: [
      "Flat rate is not the same as effective interest rate.",
      "Does not include insurance, road tax, maintenance, petrol, parking, fees, rebates, or early settlement terms.",
      "Final approval and repayment figures depend on the bank, dealer, borrower profile, and contract terms.",
    ],
  };
});

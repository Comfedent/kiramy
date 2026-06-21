(function (root, factory) {
  const rules = factory();
  if (typeof module === "object" && module.exports) module.exports = rules;
  else root.KiraMYEPF2025Rules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return {
    ruleVersion: "MY-EPF-PROJECTION-2025-v1",
    effectiveYear: "2025",
    sourceName: "KWSP / EPF — Mandatory contribution and dividend information",
    sourceUrl: "https://www.kwsp.gov.my/en/employer/responsibilities/mandatory-contribution",
    lastUpdated: "2026-06-21",
    assumptions: [
      "Projection uses user-selected employee and employer contribution rates.",
      "Salary growth and dividend rate are assumed constant over the projection period.",
      "Dividend is applied once per projected year after that year's contributions.",
    ],
    knownLimitations: [
      "KWSP payroll contributions use official wage tables, not simple percentage multiplication.",
      "Does not model withdrawals, Account 1/2/3 allocation, age-based contribution changes, or future policy revisions.",
      "Investment returns are not guaranteed and future dividend rates can differ materially.",
    ],
  };
});

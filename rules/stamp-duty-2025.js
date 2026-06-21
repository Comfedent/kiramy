(function (root, factory) {
  const rules = factory();
  if (typeof module === "object" && module.exports) module.exports = rules;
  else root.KiraMYStampDuty2025Rules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return {
    ruleVersion: "MY-STAMP-DUTY-2025-v1",
    effectiveYear: "2025",
    sourceName: "LHDN Malaysia — Stamp duty guidance",
    sourceUrl: "https://www.hasil.gov.my/en/stamp-duty/",
    lastUpdated: "2026-06-21",
    assumptions: [
      "Residential property transfer stamp duty should be calculated using Malaysian tiered rates.",
      "Buyer category, exemptions, remissions, and first-home schemes must be checked against current official guidance.",
    ],
    knownLimitations: [
      "Metadata-only placeholder for the next migration phase; the stamp-duty page still needs to consume a shared pure calculation module.",
      "Does not yet encode all exemptions, remissions, RPGT-adjacent considerations, or solicitor quotation differences.",
      "Final payable amounts should be verified with LHDN guidance and a conveyancing lawyer.",
    ],
  };
});

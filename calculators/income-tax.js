(function (root, factory) {
  const api = factory(root.KiraMYIncomeTaxYA2025Rules);
  if (typeof module === "object" && module.exports) module.exports = factory;
  else root.KiraMYIncomeTaxCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (defaultRules) {
  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  function cap(value, max) {
    return Math.min(number(value), max);
  }

  function normaliseInput(input = {}, rules = defaultRules) {
    return {
      income: number(input.income),
      epfRate: number(input.epfRate) / (number(input.epfRate) > 1 ? 100 : 1),
      marital: input.marital === "married" ? "married" : "single",
      lifestyle: cap(input.lifestyle, rules.reliefCaps.lifestyle),
      insurance: cap(input.insurance, rules.reliefCaps.insurance),
      lifeInsurance: cap(input.lifeInsurance, rules.reliefCaps.lifeInsurance),
      education: cap(input.education, rules.reliefCaps.education),
      medical: cap(input.medical, rules.reliefCaps.medical),
      parentsMedical: cap(input.parentsMedical, rules.reliefCaps.parentsMedical),
      sspn: cap(input.sspn, rules.reliefCaps.sspn),
      travel: cap(input.travel, rules.reliefCaps.travel),
      zakat: number(input.zakat),
    };
  }

  function formatBracketRange(bracket) {
    if (bracket.max === Infinity) return `${bracket.min.toLocaleString("en-MY")}+`;
    return `${(bracket.min === 0 ? 0 : bracket.min).toLocaleString("en-MY")} – ${bracket.max.toLocaleString("en-MY")}`;
  }

  function calculateIncomeTax(input = {}, rules = defaultRules) {
    if (!rules) throw new Error("Income tax rules are required.");
    const v = normaliseInput(input, rules);
    const epfDeduction = v.income * v.epfRate;
    const epfRelief = Math.min(epfDeduction, rules.epfReliefCap);
    const additionalReliefs = v.lifestyle + v.insurance + v.lifeInsurance + v.education + v.medical + v.parentsMedical + v.sspn + v.travel;
    const totalReliefs = rules.personalRelief + epfRelief + additionalReliefs;
    const chargeableIncome = Math.max(0, v.income - totalReliefs);

    let taxBeforeRebate = 0;
    const bracketDetails = rules.brackets.map((bracket) => {
      const lower = bracket.min === 0 ? 0 : bracket.min - 1;
      const upper = bracket.max === Infinity ? Infinity : bracket.max;
      const taxable = Math.max(0, Math.min(chargeableIncome, upper) - lower);
      const tax = taxable * bracket.rate;
      taxBeforeRebate += tax;
      return {
        range: formatBracketRange(bracket),
        rate: bracket.rate,
        tax,
        active: taxable > 0,
      };
    });

    let rebate = 0;
    if (chargeableIncome <= rules.rebate.chargeableIncomeMax) {
      rebate = v.marital === "married" ? rules.rebate.married : rules.rebate.single;
    }

    const finalTax = Math.max(0, taxBeforeRebate - rebate - v.zakat);
    return {
      ruleVersion: rules.ruleVersion,
      input: v,
      epfDeduction,
      epfRelief,
      personalRelief: rules.personalRelief,
      additionalReliefs,
      totalReliefs,
      chargeableIncome,
      taxBeforeRebate,
      rebate,
      zakat: v.zakat,
      finalTax,
      monthlyTax: finalTax / 12,
      effectiveRate: v.income > 0 ? finalTax / v.income * 100 : 0,
      bracketDetails,
    };
  }

  return { normaliseInput, calculateIncomeTax };
});

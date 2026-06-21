(function (root, factory) {
  const api = factory(root.KiraMYCarLoan2025Rules);
  if (typeof module === "object" && module.exports) module.exports = factory;
  else root.KiraMYCarLoanCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (defaultRules) {
  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  function calculateHirePurchase(input = {}, rules = defaultRules) {
    const carPrice = number(input.carPrice ?? input.price);
    const downPaymentPercent = Math.min(100, number(input.downPaymentPercent ?? input.down));
    const flatRate = number(input.flatRate ?? input.rate) / (number(input.flatRate ?? input.rate) > 1 ? 100 : 1);
    const years = number(input.years ?? input.tenure);
    const loanAmount = number(input.loanAmount) || carPrice * (1 - downPaymentPercent / 100);
    const downPayment = carPrice ? carPrice * downPaymentPercent / 100 : 0;
    const totalInterest = loanAmount * flatRate * years;
    const totalPayment = loanAmount + totalInterest;
    const monthlyPayment = years > 0 ? totalPayment / (years * 12) : 0;
    return {
      ruleVersion: rules?.ruleVersion,
      carPrice,
      downPaymentPercent,
      downPayment,
      loanAmount,
      flatRate,
      years,
      totalInterest,
      totalPayment,
      monthlyPayment,
    };
  }

  return { calculateHirePurchase };
});

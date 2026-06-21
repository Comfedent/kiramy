(function (root, factory) {
  const api = factory(root.KiraMYHomeLoan2025Rules);
  if (typeof module === "object" && module.exports) module.exports = factory;
  else root.KiraMYHomeLoanCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (defaultRules) {
  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  function calculateHomeLoan(input = {}, rules = defaultRules) {
    const price = number(input.price);
    const downPaymentPercent = Math.min(100, number(input.downPaymentPercent ?? input.downPct));
    const annualRate = number(input.annualRate ?? input.rate) / (number(input.annualRate ?? input.rate) > 1 ? 100 : 1);
    const years = number(input.years ?? input.tenure);
    const months = Math.round(years * 12);
    const loanAmount = number(input.loanAmount) || price * (1 - downPaymentPercent / 100);
    const downPayment = price ? price * downPaymentPercent / 100 : 0;
    const monthlyRate = annualRate / 12;

    if (loanAmount <= 0 || months <= 0) {
      return {
        ruleVersion: rules?.ruleVersion,
        price,
        downPaymentPercent,
        loanAmount: Math.max(0, loanAmount),
        downPayment,
        annualRate,
        years,
        months,
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        amortization: [],
      };
    }

    const monthlyPayment = monthlyRate === 0
      ? loanAmount / months
      : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;

    let balance = loanAmount;
    const amortization = [];
    for (let year = 1; year <= years; year += 1) {
      let principalPaid = 0;
      let interestPaid = 0;
      for (let month = 0; month < 12; month += 1) {
        if (balance <= 0) break;
        const interestForMonth = balance * monthlyRate;
        const principalForMonth = Math.min(monthlyPayment - interestForMonth, balance);
        interestPaid += interestForMonth;
        principalPaid += principalForMonth;
        balance -= principalForMonth;
      }
      amortization.push({
        year,
        principalPaid,
        interestPaid,
        balance: Math.max(0, balance),
      });
    }

    return {
      ruleVersion: rules?.ruleVersion,
      price,
      downPaymentPercent,
      loanAmount,
      downPayment,
      annualRate,
      years,
      months,
      monthlyPayment,
      totalPayment,
      totalInterest,
      amortization,
    };
  }

  return { calculateHomeLoan };
});

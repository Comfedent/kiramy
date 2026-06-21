(function (root, factory) {
  const api = factory(root.KiraMYEPF2025Rules);
  if (typeof module === "object" && module.exports) module.exports = factory;
  else root.KiraMYEPFCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (defaultRules) {
  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  function calculateEPFProjection(input = {}, rules = defaultRules) {
    const currentAge = number(input.currentAge ?? input.age);
    const retirementAge = number(input.retirementAge ?? input.retireAge);
    const monthlySalary = number(input.monthlySalary ?? input.salary);
    const employeeRate = number(input.employeeRate ?? input.empRate) / (number(input.employeeRate ?? input.empRate) > 1 ? 100 : 1);
    const employerRate = number(input.employerRate ?? input.erRate) / (number(input.employerRate ?? input.erRate) > 1 ? 100 : 1);
    const salaryIncrement = number(input.salaryIncrement ?? input.increment) / (number(input.salaryIncrement ?? input.increment) > 1 ? 100 : 1);
    const dividendRate = number(input.dividendRate ?? input.dividend) / (number(input.dividendRate ?? input.dividend) > 1 ? 100 : 1);
    const startBalance = number(input.startBalance ?? input.balance);
    const years = Math.max(0, Math.round(retirementAge - currentAge));

    let balance = startBalance;
    let salary = monthlySalary;
    let totalContributions = 0;
    let totalDividends = 0;
    const chartData = [];

    for (let year = 1; year <= years; year += 1) {
      const yearlyContribution = salary * 12 * (employeeRate + employerRate);
      totalContributions += yearlyContribution;
      balance += yearlyContribution;
      const dividend = balance * dividendRate;
      totalDividends += dividend;
      balance += dividend;
      if (year === 1 || year % 5 === 0 || year === years) {
        chartData.push({ age: currentAge + year, balance, contributions: totalContributions, dividends: totalDividends });
      }
      salary *= (1 + salaryIncrement);
    }

    return {
      ruleVersion: rules?.ruleVersion,
      years,
      finalBalance: balance,
      totalContributions,
      totalDividends,
      finalMonthlySalary: monthlySalary * Math.pow(1 + salaryIncrement, years),
      monthlyDrawdown20Years: balance / 240,
      chartData,
    };
  }

  return { calculateEPFProjection };
});

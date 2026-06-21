const test = require("node:test");
const assert = require("node:assert/strict");

const incomeTaxRules = require("../rules/income-tax-ya2025.js");
const homeLoanRules = require("../rules/home-loan-2025.js");
const epfRules = require("../rules/epf-2025.js");
const carLoanRules = require("../rules/car-loan-2025.js");

const { calculateIncomeTax } = require("../calculators/income-tax.js")(incomeTaxRules);
const { calculateHomeLoan } = require("../calculators/home-loan.js")(homeLoanRules);
const { calculateEPFProjection } = require("../calculators/epf.js")(epfRules);
const { calculateHirePurchase } = require("../calculators/car-loan.js")(carLoanRules);

test("income tax YA2025 worked example stays stable", () => {
  const result = calculateIncomeTax({ income: 60000, epfRate: 11, marital: "single" });
  assert.equal(result.ruleVersion, "MY-INCOME-TAX-YA2025-v1");
  assert.equal(result.epfRelief, 4000);
  assert.equal(result.chargeableIncome, 47000);
  assert.equal(result.taxBeforeRebate, 1320);
  assert.equal(result.finalTax, 1320);
});

test("home loan amortisation worked example stays stable", () => {
  const result = calculateHomeLoan({ loanAmount: 450000, annualRate: 4, years: 30 });
  assert.equal(result.ruleVersion, "MY-HOME-LOAN-AMORTISATION-2025-v1");
  assert.equal(Math.round(result.monthlyPayment), 2148);
  assert.equal(result.amortization.length, 30);
  assert.equal(Math.round(result.amortization.at(-1).balance), 0);
});

test("EPF projection produces expected one-year contribution and dividend", () => {
  const result = calculateEPFProjection({
    currentAge: 25,
    retirementAge: 26,
    monthlySalary: 5000,
    employeeRate: 11,
    employerRate: 13,
    salaryIncrement: 3,
    dividendRate: 5.5,
    startBalance: 0,
  });
  assert.equal(result.ruleVersion, "MY-EPF-PROJECTION-2025-v1");
  assert.equal(result.totalContributions, 14400);
  assert.equal(result.totalDividends, 792);
  assert.equal(result.finalBalance, 15192);
});

test("car hire-purchase worked example stays stable", () => {
  const result = calculateHirePurchase({ loanAmount: 80000, flatRate: 3, years: 7 });
  assert.equal(result.ruleVersion, "MY-HIRE-PURCHASE-FLAT-RATE-2025-v1");
  assert.equal(result.totalInterest, 16800);
  assert.equal(result.totalPayment, 96800);
  assert.equal(Math.round(result.monthlyPayment), 1152);
});

test("malformed calculator input is normalised instead of crashing", () => {
  const tax = calculateIncomeTax({ income: "not-a-number", epfRate: "bad" });
  assert.equal(tax.finalTax, 0);
  assert.equal(tax.chargeableIncome, 0);

  const loan = calculateHomeLoan({ price: "bad", annualRate: "bad", years: -10 });
  assert.equal(loan.monthlyPayment, 0);
  assert.deepEqual(loan.amortization, []);
});

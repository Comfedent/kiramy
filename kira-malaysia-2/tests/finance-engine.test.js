import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAffordability,
  calculateMonthlyPayment,
  compareBanks,
  simulateScenario
} from "../lib/finance-engine.js";
import { banks } from "../services/banks.js";

test("monthly payment uses standard amortisation formula", () => {
  const payment = calculateMonthlyPayment(450000, 4, 30);
  assert.equal(Math.round(payment), 2148);
});

test("affordability engine returns decision fields", () => {
  const result = calculateAffordability({
    monthlyIncome: 8000,
    monthlyExpenses: 2600,
    existingDebt: 400,
    interestRate: 4,
    tenureYears: 30
  });

  assert.equal(result.riskLevel, "Low");
  assert.equal(result.decision, "buy now");
  assert.ok(result.affordablePropertyPrice > result.safePropertyPrice);
  assert.ok(result.recommendation.includes("DSR"));
  assert.ok(result.nextActions.length >= 3);
});

test("bank comparison ranks lowest total repayment first", () => {
  const result = compareBanks({ loanAmount: 500000, tenureYears: 30, bankList: banks });
  assert.equal(result.best.name, "Public Bank");
  assert.ok(result.rows[0].totalRepayment <= result.rows[1].totalRepayment);
  assert.ok(result.recommendation.includes("ranks first"));
});

test("scenario simulator shows higher rate increases payment and interest", () => {
  const result = simulateScenario({
    baseLoanAmount: 500000,
    baseIncome: 9000,
    baseInterestRate: 4,
    baseTenureYears: 30,
    interestRateDelta: 1,
    incomeChangePercent: 0,
    tenureYearsDelta: 0,
    monthlyExpenses: 2500
  });

  assert.ok(result.monthlyPaymentDifference > 0);
  assert.ok(result.totalInterestDifference > 0);
  assert.ok(result.recommendation.includes("risk level"));
});

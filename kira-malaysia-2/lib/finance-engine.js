const DEFAULT_MAX_DSR = 0.4;
const DEFAULT_SAFE_DSR = 0.32;
const DEFAULT_FINANCING_MARGIN = 0.9;

export function normaliseNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function currency(value) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0
  }).format(normaliseNumber(value));
}

export function percent(value) {
  return `${Math.round(normaliseNumber(value) * 100)}%`;
}

export function calculateMonthlyPayment(principal, annualInterestRate, tenureYears) {
  const P = Math.max(0, normaliseNumber(principal));
  const annualRate = Math.max(0, normaliseNumber(annualInterestRate));
  const n = Math.max(1, Math.round(normaliseNumber(tenureYears) * 12));
  const r = annualRate / 100 / 12;

  if (P === 0) return 0;
  if (r === 0) return P / n;

  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calculateTotalInterest(principal, annualInterestRate, tenureYears) {
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, tenureYears);
  const months = Math.max(1, Math.round(normaliseNumber(tenureYears) * 12));
  return monthlyPayment * months - Math.max(0, normaliseNumber(principal));
}

export function principalFromMonthlyPayment(monthlyPayment, annualInterestRate, tenureYears) {
  const payment = Math.max(0, normaliseNumber(monthlyPayment));
  const annualRate = Math.max(0, normaliseNumber(annualInterestRate));
  const n = Math.max(1, Math.round(normaliseNumber(tenureYears) * 12));
  const r = annualRate / 100 / 12;

  if (payment === 0) return 0;
  if (r === 0) return payment * n;

  return payment * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
}

export function calculateDsr(totalDebt, income) {
  const monthlyIncome = Math.max(0, normaliseNumber(income));
  if (monthlyIncome === 0) return 1;
  return Math.max(0, normaliseNumber(totalDebt)) / monthlyIncome;
}

export function getRiskLevel(dsr) {
  const ratio = normaliseNumber(dsr);
  if (ratio <= 0.32) return "Low";
  if (ratio <= 0.45) return "Medium";
  return "High";
}

export function getDecision(dsr, disposableBuffer) {
  const ratio = normaliseNumber(dsr);
  const buffer = normaliseNumber(disposableBuffer);
  if (ratio <= 0.32 && buffer >= 0) return "buy now";
  if (ratio <= 0.45 && buffer >= 0) return "wait";
  return "risky";
}

export function calculateAffordability({
  monthlyIncome,
  monthlyExpenses = 0,
  existingDebt = 0,
  interestRate,
  tenureYears,
  maxDsr = DEFAULT_MAX_DSR,
  safeDsr = DEFAULT_SAFE_DSR,
  financingMargin = DEFAULT_FINANCING_MARGIN
}) {
  const income = Math.max(0, normaliseNumber(monthlyIncome));
  const expenses = Math.max(0, normaliseNumber(monthlyExpenses));
  const debts = Math.max(0, normaliseNumber(existingDebt));

  const safeMonthlyDebtCapacity = Math.max(0, income * safeDsr - debts);
  const maxMonthlyDebtCapacity = Math.max(0, income * maxDsr - debts);
  const budgetCapacity = Math.max(0, income - expenses - debts);
  const recommendedMonthlyPayment = Math.min(safeMonthlyDebtCapacity, budgetCapacity);
  const maximumMonthlyPayment = Math.min(maxMonthlyDebtCapacity, budgetCapacity);

  const recommendedLoan = principalFromMonthlyPayment(recommendedMonthlyPayment, interestRate, tenureYears);
  const maximumLoan = principalFromMonthlyPayment(maximumMonthlyPayment, interestRate, tenureYears);
  const affordablePropertyPrice = maximumLoan / financingMargin;
  const safePropertyPrice = recommendedLoan / financingMargin;
  const dsr = calculateDsr(recommendedMonthlyPayment + debts, income);
  const disposableBuffer = income - expenses - debts - recommendedMonthlyPayment;
  const riskLevel = getRiskLevel(dsr);
  const decision = getDecision(dsr, disposableBuffer);

  return {
    monthlyIncome: income,
    monthlyExpenses: expenses,
    existingDebt: debts,
    recommendedMonthlyPayment,
    maximumMonthlyPayment,
    recommendedLoan,
    maximumLoan,
    safePropertyPrice,
    affordablePropertyPrice,
    recommendedSafeLoanRange: {
      min: recommendedLoan * 0.85,
      max: recommendedLoan
    },
    dsr,
    riskLevel,
    decision,
    disposableBuffer,
    recommendation: buildAffordabilityRecommendation({ decision, riskLevel, safePropertyPrice, dsr, disposableBuffer }),
    nextActions: buildNextActions(decision)
  };
}

export function compareBanks({ loanAmount, tenureYears, rateAdjustment = 0, bankList }) {
  const principal = Math.max(0, normaliseNumber(loanAmount));
  const rows = bankList.map((bank) => {
    const effectiveRate = Math.max(0, normaliseNumber(bank.baseRate) + normaliseNumber(rateAdjustment));
    const monthlyPayment = calculateMonthlyPayment(principal, effectiveRate, tenureYears);
    const totalInterest = calculateTotalInterest(principal, effectiveRate, tenureYears);
    return {
      ...bank,
      effectiveRate,
      monthlyPayment,
      totalInterest,
      totalRepayment: principal + totalInterest
    };
  }).sort((a, b) => a.totalRepayment - b.totalRepayment);

  const best = rows[0];
  return {
    rows,
    best,
    recommendation: best
      ? `${best.name} ranks first in this scenario because it has the lowest total repayment based on the sample rate entered.`
      : "Add at least one bank option to compare repayments.",
    nextActions: [
      "Request official quotations from at least 3 banks.",
      "Compare lock-in period, MRTA/MLTA, legal fees, valuation fees, and approval terms.",
      "Do not choose on rate alone if another bank offers better flexibility or lower fees."
    ]
  };
}

export function simulateScenario({
  baseLoanAmount,
  baseIncome,
  baseInterestRate,
  baseTenureYears,
  interestRateDelta = 0,
  incomeChangePercent = 0,
  tenureYearsDelta = 0,
  monthlyExpenses = 0,
  existingDebt = 0
}) {
  const baseMonthlyPayment = calculateMonthlyPayment(baseLoanAmount, baseInterestRate, baseTenureYears);
  const scenarioRate = Math.max(0, normaliseNumber(baseInterestRate) + normaliseNumber(interestRateDelta));
  const scenarioIncome = Math.max(0, normaliseNumber(baseIncome) * (1 + normaliseNumber(incomeChangePercent) / 100));
  const scenarioTenure = Math.max(1, normaliseNumber(baseTenureYears) + normaliseNumber(tenureYearsDelta));
  const scenarioMonthlyPayment = calculateMonthlyPayment(baseLoanAmount, scenarioRate, scenarioTenure);
  const baseInterest = calculateTotalInterest(baseLoanAmount, baseInterestRate, baseTenureYears);
  const scenarioInterest = calculateTotalInterest(baseLoanAmount, scenarioRate, scenarioTenure);
  const baseDsr = calculateDsr(baseMonthlyPayment + existingDebt, baseIncome);
  const scenarioDsr = calculateDsr(scenarioMonthlyPayment + existingDebt, scenarioIncome);
  const affordability = calculateAffordability({
    monthlyIncome: scenarioIncome,
    monthlyExpenses,
    existingDebt,
    interestRate: scenarioRate,
    tenureYears: scenarioTenure
  });

  return {
    scenarioRate,
    scenarioIncome,
    scenarioTenure,
    baseMonthlyPayment,
    scenarioMonthlyPayment,
    monthlyPaymentDifference: scenarioMonthlyPayment - baseMonthlyPayment,
    baseInterest,
    scenarioInterest,
    totalInterestDifference: scenarioInterest - baseInterest,
    baseRiskLevel: getRiskLevel(baseDsr),
    scenarioRiskLevel: getRiskLevel(scenarioDsr),
    scenarioDsr,
    recommendation: buildScenarioRecommendation({
      paymentDifference: scenarioMonthlyPayment - baseMonthlyPayment,
      interestDifference: scenarioInterest - baseInterest,
      riskLevel: getRiskLevel(scenarioDsr),
      affordability
    }),
    nextActions: [
      "Stress-test the same loan with a higher rate before signing.",
      "Keep a cash buffer for renovation, insurance, maintenance, and income shocks.",
      "Compare whether a shorter or longer tenure improves your real-life flexibility."
    ]
  };
}

function buildAffordabilityRecommendation({ decision, riskLevel, safePropertyPrice, dsr, disposableBuffer }) {
  if (decision === "buy now") {
    return `You look safe to consider a property around ${currency(safePropertyPrice)} under current assumptions. Your estimated DSR is ${percent(dsr)}, which sits in the ${riskLevel.toLowerCase()} risk zone. Keep a buffer of about ${currency(disposableBuffer)} after expenses and repayments.`;
  }
  if (decision === "wait") {
    return `You may be able to buy, but the plan needs caution. Your estimated DSR is ${percent(dsr)}, so the next move is to compare a smaller property, larger down payment, or longer saving period before committing.`;
  }
  return `This scenario is risky. Your estimated DSR is ${percent(dsr)}, and the repayment could leave too little monthly buffer. Reduce the loan size, improve income stability, or wait before buying.`;
}

function buildScenarioRecommendation({ paymentDifference, interestDifference, riskLevel, affordability }) {
  const paymentDirection = paymentDifference >= 0 ? "increases" : "decreases";
  const interestDirection = interestDifference >= 0 ? "adds" : "reduces";
  return `This scenario ${paymentDirection} monthly repayment by ${currency(Math.abs(paymentDifference))} and ${interestDirection} total interest by ${currency(Math.abs(interestDifference))}. The risk level becomes ${riskLevel}. ${affordability.decision === "risky" ? "Treat this as a warning scenario, not a target." : "This remains worth comparing against official bank quotations."}`;
}

function buildNextActions(decision) {
  if (decision === "buy now") {
    return [
      "Get at least 3 bank quotations using the same loan amount and tenure.",
      "Check legal fees, valuation, insurance, and renovation costs before placing a deposit.",
      "Keep at least 3-6 months of expenses outside the down payment."
    ];
  }
  if (decision === "wait") {
    return [
      "Test a lower property price or larger down payment.",
      "Improve your cash buffer before committing.",
      "Re-run this plan with a 0.5%-1.0% higher interest rate."
    ];
  }
  return [
    "Reduce the target loan amount before requesting bank approval.",
    "Delay the purchase until DSR and cash buffer improve.",
    "Avoid using the maximum bank-approved amount as your personal budget."
  ];
}

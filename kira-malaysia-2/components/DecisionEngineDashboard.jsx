"use client";

import { useEffect, useMemo, useState } from "react";
import MetricCard from "@/components/MetricCard";
import NumberInput from "@/components/NumberInput";
import RecommendationPanel from "@/components/RecommendationPanel";
import { BankComparisonChart, LoanBreakdownChart } from "@/components/LoanCharts";
import {
  calculateAffordability,
  compareBanks,
  currency,
  percent,
  simulateScenario
} from "@/lib/finance-engine";
import { banks, bankDataDisclaimer } from "@/services/banks";
import { riskTone } from "@/services/recommendations";

const STORAGE_KEY = "kira-malaysia-2-scenarios";

export default function DecisionEngineDashboard() {
  const [income, setIncome] = useState(8500);
  const [expenses, setExpenses] = useState(2800);
  const [existingDebt, setExistingDebt] = useState(500);
  const [interestRate, setInterestRate] = useState(4);
  const [tenureYears, setTenureYears] = useState(30);
  const [loanAmount, setLoanAmount] = useState(500000);
  const [rateAdjustment, setRateAdjustment] = useState(0);
  const [interestDelta, setInterestDelta] = useState(0.5);
  const [incomeChange, setIncomeChange] = useState(0);
  const [tenureDelta, setTenureDelta] = useState(0);
  const [savedScenarios, setSavedScenarios] = useState([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedScenarios(JSON.parse(raw).slice(0, 4));
    } catch {
      setSavedScenarios([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedScenarios));
  }, [savedScenarios]);

  const affordability = useMemo(() => calculateAffordability({
    monthlyIncome: income,
    monthlyExpenses: expenses,
    existingDebt,
    interestRate,
    tenureYears
  }), [income, expenses, existingDebt, interestRate, tenureYears]);

  const bankComparison = useMemo(() => compareBanks({
    loanAmount,
    tenureYears,
    rateAdjustment,
    bankList: banks
  }), [loanAmount, tenureYears, rateAdjustment]);

  const scenario = useMemo(() => simulateScenario({
    baseLoanAmount: loanAmount,
    baseIncome: income,
    baseInterestRate: interestRate,
    baseTenureYears: tenureYears,
    interestRateDelta: interestDelta,
    incomeChangePercent: incomeChange,
    tenureYearsDelta: tenureDelta,
    monthlyExpenses: expenses,
    existingDebt
  }), [loanAmount, income, interestRate, tenureYears, interestDelta, incomeChange, tenureDelta, expenses, existingDebt]);

  function saveScenario() {
    const next = {
      id: crypto.randomUUID(),
      title: `${currency(loanAmount)} at ${scenario.scenarioRate.toFixed(2)}%`,
      payment: scenario.scenarioMonthlyPayment,
      dsr: scenario.scenarioDsr,
      risk: scenario.scenarioRiskLevel,
      interest: scenario.scenarioInterest
    };
    setSavedScenarios((items) => [next, ...items].slice(0, 4));
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <Navigation />
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-12 pt-10 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20 lg:pt-16">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-neon">
            Kira Malaysia 2.0
          </div>
          <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">
            Personal finance decisions, not just calculations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Evaluate affordability, compare Malaysian banks, simulate rate and income shocks, then get a clear recommendation and next action.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#affordability" className="rounded-full bg-neon px-5 py-3 text-sm font-bold text-ink shadow-glow">
              Start decision engine
            </a>
            <a href="#bank-comparison" className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white">
              Compare banks
            </a>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-5 md:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Decision snapshot</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <MetricCard label="Safe property range" value={currency(affordability.safePropertyPrice)} helper="Based on 32% safe DSR and current expenses." tone="green" />
            <MetricCard label="Maximum property price" value={currency(affordability.affordablePropertyPrice)} helper="Upper planning estimate, not a bank approval." tone="blue" />
            <MetricCard label="DSR" value={percent(affordability.dsr)} helper="Debt service ratio under safe payment." tone={affordability.riskLevel === "Low" ? "green" : affordability.riskLevel === "Medium" ? "amber" : "rose"} />
            <MetricCard label="Best bank scenario" value={bankComparison.best?.name || "-"} helper={`${bankComparison.best?.effectiveRate.toFixed(2)}% sample rate`} tone="amber" />
          </div>
          <div className="mt-5 rounded-3xl border border-white/10 bg-ink/30 p-5">
            <p className="text-sm text-slate-400">Current recommendation</p>
            <p className="mt-2 text-xl font-semibold text-white">{affordability.recommendation}</p>
          </div>
        </div>
      </section>

      <section id="affordability" className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <PanelHeader eyebrow="Module A" title="Affordability Engine" description="Estimate a safe property range, DSR, risk level, and buy/wait/risky recommendation." />
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <InputCard title="Your financial profile">
            <NumberInput label="Monthly income" value={income} onChange={setIncome} step={100} />
            <NumberInput label="Monthly expenses" value={expenses} onChange={setExpenses} step={100} helper="Optional, but improves the recommendation." />
            <NumberInput label="Existing monthly debt" value={existingDebt} onChange={setExistingDebt} step={100} helper="Car loan, PTPTN, credit card instalments, etc." />
            <NumberInput label="Interest rate" value={interestRate} onChange={setInterestRate} step={0.05} suffix="%" />
            <NumberInput label="Loan tenure" value={tenureYears} onChange={setTenureYears} step={1} suffix="yrs" />
          </InputCard>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard label="Max affordable property" value={currency(affordability.affordablePropertyPrice)} helper="Estimated maximum before down payment." tone="blue" />
              <MetricCard label="Safe loan range" value={`${currency(affordability.recommendedSafeLoanRange.min)} - ${currency(affordability.recommendedSafeLoanRange.max)}`} helper="Recommended planning range." tone="green" />
              <MetricCard label="DSR" value={percent(affordability.dsr)} helper="Lower is safer." tone={affordability.riskLevel === "Low" ? "green" : affordability.riskLevel === "Medium" ? "amber" : "rose"} />
              <MetricCard label="Monthly buffer" value={currency(affordability.disposableBuffer)} helper="After expenses, debt, and estimated repayment." tone="default" />
            </div>
            <RecommendationPanel
              riskLevel={affordability.riskLevel}
              decision={affordability.decision}
              text={affordability.recommendation}
              nextActions={affordability.nextActions}
            />
          </div>
        </div>
      </section>

      <section id="bank-comparison" className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <PanelHeader eyebrow="Module B" title="Bank Comparison Engine" description="Compare Malaysian bank scenarios by monthly repayment, total interest, and total repayment." />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <InputCard title="Loan scenario">
            <NumberInput label="Loan amount" value={loanAmount} onChange={setLoanAmount} step={10000} />
            <NumberInput label="Tenure" value={tenureYears} onChange={setTenureYears} step={1} suffix="yrs" />
            <NumberInput label="Rate adjustment" value={rateAdjustment} onChange={setRateAdjustment} step={0.05} suffix="%" helper="Stress-test all bank presets up or down." />
            <p className="rounded-2xl border border-amber-200/15 bg-amber-200/10 p-4 text-sm leading-6 text-amber-100">
              {bankDataDisclaimer}
            </p>
          </InputCard>

          <div className="space-y-5">
            <div className="premium-card rounded-[2rem] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neon">Best option</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{bankComparison.best?.name}</h3>
                </div>
                <span className="rounded-full bg-neon px-3 py-1 text-xs font-bold text-ink">
                  {bankComparison.best?.effectiveRate.toFixed(2)}%
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{bankComparison.recommendation}</p>
              <BankComparisonChart rows={bankComparison.rows} />
            </div>

            <div className="grid gap-3">
              {bankComparison.rows.map((bank, index) => (
                <article key={bank.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">#{index + 1} {bank.name}</p>
                      <p className="text-xs text-slate-400">{bank.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{currency(bank.monthlyPayment)} / mo</p>
                      <p className="text-xs text-slate-400">{currency(bank.totalInterest)} total interest</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="scenario" className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <PanelHeader eyebrow="Module C" title="Scenario Simulator" description="Move the sliders to see how interest, income, and tenure changes alter repayment and risk." />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <InputCard title="Stress-test variables">
            <Slider label="Interest rate change" value={interestDelta} setValue={setInterestDelta} min={-1} max={2} step={0.05} suffix="%" />
            <Slider label="Income change" value={incomeChange} setValue={setIncomeChange} min={-30} max={30} step={1} suffix="%" />
            <Slider label="Tenure change" value={tenureDelta} setValue={setTenureDelta} min={-10} max={10} step={1} suffix=" yrs" />
            <button onClick={saveScenario} className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-neon">
              Save scenario
            </button>
          </InputCard>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard label="Scenario monthly payment" value={currency(scenario.scenarioMonthlyPayment)} helper={`${currency(Math.abs(scenario.monthlyPaymentDifference))} ${scenario.monthlyPaymentDifference >= 0 ? "higher" : "lower"} vs base`} tone={scenario.monthlyPaymentDifference <= 0 ? "green" : "amber"} />
              <MetricCard label="Total interest difference" value={currency(Math.abs(scenario.totalInterestDifference))} helper={scenario.totalInterestDifference >= 0 ? "Additional interest" : "Interest saved"} tone={scenario.totalInterestDifference <= 0 ? "green" : "rose"} />
              <MetricCard label="Risk level change" value={`${scenario.baseRiskLevel} → ${scenario.scenarioRiskLevel}`} helper={`Scenario DSR: ${percent(scenario.scenarioDsr)}`} tone={scenario.scenarioRiskLevel === "Low" ? "green" : scenario.scenarioRiskLevel === "Medium" ? "amber" : "rose"} />
              <MetricCard label="Scenario income" value={currency(scenario.scenarioIncome)} helper={`${incomeChange}% income change`} tone="blue" />
            </div>
            <div className="premium-card rounded-[2rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neon">Loan breakdown</p>
              <LoanBreakdownChart principal={loanAmount} interest={scenario.scenarioInterest} />
            </div>
            <RecommendationPanel
              title="Scenario recommendation"
              riskLevel={scenario.scenarioRiskLevel}
              text={scenario.recommendation}
              nextActions={scenario.nextActions}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="premium-card rounded-[2rem] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neon">Saved scenarios</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Compare multiple decisions side-by-side</h2>
            </div>
            <button onClick={() => setSavedScenarios([])} className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200">
              Clear saved
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {savedScenarios.length ? savedScenarios.map((item) => (
              <article key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{currency(item.payment)}</p>
                <p className="mt-1 text-xs text-slate-400">Monthly repayment</p>
                <div className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${riskTone(item.risk)}`}>
                  {item.risk} risk · {percent(item.dsr)} DSR
                </div>
              </article>
            )) : (
              <p className="text-sm text-slate-400 md:col-span-4">No scenarios saved yet. Move the simulator sliders and save a scenario to compare it here.</p>
            )}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-5 pb-10 pt-4 text-sm text-slate-500 md:px-8">
        Educational estimates only. This is not financial, legal, lending, tax, or investment advice. Bank rates are sample scenario inputs, not live offers.
      </footer>
    </main>
  );
}

function Navigation() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/70 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <a href="#" className="text-lg font-black tracking-tight text-white">Kira<span className="text-neon">MY</span> 2.0</a>
        <div className="hidden items-center gap-5 text-sm font-semibold text-slate-300 md:flex">
          <a href="#affordability" className="hover:text-white">Affordability</a>
          <a href="#bank-comparison" className="hover:text-white">Banks</a>
          <a href="#scenario" className="hover:text-white">Simulator</a>
        </div>
      </nav>
    </header>
  );
}

function PanelHeader({ eyebrow, title, description }) {
  return (
    <div className="lg:sticky lg:top-28 lg:h-fit">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neon">{eyebrow}</p>
      <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">{title}</h2>
      <p className="mt-4 max-w-lg text-base leading-7 text-slate-400">{description}</p>
    </div>
  );
}

function InputCard({ title, children }) {
  return (
    <section className="premium-card h-fit rounded-[2rem] p-5 md:p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Slider({ label, value, setValue, min, max, step, suffix }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</label>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
          {value > 0 ? "+" : ""}{value}{suffix}
        </span>
      </div>
      <input
        className="range mt-3 w-full"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
      />
    </div>
  );
}

export function riskTone(riskLevel) {
  if (riskLevel === "Low") return "text-emerald-300 bg-emerald-400/10 border-emerald-300/20";
  if (riskLevel === "Medium") return "text-amber-200 bg-amber-300/10 border-amber-200/20";
  return "text-rose-200 bg-rose-300/10 border-rose-200/20";
}

export function decisionLabel(decision) {
  if (decision === "buy now") return "Buy now is reasonable";
  if (decision === "wait") return "Wait or adjust the plan";
  return "Risky under current inputs";
}

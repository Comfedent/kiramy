import { decisionLabel, riskTone } from "@/services/recommendations";

export default function RecommendationPanel({ title = "Recommendation", riskLevel, decision, text, nextActions = [] }) {
  return (
    <section className="premium-card rounded-[2rem] p-6 md:p-7">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neon">{title}</p>
        {riskLevel ? (
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskTone(riskLevel)}`}>
            {riskLevel} risk
          </span>
        ) : null}
        {decision ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
            {decisionLabel(decision)}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-lg leading-8 text-slate-100">{text}</p>
      {nextActions.length ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-white">Next actions</p>
          <ul className="mt-3 space-y-3 text-sm text-slate-300">
            {nextActions.map((action) => (
              <li key={action} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-neon" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

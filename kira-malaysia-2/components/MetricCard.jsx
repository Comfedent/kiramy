export default function MetricCard({ label, value, helper, tone = "default" }) {
  const toneClass = {
    default: "from-white/10 to-white/5",
    green: "from-emerald-400/16 to-white/5",
    blue: "from-cobalt/20 to-white/5",
    amber: "from-amber-300/18 to-white/5",
    rose: "from-rose-300/18 to-white/5"
  }[tone];

  return (
    <article className={`rounded-3xl border border-white/10 bg-gradient-to-br ${toneClass} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-400">{helper}</p> : null}
    </article>
  );
}

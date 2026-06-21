export default function NumberInput({ label, value, onChange, min = 0, step = 100, suffix, helper }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="relative">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {suffix ? <span className="pointer-events-none absolute right-4 top-3 text-sm text-slate-400">{suffix}</span> : null}
      </div>
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

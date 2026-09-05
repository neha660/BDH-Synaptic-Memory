interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: string;
}

export function Slider({ label, value, min, max, step, onChange, format, hint }: SliderProps) {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: 4 }}>
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{label}</span>
        <span className="mono" style={{ color: 'var(--accent-strong)' }}>{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }}
      />
      {hint && <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: 2 }}>{hint}</div>}
    </label>
  );
}

import { useMemo, useState } from 'react';
import { evaluateAll, capacitySweep, corruptKey, retrieve, similarity, mulberry32 } from '../lib/hebbian';
import { PatternGrid } from './PatternGrid';
import { MatrixHeatmap } from './MatrixHeatmap';
import { CapacityChart } from './CapacityChart';
import { Slider } from './Slider';

const N = 32;
const SEED = 20260905;

export interface Preset {
  label: string;
  count: number;
  similarity: number;
  decay: number;
  queryNoise: number;
  caption: string;
}

export const PRESETS: Preset[] = [
  {
    label: 'A. One association',
    count: 1,
    similarity: 0,
    decay: 1,
    queryNoise: 0,
    caption: 'Store a single key -> value pair. Retrieval is exact: nothing else is competing for the same weights.',
  },
  {
    label: 'B. Many, unrelated',
    count: 12,
    similarity: 0,
    decay: 1,
    queryNoise: 0,
    caption:
      'Store 12 pairs whose keys are close to orthogonal (unrelated topics). Retrieval degrades a little, gracefully, as superposition noise builds up.',
  },
  {
    label: 'C. Many, overlapping',
    count: 12,
    similarity: 0.8,
    decay: 1,
    queryNoise: 0,
    caption:
      'Same 12 pairs, but now the keys share structure (related topics). Interference is much worse at the same count — similarity, not just quantity, is what breaks memory.',
  },
];

interface SubstrateProps {
  onPresetChange: (index: number | null) => void;
}

export function Substrate({ onPresetChange }: SubstrateProps) {
  const [activePreset, setActivePreset] = useState<number | null>(0);
  const [count, setCount] = useState(PRESETS[0].count);
  const [simVal, setSimVal] = useState(PRESETS[0].similarity);
  const [decay, setDecay] = useState(PRESETS[0].decay);
  const [queryNoise, setQueryNoise] = useState(PRESETS[0].queryNoise);
  const [queryIndex, setQueryIndex] = useState(0);

  const applyPreset = (p: Preset, index: number) => {
    setCount(p.count);
    setSimVal(p.similarity);
    setDecay(p.decay);
    setQueryNoise(p.queryNoise);
    setQueryIndex(p.count - 1);
    setActivePreset(index);
    onPresetChange(index);
  };

  const onManualChange = () => {
    setActivePreset(null);
    onPresetChange(null);
  };

  const evalResult = useMemo(() => evaluateAll(count, N, simVal, decay, queryNoise, SEED), [count, simVal, decay, queryNoise]);

  const queriedEstimate = useMemo(() => {
    const rng = mulberry32(SEED + 999 + queryIndex);
    const cue = corruptKey(evalResult.keys[queryIndex], queryNoise, rng);
    const { estimate } = retrieve(cue, evalResult.w, N);
    return estimate;
  }, [evalResult, queryIndex, queryNoise]);

  const queriedAccuracy = similarity(queriedEstimate, evalResult.values[queryIndex]);

  const sweep = useMemo(() => capacitySweep(N, 20, simVal, decay, queryNoise, 18, SEED + 5000), [simVal, decay, queryNoise]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p, i)}
            style={{
              padding: '7px 12px',
              borderRadius: 7,
              border: activePreset === i ? '1px solid var(--accent-strong)' : '1px solid var(--border)',
              background: activePreset === i ? 'var(--accent-soft)' : 'var(--bg-panel)',
              color: 'var(--text)',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="panel two-col">
        <div>
          <Slider
            label="Associations stored (K)"
            value={count}
            min={1}
            max={16}
            step={1}
            onChange={(v) => {
              const nv = Math.round(v);
              setCount(nv);
              setQueryIndex(Math.min(queryIndex, nv - 1));
              onManualChange();
            }}
          />
          <Slider
            label="Key similarity"
            value={simVal}
            min={0}
            max={0.95}
            step={0.05}
            format={(v) => v.toFixed(2)}
            hint="0 = unrelated keys, 0.95 = near-duplicate keys"
            onChange={(v) => {
              setSimVal(v);
              onManualChange();
            }}
          />
          <Slider
            label="Recency decay"
            value={decay}
            min={0.5}
            max={1}
            step={0.02}
            format={(v) => v.toFixed(2)}
            hint="1.00 = no forgetting; lower = older writes fade (BDH's decay operator U)"
            onChange={(v) => {
              setDecay(v);
              onManualChange();
            }}
          />
          <Slider
            label="Query cue noise"
            value={queryNoise}
            min={0}
            max={0.4}
            step={0.02}
            format={(v) => `${Math.round(v * 100)}%`}
            hint="bits flipped in the retrieval cue before it's used to read"
            onChange={(v) => {
              setQueryNoise(v);
              onManualChange();
            }}
          />
          <label style={{ display: 'block', fontSize: '0.86rem', marginTop: 4 }}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Query which item?</div>
            <select
              value={queryIndex}
              onChange={(e) => {
                setQueryIndex(parseInt(e.target.value, 10));
                onManualChange();
              }}
              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
            >
              {evalResult.keys.map((_, i) => (
                <option key={i} value={i}>
                  {i === count - 1 ? `#${i + 1} (most recent)` : `#${i + 1}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <div className="eyebrow">Truth beside estimate</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Ground-truth value</div>
              <PatternGrid pattern={evalResult.values[queryIndex]} cols={8} cell={13} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                Retrieved from W (mismatches outlined)
              </div>
              <PatternGrid pattern={queriedEstimate} cols={8} cell={13} diffAgainst={evalResult.values[queryIndex]} />
            </div>
            <div style={{ minWidth: 130 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Match</div>
              <div
                className="mono"
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: queriedAccuracy > 0.85 ? 'var(--good)' : queriedAccuracy > 0.65 ? 'var(--accent-strong)' : 'var(--bad)',
                }}
              >
                {Math.round(queriedAccuracy * 100)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>bits agree with ground truth</div>
            </div>
          </div>

          <hr className="rule" style={{ margin: '18px 0' }} />

          <div className="eyebrow">Per-association accuracy right now</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 70 }}>
            {evalResult.reports.map((r) => (
              <div key={r.index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div
                  title={`#${r.index + 1}: ${Math.round(r.accuracy * 100)}%`}
                  style={{
                    width: 14,
                    height: Math.max(2, r.accuracy * 56),
                    background: r.index === queryIndex ? 'var(--accent-strong)' : 'var(--accent)',
                    opacity: r.index === queryIndex ? 1 : 0.55,
                    borderRadius: 2,
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 4 }}>
            oldest &rarr; newest, left to right. Bar height = retrieval accuracy for that association, right now.
          </div>
        </div>
      </div>

      <div className="panel sweep-grid" style={{ marginTop: 14 }}>
        <div>
          <div className="eyebrow">The shared weight matrix (&sigma;)</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            One N&times;N matrix. Every association above is superposed into these same numbers &mdash; there is no separate slot per pair.
          </div>
          <div style={{ maxWidth: 190 }}>
            <MatrixHeatmap w={evalResult.w} size={190} />
          </div>
        </div>
        <div>
          <div className="eyebrow">Live capacity sweep</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            Computed just now, in your browser, for the current similarity / decay / noise settings &mdash; not a canned illustration. Each point
            averages 18 fresh random trials.
          </div>
          <CapacityChart points={sweep} currentK={count} />
        </div>
      </div>
    </div>
  );
}

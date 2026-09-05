import type { Bipolar } from '../lib/hebbian';

interface PatternGridProps {
  pattern: Bipolar[];
  cols?: number;
  cell?: number;
  color?: string;
  diffAgainst?: Bipolar[]; // if provided, mismatched cells are highlighted
}

/** Renders a bipolar vector as a small grid of filled/empty cells. When
 * `diffAgainst` is given, cells that disagree with it are outlined in the
 * "bad" color — this is how the UI puts truth beside estimate visually. */
export function PatternGrid({ pattern, cols = 8, cell = 14, color = 'var(--accent)', diffAgainst }: PatternGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
        gap: 3,
      }}
    >
      {pattern.map((bit, i) => {
        const mismatch = diffAgainst ? diffAgainst[i] !== bit : false;
        return (
          <div
            key={i}
            title={mismatch ? 'differs from ground truth' : undefined}
            style={{
              width: cell,
              height: cell,
              borderRadius: 3,
              background: bit === 1 ? color : 'var(--bg-sunken)',
              border: mismatch ? '2px solid var(--bad)' : '1px solid var(--border)',
              boxSizing: 'border-box',
            }}
          />
        );
      })}
    </div>
  );
}

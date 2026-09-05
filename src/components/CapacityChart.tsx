interface Point {
  k: number;
  accuracy: number;
}

interface CapacityChartProps {
  points: Point[];
  currentK: number;
  width?: number;
  height?: number;
}

/** Line chart of retrieval accuracy vs. number of stored associations,
 * computed live (see hebbian.ts capacitySweep) from the learner's current
 * similarity / decay / noise settings — not a fixed illustration. A dashed
 * marker shows where the sandbox's current K sits on that curve. */
export function CapacityChart({ points, currentK, width = 560, height = 200 }: CapacityChartProps) {
  const padL = 40;
  const padB = 26;
  const padT = 10;
  const padR = 10;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const maxK = points.length ? points[points.length - 1].k : 1;

  const x = (k: number) => padL + (innerW * (k - 1)) / Math.max(1, maxK - 1);
  const y = (acc: number) => padT + innerH * (1 - acc);

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.k)} ${y(p.accuracy)}`).join(' ');
  const chanceLevelY = y(0.5);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="svg-responsive"
      style={{ maxWidth: width }}
      role="img"
      aria-label="Retrieval accuracy vs number of stored associations"
    >
      {/* gridlines at 0.5 / 1.0 accuracy */}
      <line x1={padL} x2={width - padR} y1={y(1)} y2={y(1)} stroke="var(--border)" />
      <line x1={padL} x2={width - padR} y1={chanceLevelY} y2={chanceLevelY} stroke="var(--border)" strokeDasharray="3 4" />
      <text x={padL - 8} y={y(1) + 4} textAnchor="end" fontSize="10" fill="var(--text-faint)">1.0</text>
      <text x={padL - 8} y={chanceLevelY + 4} textAnchor="end" fontSize="10" fill="var(--text-faint)">chance</text>
      <text x={padL - 8} y={y(0) + 4} textAnchor="end" fontSize="10" fill="var(--text-faint)">0.0</text>

      <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} />
      {points.map((p) => (
        <circle key={p.k} cx={x(p.k)} cy={y(p.accuracy)} r={2} fill="var(--accent)" />
      ))}

      {/* marker for current K */}
      <line x1={x(currentK)} x2={x(currentK)} y1={padT} y2={height - padB} stroke="var(--text-muted)" strokeDasharray="2 3" />
      <text x={x(currentK)} y={height - 6} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
        K={currentK}
      </text>
    </svg>
  );
}

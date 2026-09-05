interface MatrixHeatmapProps {
  w: number[][];
  size?: number;
}

/** Renders the N x N synaptic matrix (sigma / W) as a heatmap: this is the
 * one object every write updates and every read consults — making the
 * "visible state" design requirement literal. Blue = excitatory (positive),
 * rust = inhibitory (negative), intensity = magnitude. */
export function MatrixHeatmap({ w, size = 220 }: MatrixHeatmapProps) {
  const n = w.length;
  let max = 1e-6;
  for (const row of w) for (const v of row) if (Math.abs(v) > max) max = Math.abs(v);
  const cell = size / n;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="svg-responsive" style={{ maxWidth: size }} role="img" aria-label="Synaptic weight matrix heatmap">
      {w.map((row, i) =>
        row.map((v, j) => {
          const t = Math.min(1, Math.abs(v) / max);
          const color = v >= 0 ? `rgba(53, 80, 107, ${0.08 + 0.82 * t})` : `rgba(150, 65, 47, ${0.08 + 0.82 * t})`;
          return <rect key={`${i}-${j}`} x={j * cell} y={i * cell} width={cell + 0.5} height={cell + 0.5} fill={color} />;
        }),
      )}
    </svg>
  );
}

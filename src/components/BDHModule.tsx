const MAPPING = [
  { toy: 'key vector (bipolar, length 32)', bdh: 'sparse positive neuron activation x_t', note: 'BDH activations are non-negative and sparse (~5%–active per the architecture writeup), not bipolar — our toy simplifies this to make the write/read symmetric and easy to see.' },
  { toy: 'value vector', bdh: 'value v_t read out from the same activations', note: 'in BDH, x and v are both derived from the same layer’s neuron activity, so "key" and "value" are two views of one population, not two separate inputs.' },
  { toy: 'W (N×N matrix), Hebbian outer-product sum', bdh: 'sigma_t, the synaptic state', note: 'identical update shape: accumulate outer products over time, no gradient step, no optimizer.' },
  { toy: 'decay factor applied to older writes', bdh: 'the operator U in sigma_t = sigma_{t-1} + U·x_t^T v_t', note: 'Pathway’s derivation notes a diagonal U can damp older information (ALiBi-like), or encode relative position (RoPE-like).' },
  { toy: 'q · W read-out', bdh: 'o_t = x_t · sigma_t = x_t · sum_{tau<=t} x_tau^T v_tau', note: 'same equation, our q plays the role of x_t at read time.' },
];

const EVIDENCE = [
  {
    claim: 'BDH’s working memory is Hebbian synaptic plasticity, not attention over a growing cache',
    level: 'Published, primary source',
    src: 'Pathway, "The Dragon Hatchling" (arXiv:2509.26507): "working memory entirely relies on synaptic plasticity with Hebbian learning."',
  },
  {
    claim: 'Individual synapses are monosemantic (encode one recognizable concept), statistically verified',
    level: 'Published, primary source',
    src: 'Pathway, BDH interpretability chapter: monosemanticity reported at p<10⁻¹⁴; illustrated with a "currency" synapse.',
  },
  {
    claim: 'sigma_t = sigma_{t-1} + U·x_t^Tv_t is BDH’s exact synaptic update, derived from linear attention',
    level: 'Published, primary source (derivation)',
    src: 'Pathway, "From attention to synapses: deriving BDH."',
  },
  {
    claim: 'BDH-CQ accumulates ARC demonstrations into recurrent state S_t = U_theta(S_{t-1}, D_t) with zero parameter updates at inference',
    level: 'Published, primary source',
    src: 'Pathway, BDH-CQ technical report (arXiv:2608.09888).',
  },
  {
    claim: 'BDH-CQ: 29.5% pass@2 on ARC-AGI-1 at an estimated $0.00070 per task (high effort)',
    level: 'Self-reported by developer — not an independent reproduction',
    src: 'Pathway, BDH-CQ technical report; Pathway blog "Reasoning at a Fraction of the Compute."',
  },
  {
    claim: 'BDH: 97.4% on Sudoku-Extreme, versus ~0% for several general LLMs',
    level: 'Self-reported by developer, single benchmark — not a general reasoning measure',
    src: 'Pathway, "The Sudoku Test" (pathway.com/research/beyond-transformers-sudoku-bench). Uses Pathway’s internal BDH implementation, not the public toy repo.',
  },
];

export function BDHModule() {
  return (
    <div>
      <p>
        Where this shows up in BDH: BDH replaces attention-over-a-growing-cache with a single accumulating matrix
        it calls the <b>synaptic state</b>, written by exactly the Hebbian outer-product rule you just used above.
        Pathway derives it from linear attention in three steps &mdash; assume the attention similarity factorizes as{' '}
        <code>sim(q,k) = phi(q) phi(k)^T</code>, which lets the softmax-attention sum be rewritten so the model
        never needs the individual past keys again, only their running outer-product sum:
      </p>

      <div className="panel mono" style={{ fontSize: '0.92rem', overflowX: 'auto' }}>
        <div>sigma_t&nbsp; = sigma_(t-1) + U &middot; x_t<sup>T</sup> v_t &nbsp;&nbsp;<span style={{ color: 'var(--text-faint)' }}>// write: Hebbian, one outer product per token</span></div>
        <div style={{ marginTop: 6 }}>o_t&nbsp;&nbsp;&nbsp; = x_t &middot; sigma_t&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: 'var(--text-faint)' }}>// read: same shape as the "Retrieved from W" panel above</span></div>
      </div>
      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
        Source: Pathway, <a href="https://pathway.com/research/bdh-explainer/bdh-architecture-derivation" target="_blank" rel="noreferrer">
        &ldquo;From attention to synapses: deriving BDH&rdquo;</a>.
      </p>

      <h4>What maps to what</h4>
      <div className="panel table-scroll" style={{ padding: 0 }}>
        <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-sunken)' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>In the sandbox above</th>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>In BDH</th>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Caveat</th>
            </tr>
          </thead>
          <tbody>
            {MAPPING.map((m) => (
              <tr key={m.toy} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>{m.toy}</td>
                <td style={{ padding: '8px 12px', verticalAlign: 'top' }} className="mono">{m.bdh}</td>
                <td style={{ padding: '8px 12px', verticalAlign: 'top', color: 'var(--text-muted)' }}>{m.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4>What BDH-CQ does with the same idea</h4>
      <p>
        BDH-CQ turns this into in-context learning without weight updates: each demonstration pair is folded into a
        recurrent contextual state <code>S_t = U&theta;(S_(t-1), D_t)</code> &mdash; an additive, associative accumulation,
        exactly like piling more (key, value) pairs into &sigma; above. When the model then sees a query, it reasons over
        that accumulated state through several rounds of latent computation, never producing a written chain of thought,
        and never touching a trained parameter. On ARC-AGI-1 (unseen-task grid puzzles), Pathway reports this reaches{' '}
        <b>29.5% pass@2 at an estimated $0.00070 per task</b> at its highest effort setting.
      </p>

      <h4>Evidence discipline</h4>
      <div style={{ display: 'grid', gap: 8 }}>
        {EVIDENCE.map((e) => (
          <div key={e.claim} className="panel" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '0.88rem' }}>{e.claim}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span className={`tag ${e.level.startsWith('Published') ? 'sourced' : ''}`}>{e.level}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>{e.src}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

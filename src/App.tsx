import { useState } from 'react';
import { Substrate, PRESETS } from './components/Substrate';
import { BDHModule } from './components/BDHModule';

function App() {
  const [activePreset, setActivePreset] = useState<number | null>(0);
  const [selfExplain, setSelfExplain] = useState('');

  return (
    <div className="app">
      <section className="block" style={{ paddingTop: 48, borderTop: 'none' }}>
        <div className="eyebrow">DataForge &times; Pathway &middot; Explain the Frontier</div>
        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>
          One matrix, many memories &mdash; until they collide
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: 620 }}>
          A Hebbian outer-product write can pack several associations into the very same weights, with no separate
          slot per item. Below, you write those associations yourself and watch when that superposition holds up
          &mdash; and when it doesn&apos;t.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <span className="tag">For: CS/ML learners who know vectors and matrix multiplication</span>
          <span className="tag">No deep-learning background required</span>
        </div>
      </section>

      <section className="block">
        <div className="eyebrow">The claim</div>
        <div className="callout" style={{ fontSize: '1.05rem' }}>
          A single N&times;N synaptic-strength matrix, updated only by local Hebbian outer-product writes &mdash; no
          backprop, no optimizer &mdash; can store and later retrieve several distinct key&rarr;value associations
          superposed in the same weights. Retrieval degrades as more associations are packed in, and much faster
          if the associations&apos; keys overlap. This is the exact mechanism BDH uses for its synaptic state
          &sigma;, and BDH-CQ uses to accumulate task demonstrations without touching a single trained parameter.
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 10 }}>
          It&apos;s falsifiable: if packing in more associations, or making them more similar, did <i>not</i> degrade
          retrieval &mdash; or if decay did <i>not</i> trade old memories for protecting new ones &mdash; the sandbox
          below would show it immediately, because every number in it is computed from your own slider positions.
        </p>
      </section>

      <section className="block">
        <div className="eyebrow">Walk through it</div>
        <h2 style={{ fontSize: '1.3rem' }}>Three presets, one substrate</h2>
        <p>
          Each preset below sets every control in the sandbox to a specific, meaningful state. Try them in order
          &mdash; A, then B, then C &mdash; before touching a slider yourself.
        </p>
        {PRESETS.map((p, i) => (
          <div key={p.label} className="panel" style={{ marginBottom: 10, borderColor: activePreset === i ? 'var(--accent)' : undefined }}>
            <b>{p.label}</b>
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{p.caption}</p>
          </div>
        ))}
      </section>

      <section className="block">
        <div className="eyebrow">The substrate &mdash; live, in your browser</div>
        <h2 style={{ fontSize: '1.3rem' }}>Write associations. Break them. Watch why.</h2>
        <span className="tag live" style={{ marginBottom: 14, display: 'inline-block' }}>Live computation &mdash; nothing here is precomputed or animated</span>
        <Substrate onPresetChange={setActivePreset} />
      </section>

      <section className="block">
        <div className="eyebrow">Where this lives in BDH</div>
        <h2 style={{ fontSize: '1.3rem' }}>Same write rule, a real 150M&ndash;parameter model</h2>
        <span className="tag toy" style={{ marginBottom: 14, display: 'inline-block' }}>Sandbox above = independent toy re-implementation, not the official BDH model</span>
        <BDHModule />
      </section>

      <section className="block">
        <div className="eyebrow">Limitations &amp; common misconceptions</div>
        <h2 style={{ fontSize: '1.3rem' }}>What this does <i>not</i> show</h2>
        <div className="panel" style={{ marginBottom: 10 }}>
          <b>&ldquo;Isn&apos;t this just attention with extra steps?&rdquo;</b>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            No &mdash; that&apos;s the point. Standard attention keeps every past key and value around and compares
            the current query against all of them (a cache that grows with the sequence). Here, and in BDH, the past
            is compressed into one fixed-size matrix the moment it&apos;s written; nothing is retrieved by scanning
            history; there is no cache to grow. The cost is exactly what you saw: superposed associations interfere.
          </p>
        </div>
        <div className="panel" style={{ marginBottom: 10 }}>
          <b>Toy scale, not BDH scale</b>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            N=32 here versus thousands of neurons per layer in real BDH models, and our keys/values are random
            bipolar noise, not learned representations of language. The interference <i>pattern</i> transfers; the
            specific numbers (97.4% Sudoku, 29.5% ARC-AGI-1) do not &mdash; those are Pathway&apos;s own reported
            results on the real system, not something this sandbox reproduces or verifies independently.
          </p>
        </div>
        <div className="panel">
          <b>Decay is a trade, not a free upgrade</b>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Turning recency decay up protects the newest associations, but it does so by actively erasing older ones
            faster than they&apos;d fade on their own &mdash; try preset B, then drag decay down while querying
            association #1. This is a real capacity/recency trade-off, not a strictly better setting.
          </p>
        </div>
      </section>

      <section className="block">
        <div className="eyebrow">Explain it back</div>
        <h2 style={{ fontSize: '1.3rem' }}>In your own words</h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          Before you move on: write two or three sentences answering (1) why several associations can share one
          matrix at all, (2) what makes retrieval fail, and (3) one thing BDH does with this that a Transformer&apos;s
          KV-cache doesn&apos;t. This box isn&apos;t sent anywhere &mdash; it&apos;s only here to make you produce the
          explanation, which is the actual test of whether the sandbox worked.
        </p>
        <textarea
          value={selfExplain}
          onChange={(e) => setSelfExplain(e.target.value)}
          placeholder="e.g. Because writes are additive outer products into the same matrix, so..."
          style={{
            width: '100%',
            minHeight: 100,
            padding: 12,
            borderRadius: 8,
            border: '1px solid var(--border)',
            fontFamily: 'var(--sans)',
            fontSize: '0.94rem',
            resize: 'vertical',
          }}
        />
      </section>

      <footer>
        <hr className="rule" />
        <p>
          Built for DataForge x Rime &middot; Pathway &ldquo;Explain the Frontier&rdquo; track (NeurIPS 2026 Education
          Track submission). Concept: Synaptic Plasticity as Short-Term Memory, paired with Associative Memory and
          Fast Weights.
        </p>
        <p>
          The concept, active now, independent of BDH: Behrouz et al.,{' '}
          <a href="https://arxiv.org/abs/2501.00663" target="_blank" rel="noreferrer">Titans: Learning to Memorize at Test Time</a> (arXiv:2501.00663, 2025); Sun et al.,{' '}
          <a href="https://arxiv.org/abs/2407.04620" target="_blank" rel="noreferrer">Learning to (Learn at Test Time): RNNs with Expressive Hidden States</a> (arXiv:2407.04620, 2024); Yang et al.,{' '}
          <a href="https://arxiv.org/abs/2406.06484" target="_blank" rel="noreferrer">Parallelizing Linear Transformers with the Delta Rule over Sequence Length</a> (arXiv:2406.06484, 2024) &mdash; three independent, non-Pathway systems built on the same fixed-size,
          write-at-inference mechanism this artifact demonstrates.
        </p>
        <p>
          On BDH/BDH-CQ specifically: Pathway, <a href="https://arxiv.org/abs/2509.26507" target="_blank" rel="noreferrer">
          &ldquo;The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain&rdquo;</a> (arXiv:2509.26507); Pathway,{' '}
          <a href="https://arxiv.org/abs/2608.09888" target="_blank" rel="noreferrer">BDH-CQ: In-Context Learning with Recurrent Latent Reasoning</a> (arXiv:2608.09888); Pathway,{' '}
          <a href="https://pathway.com/research/bdh-explainer" target="_blank" rel="noreferrer">BDH explainer series</a>. Background precursor (outside the 2022&ndash;2026 window, cited for the linear-attention derivation only): Schlag, Irie &amp; Schmidhuber,{' '}
          <a href="https://arxiv.org/abs/2102.11174" target="_blank" rel="noreferrer">Linear Transformers Are Secretly Fast Weight Programmers</a> (2021). See the README for two further 2022&ndash;2026 papers with per-claim citations.
        </p>
        <p>Source code, license and disclosures: see the accompanying repository README.</p>
      </footer>
    </div>
  );
}

export default App;

# Synapses as Memory

**DataForge × Rime — Pathway "Explain the Frontier" track (NeurIPS 2026 Education Track submission)**

**Team:** AXIOM3
**Concept:** *Synaptic Plasticity as Short-Term Memory*, paired with *Associative Memory and Fast Weights* (one coherent artifact, one central claim)
**Live artifact:** https://claude.ai/code/artifact/5a3c5361-d40b-4ea8-b1bc-5e98e9e3e128 
**Repository:** _this repository_
**One-page concept summary:** `dataforge-concept-summary.pdf` (submitted alongside this repo)
**Live artifact:** https://neha660.github.io/BDH-Synaptic-Memory/ 
**Bonus blog post (distinct topic):** `dataforge-blog-post.pdf` — "The Synapse That Never Sleeps," on the biological-memory-consolidation gap in BDH's fast synaptic state, submitted alongside this repo

---

## 1. The one-sentence claim

> A single N×N synaptic-strength matrix, updated only by local Hebbian outer-product writes — no backprop, no optimizer — can store and later retrieve several distinct key→value associations superposed in the same weights. Retrieval degrades as more associations are packed in, and much faster if the associations' keys overlap. This is the exact mechanism BDH uses for its synaptic state σ, and BDH-CQ uses to accumulate task demonstrations without touching a single trained parameter.

It is falsifiable: if packing in more associations, or making them more similar, did **not** degrade retrieval — or if recency decay did **not** trade old memories away to protect new ones — the sandbox would show it immediately, because every number on the page is computed live from the learner's own control settings.

## 2. Intended learner, prerequisites, learning objectives

**Audience:** undergraduate/graduate CS or ML students, or working engineers, who know what a vector and a matrix multiplication are. No deep learning background is assumed.

**Prerequisites:** basic linear algebra (dot product, outer product); the idea of a neural network layer is helpful but not required — everything the artifact needs is built from first principles.

**Learning objectives.** After using the artifact, a learner should be able to:

1. Explain how a single weight matrix can hold more than one association at once (superposition via additive outer products).
2. Predict, before dragging a slider, whether raising the number of stored associations or their key-similarity will hurt retrieval more, and why.
3. State what a recency-decay term buys (protecting the newest writes) and what it costs (forgetting older ones faster).
4. Identify where this exact mechanism appears in BDH (the synaptic state σ) and in BDH-CQ (the recurrent contextual state), and name one way it differs from a Transformer's KV-cache.
5. Name at least one limitation of the toy substrate relative to the real, published BDH system.

## 3. What "the sixty-second test" looks like here

Open the page → preset **A** is already running (not a blank canvas) → click **B**, then **C**, watching the match percentage and the per-association bars → that alone is the 60-second version of the lesson: same K, same N, only the key-similarity changed, and retrieval collapsed. Everything after that (free sliders, the BDH module, the limitations) is for a learner who wants to go deeper.

## 4. Architecture of the artifact

Single-page React + TypeScript + Vite app, no backend, no external API calls at runtime (only Google Fonts for typography).

```
src/
  lib/hebbian.ts        # the entire simulation: pure functions, no React, no side effects
  components/
    Substrate.tsx        # wires the sim to controls + visualizations (the sandbox)
    PatternGrid.tsx       # renders a bipolar vector as a small grid ("truth beside estimate")
    MatrixHeatmap.tsx     # renders the N×N synaptic matrix as a heatmap
    CapacityChart.tsx     # SVG line chart of the live capacity sweep
    Slider.tsx             # labeled range input
    BDHModule.tsx          # equations, term-mapping table, evidence-discipline panel
  App.tsx                # narrative: claim -> guided walkthrough -> sandbox -> BDH module -> limitations -> self-explain -> sources
```

### Role of every major component

| Component | Role | Live / precomputed / synthetic / animated |
|---|---|---|
| `hebbian.ts` | Implements the write rule `W += decay^age · outer(key, value)` and the read rule `estimate = sign(query · W)`, plus a seeded PRNG for reproducible-but-random pattern generation. | **Live.** Runs entirely in the browser on every control change. |
| `Substrate.tsx` sandbox (grids, match %, per-item bars, matrix heatmap) | Builds a memory from the current K / similarity / decay / query-noise settings and displays the actual result. | **Live**, computed from real data structures — not an illustration of a result computed elsewhere. |
| Capacity sweep chart | Runs 18 independent random trials for each K from 1–20 under the *current* similarity/decay/noise settings, right when a slider changes. | **Live**, recomputed on demand (not a fixed dataset). |
| BDH equations, mapping table, evidence panel | Quotes Pathway's own derivation and results. | **Sourced / precomputed** — these are the published system's own reported numbers, clearly labeled as self-reported by the developer where that is the case (see §6). Not reproduced or verified independently by this project. |
| Everything else (narrative text, presets, limitations, self-explain box) | Pedagogical scaffolding. | Static text; the self-explain box is a local `<textarea>` that stores nothing and sends nothing anywhere. |

**Nothing in this artifact is a scripted animation presented as live model behavior.** The only non-live numbers are BDH/BDH-CQ's own published results, and they are labeled as such everywhere they appear.

### Why this substrate, and how it maps to BDH

Pathway derives BDH's synaptic state as (see `pathway.com/research/bdh-explainer/bdh-architecture-derivation`):

```
sigma_t = sigma_(t-1) + U · x_t^T v_t      (write — Hebbian outer-product accumulation)
o_t     = x_t · sigma_t                     (read  — same matrix, no growing cache)
```

The sandbox implements exactly this write/read pair at N=32 with bipolar vectors instead of BDH's sparse positive activations, which is what makes retrieval symmetric and easy to see with the naked eye. The in-app **"What maps to what"** table spells out every simplification. This is an **independent toy re-implementation built for this explainer — it is not the official BDH model**, does not use BDH's trained weights, and does not reproduce BDH's reported numbers (97.4% Sudoku-Extreme, 29.5% pass@2 on ARC-AGI-1 for BDH-CQ). Those numbers are Pathway's own, cited from their papers and blog, and presented as such.

## 5. How to run it

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

No environment variables, no API keys, no backend service required. Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages) for the public artifact URL — the whole thing is static HTML/CSS/JS.

### How to reproduce every number on the page

Everything is deterministic given the seed in `src/components/Substrate.tsx` (`SEED = 20260905`) and the slider values, which are printed next to each slider. To check a specific claim (e.g. "12 correlated associations retrieve worse than 12 uncorrelated ones"), open `src/lib/hebbian.ts` in a plain Node/TS REPL and call `evaluateAll(...)` directly with the same arguments — no browser required.

## 6. Sources and evidence discipline

**Primary sources on BDH / BDH-CQ:**

- Pathway. *The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain.* [arXiv:2509.26507](https://arxiv.org/abs/2509.26507). — Hebbian working-memory claim; monosemantic synapses (p<10⁻¹⁴); sparse positive activations; scale-free connectivity.
- Pathway. *BDH-CQ: In-Context Learning with Recurrent Latent Reasoning.* [arXiv:2608.09888](https://arxiv.org/abs/2608.09888). — Contextual state `S_t = U_θ(S_{t-1}, D_t)`; ARC-AGI-1 results; zero-parameter-update inference.
- Pathway. *BDH explainer series* — [Ch.1](https://pathway.com/research/bdh-explainer/brain-inspired-ai-architecture), [Ch.2: From attention to synapses](https://pathway.com/research/bdh-explainer/bdh-architecture-derivation), [Ch.3: interpretability & scaling](https://pathway.com/research/bdh-explainer/bdh-interpretability-scaling), [conclusion](https://pathway.com/research/bdh-explainer/conclusion). — the σ derivation used directly by this artifact.
- Pathway. *The Equations of Reasoning.* [pathway.com/research/the-equations-of-reasoning](https://pathway.com/research/the-equations-of-reasoning). — the 4-round local update cycle (memory read / memory write / context gating / loop closure).
- Pathway. *The Sudoku Test.* [pathway.com/research/beyond-transformers-sudoku-bench](https://pathway.com/research/beyond-transformers-sudoku-bench). — 97.4% Sudoku-Extreme result (Pathway's internal implementation, not the public toy repo).
- Pathway. *Reasoning at a Fraction of the Compute* (BDH-CQ announcement). [pathway.com/research/introducing-bdh-cq](https://pathway.com/research/introducing-bdh-cq).
- [pathwaycom/bdh](https://github.com/pathwaycom/bdh) — official minimal/toy BDH implementation, MIT licensed. Consulted for the exact sparse-ReLU / Hebbian-interaction code shape; **not used or vendored in this project** — our simulation is an original, independent implementation of the same equation at a much smaller scale.

**Primary papers (2022–2026) on the selected concept (synaptic plasticity as short-term memory / associative memory & fast weights), cited beside the claims they support in-app and in §4 above:**

1. Irie, K. et al. *Fast weight programming and linear transformers: from machine learning to neurobiology.* [arXiv:2508.08435](https://arxiv.org/abs/2508.08435) (2025). — Direct machine-learning ↔ neurobiology bridge for fast weights as synaptic plasticity; motivates treating our sandbox's W as a plausible model of biological short-term synaptic memory, not only an ML abstraction.
2. *Enabling Robust In-Context Memory and Rapid Task Adaptation in Transformers with Hebbian and Gradient-Based Plasticity.* [arXiv:2510.21908](https://arxiv.org/abs/2510.21908) (2025). — Empirically compares a neuromodulated Hebbian fast-weight rule against gradient-based plasticity for in-context adaptation; motivates the "Hebbian plasticity vs. static weights" boundary condition discussed in the Limitations section.
3. Yang, S. et al. *Parallelizing Linear Transformers with the Delta Rule over Sequence Length* (DeltaNet). [arXiv:2406.06484](https://arxiv.org/abs/2406.06484) (2024). — A more expressive fast-weight write rule (delta rule) than plain Hebbian outer products; used in-app to caveat that BDH's plain Hebbian write is one point in a larger design space of fast-weight update rules.
4. Sun, Y. et al. *Learning to (Learn at Test Time): RNNs with Expressive Hidden States* (TTT layers). [arXiv:2407.04620](https://arxiv.org/abs/2407.04620) (2024). — Makes the hidden state itself a small model updated by a self-supervised gradient step at inference; the gradient-based counterpart to BDH's plain Hebbian write, and the direct predecessor Titans (below) builds on.
5. Behrouz, A. et al. *Titans: Learning to Memorize at Test Time.* [arXiv:2501.00663](https://arxiv.org/abs/2501.00663) (2025). — A contemporary fixed-size, test-time-updated memory module for long-context modeling; comparison point for BDH's own recurrent associative state.
6. *Where to Bind Matters: Hebbian Fast Weights in Vision Transformers for Few-Shot Character Recognition.* [arXiv:2605.02920](https://arxiv.org/abs/2605.02920) (2026). — Shows the same write/read pattern (Hebbian fast weights for rapid few-shot binding) applied outside language, reinforcing that this is a general mechanism, not a language-model-specific trick.

All six are independent of Pathway — none are BDH/BDH-CQ papers — and all fall inside the 2022–2026 window; #3–#5 (DeltaNet, TTT, Titans) are the ones most likely to be already familiar to judges.

**Fonts:** IBM Plex Sans / IBM Plex Mono, served via Google Fonts, SIL Open Font License 1.1.
**Icon:** the browser-tab icon is a small inline SVG authored for this project (no external asset).
**Code/assets not otherwise credited above are original to this project.**

## 7. AI assistance disclosure

This project's code, component structure, styling, the Hebbian simulation, and explanatory text were drafted with the assistance of Claude (Anthropic), used as a coding and writing assistant throughout. Concept selection, the pedagogical structure (claim → guided walkthrough → sandbox → BDH module → limitations → self-explain), the mapping between the toy substrate and BDH's published equations, and verification of every technical claim against the primary sources listed in §6 were reviewed by the author. Per the hackathon rules, the author is prepared to trace, explain, and defend every component of this submission, distinguish live computation from precomputed/sourced results, and predict the effect of changing any control.

## 8. Limitations (see also the in-app "Limitations & misconceptions" section)

- N=32 here vs. thousands of neurons per BDH layer; our keys/values are random bipolar noise, not learned language representations.
- The toy substrate's *pattern* of behavior (interference, capacity limits, decay trade-offs) is a general property of Hebbian/correlation-matrix associative memories, established in the classical associative-memory literature and reproduced live in-app — it is evidence *for the mechanism*, not a reproduction of BDH's specific reported numbers.
- BDH's and BDH-CQ's headline results (Sudoku-Extreme 97.4%, ARC-AGI-1 29.5% pass@2 at $0.00070/task) are self-reported by the developer (Pathway) in their own papers/blog; this submission has not independently reproduced them and says so explicitly wherever they are cited.

## License

Code in this repository: MIT License (see `LICENSE`).

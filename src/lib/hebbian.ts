// ---------------------------------------------------------------------------
// hebbian.ts
//
// A real, tiny hetero-associative memory built from a single Hebbian
// outer-product update rule:
//
//     W  <-  decay * W  +  key_i^T · value_i         (write, one per pattern)
//     y  =   sign( q · W )                            (read, given a query key)
//
// This is not an animation. Every number this module produces is computed
// from the sliders the learner actually moves. It is a deliberately small,
// independent toy re-implementation written for this explainer — it is NOT
// the official Dragon Hatchling (BDH) model and does not reproduce BDH's
// reported numbers. What it DOES reproduce faithfully is the equation:
// Pathway's own derivation writes BDH's synaptic state update as
//
//     sigma_t = sigma_{t-1} + U · x_t^T v_t
//
// (sigma is the N x N synaptic-strength matrix, x the sparse neuron
// activation, v the value, U an optional decay/positional operator) and its
// readout as
//
//     o_t = x_t · sigma_t = x_t · sum_{tau<=t} x_tau^T v_tau
//
// which is exactly the write/read pair implemented below, at a scale a
// learner can see with their own eyes.
// Source: Pathway, "From attention to synapses: deriving BDH"
// (pathway.com/research/bdh-explainer/bdh-architecture-derivation).
// ---------------------------------------------------------------------------

export type Bipolar = 1 | -1;

/** Deterministic, seedable PRNG (mulberry32) so a given control state always
 * reproduces the same patterns — important for an explainer where the
 * learner should be able to trust that nothing is secretly randomized on
 * every render. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBipolarVector(n: number, rng: () => number): Bipolar[] {
  const v: Bipolar[] = new Array(n);
  for (let i = 0; i < n; i++) v[i] = rng() < 0.5 ? -1 : 1;
  return v;
}

/** Produce `count` bipolar key vectors of length `n`. `similarity` in [0,1]
 * controls how much each key shares with a single common "template" vector —
 * 0 gives (approximately) orthogonal random keys, values close to 1 give
 * heavily overlapping keys, which is what makes associations interfere. */
export function generateKeys(
  count: number,
  n: number,
  similarity: number,
  rng: () => number,
): Bipolar[][] {
  const template = randomBipolarVector(n, rng);
  const keys: Bipolar[][] = [];
  for (let i = 0; i < count; i++) {
    const key: Bipolar[] = new Array(n);
    for (let j = 0; j < n; j++) {
      key[j] = rng() < similarity ? template[j] : (rng() < 0.5 ? -1 : 1);
    }
    keys.push(key);
  }
  return keys;
}

export function generateValues(count: number, n: number, rng: () => number): Bipolar[][] {
  const values: Bipolar[][] = [];
  for (let i = 0; i < count; i++) values.push(randomBipolarVector(n, rng));
  return values;
}

/** Build the synaptic matrix W (N x N) by writing each (key, value) pair as a
 * Hebbian outer-product update, with optional exponential recency decay —
 * the discrete analogue of BDH's decay operator U damping older writes. */
export function buildMemory(
  keys: Bipolar[][],
  values: Bipolar[][],
  n: number,
  decay: number,
): number[][] {
  const w: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const k = keys.length;
  for (let i = 0; i < k; i++) {
    const age = k - 1 - i; // 0 = most recent
    const weight = Math.pow(decay, age);
    const key = keys[i];
    const value = values[i];
    for (let a = 0; a < n; a++) {
      const rowW = w[a];
      const ka = key[a] * weight;
      for (let b = 0; b < n; b++) {
        rowW[b] += ka * value[b];
      }
    }
  }
  return w;
}

/** Apply `noiseFrac` random bit-flips to a key, simulating a partial / noisy
 * retrieval cue rather than an exact copy of the stored key. */
export function corruptKey(key: Bipolar[], noiseFrac: number, rng: () => number): Bipolar[] {
  return key.map((bit) => (rng() < noiseFrac ? ((bit * -1) as Bipolar) : bit));
}

/** Read the memory: q . W, thresholded back to bipolar. This is the literal
 * BDH readout o_t = x_t . sigma_t applied to our toy sigma. */
export function retrieve(query: Bipolar[], w: number[][], n: number): { raw: number[]; estimate: Bipolar[] } {
  const raw = new Array(n).fill(0);
  for (let a = 0; a < n; a++) {
    const qa = query[a];
    const rowW = w[a];
    for (let b = 0; b < n; b++) raw[b] += qa * rowW[b];
  }
  const estimate = raw.map((v) => (v >= 0 ? 1 : -1)) as Bipolar[];
  return { raw, estimate };
}

/** Fraction of bits that agree between two bipolar vectors, in [0,1]. */
export function similarity(a: Bipolar[], b: Bipolar[]): number {
  let agree = 0;
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) agree++;
  return agree / a.length;
}

export interface RetrievalReport {
  index: number;
  accuracy: number;
}

/** Build a memory for the given state and report retrieval accuracy for
 * every stored pair — this is what powers the per-item bar chart showing
 * which associations survived and which were overwritten / interfered with. */
export function evaluateAll(
  count: number,
  n: number,
  simVal: number,
  decay: number,
  queryNoise: number,
  seed: number,
): { keys: Bipolar[][]; values: Bipolar[][]; w: number[][]; reports: RetrievalReport[] } {
  const rng = mulberry32(seed);
  const keys = generateKeys(count, n, simVal, rng);
  const values = generateValues(count, n, rng);
  const w = buildMemory(keys, values, n, decay);
  const reports: RetrievalReport[] = [];
  for (let i = 0; i < count; i++) {
    const cue = corruptKey(keys[i], queryNoise, rng);
    const { estimate } = retrieve(cue, w, n);
    reports.push({ index: i, accuracy: similarity(estimate, values[i]) });
  }
  return { keys, values, w, reports };
}

/** Live capacity sweep: for K = 1..maxK, run `trials` independent random
 * memories and average the most-recent-item retrieval accuracy. Computed on
 * demand in the browser from the current similarity/decay/noise settings —
 * not a canned curve — so the shape the learner sees is honestly theirs. */
export function capacitySweep(
  n: number,
  maxK: number,
  simVal: number,
  decay: number,
  queryNoise: number,
  trials: number,
  seed: number,
): { k: number; accuracy: number }[] {
  const out: { k: number; accuracy: number }[] = [];
  let seedCounter = seed;
  for (let k = 1; k <= maxK; k++) {
    let total = 0;
    for (let t = 0; t < trials; t++) {
      seedCounter += 1;
      const rng = mulberry32(seedCounter);
      const keys = generateKeys(k, n, simVal, rng);
      const values = generateValues(k, n, rng);
      const w = buildMemory(keys, values, n, decay);
      const cue = corruptKey(keys[k - 1], queryNoise, rng);
      const { estimate } = retrieve(cue, w, n);
      total += similarity(estimate, values[k - 1]);
    }
    out.push({ k, accuracy: total / trials });
  }
  return out;
}

"use client";

import { useMemo, useState } from "react";
import { VizFrame } from "./stepper";
import { logChoose, logGamma, normalPdf } from "./statsMath";

export function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; format?: (value: number) => string }) {
  return (
    <label className="lab-control">
      <span>{label}</span>
      <output>{format ? format(value) : value}</output>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

type Params = Record<string, number>;

interface Dist {
  label: string;
  discrete: boolean;
  params: { key: string; label: string; min: number; max: number; step: number; init: number }[];
  range: (p: Params) => [number, number];
  f: (x: number, p: Params) => number;
  mean: (p: Params) => number | null;
  variance: (p: Params) => number | null;
  use: string;
}

const tPdf = (x: number, v: number) => Math.exp(logGamma((v + 1) / 2) - logGamma(v / 2) - 0.5 * Math.log(v * Math.PI) - ((v + 1) / 2) * Math.log(1 + (x * x) / v));
const chi2Pdf = (x: number, k: number) => (x <= 0 ? 0 : Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.LN2 - logGamma(k / 2)));
const fPdf = (x: number, a: number, b: number) =>
  x <= 0 ? 0 : Math.exp(logGamma((a + b) / 2) - logGamma(a / 2) - logGamma(b / 2) + (a / 2) * Math.log(a / b) + (a / 2 - 1) * Math.log(x) - ((a + b) / 2) * Math.log(1 + (a * x) / b));

const DISTS: Record<string, Dist> = {
  bernoulli: { label: "Bernoulli", discrete: true, params: [{ key: "p", label: "Success probability p", min: 0.01, max: 0.99, step: 0.01, init: 0.3 }], range: () => [0, 1], f: (x, { p }) => (x === 1 ? p : 1 - p), mean: ({ p }) => p, variance: ({ p }) => p * (1 - p), use: "One yes-or-no outcome, such as whether a visitor converted." },
  binomial: { label: "Binomial", discrete: true, params: [{ key: "n", label: "Trials n", min: 1, max: 60, step: 1, init: 20 }, { key: "p", label: "Success probability p", min: 0.01, max: 0.99, step: 0.01, init: 0.3 }], range: ({ n }) => [0, n], f: (x, { n, p }) => Math.exp(logChoose(n, x) + x * Math.log(p) + (n - x) * Math.log(1 - p)), mean: ({ n, p }) => n * p, variance: ({ n, p }) => n * p * (1 - p), use: "Number of conversions out of n independent visitors." },
  geometric: { label: "Geometric", discrete: true, params: [{ key: "p", label: "Success probability p", min: 0.05, max: 0.9, step: 0.01, init: 0.25 }], range: () => [1, 25], f: (x, { p }) => (1 - p) ** (x - 1) * p, mean: ({ p }) => 1 / p, variance: ({ p }) => (1 - p) / p ** 2, use: "Number of attempts up to and including the first success." },
  poisson: { label: "Poisson", discrete: true, params: [{ key: "l", label: "Rate λ", min: 0.5, max: 30, step: 0.5, init: 4 }], range: ({ l }) => [0, Math.ceil(l + 5 * Math.sqrt(l) + 3)], f: (x, { l }) => Math.exp(x * Math.log(l) - l - logGamma(x + 1)), mean: ({ l }) => l, variance: ({ l }) => l, use: "Count of independent events in a fixed period, such as support tickets per hour." },
  uniform: { label: "Uniform", discrete: false, params: [{ key: "a", label: "Lower bound a", min: -5, max: 4, step: 0.5, init: 0 }, { key: "w", label: "Width", min: 1, max: 10, step: 0.5, init: 4 }], range: ({ a, w }) => [a - 1, a + w + 1], f: (x, { a, w }) => (x >= a && x <= a + w ? 1 / w : 0), mean: ({ a, w }) => a + w / 2, variance: ({ w }) => w ** 2 / 12, use: "Every value in a range is equally likely, as in random assignment buckets." },
  normal: { label: "Normal", discrete: false, params: [{ key: "m", label: "Mean μ", min: -5, max: 5, step: 0.1, init: 0 }, { key: "s", label: "Standard deviation σ", min: 0.3, max: 4, step: 0.1, init: 1 }], range: ({ m, s }) => [m - 4 * s, m + 4 * s], f: (x, { m, s }) => normalPdf(x, m, s), mean: ({ m }) => m, variance: ({ s }) => s ** 2, use: "The limiting shape of averages. Sets μ=0, σ=1 for the standard normal." },
  exponential: { label: "Exponential", discrete: false, params: [{ key: "l", label: "Rate λ", min: 0.1, max: 4, step: 0.1, init: 1 }], range: ({ l }) => [0, 6 / l], f: (x, { l }) => (x < 0 ? 0 : l * Math.exp(-l * x)), mean: ({ l }) => 1 / l, variance: ({ l }) => 1 / l ** 2, use: "Waiting time between independent events, such as between purchases." },
  t: { label: "Student's t", discrete: false, params: [{ key: "v", label: "Degrees of freedom", min: 1, max: 40, step: 1, init: 4 }], range: () => [-5, 5], f: (x, { v }) => tPdf(x, v), mean: ({ v }) => (v > 1 ? 0 : null), variance: ({ v }) => (v > 2 ? v / (v - 2) : null), use: "A standardized mean when σ is estimated. Heavier tails than normal, shrinking as df grows." },
  chi2: { label: "Chi-square", discrete: false, params: [{ key: "k", label: "Degrees of freedom", min: 1, max: 20, step: 1, init: 4 }], range: ({ k }) => [0, k + 5 * Math.sqrt(2 * k) + 1], f: (x, { k }) => chi2Pdf(x, k), mean: ({ k }) => k, variance: ({ k }) => 2 * k, use: "A sum of squared standard normals, used for count tables and variances." },
  f: { label: "F", discrete: false, params: [{ key: "a", label: "Numerator df", min: 1, max: 30, step: 1, init: 4 }, { key: "b", label: "Denominator df", min: 3, max: 60, step: 1, init: 20 }], range: () => [0, 5], f: (x, { a, b }) => fPdf(x, a, b), mean: ({ b }) => (b > 2 ? b / (b - 2) : null), variance: ({ a, b }) => (b > 4 ? (2 * b * b * (a + b - 2)) / (a * (b - 2) ** 2 * (b - 4)) : null), use: "A ratio of two variances, used by ANOVA and regression F-tests." },
};

const W = 560;
const H = 220;
const M = { l: 12, r: 12, t: 12, b: 26 };

export function DistributionExplorer({ only, title = "Distribution explorer" }: { only?: string[]; title?: string }) {
  const keys = only ?? Object.keys(DISTS);
  const [name, setName] = useState(keys[0]);
  const dist = DISTS[name];
  const [all, setAll] = useState<Record<string, Params>>({});
  const params = all[name] ?? Object.fromEntries(dist.params.map((p) => [p.key, p.init]));
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  const points = useMemo(() => {
    const [a, b] = dist.range(params);
    const xs = dist.discrete ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : Array.from({ length: 200 }, (_, i) => a + ((b - a) * i) / 199);
    return xs.map((x) => ({ x, y: dist.f(x, params) }));
  }, [dist, params]);

  const [a, b] = dist.range(params);
  const max = Math.min(Math.max(...points.map((p) => (Number.isFinite(p.y) ? p.y : 0))), name === "chi2" || name === "f" ? 1.2 : Infinity);
  const X = (x: number) => M.l + ((x - a) / (b - a || 1)) * (W - M.l - M.r);
  const Y = (y: number) => H - M.b - (Math.min(y, max) / (max || 1)) * (H - M.t - M.b);
  const barW = dist.discrete ? Math.max(3, ((W - M.l - M.r) / points.length) * 0.72) : 0;
  const line = points.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(" ");
  const mean = dist.mean(params);
  const variance = dist.variance(params);

  function onMove(event: React.PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const x = a + (((event.clientX - box.left) / box.width) * W - M.l) / (W - M.l - M.r) * (b - a);
    setHover(points.reduce((best, p) => (Math.abs(p.x - x) < Math.abs(best.x - x) ? p : best)));
  }

  return (
    <VizFrame title={title}>
      {keys.length > 1 && (
        <div className="chips" role="group" aria-label="Distribution">
          {keys.map((key) => (
            <button key={key} type="button" className="chip" aria-pressed={key === name} onClick={() => { setName(key); setHover(null); }}>
              {DISTS[key].label}
            </button>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full touch-none" role="img" aria-label={`${dist.label} distribution`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke="var(--line-strong)" />
        {dist.discrete ? (
          points.map((p) => <rect key={p.x} x={X(p.x) - barW / 2} y={Y(p.y)} width={barW} height={H - M.b - Y(p.y)} rx={Math.min(3, barW / 2)} fill="var(--viz-1)" opacity={hover && hover.x !== p.x ? 0.55 : 1} />)
        ) : (
          <>
            <path d={`${line} L${X(b)} ${H - M.b} L${X(a)} ${H - M.b} Z`} fill="var(--accent-soft)" />
            <path d={line} fill="none" stroke="var(--viz-1)" strokeWidth={2} />
          </>
        )}
        {mean !== null && mean >= a && mean <= b && <line x1={X(mean)} x2={X(mean)} y1={M.t} y2={H - M.b} stroke="var(--viz-2)" strokeDasharray="3 3" />}
        {hover && !dist.discrete && <circle cx={X(hover.x)} cy={Y(hover.y)} r={4} fill="var(--viz-1)" stroke="var(--card)" strokeWidth={2} />}
        <text x={M.l} y={H - 8} fontSize={12} fill="var(--muted)">{Number(a.toFixed(1))}</text>
        <text x={W - M.r} y={H - 8} fontSize={12} textAnchor="end" fill="var(--muted)">{Number(b.toFixed(1))}</text>
      </svg>
      <p className="min-h-5 font-mono text-xs text-muted" aria-live="polite">
        {hover ? `x = ${Number(hover.x.toFixed(2))}, ${dist.discrete ? "P(X = x)" : "density"} = ${hover.y.toFixed(4)}` : "Hover or drag across the chart to read values. The dashed line marks the mean."}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {dist.params.map((p) => (
          <Slider key={p.key} label={p.label} value={params[p.key]} min={p.min} max={p.max} step={p.step} onChange={(value) => setAll({ ...all, [name]: { ...params, [p.key]: value } })} />
        ))}
      </div>
      <p className="mt-3 text-sm">
        <strong>{dist.label}.</strong> {dist.use} <span className="font-mono text-xs text-muted">mean = {mean === null ? "undefined" : mean.toFixed(3)}, variance = {variance === null ? "undefined" : variance.toFixed(3)}</span>
      </p>
    </VizFrame>
  );
}

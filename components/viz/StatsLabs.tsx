"use client";

import { useMemo, useState } from "react";
import { Slider } from "./DistributionExplorer";
import { VizFrame } from "./stepper";
import { normalCdf, normalInv, normalPdf, sampleSizePerGroup } from "./statsMath";

const W = 560;
const H = 220;
const BASE = H - 26;

const SOURCES = {
  uniform: { label: "Uniform", mean: 0.5, sd: Math.sqrt(1 / 12), draw: () => Math.random() },
  skewed: { label: "Skewed (order value)", mean: 1, sd: 1, draw: () => -Math.log(1 - Math.random()) },
  bimodal: { label: "Two-peaked", mean: 1.5, sd: Math.sqrt(2.25 + 0.09), draw: () => (Math.random() < 0.5 ? 0 : 3) + 0.3 * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random()) },
} as const;
type SourceKey = keyof typeof SOURCES;

export function CltSimulator() {
  const [source, setSource] = useState<SourceKey>("skewed");
  const [n, setN] = useState(30);
  const [means, setMeans] = useState<number[]>([]);
  const { mean, sd, draw } = SOURCES[source];
  const se = sd / Math.sqrt(n);
  const lo = mean - 4 * se;
  const hi = mean + 4 * se;
  const bins = 36;

  function run() {
    const batch = Array.from({ length: 1000 }, () => {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += draw();
      return sum / n;
    });
    setMeans([...means, ...batch]);
  }

  const counts = useMemo(() => {
    const c = new Array(bins).fill(0);
    for (const m of means) {
      const i = Math.floor(((m - lo) / (hi - lo)) * bins);
      if (i >= 0 && i < bins) c[i]++;
    }
    return c as number[];
  }, [means, lo, hi]);

  const observed = means.length > 1 ? Math.sqrt(means.reduce((s, m) => s + (m - means.reduce((a, b) => a + b) / means.length) ** 2, 0) / (means.length - 1)) : null;
  const curve = Array.from({ length: 120 }, (_, i) => lo + ((hi - lo) * i) / 119).map((x) => ({ x, y: normalPdf(x, mean, se) }));
  const binWidth = (hi - lo) / bins;
  const scale = (density: number) => (means.length ? (density * means.length * binWidth) : density);
  const peak = Math.max(...counts, means.length ? scale(normalPdf(mean, mean, se)) : 1, 1);
  const X = (x: number) => 12 + ((x - lo) / (hi - lo)) * (W - 24);
  const Y = (v: number) => BASE - (v / peak) * (BASE - 12);

  return (
    <VizFrame title="Central Limit Theorem lab">
      <div className="chips" role="group" aria-label="Source distribution">
        {(Object.keys(SOURCES) as SourceKey[]).map((key) => (
          <button key={key} type="button" className="chip" aria-pressed={source === key} onClick={() => { setSource(key); setMeans([]); }}>
            {SOURCES[key].label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Histogram of sample means with the predicted normal curve">
        <line x1={12} x2={W - 12} y1={BASE} y2={BASE} stroke="var(--line-strong)" />
        {counts.map((c, i) => {
          const barW = (W - 24) / bins;
          return c > 0 && <rect key={i} x={12 + i * barW + 1} y={Y(c)} width={barW - 2} height={BASE - Y(c)} rx={2} fill="var(--viz-1)" />;
        })}
        {means.length > 0 && <path d={curve.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)} ${Y(scale(p.y)).toFixed(1)}`).join(" ")} fill="none" stroke="var(--viz-2)" strokeWidth={2} />}
        {means.length === 0 && <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={14} fill="var(--muted)">Draw samples to build the distribution of the mean</text>}
        <text x={12} y={H - 8} fontSize={12} fill="var(--muted)">{lo.toFixed(2)}</text>
        <text x={W - 12} y={H - 8} fontSize={12} textAnchor="end" fill="var(--muted)">{hi.toFixed(2)}</text>
      </svg>
      <div className="mt-3 grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <Slider label="Sample size n" value={n} min={2} max={200} step={1} onChange={(value) => { setN(value); setMeans([]); }} />
        <button type="button" className="btn btn-primary" onClick={run}>Draw 1,000 samples</button>
      </div>
      <p className="mt-3 font-mono text-xs text-muted" aria-live="polite">
        samples {means.length.toLocaleString("en-US")} · predicted SE σ/√n = {se.toFixed(4)} · observed SD of means = {observed === null ? "none yet" : observed.toFixed(4)}
      </p>
      <p className="mt-1 text-sm">Blue bars are simulated sample means. The pink line is the normal curve the theorem predicts. Compare n = 2 with n = 100 on the skewed source.</p>
    </VizFrame>
  );
}

export function HypothesisViz() {
  const [d, setD] = useState(0.3);
  const [n, setN] = useState(100);
  const [alpha, setAlpha] = useState(0.05);
  const [twoTailed, setTwoTailed] = useState(true);

  const delta = d * Math.sqrt(n / 2);
  const crit = normalInv(1 - alpha / (twoTailed ? 2 : 1));
  const power = 1 - normalCdf(crit - delta) + (twoTailed ? normalCdf(-crit - delta) : 0);
  const lo = -4;
  const hi = Math.max(4, delta + 4);
  const X = (z: number) => 12 + ((z - lo) / (hi - lo)) * (W - 24);
  const Y = (y: number) => BASE - (y / 0.42) * (BASE - 12);
  const area = (mean: number, a: number, b: number) => {
    const steps = 60;
    const pts = Array.from({ length: steps + 1 }, (_, i) => a + ((b - a) * i) / steps);
    return `M${X(a)} ${BASE} ${pts.map((z) => `L${X(z).toFixed(1)} ${Y(normalPdf(z, mean)).toFixed(1)}`).join(" ")} L${X(b)} ${BASE} Z`;
  };
  const line = (mean: number) => Array.from({ length: 160 }, (_, i) => lo + ((hi - lo) * i) / 159).map((z, i) => `${i ? "L" : "M"}${X(z).toFixed(1)} ${Y(normalPdf(z, mean)).toFixed(1)}`).join(" ");

  return (
    <VizFrame title="Significance, power and overlap">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Null and alternative sampling distributions">
        <path d={area(delta, crit, hi)} fill="var(--accent-soft)" />
        <path d={area(0, crit, hi)} fill="var(--viz-2)" opacity={0.45} />
        {twoTailed && <path d={area(0, lo, -crit)} fill="var(--viz-2)" opacity={0.45} />}
        <path d={line(0)} fill="none" stroke="var(--muted)" strokeWidth={2} />
        <path d={line(delta)} fill="none" stroke="var(--viz-1)" strokeWidth={2} />
        <line x1={X(crit)} x2={X(crit)} y1={12} y2={BASE} stroke="var(--ink)" strokeDasharray="3 3" />
        <line x1={12} x2={W - 12} y1={BASE} y2={BASE} stroke="var(--line-strong)" />
        <text x={X(0)} y={H - 8} textAnchor="middle" fontSize={12} fill="var(--muted)">No effect (H₀)</text>
        {delta > 1.3 && <text x={X(delta)} y={H - 8} textAnchor="middle" fontSize={12} fill="var(--muted)">True effect (H₁)</text>}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span><i className="mr-1 inline-block size-2.5 rounded-sm" style={{ background: "var(--viz-2)", opacity: 0.6 }} />α, false positive area</span>
        <span><i className="mr-1 inline-block size-2.5 rounded-sm" style={{ background: "var(--accent-soft)", outline: "1px solid var(--accent)" }} />Power, true detection area</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Slider label="Effect size d" value={d} min={0} max={1.2} step={0.01} onChange={setD} />
        <Slider label="n per group" value={n} min={5} max={500} step={5} onChange={setN} />
        <Slider label="Significance α" value={alpha} min={0.005} max={0.2} step={0.005} onChange={setAlpha} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="chips" role="group" aria-label="Test direction">
          <button type="button" className="chip" aria-pressed={twoTailed} onClick={() => setTwoTailed(true)}>Two-tailed</button>
          <button type="button" className="chip" aria-pressed={!twoTailed} onClick={() => setTwoTailed(false)}>One-tailed</button>
        </div>
        <p className="font-mono text-xs" aria-live="polite">critical z = {crit.toFixed(2)} · power = {(power * 100).toFixed(1)}% · Type II β = {((1 - power) * 100).toFixed(1)}%</p>
      </div>
    </VizFrame>
  );
}

export function SampleSizeCalculator() {
  const [base, setBase] = useState(5);
  const [mde, setMde] = useState(10);
  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.8);
  const [traffic, setTraffic] = useState(5000);
  const p2 = (base / 100) * (1 + mde / 100);
  const n = sampleSizePerGroup(base / 100, p2, alpha, power);
  const days = Math.ceil((n * 2) / traffic);

  return (
    <VizFrame title="A/B test sample size calculator">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Baseline conversion" value={base} min={0.5} max={50} step={0.1} format={(v) => `${v.toFixed(1)}%`} onChange={setBase} />
        <Slider label="Minimum detectable lift (relative)" value={mde} min={1} max={50} step={0.5} format={(v) => `${v.toFixed(1)}%`} onChange={setMde} />
        <Slider label="Significance α" value={alpha} min={0.01} max={0.1} step={0.005} onChange={setAlpha} />
        <Slider label="Power 1 − β" value={power} min={0.7} max={0.95} step={0.01} onChange={setPower} />
        <Slider label="Eligible visitors per day" value={traffic} min={100} max={100000} step={100} format={(v) => v.toLocaleString("en-US")} onChange={setTraffic} />
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div><dt className="text-xs text-muted">Per group</dt><dd className="font-display text-2xl">{n.toLocaleString("en-US")}</dd></div>
        <div><dt className="text-xs text-muted">Total</dt><dd className="font-display text-2xl">{(n * 2).toLocaleString("en-US")}</dd></div>
        <div><dt className="text-xs text-muted">Duration at full traffic</dt><dd className="font-display text-2xl">{days} {days === 1 ? "day" : "days"}</dd></div>
      </dl>
      <p className="mt-3 text-sm text-muted">Detects a change from {base.toFixed(1)}% to {(p2 * 100).toFixed(2)}%. Run at least one full week regardless, to cover weekly patterns.</p>
    </VizFrame>
  );
}

const SPEND = [10, 14, 18, 22, 25, 30, 34, 38, 42, 47];
const REVENUE = [38, 44, 50, 62, 64, 72, 86, 90, 104, 110];

export function RegressionViz() {
  const [intercept, setIntercept] = useState(5);
  const [slope, setSlope] = useState(3);
  const n = SPEND.length;
  const mx = SPEND.reduce((a, b) => a + b) / n;
  const my = REVENUE.reduce((a, b) => a + b) / n;
  const best = SPEND.reduce((s, x, i) => s + (x - mx) * (REVENUE[i] - my), 0) / SPEND.reduce((s, x) => s + (x - mx) ** 2, 0);
  const bestIntercept = my - best * mx;
  const sse = (a: number, b: number) => SPEND.reduce((s, x, i) => s + (REVENUE[i] - (a + b * x)) ** 2, 0);
  const X = (x: number) => 34 + (x / 50) * (W - 50);
  const Y = (y: number) => BASE - (y / 130) * (BASE - 12);

  return (
    <VizFrame title="Fit a line by hand">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Scatter plot of ad spend and revenue with an adjustable line">
        <line x1={34} x2={W - 16} y1={BASE} y2={BASE} stroke="var(--line-strong)" />
        <line x1={34} x2={34} y1={12} y2={BASE} stroke="var(--line-strong)" />
        {SPEND.map((x, i) => <line key={x} x1={X(x)} x2={X(x)} y1={Y(REVENUE[i])} y2={Y(intercept + slope * x)} stroke="var(--viz-2)" />)}
        <line x1={X(0)} y1={Y(intercept)} x2={X(50)} y2={Y(intercept + slope * 50)} stroke="var(--viz-1)" strokeWidth={2} />
        {SPEND.map((x, i) => <circle key={x} cx={X(x)} cy={Y(REVENUE[i])} r={4.5} fill="var(--ink)" stroke="var(--card)" strokeWidth={2} />)}
        <text x={W - 16} y={H - 8} textAnchor="end" fontSize={12} fill="var(--muted)">Ad spend (₹k)</text>
        <text x={38} y={22} fontSize={12} fill="var(--muted)">Revenue (₹k)</text>
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label="Intercept" value={intercept} min={-20} max={60} step={0.5} onChange={setIntercept} />
        <Slider label="Slope" value={slope} min={0} max={5} step={0.01} onChange={setSlope} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs" aria-live="polite">your SSE = {sse(intercept, slope).toFixed(0)} · least squares SSE = {sse(bestIntercept, best).toFixed(0)}</p>
        <button type="button" className="btn" onClick={() => { setIntercept(Number(bestIntercept.toFixed(1))); setSlope(Number(best.toFixed(2))); }}>Fit least squares</button>
      </div>
    </VizFrame>
  );
}

const NEGATIVE = Array.from({ length: 800 }, (_, i) => -0.7 + normalInv((i + 0.5) / 800));
const POSITIVE = Array.from({ length: 200 }, (_, i) => 1 + normalInv((i + 0.5) / 200));

export function ThresholdExplorer() {
  const [threshold, setThreshold] = useState(0.5);
  const tp = POSITIVE.filter((s) => s >= threshold).length;
  const fp = NEGATIVE.filter((s) => s >= threshold).length;
  const fn = 200 - tp;
  const tn = 800 - fp;
  const precision = tp + fp ? tp / (tp + fp) : 1;
  const recall = tp / 200;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  const curve = Array.from({ length: 81 }, (_, i) => -4 + i * 0.1).map((t) => ({ fpr: NEGATIVE.filter((s) => s >= t).length / 800, tpr: POSITIVE.filter((s) => s >= t).length / 200 }));
  const S = 180;
  const P = (v: number) => 12 + v * (S - 24);
  const Q = (v: number) => S - 12 - v * (S - 24);
  const cells = [["True positive", tp], ["False negative", fn], ["False positive", fp], ["True negative", tn]] as const;

  return (
    <VizFrame title="Move the decision threshold">
      <p className="text-sm text-muted">1,000 customers, 20% churners, one model score each.</p>
      <div className="mt-3 grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-2 gap-1.5">
          {cells.map(([name, value], i) => (
            <div key={name} className={`rounded-lg border border-line p-3 ${i === 0 || i === 3 ? "bg-accent-soft" : ""}`}>
              <p className="text-xs text-muted">{name}</p>
              <p className="font-display text-2xl">{value}</p>
            </div>
          ))}
        </div>
        <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto w-44" role="img" aria-label={`ROC curve, current point recall ${recall.toFixed(2)}`}>
          <rect x={12} y={12} width={S - 24} height={S - 24} fill="none" stroke="var(--line-strong)" />
          <line x1={P(0)} y1={Q(0)} x2={P(1)} y2={Q(1)} stroke="var(--line-strong)" strokeDasharray="3 3" />
          <path d={curve.toReversed().map((c, i) => `${i ? "L" : "M"}${P(c.fpr).toFixed(1)} ${Q(c.tpr).toFixed(1)}`).join(" ")} fill="none" stroke="var(--viz-1)" strokeWidth={2} />
          <circle cx={P(fp / 800)} cy={Q(recall)} r={5} fill="var(--viz-2)" stroke="var(--card)" strokeWidth={2} />
          <text x={S / 2} y={S - 1} textAnchor="middle" fontSize={10} fill="var(--muted)">False positive rate</text>
        </svg>
      </div>
      <div className="mt-3">
        <Slider label="Score threshold" value={threshold} min={-3} max={3.5} step={0.05} onChange={setThreshold} />
      </div>
      <p className="mt-3 font-mono text-xs" aria-live="polite">accuracy {(((tp + tn) / 10)).toFixed(1)}% · precision {(precision * 100).toFixed(1)}% · recall {(recall * 100).toFixed(1)}% · F1 {f1.toFixed(3)}</p>
    </VizFrame>
  );
}

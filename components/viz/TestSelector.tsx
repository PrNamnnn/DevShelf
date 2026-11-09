"use client";

import Link from "next/link";
import { useState } from "react";
import { VizFrame } from "./stepper";

interface Choice {
  label: string;
  next: string;
}

interface Node {
  question?: string;
  choices?: Choice[];
  result?: string;
  why?: string;
  href?: string;
}

const L = "/statistics/";

const NODES: Record<string, Node> = {
  start: { question: "What kind of outcome are you analyzing?", choices: [{ label: "A number (revenue, time, score)", next: "numeric" }, { label: "Yes or no (converted, churned)", next: "binary" }, { label: "Categories with counts", next: "categorical" }, { label: "Association between two numbers", next: "assoc" }] },
  numeric: { question: "How many groups are you comparing?", choices: [{ label: "One group against a known value", next: "one" }, { label: "Two groups", next: "two" }, { label: "Three or more groups", next: "many" }] },
  one: { question: "What do you know about the data?", choices: [{ label: "Population SD known, or very large sample", next: "z1" }, { label: "SD estimated, roughly symmetric or n is large", next: "t1" }, { label: "Small sample, clearly skewed or ordinal", next: "w1" }] },
  z1: { result: "One-sample Z-test", why: "The standard deviation is known, so the statistic follows a normal distribution.", href: L + "z-tests" },
  t1: { result: "One-sample t-test", why: "Estimating the SD from the data adds uncertainty, which the t-distribution accounts for.", href: L + "t-tests" },
  w1: { result: "Wilcoxon signed-rank test", why: "It compares against a value using ranks, and needs no normality.", href: L + "non-parametric-tests" },
  two: { question: "Are the two sets of measurements linked?", choices: [{ label: "Independent (different users)", next: "ind" }, { label: "Paired (same users, before and after)", next: "pair" }] },
  ind: { question: "What does the metric look like?", choices: [{ label: "Roughly symmetric or large samples", next: "welch" }, { label: "Small samples, heavy skew or ordinal", next: "mw" }] },
  welch: { result: "Welch's t-test", why: "It stays valid when group variances differ, so it's a safe default for two independent means.", href: L + "t-tests" },
  mw: { result: "Mann-Whitney U test", why: "It compares groups by ranks and doesn't rely on normality.", href: L + "non-parametric-tests" },
  pair: { question: "How do the differences behave?", choices: [{ label: "Roughly symmetric, or many pairs", next: "pt" }, { label: "Few pairs with heavy skew or outliers", next: "wsr" }] },
  pt: { result: "Paired t-test", why: "It tests the mean of within-subject differences, removing variation between subjects.", href: L + "t-tests" },
  wsr: { result: "Wilcoxon signed-rank test", why: "It's the rank-based alternative for paired differences.", href: L + "non-parametric-tests" },
  many: { question: "How is the data structured?", choices: [{ label: "Independent groups, one factor", next: "anova1" }, { label: "Independent groups, two factors", next: "anova2" }, { label: "Same subjects measured repeatedly", next: "rm" }] },
  anova1: { question: "Are residuals roughly normal?", choices: [{ label: "Yes, or groups are large", next: "a1" }, { label: "No, skewed or ordinal", next: "kw" }] },
  a1: { result: "One-way ANOVA, then a post-hoc test", why: "ANOVA asks whether any mean differs, and post-hoc tests find which ones while controlling false positives.", href: L + "anova-and-post-hoc" },
  kw: { result: "Kruskal-Wallis test", why: "It extends the rank approach to three or more independent groups.", href: L + "non-parametric-tests" },
  anova2: { result: "Two-way ANOVA", why: "It separates each factor's main effect and their interaction.", href: L + "anova-and-post-hoc" },
  rm: { question: "Are the differences roughly normal?", choices: [{ label: "Yes", next: "rma" }, { label: "No, or ordinal ratings", next: "fr" }] },
  rma: { result: "Repeated measures ANOVA", why: "It models within-subject correlation across conditions.", href: L + "anova-and-post-hoc" },
  fr: { result: "Friedman test", why: "It's the rank-based alternative for repeated measures.", href: L + "non-parametric-tests" },
  binary: { question: "What are you comparing?", choices: [{ label: "One rate against a target", next: "p1" }, { label: "Two groups, plenty of events", next: "p2" }, { label: "Two groups, very few events", next: "fisher" }] },
  p1: { result: "One-proportion Z-test or exact binomial test", why: "The rate is a mean of 0s and 1s, and the normal approximation works with enough events.", href: L + "z-tests" },
  p2: { result: "Two-proportion Z-test", why: "It's the standard analysis for conversion rates in an A/B test.", href: L + "analyzing-ab-tests" },
  fisher: { result: "Fisher's exact test", why: "It computes exact probabilities when expected counts are small.", href: L + "assumption-and-exact-tests" },
  categorical: { question: "What is your question?", choices: [{ label: "Does one variable match an expected mix?", next: "gof" }, { label: "Are two variables related in one sample?", next: "ind2" }, { label: "Do several populations share one mix?", next: "homog" }] },
  gof: { result: "Chi-square goodness of fit", why: "It compares observed category counts with those expected. It's also the sample ratio mismatch check.", href: L + "chi-square-tests" },
  ind2: { result: "Chi-square test of independence", why: "It tests association in a contingency table. With expected counts under 5, use Fisher's exact test.", href: L + "chi-square-tests" },
  homog: { result: "Chi-square test of homogeneity", why: "The arithmetic matches the independence test, but groups are sampled separately.", href: L + "chi-square-tests" },
  assoc: { question: "What does the relationship look like?", choices: [{ label: "Roughly linear, no extreme outliers", next: "pearson" }, { label: "Monotonic, ranked, or with outliers", next: "spearman" }] },
  pearson: { result: "Pearson correlation", why: "It measures linear association between two numeric variables.", href: L + "correlation-and-causation" },
  spearman: { result: "Spearman correlation", why: "It correlates ranks, so it captures monotonic relationships and resists outliers.", href: L + "correlation-and-causation" },
};

export function TestSelector() {
  const [trail, setTrail] = useState(["start"]);
  const node = NODES[trail[trail.length - 1]];

  return (
    <VizFrame title="Which statistical test should I use?">
      {node.question ? (
        <>
          <p className="font-medium">{node.question}</p>
          <div className="mt-3 grid gap-2">
            {node.choices?.map((choice) => (
              <button key={choice.next} type="button" className="rounded-lg border border-line px-3 py-2 text-left text-sm transition-colors hover:border-accent hover:text-accent" onClick={() => setTrail([...trail, choice.next])}>
                {choice.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-lg bg-accent-soft p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Recommended</p>
          <p className="mt-1 font-display text-xl">{node.result}</p>
          <p className="mt-1 text-sm">{node.why}</p>
          {node.href && <Link href={node.href} className="mt-2 inline-block text-sm font-medium text-accent underline underline-offset-2">Open this lesson</Link>}
        </div>
      )}
      {trail.length > 1 && (
        <div className="mt-3 flex gap-2">
          <button type="button" className="btn" onClick={() => setTrail(trail.slice(0, -1))}>Back</button>
          <button type="button" className="btn" onClick={() => setTrail(["start"])}>Start over</button>
        </div>
      )}
    </VizFrame>
  );
}

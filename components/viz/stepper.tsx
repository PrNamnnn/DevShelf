"use client";

import { useEffect, useState, type ReactNode } from "react";

const STEP_MS = 2400;

export function useStepper(total: number) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (step >= total - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep(step + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, step, total]);

  return {
    step,
    total,
    playing,
    back: () => {
      setPlaying(false);
      setStep((current) => Math.max(0, current - 1));
    },
    next: () => {
      setPlaying(false);
      setStep((current) => Math.min(total - 1, current + 1));
    },
    reset: () => {
      setPlaying(false);
      setStep(0);
    },
    togglePlay: () => {
      if (!playing && step >= total - 1) setStep(0);
      setPlaying(!playing);
    },
  };
}

const BUTTON =
  "rounded-md border border-line px-3 py-1.5 text-sm transition-colors hover:bg-accent-soft disabled:opacity-40 disabled:hover:bg-transparent";

export function StepControls({
  stepper,
  note,
}: {
  stepper: ReturnType<typeof useStepper>;
  note: string;
}) {
  const { step, total, playing, back, next, reset, togglePlay } = stepper;
  return (
    <div className="mt-4 border-t border-line pt-3">
      <p aria-live="polite" className="min-h-[4.5em] text-[0.95rem] leading-relaxed sm:min-h-[3em]">
        {note}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={BUTTON} onClick={back} disabled={step === 0}>
          Back
        </button>
        <button
          type="button"
          className={`${BUTTON} border-accent font-medium text-accent`}
          onClick={next}
          disabled={step === total - 1}
        >
          Next step
        </button>
        <button type="button" className={BUTTON} onClick={togglePlay}>
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className={BUTTON} onClick={reset} disabled={step === 0}>
          Restart
        </button>
        <span className="ml-auto font-mono text-xs text-muted">
          {step + 1} / {total}
        </span>
      </div>
    </div>
  );
}

export function VizFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="viz rounded-lg border border-line bg-card p-4 sm:p-5">
      <figcaption className="font-display text-lg font-semibold">{title}</figcaption>
      <div className="mt-3">{children}</div>
    </figure>
  );
}

export function CodePanel({
  label,
  lines,
  active,
}: {
  label: string;
  lines: string[];
  active: number | null;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <pre className="overflow-x-auto rounded-md border border-line bg-paper py-2 font-mono text-[0.8rem] leading-6">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`px-3 ${index === active ? "bg-accent-soft font-medium text-accent" : ""}`}
          >
            {line || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`pop-in inline-block rounded px-2 py-0.5 font-mono text-xs ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export type Tone = "neutral" | "accent" | "info" | "ok" | "warn" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-paper border border-line",
  accent: "bg-accent-soft text-accent",
  info: "bg-info-soft text-info",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
};

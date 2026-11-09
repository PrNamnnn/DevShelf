"use client";

import { Fragment } from "react";
import { Chip, CodePanel, StepControls, useStepper, VizFrame } from "./stepper";

interface FlowStep {
  note: string;
  active?: number[];
  line?: number;
  state?: Record<string, string>;
}

/** A data-driven step-through: chapters pass their nodes and steps as MDX props. */
export function StepFlow({
  title,
  nodes,
  steps,
  code,
  codeLabel = "Code",
}: {
  title: string;
  nodes: string[];
  steps: FlowStep[];
  code?: string[];
  codeLabel?: string;
}) {
  const stepper = useStepper(steps.length);
  const current = steps[stepper.step];
  const active = current.active ?? [];
  const entries = Object.entries(current.state ?? {});

  return (
    <VizFrame title={title}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2" aria-label="Stages">
        {nodes.map((node, index) => (
          <Fragment key={node}>
            <li
              aria-current={active.includes(index) ? "step" : undefined}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                active.includes(index)
                  ? "border-accent bg-accent-soft font-semibold text-accent"
                  : "border-line bg-paper"
              }`}
            >
              {node}
            </li>
            {index < nodes.length - 1 && (
              <li aria-hidden="true" className="text-muted">
                →
              </li>
            )}
          </Fragment>
        ))}
      </ol>

      {code && (
        <div className="mt-3">
          <CodePanel label={codeLabel} lines={code} active={current.line ?? null} />
        </div>
      )}

      <dl className="mt-3 flex min-h-7 flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {entries.map(([label, value]) => (
          <div key={label} className="flex items-center gap-1.5">
            <dt className="text-muted">{label}</dt>
            <dd>
              <Chip key={value} tone="info">
                {value}
              </Chip>
            </dd>
          </div>
        ))}
      </dl>

      <StepControls stepper={stepper} note={current.note} />
    </VizFrame>
  );
}

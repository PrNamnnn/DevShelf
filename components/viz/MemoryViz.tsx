"use client";

import { CodePanel, StepControls, useStepper, VizFrame } from "./stepper";
import { StateChips } from "./TreeViz";

interface Binding {
  name: string;
  ref?: string;
  value?: string;
}

interface HeapObject {
  id: string;
  label: string;
}

interface MemoryStep {
  note: string;
  line?: number;
  stack: Binding[];
  heap: HeapObject[];
  changed?: string[];
  state?: Record<string, string>;
}

const ROW = 46;
const BOX_H = 34;
const STACK_X = 8;
const STACK_W = 170;
const HEAP_X = 330;
const HEAP_W = 222;

/** Names on the left, objects on the right, and live references between them. */
export function MemoryViz({
  title,
  code,
  steps,
  stackLabel = "Names (stack frames)",
  heapLabel = "Objects (heap)",
}: {
  title: string;
  code?: string[];
  steps: MemoryStep[];
  stackLabel?: string;
  heapLabel?: string;
}) {
  const stepper = useStepper(steps.length);
  const current = steps[stepper.step];
  const rows = Math.max(...steps.map((step) => Math.max(step.stack.length, step.heap.length)), 1);
  const height = 28 + rows * ROW;
  const heapY = new Map(current.heap.map((object, index) => [object.id, 28 + index * ROW + BOX_H / 2]));
  const markerId = title.replace(/\W/g, "");

  return (
    <VizFrame title={title}>
      {code && <CodePanel label="Code" lines={code} active={current.line ?? null} />}
      <svg viewBox={`0 0 560 ${height}`} className="mt-3 w-full" role="img" aria-label={`${stackLabel} and ${heapLabel}`}>
        <defs>
          <marker id={markerId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>
        <text x={STACK_X} y={14} fontSize={11.5} fontWeight={600} fill="var(--muted)">
          {stackLabel}
        </text>
        <text x={HEAP_X} y={14} fontSize={11.5} fontWeight={600} fill="var(--muted)">
          {heapLabel}
        </text>

        {current.stack.map((binding, index) => {
          const y = 28 + index * ROW;
          const targetY = binding.ref ? heapY.get(binding.ref) : undefined;
          const startY = y + BOX_H / 2;
          return (
            <g key={binding.name} className="viz-node">
              <rect x={STACK_X} y={y} width={STACK_W} height={BOX_H} rx={7} fill={current.changed?.includes(binding.name) ? "var(--accent-soft)" : "var(--paper)"} stroke={current.changed?.includes(binding.name) ? "var(--accent)" : "var(--line-strong)"} />
              <text x={STACK_X + 12} y={y + 22} fontSize={13} fontFamily="var(--font-mono)" fill="var(--ink)">
                {binding.name}
                {binding.value !== undefined ? ` = ${binding.value}` : ""}
              </text>
              {targetY !== undefined && (
                <path
                  key={`${binding.ref}-${targetY}`}
                  className="viz-arrow"
                  d={`M${STACK_X + STACK_W} ${startY} C${STACK_X + STACK_W + 70} ${startY} ${HEAP_X - 70} ${targetY} ${HEAP_X - 2} ${targetY}`}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1.4}
                  markerEnd={`url(#${markerId})`}
                />
              )}
            </g>
          );
        })}

        {current.heap.map((object, index) => {
          const y = 28 + index * ROW;
          const changed = current.changed?.includes(object.id);
          return (
            <g key={object.id} className="viz-node">
              <rect x={HEAP_X} y={y} width={HEAP_W} height={BOX_H} rx={7} fill={changed ? "var(--pink-soft)" : "var(--card)"} stroke={changed ? "var(--pink)" : "var(--line-strong)"} />
              <text x={HEAP_X + 12} y={y + 22} fontSize={13} fontFamily="var(--font-mono)" fill="var(--ink)">
                {object.label}
              </text>
            </g>
          );
        })}
      </svg>
      <StateChips state={current.state} />
      <StepControls stepper={stepper} note={current.note} />
    </VizFrame>
  );
}

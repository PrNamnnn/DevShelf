"use client";

import { Chip, CodePanel, StepControls, useStepper, VizFrame, type Tone } from "./stepper";

const CODE = [
  'console.log("A");',
  'setTimeout(() => console.log("B"), 0);',
  "Promise.resolve()",
  '  .then(() => console.log("C"))',
  '  .then(() => console.log("D"));',
  'queueMicrotask(() => console.log("E"));',
  'console.log("F");',
];

type Stage = 0 | 1 | 2;

interface Step {
  line: number | null;
  stage: Stage;
  stack: string[];
  micro: string[];
  tasks: string[];
  output: string;
  note: string;
}

const STEPS: Step[] = [
  { line: null, stage: 0, stack: ["script"], micro: [], tasks: [], output: "", note: "The whole script is one task. It starts on the call stack, and nothing else can run until it finishes." },
  { line: 0, stage: 0, stack: ["script", 'log("A")'], micro: [], tasks: [], output: "A", note: "Synchronous code runs immediately, so A prints first." },
  { line: 1, stage: 0, stack: ["script", "setTimeout"], micro: [], tasks: ["log B"], output: "A", note: "The timer belongs to the host. When its 0 ms delay expires, the callback is queued as a task. It can only run after this task ends." },
  { line: 3, stage: 0, stack: ["script", ".then"], micro: ["log C"], tasks: ["log B"], output: "A", note: "The promise is already fulfilled, so its reaction goes straight into the microtask queue." },
  { line: 4, stage: 0, stack: ["script", ".then"], micro: ["log C"], tasks: ["log B"], output: "A", note: "This .then is attached to the promise returned by the previous .then, which is still pending. Nothing is queued yet." },
  { line: 5, stage: 0, stack: ["script", "queueMicrotask"], micro: ["log C", "log E"], tasks: ["log B"], output: "A", note: "queueMicrotask appends directly to the microtask queue, behind C." },
  { line: 6, stage: 0, stack: ["script", 'log("F")'], micro: ["log C", "log E"], tasks: ["log B"], output: "A F", note: "F prints. It beats every callback, because the stack still has not emptied." },
  { line: null, stage: 1, stack: [], micro: ["log C", "log E"], tasks: ["log B"], output: "A F", note: "The script task is done and the stack is empty. A microtask checkpoint starts before any other task can run." },
  { line: 3, stage: 1, stack: ['log("C")'], micro: ["log E"], tasks: ["log B"], output: "A F C", note: "C is the oldest microtask, so it runs first." },
  { line: 4, stage: 1, stack: [], micro: ["log E", "log D"], tasks: ["log B"], output: "A F C", note: "C's callback returned, which fulfils the second promise. D joins the back of the same queue, behind E." },
  { line: 5, stage: 1, stack: ['log("E")'], micro: ["log D"], tasks: ["log B"], output: "A F C E", note: "E runs next." },
  { line: 4, stage: 1, stack: ['log("D")'], micro: [], tasks: ["log B"], output: "A F C E D", note: "D was queued during draining and still runs before any task. The checkpoint continues until the queue is empty." },
  { line: null, stage: 2, stack: [], micro: [], tasks: ["log B"], output: "A F C E D", note: "Microtasks are empty. In a browser, a rendering update can be scheduled at this kind of boundary, but it is not guaranteed on every turn." },
  { line: 1, stage: 0, stack: ['log("B")'], micro: [], tasks: [], output: "A F C E D B", note: "The event loop takes the next task. B prints last, even though its delay was 0 ms." },
];

const STAGES = [
  { label: "Run one task", x: 12 },
  { label: "Drain microtasks", x: 216 },
  { label: "Maybe render", x: 420 },
];

function LoopDiagram({ stage }: { stage: Stage }) {
  return (
    <svg viewBox="0 0 600 112" className="w-full" role="img" aria-label={`Event loop stage: ${STAGES[stage].label}`}>
      <defs>
        <marker id="el-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="var(--muted)" />
        </marker>
      </defs>
      {STAGES.map(({ label, x }, index) => (
        <g key={label}>
          <rect x={x} y={14} width={168} height={46} rx={6} fill={index === stage ? "var(--accent-soft)" : "var(--paper)"} stroke={index === stage ? "var(--accent)" : "var(--line)"} strokeWidth={index === stage ? 2 : 1} />
          <text x={x + 84} y={42} textAnchor="middle" fontSize={15} fontWeight={index === stage ? 600 : 400} fill={index === stage ? "var(--accent)" : "var(--ink)"}>
            {label}
          </text>
        </g>
      ))}
      <line x1={180} y1={37} x2={214} y2={37} stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#el-arrow)" />
      <line x1={384} y1={37} x2={418} y2={37} stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#el-arrow)" />
      <path d="M504 60 V92 H96 V62" fill="none" stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#el-arrow)" />
      <text x={300} y={108} textAnchor="middle" fontSize={13} fill="var(--muted)">
        next turn of the loop
      </text>
      <path d="M272 14 C272 -4 328 -4 328 12" fill="none" stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#el-arrow)" />
    </svg>
  );
}

function Lane({ title, items, tone, empty }: { title: string; items: string[]; tone: Tone; empty: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      <div className="mt-1.5 flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-dashed border-line p-1.5">
        {items.length === 0 ? (
          <span className="px-1 text-xs text-muted">{empty}</span>
        ) : (
          items.map((item) => (
            <Chip key={item} tone={tone}>
              {item}
            </Chip>
          ))
        )}
      </div>
    </div>
  );
}

export function EventLoopViz() {
  const stepper = useStepper(STEPS.length);
  const current = STEPS[stepper.step];

  return (
    <VizFrame title="One task, then every microtask">
      <LoopDiagram stage={current.stage} />
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <CodePanel label="Code" lines={CODE} active={current.line} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Console</p>
            <p className="mt-1.5 min-h-9 rounded-md border border-line bg-paper px-3 py-1.5 font-mono text-sm">
              {current.output || " "}
            </p>
          </div>
        </div>
        <div className="min-w-0 space-y-3">
          <Lane title="Call stack (top is on the right)" items={current.stack} tone="accent" empty="empty" />
          <Lane title="Microtask queue" items={current.micro} tone="info" empty="empty" />
          <Lane title="Task queue" items={current.tasks} tone="warn" empty="empty" />
        </div>
      </div>
      <StepControls stepper={stepper} note={current.note} />
    </VizFrame>
  );
}

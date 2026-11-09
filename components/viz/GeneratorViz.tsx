"use client";

import { Chip, CodePanel, StepControls, useStepper, VizFrame } from "./stepper";

const CALLER = [
  "gen = countdown(2)",
  "first = next(gen)",
  'second = gen.send("hi")',
  "third = next(gen)",
];

const GENERATOR = [
  "def countdown(n):",
  '    print("start")',
  "    while n > 0:",
  "        got = yield n",
  '        print("got", got)',
  "        n -= 1",
  '    return "done"',
];

type State = "GEN_CREATED" | "GEN_RUNNING" | "GEN_SUSPENDED" | "GEN_CLOSED";

interface Step {
  caller: number | null;
  frame: number | null;
  state: State;
  locals: string;
  result: string;
  note: string;
}

const STEPS: Step[] = [
  { caller: 0, frame: null, state: "GEN_CREATED", locals: "n=2", result: "", note: "Calling a generator function runs none of its body. It binds the arguments and returns a generator object." },
  { caller: 1, frame: 1, state: "GEN_RUNNING", locals: "n=2", result: "", note: 'next(gen) hands control to the frame. The body starts at its first line and prints "start".' },
  { caller: 1, frame: 2, state: "GEN_RUNNING", locals: "n=2", result: "", note: "The loop condition is true." },
  { caller: 1, frame: 3, state: "GEN_SUSPENDED", locals: "n=2", result: "first = 2", note: "yield passes 2 to the caller and freezes the frame right here. Locals and the position in the code are kept alive." },
  { caller: 2, frame: 3, state: "GEN_RUNNING", locals: 'n=2, got="hi"', result: "first = 2", note: 'send("hi") resumes the frame at the paused yield. The yield expression itself evaluates to "hi".' },
  { caller: 2, frame: 4, state: "GEN_RUNNING", locals: 'n=2, got="hi"', result: "first = 2", note: "Execution continues from where it stopped, not from the top of the function." },
  { caller: 2, frame: 5, state: "GEN_RUNNING", locals: 'n=1, got="hi"', result: "first = 2", note: "n is decremented. It persisted across the suspension because the frame was never destroyed." },
  { caller: 2, frame: 3, state: "GEN_SUSPENDED", locals: 'n=1, got="hi"', result: "first = 2, second = 1", note: "The loop passes again. send() returns the next yielded value, 1." },
  { caller: 3, frame: 3, state: "GEN_RUNNING", locals: "n=1, got=None", result: "first = 2, second = 1", note: "next() resumes with no value, so this time the yield expression evaluates to None." },
  { caller: 3, frame: 5, state: "GEN_RUNNING", locals: "n=0, got=None", result: "first = 2, second = 1", note: "The body prints and decrements n to 0." },
  { caller: 3, frame: 6, state: "GEN_RUNNING", locals: "n=0, got=None", result: "first = 2, second = 1", note: 'The loop condition is now false, so the body reaches return "done".' },
  { caller: 3, frame: null, state: "GEN_CLOSED", locals: "frame finished", result: 'StopIteration, value = "done"', note: 'The return becomes StopIteration("done") in the caller, so third is never assigned. Any further next() raises StopIteration again.' },
];

const NODES: { state: State; label: string; x: number; y: number }[] = [
  { state: "GEN_CREATED", label: "CREATED", x: 8, y: 34 },
  { state: "GEN_RUNNING", label: "RUNNING", x: 172, y: 34 },
  { state: "GEN_SUSPENDED", label: "SUSPENDED", x: 336, y: 34 },
  { state: "GEN_CLOSED", label: "CLOSED", x: 172, y: 106 },
];

function StateDiagram({ state }: { state: State }) {
  return (
    <svg viewBox="0 0 480 152" className="w-full max-w-xl" role="img" aria-label={`Generator state: ${state}`}>
      <defs>
        <marker id="gen-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="var(--muted)" />
        </marker>
      </defs>
      <line x1={136} y1={55} x2={170} y2={55} stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#gen-arrow)" />
      <path d="M300 46 H334" stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#gen-arrow)" fill="none" />
      <path d="M336 66 H302" stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#gen-arrow)" fill="none" />
      <line x1={236} y1={76} x2={236} y2={104} stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#gen-arrow)" />
      <text x={153} y={26} textAnchor="middle" fontSize={12} fill="var(--muted)">next()</text>
      <text x={318} y={26} textAnchor="middle" fontSize={12} fill="var(--muted)">yield</text>
      <text x={318} y={90} textAnchor="middle" fontSize={12} fill="var(--muted)">next / send</text>
      <text x={228} y={95} textAnchor="end" fontSize={12} fill="var(--muted)">return / raise</text>
      {NODES.map((node) => {
        const active = node.state === state;
        return (
          <g key={node.state}>
            <rect x={node.x} y={node.y} width={128} height={42} rx={6} fill={active ? "var(--accent-soft)" : "var(--paper)"} stroke={active ? "var(--accent)" : "var(--line)"} strokeWidth={active ? 2 : 1} />
            <text x={node.x + 64} y={node.y + 26} textAnchor="middle" fontSize={14} fontWeight={active ? 600 : 400} fill={active ? "var(--accent)" : "var(--ink)"}>
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function GeneratorViz() {
  const stepper = useStepper(STEPS.length);
  const current = STEPS[stepper.step];
  const generatorHasControl = current.state === "GEN_RUNNING";

  return (
    <VizFrame title="A frame that pauses instead of returning">
      <StateDiagram state={current.state} />
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        <CodePanel label={generatorHasControl ? "Caller (waiting)" : "Caller (has control)"} lines={CALLER} active={current.caller} />
        <CodePanel label={generatorHasControl ? "Generator frame (has control)" : "Generator frame (paused)"} lines={GENERATOR} active={current.frame} />
      </div>
      <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <dt className="text-muted">Frame locals</dt>
          <dd><Chip key={current.locals} tone="info">{current.locals}</Chip></dd>
        </div>
        {current.result && (
          <div className="flex items-center gap-2">
            <dt className="text-muted">Caller sees</dt>
            <dd><Chip key={current.result} tone="ok">{current.result}</Chip></dd>
          </div>
        )}
      </dl>
      <StepControls stepper={stepper} note={current.note} />
    </VizFrame>
  );
}

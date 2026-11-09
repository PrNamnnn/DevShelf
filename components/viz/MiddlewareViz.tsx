"use client";

import { useState } from "react";
import { Chip, StepControls, useStepper, VizFrame } from "./stepper";

type NodeId = "logger" | "json" | "auth" | "handler" | "notFound" | "error";

const NODES: { id: NodeId; label: string; x: number; y: number; w: number }[] = [
  { id: "logger", label: "requestLogger", x: 10, y: 12, w: 210 },
  { id: "json", label: "express.json()", x: 10, y: 78, w: 210 },
  { id: "auth", label: "requireAuth (route)", x: 10, y: 144, w: 210 },
  { id: "handler", label: "route handler", x: 10, y: 210, w: 210 },
  { id: "notFound", label: "404 fallback", x: 10, y: 276, w: 210 },
  { id: "error", label: "errorHandler (4 args)", x: 270, y: 144, w: 180 },
];

const HEIGHT = 46;

interface Hop {
  at: NodeId;
  note: string;
}

interface Scenario {
  id: string;
  label: string;
  request: string;
  status: string;
  ok: boolean;
  skipped: NodeId[];
  hops: Hop[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "ok", label: "Success", request: "GET /orders/7 with a valid token", status: "200 OK", ok: true, skipped: ["notFound", "error"],
    hops: [
      { at: "logger", note: "App-level middleware runs in the order it was registered. The logger subscribes to the response's finish event, then calls next()." },
      { at: "json", note: "express.json() only parses a matching Content-Type. A GET has no body, so it simply calls next()." },
      { at: "auth", note: "The route matches, so its middleware runs. The token is valid: req.user is set and next() continues." },
      { at: "handler", note: "The handler calls res.json(), which ends the cycle. Nothing below it runs, so the 404 fallback is never reached." },
    ],
  },
  {
    id: "auth", label: "Rejected token", request: "GET /orders/7 with no token", status: "401 Unauthorized", ok: false, skipped: ["handler", "notFound"],
    hops: [
      { at: "logger", note: "The logger runs for every request, whatever happens later." },
      { at: "json", note: "There is no body to parse, so next() continues." },
      { at: "auth", note: "No token, so requireAuth calls next(new HttpError(401)). Passing an error switches Express to error mode." },
      { at: "error", note: "Every remaining normal middleware is skipped. The first four-argument handler receives the error and sends a 401." },
    ],
  },
  {
    id: "throw", label: "Async handler fails", request: "GET /orders/7 while the database is down", status: "503 Service Unavailable", ok: false, skipped: ["notFound"],
    hops: [
      { at: "logger", note: "The request starts normally." },
      { at: "json", note: "There is no body to parse, so next() continues." },
      { at: "auth", note: "The token is valid, so next() continues." },
      { at: "handler", note: "The async handler awaits the database and it throws. The returned promise rejects." },
      { at: "error", note: "Express 5 sees the rejected promise and calls next(err) for you. Express 4 ignored the returned promise, so you needed a wrapper or try/catch." },
    ],
  },
  {
    id: "badjson", label: "Malformed JSON", request: "POST /orders with body {oops", status: "400 Bad Request", ok: false, skipped: ["auth", "handler", "notFound"],
    hops: [
      { at: "logger", note: "The request starts normally." },
      { at: "json", note: "The parser fails and forwards an error with status 400 and type entity.parse.failed." },
      { at: "error", note: "Authentication and the handler never run, which is why parser placement matters. The error handler reads err.status and sends a 400." },
    ],
  },
  {
    id: "missing", label: "Unknown URL", request: "GET /nope", status: "404 Not Found", ok: false, skipped: ["auth", "handler"],
    hops: [
      { at: "logger", note: "The request starts normally." },
      { at: "json", note: "There is no body to parse, so next() continues." },
      { at: "notFound", note: "No route matched, so requireAuth and the handler did not run. Requests that fall through reach the last normal middleware, the 404 fallback." },
      { at: "error", note: "The fallback calls next(new HttpError(404)), so 404s get the same JSON format as every other error." },
    ],
  },
];

function center(id: NodeId) {
  const node = NODES.find((item) => item.id === id)!;
  return { x: node.x + node.w / 2, y: node.y + HEIGHT / 2 };
}

function Pipeline({ scenario, hop, finished }: { scenario: Scenario; hop: number; finished: boolean }) {
  const visited = new Set(scenario.hops.slice(0, hop + 1).map((item) => item.at));
  const position = center(scenario.hops[hop].at);

  return (
    <svg viewBox="0 0 460 334" className="mx-auto w-full max-w-lg" role="img" aria-label={`Request at ${scenario.hops[hop].at}`}>
      <defs>
        <marker id="mw-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="var(--muted)" />
        </marker>
      </defs>
      {[12, 78, 144, 210].map((y) => (
        <line key={y} x1={115} y1={y + HEIGHT} x2={115} y2={y + 64} stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#mw-arrow)" />
      ))}
      {NODES.slice(0, 5).map((node) => (
        <path key={node.id} d={`M220 ${node.y + HEIGHT / 2} H245 V167 H268`} fill="none" stroke="var(--danger)" strokeWidth={1} strokeDasharray="4 4" opacity={0.55} markerEnd="url(#mw-arrow)" />
      ))}
      <text x={360} y={132} textAnchor="middle" fontSize={12} fill="var(--danger)">next(err) or a throw</text>

      {NODES.map((node) => {
        const isCurrent = node.id === scenario.hops[hop].at;
        const wasSkipped = finished && scenario.skipped.includes(node.id);
        const seen = visited.has(node.id);
        const stroke = isCurrent ? "var(--accent)" : "var(--line)";
        const fill = isCurrent ? "var(--accent-soft)" : seen ? "var(--card)" : "var(--paper)";
        return (
          <g key={node.id} opacity={wasSkipped ? 0.4 : 1}>
            <rect x={node.x} y={node.y} width={node.w} height={HEIGHT} rx={6} fill={fill} stroke={stroke} strokeWidth={isCurrent ? 2 : 1} />
            <text x={node.x + node.w / 2} y={node.y + 28} textAnchor="middle" fontSize={14.5} fontWeight={isCurrent ? 600 : 400} fill="var(--ink)">
              {node.label}
            </text>
          </g>
        );
      })}

      <g className="token-move" style={{ transform: `translate(${position.x - (scenario.hops[hop].at === "error" ? 78 : 92)}px, ${position.y}px)` }}>
        <circle r={8} fill="var(--accent)" />
      </g>
    </svg>
  );
}

function ScenarioPlayer({ scenario }: { scenario: Scenario }) {
  const stepper = useStepper(scenario.hops.length);
  const finished = stepper.step === scenario.hops.length - 1;
  return (
    <>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Request</span>
        <span className="font-mono text-xs">{scenario.request}</span>
        {finished && <Chip tone={scenario.ok ? "ok" : "danger"}>{scenario.status}</Chip>}
      </p>
      <div className="mt-3">
        <Pipeline scenario={scenario} hop={stepper.step} finished={finished} />
      </div>
      <StepControls stepper={stepper} note={scenario.hops[stepper.step].note} />
    </>
  );
}

export function MiddlewareViz() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((item) => item.id === scenarioId)!;

  return (
    <VizFrame title="One pipeline, five requests">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a request">
        {SCENARIOS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === scenario.id}
            onClick={() => setScenarioId(item.id)}
            className={`rounded-md border px-3 py-1.5 text-sm ${item.id === scenario.id ? "border-accent bg-accent-soft font-medium text-accent" : "border-line hover:bg-accent-soft"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <ScenarioPlayer key={scenario.id} scenario={scenario} />
    </VizFrame>
  );
}

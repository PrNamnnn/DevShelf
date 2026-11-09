"use client";

import { StepControls, useStepper, VizFrame } from "./stepper";
import { StateChips } from "./TreeViz";

interface LaneStep {
  from: number;
  to: number;
  label: string;
  note: string;
  state?: Record<string, string>;
}

const WIDTH = 640;
const HEADER = 44;
const ROW = 42;

/** A sequence diagram that reveals one message per step. */
export function LanesViz({ title, actors, steps }: { title: string; actors: string[]; steps: LaneStep[] }) {
  const stepper = useStepper(steps.length);
  const shown = steps.slice(0, stepper.step + 1);
  const gap = (WIDTH - 110) / Math.max(actors.length - 1, 1);
  const laneX = (index: number) => 55 + index * gap;
  const height = HEADER + steps.length * ROW + 10;
  const markerId = `lane${title.replace(/\W/g, "")}`;

  return (
    <VizFrame title={title}>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} className="block w-full" style={{ minWidth: 520 }} role="img" aria-label={title}>
          <defs>
            <marker id={markerId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="context-stroke" />
            </marker>
          </defs>
          {actors.map((actor, index) => (
            <g key={actor}>
              <rect x={laneX(index) - 50} y={4} width={100} height={28} rx={8} fill="var(--paper)" stroke="var(--line-strong)" />
              <text x={laneX(index)} y={23} textAnchor="middle" fontSize={12.5} fontWeight={500} fill="var(--ink)">
                {actor}
              </text>
              <line x1={laneX(index)} y1={32} x2={laneX(index)} y2={height} stroke="var(--line)" strokeDasharray="3 4" />
            </g>
          ))}
          {shown.map((step, index) => {
            const y = HEADER + index * ROW + 14;
            const isCurrent = index === stepper.step;
            const color = isCurrent ? "var(--accent)" : "var(--muted)";
            const self = step.from === step.to;
            const x1 = laneX(step.from);
            const x2 = laneX(step.to);
            return (
              <g key={index} className="viz-arrow">
                {self ? (
                  <path d={`M${x1} ${y - 8} h26 v14 h-24`} fill="none" stroke={color} strokeWidth={1.4} markerEnd={`url(#${markerId})`} />
                ) : (
                  <line x1={x1} y1={y} x2={x2 + (x2 > x1 ? -3 : 3)} y2={y} stroke={color} strokeWidth={1.4} markerEnd={`url(#${markerId})`} />
                )}
                <text x={self ? x1 + 32 : (x1 + x2) / 2} y={self ? y + 3 : y - 6} textAnchor={self ? "start" : "middle"} fontSize={12} fontWeight={isCurrent ? 600 : 400} fill={isCurrent ? "var(--ink)" : "var(--muted)"}>
                  {step.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <StateChips state={steps[stepper.step].state} />
      <StepControls stepper={stepper} note={steps[stepper.step].note} />
    </VizFrame>
  );
}

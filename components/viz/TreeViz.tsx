"use client";

import { Chip, StepControls, useStepper, VizFrame } from "./stepper";

interface TreeNode {
  id: string;
  label: string;
  parent?: string;
}

interface TreeStep {
  note: string;
  active?: string[];
  visited?: string[];
  faded?: string[];
  state?: Record<string, string>;
}

const NODE_W = 104;
const NODE_H = 34;
const GAP_X = 14;
const GAP_Y = 54;

function layout(nodes: TreeNode[]) {
  const children = (id?: string) => nodes.filter((node) => node.parent === id);
  const position = new Map<string, { x: number; y: number }>();
  let cursor = 0;

  function place(node: TreeNode, depth: number): number {
    const kids = children(node.id);
    const x = kids.length === 0 ? cursor++ * (NODE_W + GAP_X) : kids.map((kid) => place(kid, depth + 1)).reduce((a, b, _, all) => a + b / all.length, 0);
    position.set(node.id, { x, y: depth * (NODE_H + GAP_Y) });
    return x;
  }

  children(undefined).forEach((root) => place(root, 0));
  const depth = Math.max(...[...position.values()].map((point) => point.y));
  return { position, width: Math.max(cursor * (NODE_W + GAP_X) - GAP_X, NODE_W), height: depth + NODE_H };
}

/** A tree whose nodes light up per step: component trees, B-trees, plan trees. */
export function TreeViz({ title, nodes, steps }: { title: string; nodes: TreeNode[]; steps: TreeStep[] }) {
  const stepper = useStepper(steps.length);
  const current = steps[stepper.step];
  const { position, width, height } = layout(nodes);
  const pad = 4;

  const styleFor = (id: string) => {
    if (current.active?.includes(id)) return { fill: "var(--accent-soft)", stroke: "var(--accent)", text: "var(--accent)", weight: 600 };
    if (current.visited?.includes(id)) return { fill: "var(--pink-soft)", stroke: "var(--pink)", text: "var(--ink)", weight: 400 };
    return { fill: "var(--paper)", stroke: "var(--line-strong)", text: "var(--ink)", weight: 400 };
  };

  return (
    <VizFrame title={title}>
      <div className="overflow-x-auto">
        <svg viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`} className="mx-auto block" style={{ width: "100%", minWidth: Math.min(width * 0.72, 520), maxWidth: width * 1.15 }} role="img" aria-label={title}>
          {nodes.flatMap((node) => {
            if (!node.parent) return [];
            const from = position.get(node.parent)!;
            const to = position.get(node.id)!;
            const midY = (from.y + NODE_H + to.y) / 2;
            return [
              <path
                key={node.id}
                className="viz-edge"
                d={`M${from.x + NODE_W / 2} ${from.y + NODE_H} C${from.x + NODE_W / 2} ${midY} ${to.x + NODE_W / 2} ${midY} ${to.x + NODE_W / 2} ${to.y}`}
                fill="none"
                stroke={current.active?.includes(node.id) ? "var(--accent)" : "var(--line-strong)"}
              />,
            ];
          })}
          {nodes.map((node) => {
            const point = position.get(node.id)!;
            const look = styleFor(node.id);
            return (
              <g key={node.id} className="viz-node" opacity={current.faded?.includes(node.id) ? 0.35 : 1}>
                <rect x={point.x} y={point.y} width={NODE_W} height={NODE_H} rx={8} fill={look.fill} stroke={look.stroke} />
                <text x={point.x + NODE_W / 2} y={point.y + 22} textAnchor="middle" fontSize={12.5} fontWeight={look.weight} fill={look.text}>
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <StateChips state={current.state} />
      <StepControls stepper={stepper} note={current.note} />
    </VizFrame>
  );
}

export function StateChips({ state }: { state?: Record<string, string> }) {
  return (
    <dl className="mt-3 flex min-h-7 flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      {Object.entries(state ?? {}).map(([label, value]) => (
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
  );
}

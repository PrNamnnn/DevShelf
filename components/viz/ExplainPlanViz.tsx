"use client";

import { useState } from "react";
import { VizFrame } from "./stepper";

interface PlanNode {
  id: string;
  name: string;
  depth: number;
  estimated: number;
  actual: number;
  loops: number;
  /** Actual total time of one loop, in milliseconds. */
  time: number;
  childIds: string[];
  raw: string;
  reading: string;
}

interface Scenario {
  id: string;
  label: string;
  query: string;
  execution: string;
  nodes: PlanNode[];
}

/** Captured from EXPLAIN (ANALYZE, BUFFERS) on PostgreSQL 18.6 with 200,000 orders. */
const SCENARIOS: Scenario[] = [
  {
    id: "sort",
    label: "No useful index",
    query: "SELECT id, total FROM orders WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5;",
    execution: "35.107 ms",
    nodes: [
      { id: "limit", name: "Limit", depth: 0, estimated: 5, actual: 5, loops: 1, time: 35.055, childIds: ["sort"], raw: "Limit (cost=4404.22..4404.23 rows=5 width=22)", reading: "Limit is cheap here, but its startup cost is almost its total cost. It cannot return a first row until the whole Sort below it has worked." },
      { id: "sort", name: "Sort (top-N heapsort)", depth: 1, estimated: 2060, actual: 5, loops: 1, time: 35.039, childIds: ["seq"], raw: "Sort (cost=4404.22..4409.37 rows=2060 width=22)  Sort Method: top-N heapsort  Memory: 17kB", reading: "The planner estimates the rows the sort would emit if run to completion. Limit stops after 5, so the 2060 vs 5 gap is expected and not a bad estimate." },
      { id: "seq", name: "Seq Scan on orders", depth: 2, estimated: 2060, actual: 2061, loops: 1, time: 31.612, childIds: [], raw: "Seq Scan on orders (cost=0.00..4370.00 rows=2060 width=22)  Rows Removed by Filter: 197939  Buffers: shared hit=1870", reading: "This is the real cost. It reads all 1870 pages and throws away 197,939 rows to keep 2,061. The estimate is excellent, so statistics are fine. The missing piece is an access path." },
    ],
  },
  {
    id: "index",
    label: "Index on (status, created_at DESC)",
    query: "SELECT id, total FROM orders WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5;",
    execution: "0.110 ms",
    nodes: [
      { id: "limit", name: "Limit", depth: 0, estimated: 5, actual: 5, loops: 1, time: 0.079, childIds: ["idx"], raw: "Limit (cost=0.42..8.50 rows=5 width=22)  Buffers: shared hit=5 read=3", reading: "The total cost dropped from 4404 to 8.50, and the startup cost is close to zero because the first row is available almost immediately." },
      { id: "idx", name: "Index Scan using orders_status_created_idx", depth: 1, estimated: 2167, actual: 5, loops: 1, time: 0.069, childIds: [], raw: "Index Scan using orders_status_created_idx on orders (cost=0.42..3503.24 rows=2167 width=22)  Index Searches: 1", reading: "The index already stores failed orders newest-first, so there is no Sort. Its 3503 cost and 2167 rows assume a full run, but Limit stops it after 5 rows. That early exit is why the parent costs only 8.50." },
    ],
  },
  {
    id: "join",
    label: "Hash join and aggregate",
    query: "SELECT c.country, sum(o.total) FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'failed' GROUP BY c.country;",
    execution: "42.439 ms",
    nodes: [
      { id: "agg", name: "HashAggregate", depth: 0, estimated: 5, actual: 5, loops: 1, time: 42.329, childIds: ["hj"], raw: "HashAggregate (cost=2570.38..2570.44 rows=5 width=35)  Batches: 1  Memory Usage: 32kB", reading: "It groups 2,061 joined rows into 5 countries. Batches: 1 means it stayed in memory." },
      { id: "hj", name: "Hash Join", depth: 1, estimated: 2167, actual: 2061, loops: 1, time: 38.859, childIds: ["bhs", "hash"], raw: "Hash Join (cost=564.21..2559.55 rows=2167 width=9)  Hash Cond: (o.customer_id = c.id)", reading: "It probes the hash table once per failed order. The join's actual startup of 30.461 ms is almost entirely the time spent building that table." },
      { id: "bhs", name: "Bitmap Heap Scan on orders", depth: 2, estimated: 2167, actual: 2061, loops: 1, time: 6.029, childIds: ["bis"], raw: "Bitmap Heap Scan on orders o (cost=25.21..2014.86 rows=2167 width=10)  Heap Blocks: exact=1869", reading: "These rows are scattered over 1869 pages, so the planner collects their locations first and then visits pages in physical order." },
      { id: "bis", name: "Bitmap Index Scan", depth: 3, estimated: 2167, actual: 2061, loops: 1, time: 0.568, childIds: [], raw: "Bitmap Index Scan on orders_status_created_idx (cost=0.00..24.67 rows=2167 width=0)", reading: "This scan runs first. It produces row locations, not rows, which is why its width is 0." },
      { id: "hash", name: "Hash", depth: 2, estimated: 20000, actual: 20000, loops: 1, time: 29.241, childIds: ["cust"], raw: "Hash (cost=289.00..289.00 rows=20000 width=7)  Buckets: 32768  Batches: 1  Memory Usage: 753kB", reading: "It builds an in-memory table of all 20,000 customers. Its startup cost equals its total cost because it must finish before emitting anything." },
      { id: "cust", name: "Seq Scan on customers", depth: 3, estimated: 20000, actual: 20000, loops: 1, time: 13.406, childIds: [], raw: "Seq Scan on customers c (cost=0.00..289.00 rows=20000 width=7)", reading: "A sequential scan is correct here, because every customer is needed. Not every Seq Scan is a problem." },
    ],
  },
];

function selfTime(node: PlanNode, nodes: PlanNode[]): number {
  const childrenTime = node.childIds
    .map((id) => nodes.find((candidate) => candidate.id === id)!)
    .reduce((sum, child) => sum + child.time * child.loops, 0);
  return Math.max(0, node.time * node.loops - childrenTime);
}

export function ExplainPlanViz() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((item) => item.id === scenarioId)!;
  const [selectedByScenario, setSelected] = useState<Record<string, string>>({});
  const selectedId = selectedByScenario[scenario.id] ?? scenario.nodes[scenario.nodes.length - 1].id;
  const selected = scenario.nodes.find((node) => node.id === selectedId)!;

  const selfTimes = scenario.nodes.map((node) => selfTime(node, scenario.nodes));
  const maxSelf = Math.max(...selfTimes, 0.001);

  return (
    <VizFrame title="Read a plan by following the time">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a query plan">
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

      <pre className="mt-3 overflow-x-auto rounded-md border border-line bg-paper px-3 py-2 font-mono text-xs leading-5">{scenario.query}</pre>

      <div className="mt-3 flex justify-between text-xs text-muted">
        <span>Rows flow upward. Select a node.</span>
        <span>
          Execution Time <strong className="font-mono text-ink">{scenario.execution}</strong>
        </span>
      </div>

      <ul className="mt-2 space-y-1">
        {scenario.nodes.map((node, index) => {
          const active = node.id === selected.id;
          return (
            <li key={node.id} style={{ paddingLeft: node.depth * 16 }}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setSelected({ ...selectedByScenario, [scenario.id]: node.id })}
                className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${active ? "border-accent bg-accent-soft" : "border-line hover:bg-paper"}`}
              >
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="min-w-0 text-sm font-medium">{node.name}</span>
                  <span className="font-mono text-xs text-muted">
                    rows {node.estimated.toLocaleString("en-US")} est / {node.actual.toLocaleString("en-US")} actual
                  </span>
                </span>
                <svg viewBox="0 0 100 3" preserveAspectRatio="none" className="mt-1.5 block h-1.5 w-full" aria-hidden="true">
                  <rect width="100" height="3" fill="var(--line)" />
                  <rect width={Math.max(0.5, (selfTimes[index] / maxSelf) * 100)} height="3" fill="var(--accent)" />
                </svg>
                <span className="mt-1 block font-mono text-xs text-muted">self time ≈ {selfTimes[index].toFixed(3)} ms</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="mt-4 border-t border-line pt-3">
        <p className="text-[0.95rem] leading-relaxed">{selected.reading}</p>
        <pre className="mt-2 overflow-x-auto rounded-md border border-line bg-paper px-3 py-2 font-mono text-xs leading-5">{selected.raw}</pre>
      </div>
    </VizFrame>
  );
}

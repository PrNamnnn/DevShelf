"use client";

import { CodePanel, StepControls, useStepper, VizFrame } from "./stepper";
import { StateChips } from "./TreeViz";

interface TableData {
  name: string;
  columns: string[];
  rows: (string | number | null)[][];
}

interface TableStep {
  note: string;
  line?: number;
  highlight?: Record<string, number[]>;
  output?: (string | number | null)[][];
  state?: Record<string, string>;
}

function Grid({ table, marked }: { table: TableData; marked: number[] }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{table.name}</p>
      <table className="w-full border-collapse font-mono text-xs">
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th key={column} className="border-b border-line px-2 py-1 text-left font-medium text-muted">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, index) => (
            <tr key={index} className={`transition-colors ${marked.includes(index) ? "bg-accent-soft font-medium text-accent" : ""}`}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b border-line px-2 py-1">
                  {cell ?? "NULL"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Rows lighting up per step: joins, loops, and anything read as tuples. */
export function TableViz({
  title,
  code,
  tables,
  outputColumns,
  steps,
}: {
  title: string;
  code?: string[];
  tables: TableData[];
  outputColumns?: string[];
  steps: TableStep[];
}) {
  const stepper = useStepper(steps.length);
  const current = steps[stepper.step];

  return (
    <VizFrame title={title}>
      {code && <CodePanel label="Code" lines={code} active={current.line ?? null} />}
      <div className="mt-3 flex flex-wrap gap-5">
        {tables.map((table) => (
          <Grid key={table.name} table={table} marked={current.highlight?.[table.name] ?? []} />
        ))}
        {outputColumns && <Grid table={{ name: "Result", columns: outputColumns, rows: current.output ?? [] }} marked={[(current.output?.length ?? 0) - 1]} />}
      </div>
      <StateChips state={current.state} />
      <StepControls stepper={stepper} note={current.note} />
    </VizFrame>
  );
}

import Link from "next/link";
import type { ComponentProps, ComponentType, ReactNode, SVGProps } from "react";
import { AlertIcon, ArchiveIcon, ChevronIcon, InfoIcon, TagIcon } from "@/components/icons";
import { CltSimulator, DistributionExplorer, EventLoopViz, ExplainPlanViz, GeneratorViz, HypothesisViz, LanesViz, MemoryViz, MiddlewareViz, RegressionViz, SampleSizeCalculator, StepFlow, TableViz, TestSelector, ThresholdExplorer, TreeViz } from "@/components/viz/lazy";

const CALLOUT_STYLES: Record<string, { label: string; className: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
  note: { label: "Note", className: "bg-info-soft", Icon: InfoIcon },
  warning: { label: "Watch out", className: "bg-warn-soft", Icon: AlertIcon },
  deprecated: { label: "Deprecated", className: "bg-danger-soft", Icon: ArchiveIcon },
  version: { label: "Version note", className: "bg-ok-soft", Icon: TagIcon },
};

function Callout({ type = "note", children }: { type?: string; children: ReactNode }) {
  const { label, className, Icon } = CALLOUT_STYLES[type];
  return (
    <aside className={`callout ${className}`}>
      <Icon />
      <div>
        <p className="callout-title">{label}</p>
        <div>{children}</div>
      </div>
    </aside>
  );
}

function Formula({ children }: { children: ReactNode }) {
  return <p className="formula">{children}</p>;
}

function Question({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="question">
      <summary>
        {q}
        <ChevronIcon />
      </summary>
      <div>{children}</div>
    </details>
  );
}

function Anchor({ href = "", children, ...rest }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  return (
    <a href={href} rel="noreferrer" {...rest}>
      {children}
    </a>
  );
}

/** Add new chapter components here; the content validator reads this list. */
export const mdxComponents = {
  a: Anchor,
  Callout,
  Formula,
  Question,
  CltSimulator,
  DistributionExplorer,
  HypothesisViz,
  RegressionViz,
  SampleSizeCalculator,
  TestSelector,
  ThresholdExplorer,
  EventLoopViz,
  ExplainPlanViz,
  GeneratorViz,
  LanesViz,
  MemoryViz,
  MiddlewareViz,
  StepFlow,
  TableViz,
  TreeViz,
};

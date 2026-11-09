"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { NotebookLoader } from "@/components/NotebookLoader";

const loading = () => <NotebookLoader label="Loading visual" className="viz-fallback" />;

/**
 * Each lesson downloads only the visualizations it renders, and each one stays as its
 * server-rendered HTML until it comes near the viewport, so diagrams further down the
 * page cost nothing while the lesson is loading.
 */
function deferred<P extends object>(load: () => Promise<ComponentType<P>>) {
  const ServerRendered = dynamic(load, { loading });
  let loaded: ComponentType<P> | null = null;
  const fetchOnce = () =>
    load().then((component) => {
      loaded = component;
      return component;
    });

  return function DeferredViz(props: P) {
    const slot = useRef<HTMLDivElement>(null);
    const [Ready, setReady] = useState<ComponentType<P> | null>(() => loaded);
    const [waiting, setWaiting] = useState(false);

    useEffect(() => {
      if (Ready || !slot.current) return;
      const element = slot.current;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          if (element.childElementCount === 0) setWaiting(true);
          void fetchOnce().then((component) => setReady(() => component));
        },
        { rootMargin: "800px" },
      );
      observer.observe(element);
      return () => observer.disconnect();
    }, [Ready]);

    if (typeof window === "undefined") {
      return (
        <div className="viz-slot">
          <ServerRendered {...props} />
        </div>
      );
    }
    if (Ready) {
      return (
        <div ref={slot} className="viz-slot">
          <Ready {...props} />
        </div>
      );
    }
    if (waiting) {
      return (
        <div ref={slot} className="viz-slot">
          {loading()}
        </div>
      );
    }
    return <div ref={slot} className="viz-slot" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "" }} />;
  };
}

export const EventLoopViz = deferred(() => import("./EventLoopViz").then((m) => m.EventLoopViz));
export const ExplainPlanViz = deferred(() => import("./ExplainPlanViz").then((m) => m.ExplainPlanViz));
export const GeneratorViz = deferred(() => import("./GeneratorViz").then((m) => m.GeneratorViz));
export const MiddlewareViz = deferred(() => import("./MiddlewareViz").then((m) => m.MiddlewareViz));
export const StepFlow = deferred(() => import("./StepFlow").then((m) => m.StepFlow));
export const TreeViz = deferred(() => import("./TreeViz").then((m) => m.TreeViz));
export const MemoryViz = deferred(() => import("./MemoryViz").then((m) => m.MemoryViz));
export const LanesViz = deferred(() => import("./LanesViz").then((m) => m.LanesViz));
export const DistributionExplorer = deferred(() => import("./DistributionExplorer").then((m) => m.DistributionExplorer));
export const CltSimulator = deferred(() => import("./StatsLabs").then((m) => m.CltSimulator));
export const HypothesisViz = deferred(() => import("./StatsLabs").then((m) => m.HypothesisViz));
export const SampleSizeCalculator = deferred(() => import("./StatsLabs").then((m) => m.SampleSizeCalculator));
export const RegressionViz = deferred(() => import("./StatsLabs").then((m) => m.RegressionViz));
export const ThresholdExplorer = deferred(() => import("./StatsLabs").then((m) => m.ThresholdExplorer));
export const TestSelector = deferred(() => import("./TestSelector").then((m) => m.TestSelector));
export const TableViz = deferred(() => import("./TableViz").then((m) => m.TableViz));

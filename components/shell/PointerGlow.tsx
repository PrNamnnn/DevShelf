"use client";

import { useEffect, useRef } from "react";

/** A single soft light that follows the pointer. Off for touch and reduced motion. */
export function PointerGlow() {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || calm || document.documentElement.dataset.lite) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      if (glow.current) glow.current.style.transform = `translate3d(${x - 260}px, ${y - 260}px, 0)`;
    };
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (glow.current) glow.current.style.opacity = "1";
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={glow} className="pointer-glow" aria-hidden="true" />;
}

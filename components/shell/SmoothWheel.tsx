"use client";

import { useEffect } from "react";

const EASE = 0.14;
const TRACKPAD_MEMORY_MS = 400;

function insideScroller(start: EventTarget | null, deltaY: number) {
  for (let node = start instanceof Element ? start : null; node && node !== document.body; node = node.parentElement) {
    if (node.scrollHeight <= node.clientHeight) continue;
    const { overflowY } = getComputedStyle(node);
    if (overflowY !== "auto" && overflowY !== "scroll") continue;
    const room = deltaY > 0 ? node.scrollHeight - node.clientHeight - node.scrollTop : node.scrollTop;
    if (room > 1) return true;
  }
  return false;
}

/**
 * Glides mouse-wheel notches. Trackpads, touch and keyboards already scroll smoothly,
 * so they keep native behaviour, and no frame loop runs while the page is at rest.
 */
export function SmoothWheel() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Native wheel scrolling runs off the main thread, which matters most on slower machines.
    if (document.documentElement.dataset.lite) return;

    let frame = 0;
    let target = 0;
    let current = 0;
    let lastTrackpad = 0;

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const step = () => {
      // Something else moved the page, such as a route change or scrollbar drag.
      if (Math.abs(window.scrollY - current) > 3) return stop();
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.5) current = target;
      window.scrollTo({ top: current, behavior: "instant" });
      if (current === target) frame = 0;
      else frame = requestAnimationFrame(step);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.shiftKey || event.defaultPrevented || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const size = Math.abs(event.deltaY);
      const isNotch = event.deltaMode === 1 || size >= 50;
      if (!isNotch) lastTrackpad = event.timeStamp;
      if (!isNotch || event.timeStamp - lastTrackpad < TRACKPAD_MEMORY_MS) return stop();
      if (insideScroller(event.target, event.deltaY)) return;

      event.preventDefault();
      const delta = event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY;
      if (!frame) current = target = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(max, target + delta));
      if (!frame) frame = requestAnimationFrame(step);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      stop();
    };
  }, []);

  return null;
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NotebookLoader } from "@/components/NotebookLoader";

export const NAVIGATION_START = "devshelf:navigation-start";

/** If a navigation never lands, stop covering the page rather than trapping the reader. */
const GIVE_UP_MS = 20_000;

/**
 * Next.js keeps the old page on screen until the server first responds, so feedback
 * has to start on the click. The overlay clears as soon as the new route commits.
 */
export function NavigationLoader() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  if (lastPath !== pathname) {
    setLastPath(pathname);
    setPending(false);
  }

  useEffect(() => {
    const start = () => setPending(true);

    function onClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      // The shelf plays its opening animation first and announces the navigation itself.
      if (anchor.matches(".book-link") && !matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      start();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener(NAVIGATION_START, start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(NAVIGATION_START, start);
    };
  }, []);

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), GIVE_UP_MS);
    return () => clearTimeout(timer);
  }, [pending]);

  return pending ? <NotebookLoader className="nav-loading" /> : null;
}

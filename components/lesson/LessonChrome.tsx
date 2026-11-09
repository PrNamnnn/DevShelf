"use client";

import { useEffect, useRef, useState } from "react";
import { BookmarkIcon, CheckIcon } from "@/components/icons";
import type { TocEntry } from "@/lib/mdx";
import { recordRead, toggleBookmark, toggleCompleted, useProgress } from "@/lib/progress";

export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const paint = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={bar} className="reading-bar" aria-hidden="true" />;
}

export function LessonActions({ id }: { id: string }) {
  const { learned, bookmarks } = useProgress();
  const done = learned.includes(id);
  const saved = bookmarks.includes(id);

  useEffect(() => recordRead(id), [id]);

  return (
    <>
      <button
        type="button"
        className="icon-btn"
        data-active={saved}
        aria-pressed={saved}
        aria-label={saved ? "Remove bookmark" : "Bookmark this lesson"}
        data-tip={saved ? "Bookmarked" : "Bookmark"}
        onClick={() => toggleBookmark(id)}
      >
        <BookmarkIcon fill={saved ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        className="icon-btn"
        data-active={done}
        aria-pressed={done}
        aria-label={done ? "Mark as not completed" : "Mark as completed"}
        data-tip={done ? "Completed" : "Mark complete"}
        onClick={() => toggleCompleted(id)}
      >
        <CheckIcon />
      </button>
    </>
  );
}

export function CompleteButton({ id }: { id: string }) {
  const { learned } = useProgress();
  const done = learned.includes(id);
  return (
    <button type="button" className={`btn ${done ? "" : "btn-primary"}`} aria-pressed={done} onClick={() => toggleCompleted(id)}>
      <CheckIcon width={16} height={16} />
      {done ? "Completed" : "Mark lesson complete"}
    </button>
  );
}

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState(entries[0]?.id);

  useEffect(() => {
    const headings = entries.flatMap((entry) => document.getElementById(entry.id) ?? []);
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.25;
      const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= line);
      setActive((passed.at(-1) ?? headings[0])?.id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [entries]);

  return (
    <nav aria-label="On this page" className="toc">
      <p className="eyebrow">In this lesson</p>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a href={`#${entry.id}`} aria-current={active === entry.id ? "location" : undefined}>
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

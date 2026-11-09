"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IntentLink } from "@/components/IntentLink";
import { BookmarkIcon, CheckIcon, ChevronIcon, ClockIcon, SearchIcon } from "@/components/icons";
import { EmptyState, LevelDots, ProgressBar, ProgressRing } from "@/components/ui";
import type { LessonCard, Level } from "@/lib/content";
import { completion, toggleCompleted, useProgress } from "@/lib/progress";
import { getTechnology, technologies } from "@/lib/technologies";

function LessonLine({ lesson, done }: { lesson: LessonCard; done: boolean }) {
  const technology = getTechnology(lesson.tech);
  return (
    <li className="result">
      <i style={{ background: technology?.spine }} aria-hidden="true" />
      <IntentLink href={`/${lesson.tech}/${lesson.slug}`}>
        <span className="result-book">{technology?.name}</span>
        <strong>{lesson.title}</strong>
        <span className="result-summary">{lesson.summary}</span>
      </IntentLink>
      <span className="result-meta">
        <LevelDots level={lesson.level} />
        <span className="lesson-time">
          <ClockIcon width={13} height={13} /> {lesson.minutes}
        </span>
        <button
          type="button"
          className="result-check"
          aria-pressed={done}
          aria-label={`${done ? "Mark as not completed" : "Mark as completed"}: ${lesson.title}`}
          data-tip={done ? "Completed" : "Mark complete"}
          onClick={() => toggleCompleted(lesson.id)}
        >
          {done && <CheckIcon width={13} height={13} strokeWidth={2.6} />}
        </button>
      </span>
    </li>
  );
}

const LEVELS: { id: Level | "all"; label: string }[] = [
  { id: "all", label: "Any level" },
  { id: "fundamental", label: "Fundamental" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

/** Results render in batches as the reader nears the end, so the full list never sits in the DOM up front. */
const RESULT_BATCH = 40;

export function SearchView({ lessons }: { lessons: LessonCard[] }) {
  const { learned } = useProgress();
  const [query, setQuery] = useState("");
  const [tech, setTech] = useState("all");
  const [level, setLevel] = useState<Level | "all">("all");

  const [limit, setLimit] = useState(RESULT_BATCH);
  const sentinel = useRef<HTMLDivElement>(null);

  const filters = `${query}|${tech}|${level}`;
  const [lastFilters, setLastFilters] = useState(filters);
  if (filters !== lastFilters) {
    setLastFilters(filters);
    setLimit(RESULT_BATCH);
  }

  const index = useMemo(
    () =>
      lessons.map((lesson) => ({
        lesson,
        title: lesson.title.toLowerCase(),
        haystack: [lesson.title, lesson.summary, lesson.tech, lesson.section, ...lesson.tags].join(" ").toLowerCase(),
      })),
    [lessons],
  );

  const results = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return index
      .map(({ lesson, title, haystack }) => {
        if (!words.every((word) => haystack.includes(word))) return null;
        return { lesson, score: words.filter((word) => title.includes(word)).length };
      })
      .flatMap((item) => (item ? [item] : []))
      .filter(({ lesson }) => (tech === "all" || lesson.tech === tech) && (level === "all" || lesson.level === level))
      .sort((a, b) => b.score - a.score)
      .map(({ lesson }) => lesson);
  }, [index, query, tech, level]);

  const hasMore = results.length > limit;
  useEffect(() => {
    if (!hasMore || !sentinel.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setLimit((current) => current + RESULT_BATCH);
    }, { rootMargin: "1000px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, limit]);

  return (
    <div className="page-narrow">
      <p className="eyebrow">Discover</p>
      <h1 className="display-sm">Search the library</h1>

      <label className="field field-large">
        <SearchIcon />
        <span className="sr-only">Search lessons</span>
        <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="closures, EXPLAIN, Server Actions…" />
      </label>

      <div className="chips" role="group" aria-label="Book">
        <button type="button" className="chip" aria-pressed={tech === "all"} onClick={() => setTech("all")}>
          All books
        </button>
        {technologies.map((item) => (
          <button key={item.id} type="button" className="chip" aria-pressed={tech === item.id} onClick={() => setTech(item.id)}>
            {item.name}
          </button>
        ))}
      </div>
      <div className="chips" role="group" aria-label="Difficulty">
        {LEVELS.map((item) => (
          <button key={item.id} type="button" className="chip chip-quiet" aria-pressed={level === item.id} onClick={() => setLevel(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      <p className="results-count" aria-live="polite">
        {results.length} {results.length === 1 ? "lesson" : "lessons"}
      </p>
      {results.length > 0 ? (
        <ul className="results">
          {results.slice(0, limit).map((lesson) => (
            <LessonLine key={lesson.id} lesson={lesson} done={learned.includes(lesson.id)} />
          ))}
        </ul>
      ) : (
        <EmptyState title="No lessons found">
          <p>Try a broader word, or clear the filters.</p>
        </EmptyState>
      )}
      {hasMore && <div ref={sentinel} aria-hidden="true" />}
    </div>
  );
}

export interface BookOutline {
  id: string;
  sections: { id: string; title: string; lessonIds: string[] }[];
}

export function ProgressView({ books, lessons }: { books: BookOutline[]; lessons: LessonCard[] }) {
  const { learned, bookmarks, lastRead } = useProgress();
  const [open, setOpen] = useState<string | null>(null);
  const allIds = lessons.map((lesson) => lesson.id);
  const overall = completion(allIds, learned);
  const saved = lessons.filter((lesson) => bookmarks.includes(lesson.id));
  const current = lessons.find((lesson) => lesson.id === lastRead);

  return (
    <div className="page-narrow">
      <p className="eyebrow">Your reading</p>
      <div className="progress-hero">
        <ProgressRing percent={overall.percent} size={112} stroke={7}>
          {overall.percent}%
        </ProgressRing>
        <div>
          <h1 className="display-sm">
            {overall.done} of {overall.total} lessons
          </h1>
          <p className="muted-text">Completion is calculated from the lessons you have marked complete, and saved in this browser.</p>
        </div>
      </div>

      {current && (
        <section className="progress-block">
          <h2 className="block-title">Continue reading</h2>
          <ul className="results">
            <LessonLine lesson={current} done={learned.includes(current.id)} />
          </ul>
        </section>
      )}

      <section className="progress-block">
        <h2 className="block-title">By book</h2>
        <ul className="book-progress">
          {books.map((book) => {
            const technology = getTechnology(book.id)!;
            const { done, total, percent } = completion(book.sections.flatMap((section) => section.lessonIds), learned);
            const isOpen = open === book.id;
            return (
              <li key={book.id} data-open={isOpen}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : book.id)}>
                  <i style={{ background: technology.spine }} aria-hidden="true" />
                  <span className="book-progress-name">{technology.name}</span>
                  <ProgressBar percent={percent} label={`${technology.name} completion`} />
                  <span className="book-progress-count">
                    {done}/{total} · {percent}%
                  </span>
                  <ChevronIcon className="tree-chevron" />
                </button>
                {isOpen && (
                  <ul className="section-progress">
                    {book.sections.map((section) => {
                      const part = completion(section.lessonIds, learned);
                      return (
                        <li key={section.id}>
                          <span>{section.title}</span>
                          <ProgressBar percent={part.percent} label={`${section.title} completion`} />
                          <em>
                            {part.done}/{part.total}
                          </em>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="progress-block">
        <h2 className="block-title">
          <BookmarkIcon /> Bookmarks
        </h2>
        {saved.length > 0 ? (
          <ul className="results">
            {saved.map((lesson) => (
              <LessonLine key={lesson.id} lesson={lesson} done={learned.includes(lesson.id)} />
            ))}
          </ul>
        ) : (
          <EmptyState title="No bookmarks yet">
            <p>Use the bookmark button on any lesson to keep it here.</p>
          </EmptyState>
        )}
      </section>
    </div>
  );
}

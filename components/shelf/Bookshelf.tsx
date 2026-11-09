"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { SearchIcon } from "@/components/icons";
import { IntentLink } from "@/components/IntentLink";
import { Book3D, BookCover, coverStyle } from "@/components/shelf/BookCover";
import { NAVIGATION_START } from "@/components/shell/NavigationLoader";
import { EmptyState, ProgressBar, ProgressRing } from "@/components/ui";
import { completion, useProgress } from "@/lib/progress";
import { categories, groups, technologies, type GroupId, type Technology } from "@/lib/technologies";

export interface ShelfBook {
  id: string;
  lessonIds: string[];
  keywords: string;
}

type Status = "all" | "reading" | "finished" | "unread";

const STATUSES: { id: Status; label: string }[] = [
  { id: "all", label: "All" },
  { id: "reading", label: "Reading" },
  { id: "unread", label: "Unread" },
  { id: "finished", label: "Finished" },
];

const OPEN_MS = 820;

interface Opening {
  technology: Technology;
  rect: DOMRect;
}

function OpeningBook({ opening }: { opening: Opening }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { rect, technology } = opening;
  const scale = Math.min(1.9, (window.innerHeight * 0.68) / rect.height);
  const dx = window.innerWidth / 2 + (rect.width * scale) / 2 - (rect.left + rect.width / 2) - rect.width * scale * 0.5;
  const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);

  return (
    <div className="opening" data-open={open} aria-hidden="true">
      <div className="opening-veil" />
      <div
        className="opening-book"
        style={{
          ...coverStyle(technology),
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          transform: open ? `translate(${dx}px, ${dy}px) scale(${scale})` : undefined,
        }}
      >
        <div className="opening-page">
          <svg viewBox="0 0 100 140" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M18 18v104M18 40h16M18 70h16M18 100h16" />
            <circle cx="18" cy="18" r="3" fill="currentColor" />
            <path d="M42 40h40M42 47h26M42 70h40M42 77h30M42 100h40M42 107h22" opacity=".5" />
          </svg>
        </div>
        <div className="opening-cover">
          <div className="opening-front">
            <BookCover technology={technology} />
          </div>
          <div className="opening-inside" />
        </div>
      </div>
    </div>
  );
}

export function Bookshelf({ books }: { books: ShelfBook[] }) {
  const router = useRouter();
  const { learned } = useProgress();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [group, setGroup] = useState<GroupId | "all">("all");
  const [opening, setOpening] = useState<Opening | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const allIds = useMemo(() => books.flatMap((book) => book.lessonIds), [books]);
  const overall = completion(allIds, learned);
  const term = query.trim().toLowerCase();

  function matches(technology: Technology) {
    const book = books.find((item) => item.id === technology.id);
    if (!book) return false;
    const home = categories.find((item) => item.id === technology.category);
    if (group !== "all" && home?.group !== group) return false;
    if (term && !`${technology.name} ${technology.blurb} ${book.keywords}`.toLowerCase().includes(term)) return false;
    const { done, total } = completion(book.lessonIds, learned);
    if (status === "reading") return done > 0 && done < total;
    if (status === "unread") return done === 0;
    if (status === "finished") return done === total && total > 0;
    return true;
  }

  function openBook(event: MouseEvent<HTMLAnchorElement>, technology: Technology) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = event.currentTarget.querySelector<HTMLElement>(".book-front");
    if (!target) return;
    event.preventDefault();
    router.prefetch(`/${technology.id}`);
    setOpening({ technology, rect: target.getBoundingClientRect() });
    timer.current = setTimeout(() => {
      window.dispatchEvent(new Event(NAVIGATION_START));
      router.push(`/${technology.id}`);
    }, OPEN_MS);
  }

  const visible = categories
    .map((item) => ({ ...item, items: technologies.filter((tech) => tech.category === item.id && matches(tech)) }))
    .filter((item) => item.items.length > 0);

  return (
    <>
      <header className="shelf-hero">
        <div>
          <p className="eyebrow">The DevShelf Library</p>
          <h1 className="display">{technologies.length} books. One path from first question to production.</h1>
        </div>
        <div className="shelf-overall">
          <ProgressRing percent={overall.percent} size={76} stroke={5}>
            {overall.percent}%
          </ProgressRing>
          <p>
            <strong>
              {overall.done} of {overall.total}
            </strong>
            <span>lessons completed</span>
          </p>
        </div>
      </header>

      <div className="shelf-tools">
        <label className="field">
          <SearchIcon />
          <span className="sr-only">Filter books</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by book or concept"
          />
        </label>
        <div className="chips" role="group" aria-label="Category">
          <button type="button" className="chip" aria-pressed={group === "all"} onClick={() => setGroup("all")}>
            Everything
          </button>
          {groups.map((item) => (
            <button key={item.id} type="button" className="chip" aria-pressed={group === item.id} onClick={() => setGroup(item.id)}>
              {item.name}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Reading status">
          {STATUSES.map((item) => (
            <button key={item.id} type="button" className="chip chip-quiet" aria-pressed={status === item.id} onClick={() => setStatus(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Nothing on this shelf">
          <p>No book matches those filters.</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setGroup("all");
            }}
          >
            Clear filters
          </button>
        </EmptyState>
      ) : (
        <div className="shelf-groups">
          {groups.map((shelfGroup) => {
            const shelves = visible.filter((shelf) => shelf.group === shelfGroup.id);
            if (shelves.length === 0) return null;
            return (
              <section key={shelfGroup.id} aria-label={shelfGroup.name}>
                <h2 className="group-title">{shelfGroup.name}</h2>
                <div className="shelves">
          {shelves.map((shelf) => (
            <section key={shelf.id} className="shelf" style={{ "--n": shelf.items.length } as React.CSSProperties} aria-label={shelf.name}>
              <div className="shelf-label">
                <h3>{shelf.name}</h3>
                <p>{shelf.note}</p>
              </div>
              <ul className="shelf-row">
                {shelf.items.map((technology) => {
                  const book = books.find((item) => item.id === technology.id)!;
                  const { done, total, percent } = completion(book.lessonIds, learned);
                  return (
                    <li key={technology.id} className="shelf-cell">
                      <IntentLink
                        href={`/${technology.id}`}
                        className="book-link"
                        onClick={(event) => openBook(event, technology)}
                        aria-label={`Open ${technology.name}, ${done} of ${total} lessons completed`}
                      >
                        <Book3D technology={technology} />
                      </IntentLink>
                      <div className="book-meta">
                        <span className="book-name">{technology.name}</span>
                        <ProgressBar percent={percent} label={`${technology.name} completion`} />
                        <span className="book-count">
                          {percent}% · {total} lessons
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="shelf-plank" aria-hidden="true" />
            </section>
          ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {opening && <OpeningBook opening={opening} />}
    </>
  );
}

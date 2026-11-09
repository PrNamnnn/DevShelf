"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { IntentLink } from "@/components/IntentLink";
import { ArrowRightIcon, CheckIcon, ChevronIcon, ClockIcon, CollapseIcon, ExpandIcon } from "@/components/icons";
import { Book3D } from "@/components/shelf/BookCover";
import { BackButton, LevelDots, ProgressBar, ProgressRing } from "@/components/ui";
import type { CardSection, LessonCard } from "@/lib/content";
import { stages } from "@/lib/curriculum";
import { completion, toggleCompleted, useProgress } from "@/lib/progress";
import type { Technology } from "@/lib/technologies";

/** The trunk and elbow beside a row. Heights are percentages, so wrapped rows stay connected. */
function Branch({ last, done, y }: { last: boolean; done: boolean; y: number }) {
  return (
    <svg className="branch" aria-hidden="true" width="34" height="100%">
      <line x1="10" y1="0" x2="10" y2={last ? y - 12 : "100%"} className="branch-line" />
      <path d={`M10 ${y - 12} Q10 ${y} 22 ${y} L34 ${y}`} fill="none" className="branch-line" data-done={done} />
    </svg>
  );
}

function LessonRow({
  lesson,
  done,
  last,
  isNext,
  titles,
  learned,
}: {
  lesson: LessonCard;
  done: boolean;
  last: boolean;
  isNext: boolean;
  titles: Map<string, string>;
  learned: string[];
}) {
  const missing = lesson.requires.filter((id) => !learned.includes(id) && titles.has(id));

  return (
    <li className="lesson-row" data-done={done} data-next={isNext}>
      <Branch last={last} done={done} y={30} />
      <button
        type="button"
        className="lesson-node"
        aria-pressed={done}
        aria-label={`${done ? "Mark as not completed" : "Mark as completed"}: ${lesson.title}`}
        data-tip={done ? "Completed" : "Mark complete"}
        onClick={() => toggleCompleted(lesson.id)}
      >
        {done && <CheckIcon width={13} height={13} strokeWidth={2.6} />}
      </button>
      <IntentLink href={`/${lesson.tech}/${lesson.slug}`} className="lesson-link">
        <span className="lesson-title">{lesson.title}</span>
        <span className="lesson-summary">{lesson.summary}</span>
        {missing.length > 0 && <span className="lesson-requires">Read first: {titles.get(missing[0])}</span>}
        <span className="lesson-meta">
          <LevelDots level={lesson.level} />
          <span className="lesson-time">
            <ClockIcon width={13} height={13} /> {lesson.minutes} min
          </span>
          {isNext && <span className="lesson-up">Up next</span>}
        </span>
      </IntentLink>
    </li>
  );
}

export function LearningTree({
  technology,
  sections,
}: {
  technology: Technology;
  sections: CardSection[];
}) {
  const { learned } = useProgress();
  const lessons = useMemo(() => sections.flatMap((section) => section.lessons), [sections]);
  const titles = useMemo(() => new Map(lessons.map((lesson) => [lesson.id, lesson.title])), [lessons]);
  const allIds = lessons.map((lesson) => lesson.id);
  const overall = completion(allIds, learned);
  const nextLesson = lessons.find((lesson) => !learned.includes(lesson.id));
  const minutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

  const [opened, setOpened] = useState<Set<string> | null>(null);
  const defaultOpen = sections.find((section) => section.lessons.some((lesson) => lesson.id === nextLesson?.id))?.id ?? sections[0]?.id;
  const expanded = opened ?? new Set(defaultOpen ? [defaultOpen] : []);

  // A section's rows join the DOM the first time it opens, then stay for the collapse animation.
  const mounted = useRef(new Set<string>());
  expanded.forEach((id) => mounted.current.add(id));

  function toggle(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpened(next);
  }

  return (
    <div className="book-page">
      <aside className="book-aside">
        <div className="book-aside-inner">
          <BackButton href="/" label="Back to the library" />
          <div className="book-aside-cover">
            <Book3D technology={technology} />
          </div>
          <h1 className="display-sm">{technology.name}</h1>
          <p className="book-aside-blurb">{technology.blurb}</p>

          <div className="book-aside-stats">
            <ProgressRing percent={overall.percent} size={62} stroke={4.5}>
              {overall.percent}%
            </ProgressRing>
            <dl>
              <div>
                <dt>Completed</dt>
                <dd>
                  {overall.done} / {overall.total}
                </dd>
              </div>
              <div>
                <dt>Reading time</dt>
                <dd>{minutes < 90 ? `${minutes} min` : `${Math.round(minutes / 60)} hours`}</dd>
              </div>
            </dl>
          </div>

          {nextLesson && (
            <Link href={`/${nextLesson.tech}/${nextLesson.slug}`} className="btn btn-primary">
              {overall.done === 0 ? "Start reading" : "Continue"} <ArrowRightIcon width={16} height={16} />
            </Link>
          )}

          <ul className="stage-list" aria-label="Progress by stage">
            {stages.map((stage) => {
              const ids = sections.filter((section) => section.stage === stage).flatMap((section) => section.lessons.map((lesson) => lesson.id));
              if (ids.length === 0) return null;
              const { done, total, percent } = completion(ids, learned);
              return (
                <li key={stage}>
                  <span>{stage}</span>
                  <em>
                    {done}/{total}
                  </em>
                  <ProgressBar percent={percent} label={`${stage} completion`} />
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <section className="tree" aria-label={`${technology.name} learning path`}>
        <div className="tree-head">
          <p className="eyebrow">Learning path</p>
          <div className="tree-actions">
            <button type="button" className="icon-btn" aria-label="Expand all sections" data-tip="Expand all" onClick={() => setOpened(new Set(sections.map((section) => section.id)))}>
              <ExpandIcon />
            </button>
            <button type="button" className="icon-btn" aria-label="Collapse all sections" data-tip="Collapse all" onClick={() => setOpened(new Set())}>
              <CollapseIcon />
            </button>
          </div>
        </div>

        <ol className="tree-sections">
          {sections.map((section, index) => {
            const ids = section.lessons.map((lesson) => lesson.id);
            const { done, total, percent } = completion(ids, learned);
            const isOpen = expanded.has(section.id);
            const isLast = index === sections.length - 1;
            return (
              <li key={section.id} className="tree-section" data-open={isOpen} data-complete={percent === 100}>
                {!isLast && <span className="tree-trunk" aria-hidden="true" />}
                <button
                  type="button"
                  className="tree-header"
                  aria-expanded={isOpen}
                  aria-controls={`section-${section.id}`}
                  onClick={() => toggle(section.id)}
                >
                  <ProgressRing percent={percent} size={44} stroke={3}>
                    {String(index + 1).padStart(2, "0")}
                  </ProgressRing>
                  <span className="tree-title">
                    <span className="tree-stage" data-stage={section.stage}>
                      {section.stage}
                    </span>
                    <strong>{section.title}</strong>
                  </span>
                  <span className="tree-count">
                    {done}/{total}
                  </span>
                  <ChevronIcon className="tree-chevron" />
                </button>
                <div className="tree-collapse" id={`section-${section.id}`}>
                  <div className="tree-collapse-inner" inert={!isOpen}>
                    {mounted.current.has(section.id) && <ul className="lesson-list">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <LessonRow
                          key={lesson.id}
                          lesson={lesson}
                          done={learned.includes(lesson.id)}
                          last={lessonIndex === section.lessons.length - 1}
                          isNext={nextLesson?.id === lesson.id}
                          titles={titles}
                          learned={learned}
                        />
                      ))}
                    </ul>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

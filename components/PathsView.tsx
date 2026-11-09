"use client";

import Link from "next/link";
import { IntentLink } from "@/components/IntentLink";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "@/components/icons";
import { BackButton, LevelDots, ProgressBar, ProgressRing } from "@/components/ui";
import type { LessonCard } from "@/lib/content";
import { completion, toggleCompleted, useProgress } from "@/lib/progress";
import { getTechnology } from "@/lib/technologies";

export function PathsView({ paths }: { paths: { id: string; title: string; summary: string; lessonIds: string[] }[] }) {
  const { learned } = useProgress();
  return (
    <div className="page-narrow">
      <p className="eyebrow">Career paths</p>
      <h1 className="display-sm">Learn for the role you want</h1>
      <p className="muted-text">Each path is an ordered route through the library. A lesson completed anywhere counts on every path that includes it.</p>
      <ul className="mt-6 grid gap-3">
        {paths.map((path) => {
          const { done, total, percent } = completion(path.lessonIds, learned);
          return (
            <li key={path.id}>
              <Link href={`/paths/${path.id}`} className="path-card">
                <span className="flex items-center gap-4">
                  <ProgressRing percent={percent} size={52} stroke={4}>
                    {percent}
                  </ProgressRing>
                  <span className="min-w-0 flex-1">
                    <strong className="font-display text-xl font-normal">{path.title}</strong>
                    <span className="block text-sm text-muted">{path.summary}</span>
                    <span className="block font-mono text-xs text-muted">
                      {done} of {total} lessons
                    </span>
                  </span>
                  <ArrowRightIcon className="flex-none text-accent" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PathDetail({ title, summary, stages }: { title: string; summary: string; stages: { title: string; lessons: LessonCard[] }[] }) {
  const { learned } = useProgress();
  const allIds = stages.flatMap((stage) => stage.lessons.map((lesson) => lesson.id));
  const overall = completion([...new Set(allIds)], learned);
  const next = stages.flatMap((stage) => stage.lessons).find((lesson) => !learned.includes(lesson.id));

  return (
    <div className="page-narrow">
      <BackButton href="/paths" label="Back to career paths" />
      <div className="progress-hero">
        <ProgressRing percent={overall.percent} size={96} stroke={6}>
          {overall.percent}%
        </ProgressRing>
        <div>
          <p className="eyebrow">Career path</p>
          <h1 className="display-sm">{title}</h1>
          <p className="muted-text">{summary}</p>
        </div>
      </div>
      {next && (
        <Link href={`/${next.tech}/${next.slug}`} className="btn btn-primary mt-4">
          {overall.done === 0 ? "Start" : "Continue"}: {next.title} <ArrowRightIcon width={16} height={16} />
        </Link>
      )}
      <ol className="mt-8 grid gap-8">
        {stages.map((stage, index) => {
          const part = completion(stage.lessons.map((lesson) => lesson.id), learned);
          return (
            <li key={stage.title}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-xl">
                  <span className="mr-2 font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
                  {stage.title}
                </h2>
                <span className="font-mono text-xs text-muted">
                  {part.done}/{part.total}
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar percent={part.percent} label={`${stage.title} completion`} />
              </div>
              <ul className="results">
                {stage.lessons.map((lesson) => {
                  const done = learned.includes(lesson.id);
                  return (
                    <li key={lesson.id} className="result">
                      <i style={{ background: getTechnology(lesson.tech)?.spine }} aria-hidden="true" />
                      <IntentLink href={`/${lesson.tech}/${lesson.slug}`}>
                        <span className="result-book">{getTechnology(lesson.tech)?.name}</span>
                        <strong>{lesson.title}</strong>
                      </IntentLink>
                      <span className="result-meta">
                        <LevelDots level={lesson.level} />
                        <span className="lesson-time">
                          <ClockIcon width={13} height={13} /> {lesson.minutes}
                        </span>
                        <button type="button" className="result-check" aria-pressed={done} aria-label={`${done ? "Mark as not completed" : "Mark as completed"}: ${lesson.title}`} data-tip={done ? "Completed" : "Mark complete"} onClick={() => toggleCompleted(lesson.id)}>
                          {done && <CheckIcon width={13} height={13} strokeWidth={2.6} />}
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

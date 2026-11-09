import { IntentLink } from "@/components/IntentLink";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon, LinkIcon } from "@/components/icons";
import { CompleteButton, LessonActions, ReadingProgress, TableOfContents } from "@/components/lesson/LessonChrome";
import { mdxComponents } from "@/components/mdx-components";
import { BackButton, LevelDots } from "@/components/ui";
import { getAllChapters, getBook, getBookLessons, getChapter, getLessonsByIds, type ChapterMeta } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";
import { getTechnology } from "@/lib/technologies";

export const dynamicParams = false;

interface Props {
  params: Promise<{ tech: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllChapters().map(({ tech, slug }) => ({ tech, slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tech, slug } = await params;
  const chapter = getChapter(tech, slug);
  return { title: chapter?.title, description: chapter?.summary };
}

function LessonLinks({ title, lessons }: { title: string; lessons: ChapterMeta[] }) {
  if (lessons.length === 0) return null;
  return (
    <section className="lesson-links">
      <h2 className="block-title">{title}</h2>
      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <IntentLink href={`/${lesson.tech}/${lesson.slug}`}>
              <span>{getTechnology(lesson.tech)?.name}</span>
              <strong>{lesson.title}</strong>
            </IntentLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function ChapterPage({ params }: Props) {
  const { tech, slug } = await params;
  const chapter = getChapter(tech, slug);
  if (!chapter) notFound();

  const technology = getTechnology(tech)!;
  const { Content, toc } = await renderMdx(chapter.body);
  const lessons = getBookLessons(tech);
  const position = lessons.findIndex((lesson) => lesson.id === chapter.id);
  const previous = lessons[position - 1];
  const next = lessons[position + 1];
  const section = getBook(tech).find((item) => item.id === chapter.section);

  return (
    <div className="lesson">
      <ReadingProgress />

      <div className="lesson-bar glass">
        <BackButton href={`/${tech}`} label={`Back to ${technology.name}`} />
        <span className="lesson-bar-title">
          {technology.name} <i>/</i> {section?.title}
        </span>
        <span className="lesson-bar-actions">
          <LessonActions id={chapter.id} />
        </span>
      </div>

      <div className="lesson-grid">
        <article className="lesson-article">
          <header className="lesson-header">
            <p className="eyebrow" style={{ color: "var(--pink)" }}>
              {section?.stage} · Lesson {position + 1} of {lessons.length}
            </p>
            <h1 className="lesson-heading">{chapter.title}</h1>
            <p className="lesson-standfirst">{chapter.summary}</p>
            <div className="lesson-facts">
              <span>
                <ClockIcon width={14} height={14} /> {chapter.minutes} min read
              </span>
              <LevelDots level={chapter.level} />
              <span className="lesson-applies">{chapter.versions}</span>
            </div>
          </header>

          <div className="chapter">
            <Content components={mdxComponents} />
          </div>

          <div className="lesson-complete">
            <CompleteButton id={chapter.id} />
          </div>

          <LessonLinks title="Read first" lessons={getLessonsByIds(chapter.requires)} />
          <LessonLinks title="Related concepts" lessons={getLessonsByIds(chapter.related)} />

          <section className="lesson-sources">
            <h2 className="block-title">Sources</h2>
            <ul>
              {chapter.docs.map((doc) => (
                <li key={doc.url}>
                  <a href={doc.url} rel="noreferrer" target="_blank">
                    {doc.label} <LinkIcon width={13} height={13} />
                  </a>
                </li>
              ))}
            </ul>
            <p>
              Examples: {chapter.tested} Checked against the documentation on {chapter.verified}.
            </p>
          </section>

          <nav className="pager" aria-label="Lesson navigation">
            {previous ? (
              <Link href={`/${previous.tech}/${previous.slug}`} className="pager-link">
                <ArrowLeftIcon />
                <span>
                  <em>Previous</em>
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/${next.tech}/${next.slug}`} className="pager-link pager-next">
                <span>
                  <em>Next</em>
                  {next.title}
                </span>
                <ArrowRightIcon />
              </Link>
            ) : (
              <Link href={`/${tech}`} className="pager-link pager-next">
                <span>
                  <em>Finished this book</em>
                  Back to the learning path
                </span>
                <ArrowRightIcon />
              </Link>
            )}
          </nav>
        </article>

        <aside className="lesson-toc">
          <TableOfContents entries={toc} />
        </aside>
      </div>
    </div>
  );
}

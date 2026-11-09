import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { curriculum, type SectionDefinition } from "@/lib/curriculum";

export type Level = "fundamental" | "intermediate" | "advanced";

export interface DocReference {
  label: string;
  url: string;
}

export interface ChapterMeta {
  id: string;
  tech: string;
  slug: string;
  title: string;
  summary: string;
  level: Level;
  section: string;
  order: number;
  tags: string[];
  related: string[];
  requires: string[];
  docs: DocReference[];
  verified: string;
  tested: string;
  versions: string;
  minutes: number;
}

export interface Chapter extends ChapterMeta {
  body: string;
}

export interface BookSection extends SectionDefinition {
  lessons: ChapterMeta[];
}

/** The fields list views use. Client pages receive this instead of each lesson's full metadata. */
export type LessonCard = Pick<ChapterMeta, "id" | "tech" | "slug" | "title" | "summary" | "level" | "section" | "tags" | "requires" | "minutes">;

export interface CardSection extends SectionDefinition {
  lessons: LessonCard[];
}

const CONTENT_ROOT = path.join(process.cwd(), "content");

/** Reading time ignores code and visualization data, which are skimmed rather than read. */
function readingMinutes(body: string): number {
  const prose = body.replace(/^```[\s\S]*?^```/gm, "").replace(/^<[A-Z][\s\S]*?\/>$/gm, "");
  const codeBlocks = body.match(/^```/gm)?.length ?? 0;
  return Math.max(2, Math.round(prose.split(/\s+/).length / 220 + codeBlocks / 2 / 3));
}

export const getAllChapters = cache((): Chapter[] => {
  if (!fs.existsSync(CONTENT_ROOT)) return [];

  const chapters: Chapter[] = [];
  for (const tech of fs.readdirSync(CONTENT_ROOT)) {
    const techDirectory = path.join(CONTENT_ROOT, tech);
    if (!fs.statSync(techDirectory).isDirectory()) continue;

    for (const file of fs.readdirSync(techDirectory)) {
      if (!file.endsWith(".mdx")) continue;
      const slug = file.replace(/\.mdx$/, "");
      const { data, content } = matter(fs.readFileSync(path.join(techDirectory, file), "utf8"));
      chapters.push({
        id: `${tech}/${slug}`,
        tech,
        slug,
        title: data.title,
        summary: data.summary,
        level: data.level,
        section: data.section,
        order: data.order,
        tags: data.tags ?? [],
        related: data.related ?? [],
        requires: data.requires ?? [],
        docs: data.docs ?? [],
        verified: data.verified,
        tested: data.tested,
        versions: data.versions,
        minutes: readingMinutes(content),
        body: content,
      });
    }
  }
  return chapters;
});

export function toMeta(chapter: Chapter): ChapterMeta {
  const { body: _body, ...meta } = chapter;
  return meta;
}

export function toCard({ id, tech, slug, title, summary, level, section, tags, requires, minutes }: ChapterMeta): LessonCard {
  return { id, tech, slug, title, summary, level, section, tags, requires, minutes };
}

export const getBook = cache((tech: string): BookSection[] => {
  const lessons = getAllChapters().filter((chapter) => chapter.tech === tech);
  return (curriculum[tech] ?? [])
    .map((section) => ({
      ...section,
      lessons: lessons
        .filter((lesson) => lesson.section === section.id)
        .sort((a, b) => a.order - b.order)
        .map(toMeta),
    }))
    .filter((section) => section.lessons.length > 0);
});

export function getBookLessons(tech: string): ChapterMeta[] {
  return getBook(tech).flatMap((section) => section.lessons);
}

export function getChapter(tech: string, slug: string): Chapter | undefined {
  return getAllChapters().find((chapter) => chapter.tech === tech && chapter.slug === slug);
}

export function getLessonsByIds(ids: string[]): ChapterMeta[] {
  const all = getAllChapters();
  return ids.flatMap((id) => {
    const found = all.find((chapter) => chapter.id === id);
    return found ? [toMeta(found)] : [];
  });
}

import type { Metadata } from "next";
import { ProgressView } from "@/components/LibraryViews";
import { getBook, getBookLessons, toCard } from "@/lib/content";
import { technologies } from "@/lib/technologies";

export const metadata: Metadata = { title: "Progress" };

export default function ProgressPage() {
  const books = technologies.map(({ id }) => ({
    id,
    sections: getBook(id).map((section) => ({
      id: section.id,
      title: section.title,
      lessonIds: section.lessons.map((lesson) => lesson.id),
    })),
  }));
  return <ProgressView books={books} lessons={technologies.flatMap(({ id }) => getBookLessons(id)).map(toCard)} />;
}

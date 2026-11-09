import { Bookshelf } from "@/components/shelf/Bookshelf";
import { getBookLessons } from "@/lib/content";
import { technologies } from "@/lib/technologies";

export default function HomePage() {
  const books = technologies.map(({ id }) => {
    const lessons = getBookLessons(id);
    return {
      id,
      lessonIds: lessons.map((lesson) => lesson.id),
      keywords: lessons.map((lesson) => `${lesson.title} ${lesson.tags.join(" ")}`).join(" "),
    };
  });

  return <Bookshelf books={books} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PathDetail } from "@/components/PathsView";
import { getLessonsByIds, toCard } from "@/lib/content";
import { learningPaths } from "@/lib/paths";

export const dynamicParams = false;

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return learningPaths.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `${learningPaths.find((path) => path.id === id)?.title} path` };
}

export default async function PathPage({ params }: Props) {
  const { id } = await params;
  const path = learningPaths.find((item) => item.id === id);
  if (!path) notFound();

  return (
    <PathDetail
      title={path.title}
      summary={path.summary}
      stages={path.stages.map((stage) => ({ title: stage.title, lessons: getLessonsByIds(stage.lessons).map(toCard) }))}
    />
  );
}

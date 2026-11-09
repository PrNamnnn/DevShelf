import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearningTree } from "@/components/tree/LearningTree";
import { getBook, toCard } from "@/lib/content";
import { getTechnology, technologies } from "@/lib/technologies";

export const dynamicParams = false;

interface Props {
  params: Promise<{ tech: string }>;
}

export function generateStaticParams() {
  return technologies.map((technology) => ({ tech: technology.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tech } = await params;
  const technology = getTechnology(tech);
  return { title: technology?.name, description: technology?.blurb };
}

export default async function TechnologyPage({ params }: Props) {
  const { tech } = await params;
  const technology = getTechnology(tech);
  if (!technology) notFound();

  return <LearningTree technology={technology} sections={getBook(tech).map((section) => ({ ...section, lessons: section.lessons.map(toCard) }))} />;
}

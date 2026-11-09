import type { Metadata } from "next";
import { PathsView } from "@/components/PathsView";
import { learningPaths } from "@/lib/paths";

export const metadata: Metadata = { title: "Career Paths" };

export default function PathsPage() {
  return <PathsView paths={learningPaths.map(({ id, title, summary, stages }) => ({ id, title, summary, lessonIds: stages.flatMap((stage) => stage.lessons) }))} />;
}

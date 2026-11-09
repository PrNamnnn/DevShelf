import type { Metadata } from "next";
import { SearchView } from "@/components/LibraryViews";
import { getAllChapters, toCard } from "@/lib/content";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return <SearchView lessons={getAllChapters().map(toCard)} />;
}

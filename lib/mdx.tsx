import { evaluate, type EvaluateOptions } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

export interface TocEntry {
  id: string;
  text: string;
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Adds an id to every section heading and records it for the page outline. */
function rehypeSectionHeadings(toc: TocEntry[]) {
  return () => (tree: HastNode) => {
    for (const node of tree.children ?? []) {
      if (node.type !== "element" || node.tagName !== "h2") continue;
      const text = textOf(node);
      const id = slugify(text);
      node.properties = { ...node.properties, id };
      toc.push({ id, text });
    }
  };
}

export async function renderMdx(source: string) {
  const toc: TocEntry[] = [];
  const { default: Content } = await evaluate(source, {
    ...(runtime as unknown as Pick<EvaluateOptions, "Fragment" | "jsx" | "jsxs">),
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSectionHeadings(toc),
      [
        rehypePrettyCode,
        {
          theme: { light: "github-light", dark: "github-dark" },
          keepBackground: false,
          bypassInlineCode: true,
          defaultLang: { block: "text" },
        },
      ],
    ],
  });
  return { Content, toc };
}

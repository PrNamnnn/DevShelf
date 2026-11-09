// Checks every chapter before a build: npm run validate
import fs from "node:fs";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";

const ROOT = path.join(process.cwd(), "content");

const REQUIRED_FIELDS = ["title", "summary", "level", "section", "order", "tags", "docs", "verified", "tested", "versions"];
const LEVELS = new Set(["fundamental", "intermediate", "advanced"]);
const REQUIRED_SECTIONS = [
  "What it is",
  "Why it exists",
  "How it works",
  "Syntax and key APIs",
  "Simple example",
  "Industry examples",
  "Patterns and best practices",
  "Alternatives and trade-offs",
  "Common mistakes",
  "Interview questions",
];

const KNOWLEDGE_BOOKS = new Set(["statistics", "machine-learning", "deep-learning"]);
const KNOWLEDGE_SECTIONS = [
  ["What it is", true], ["Why it exists", true], ["How it works", true], ["Intuition and formula", false],
  ["Worked example", true], ["Python", true], ["SQL", false], ["Excel or Power BI", false],
  ["In industry", true], ["Assumptions and limitations", true], ["Common mistakes", true], ["Alternatives", true], ["Interview questions", true],
];

const read = (relative) => fs.readFileSync(path.join(process.cwd(), relative), "utf8");

const technologies = new Set([...read("lib/technologies.ts").matchAll(/\bid: "([a-z-]+)", name: "[^"]+", blurb/g)].map((match) => match[1]));

const registry = read("components/mdx-components.tsx");
const registered = registry.slice(registry.indexOf("export const mdxComponents"));
const allowedComponents = new Set([...registered.matchAll(/^\s+([A-Z]\w+),$/gm)].map((match) => match[1]));

const curriculum = read("lib/curriculum.ts");
function sectionsFor(tech) {
  const quoted = curriculum.indexOf(`"${tech}": [`);
  const start = quoted >= 0 ? quoted : curriculum.indexOf(`${tech}: [`);
  const block = curriculum.slice(start, curriculum.indexOf("],", start));
  return new Set([...block.matchAll(/id: "([a-z-]+)"/g)].map((match) => match[1]));
}

const errors = [];
const chapters = [];

for (const tech of fs.readdirSync(ROOT)) {
  const directory = path.join(ROOT, tech);
  if (!fs.statSync(directory).isDirectory()) continue;
  if (!technologies.has(tech)) errors.push(`${tech}: not listed in lib/technologies.ts`);
  for (const file of fs.readdirSync(directory).filter((name) => name.endsWith(".mdx"))) {
    const id = `${tech}/${file.replace(/\.mdx$/, "")}`;
    const { data, content } = matter(fs.readFileSync(path.join(directory, file), "utf8"));
    chapters.push({ id, data, content });
  }
}

const ids = new Set(chapters.map((chapter) => chapter.id));
const titles = new Map();
const urls = new Set();

for (const { id, data, content } of chapters) {
  const fail = (message) => errors.push(`${id}: ${message}`);

  for (const field of REQUIRED_FIELDS) if (data[field] === undefined) fail(`missing frontmatter "${field}"`);
  if (data.level && !LEVELS.has(data.level)) fail(`invalid level "${data.level}"`);
  if (!sectionsFor(id.split("/")[0]).has(data.section)) fail(`unknown section "${data.section}"`);
  for (const required of data.requires ?? []) if (!ids.has(required)) fail(`requires unknown lesson "${required}"`);
  if (typeof data.verified !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.verified)) fail('"verified" must be a quoted YYYY-MM-DD string');
  if (titles.has(data.title)) fail(`duplicate title also used by ${titles.get(data.title)}`);
  titles.set(data.title, id);

  for (const related of data.related ?? []) {
    if (!ids.has(related)) fail(`related chapter "${related}" does not exist`);
    if (related === id) fail("chapter lists itself as related");
  }
  if (!Array.isArray(data.docs) || data.docs.length === 0) fail("needs at least one official doc reference");
  for (const doc of data.docs ?? []) {
    if (!doc.label || !/^https:\/\//.test(doc.url ?? "")) fail(`bad doc reference ${JSON.stringify(doc)}`);
    urls.add(doc.url);
  }

  const withoutCode = content.replace(/^```[\s\S]*?^```/gm, "").replace(/`[^`\n]*`/g, "");

  if (/<StepFlow[\s\S]*?active: "/.test(withoutCode) && /<StepFlow(?:(?!\n\/>)[\s\S])*active: "/.test(withoutCode)) fail("StepFlow active must be an array of node positions");
  if (/<TreeViz(?:(?!\n\/>)[\s\S])*active: "/.test(withoutCode)) fail("TreeViz active must be an array of node ids");
  if (/<LanesViz(?:(?!\n\/>)[\s\S])*\b(?:from|to): "/.test(withoutCode)) fail("LanesViz from and to must be actor positions");
  const headings = [...withoutCode.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
  if (KNOWLEDGE_BOOKS.has(id.split("/")[0])) {
    let at = 0;
    for (const heading of headings) {
      const next = KNOWLEDGE_SECTIONS.findIndex(([name], index) => index >= at && name === heading);
      if (next < 0) { fail(`unexpected or out-of-order section "${heading}"`); continue; }
      for (const [name, required] of KNOWLEDGE_SECTIONS.slice(at, next)) if (required) fail(`missing section "${name}"`);
      at = next + 1;
    }
    for (const [name, required] of KNOWLEDGE_SECTIONS.slice(at)) if (required) fail(`missing section "${name}"`);
  } else {
    REQUIRED_SECTIONS.forEach((section, index) => {
      if (headings[index] !== section) fail(`section ${index + 1} should be "## ${section}" but found "${headings[index]}"`);
    });
  }

  for (const fence of content.matchAll(/^```(.*)$/gm)) {
    // Fences alternate open/close; an opening fence must name its language.
    const before = content.slice(0, fence.index).match(/^```/gm)?.length ?? 0;
    if (before % 2 === 0 && !fence[1].trim()) fail("code block without a language");
  }

  // Only tags that begin a line: JSX inside a visualization's code strings isn't a component.
  for (const match of withoutCode.matchAll(/^\s*<([A-Z]\w+)/gm)) {
    if (!allowedComponents.has(match[1])) fail(`unknown component <${match[1]}>`);
  }

  for (const match of withoutCode.matchAll(/\]\((\/[^)#\s]+)/g)) {
    if (!ids.has(match[1].slice(1))) fail(`broken internal link ${match[1]}`);
  }

  try {
    await compile(content, { remarkPlugins: [remarkGfm] });
  } catch (error) {
    fail(`MDX does not compile: ${error.message}`);
  }
}

if (process.argv.includes("--urls")) {
  const pending = [...urls];

  async function check(url, retries = 1) {
    try {
      const response = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(30000) });
      if (!response.ok) errors.push(`doc link ${url} returned ${response.status}`);
    } catch (error) {
      if (retries > 0) return check(url, retries - 1);
      errors.push(`doc link ${url} failed: ${error.message}`);
    }
  }

  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (pending.length > 0) await check(pending.shift());
    }),
  );
}

const paths = read("lib/paths.ts");
for (const match of paths.matchAll(/"([a-z-]+\/[a-z0-9-]+)"/g)) {
  if (!ids.has(match[1])) errors.push(`learning path references unknown lesson "${match[1]}"`);
}

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`Content OK: ${chapters.length} chapters${process.argv.includes("--urls") ? `, ${urls.size} doc links reachable` : ""}.`);

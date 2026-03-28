import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  themes: string[];
  content: string;
  htmlContent: string;
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getPostBySlug(slug: string): BlogPost {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  // Strip toggle comments and CTA markdown links for cleaner HTML
  const cleaned = content
    .replace(/<!-- toggle: \w+ -->/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)\{\.cta-\w+\}/g, "$1");

  const htmlContent = marked.parse(cleaned) as string;

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    author: data.author ?? "100xpath",
    tags: data.tags ?? [],
    themes: data.theme ?? [],
    content,
    htmlContent,
  };
}

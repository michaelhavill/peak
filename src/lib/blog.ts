import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

/**
 * Add retro 16-bit color accents to ASCII diagrams inside <pre><code> blocks.
 * Wraps specific patterns in <span> elements — small touches only.
 */
function colorizeAscii(html: string): string {
  return html.replace(
    /<pre><code>([\s\S]*?)<\/code><\/pre>/g,
    (_match, inner: string) => {
      let c = inner;

      // 1. Bullets ● — amber/gold terminal cursor
      c = c.replace(/●/g, '<span class="ascii-bullet">●</span>');

      // 2. Filled progress bars ████+ — muted green (success)
      c = c.replace(/█{3,}/g, (m) => `<span class="ascii-bar-full">${m}</span>`);

      // 3. Empty progress bars ░░░░+ — muted coral (lacking)
      c = c.replace(/░{3,}/g, (m) => `<span class="ascii-bar-empty">${m}</span>`);

      // 4. Percentage labels next to bars: "100%" or "20%" etc.
      //    High percentages (≥60%) get green, low (<60%) get coral
      c = c.replace(
        /(<\/span>\s*)(\d+%)/g,
        (_m, gap: string, pct: string) => {
          const n = parseInt(pct);
          const cls = n >= 60 ? "ascii-pct-high" : "ascii-pct-low";
          return `${gap}<span class="${cls}">${pct}</span>`;
        }
      );

      // 5. Arrows ──→ and ↓ — soft lavender
      c = c.replace(/──+→/g, (m) => `<span class="ascii-arrow">${m}</span>`);
      c = c.replace(/↓/g, '<span class="ascii-arrow">↓</span>');

      // 6. Inner box titles — ALL-CAPS labels inside nested boxes
      //    Match: │  TITLE WORDS  │ or │  TITLE WORDS   │
      c = c.replace(
        /(│\s{1,3})((?:[A-Z][A-Z &/\-]+){2,})(\s+│)/g,
        (_m, pre: string, title: string, post: string) =>
          `${pre}<span class="ascii-label">${title}</span>${post}`
      );

      return `<pre><code>${c}</code></pre>`;
    }
  );
}

export interface BlogPost {
  slug: string;
  title: string;
  titleHighlight: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  themes: string[];
  heroImage: string;
  content: string;
  htmlContent: string;
  htmlCtas: string;
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

  // Split off trailing CTA section (everything after the last --- divider that
  // contains only paragraph-level links / bold+link combos and no headings)
  const lastHrIndex = cleaned.lastIndexOf("\n---\n");
  let body = cleaned;
  let ctaSection = "";

  if (lastHrIndex !== -1) {
    const candidate = cleaned.slice(lastHrIndex + 5).trim();
    // If the candidate contains no headings (##), treat it as CTAs
    if (!/^#{1,6}\s/m.test(candidate)) {
      body = cleaned.slice(0, lastHrIndex);
      ctaSection = candidate;
    }
  }

  const htmlContent = colorizeAscii(marked.parse(body) as string);
  const htmlCtas = ctaSection ? (marked.parse(ctaSection) as string) : "";

  return {
    slug,
    title: data.title ?? "",
    titleHighlight: data.titleHighlight ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    author: data.author ?? "100xpath",
    tags: data.tags ?? [],
    themes: data.theme ?? [],
    heroImage: data.heroImage ?? "",
    content,
    htmlContent,
    htmlCtas,
  };
}

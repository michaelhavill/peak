#!/usr/bin/env node
// Generate minimal persona variants for reshaped articles.
// Each variant renders the full article as a single WHY section.
// This preserves the PersonaSelector UI even though content is identical across personas.

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const BLOG_DIR = '/Users/michaelhavill/websites/path/content/blog';
const GENERATED_DIR = path.join(BLOG_DIR, 'generated');

const RESHAPED_SLUGS = [
  'widen-your-context-window',
  'taste-through-ai',
  '10x-team-ai-peers',
  'you-are-not-generic',
  'speed-to-market',
  'pillar-2-hub-and-spoke',
  'coding-in-craft',
  'monetise-your-expertise',
  'pillar-4-ai-native-teams',
  'pillar-5-performance-standards',
];

const PERSONA_IDS = [
  'general',
  'founder',
  'product-builder',
  'product-designer',
  'design-engineer',
  'solo-operator',
  'technical-leader',
  'creative-director',
  'vibe-coder',
];

function colorizeAscii(html) {
  return html.replace(
    /<pre><code>([\s\S]*?)<\/code><\/pre>/g,
    (_m, inner) => {
      let c = inner;
      c = c.replace(/●/g, '<span class="ascii-bullet">●</span>');
      c = c.replace(/█{3,}/g, (m) => `<span class="ascii-bar-full">${m}</span>`);
      c = c.replace(/░{3,}/g, (m) => `<span class="ascii-bar-empty">${m}</span>`);
      c = c.replace(
        /(<\/span>\s*)(\d+%)/g,
        (_x, gap, pct) => {
          const n = parseInt(pct);
          const cls = n >= 60 ? 'ascii-pct-high' : 'ascii-pct-low';
          return `${gap}<span class="${cls}">${pct}</span>`;
        }
      );
      c = c.replace(/──+→/g, (m) => `<span class="ascii-arrow">${m}</span>`);
      c = c.replace(/↓/g, '<span class="ascii-arrow">↓</span>');
      c = c.replace(
        /(│\s{1,3})((?:[A-Z][A-Z &/\-]+){2,})(\s+│)/g,
        (_x, pre, title, post) => `${pre}<span class="ascii-label">${title}</span>${post}`
      );
      return `<pre><code>${c}</code></pre>`;
    }
  );
}

function generateVariantForSlug(slug) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { content } = matter(raw);

  // Strip toggle comments and CTA markdown links
  const cleaned = content
    .replace(/<!-- toggle: \w+ -->/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)\{\.cta-\w+\}/g, '$1');

  // Split off trailing CTA section (after last --- with no headings)
  const lastHrIndex = cleaned.lastIndexOf('\n---\n');
  let body = cleaned;
  if (lastHrIndex !== -1) {
    const candidate = cleaned.slice(lastHrIndex + 5).trim();
    if (!/^#{1,6}\s/m.test(candidate)) {
      body = cleaned.slice(0, lastHrIndex);
    }
  }

  const html = colorizeAscii(marked.parse(body));

  // Single WHY section containing the full article HTML. No methods.
  const sections = [
    { type: 'why', html },
  ];

  const personas = {};
  for (const id of PERSONA_IDS) {
    personas[id] = { sections };
  }

  const output = { personas };
  const outPath = path.join(GENERATED_DIR, `${slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`wrote ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)}KB)`);
}

for (const slug of RESHAPED_SLUGS) {
  generateVariantForSlug(slug);
}
console.log(`\ngenerated ${RESHAPED_SLUGS.length} variant files`);

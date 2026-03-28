#!/usr/bin/env node

/**
 * Generate AI hero + inline images for all blog posts using Google Gemini (Nano Banana).
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/generate-blog-images.mjs
 *   GEMINI_API_KEY=... node scripts/generate-blog-images.mjs --slug=speed-to-market
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { GoogleGenAI } from "@google/genai";

const BLOG_DIR = path.resolve("content/blog");
const PUBLIC_DIR = path.resolve("public/blog");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ---------------------------------------------------------------------------
// Style direction — shared across all prompts for a cohesive look
// ---------------------------------------------------------------------------
const STYLE_PREFIX =
  "16-bit pixel art, [SCENE], retro video game aesthetic, rich detailed dithering, warm diffused lighting, vibrant saturated color palette, clean composition with clear focal point, slight atmospheric haze, every pixel visible, painterly pixel shading, Japanese SFC-era game background art, nostalgic and inviting mood, no text, no UI elements, no watermarks";

// ---------------------------------------------------------------------------
// Per-post prompt config: hero prompt + inline section prompts
// ---------------------------------------------------------------------------
const POST_PROMPTS = {
  "10x-team-ai-peers": {
    hero: "A pixel art command center with a lone adventurer at a glowing console, summoning a squad of friendly robot companions that fan out across the scene, each carrying tools and working on different tasks in parallel",
    sections: [
      "Pixel art split scene: left side a slow medieval workshop with one tired craftsman; right side a bustling automated factory with many cheerful robots assembling products on glowing conveyor belts",
      "A pixel art brain-shaped circuit board with warm golden pathways, tiny robots walking along the neural paths carrying glowing orbs of knowledge between nodes",
    ],
  },
  "building-moat-at-scale": {
    hero: "A pixel art castle being built upward from a single glowing tower into a sprawling fortress, tiny builders and robots working together, the moat around it filled with shimmering data streams instead of water",
    sections: [
      "Pixel art geological cross-section showing glowing knowledge layers stacking upward like a mountain, each stratum a different vibrant color, crystals growing at the intersections",
      "A pixel art map showing a small golden campfire growing into a vast network of connected beacon towers across a landscape, each beacon lighting up in sequence",
    ],
  },
  "coding-in-craft": {
    hero: "A pixel art master blacksmith at an enchanted forge, hammering glowing code runes onto a legendary sword, sparks flying with each precise strike, shelves of carefully crafted artifacts behind them",
    sections: [
      "Pixel art split scene: left side a grey factory producing identical bland boxes; right side an artisan workshop where a craftsperson polishes a unique glowing gemstone artifact",
      "A pixel art alchemist's lab with a crystal prism in the center, raw materials flowing in from the left, refined golden artifacts emerging on the right",
    ],
  },
  "collaborative-spaces": {
    hero: "A pixel art tavern where human adventurers and robot companions sit together around a large holographic map table, sharing plans and pointing at glowing waypoints, warm fireplace in background",
    sections: [
      "Pixel art scene of two worlds merging: a cozy wooden workshop on the left blending into a sleek crystal tech lab on the right, with a shared workbench at the center",
      "A pixel art star chart where constellation lines connect human and robot figures at bright intersection points, forming collaborative patterns across a deep purple sky",
    ],
  },
  "monetise-your-expertise": {
    hero: "A pixel art wizard extracting glowing memories from their mind, each memory crystallising into floating gem tokens that drop into treasure chests, a magical library behind them",
    sections: [
      "Pixel art treasure room where knowledge gems are stacking into growing towers, a growth chart made of golden coins ascending in the background",
      "A pixel art transformation scene: scattered glowing thought bubbles on the left being funneled through a magical press, emerging as faceted brilliant gems on the right",
    ],
  },
  "pillar-1-knowledge-management": {
    hero: "A pixel art grand library floating among clouds, books transforming into glowing data crystals as a scholar and their robot assistant organize them into an elegant crystal archive structure",
    sections: [
      "A pixel art locked treasure vault cracking open with golden light streaming out, ancient scrolls transforming into accessible floating holographic displays",
      "A pixel art river of experiences flowing through a landscape, with magical bridges and portals built across it allowing instant travel to any point along the journey",
    ],
  },
  "pillar-2-hub-and-spoke": {
    hero: "A pixel art magical wheel with a glowing central hub and modular spokes, each spoke ending in a different tool shrine that can be swapped, floating in a mystical void",
    sections: [
      "Pixel art split: left side heavy iron chains locking tools in rigid positions; right side tools orbiting freely around a gravity well, easily swappable",
      "A pixel art mechanical blueprint of a resilient machine where one broken gear is being seamlessly replaced by a fresh one, the rest of the machine still running smoothly",
    ],
  },
  "pillar-3-orchestration": {
    hero: "A pixel art conductor on a floating platform directing streams of colorful magical energy, each stream carrying different elements that converge into a symphony of automated spellwork",
    sections: [
      "Pixel art progression: scattered lone campfires on the left gradually connecting into an organized network of flowing energy rivers on the right",
      "A pixel art ensemble of distinct magical constructs working in harmony: a fire sprite, water elemental, earth golem, and wind spirit, connected by invisible golden threads",
    ],
  },
  "pillar-4-ai-native-teams": {
    hero: "Pixel art two adventurers side by side: one surrounded by completed quests, trophies and shipped artifacts glowing bright; the other buried under a pile of unfinished scrolls and plans gathering dust",
    sections: [
      "Pixel art amplifier scene: magical energy flowing into a builder who produces towers of glowing artifacts vs same energy flowing into a talker who produces clouds of floating empty speech bubbles",
      "A pixel art party formation where each character leaves a trail behind them: some trails are bright with built structures, others fade into thin document shadows",
    ],
  },
  "pillar-5-performance-standards": {
    hero: "A pixel art mountain peak above the clouds: below the cloudline countless identical grey structures blend together; above it rare crystalline towers shine with unique quality in golden sunlight",
    sections: [
      "Pixel art impact visualization: a glowing stone dropped in water creating expanding concentric rings of light vs a spinning wheel that generates lots of motion but no outward ripples",
      "A pixel art ascending staircase where each step glows brighter than the last, the top steps radiating in golden light above a baseline fog layer",
    ],
  },
  "speed-to-market": {
    hero: "A pixel art time warp scene: a long winding road being compressed and folded by magic into a short straight path, speed lines and light trails showing the acceleration",
    sections: [
      "Pixel art timeline with dark gaps between glowing decision crystals, magical bridges appearing to eliminate the dead space and compress the journey",
      "A pixel art rocket ship with minimal design cutting through space cleanly, while a huge ornate battleship behind it is weighed down by unnecessary bulk and falling behind",
    ],
  },
  "taste-through-ai": {
    hero: "A pixel art master chef loading their secret recipe book into a magical cooking golem, the golem then produces dishes with the same distinctive golden sparkle as the chef's signature style",
    sections: [
      "Pixel art ancient tree with glowing growth rings visible in cross-section, a small robot reading the rings like a book, absorbing years of wisdom",
      "A pixel art conduit scene: warm golden essence flowing from a craftsperson's hands through a crystal pipeline into a robot's core, tinting all its output with the same warm glow",
    ],
  },
  "you-are-not-generic": {
    hero: "A pixel art unique glowing fingerprint radiating outward from a character, shaping nearby robots and tools to match their distinct style, standing out against a sea of grey identical silhouettes",
    sections: [
      "Pixel art ocean of identical grey cubes with one brilliant multicolored crystal rising above them all, beams of unique light radiating from it",
      "A pixel art key made of swirling domain-specific symbols unlocking a unique ornate door that generic skeleton keys scattered on the ground cannot open",
    ],
  },
};

// ---------------------------------------------------------------------------
// Generate a single image
// ---------------------------------------------------------------------------
async function generateImage(prompt, outputPath) {
  if (fs.existsSync(outputPath)) {
    console.log(`  ⏭  Skipping (exists): ${path.basename(outputPath)}`);
    return true;
  }

  console.log(`  🎨 Generating: ${path.basename(outputPath)}`);
  try {
    const fullPrompt = STYLE_PREFIX.replace("[SCENE]", prompt);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: fullPrompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, buffer);
        console.log(`  ✅ Saved: ${path.basename(outputPath)} (${(buffer.length / 1024).toFixed(0)} KB)`);
        return true;
      }
    }
    console.log(`  ⚠️  No image in response for ${path.basename(outputPath)}`);
    return false;
  } catch (err) {
    console.error(`  ❌ Error generating ${path.basename(outputPath)}: ${err.message}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Update markdown frontmatter with heroImage field
// ---------------------------------------------------------------------------
function updateFrontmatter(slug) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  if (data.heroImage) return; // already set

  data.heroImage = `/blog/${slug}/hero.png`;
  const updated = matter.stringify(content, data);
  fs.writeFileSync(filePath, updated);
  console.log(`  📝 Updated frontmatter: ${slug}`);
}

// ---------------------------------------------------------------------------
// Insert inline image markdown into blog post body
// ---------------------------------------------------------------------------
function insertInlineImages(slug) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");

  // Don't re-insert if images already present
  if (raw.includes(`![`)) return;

  const { data, content } = matter(raw);
  const prompts = POST_PROMPTS[slug];
  if (!prompts?.sections?.length) return;

  // Find ## headings to insert images after
  const lines = content.split("\n");
  const headingIndices = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^## /.test(lines[i])) {
      headingIndices.push(i);
    }
  }

  if (headingIndices.length < 2) return; // need at least 2 headings

  // Insert images after every ~3rd heading (spread them out)
  const insertAfter = [];
  const step = Math.max(1, Math.floor(headingIndices.length / (prompts.sections.length + 1)));
  for (let i = 0; i < prompts.sections.length; i++) {
    const idx = headingIndices[Math.min(step * (i + 1), headingIndices.length - 1)];
    if (idx && !insertAfter.includes(idx)) {
      insertAfter.push(idx);
    }
  }

  // Insert from bottom to top to preserve indices
  let imgNum = insertAfter.length;
  for (let i = insertAfter.length - 1; i >= 0; i--) {
    const lineIdx = insertAfter[i];
    // Find the next blank line after the heading
    let insertAt = lineIdx + 1;
    while (insertAt < lines.length && lines[insertAt].trim() !== "") {
      insertAt++;
    }
    const imgMd = `\n![](/blog/${slug}/section-${imgNum}.png)\n`;
    lines.splice(insertAt, 0, imgMd);
    imgNum--;
  }

  const updated = matter.stringify(lines.join("\n"), data);
  fs.writeFileSync(filePath, updated);
  console.log(`  📝 Inserted ${insertAfter.length} inline images into ${slug}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  const targetSlug = slugArg ? slugArg.split("=")[1] : null;

  const slugs = targetSlug
    ? [targetSlug]
    : fs
        .readdirSync(BLOG_DIR)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, ""));

  console.log(`\n🖼  Generating images for ${slugs.length} blog post(s)...\n`);

  for (const slug of slugs) {
    const prompts = POST_PROMPTS[slug];
    if (!prompts) {
      console.log(`⚠️  No prompts for "${slug}" — skipping`);
      continue;
    }

    console.log(`\n📄 ${slug}`);
    const outDir = path.join(PUBLIC_DIR, slug);

    // Hero image
    const heroPath = path.join(outDir, "hero.png");
    const heroOk = await generateImage(prompts.hero, heroPath);

    // Section images
    for (let i = 0; i < prompts.sections.length; i++) {
      const secPath = path.join(outDir, `section-${i + 1}.png`);
      await generateImage(prompts.sections[i], secPath);
    }

    // Update markdown
    if (heroOk) {
      updateFrontmatter(slug);
      insertInlineImages(slug);
    }

    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n✅ Done!\n");
}

main().catch(console.error);

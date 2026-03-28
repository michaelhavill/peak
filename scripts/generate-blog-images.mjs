#!/usr/bin/env node

/**
 * Generate AI hero + inline images for all blog posts using Google Gemini (Nano Banana).
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/generate-blog-images.mjs
 *   GEMINI_API_KEY=... node scripts/generate-blog-images.mjs --slug=speed-to-market
 *   GEMINI_API_KEY=... node scripts/generate-blog-images.mjs --slug=monetise-your-expertise --style=new-yorker --force
 *
 * --style=new-yorker   Use New Yorker editorial illustration style instead of pixel art
 * --force              Overwrite existing images
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { GoogleGenAI } from "@google/genai";

const BLOG_DIR = path.resolve("content/blog");
const PUBLIC_DIR = path.resolve("public/blog");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ---------------------------------------------------------------------------
// Style presets
// ---------------------------------------------------------------------------
const STYLES = {
  "pixel-art":
    "16-bit pixel art, [SCENE], retro video game aesthetic, rich detailed dithering, warm diffused lighting, vibrant saturated color palette, clean composition with clear focal point, slight atmospheric haze, every pixel visible, painterly pixel shading, Japanese SFC-era game background art, nostalgic and inviting mood, no text, no UI elements, no watermarks",
  "new-yorker":
    "New Yorker magazine cover illustration, [SCENE], upbeat and optimistic mood, sense of momentum and forward motion, soft watercolour washes with loose ink linework, muted sophisticated palette — warm terracotta, dusty teal, soft ochre — against a warm ivory background, figures reduced to expressive gesture and fluid silhouette, caught mid-leap or mid-reach suggesting possibility and joy, generous negative space, delicate painterly texture, the feeling of something beginning not ending, no pixel art, no game art, no text, no captions, no speech bubbles, no logos",
};

// ---------------------------------------------------------------------------
// Per-post prompt config: hero prompt + inline section prompts
// ---------------------------------------------------------------------------
const POST_PROMPTS = {
  "10x-team-ai-peers": {
    hero: "A jubilant abstract figure leaping upward, trails of energy radiating outward into many bright active forms all moving in different directions simultaneously — one spark becoming a constellation of momentum",
    sections: [
      "Abstract figures in full sprint, each one spawning two more behind them mid-stride — a cascade of joyful forward motion multiplying across the frame",
      "A single abstract figure at the center with outstretched arms, colourful arcs of energy connecting them to a ring of dynamic forms all in motion around them — conductor and chorus",
    ],
  },
  "building-moat-at-scale": {
    hero: "An abstract figure stacking luminous blocks with ease and delight, each block clicking into place and glowing brighter — a tower rising with joyful inevitability, the whole structure radiating warmth",
    sections: [
      "An abstract figure planting seeds that bloom instantly into vibrant structures as they walk forward — growth as effortless creative act",
      "A small figure whose footsteps leave a glowing trail that widens behind them into a broad luminous path — individual steps becoming collective ground",
    ],
  },
  "coding-in-craft": {
    hero: "An abstract figure sculpting something in mid-air with both hands, the object taking a vivid unique shape between their palms — creation as joyful physical act, the made thing already alive",
    sections: [
      "A figure moving through a field of identical grey forms, each one they touch transforming into something vibrant and distinct — the craftsperson as animator",
      "An abstract figure and a swirl of energy working together on the same object, their contributions weaving into something neither could make alone — collaboration as colour mixing",
    ],
  },
  "collaborative-spaces": {
    hero: "Two abstract figures leaping toward each other across a gap, meeting in the middle in a burst of colour and energy — the collision as creative ignition rather than impact",
    sections: [
      "Multiple abstract figures building upward together, each one standing on the others' shoulders with ease and balance, reaching toward something bright above — collaboration as joyful architecture",
      "Abstract forms in different colours merging at the centre of the frame into a single luminous shape — many voices becoming one clear signal",
    ],
  },
  "monetise-your-expertise": {
    hero: "A lone abstract figure standing at a window, their shadow cast long behind them taking the shape of a vast branching tree — suggesting years of accumulated knowledge invisible to the eye but immense in form",
    sections: [
      "An abstract figure seated at a small desk, their shadow stretching upward and forward into a luminous city of soaring towers and bridges — the contrast between the still person and the vast bright future their work makes possible",
      "An abstract figure opening their hands to release a flock of bright geometric forms that spiral outward and upward — expertise becoming something that moves and multiplies freely",
    ],
  },
  "pillar-1-knowledge-management": {
    hero: "An abstract figure surrounded by a swirling constellation of glowing ideas and memories — all of it organised into flowing arcs around them, the mind as a vibrant living archive",
    sections: [
      "A figure reaching into a stream of flowing light and pulling out something solid and vivid — capturing and crystallising knowledge as an act of joyful retrieval",
      "An abstract figure building a shining structure from fragments of light — each piece snapping into place, the whole growing more brilliant with each addition",
    ],
  },
  "pillar-2-hub-and-spoke": {
    hero: "An abstract figure at the bright centre of a wheel of colourful radiating lines — each line a different direction of possibility, the figure calm and powerful at the hub of it all",
    sections: [
      "A figure effortlessly swapping one glowing spoke for another — the system humming on, fluid and resilient, the change made with a single graceful gesture",
      "An abstract figure conducting a system of orbiting forms — each one circling freely, the whole arrangement alive and responsive — control as lightness not grip",
    ],
  },
  "pillar-3-orchestration": {
    hero: "An abstract figure conducting with both arms wide, colourful streams of energy flowing through the air in sweeping arcs — everything in motion, everything coordinated, the whole scene alive with directed momentum",
    sections: [
      "A chain of bright abstract forms each in mid-leap, the energy passing between them like light through prisms — orchestration as joyful relay",
      "An abstract figure stepping forward through a swirl of converging coloured streams — all the moving parts flowing together into a single luminous direction",
    ],
  },
  "pillar-4-ai-native-teams": {
    hero: "An abstract figure in full stride, a trail of bright completed forms left in their wake — each footstep a finished thing, the path behind them a gallery of made work",
    sections: [
      "A figure launching upward on a beam of energy, artefacts and creations orbiting around them as they rise — output as lift, making as flight",
      "An abstract figure surrounded by a vibrant constellation of shipped things — each one glowing, each one distinct — the satisfaction of a builder mid-flow",
    ],
  },
  "pillar-5-performance-standards": {
    hero: "An abstract figure standing on a peak of their own making — the landscape below bright and ordered, the figure at the top reaching upward still — the standard-setter always in motion, always rising",
    sections: [
      "A figure drawing a luminous line through the air that becomes a horizon — the act of setting a standard as a creative and generative gesture",
      "An abstract figure whose every step leaves a bright mark — a trail of quality visible behind them, the path ahead open and inviting",
    ],
  },
  "speed-to-market": {
    hero: "An abstract figure stepping through a doorway while another is still at the starting line — the first already arriving, full of forward energy and ease — the joy of eliminated distance",
    sections: [
      "A figure surfing a wave of compressed time — riding momentum rather than fighting it, the whole image full of kinetic joy and speed",
      "An abstract figure in mid-leap between two points, the space between them dissolving into light — the gap closed not by effort but by clarity",
    ],
  },
  "taste-through-ai": {
    hero: "An abstract figure pressing their hand into light — the impression remaining, vivid and warm, as a second luminous form beside them makes the same impression naturally — taste as something that lives on and propagates",
    sections: [
      "A figure conducting two streams of output simultaneously — both carrying the same warmth and colour, both unmistakably from the same source — the multiplication of a personal voice",
      "An abstract figure surrounded by objects they have made and objects made in their spirit — all of them glowing with the same signature warmth — the style that persists",
    ],
  },
  "you-are-not-generic": {
    hero: "A vivid abstract figure standing among others, their unique colour radiating outward and lighting everything around them — specificity as generosity, distinctiveness as a gift to the whole scene",
    sections: [
      "An abstract figure whose particular shape fits perfectly through an opening others cannot find — moving through with ease and delight while the opening glows around them",
      "A figure holding something no one else is holding — the object bright and strange and clearly theirs — the quiet power of being precisely and joyfully yourself",
    ],
  },
};

// ---------------------------------------------------------------------------
// Generate a single image
// ---------------------------------------------------------------------------
async function generateImage(prompt, outputPath, styleTemplate, force = false) {
  if (!force && fs.existsSync(outputPath)) {
    console.log(`  ⏭  Skipping (exists): ${path.basename(outputPath)}`);
    return true;
  }

  console.log(`  🎨 Generating: ${path.basename(outputPath)}`);
  try {
    const fullPrompt = styleTemplate.replace("[SCENE]", prompt);
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
  const styleArg = process.argv.find((a) => a.startsWith("--style="));
  const force = process.argv.includes("--force");

  const targetSlug = slugArg ? slugArg.split("=")[1] : null;
  const styleName = styleArg ? styleArg.split("=")[1] : "pixel-art";
  const styleTemplate = STYLES[styleName] ?? STYLES["pixel-art"];

  if (!STYLES[styleName]) {
    console.warn(`⚠️  Unknown style "${styleName}", falling back to pixel-art`);
  }

  const slugs = targetSlug
    ? [targetSlug]
    : fs
        .readdirSync(BLOG_DIR)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, ""));

  console.log(`\n🖼  Generating images for ${slugs.length} blog post(s) [style: ${styleName}]...\n`);

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
    const heroOk = await generateImage(prompts.hero, heroPath, styleTemplate, force);

    // Section images
    for (let i = 0; i < prompts.sections.length; i++) {
      const secPath = path.join(outDir, `section-${i + 1}.png`);
      await generateImage(prompts.sections[i], secPath, styleTemplate, force);
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

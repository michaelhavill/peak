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
    "New Yorker magazine editorial illustration, [SCENE], warm and quietly optimistic mood, soft watercolour washes with confident ink linework, muted sophisticated palette — warm terracotta, dusty teal, soft ochre — against warm ivory, abstract human figures grounded in everyday activity, intimate and observational in scale, figures working with their hands or in relation to objects and spaces, the story told through posture and context not drama, generous negative space, delicate painterly texture, no floating or celestial imagery, no radiating light, no leaping or flying, no pixel art, no game art, no text, no captions, no speech bubbles, no logos",
};

// ---------------------------------------------------------------------------
// Per-post prompt config: hero prompt + inline section prompts
// ---------------------------------------------------------------------------
const POST_PROMPTS = {
  "10x-team-ai-peers": {
    hero: "One person seated at a small desk, but five pairs of hands reach in from the edges of the frame helping simultaneously — writing, building, sketching — the single figure at calm centre of a ring of collaborative hands",
    sections: [
      "A figure at a table covered in work, each piece of work being picked up by a different pair of unseen hands and carried toward different doorways — output leaving in all directions at once",
      "Two workers side by side: one surrounded by towering stacks of finished work, one surrounded only by a single unfinished thing and a long to-do list — the difference between leverage and labour",
    ],
  },
  "building-moat-at-scale": {
    hero: "A craftsperson carefully laying one precise brick into a low wall — behind them, barely visible, the same wall stretches far into the distance already built — the quiet satisfaction of compounding work",
    sections: [
      "A figure tending a small garden, but looking up to find the plants have already grown into an orchard behind them — patient tending as strategic act",
      "Two businesses drawn as buildings: one wide and flat with a single door anyone can enter; one narrow and deep with a long corridor only the right person can navigate — the moat as architecture",
    ],
  },
  "coding-in-craft": {
    hero: "A figure bent over a workbench, hands shaping something with great care — the object between their hands catching the light differently from the identical objects on a shelf behind them — craft as attention",
    sections: [
      "A hand holding a tool making one precise mark, beside a machine stamping the same mark hundreds of times on identical surfaces — the singular versus the replicated",
      "Two outputs side by side on a table: one made with a distinct hand, one produced by rote — a figure studying the difference closely, the gap visible only to those who look",
    ],
  },
  "collaborative-spaces": {
    hero: "A human figure and a geometric form sitting at opposite ends of a long shared table, both working on the same drawing that meets in the middle — neither looking up, both contributing",
    sections: [
      "A figure arranging a shared workspace — placing chairs, pinning things to a wall — making room for someone not yet there, the empty chair as invitation",
      "Two figures working back to back, each doing something different, the outputs of each feeding quietly into the other's work — collaboration without interruption",
    ],
  },
  "monetise-your-expertise": {
    hero: "A figure seated at a desk writing into a book, while identical books quietly stack themselves on shelves behind them — the single act of writing becoming many without the writer stopping",
    sections: [
      "An abstract figure seated at a small desk, their shadow stretching upward and forward into a luminous city of soaring towers and bridges — the contrast between the still person and the vast bright future their work makes possible",
      "A figure opening a door to find a long corridor of other doors, each one theirs to open — one piece of expertise becoming many directions, all accessible at once",
    ],
  },
  "pillar-1-knowledge-management": {
    hero: "A figure in a library of their own making — shelves they have built themselves, each book placed with intention — standing at the centre of it all, comfortable, unhurried, everything retrievable",
    sections: [
      "A figure pulling a specific thread from a tangled pile and finding it attached to exactly what they needed — retrieval as a calm and practiced act",
      "Two figures asked the same question: one rummaging through scattered piles, one reaching directly to the right shelf — the difference between stored and organised knowledge",
    ],
  },
  "pillar-2-hub-and-spoke": {
    hero: "A figure standing at the center of a room with many doors — each door a different tool or service — calmly pointing at one while another swings shut behind them, the room still functioning",
    sections: [
      "A figure switching one component out of a running machine with one hand, the machine continuing undisturbed — the ease of the replaceable part",
      "Two builders: one whose tools are all wired together in a knot; one whose tools hang separately on a pegboard, each reachable independently — tangled versus modular",
    ],
  },
  "pillar-3-orchestration": {
    hero: "A figure at a conductor's stand, score open, baton raised — around them a dozen different instruments playing in sequence without the conductor touching any of them — direction as the only act",
    sections: [
      "A figure setting a line of objects in motion with a single push — each one nudging the next along a winding path — the chain of orchestrated cause and effect",
      "Two desks: one where a person does every task themselves, surrounded by chaos; one where a person points and delegates, the desk clear, more done — the difference orchestration makes",
    ],
  },
  "pillar-4-ai-native-teams": {
    hero: "Two figures given the same tools and time: one surrounded by a growing pile of finished things, one surrounded by a growing pile of plans and notes — the doer and the intender, same starting point",
    sections: [
      "A figure walking away from a finished building, not looking back — the thing made, the next thing already in mind — the quiet confidence of someone who ships",
      "A meeting room seen from outside through glass: many figures talking, hands waving — and beside it a workshop with one figure working, a completed thing on the bench beside them",
    ],
  },
  "pillar-5-performance-standards": {
    hero: "A figure measuring their own work with a ruler — not comparing to anyone else — adjusting it slightly upward, then looking at it again — the private and practiced act of holding a standard",
    sections: [
      "A figure drawing a line on a wall and marking it — then standing back and drawing another line slightly above it — the standard as something you keep raising for yourself",
      "Two figures: one checking a box on a list and moving on; one pausing over the same box, not satisfied, reworking it — the imperceptible difference that compounds into irreplaceability",
    ],
  },
  "speed-to-market": {
    hero: "Two figures at the same starting point on a map: one taking the long winding road marked out in front of them; one stepping through a door in the wall beside them that opens directly onto the destination",
    sections: [
      "A figure removing obstacles from a path one by one — not running faster, just clearing the way — the path behind them already clean, the one ahead getting clearer",
      "A figure handing something finished directly to someone waiting — no desk, no queue, no middleman — the shortest possible line between made and delivered",
    ],
  },
  "taste-through-ai": {
    hero: "A figure at a potter's wheel, shaping clay with practiced hands — beside them a second wheel turning on its own, producing the same form — the taste in the hands now in the system",
    sections: [
      "A figure reviewing two objects side by side, one made by them, one made without them — picking up the second one with quiet recognition — their taste present even in their absence",
      "A chef tasting a dish, adjusting the seasoning with one small gesture — beside them a long pass of identical dishes going out, each carrying that same adjustment — judgment at scale",
    ],
  },
  "you-are-not-generic": {
    hero: "A figure in a row of identical figures, all facing the same direction — but holding something in their hands that nobody else is holding — not performing difference, simply being specifically themselves",
    sections: [
      "A figure fitting precisely into a gap in a wall that other figures beside them cannot fit — not forcing it, simply shaped for it — the advantage of specific experience",
      "A hand leaving a thumbprint on a surface — beside it a series of stamped identical marks — the one impression that cannot be reproduced because it belongs to one specific person",
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

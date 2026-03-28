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
    "New Yorker magazine editorial illustration, [SCENE], one abstract humanoid figure rendered as a warm golden-terracotta simplified form — featureless, dignified, still — in relationship with a larger organic or architectural form rendered in deep navy ink with rich detailed linework, the connection between the figure and the form tells the entire story, warm ivory background, painterly ink linework with loose watercolour wash, the mood quietly hopeful and expansive — the figure always in a moment of discovery or possibility, never struggle, generous negative space, no realistic faces, no furniture or interiors, no pixel art, no game art, no text, no captions, no logos",
};

// ---------------------------------------------------------------------------
// Per-post prompt config: hero prompt + inline section prompts
// ---------------------------------------------------------------------------
const POST_PROMPTS = {
  "10x-team-ai-peers": {
    hero: "A single golden figure standing still, their shadow cast behind them branching into many silhouettes each doing different work — writing, building, reaching — the one person whose stillness multiplies into motion",
    sections: [
      "A golden figure standing with arms slightly open, their shadow on the wall behind them expanding into a vast branching network of connected figures — the reach invisible from the front, enormous from behind",
      "A small golden figure at the base of an enormous tree whose branches each end in a different kind of work — the tree as everything that grows from one person's intent",
    ],
  },
  "building-moat-at-scale": {
    hero: "A golden figure standing beside a young sapling — but their shadow on the ground behind them is the shadow of an ancient, enormous tree already fully grown — the future already present in what they are tending",
    sections: [
      "A golden figure placing a single stone at the base of a vast wall that stretches to the horizon — already built, still being built, the figure calm at the edge of something enormous they made",
      "A golden figure standing at the centre of concentric rings carved into the ground around them — like growth rings in a cross-section of wood — the record of everything that has compounded around them",
    ],
  },
  "coding-in-craft": {
    hero: "A golden figure with hands pressed against an arch they are shaping — the arch intricate and alive with detailed organic linework, every curve deliberate — the figure as the author of something that could not exist without their particular attention",
    sections: [
      "A golden figure holding a single object — simple in their hands, but its shadow on the wall is vastly more complex, a detailed architectural form — what craft makes visible that generic production cannot",
      "A golden figure standing before two trees — one perfectly symmetrical and identical on both sides, one wild and asymmetric and unmistakably grown by a specific hand — the figure looking at the second one",
    ],
  },
  "collaborative-spaces": {
    hero: "Two golden figures standing apart, each casting a shadow toward the other — the shadows meeting in the middle and merging into a single larger form neither figure alone could cast — shared space as the place where something new becomes possible",
    sections: [
      "A golden figure and a geometric companion form facing each other across a gap — between them, suspended in the air, the outline of something neither holds — the made thing existing in the space of collaboration",
      "Two golden figures back to back, each shadow extending forward — both shadows converging ahead of them into a single illuminated path — collaboration pointing both of them in the same direction",
    ],
  },
  "monetise-your-expertise": {
    hero: "A golden figure standing at an open doorway, their shadow cast long behind them taking the shape of a vast branching tree laden with detail — everything they know made visible as an enormous living structure growing from where they stand",
    sections: [
      "A golden figure seated quietly, their shadow expanding outward into a wide river that flows toward many directions at once — the still person and the moving thing their knowledge becomes",
      "A golden figure opening their hands, their shadow on the wall behind them becoming a great spreading canopy — the release of something that then shelters far more than one person",
    ],
  },
  "pillar-1-knowledge-management": {
    hero: "A golden figure standing at the centre of a vast library that grows organically around them like a living forest — shelves becoming branches, books becoming leaves — the figure unhurried at the centre of everything they have gathered",
    sections: [
      "A golden figure reaching into a dense tangle of branches and pulling one specific branch free — the branch in their hand flowering immediately — retrieval as a precise and generative act",
      "A golden figure standing before an enormous web of connected nodes spread across the wall — their hand resting on one node, the whole web responding with a warm glow — knowledge as a living connected thing",
    ],
  },
  "pillar-2-hub-and-spoke": {
    hero: "A golden figure standing at the exact centre of a great wheel — deep navy spokes extending outward in all directions to the rim — the figure perfectly still as the rim turns and changes around them — calm ownership of the middle",
    sections: [
      "A golden figure holding one spoke lightly, a different spoke already slotting in to replace it — the wheel still turning, the figure untroubled — control as the lightest possible grip",
      "A golden figure at the root of a great tree whose branches reach to many different things — the branches changing with the seasons, the roots unchanged — the hub as the permanent thing beneath the changing surface",
    ],
  },
  "pillar-3-orchestration": {
    hero: "A golden figure with one arm raised, baton held lightly — around them in a wide arc, deep navy organic forms each in motion, each following the others in sequence — the figure conducting without touching, direction as pure presence",
    sections: [
      "A golden figure standing at the top of a long staircase of falling forms — each one setting the next in motion below — the figure has only touched the first, everything else is already moving",
      "A golden figure standing at the point where many currents converge — the currents in deep navy flowing around and through them and emerging as a single directed stream — the orchestrator as the still point in the turning world",
    ],
  },
  "pillar-4-ai-native-teams": {
    hero: "A golden figure walking forward, a trail of made things growing behind them like plants from footprints — each step leaving something finished, the path behind them already a garden — the builder whose motion is inseparable from their output",
    sections: [
      "A golden figure holding a finished object, their shadow behind them already reaching toward the next thing — the maker always a step ahead of the made",
      "A golden figure standing beside a growing tower of finished work — not looking at it, looking forward — the accumulation of shipping as backdrop, not destination",
    ],
  },
  "pillar-5-performance-standards": {
    hero: "A golden figure standing on a ledge of their own making — the ledge clearly carved from the rock face by their own hand — below them the plain where others stand, above them open sky — the standard as something you build to stand on",
    sections: [
      "A golden figure drawing a line across a wall — the line becoming the horizon of a new landscape, everything below it ordered, everything above it possible — the act of setting a standard as world-making",
      "A golden figure holding a measuring tool against their own work — the work exceeding the measure — the satisfaction of someone whose standard has outgrown the available instruments",
    ],
  },
  "speed-to-market": {
    hero: "A golden figure stepping through a narrow doorway — on one side of the door a long winding road stretching to the horizon, on the other side the destination already present — the door as the compression of distance",
    sections: [
      "A golden figure walking a straight path, their shadow falling back across a tangled labyrinth they have already passed through and simplified — the path behind them straightened by their having walked it",
      "A golden figure and their shadow — the shadow arriving at the destination while the figure is still mid-stride — speed as the gap between intent and arrival collapsing",
    ],
  },
  "taste-through-ai": {
    hero: "A golden figure pressing their hand gently into a surface — the handprint remaining and blooming outward into an intricate organic form in deep navy — taste as the impression that outlasts the touch and grows into something larger",
    sections: [
      "A golden figure standing before two trees — one grown wild and unmistakably shaped by a specific sensibility, one perfectly generic — the figure's shadow falling only on the distinctive one — recognition as alignment",
      "A golden figure and their shadow side by side — both making the same gesture, both producing the same detailed form — the taste in the hands now also in the system that shadows them",
    ],
  },
  "you-are-not-generic": {
    hero: "A golden figure among a row of grey silhouettes all facing forward — the golden figure the same size, the same posture, but casting a completely different shadow behind them — an irregular, organic, unmistakable form — specificity visible only in what they cast",
    sections: [
      "A golden figure fitting through an opening in a great stone wall — the opening exactly their shape, no one else's — not forcing it, simply belonging to it — the advantage of being precisely themselves",
      "A golden figure holding something no one else in the frame holds — not displayed, just held — the quiet fact of a distinctive thing in a specific hand",
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

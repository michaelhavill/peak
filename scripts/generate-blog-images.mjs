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
    "New Yorker and Economist magazine cover illustration style, [SCENE], bold graphic symbolism, one strong central visual metaphor, the entire idea compressed into a single image, highly abstract and conceptual, minimal elements — only what is essential to the idea, strong geometric composition, confident flat ink shapes with sparse watercolour wash, very limited palette — deep navy or charcoal, warm terracotta or amber, ivory — high contrast, clever visual wit, the kind of image that makes you think before you understand it, no literal scenes, no interiors, no furniture, no realistic characters, no faces, figures only as silhouette or shape, no pixel art, no game art, no text, no captions, no logos",
};

// ---------------------------------------------------------------------------
// Per-post prompt config: hero prompt + inline section prompts
// ---------------------------------------------------------------------------
const POST_PROMPTS = {
  "10x-team-ai-peers": {
    hero: "A single chess queen piece casting a shadow shaped like an entire army of pieces — one figure, the force of many — stark graphic, high contrast, white background",
    sections: [
      "One candle flame multiplied into a hundred flames in a single breath — the geometry of exponential reach from a single source",
      "A tiny seed on one side of a scale perfectly balancing a vast tree on the other — leverage made visible as pure graphic symbol",
    ],
  },
  "building-moat-at-scale": {
    hero: "A small stone dropped into still water — the rings expanding outward and becoming walls, a fortress formed from the geometry of compounding — the ripple as architecture",
    sections: [
      "An hourglass where the sand falling through transforms into bricks as it lands, building upward — time becoming structure",
      "A single thread being pulled from a tangle that gradually straightens into a wall — the moat emerging from patience and repetition",
    ],
  },
  "coding-in-craft": {
    hero: "Two identical bolts of cloth — one cut by machine into a thousand identical shapes, one cut by a single pair of scissors into one perfect form — the geometry of mass versus the geometry of craft",
    sections: [
      "A fingerprint magnified to fill the frame, its unique ridges forming the contours of a landscape — identity embedded in the made thing",
      "A plain key beside an ornate key — both open a lock, but only one carries a signature — the difference craft makes rendered as pure object",
    ],
  },
  "collaborative-spaces": {
    hero: "Two circles overlapping — the overlapping space a different colour, brighter than either circle alone — the Venn diagram as the entire argument, nothing else in the frame",
    sections: [
      "A bridge drawn in a single unbroken line connecting two geometric forms that could not otherwise touch — connection as the simplest possible shape",
      "Two arrows pointing at each other meeting in the middle and becoming a single wider arrow pointing forward — collision becoming direction",
    ],
  },
  "monetise-your-expertise": {
    hero: "An iceberg — the small visible tip labelled by its shape alone as one person's time, the vast submerged mass the shape of compounding systems working without them — scale hiding beneath the surface",
    sections: [
      "A tap turned on, water flowing into one cup — then the same tap connected to a pipe network filling a hundred cups simultaneously — the same effort, radically different reach",
      "A book open flat — its pages fanning out not as pages but as doors, each one a different direction the knowledge can travel — one source becoming many outputs",
    ],
  },
  "pillar-1-knowledge-management": {
    hero: "A labyrinth viewed from above with a single glowing path already traced through it — the maze is the same, but the path changes everything — knowledge as the thread through the labyrinth",
    sections: [
      "A scattered constellation of dots — then the same dots connected by lines into a clear pattern — the knowledge base as the lines, not the dots",
      "A dark room with a single beam of light illuminating exactly the right object — retrieval as precision, the darkness making the found thing more visible",
    ],
  },
  "pillar-2-hub-and-spoke": {
    hero: "A wheel — spokes extending outward to different shapes at their tips, each shape different, each replaceable — the hub perfectly still at the centre while the rim changes — ownership of the middle",
    sections: [
      "A plug socket with many different adapters fitting the same port — modularity as graphic object, the socket as the unchanging constant",
      "A spine — vertebrae stacked, each one independent, the whole column strong precisely because each part can move separately — architecture as anatomy",
    ],
  },
  "pillar-3-orchestration": {
    hero: "A single baton — and below it in perfect geometric array, dozens of instruments arranged by type — the one object that sets all the others in motion without touching them",
    sections: [
      "A row of dominoes seen from above, the first one mid-fall — the chain of causality made graphic, the orchestrator visible only as the absence at the start",
      "A circuit diagram reduced to its essential form — one input, branching paths, many outputs — orchestration as the logic made visible",
    ],
  },
  "pillar-4-ai-native-teams": {
    hero: "Two hourglasses side by side, identical sand — one full of unturned potential, one already run through with a finished object sitting beneath it — the same resource, different outcomes",
    sections: [
      "A trail of footprints that become finished objects — each step leaving something made behind — motion as production rendered as pure graphic track",
      "A speech bubble and a built object the same size, side by side on a scale — the object heavier — output outweighing intention as simple graphic fact",
    ],
  },
  "pillar-5-performance-standards": {
    hero: "A thermometer — but instead of temperature, the rising column measures quality — a single line drawn across it marking the baseline, another line drawn higher marking where this person operates — the gap between them is the whole story",
    sections: [
      "A ruler with all the standard markings — and one additional mark squeezed in above the highest number — the self-imposed standard that exists beyond the official scale",
      "A bar chart of one — a single column so tall it breaks the frame — irreplaceability as pure graphic form, no comparison needed",
    ],
  },
  "speed-to-market": {
    hero: "Two paths between the same two points — one a long winding line crossing the whole page, one a straight short line cutting directly across — the same origin, the same destination, radically different geometry",
    sections: [
      "An hourglass with the neck removed — sand falling freely, no constraint — the bottleneck as the only thing that was ever causing the delay",
      "A straight arrow and a tangled knot of rope — both the same length — the arrow already at its destination, the rope still mid-tangle — speed as simplicity",
    ],
  },
  "taste-through-ai": {
    hero: "A wax seal stamp and beside it a long scroll of identical wax seals — the mark of one person reproduced endlessly, each impression carrying the same signature — taste as a stamp that travels",
    sections: [
      "A tuning fork and the waveform it produces — the same frequency carried forward through any medium — taste as the frequency, the AI as the medium",
      "A master key beside a ring of keys all cut to the same pattern — one original, many derivatives, all carrying the same logic — the craft that propagates",
    ],
  },
  "you-are-not-generic": {
    hero: "A row of identical locks — and one key, its unique cut visible — the only key shaped for the only lock that matters — specificity as the entire graphic argument",
    sections: [
      "A barcode and a fingerprint side by side — identical in function, opposite in nature — the generic and the specific as pure graphic contrast",
      "A crowd of identical silhouettes — and one silhouette a slightly different shape — not marked, not highlighted, just different — the difference that is simply there for those who look",
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

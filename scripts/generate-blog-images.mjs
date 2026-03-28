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
    "New Yorker magazine cover illustration, [SCENE], abstract suggestive figures, deliberately ambiguous and open to interpretation, bold confident ink strokes, very limited muted palette — ivory, one warm tone, one cool accent — enormous clean negative space, story implied not shown, figures reduced to essential gesture and silhouette, no faces or minimal implied faces, painterly ink washes, high contrast shadow shapes, the feeling of a thought not a picture, no pixel art, no game art, no text, no captions, no speech bubbles, no logos",
};

// ---------------------------------------------------------------------------
// Per-post prompt config: hero prompt + inline section prompts
// ---------------------------------------------------------------------------
const POST_PROMPTS = {
  "10x-team-ai-peers": {
    hero: "A single abstract figure at a desk, their shadow splitting behind them into many silhouettes each doing different work — the one person whose presence multiplies across the room in implied motion",
    sections: [
      "Two abstract figures of identical size: one alone pushing a boulder uphill; the other still, while multiple shadowed forms carry the boulder for them — effort versus orchestration",
      "An abstract figure whose outstretched arms cast long shadows that reach across a wide empty space and become other figures working at the edges — reach without movement",
    ],
  },
  "building-moat-at-scale": {
    hero: "A solitary abstract figure standing on a small island, their reflection in the water below showing a vast continent — the gap between what they appear to be and what they have quietly built",
    sections: [
      "An abstract figure layering transparent sheets of glass, each layer adding depth until the stack becomes a wall — accumulation as architecture",
      "A small abstract figure planting a seed, their shadow cast forward as a towering tree already grown — the implied future of something just begun",
    ],
  },
  "coding-in-craft": {
    hero: "An abstract figure carving into stone while a machine beside them stamps out identical copies on paper — the carved thing glows, the copies are flat — craft versus reproduction",
    sections: [
      "Two streams of abstract forms flowing side by side: one a rushing identical flood, one a slow deliberate trickle that leaves distinct marks on the ground beneath it",
      "An abstract figure looking into a mirror, the reflection holding something the figure is not — the self seen through output, identity revealed through made things",
    ],
  },
  "collaborative-spaces": {
    hero: "Two abstract figures on opposite sides of a translucent wall, both reaching toward the same point in the middle — their hands nearly touching through the surface, a shared space implied but not yet real",
    sections: [
      "An abstract figure and a geometric form sharing a table with an empty space between them — the empty space shaped like the thing they are both building, visible only in negative",
      "Multiple abstract silhouettes casting a single shared shadow — individuals dissolved into a collaborative form neither could make alone",
    ],
  },
  "monetise-your-expertise": {
    hero: "A lone abstract figure standing at a window, their shadow cast long behind them taking the shape of a vast branching tree — suggesting years of accumulated knowledge invisible to the eye but immense in form",
    sections: [
      "An abstract figure seated at a small desk, their shadow stretching upward and forward into a luminous city of soaring towers and bridges — the contrast between the still person and the vast bright future their work makes possible",
      "Two abstract figures: one pouring thoughts into a narrow funnel, the other receiving from a wide river — the transformation of locked-in expertise into something that flows freely",
    ],
  },
  "pillar-1-knowledge-management": {
    hero: "An abstract figure standing inside their own head — the interior vast and towering like a cathedral, everything they know suspended in the air around them — the mind as place",
    sections: [
      "An abstract figure holding a key that is the same shape as a door they are standing inside — already through, already arrived, the key and the lock the same thing",
      "A figure pouring water from a vessel into another vessel — the water becoming solid mid-air, taking on structure — liquid thought becoming stored form",
    ],
  },
  "pillar-2-hub-and-spoke": {
    hero: "An abstract figure standing at the center of a web of lines extending outward in all directions — they hold the center still while everything at the edges shifts and rearranges — ownership of the middle",
    sections: [
      "Two abstract figures: one tangled in a web of lines connecting them rigidly to surrounding objects; one standing free with lines radiating outward they could drop at any time — dependency versus choice",
      "An abstract figure removing one spoke from a wheel, the wheel still turning — the implied resilience of a system that does not depend on any single part",
    ],
  },
  "pillar-3-orchestration": {
    hero: "An abstract figure with arms raised, not holding anything — but around them forms are moving in patterns, each following the others, the figure conducting without touching — direction as pure gesture",
    sections: [
      "A line of abstract forms, each nudging the next into motion, a chain of implied causality stretching across the frame — orchestration as falling dominoes seen from above",
      "An abstract figure standing between two rooms: behind them chaos; ahead of them order — the doorway they occupy is the only point of transformation",
    ],
  },
  "pillar-4-ai-native-teams": {
    hero: "Two abstract figures side by side — one surrounded by objects they have made, stacked high around them; one surrounded only by shadows of objects they intended to make — output versus intention",
    sections: [
      "An abstract figure running, their footprints behind them becoming finished structures — each step leaving something built — motion as production",
      "Two figures receiving the same beam of light: one transformed by it, casting a long productive shadow; one passing it straight through, leaving no mark — amplification versus transparency",
    ],
  },
  "pillar-5-performance-standards": {
    hero: "A crowd of identical abstract figures on a flat plane and a single figure above them, not floating — standing on something invisible, the height made by what cannot be seen — the irreplaceable elevated by their own standard",
    sections: [
      "An abstract figure drawing a line in the air — the line becoming the horizon, the act of setting a standard creating the landscape it measures",
      "Two figures: one spinning fast and going nowhere, wearing a groove into the ground; one moving slowly but leaving a clear path — effort versus direction",
    ],
  },
  "speed-to-market": {
    hero: "Two abstract figures at the same starting point: one on a long winding road stretching to the horizon; one stepping directly through a doorway that opens onto the destination — the same journey, radically different geometry",
    sections: [
      "An abstract figure suspended in air between two platforms — the gap between them representing dead time — another figure below has already built a bridge across the same gap",
      "A figure moving through a space where all the walls have been removed — not running faster, just no longer stopping — speed as absence of friction",
    ],
  },
  "taste-through-ai": {
    hero: "An abstract figure pressing their hand into soft material — the handprint remaining as the figure steps back — then a second form, not human, pressing into material beside it and leaving the same print — taste as transferable impression",
    sections: [
      "An abstract figure and their shadow doing the same gesture — but the shadow is cast by something else entirely, the light source off-frame — taste outliving the person who formed it",
      "A figure looking at two objects: one made by them, one made in their absence — the second one unmistakably theirs anyway — the quality that persists without presence",
    ],
  },
  "you-are-not-generic": {
    hero: "A crowd of identical abstract forms and one that is the same size, the same posture — but casts a completely different shadow, an irregular silhouette that matches nothing around it — specificity invisible until the light hits",
    sections: [
      "An abstract figure holding a key unlike any other key in a pile on the floor — the pile generic, the held key strange — the value is in the strangeness",
      "Two figures facing the same wall: one pressing against it, unable to pass; one whose particular shape fits the gap perfectly and steps through — the advantage of being specifically, exactly yourself",
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

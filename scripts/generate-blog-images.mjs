#!/usr/bin/env node

/**
 * Generate AI images for blog posts and homepage heroes using Google Gemini.
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/generate-blog-images.mjs                        # all blog posts
 *   GEMINI_API_KEY=... node scripts/generate-blog-images.mjs --slug=speed-to-market # one post
 *   GEMINI_API_KEY=... node scripts/generate-blog-images.mjs --target=homepage      # homepage heroes
 *   GEMINI_API_KEY=... node scripts/generate-blog-images.mjs --target=all           # everything
 *   GEMINI_API_KEY=... node scripts/generate-blog-images.mjs --force                # overwrite existing
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { GoogleGenAI } from "@google/genai";

const BLOG_DIR    = path.resolve("content/blog");
const BLOG_IMG    = path.resolve("public/blog");
const HERO_IMG    = path.resolve("public/hero");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ---------------------------------------------------------------------------
// Base style - user's exact prompt with [SCENE] placeholder
// ---------------------------------------------------------------------------
const STYLE =
  "New Yorker editorial illustration meets Christoph Niemann and Owen Davey, [SCENE], confident clean linework with playful geometry, bold anchoring palette of deep navy and charcoal with warm amber golden yellow and burnt sienna accents glowing against it, terracotta and soft apricot midtones, clever visual metaphor, flat color fields with subtle grain texture, charming and optimistic tone, gentle humor, balanced negative space, soft rounded forms mixed with crisp angles, light-hearted storytelling, mid-century modern influence, risograph-inspired color overlaps, warm tones cradled in strong dark confident tones, inviting and assured, editorial warmth, soft paper texture, no text, no speech bubbles, no captions";

// ---------------------------------------------------------------------------
// Blog post prompts - hero + 2 section images per post.
// Each prompt opens with a colour accent note to vary the palette across posts.
// ---------------------------------------------------------------------------
const POST_PROMPTS = {

  // Accent: amber + golden yellow
  // Theme: 5 people doing the work of 50 via AI peers who carry your context
  "10x-team-ai-peers": {
    hero: "amber and golden yellow accents - a cheerful octopus-like figure seated at a single desk, each of its eight arms busy with a different task: one sketching a wireframe, one writing code, one building a prototype, one in a video call - all arms coordinated from one calm centre, the desk immaculate despite the parallel output",
    sections: [
      "golden yellow accent - a small team of five human silhouettes around a long table, but ten geometric AI companion forms seated beside each of them, the room twice as full as the headcount suggests, everyone contributing, the energy warm and productive",
      "amber accent - an org chart tree with a single root figure at the base, branches multiplying through AI nodes rather than human nodes, each branch reaching a finished output - the same root, ten times the reach",
    ],
  },

  // Accent: burnt sienna + terracotta
  // Theme: personal knowledge moat → company competitive moat, compounding like a fund
  "building-moat-at-scale": {
    hero: "burnt sienna and terracotta accents - a single small glowing coin dropped into a beautifully designed compounding machine, the output side producing an ever-growing architectural structure - one person's knowledge becoming a fortress that compounds, the machine elegant and satisfying in its geometry",
    sections: [
      "terracotta accent - a figure tending a single small plot, but the ground plan beneath their feet showing the same plot's footprint expanding outward in concentric rings like growth rings in wood - individual care becoming organisational scale",
      "burnt sienna accent - two fortresses side by side: one person-height, one skyscraper-height, a single bright thread connecting them showing they are built from the same material - the moat at different scales, the DNA identical",
    ],
  },

  // Accent: deep teal-navy + warm apricot
  // Theme: generic AI ships broken code; AI with your constraints ships code that belongs
  "coding-in-craft": {
    hero: "soft apricot and warm amber accents - a chef's hands guiding a cheerful robot arm to season a dish on a stove, the robot arm capable but the human hand shaping the exact gesture - the meal on the plate carrying the chef's specific flavour, not a generic recipe output",
    sections: [
      "apricot accent - a conveyor belt on the left producing hundreds of identical stamped metal parts; a workbench on the right where a single craftsperson shapes one object with total specificity - same category, completely different result",
      "amber accent - a figure holding a quality magnifier up to two identical-looking code outputs, one glowing warmly through the lens, one flat and grey - the difference only visible to a trained eye, but total",
    ],
  },

  // Accent: golden yellow + soft apricot
  // Theme: PM prompts Claude, copies to Notion, designer starts fresh - 3 isolated knowledge graphs
  "collaborative-spaces": {
    hero: "golden yellow and soft apricot accents - three glass bubbles side by side, each containing a person working in isolation, versus below them a single open flowing channel where the same three figures work together, their context and outputs streaming between them like a shared river",
    sections: [
      "golden yellow accent - a shared table where human and AI work materials overlap and interweave - documents, sketches, data flowing freely across the surface rather than being siloed at each seat",
      "apricot accent - a pipeline diagram: on the left, three dead-end buckets where context is poured in and never leaves; on the right, three connected vessels where knowledge flows continuously between them, each one fuller because of the others",
    ],
  },

  // Accent: rich amber + golden yellow
  // Theme: expertise illiquid, locked in your head - 10,000 hours → compounding deployable asset
  "monetise-your-expertise": {
    hero: "rich amber and golden yellow accents - a figure opening a glowing vault built into their own chest, carefully lifting out compressed geometric shapes that represent years of expertise - each shape placed into a sleek machine beside them that multiplies and distributes them outward as deployable assets",
    sections: [
      "amber accent - an hourglass where instead of sand, dense golden expertise flows down and is caught in a vessel that grows larger the more it receives - the compounding container, the bottom chamber twice the size of the top",
      "golden yellow accent - a single expert figure at the centre, their most valuable thought patterns radiating outward as identical portable geometric objects, each one now in different hands - the previously illiquid asset now freely circulating",
    ],
  },

  // Accent: deep navy + warm amber
  // Theme: career's worth of expertise locked in your head, inaccessible even to yourself
  "pillar-1-knowledge-management": {
    hero: "warm amber accents against deep navy - a figure standing beside an enormous glass vessel shaped exactly like a human head, and inside it building a beautiful organised library - shelves of ordered knowledge, clearly labelled, all the expertise that was always there now structured and retrievable",
    sections: [
      "amber accent - a before-and-after head: left side chaotic with tangled threads of unstructured expertise; right side the same head with elegant filing systems, connected nodes, clear pathways - the same knowledge, radically different access",
      "golden yellow accent - a uniquely cut key made from years of specific experience, its particular cut visible and distinct, fitting perfectly into a door lock that generic keys cannot turn - domain expertise as the precision instrument",
    ],
  },

  // Accent: burnt sienna + golden yellow
  // Theme: own your orchestration layer, swap tools overnight - vendors lock you in after 90 free days
  "pillar-2-hub-and-spoke": {
    hero: "burnt sienna and golden yellow accents - a figure at the calm centre of a beautifully designed wheel, the spokes extending outward each ending in a different tool shape - the figure confidently lifting one spoke out and sliding a new one in, the wheel still turning, the hub unchanged and fully in their control",
    sections: [
      "burnt sienna accent - two builders side by side: one whose tools are all chained together in an elaborate knot, frozen when one tool changes; one whose tools each clip independently to a single central belt, any one swappable in seconds",
      "golden yellow accent - a vendor lock-in diagram showing a figure surrounded by iron chains connecting to branded boxes, versus beside it a figure at the same centre with lightweight connector lines, each line detachable, the figure relaxed",
    ],
  },

  // Accent: warm amber + terracotta
  // Theme: 62% of day on context assembly - not thinking, deciding, creating - automation frees the mind
  "pillar-3-orchestration": {
    hero: "warm amber and terracotta accents - a conductor figure at a podium, baton raised, but instead of musicians: rows of cheerful filing cabinets, clocks, and status-update boxes all marching themselves through their work in coordinated sequence - the human freed entirely to conduct, not to carry",
    sections: [
      "amber accent - a knowledge worker's day shown as two river maps: left map a tangled delta where the worker is personally carrying buckets between every tributary; right map clean parallel channels connecting themselves, the worker standing at one clear decision point",
      "terracotta accent - a workflow as a cheerful assembly line of geometric shapes, each shape triggering the next automatically, a single human figure only at the start and the end - the middle running itself, the bottleneck permanently removed",
    ],
  },

  // Accent: terracotta + deep navy
  // Theme: AI amplifies doers 10x; gives talkers 10x more slide decks - $50K budget, 10% return
  "pillar-4-ai-native-teams": {
    hero: "terracotta and deep navy accents - two identical figures at identical starting blocks, each holding the same AI tool: one is already sprinting and halfway to the finish line with a trail of shipped products behind them; one is still at the block reading a thick manual, a growing stack of slide decks beside them",
    sections: [
      "terracotta accent - two figures given identical glowing AI orbs: one figure's orb powers a tower of shipped products growing beside them; the other figure's orb powers a tower of meeting notes and presentation decks - same tool, different amplification",
      "deep navy accent - a magnifying glass over a team of ten figures: three are glowing brightly, actively in motion; five are dimly lit; two are entirely grey and still - the energy distribution of a team that hasn't cracked adoption, visible at a glance",
    ],
  },

  // Accent: golden yellow + soft apricot
  // Theme: automation vs elevation - using AI to do your job vs using AI to become something new
  "pillar-5-performance-standards": {
    hero: "golden yellow and soft apricot accents - two figures at identical desks with identical AI tools glowing beside them: the left figure hunched over doing the same small task faster and faster on a treadmill going nowhere, the right figure standing tall using the AI as a telescope looking far beyond the desk into a vast landscape of new possibilities, the contrast between compression and expansion, between automation and elevation",
    sections: [
      "golden yellow accent - an organisation shown as a building cross-section: the bottom floors are automated conveyor belts running themselves efficiently, but the top floors are wide open creative studios where small teams of humans work on expansive ambitious projects that fill the walls - the automation below freeing the elevation above, the building thriving because both exist",
      "apricot accent - two paths diverging from the same starting point: the left path flat and fast with a figure sprinting but the horizon staying the same distance away, the right path climbing upward with a figure moving steadily but the horizon expanding with every step revealing new territory below - the automation path is faster, the elevation path is compounding",
    ],
  },

  // Accent: burnt sienna + amber
  // Theme: decision debt - teams ship in weeks vs quarters by eliminating dead time between decisions
  "speed-to-market": {
    hero: "burnt sienna and amber accents - two identical hourglasses side by side: one has a thick knot in the neck where sand piles up and waits - brief not final, designs not reviewed, engineering blocked - the other has no knot, sand flowing freely and fast - the only difference is the bottleneck, and one team removed it",
    sections: [
      "amber accent - a figure standing at the edge of a gap that is visibly shrinking as decisions are made - each decision a plank appearing across it - the gap as decision debt dissolving in real time when choices happen",
      "burnt sienna accent - two timelines side by side: a long winding road studded with waiting gates each burning a quarter of time; and a short direct line where the gates have been replaced with instant green-lights - same destination, radically compressed journey",
    ],
  },

  // Accent: soft apricot + deep navy
  // Theme: AI memo sounds generic - your judgment, taste, pattern recognition are the missing ingredient
  "taste-through-ai": {
    hero: "soft apricot and deep navy accents - a figure pressing their distinctive stamp - engraved with years of specific taste and conviction - into a large blank surface that then expands outward in all directions, every inch carrying that specific mark, the stamp small, the reach enormous",
    sections: [
      "apricot accent - two AI outputs side by side: left one flat, uniform, beige - the McKinsey intern with no conviction; right one warm, textured, carrying a specific colour and signature - the same AI, but the right one has been loaded with someone's actual taste",
      "deep navy accent - a figure's unique fingerprint being used as a quality control stamp on a long production line of outputs - each one checked against the fingerprint, the ones that don't match the standard set aside - taste as a precision instrument at scale",
    ],
  },

  // Accent: warm amber + deep navy
  // Theme: widening your personal context window - consulting endless perspectives to shape better decisions
  "widen-your-context-window": {
    hero: "warm amber and deep navy accents - a figure standing at the centre of an enormous circular lens or aperture that is opening wider and wider, and through the widening opening a vast landscape of different knowledge domains becomes visible - books, data, faces, patterns, disciplines - all flowing inward toward the figure who stands calm and focused at the centre, the wider the lens the richer the view, the figure's posture one of quiet command over an expanding world of insight",
    sections: [
      "amber accent - two decision-making scenes side by side: on the left a figure looking through a narrow keyhole seeing only a tiny slice of a vast room beyond; on the right the same figure with the wall removed entirely, seeing the full room with all its detail and connections - the same person, radically different visibility, the wide-view figure pointing confidently at something the keyhole figure could never have seen",
      "deep navy accent - a figure at the centre of a constellation of glowing orbiting spheres, each sphere a different colour representing a different knowledge domain - psychology, economics, engineering, design, medicine - all connected by fine threads to the central figure who synthesizes them into one coherent view, the constellation beautiful and balanced, the synthesis visible as a warm glow at the centre",
    ],
  },

  // Accent: amber + terracotta
  // Theme: specificity is the asset - your craft/domain expertise makes you irreplaceable, not generic
  "you-are-not-generic": {
    hero: "amber and terracotta accents - a crowd of cheerful identical circular figures, and one figure that is a completely distinct geometric shape - not taller, not louder, just differently and precisely formed - fitting perfectly through an opening in a wall ahead that the circles cannot pass through, the shape advantage total and quiet",
    sections: [
      "amber accent - a figure holding a uniquely cut key beside a door, while a pile of generic skeleton keys lies uselessly on the floor around it - the specific key shaped for this specific lock, domain expertise as the precision cut that generic competence cannot replicate",
      "terracotta accent - two job candidates shown as geometric compositions: one built from identical interchangeable blocks available anywhere; one built from a specific configuration of rare shapes that creates a unique and valuable form - the difference between commodity and craft",
    ],
  },

};

// ---------------------------------------------------------------------------
// Homepage hero prompts - one per rotating role
// ---------------------------------------------------------------------------
const HOMEPAGE_PROMPTS = {
  "founder.png":
    "amber and golden yellow accents - a solitary figure standing on a small hill with a single blueprint rolled under one arm, surveying a wide open landscape ahead - the landscape empty and full of possibility, the figure calm and ready, the optimism of someone at the very start of something they intend to build",

  "product-builder.png":
    "burnt sienna and warm amber accents - a figure in mid-gesture, reaching up to click the final geometric piece into a floating construction that is almost complete - the pieces fitting together with satisfying precision, the whole structure becoming coherent in the moment, the joy of assembly visible in the posture",

  "design-engineer.png":
    "soft apricot and terracotta accents - a figure with one hand sketching a shape on paper and the other hand simultaneously reaching into space to pull that same shape into a three-dimensional built object - the drawing and the building the same unbroken gesture, no handoff, no gap",

  "solo-operator.png":
    "golden yellow and deep navy accents - a figure at the calm centre of a beautifully ordered solar system, each planet a different operation or system running smoothly in orbit - the figure not chasing any of them, everything within reach from one still point, the whole system elegant and self-sustaining",

  "technical-leader.png":
    "warm amber and charcoal accents - a figure at a whiteboard covered in a single clear elegant diagram, three smaller figures behind them leaning in with expressions of visible understanding - the clarity on the board doing the work of leadership, the diagram making the complex simple for everyone in the room",

  "creative-director.png":
    "terracotta and soft apricot accents - a figure holding a small frame or viewfinder through which a wide spread of different creative works becomes one coherent vision - the many works outside the frame varied and different, inside the frame unified and purposeful, the editorial eye as the thing that makes the whole",

  "vibe-coder.png":
    "deep navy and amber accents - a figure in an easy relaxed posture at a laptop, geometric shapes and patterns assembling themselves organically in the air around them like plants growing - the code alive and ambient, the work happening in the space around the maker, creativity in a state of effortless flow",
};

// ---------------------------------------------------------------------------
// Generate a single image and save it
// ---------------------------------------------------------------------------
async function generateImage(scene, outputPath, force = false) {
  if (!force && fs.existsSync(outputPath)) {
    console.log(`  ⏭  Skipping (exists): ${path.basename(outputPath)}`);
    return true;
  }

  const prompt = STYLE.replace("[SCENE]", scene);
  console.log(`  🎨 Generating: ${path.basename(outputPath)}`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: { responseModalities: ["TEXT", "IMAGE"] },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        const buf = Buffer.from(part.inlineData.data, "base64");
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, buf);
        console.log(`  ✅ Saved: ${path.basename(outputPath)} (${(buf.length / 1024).toFixed(0)} KB)`);
        return true;
      }
    }
    console.log(`  ⚠️  No image returned for ${path.basename(outputPath)}`);
    return false;
  } catch (err) {
    console.error(`  ❌ Error: ${err.message?.slice(0, 200)}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Update markdown frontmatter with heroImage (only if not already set)
// ---------------------------------------------------------------------------
function updateFrontmatter(slug) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  if (data.heroImage) return;
  data.heroImage = `/blog/${slug}/hero.png`;
  fs.writeFileSync(filePath, matter.stringify(content, data));
  console.log(`  📝 Frontmatter updated: ${slug}`);
}

// ---------------------------------------------------------------------------
// Generate all blog post images
// ---------------------------------------------------------------------------
async function generateBlogImages(targetSlug, force) {
  const slugs = targetSlug
    ? [targetSlug]
    : fs.readdirSync(BLOG_DIR).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, ""));

  console.log(`\n🖼  Blog images - ${slugs.length} post(s)\n`);

  for (const slug of slugs) {
    const prompts = POST_PROMPTS[slug];
    if (!prompts) { console.log(`⚠️  No prompts for "${slug}" - skipping`); continue; }

    console.log(`\n📄 ${slug}`);

    const ok = await generateImage(prompts.hero, path.join(BLOG_IMG, slug, "hero.png"), force);
    for (let i = 0; i < prompts.sections.length; i++) {
      await generateImage(prompts.sections[i], path.join(BLOG_IMG, slug, `section-${i + 1}.png`), force);
    }
    if (ok) updateFrontmatter(slug);

    await new Promise(r => setTimeout(r, 2000));
  }
}

// ---------------------------------------------------------------------------
// Generate homepage hero images
// ---------------------------------------------------------------------------
async function generateHomepageImages(force) {
  console.log(`\n🏠 Homepage hero images - ${Object.keys(HOMEPAGE_PROMPTS).length} images\n`);
  fs.mkdirSync(HERO_IMG, { recursive: true });

  for (const [filename, scene] of Object.entries(HOMEPAGE_PROMPTS)) {
    await generateImage(scene, path.join(HERO_IMG, filename), force);
    await new Promise(r => setTimeout(r, 2000));
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const slugArg  = args.find(a => a.startsWith("--slug="))?.split("=")[1];
  const target   = args.find(a => a.startsWith("--target="))?.split("=")[1] ?? "blog";
  const force    = args.includes("--force");

  if (target === "homepage") {
    await generateHomepageImages(force);
  } else if (target === "all") {
    await generateBlogImages(slugArg, force);
    await generateHomepageImages(force);
  } else {
    await generateBlogImages(slugArg, force);
  }

  console.log("\n✅ Done!\n");
}

main().catch(console.error);

# Design: "Stop Picking AI Tools. Start Building the Foundations." (article)

**Date:** 2026-05-26
**Author:** Michael Van Havill (with Claude)
**Slug:** `ai-leadership-foundations`

## Goal

Add a new blog post to the 100x Path site arguing that AI leadership rests on three foundational investments - the knowledge layer, token costs, and token value - and that most leaders are picking tools instead of laying foundations. The article ships with the same scaffolding every existing article has: persona variants, illustrations, homepage Learn Paths entry, and chapter theming.

## Scope

Add one new article end-to-end. Specifically:

1. Markdown article at `content/blog/ai-leadership-foundations.md`
2. Persona variants JSON at `content/blog/generated/ai-leadership-foundations.json` (9 personas)
3. Three illustrations rendered into `public/blog/ai-leadership-foundations/` (`hero.png`, `section-1.png`, `section-2.png`)
4. Image prompts wired into `scripts/generate-blog-images.mjs` so the existing generation script produces the images
5. A `LEARN_PATHS` entry in `src/lib/constants.ts` so the article appears on the homepage Learn section

No new components, routes, or rendering logic. The article uses the existing article rendering pipeline.

## Out of scope

- Generating the illustrations in this branch (requires `GEMINI_API_KEY`; the user runs the generation script when ready). The prompts are wired up; the actual PNGs are produced separately.
- Any updates to other articles, the homepage, or rendering components.
- SEO metadata beyond what the existing frontmatter already supports.

## Frontmatter

```yaml
title: Stop Picking AI Tools. Start Building the Foundations.
titleHighlight: Building the Foundations
slug: ai-leadership-foundations
theme:
  - scale
  - ai-teams
description: AI leadership rests on three foundational investments - knowledge, token costs, and token value. Most leaders are picking tools and ignoring the soil underneath.
date: 2026-05-26T00:00:00.000Z
author: 100xpath
tags:
  - AI leadership
  - knowledge layer
  - token economics
  - governance
  - operating model
heroImage: /blog/ai-leadership-foundations/hero.png
```

- `titleHighlight` is rendered as a colored highlight band on the article page (see `src/app/blog/[slug]/page.tsx:105`).
- Primary theme `scale` drives the page accent color (deep mauve `#8A3A5C` via `THEME_COLORS` in `src/lib/constants.ts:165`).
- Secondary theme `ai-teams` adds a second badge above the title.

## Article body structure

The body uses the user's draft verbatim where possible (preserving voice), with the connective tissue that the existing articles use. All em dashes are replaced with hyphens per `CLAUDE.md`.

1. **Intro paragraphs** - "So many of us are doing this wrong..." through the three-investments thesis. User's words.
2. **ASCII diagram** (one block, like `content/blog/10x-team-ai-peers.md` lines 28-79) showing the three foundations side-by-side, the soil beneath them, and the bloom above. Used as a visual anchor for the thesis.
3. **`## The Knowledge Layer`** - Full knowledge layer section from the draft, including the leadership-job paragraph about capturing knowledge into a single access layer.
4. **Section image 1** (`/blog/ai-leadership-foundations/section-1.png`) inline at this break.
5. **`## Token Costs`** - Full token costs section, including the whiplash and flying-blind paragraphs.
6. **`## Token Value`** - Full token value section, including the "expensive vibes" and "$1K deal of the century" paragraphs.
7. **Section image 2** (`/blog/ai-leadership-foundations/section-2.png`) inline at this break.
8. **`## Strong Soil, Thousand Flowers`** - Closing section. Opens with "Build these foundations and you're laying down strong soil. The ever-changing AI landscape will bloom a thousand flowers in it." Then the user's "If I were starting tomorrow" leader-ownership recipe (one leader per investment).
9. **`## Ask Yourself`** - 5-6 leadership-diagnostic questions matching the pattern in `content/blog/10x-team-ai-peers.md` lines 187-202. Each question is bold, followed by a 1-2 sentence elaboration, with cross-links into related learning paths (`/blog/pillar-1-knowledge-management`, `/blog/pillar-3-orchestration`, `/blog/pillar-2-hub-and-spoke`).
10. **Connected learning paths** below a `---` divider - bulleted cross-links to three pillar articles. Matches the pattern at the bottom of every existing article.
11. **Final beat** - The user's closing question: "What are you doing in your business to build these foundations?" Set as the last paragraph above the connected-learning-paths divider.

### Voice constraints

- Replace every em dash (`-`) with a hyphen (`-`) per `CLAUDE.md`.
- Match the MVH voice from `content/STYLE-GUIDE.md`: lead with the conclusion, specific numbers where the user gave them, 2-4 sentence paragraphs, no academic hedging, no corporate speak.
- Preserve the user's exact phrasing for the high-conviction lines: "race to be like everyone else," "1% AI-infused business," "siloed knowledge is useful, but it holds back the true value," "budget surprise waiting to happen," "stop reacting and start placing real bets," "whiplash. Underspend. Overspend. Pull back. Underspend again. Over and over.", "flying blind on a spend line that only gets bigger," "expensive vibes," "deal of the century or a waste of money," "What counts as value is a call only leadership can make. If you don't make it, your teams are guessing. And you're paying for the guesses.", "AI will transform your business, but only if you can be more and more precise with where you fund the investments and the adventures.", "laying down strong soil," "bloom a thousand flowers."

## Illustrations

Three images in the existing New Yorker / Christoph Niemann / Owen Davey editorial style defined in `scripts/generate-blog-images.mjs` lines 28-29. Color accent: **burnt sienna + warm amber** (coherent with the Scale chapter but distinct from `pillar-2-hub-and-spoke`'s burnt-sienna + golden-yellow combo).

### Hero

> burnt sienna and warm amber accents - a leader figure kneeling on rich dark soil, carefully placing three large geometric foundation stones into the earth in front of them, while above the stones a vivid garden of varied geometric blooms is just beginning to flourish - the foundations precede the flourishing, the leader's posture quietly deliberate, the contrast between hidden foundation work below and visible bloom above made plain, no people in the bloom, the focus on the deliberate placement of the three stones

### Section 1 (after Knowledge Layer)

> warm amber accent - a grand central well or reservoir built from interlocking knowledge-shaped blocks contributed by every team, with small figures around its rim lowering buckets in and pulling out glowing structured insights - the contributions flowing inward and the access flowing outward in one continuous gesture, the single access layer made visible, every team's contribution visibly distinct yet part of the same coherent vessel

### Section 2 (after Token Value)

> burnt sienna accent - a pair of beautifully calibrated scales: on one side a precise stack of glowing tokens or coins, on the other a constellation of varied business outcomes - a shipped product, a closed deal, a satisfied customer, a finished blueprint - the scale perfectly level, a leader's hand resting on the fulcrum, the math finally legible, the relationship between spend and outcome clear and balanced

### Wiring

Add a new `"ai-leadership-foundations"` entry to the `POST_PROMPTS` object in `scripts/generate-blog-images.mjs` (around line 35), preserving the existing accent-color comment pattern. The user runs `GEMINI_API_KEY=... node scripts/generate-blog-images.mjs --slug=ai-leadership-foundations` to render the images.

## Persona variants JSON

Generate `content/blog/generated/ai-leadership-foundations.json` matching the structure of `content/blog/generated/taste-through-ai.json` (the reference cited in `scripts/generate-article-variants.md`).

- All 9 personas: `general`, `founder`, `product-builder`, `product-designer`, `design-engineer`, `solo-operator`, `technical-leader`, `creative-director`, `vibe-coder`.
- Each persona's `sections` array alternates WHY blocks (short, punchy narrative, ~40-50% of original length) with METHOD blocks (detailed how-to shown in modals).
- Target 3-5 METHOD blocks per persona.
- Persona framing follows the guide in `scripts/generate-article-variants.md` lines 22-32. For this article specifically:
  - `general` - broad: any leader trying to set AI direction
  - `founder` - investor optics, capital efficiency, board-level reporting on AI spend
  - `product-builder` - product team knowledge bases, token spend per feature, value per shipped experiment
  - `product-designer` - design system as part of the knowledge layer, token spend on design exploration
  - `design-engineer` - code + design knowledge unified, token spend per shipped component
  - `solo-operator` - one-person leadership: you ARE the three role-owners, leaner version
  - `technical-leader` - architecture knowledge, infra token costs, value attribution to engineering work
  - `creative-director` - brand and voice as the knowledge layer, token spend on creative exploration
  - `vibe-coder` - personal knowledge base, indie token economics, value as joy + shipped projects
- All METHOD blocks include a `triggerText` (the link text that opens the modal) and a `title`.
- No em dashes anywhere - hyphens only.

## Homepage Learn Paths entry

Add an entry to `LEARN_PATHS` in `src/lib/constants.ts` (the array starting at line 211). The entry uses the same shape as the existing entries:

```ts
{
  title: "Picking tools while ignoring the foundations? Build the soil that lets AI bloom across your business.",
  description: "Career: leaders who set AI direction get promoted past leaders who just pick vendors. Team: a single knowledge access layer plus clean token tracking replaces guesswork with judgment. Business: AI spend converts into measurable outcomes instead of expensive vibes.",
  themes: ["scale", "ai-teams"],
  primaryTheme: "scale",
  slug: "ai-leadership-foundations",
},
```

Position: top of the Scale-primary cluster (between `pillar-2-hub-and-spoke` and `building-moat-at-scale`) so it reads as a leadership-foundations gateway into the rest of the chapter.

## File checklist

- [ ] `content/blog/ai-leadership-foundations.md` (new)
- [ ] `content/blog/generated/ai-leadership-foundations.json` (new, 9 personas)
- [ ] `scripts/generate-blog-images.mjs` (add POST_PROMPTS entry)
- [ ] `src/lib/constants.ts` (add LEARN_PATHS entry)
- [ ] `docs/superpowers/specs/2026-05-26-ai-leadership-foundations-design.md` (this file)

No image PNGs in this branch - the user generates them by running the existing script with their `GEMINI_API_KEY`.

## Verification

- Run `npm run dev` (which runs `next dev` per `package.json`) and navigate to `/blog/ai-leadership-foundations`. The article should render with:
  - Scale chapter mauve accent color applied to the title highlight and other accent slots
  - Scale + AI + Human Teams theme badges above the title
  - Hero image visible (after the user generates images)
  - Persona toggle visible and switching between personas changes the body content
  - METHOD sections expanding into modals
- Homepage Learn section shows the new article card in the Scale cluster with the right description.

## Risks

- The user's draft mentions "If I were starting tomorrow, I'd run it like this. One leader owns the knowledge layer..." That is the closing recipe and it's strong. Risk is making the rest of the article match that strength - the body needs to earn the closing punch.
- Token-economics terminology ("token costs," "token value") is intentional and load-bearing. Risk is softening it into vaguer "AI costs / AI ROI" language; do not.
- The article is meta-leadership content (about how to LEAD AI usage). It should not drift into being another tactical "how to build a knowledge base" article - that's `pillar-1-knowledge-management`'s job. Cross-link to it instead.

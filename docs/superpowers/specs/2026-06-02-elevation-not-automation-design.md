# Spec: "The Path to the Work You Can't Yet See" (elevation-not-automation)

Approved design for a new blog post extending `pillar-5-performance-standards`.

## Thesis
Most people aim AI at automation (what to cut/remove). That is ~10-20% of the value and the hardest part to get to production. The real 80% is elevation - doing work your role never contained, and, the rarer/bigger move, redrawing the assumptions about what is possible at all. The hardest and most valuable skill is finding your unknown unknowns: capabilities you do not realize you are limiting.

## Differentiation from Pillar 5
Pillar 5 already owns "Don't just automate. Elevate." This piece is the deep-dive companion. Its distinct spine is the **unknown unknowns / "box of the possible"** frame, plus material Pillar 5 lacks: the 10-20% quantification, the build-software unlock, the industrial woodworking example, and a practical method for surfacing frozen assumptions.

## Controlling metaphor
Everything you believe you can do sits inside a box drawn by old constraints. Automation polishes the inside. Elevation redraws the walls. The highest-value wall is the one you can't see because it has never moved, so you mistake it for physics.

## Frontmatter
- title: The Path to the Work You Can't Yet See
- titleHighlight: Work You Can't Yet See
- slug: elevation-not-automation
- theme: [ai-teams, build-your-moat]; primaryTheme ai-teams (blue, differentiates from Pillar 5 green; fits "cap on ambition")
- date: 2026-06-02
- tags: [elevation, automation, AI strategy, capability expansion, what's possible]
- heroImage: /blog/elevation-not-automation/hero.png

## Section flow (linear essay)
1. Opening: the wrong first question; 10-20% and hardest to ship; the box frame.
2. ASCII diagram (house style): automation vs elevation value split + box-of-the-possible.
3. Automation Is the Small, Hard Game - bounded by current process; asymmetry (capped+costly vs small-downside+uncapped).
4. Elevation Is Two Moves - do more/higher (Pillar 5 territory, linked) vs redraw assumptions (the bigger move).
5. What Elevation Looks Like in a Single Day - doctor & care team; assumption-break re "specialist referral". [section-1.png]
6. When the Whole Business Fits in the Context Window - 6-person team summons cross-domain proposals; what is the business/org chart for?
7. You Can Build Software Now - the biggest assumption made optional; woodworking factory centerpiece (faithful composite, no invented numbers/names). [section-2.png]
8. The Hardest Skill: Finding Your Unknown Unknowns - hunt-list (language of surrender; humans as glue; free-constraint question; audit tools for frozen assumptions; borrow other disciplines' impossible; do it on a schedule) + inspirational close.
9. Ask Yourself - 6 questions, cross-linked.
10. CTA section: Pillar 5, widen-your-context-window, pillar-1-knowledge-management, speed-to-market.

## Voice
House Chamath-style register per content/STYLE-GUIDE.md. Hyphens not em dashes (CLAUDE.md). 2-4 sentence paragraphs, lead with conclusions, concrete numbers, premise reframing, asymmetry/compounding/agency lenses. ~3,000-3,500 words.

## Wire-in (full, this session)
1. content/blog/elevation-not-automation.md
2. LEARN_PATHS entry in src/lib/constants.ts, placed after the pillar-5 entry. Hook: "Pointing AI only at what to cut? Aim it at the work you don't yet know you can do." + Career/Team/Business description.
3. content/blog/generated/elevation-not-automation.json - 9 persona variants (general, founder, product-builder, product-designer, design-engineer, solo-operator, technical-leader, creative-director, vibe-coder), WHY/METHOD structure, derived from the finalized article. Reference: generated/taste-through-ai.json.
4. public/blog/elevation-not-automation/ with hero.png + section-1.png + section-2.png placeholders; real art via scripts/generate-blog-images.mjs (Gemini key) as follow-up.

## Verification
Run the dev server and confirm /blog/elevation-not-automation renders (frontmatter, ASCII colorized, images, Ask Yourself, CTA) and appears in the homepage /#learn list.

# Spec: "Your Ambition Is Your New Moat" (your-ambition-is-your-moat)

Approved design for a new blog post that sits between `elevation-not-automation` (the ceiling-finding deep dive) and `pillar-5-performance-standards` / `building-moat-at-scale` (the moat thesis).

## Thesis
The grinding daily execution of knowledge work is now largely assistable by AI, which frees professionals to operate at the "top of their license." But execution speed stops being the differentiator once everyone has the same models. The bottleneck moves to ambition: the capacity to find and break the limits you've placed on yourself, your team, your discipline, and your outputs - known and unknown. The new race is (a) building AI-infused coworkers that absorb the grind and (b) conceiving new ceilings worth aiming at. Ambition becomes the scarce, defensible asset when capability is commoditized.

## Differentiation from siblings
- `elevation-not-automation` owns the "box of the possible / unknown unknowns" method for finding walls. This piece is upstream of it: it argues *why* ambition (not execution) is now the moat, using the labor-economics evidence, and treats finding-your-ceilings as the new competitive race. Where elevation gives the hunting method, this gives the strategic case and the taxonomy of limits.
- `pillar-5-performance-standards` owns "become the operator who sets the new bar." This piece names the underlying scarce asset (ambition) and grounds it in research (top-of-license, comparative advantage, goal-setting theory, theory of constraints).
- Cross-link all three rather than overlap.

## Controlling idea
When a capability becomes abundant, value migrates to its scarce complement. Execution just became abundant. The scarce complement is the ambition to aim higher - to see and break the ceilings everyone else still treats as fixed.

## Sourced material (all verified; cite inline by name, no footnotes)
- Top-of-license: introduced ~2013 in nursing, from the IOM 2010 "Future of Nursing" call to practice "to the full extent of education and training." (PubMed scoping review)
- Brynjolfsson, Li & Raymond, "Generative AI at Work" (NBER 2023): 5,179 support agents, +14% avg, +34% for novices, minimal for top performers - AI flattens the execution-skill gap.
- Klarna (Feb 2024, OpenAI): assistant did the work of ~700 agents, 2/3 of chats, 11min -> <2min; by 2025 reintroduced humans for complex cases (automation's ceiling).
- Anthropic Economic Index (2025): augmentation > automation share of Claude conversations (~52/45 Nov 2025) - AI mostly a complement.
- Cursor / Anysphere: fastest B2B software 0 -> $2B ARR (~3 yrs), low-hundreds headcount, ~$6.7M revenue/employee - redrew what an editor is.
- Midjourney: bootstrapped, $0 VC, dozens of people, hundreds of millions in revenue - small team redrew image creation.
- Locke & Latham goal-setting theory: specific+difficult goals beat "do your best" in ~90%+ of 35 yrs of studies; performance rises with difficulty up to the limit of ability. AI moves that ability limit.
- Goldratt, Theory of Constraints: throughput is set by the binding constraint; elevate it and a new one appears. Execution was the constraint; ambition is the next.
- James Bessen's ATM/teller observation: automating a task moved tellers up-license rather than eliminating them.

## Frontmatter
- title: Your Ambition Is Your New Moat
- titleHighlight: Ambition
- slug: your-ambition-is-your-moat
- theme: [build-your-moat, ai-teams]; primaryTheme build-your-moat (green - it is a moat piece)
- date: 2026-06-08
- tags: [ambition, top of license, AI strategy, judgment, competitive moat]
- heroImage: /blog/your-ambition-is-your-moat/hero.png

## Section flow (linear essay, 1,400-1,900 words)
1. Open: the grind is now assistable - name the shift and the question it leaves.
2. ASCII diagram (house style): execution becomes abundant -> bottleneck moves to ambition.
3. Top of your license - define it (nursing origin), why reaching it is necessary but not sufficient.
4. The turn: when execution is abundant, the scarce complement is ambition (comparative advantage, theory of constraints, goal-setting ceilings). [section-1.png]
5. Taxonomy of limits worth challenging: self / team / discipline / outputs; known vs unknown.
6. The two moves that win the race: (a) build AI-infused coworkers, (b) conceive new ceilings. [section-2.png]
7. Why ambition is a moat - scarce, non-purchasable, compounding, hard to copy.
8. Stakes + close: best roles, best teams, outperforming peers; land the title; one thing to do differently.
9. Ask Yourself - 5-6 cross-linked questions.
10. CTA section: elevation-not-automation, pillar-5-performance-standards, building-moat-at-scale, widen-your-context-window.

## Voice
House MVH register per content/STYLE-GUIDE.md, blended with the brief's "senior strategy essayist." Hyphens, never em dashes (CLAUDE.md). Lead with conclusions, concrete numbers, premise reframes, compounding/asymmetry lenses. No FAQ/takeaways box.

## Wire-in (full, this session)
1. content/blog/your-ambition-is-your-moat.md
2. LEARN_PATHS entry in src/lib/constants.ts, placed after the elevation-not-automation entry.
3. content/blog/generated/your-ambition-is-your-moat.json - 9 persona variants (general, founder, product-builder, product-designer, design-engineer, solo-operator, technical-leader, creative-director, vibe-coder), WHY/METHOD structure, derived from the finalized article. Reference: generated/taste-through-ai.json.
4. scripts/generate-blog-images.mjs POST_PROMPTS entry + generated hero/section-1/section-2 art via Gemini.
5. PERSONA_CONTENT (persona-content.ts): intentionally omitted, matching the four most recent articles (elevation, monetise, widen, ai-leadership-foundations) which skip it. PersonaPathway degrades to null cleanly.

## Verification
Run dev server; confirm /blog/your-ambition-is-your-moat renders (frontmatter, badges, hero, ASCII colorized, persona selector + variants, section images in fallback, Ask Yourself, CTA) and appears in the homepage /#learn list.

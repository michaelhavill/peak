# Generate Article Variants

Run this in Claude Code when you add a new blog post.

## Usage

```
claude "Read content/blog/NEW-SLUG.md and generate a persona-variants JSON file at content/blog/generated/NEW-SLUG.json following the exact structure of the existing generated files. Use content/blog/generated/taste-through-ai.json as a reference for format. The 8 personas are: general, founder, product-builder, design-engineer, solo-operator, technical-leader, creative-director, vibe-coder. Restructure the article into WHY sections (short, compelling narrative) alternating with METHOD sections (detailed how-to in modals). Aim for 3-5 methods per persona. Never use em dashes. Use hyphens instead."
```

## What it does

1. Reads the new markdown article
2. Generates 8 persona-specific variants
3. Each variant splits the content into:
   - **WHY sections**: Short, punchy narrative (40-50% of original length) - what readers see inline
   - **METHOD sections**: Detailed how-to content shown in modals with consultation form
4. Writes the JSON to `content/blog/generated/{slug}.json`

## Persona framing guide

| Persona | Frame around... |
|---------|----------------|
| general | Broad examples, universal applicability |
| founder | Strategy, fundraising, competitive moats, team building |
| product-builder | Product decisions, user research, prioritization, shipping |
| design-engineer | Design systems, craft quality, visual taste, code aesthetics |
| solo-operator | Efficiency, bootstrapping, wearing all hats, leverage |
| technical-leader | Architecture, team scaling, tech debt, engineering culture |
| creative-director | Brand, voice, visual identity, creative process |
| vibe-coder | Side projects, experimentation, indie hacking, creative coding |

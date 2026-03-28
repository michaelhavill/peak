---
title: Walk the Path to Code That Carries Your Craft
titleHighlight: Carries Your Craft
slug: coding-in-craft
theme:
  - craft-and-taste
  - ship-faster
description: >-
  Generic AI ships generic code. AI with your stack constraints, patterns, and
  quality bar ships code that works in your reality.
date: 2026-03-28T00:00:00.000Z
author: 100xpath
tags:
  - engineering
  - code quality
  - craft
  - AI coding
  - developer workflow
heroImage: /blog/coding-in-craft/hero.png
---

Most AI-generated code is dead on arrival. Copilot autocompletes a function, the code compiles, and then your senior engineer spends 15 minutes fixing it -- wrong naming conventions, a pattern you deprecated last quarter, zero awareness of the shared utility that already does the same thing. Multiply that by every engineer, every day, across your entire org. That is insanity.

Here's the thing. **The gap between 60% acceptance rate and 95% acceptance rate is not an AI capability problem -- it's a context deployment problem.** AI that doesn't know your codebase ships code that breaks on contact with your reality. AI that carries your constraints, your patterns, your scars? It ships code that belongs — because it's building with you, not instead of you. Your knowledge store and your ongoing judgment are what make AI an extension of your engineering craft. You're not outsourcing code quality. You're amplifying it. Full stop.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ● COPILOT WITHOUT YOUR CONTEXT        ● AI WITH YOUR ENGINEERING CONTEXT       │
│                                                                                 │
│  Autocomplete suggests:                Context package loaded:                  │
│                                                                                 │
│  function getUser(id) {                ┌──────────────────────────┐             │
│    // generic pattern                  │ YOUR CODEBASE REALITY    │             │
│    // wrong naming convention          │                          │             │
│    // deprecated approach              │ Architecture patterns    │             │
│    // reinvents existing util          │ Naming conventions       │             │
│  }                                     │ Shared utilities         │             │
│                                        │ Deploy constraints       │             │
│  You accept it.                        │ Anti-patterns (scars)    │             │
│  Then spend 15 min fixing              │ "Never do X because..."  │             │
│  it to match your standards.           └──────────┬───────────────┘             │
│  × every engineer × every day.                    ↓                             │
│                                                                                 │
│  Acceptance rate: 60%                  Code uses your patterns.                 │
│                                        Respects your conventions.               │
│                                        Knows about shared utils.                │
│                                        Follows your deploy rules.               │
│                                                                                 │
│                                        Acceptance rate: 95%                     │
│                                                                                 │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                                                                 │
│  CAREER IMPACT                         CAREER IMPACT                            │
│  You're a human linter.               You're the person who built               │
│  Catching AI mistakes all day.         the context that makes                   │
│  AI creates work instead of            everyone's AI smarter.                   │
│  saving it.                            Code review is about ideas,              │
│  ░░░░░░░░░░░░░░░░░░░░                 not style fixes.                          │
│                                        ████████████████████                     │
│                                                                                 │
│  BUSINESS IMPACT                       BUSINESS IMPACT                          │
│  Code review: 2 days avg.             Code review: 4 hours avg.                 │
│  Senior engineers spend 30%            Juniors write idiomatic code             │
│  of time on pattern violations.        in week 1, not month 3.                  │
│  Onboarding: 3 months.                Onboarding: 2 weeks.                      │
│  ░░░░░░░░░░░░░░░░░░░░                 ████████████████████                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

<!-- toggle: individual -->

## The 100x Individual

Your engineering craft is not knowing how to code. It's knowing how to code *in this codebase*, with *these constraints*, for *these users*. That specificity is your edge -- and it's exactly what generic AI tools throw away. They're playing poker without looking at the board.

The fix is building an engineering context package. Not a "best practices" wiki that nobody reads -- a deployable artifact that encodes your team's reality.

**How to build your context package in 30 minutes:** Create a `CLAUDE.md` file in the root of your repo — Claude Code reads this automatically before every interaction. Or create a `.cursorrules` file if you use Cursor. Write 5 sections covering: (1) how your system is wired, (2) what you call things, (3) what utilities already exist, (4) what your deploy pipeline needs, (5) what broke production and why. Be specific — not "use good naming" but "services are named by verb, e.g. `processPayment`, not `PaymentProcessor`." Commit it to the repo. Every AI interaction now respects your reality.

Five things matter:

1. **Architecture patterns** -- how your system is actually wired, not how a textbook says it should be
2. **Naming conventions** -- what you call things and why, so AI stops inventing its own vocabulary
3. **Shared utilities** -- the stuff that already exists, so AI stops reinventing wheels at $200/hour
4. **Deployment constraints** -- what your pipeline can and can't handle
5. **The anti-patterns** -- the scars. The things that broke production and the postmortems that taught you why

Look -- the ROI on this is not subtle. An **engineering lead** built a context doc covering his team's patterns -- state management, API conventions, component standards, and the 5 things you never do. Connected it to Claude Code via MCP. Acceptance rate jumped from 60% to 95%. Do the math on that. If your team has 8 engineers generating 20 suggestions per day, and each rejected suggestion costs 15 minutes of senior time to fix -- that's 35% fewer rejections times 160 daily suggestions times 15 minutes. You're recovering 14 hours of senior engineering time per day. At blended cost, that's $2,800/day back in your pocket. From a document.

A **founder/CTO** encoded his startup's constraints -- deploy pipeline, database conventions, API versioning, and the 3 services that absolutely cannot go down. New engineers' AI-generated code respected all of it from day one. Onboarding dropped from 3 months to 2 weeks. That's not incremental improvement -- that's a structural advantage.

A **design engineer** connected his component library, design tokens, and accessibility requirements to his coding AI. Generated code uses his actual components with his actual tokens. No more translating from generic React to his design system. The gap between Figma and production closed.

A **product manager** started linking specs to the engineering knowledge base. When she writes "add offline mode," the AI surfaces 3 architecture constraints and 2 previous failed attempts. Engineering gets the full picture embedded in the spec. Back-and-forth clarification dropped 70%.

**The punchline is compounding.** Every architectural decision you document, every pattern you codify, every "we tried this and it failed" note -- these compound into a richer context that makes every future suggestion better. After a month, your AI has read every PR, every ADR, every incident postmortem. After 6 months, it's the most context-aware collaborator on your team — but you're still the one directing it, refining its output, and deciding what ships. You're not writing documentation -- you're deploying your expertise as infrastructure. The value is the triad: you, your knowledge store, and AI working as one system. Your agents build with you, as an extension of your engineering craft. Not a replacement for it.

<!-- toggle: team -->

## The 100x Team & Business

![](/blog/coding-in-craft/section-1.png)


Here's where the economics get interesting. At the team level, engineering context packages solve the consistency problem that code review was supposed to fix but never actually did.

Every team has a style. Naming patterns, error handling, testing philosophy, architecture boundaries. That style lives in the heads of 2-3 senior **engineers** and gets enforced through code review -- which means every PR is an expensive teaching moment instead of a quality gate. Senior engineers spend 30% of their time reviewing code that violates patterns the author didn't know existed. Net-net, your highest-leverage people are functioning as human linters. That is a terrible deployment of talent.

**How to share engineering context across your team:** Add your `CLAUDE.md` or `.cursorrules` to the repo — every engineer gets it on `git pull`. For deeper context, create a `/docs/engineering-context/` folder with files like `architecture-decisions.md`, `anti-patterns.md`, and `naming-conventions.md`. Claude Code and Cursor both index these automatically. For cross-functional teams, connect your docs repo to Notion via MCP so PMs and designers can query engineering constraints without pinging an engineer.

When the team's engineering context feeds into everyone's AI, the floor rises. Junior **engineers** produce code that matches senior standards on the first draft. New hires write idiomatic code in week one instead of month three. Code review shifts from "please follow our patterns" to "let's discuss the architectural tradeoff here." That's the shift from defense to offense. And the time your senior engineers reclaim from pattern-policing? That goes to the work that actually makes a difference — architecture decisions, system design, the hardest most interesting technical problems that have been sitting in the backlog because nobody had time to think deeply about them. Faster reviews aren't just about shipping more. They're about unlocking time for the deep craft that differentiates great engineering teams from ones that just grind.

**Designers** benefit enormously -- when the design system connects to engineering context, AI-generated code uses actual components with actual tokens. The "that's not how it was designed" QA cycle shrinks to near zero.

**PMs** benefit because specs auto-reference engineering constraints. The "we can't do it that way" feedback loop compresses from days to the moment the spec is written. No more wasted sprint cycles on impossible proposals.

**Operations leaders** benefit because internal tools built with engineering context match real workflows. One team saw adoption jump from 40% to 90% -- because the tools finally fit how ops actually works. That's the difference between software people tolerate and software people choose.

**Clinical teams** compound the value even further. One team encoded HIPAA compliance patterns, audit logging requirements, and data handling conventions into their context package. Every AI-generated code change automatically follows compliance patterns. Security review flags dropped from 40% of PRs to 5%. Think about what that means -- compliance built in, not bolted on. That derisks the entire development process.

One team reduced code review cycles from 2-day average to 4 hours. Not by lowering standards -- by raising the floor. Every AI-assisted PR already follows the team's patterns because the AI has the context. The reclaimed review time didn't disappear into more tickets — it went into architecture discussions, performance investigations, and the deep technical thinking that had been perpetually deprioritized. Time to ship, faster. Time for the engineering work that really matters? Finally unlocked. Like giving every player on your roster the same scouting report before the game starts — so the coach can spend prep time on strategy instead of fundamentals.

**The engineering knowledge base also captures institutional memory.** Why did we choose this database? What happened last time someone tried to refactor auth? Which API endpoints are load-bearing and can never go down? This context prevents the same expensive mistakes from recurring every time a new engineer joins. The system remembers what individuals forget. That is infrastructure.

---

## Where This Applies

![](/blog/coding-in-craft/section-2.png)


The pattern is universal: your engineering context is what turns AI from a generic code generator into a team member who respects your craft. The investment is documentation. The return is compounding quality at scale.

A **startup CTO** encoded his entire stack's constraints. New engineers' AI code respected all of them from day one. Onboarding at a completely different velocity.

A **design engineer** connected component library, tokens, and accessibility requirements. Generated code uses actual components, not generic ones. The gap between design and production -- gone.

A **clinical software team** encoded HIPAA patterns and audit logging. Compliance became automatic, not a review gate. Security flags dropped 87%. That's not optimization -- that's a category change.

An **ops leader** encoded workflow logic and decision criteria. AI-generated internal tools finally matched operational reality. Adoption numbers proved it.

A **product manager** linked specs to the engineering knowledge base. Requirements stopped getting lost in translation between product and engineering.

**Every person on the team -- engineer, product designer, PM, ops, clinical -- compounds the value when engineering context is real and specific.** The cost is hours of documentation. The return is thousands of hours of engineering time recovered, permanently.

---

## Examples How Others Have Made This Real

These aren't hypotheticals. Real teams and builders are deploying engineering context right now — and the tools to do it already exist.

- **Shopify** mandated that every developer use AI coding tools — then discovered the bottleneck wasn't the model, it was the context. Their internal "Sidekick" system feeds codebase-specific patterns, conventions, and institutional knowledge into every AI interaction. Engineers write code that fits the monolith because the AI knows the monolith.

- **Cursor + .cursorrules files** — thousands of engineering teams now ship a `.cursorrules` file in their repo that encodes naming conventions, framework preferences, banned patterns, and architecture constraints. The AI reads it before generating a single line. One file. Immediate acceptance rate jump. The pattern has spread across open-source projects on GitHub because the ROI is obvious.

- **Claude Code with CLAUDE.md** — Anthropic's own coding agent reads project-level context files that encode your stack constraints, testing philosophy, and "never do this" rules. Engineering teams write a single markdown file and every AI interaction respects their reality. The 60%-to-95% acceptance rate shift is real and repeatable.

- **Vercel's v0** generates frontend code — but teams that connect their design system tokens and component libraries get output that actually ships. Teams without context get generic React. Teams with context get their React, their patterns, their components. Same model. Different economics.

- **GitLab Duo** embeds engineering context from merge request history, CI pipeline configs, and code review patterns directly into AI suggestions. Teams that invest in structured engineering documentation see measurably fewer "fix it to match our style" review cycles.

- **Stripe** built internal AI tools that reference their API design principles — a document encoding 10+ years of opinions about naming, versioning, error handling, and backwards compatibility. New engineers' AI-generated code follows Stripe's API philosophy from day one because the philosophy is in the system, not just in senior engineers' heads.

---

## Ask Yourself

These questions reveal whether your AI is coding in your reality -- or in a textbook that doesn't know your codebase exists.

1. **Does your AI know about the shared utilities that already exist in your codebase?** If it keeps reinventing functions you already have, it's working blind. That's not bad AI -- it's missing context. How much duplicate code has your team accepted because fixing it felt faster than teaching?

2. **What's your code review acceptance rate on AI-generated code?** If it's below 80%, the gap is context -- not capability. The AI doesn't know your naming conventions, your deprecated patterns, your "never do this" list. [See how knowledge bases change the math →](/#moat)

3. **Where do your architecture decisions live?** In ADRs nobody reads? In a senior engineer's head? In the git blame history? If a new hire asked "why did we build it this way?" -- would the AI know the answer? [Explore how agents carry your context →](/#agents)

4. **Can your AI access your anti-patterns -- the scars?** Every codebase has them. The things you tried that broke production. The patterns that looked elegant but didn't scale. If your AI doesn't know about the scars, it will reopen every healed wound.

5. **How long does it take a new engineer to write idiomatic code on your team?** If the answer is "months" -- that's the gap between your team's knowledge and what's documented. An engineering context package closes it in days. [See how the stack connects →](/#stack)

6. **Do your designers and PMs have access to engineering constraints before they spec?** If the "we can't do it that way" feedback loop takes days, your tools aren't sharing context. Connected tools eliminate impossible proposals before they waste anyone's time. [Explore shared surfaces →](/#surfaces)

---

**Connected learning paths to consider:**
- [Find the Path to Making AI Carry Your Taste →](/blog/taste-through-ai)
- [The Path to Shipping in Weeks What Used to Take Quarters →](/blog/speed-to-market)
- [The Path from Commoditized to Irreplaceable →](/blog/pillar-5-performance-standards)


**Chat with me:** [LinkedIn](https://www.linkedin.com/in/michaelvanhavill/)

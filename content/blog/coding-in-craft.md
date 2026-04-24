---
title: Walk the Path to Code That Carries Your Craft
titleHighlight: Carries Your Craft
slug: coding-in-craft
theme:
  - craft-and-taste
  - ship-faster
description: >-
  One engineering team's full case study - from 60% acceptance rate to 95%,
  from 3-month onboarding to 2-week, from senior-as-human-linter to senior as
  architect. Told in detail.
date: 2026-03-28T00:00:00.000Z
author: 100xpath
tags:
  - engineering
  - case study
  - AI coding
  - code quality
  - developer workflow
heroImage: /blog/coding-in-craft/hero.png
---

> **Foundations assumed:** [Knowledge bases are the new career capital](/blog/pillar-1-knowledge-management) · [Encode your specificity](/blog/you-are-not-generic)

Most articles about AI coding are hypothetical. This one is a single case study, told at the level of detail you'd need to run the same playbook yourself. The team: a 14-person product engineering org at a Series B SaaS company. The window: November to March. The outcome: acceptance rate on AI-generated code from 60% to 95%, onboarding from 3 months to 2 weeks, senior engineers reclaiming an average of 11 hours per week from code review. The playbook follows.

Names and product details are abstracted. Everything else is real.

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

---

## The Starting Position (November)

The team had adopted Cursor nine months earlier. Acceptance rate on AI-generated code had plateaued at ~60%. Every engineer loved the tool individually. In aggregate it was dragging them down. Three senior engineers had started a Slack thread titled "Is Cursor actually helping us?" that nobody wanted to answer out loud.

Code review logs told the honest story. Of every 100 AI-generated suggestions, roughly 40 got rejected outright, another 25 got accepted-with-fixes, and only 35 shipped clean. Every "accepted-with-fix" burned 10-15 minutes of senior time. The math was miserable: the senior engineers were spending 30% of their working hours functioning as human linters for code the AI should have written correctly the first time.

Onboarding was where it hurt worst. New hires took 3 months to write idiomatic code. They leaned on Cursor from day one and shipped garbage. Senior reviewers caught it all, explained it all, re-explained it. The new hire learned the patterns eventually. The seniors were exhausted. The pipeline kept delivering new hires and the cycle repeated.

---

## The Diagnosis (Late November)

The lead engineer ran a two-week audit on rejected PRs. Every rejection got tagged with its root cause. The distribution was clarifying:

- **Wrong naming convention** - 32%
- **Reinvented an existing utility** - 21%
- **Used a deprecated pattern** - 18%
- **Missed an architectural constraint** - 14%
- **Violated a "we learned not to do that" scar** - 9%
- **Actual logic error** - 6%

Read the list. Ninety-four percent of rejections were context failures. The AI wasn't wrong because it couldn't code. It was wrong because it had no idea what this specific codebase considered correct. Generic AI, generic output, generic rejections.

The fix was obvious in retrospect and almost nobody thinks of it first: write the context down where the AI can read it.

---

## The Build (December)

The team allocated two weeks and a single repo file. They called it `CLAUDE.md` at first, then added a `.cursorrules` alongside it. The content settled into five sections.

**Section 1: Architecture patterns.** How the system was actually wired. Not an idealised diagram - the real one. Which services talked to which, what the event bus was called, where the boundary between the monolith and the new microservices lived.

**Section 2: Naming conventions.** Services named by verb (`processPayment`, not `PaymentProcessor`). Database columns snake_case, variables camelCase, constants SCREAMING_SNAKE. Every deviation from standard was documented with the reason.

**Section 3: Shared utilities that already exist.** A running list of every util library, helper, or internal package the team used, with a one-sentence description of what each did. This section alone killed the "reinvent an existing utility" error class.

**Section 4: Deployment constraints.** What the pipeline required. Which environment variables were sacred. Which services absolutely could not go down during deploys. Which migrations had to happen in a specific sequence. All the tribal knowledge that had been passed down orally.

**Section 5: Anti-patterns and scars.** The things they had tried and regretted. The pattern that looked elegant and caused the Thursday outage in June. The "never do X because Y" list that lived in senior engineers' heads. Every scar got documented.

Total length: 47KB. Committed to the repo root. Version-controlled. Reviewable through pull requests like any other code.

---

## The Rollout (December-January)

Every engineer pulled it on their next `git pull`. Cursor picked it up automatically via `.cursorrules`. Claude Code read it through the `CLAUDE.md` convention. No training session. No change management. The tool changed quietly.

Acceptance rate moved within a week. From 60% to 78% almost immediately. The biggest wins were in the categories the context doc addressed head-on: naming conventions, shared utilities, deprecated patterns. The AI stopped getting them wrong because it finally had the information to get them right.

But there was a second-order shift nobody had predicted. The team started editing the context doc during code review. When a senior caught a pattern violation that wasn't yet documented, instead of leaving a comment on the PR, they added the rule to `CLAUDE.md` and committed it. Three months in, the doc had doubled in length - not because anyone scheduled writing time, but because the loop of "catch in review → codify in the doc → never see that class of error again" was its own reward.

---

## The Compounding (February-March)

By February the acceptance rate had climbed to 91%. By early March it stabilised at 95%.

Onboarding dropped from 3 months to 2 weeks. New hires pulled the repo, read the context doc on day one, and wrote idiomatic code by end of week one. Their PRs went through the same review process as anyone else's. The "explain our patterns one more time" loop - the one that had burned out the seniors for years - effectively ended.

The senior engineers reclaimed roughly 11 hours per week each. Eleven hours. Per week. That wasn't redirected into more reviews. It went into architecture work, performance investigations, and mentoring conversations that had nothing to do with style. The character of their jobs shifted. They stopped being linters and started being architects.

The lead engineer tracked one metric nobody had previously tracked: average time from PR opened to PR merged. It dropped from 2 days to 4 hours. Same team. Same codebase. Same rigor. The difference was entirely the quality of the first draft.

---

## The Numbers That Changed

| Metric | November | March | Delta |
|--------|---------|-------|-------|
| AI suggestion acceptance rate | 60% | 95% | +35pts |
| Average PR-to-merge time | 2 days | 4 hours | -83% |
| Senior time on style-fix reviews | 30% | 6% | -80% |
| Onboarding to first idiomatic PR | 3 months | 2 weeks | -83% |
| Production incidents from pattern violations | 4/quarter | 0 | -100% |

None of those numbers came from better AI. All of them came from one 47KB file that encoded what the team already knew but had never written down.

---

## The Playbook

If you want to run this move on your team, here's the shape.

**Week 1.** Audit your last 200 AI-generated PRs. Tag every rejection by root cause. Confirm what the team above found: the overwhelming majority of rejections are context failures, not capability failures.

**Week 2.** Write the five-section `CLAUDE.md` (or `.cursorrules`) file. Architecture, naming, shared utilities, deploy constraints, scars. Don't over-engineer it. Don't schedule a "documentation sprint." One engineer writes a draft in a day; another reviews it in an hour.

**Weeks 3-4.** Commit it. Let the team pull it. Watch the acceptance rate shift.

**Ongoing.** Every time a reviewer catches a pattern violation, add the rule to the doc in the same PR that fixes it. The doc grows through the natural review loop. No separate writing budget required.

---

## What This Is Really About

The case study is engineering, but the pattern is not. Every function on the team that ever rejected "AI slop" output has the same root cause: the AI didn't know the real rules. The fix is always the same: write the real rules down where the AI can read them. What takes weeks is not the writing. It's the accepting that your team's institutional knowledge has been sitting unwritten, unshared, and undeployable for years - and that the cheapest weekend you ever spent was the one that changed that.

---

**Connected learning paths to consider:**
- [Find the Path to Making AI Carry Your Taste →](/blog/taste-through-ai)
- [The Path to Shipping in Weeks What Used to Take Quarters →](/blog/speed-to-market)
- [The Path from Commoditized to Irreplaceable →](/blog/pillar-5-performance-standards)

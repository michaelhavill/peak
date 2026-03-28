---
title: See the Path to Owning the Center and Renting the Edges
titleHighlight: Renting the Edges
slug: pillar-2-hub-and-spoke
pillar: 2
theme:
  - scale
  - ship-faster
description: >-
  The builders who own their orchestration layer can swap any tool overnight.
  Everyone else is locked in.
date: 2026-03-28T00:00:00.000Z
author: 100xpath
tags:
  - architecture
  - hub-and-spoke
  - vendor independence
  - infrastructure
  - antifragile
heroImage: /blog/pillar-2-hub-and-spoke/hero.png
---

Six months ago you picked an AI platform. Your team shipped 14 workflows on top of it. Now a competitor launches something 3x faster at half the price. You cannot switch. Your workflows are fused to the vendor's data model. Your prompts call proprietary APIs. Your team learned one UI. You didn't notice the lock-in because the first 90 days were free — and that is exactly how the incentive structure was designed.

The builder down the hall swaps AI providers over lunch. Her workflows keep running. Her knowledge base doesn't move. Her team barely notices. She's playing a different game entirely.

**The difference is not technical sophistication. It's architectural discipline.** One structure is fragile — one bad vendor quarter and you're rebuilding from scratch. The other is antifragile — every market disruption makes you faster. Full stop.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ● HOW MOST PEOPLE BUILD TODAY         ● HOW A 100x OPERATOR BUILDS             │
│                                                                                 │
│  Everything tangled with one vendor:   Own the center. Rent the edges:          │
│                                                                                 │
│  ┌─────────────────────────┐           ┌─────────────────────────┐              │
│  │    VENDOR PLATFORM      │           │     YOUR HUB            │              │
│  │  ┌───┐ ┌───┐ ┌───┐     │           │  Knowledge base         │               │
│  │  │ A │ │ B │ │ C │     │           │  Workflow logic          │              │
│  │  └─┬─┘ └─┬─┘ └─┬─┘     │           │  Orchestration rules    │               │
│  │    └──┬───┘───┬──┘      │           │  Business rules         │              │
│  │       │ LOCKED │        │           └──────────┬──────────────┘              │
│  │       │  IN    │        │                ┌─────┼─────┐                       │
│  └───────┴───────┴─────────┘           ┌────┴┐ ┌──┴──┐ ┌┴────┐                  │
│                                        │Spoke│ │Spoke│ │Spoke│                  │
│  Something better launches?            │ AI  │ │ CRM │ │ IDE │                  │
│  You can't switch.                     └─────┘ └─────┘ └─────┘                  │
│  6-month migration. Maybe.                                                      │
│                                        Something better launches?               │
│                                        Swap the spoke over lunch.               │
│                                        Hub doesn't move. Nothing breaks.        │
│                                                                                 │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                                                                 │
│  CAREER IMPACT                         CAREER IMPACT                            │
│  Your skills are trapped in            Your knowledge travels with              │
│  one vendor's ecosystem.               you. Tools come and go.                  │
│  Platform dies, you restart.           You never restart.                       │
│  ░░░░░░░░░░░░░░░░░░░░ fragile         ████████████████████ antifragile          │
│                                                                                 │
│  BUSINESS IMPACT                       BUSINESS IMPACT                          │
│  Vendor owns your roadmap.             You adopt the best tool on               │
│  Procurement cycles kill               day one. Competitors are                 │
│  your speed.                           still in procurement.                    │
│  ░░░░░░░░░░░░░░░░░░░░ locked          ████████████████████ free                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

<!-- toggle: individual -->

## The 100x Individual

Here's the thing. Your relationship with tools defines your speed ceiling. Every tool you adopt is either a spoke you can replace in an afternoon — or a dependency that owns you for 18 months. The question is brutally simple: "If this disappeared tomorrow, what breaks?"

If the answer is "everything" — you don't have architecture. You have a hostage situation. If the answer is "I swap the spoke and the hub keeps running" — you've derisked your entire workflow. That is the discipline that compounds.

A **design engineer** structured his entire stack around one principle: **own the center, rent the edges.** His knowledge base and workflow logic live in systems he controls — the hub. Design tools, code editors, AI models, deployment platforms — all spokes. When Cursor shipped a feature that outperformed his previous editor, he swapped that spoke in one afternoon.

**How to start building your hub today:** Put your core knowledge in a system you own — Notion, Obsidian, or even a well-structured folder of markdown files. Then connect it to your AI tools via MCP. Your Notion workspace connects to Claude. Your markdown files connect to Cursor via `.cursorrules` and project docs. Your knowledge stays in your system. The AI tools are spokes you swap without losing a single insight. Zero rebuilding. Zero retraining. Zero lost context. Like a poker player with deep chip stacks — he can play any hand because he's never pot-committed to one tool.

A **solo founder** took this further. She built her customer data model, workflow logic, and orchestration rules in her own system. Salesforce, Stripe, and her analytics platform plug in as spokes. When her analytics provider tripled pricing — from $400/month to $1,200 — she swapped to a competitor over a weekend. Her hub didn't change. Her data stayed clean. Her workflows kept running. Net-net: she saved $9,600 a year and upgraded her analytics in 48 hours.

An **engineering lead** built the team's architecture docs, ADRs, and deployment patterns as the hub. CI/CD tools, monitoring platforms, and cloud services are spokes. When a better CI tool shipped, they swapped it in a day. When cloud pricing changed, they migrated the compute spoke without touching a single line of application logic.

A **product manager** made her research corpus and persona data the hub. Analytics tools, survey platforms, and A/B testing services are spokes. When a vendor got acquired and the product degraded — which happens on a 2-3 year cycle like clockwork — she migrated in a week. Dashboards, experiments, feature flags: all kept running.

A **clinical leader** built care coordination logic as the hub. The EHR is a spoke. When the EHR falls short, she builds extensions. When a better scheduling tool launched, she swapped it without disrupting a single clinical workflow.

Consider this — it matters more for AI tools than any other category. The landscape reshapes itself every 90 days. Models improve by 40% per generation. New providers emerge monthly. Pricing drops 10x in 18 months. The builder who can swap AI tools without rebuilding workflows has a structural speed advantage that compounds with every market shift. But the speed isn't the whole story — the real payoff is what you do with the time you're not spending on migration projects. Every 6-month migration you avoid is 6 months reclaimed for deep thinking, deep craft, and the hardest most interesting problems in your domain. Time to adopt new capabilities, faster. Time for the strategic work that actually differentiates? Unlocked. That is the moat no vendor can take from you.

<!-- toggle: team -->

## The 100x Team & Business

![](/blog/pillar-2-hub-and-spoke/section-1.png)


At the company level, hub-and-spoke is the difference between strategic flexibility and slow death by vendor dependency. Let me be very clear about what usually happens.

Most enterprise AI strategies follow a playbook designed to fail: evaluate vendors for 6 months, pick one, sign a 3-year contract worth $500K+, build everything on the platform. Then the vendor's roadmap diverges from yours. Feature requests vanish into a backlog you cannot see or influence. But switching costs are now $2M and 18 months of migration — so you stay. You've outsourced your strategic flexibility to a company whose incentive structure is to keep you locked in. That is insanity.

One company took the opposite approach. Their own platform is the hub — data, workflows, task orchestration, and cross-system coordination all live there. Their EHR, CRM, documentation tools, and AI models are all spokes. **All current infrastructure is considered replaceable.** That is the principle that changes everything.

When their EHR vendor stalled a critical integration for 8 weeks, they built a bridge through their hub in 48 hours. When a better documentation tool launched, they piloted it as a spoke without touching the hub. When an AI model showed 30% better accuracy on a key task, they swapped it with a configuration change — not a 6-month migration project. This is what antifragile looks like when you deploy it at the organizational level.

The organizational discipline: **tools are chosen for speed-to-integrate, not permanence.** The **engineering team** evaluates tools by asking "how fast can we integrate and how fast can we rip it out?" — not "how comprehensive is the platform?" The **product team** treats analytics providers as replaceable spokes. The **ops team** treats workflow tools the same way. The **clinical team** treats everything except their care coordination logic as a spoke. Think of it like reading the table in poker — you're always assessing which position gives you the most optionality, not committing your stack to one hand.

This requires building custom interfaces for different teams — **business**, **clinical**, **operations** — each reading from and writing to the same central system. The upfront investment is real. But the payoff is an architecture that outlasts any individual tool decision by 10x. In AI, where the landscape reshapes itself quarterly, this is not a luxury. It is the thing that separates teams shipping on day one from competitors stuck in procurement cycles measuring 12-18 months. And the teams that aren't stuck in procurement? They're spending that time on the work that actually makes a difference — deep strategy, hard product problems, the craft that differentiates. The punchline is: speed compounds, lock-in is the tax that destroys compounding, and the real win is reclaiming time for the work only your team can do.

---

## The Same Pattern, Different Domains

![](/blog/pillar-2-hub-and-spoke/section-2.png)


Why does this pattern show up everywhere? Because the underlying economics are identical across every domain. There are only two categories: the thing that generates your core value — the hub — and everything else — spokes. Once you see it, you cannot unsee it.

A **product team** at a fintech startup built their feature flag system and customer data model as the hub. A/B testing, analytics, and user research tools are spokes. When their analytics vendor got acquired and the product degraded within 90 days, they migrated in a week. Dashboards, experiments, and feature flags kept running while competitors spent 4 months on the same migration.

A **design team** made their design principles and tokens the hub. Figma, code editors, and prototyping tools are spokes. Their design system's logic persists regardless of which tool renders it. When a better editor launched, they adopted it without losing 3 years of design system investment. The hub preserved $250K+ worth of institutional knowledge.

An **operations leader** structured care coordination logic as the hub. The EHR handles 80% of clinical needs — where it falls short, she builds extensions. Scheduling, referrals, and communication are spokes upgraded independently. A new care model deployed in 48 hours. Not the typical 6-month IT project. That is a 90x speed advantage.

An **engineering lead** built the workflow engine and data model as the hub. Cloud services, CI/CD tools, and monitoring are spokes. Cost optimization, performance improvements, and new capabilities manifest as configuration changes — not migrations that burn $200K in engineering time.

A **founder** made her business logic the hub. Every SaaS subscription is a spoke. When something better launches, she adopts it on day one while competitors are still scheduling their vendor evaluation kickoff. That gap compounds every single quarter.

**The pattern: whatever generates your core value is the hub. Everything else is a spoke.** Your hub is where the triad lives — your people's judgment, your accumulated knowledge, and AI working as extensions of your team's skills. The moment you let a vendor tool become your hub, you've outsourced your differentiators and handed the deed to someone else. That is the structural mistake that kills companies slowly — then all at once.

---

## Where This Connects

Architecture is the container that holds everything else. Your knowledge base needs a hub to live in — a system you control, not one a vendor might deprecate on 30 days' notice. Your orchestration engine needs flexibility to route work across tools that change quarterly. Your team experiments faster when tool-swapping costs $0 in lost context. Your performance standards depend on infrastructure that moves as fast as your ambitions.

**The hub is what you own. The spokes are what you rent. The discipline to maintain that boundary is what makes you antifragile** — not just resilient to stress, but genuinely better because of it. And the hub's value comes from the triad: you, your knowledge store, and AI working together. You're not outsourcing your differentiators to a platform. You're empowering your agents to build with you — through infrastructure you control. Every disruption is an upgrade opportunity. Every vendor misstep is a free option to improve. That is how you compound advantages while everyone else is filing procurement requests.

---

## Examples How Others Have Made This Real

These aren't hypotheticals. Real builders and companies are deploying hub-and-spoke architecture right now — and the antifragile advantage is already compounding.

- **Anthropic's Model Context Protocol (MCP)** is the hub-and-spoke pattern made into an open standard. Your knowledge base and workflow logic are the hub. AI models, tools, and data sources plug in as spokes via MCP. When a better tool launches, you swap the spoke. The hub — your context, your logic, your intelligence — never moves. Thousands of teams are building on this architecture today.

- **Notion as hub** — product teams use Notion as their knowledge and workflow hub, with AI tools, project trackers, design tools, and communication platforms plugged in as spokes. When Linear replaced Asana, the hub didn't move. When Claude replaced a previous AI tool, the knowledge base stayed intact. The switching cost dropped to near zero.

- **Vercel's architecture** — Next.js apps deploy to Vercel, but the application logic and data model are portable. Teams swap hosting providers, databases, and AI services without rewriting application code. The hub (your code, your data model) survives every spoke change. That's antifragile engineering.

- **Zapier / Make as orchestration hubs** — operations teams build workflow logic in Zapier, connecting CRM, email, AI, analytics, and communication tools as spokes. When a spoke vendor raises prices or degrades, the replacement plugs into the same workflow. One team swapped their email provider in an afternoon. Their 40+ automated workflows never noticed.

- **Terraform / Infrastructure as Code** — engineering teams encode their infrastructure logic as the hub. Cloud providers — AWS, GCP, Azure — are spokes. When cloud pricing shifts or a better service launches, teams migrate the spoke without rewriting infrastructure logic. The pattern is the same at every layer: own the center, rent the edges.

- **dbt as the analytics hub** — data teams build transformation logic in dbt (the hub) and connect data warehouses, BI tools, and reporting platforms as spokes. When Looker got acquired and the product direction shifted, teams using dbt as their hub migrated to a new BI spoke without losing a single transformation. Years of analytical logic, preserved.

- **PostHog, Plausible, and the analytics unbundling** — product teams moving away from Google Analytics are discovering the hub-and-spoke principle firsthand. Teams whose analytics logic lived in GA's proprietary system faced months of migration. Teams with their own data model and event taxonomy (the hub) swapped analytics providers in days. The lesson: if your core logic lives in a vendor's system, you don't have architecture. You have a dependency.

---

## Ask Yourself

These questions reveal whether you own your infrastructure — or your vendors own you.

1. **If your AI provider disappeared tomorrow, what breaks?** Run the exercise seriously. Your workflows, your prompts, your integrations — how much is entangled with one vendor's data model? If the answer is "everything" — you don't have architecture. You have a dependency. [See how the hub protects you →](/#philosophy)

2. **Where does your core knowledge actually live?** In Notion? In your AI vendor's system? In a platform you don't control? Your knowledge base, orchestration logic, and business rules should live in systems you own. Everything else is a spoke you can swap. [See how the knowledge moat stays yours →](/#moat)

3. **How fast can you swap a tool?** Pick any tool in your stack. How long would it take to replace it — an afternoon, a week, or 6 months of migration? That migration timeline is the measure of your lock-in. The builder who can swap in an afternoon is antifragile. [Explore the integrations stack →](/#stack)

4. **Are your workflows built on vendor features or on your own logic?** If your automation depends on a specific vendor's proprietary workflow engine, you've given away control. If your orchestration logic lives in your hub and the vendor is just a spoke — you're free to move.

5. **Can multiple agents across different providers access the same knowledge?** Your hub should feed context to Claude, to your coding tools, to your design tools — regardless of provider. If your knowledge only works with one AI, that's lock-in disguised as integration. [See how agents connect to the hub →](/#agents)

6. **What's your "speed to integrate" test for new tools?** When something better launches, can you pilot it in a day? Or does evaluation take 6 months and procurement another 6? The team that can adopt new tools on day one compounds advantages that locked-in competitors can never close.

---

**Connected learning paths to consider:**
- [Map the Path from AI Tasks to AI Workflows →](/blog/pillar-3-orchestration)
- [Chart the Path from Individual Moat to Company Moat →](/blog/building-moat-at-scale)
- [The Path to Shipping in Weeks What Used to Take Quarters →](/blog/speed-to-market)

**Want to connect on this?** [Book an advisory call →](https://cal.com/mvhavill)

**Chat with me:** [LinkedIn](https://www.linkedin.com/in/michaelvanhavill/) · [X](https://x.com/mvhavill)

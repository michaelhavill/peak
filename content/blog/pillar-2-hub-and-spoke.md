---
title: See the Path to Owning the Center and Renting the Edges
titleHighlight: Renting the Edges
slug: pillar-2-hub-and-spoke
pillar: 2
theme:
  - scale
  - ship-faster
description: >-
  Ten failure modes of vendor lock-in that are quietly costing real companies
  real money - and the hub-and-spoke move that retires each one.
date: 2026-03-28T00:00:00.000Z
author: 100xpath
tags:
  - architecture
  - vendor lock-in
  - infrastructure
  - antifragile
  - lock-in failure modes
heroImage: /blog/pillar-2-hub-and-spoke/hero.png
---

> **Foundations assumed:** [Knowledge bases are the new career capital](/blog/pillar-1-knowledge-management) · [Encode your specificity](/blog/you-are-not-generic)

Every company I've worked with that got trapped in a bad AI vendor situation got trapped the same way: one small architectural choice, made under deadline pressure, that quietly welded the core of their business to a platform they didn't control. The lock-in never felt like lock-in at the time. It felt like progress. Then six months later a better tool launched, the vendor's roadmap drifted, or the pricing doubled - and they discovered they couldn't move without rebuilding.

Below are ten failure modes of vendor lock-in I see over and over, across **CTOs**, **technical leaders**, and **ops leaders**. Each one has a specific cost. Each one has a specific architectural fix. Read the list. Run it against your stack. Where you recognise yourself, you have work to do.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ● HOW MOST PEOPLE BUILD TODAY         ● HOW A 100x OPERATOR BUILDS             │
│                                                                                 │
│  Everything tangled with one vendor:   Own the center. Rent the edges:          │
│                                                                                 │
│  ┌─────────────────────────┐           ┌─────────────────────────┐              │
│  │    VENDOR PLATFORM      │           │     YOUR HUB            │              │
│  │  ┌───┐ ┌───┐ ┌───┐      │           │  Knowledge base         │              │
│  │  │ A │ │ B │ │ C │      │           │  Workflow logic         │              │
│  │  └─┬─┘ └─┬─┘ └─┬─┘      │           │  Orchestration rules    │              │
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

---

## The Ten Failure Modes

### 1. The Data Model Prison

**The pattern.** You built your workflows directly against a vendor's data model - their customer object, their event schema, their entity structure. Your logic assumes their shape. Their shape is now your shape.

**What it costs.** A 6-month migration whenever you switch. Every query, every report, every downstream integration has to be rewritten. A team I worked with estimated this at $540K in loaded salary just to port their analytics off one vendor.

**The fix.** Define your own canonical data model in the hub. Every vendor plugs in via an adapter that translates their schema to yours on the way in and out. The vendor changes. Your hub doesn't.

### 2. The Proprietary Workflow Trap

**The pattern.** Your automation logic is built inside a vendor's workflow engine - their drag-and-drop canvas, their custom DSL, their no-code tool. The logic is valuable; it's also now the vendor's format.

**What it costs.** You cannot version-control it properly. You cannot test it outside the vendor's environment. You cannot lift it to another platform without rebuilding from scratch. When the vendor degrades, you're stuck.

**The fix.** Keep business logic in code you own. Vendor workflow engines should only orchestrate steps that reference your logic, not contain it. If your critical workflow would die with the vendor tomorrow, you don't have architecture - you have a hostage situation.

### 3. The Prompt Entanglement

**The pattern.** Your prompts are tuned to one model's quirks. They reference vendor-specific features. They depend on response formats that are slightly different on every other provider.

**What it costs.** The day a 40%-better model launches on another provider, switching requires retuning every prompt in your codebase. The team that built it is the only team that knows how. They're now a single point of failure.

**The fix.** Prompts as code, checked into the repo, parameterised by model. An abstraction layer between your agents and any specific provider. Benchmarks you run against every candidate model whenever a new one ships. Swap the spoke. Your agent layer doesn't notice.

### 4. The SSO/Auth Anchor

**The pattern.** You built SSO, permissions, and identity on top of a vendor's specific scheme. It was easy at the time. Now every other tool you adopt has to bend to that scheme.

**What it costs.** Every subsequent vendor evaluation quietly privileges the incumbent's integration story. You stop evaluating the best tool for the job and start evaluating the tool that integrates cleanest with your auth anchor. That is vendor-driven strategy dressed up as due diligence.

**The fix.** SSO through a provider you consider *neutral infrastructure*, not strategic platform. Okta, Auth0, or equivalent. Every tool plugs in. Your identity layer is a spoke, not a hub.

### 5. The Pricing-Cliff Dependency

**The pattern.** The vendor priced the first tier aggressively. You deployed widely. Now you're at the seat count, usage threshold, or feature tier where pricing gets ugly - and they know it.

**What it costs.** A 45-60% overnight price hike when the renewal comes. Or a 3x jump at the seat threshold. One company I watched had analytics spend go from $400/mo to $1,200/mo on renewal because they were too deep to move. Every customer that got there knew in advance. Nobody had a migration plan.

**The fix.** Annual migration drills. Actually simulate moving to a competitor twice a year. Confirm the hub's integration still holds. The threat is the leverage that keeps vendor pricing honest.

### 6. The Feature Backlog You Can't Influence

**The pattern.** You filed a feature request 18 months ago. Then another. Then another. None shipped. The vendor's roadmap is driven by their top 5 enterprise accounts, and you are not one of them.

**What it costs.** Your strategic plans quietly bend around feature gaps you couldn't close. Your competitive position takes losses you shouldn't take because you're waiting on a vendor that is not waiting on you.

**The fix.** Build the missing feature as a spoke against your hub. If the hub is properly defined, 80% of "feature gaps" become short internal builds. The vendor becomes optional for any capability you're willing to build once.

### 7. The Team-Knowledge Trap

**The pattern.** Your team mastered the vendor's UI, the vendor's terminology, the vendor's quirks. Institutional knowledge is now vendor-specific. Every hire trains on the vendor. Every hour of internal documentation references the vendor.

**What it costs.** When you migrate, you retrain the team. When someone leaves, their replacement needs vendor-specific onboarding before they contribute. Your team's productivity has been implicitly collateralised against the vendor's continued existence.

**The fix.** Invest in portable skills, not vendor-specific ones. Document workflows in terms of outcomes and logic, not vendor UI steps. A **technical leader** I know audits their onboarding docs annually and rips out every vendor-specific instruction, replacing it with a principle the next vendor will also honour.

### 8. The Acquisition Shock

**The pattern.** Your vendor got acquired. The acquirer has different priorities. The product you loved starts degrading within 90 days: features deprecated, pricing changed, support quality halved, support staff departed.

**What it costs.** A business-as-usual quarter turns into a fire drill. A team I worked with lost three weeks of product roadmap responding to a vendor acquisition they hadn't seen coming. Cost: roughly $180K of engineering time and a feature that shipped two cycles late.

**The fix.** Assume every vendor will eventually get acquired. The hub survives; the spoke changes hands. Monitor for signs - slowed shipping, silent support, LinkedIn departures. Treat vendor health as a real quarterly metric. Plan to move before the shock, not after.

### 9. The Integration Orphan

**The pattern.** You built a custom integration with a vendor that's now 3 platform-versions behind. The integration still works - barely. Every month brings a new edge case. The engineer who wrote it left. Nobody wants to touch it.

**What it costs.** A slow, grinding tax. One bug a quarter. One outage a year. A team that delays any related feature because the integration is considered haunted code.

**The fix.** Integrations live at the hub's adapter boundary, with clear contracts and test coverage. If a vendor changes and your adapter breaks, the adapter is a half-day fix - not an archaeological dig. Treat integrations as first-class code, not glue.

### 10. The "We're Already Too Deep" Lie

**The pattern.** You know the vendor is wrong for you. You can list the problems. You won't move because "we're already too deep." Sunk costs become strategy.

**What it costs.** Every quarter you stay is another quarter of compounding lock-in and another quarter your competitors who moved earlier pull further ahead. A CFO-approved decision to defer migration is, in most cases, a decision to pay the vendor a retention tax for the privilege of falling behind.

**The fix.** Compute the sunk cost honestly. Compute the forward cost of staying honestly. Compute the migration cost. The migration cost is almost always smaller than the three-year forward cost of staying. The longer you wait, the worse the math gets. Full stop.

---

## The Architectural Discipline That Retires All Ten

Every failure mode above has the same root cause: your core logic lives somewhere you don't own. The fix is the same in every case: move the core to a hub you control. Treat every vendor as a spoke that can be swapped without touching the hub.

That is not a technical exercise. It is an organisational discipline. The **CTOs** who run it well have one rule: *any time we're about to build something directly against a vendor's shape, we stop and ask what the hub version would look like first.* Five minutes of that conversation, applied consistently, is what separates teams that adopt the best model on day one from teams that are still in procurement six quarters later.

---

## Run the Audit This Week

Walk through your stack. For each tool, ask: if this vendor disappeared tomorrow, what breaks? If the answer is "everything," that tool is a hub - not a spoke - and the lock-in is already priced in. If the answer is "a spoke we swap in an afternoon," you're antifragile on that axis.

The audit takes two hours. The decisions it surfaces will shape your next two years. Nothing on your calendar this week has a better ROI than that.

---

**Connected learning paths to consider:**
- [Map the Path from AI Tasks to AI Workflows →](/blog/pillar-3-orchestration)
- [Chart the Path from Individual Moat to Company Moat →](/blog/building-moat-at-scale)
- [The Path to Shipping in Weeks What Used to Take Quarters →](/blog/speed-to-market)

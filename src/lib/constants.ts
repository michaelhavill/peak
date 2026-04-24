export const NAV_ITEMS = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Agents", href: "#agents" },
  { label: "Surfaces", href: "#surfaces" },
  { label: "Stack", href: "#stack" },
  { label: "Builders", href: "#builders" },
  { label: "Learn", href: "#learn" },
];

export const ROTATING_ROLES = [
  "founder",
  "product builder",
  "design engineer",
  "solo operator",
  "technical leader",
  "creative director",
  "vibe coder",
];

export const USE_CASES = [
  {
    title: "Write down your taste",
    description:
      "Here's what's actually happening: you've spent years building instincts about strategy, hiring, design, pricing, positioning - and none of it reaches your AI. Write it down. Now your AI carries your judgment instead of guessing.",
    badge: "Career Moat",
    tools: ["Claude", "Notion", "Figma"],
  },
  {
    title: "Encode who you're building for",
    description:
      "The hard truth? Most AI output is generic because it has zero customer context. Encode your personas, your KPIs, what success actually looks like - and suddenly your AI makes decisions your competitors literally cannot.",
    badge: "Company Moat",
    tools: ["Linear", "Notion", "Amplitude"],
  },
  {
    title: "Capture the domain knowledge",
    description:
      "Regulatory constraints, business dynamics, the stuff that took you years to learn. This is the context that makes your AI work inimitable. Your competitors can buy the same tools. They can't buy your context.",
    badge: "Domain Moat",
    tools: ["Obsidian", "Notion", "GitHub"],
  },
  {
    title: "Give your AI a backlog to reason over",
    description:
      "Everyone else prompts from scratch every single time. Your agents draw on a structured universe of hypotheses, experiments, and insights. That's the compounding advantage of a curated mind.",
    badge: "Ideas Moat",
    tools: ["Notion", "Linear", "Claude"],
  },
  {
    title: "Define your real engineering constraints",
    description:
      "Generic AI ships generic code. It breaks the moment it hits your reality. AI that knows your stack, its seams, its actual constraints? That ships code that works. That's the difference.",
    badge: "Technical Moat",
    tools: ["GitHub", "Cursor", "Claude"],
  },
  {
    title: "Get your knowledge out of your head",
    description:
      "Mental models, hard-won insights, pattern recognition built over a career - most people leave this locked up. You're going to compound it across every AI interaction, every single day.",
    badge: "Knowledge Moat",
    tools: ["Claude", "Obsidian", "Notion"],
  },
];

export const DEMO_PROMPT =
  "Pull our persona research and KPI targets, spawn agents to draft the product brief from our strategy taste docs, generate three design directions using our brand principles, and outline the architecture within our actual stack constraints.";

export const DEMO_STEPS = [
  { label: "Loading knowledge base context", progress: 85 },
  { label: "Spawning research synthesis agent", progress: 70 },
  { label: "Spawning design direction agents (3)", progress: 55 },
  { label: "Spawning architecture planning agent", progress: 65 },
  { label: "Agents complete - artifacts ready", progress: 100, done: true },
];

export const COMMAND_TABS = [
  {
    id: "human-ai",
    title: "Human + AI",
    description:
      "Shared workspaces where your team and AI actually work together with full context. Every interaction makes the AI sharper, the output more defensible, the gap wider. This is how moats compound.",
  },
  {
    id: "agent-orchestration",
    title: "Agent Orchestration",
    description:
      "A command layer for running agentic workflows grounded in your taste, craft, and domain knowledge. Your competitors get generic agents. You get agents that think like your best people. That's the whole game.",
  },
];

export const ROLE_TASKS = [
  "Write your taste and craft into a knowledge base",
  "Build domain context nobody else can copy",
  "Design agentic workflows that compound daily",
  "Create shared surfaces for your team + AI",
  "Encode your personas, KPIs, and strategic context",
  "Ship the moat that makes you irreplaceable",
];

export const INTEGRATIONS = [
  "Claude",
  "Cursor",
  "ChatGPT",
  "Notion",
  "Linear",
  "GitHub",
  "Figma",
  "VS Code",
  "Replit",
  "Obsidian",
  "Vercel",
  "Supabase",
  "Perplexity",
  "Slack",
  "Arc",
  "Framer",
];

export const STATS = [
  { value: 1, suffix: "%", label: "have actually built their moat" },
  { value: 99, suffix: "%", label: "still using AI like everyone else" },
  { value: 100, suffix: "x", label: "the gap between them" },
];

export const TESTIMONIALS = [
  {
    quote:
      "I wrote down my design taste and engineering constraints. That's it. Now Claude ships work that's unmistakably mine. Everyone else is getting the same generic output. Pretty wild.",
    name: "Sarah Chen",
    role: "Solo Founder, Design Engineer",
    initials: "SC",
    color: "#C8A2FF",
  },
  {
    quote:
      "We encoded our domain knowledge - regulatory constraints, customer personas, the whole technical debt map. Our competitors can copy our tools. They literally cannot copy our context. That's the moat.",
    name: "Marcus Rivera",
    role: "CTO at a Series B startup",
    initials: "MR",
    color: "#FFD6A5",
  },
  {
    quote:
      "The moat isn't the AI. The moat is what you feed it. Every agent we spawn now makes decisions with 10 years of institutional knowledge behind it. You can't buy that. You have to build it.",
    name: "Priya Sharma",
    role: "VP Product, Fintech",
    initials: "PS",
    color: "#A5D6FF",
  },
  {
    quote:
      "I went from using ChatGPT like everyone else to having AI coworkers that understand my craft, my taste, my constraints. That's the difference between commoditized and irreplaceable. It's night and day.",
    name: "James Okafor",
    role: "Indie Builder & Vibe Coder",
    initials: "JO",
    color: "#A5FFD6",
  },
];

export const LEARN_THEMES = [
  {
    id: "build-your-moat",
    label: "Build Your Moat",
    heading: "Become the one nobody can replace.",
    description:
      "Commoditized work earns commodity pay. Codify your taste, judgment, and domain expertise into a knowledge base your AI can wield - and you become the operator recruiters chase and clients pay a premium for. For teams, the same playbook turns institutional know-how into a defensible asset competitors can't copy. Either way: promotions, pricing power, and category leadership compound.",
  },
  {
    id: "craft-and-taste",
    label: "Craft & Taste",
    heading: "Turn AI from an outside contributor into a core teammate.",
    description:
      "Most people use AI like a freelancer they just met - generic prompts, generic answers, work that needs heavy rewriting. The unlock is treating it like a coworker who deeply understands your business: your methods, your customers, your standards, the unwritten rules that make you win. That's when AI stops producing drafts and starts producing work indistinguishable from yours.",
  },
  {
    id: "ship-faster",
    label: "Ship Faster",
    heading: "Cut time-to-market in half. Then in half again.",
    description:
      "Every day a project sits unfinished is income you don't earn and a competitor catching up. Solo, that means more billable wins and a portfolio that compounds. As a team, it means more experiments, faster learning loops, and a roadmap your board actually believes. Speed comes from killing context assembly and dead time - not working harder.",
  },
  {
    id: "ai-teams",
    label: "AI + Human Teams",
    heading: "Scale output without scaling hours or headcount.",
    description:
      "For an individual, AI peers let you punch three levels above your title - taking on the scope of a senior, lead, or department of one. For a company, they let a small team produce the output of a much larger one without the burn. Either way, the org chart and the calendar stop being the cap on ambition.",
  },
  {
    id: "scale",
    label: "Scale",
    heading: "Turn one operator's edge into a system that compounds.",
    description:
      "Individual productivity gains plateau. Compounding ones don't. Whether you're scaling your own practice or a growing team, this is how taste and knowledge propagate through shared systems - so every project ships at senior quality, every new hire is productive on day one, and the advantage shows up in retention, margin, and long-term enterprise value.",
  },
];

export const LEARN_PATHS = [
  {
    title: "Worried AI is making your skills generic? Build the knowledge base that makes them inimitable.",
    description: "Career: codified expertise becomes promotions, pricing power, and options no reorg can touch. Team: twelve months of compounded judgment competitors cannot buy. Business: a moat that widens weekly while everyone else runs the same tools.",
    themes: ["build-your-moat", "craft-and-taste"],
    primaryTheme: "build-your-moat",
    slug: "pillar-1-knowledge-management",
  },
  {
    title: "Tired of AI output that sounds like everyone's? Encode the specificity that makes it unmistakably yours.",
    description: "Career: stay irreplaceable while everyone else gets flattened. Team: output competitors recognize on sight. Business: stop competing on price because the work cannot be copied.",
    themes: ["craft-and-taste", "build-your-moat"],
    primaryTheme: "craft-and-taste",
    slug: "you-are-not-generic",
  },
  {
    title: "Stuck treating AI like a tool? Make it a true peer and watch your speed and quality skyrocket.",
    description: "Career: stop being the quality bottleneck on every draft. Team: work that meets your bar without your review. Business: ship more without hiring more and without sacrificing the craft that makes you valuable.",
    themes: ["craft-and-taste", "build-your-moat"],
    primaryTheme: "craft-and-taste",
    slug: "taste-through-ai",
  },
  {
    title: "Sick of AI shipping code that breaks in your stack? Here's how to make it write like a senior on your team.",
    description: "Career: engineers whose AI ships senior-quality code get promoted faster. Team: fewer review cycles, less rework, fewer 3am incidents. Business: the roadmap actually lands - on time.",
    themes: ["craft-and-taste", "ship-faster"],
    primaryTheme: "craft-and-taste",
    slug: "coding-in-craft",
  },
  {
    title: "Watching competitors ship while you're stuck in review? Cut your time-to-market without adding people.",
    description: "Career: more billable wins, a portfolio that compounds. Team: more learning loops per quarter. Business: a roadmap your board actually believes - and a market position competitors cannot catch from behind.",
    themes: ["ship-faster", "build-your-moat"],
    primaryTheme: "ship-faster",
    slug: "speed-to-market",
  },
  {
    title: "Using AI for the easy stuff and burning out on the hard stuff? Flip it with orchestration.",
    description: "Career: stop grinding on assembly, move up to judgment. Team: humans walk into decisions fully loaded, not half-prepared. Business: operations shift from reactive to predictive, margins follow.",
    themes: ["ship-faster", "ai-teams"],
    primaryTheme: "ship-faster",
    slug: "pillar-3-orchestration",
  },
  {
    title: "Need more output but can't get headcount approved? Add ten capable teammates without a single hire.",
    description: "Career: punch three levels above your title. Team: produce what a 50-person org produces without the burn. Business: stop being capped by the hiring market or the headcount plan.",
    themes: ["ai-teams", "ship-faster"],
    primaryTheme: "ai-teams",
    slug: "10x-team-ai-peers",
  },
  {
    title: "Your AI lives in one tab, your team in another? Build the shared space where they actually collaborate.",
    description: "Career: your context travels with you, no more starting from zero. Team: kill silos, kill status meetings, kill the coordination tax. Business: ship what used to take three departments to coordinate.",
    themes: ["ai-teams", "scale"],
    primaryTheme: "ai-teams",
    slug: "collaborative-spaces",
  },
  {
    title: "Hiring people who present well but ship slowly? Find the doers AI quietly turns into 10x performers.",
    description: "Career: stop competing on polish, start competing on output. Team: a compounding talent advantage that's hard to poach. Business: ship real work instead of more slide decks, and stop paying for performative productivity.",
    themes: ["ai-teams", "scale"],
    primaryTheme: "ai-teams",
    slug: "pillar-4-ai-native-teams",
  },
  {
    title: "Locked into tools that keep raising prices? Own your orchestration layer and rent everything else.",
    description: "Career: a stack that travels with you between jobs. Team: swap any vendor overnight without downtime. Business: stop being held hostage by vendor pricing or roadmap delays - buy what's convenient, own what's strategic.",
    themes: ["scale", "ship-faster"],
    primaryTheme: "scale",
    slug: "pillar-2-hub-and-spoke",
  },
  {
    title: "Worried your personal AI edge walks out the door if you do? Turn it into a company asset that compounds.",
    description: "Career: stay valuable to the company without being indispensable to every meeting. Team: institutional knowledge stops leaking when people leave. Business: enterprise value compounds in a way vendor subscriptions cannot.",
    themes: ["build-your-moat", "scale"],
    primaryTheme: "scale",
    slug: "building-moat-at-scale",
  },
  {
    title: "Terrified of being commoditized by AI? Become the operator who sets the new bar instead.",
    description: "Career: get paid for impact, not hours. Team: measure on operational outcomes, not activity. Business: promote the right people, price work at its actual value, and stop rewarding the wrong signals.",
    themes: ["craft-and-taste", "build-your-moat"],
    primaryTheme: "build-your-moat",
    slug: "pillar-5-performance-standards",
  },
  {
    title: "Sitting on 10,000 hours of expertise nobody pays for? Turn it into a monetisable asset that compounds.",
    description: "Career: ten years of craft becomes a deployable asset with a price tag. Team: clients buy outputs, not hours. Business: earning ceiling stops being capped by your calendar - revenue compounds on top of reputation.",
    themes: ["build-your-moat", "craft-and-taste"],
    primaryTheme: "build-your-moat",
    slug: "monetise-your-expertise",
  },
  {
    title: "Making big calls with only your own experience to draw on? Consult a thousand perspectives before each one.",
    description: "Career: decisions that hold up under scrutiny and compound your reputation. Team: catch cross-functional risks earlier, fewer painful surprises. Business: quarterly strategy stops running on vibes and starts running on evidence.",
    themes: ["craft-and-taste", "build-your-moat"],
    primaryTheme: "craft-and-taste",
    slug: "widen-your-context-window",
  },
];

export const FOOTER_LINKS = [
  { label: "Home", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "About", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

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
    heading: "Build the moat. Knowledge that can't be copied.",
    description:
      "Here's the thing - your taste, craft, and domain expertise are years of accumulated judgment. Codify them into a knowledge base and your AI becomes inimitable. Not just useful. Inimitable.",
  },
  {
    id: "craft-and-taste",
    label: "Craft & Taste",
    heading: "Make AI carry your craft. Not flatten it.",
    description:
      "Your judgment about strategy, design, hiring, pricing, voice, product direction - that's what makes your work yours. Here's how to make every AI interaction actually reflect it.",
  },
  {
    id: "ship-faster",
    label: "Ship Faster",
    heading: "Kill the dead time between decisions",
    description:
      "Speed doesn't come from working harder. It comes from eliminating context assembly, manual handoffs, and the workflow gaps where days just disappear. That's the real unlock.",
  },
  {
    id: "ai-teams",
    label: "AI + Human Teams",
    heading: "Build teams of humans and AI that actually ship",
    description:
      "Let's be honest - AI peers aren't assistants. They're team members with your context, your constraints, your quality bar. Here's how to collaborate with them like you mean it.",
  },
  {
    id: "scale",
    label: "Scale",
    heading: "What works for one needs to work for everyone",
    description:
      "Individual moats become company moats when the knowledge compounds across people. That's the architecture and culture piece. That's how you scale what can't be copied.",
  },
];

export const LEARN_PATHS = [
  {
    title: "The Path to Building Your Moat: Why Knowledge Bases Are the New Career Capital",
    description: "Your expertise was illiquid - locked in your head, accessible only one meeting at a time. The moment you financialize it through AI, the economics of your career change forever.",
    themes: ["build-your-moat", "craft-and-taste"],
    slug: "pillar-1-knowledge-management",
  },
  {
    title: "Find the Path to Making AI Carry Your Taste",
    description: "Your aesthetic instincts took years to develop. Here's how to stop letting AI flatten them and start making it produce work that's unmistakably yours.",
    themes: ["craft-and-taste", "build-your-moat"],
    slug: "taste-through-ai",
  },
  {
    title: "Walk the Path to Code That Carries Your Craft",
    description: "Generic AI ships generic code that breaks on contact with your reality. Give it your stack constraints, your patterns, your quality bar - and watch what happens.",
    themes: ["craft-and-taste", "ship-faster"],
    slug: "coding-in-craft",
  },
  {
    title: "The Path to Shipping in Weeks What Used to Take Quarters",
    description: "The teams shipping fastest aren't using better AI. They've killed the dead time between decisions. That's the whole trick.",
    themes: ["ship-faster", "build-your-moat"],
    slug: "speed-to-market",
  },
  {
    title: "Map the Path from AI Tasks to AI Workflows",
    description: "You're using AI for the easy parts and doing the hard parts by hand. That's backwards. The real 100x is in the orchestration.",
    themes: ["ship-faster", "ai-teams"],
    slug: "pillar-3-orchestration",
  },
  {
    title: "Follow the Path to Adding 10 Team Members - Without a Single Hire",
    description: "AI peers aren't assistants. They're team members with your context, your constraints, your quality bar. You just have to set them up right.",
    themes: ["ai-teams", "ship-faster"],
    slug: "10x-team-ai-peers",
  },
  {
    title: "Build the Path to Workspaces Where Humans and AI Actually Collaborate",
    description: "Your AI tools live in one tab. Your team lives in another. That's not collaboration. Here's how to build the shared space between them.",
    themes: ["ai-teams", "scale"],
    slug: "collaborative-spaces",
  },
  {
    title: "Learn the Path to Hiring Doers Over Talkers",
    description: "AI amplifies what's already there. Give it to doers and they ship 10x. Give it to talkers and you get 10x more slide decks. Hire accordingly.",
    themes: ["ai-teams", "scale"],
    slug: "pillar-4-ai-native-teams",
  },
  {
    title: "See the Path to Owning the Center and Renting the Edges",
    description: "The builders who own their orchestration layer can swap any tool overnight. Everyone else is locked in and praying their vendor doesn't change the pricing.",
    themes: ["scale", "ship-faster"],
    slug: "pillar-2-hub-and-spoke",
  },
  {
    title: "Chart the Path from Individual Moat to Company Moat",
    description: "Your personal knowledge base is a career moat. Your company's knowledge base is a competitive moat. Here's how to bridge the gap.",
    themes: ["build-your-moat", "scale"],
    slug: "building-moat-at-scale",
  },
  {
    title: "The Path from Commoditized to Irreplaceable",
    description: "AI-assisted work is the new baseline. The builders who measure impact over effort are pulling away from everyone else. Which side are you on?",
    themes: ["craft-and-taste", "build-your-moat"],
    slug: "pillar-5-performance-standards",
  },
  {
    title: "Follow the Path to Monetising Your Expertise: Turn 10,000 Hours Into a Compounding Asset",
    description: "Your years of craft, taste, and opinion were previously impossible to scale. Path turns illiquid expertise into a deployable, monetisable asset that compounds.",
    themes: ["build-your-moat", "craft-and-taste"],
    slug: "monetise-your-expertise",
  },
];

export const FOOTER_LINKS = [
  { label: "Home", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "About", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

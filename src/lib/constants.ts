export const NAV_ITEMS = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Agents", href: "#agents" },
  { label: "Surfaces", href: "#surfaces" },
  { label: "Stack", href: "#stack" },
  { label: "Builders", href: "#builders" },
  { label: "Writing", href: "#writing" },
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
    title: "Document your taste and craft",
    description:
      "Your aesthetic instincts and quality bar are years of pattern recognition no one else has. Codify them, and your AI produces work that's unmistakably yours — not the same generic output everyone else gets.",
    badge: "Career Moat",
    tools: ["Claude", "Notion", "Figma"],
  },
  {
    title: "Map your personas and KPIs",
    description:
      "Deep customer context is what separates strategy from guesswork. Encode who you're building for and what success looks like — your AI peers will make decisions competitors can't replicate.",
    badge: "Company Moat",
    tools: ["Linear", "Notion", "Amplitude"],
  },
  {
    title: "Capture your domain knowledge",
    description:
      "Regulatory constraints, business dynamics, institutional knowledge — the context that took years to accumulate. This is the moat that makes your company's AI work inimitable.",
    badge: "Domain Moat",
    tools: ["Obsidian", "Notion", "GitHub"],
  },
  {
    title: "Build an ideas backlog AI can reason over",
    description:
      "While others prompt from scratch, your agents draw on a structured universe of hypotheses, experiments, and insights. The compounding advantage of a curated mind.",
    badge: "Ideas Moat",
    tools: ["Notion", "Linear", "Claude"],
  },
  {
    title: "Define your engineering capabilities",
    description:
      "Your stack, its seams, its strengths — AI that understands your real constraints ships code that actually works. Generic AI ships generic code that breaks on contact with your reality.",
    badge: "Technical Moat",
    tools: ["GitHub", "Cursor", "Claude"],
  },
  {
    title: "Codify your unique knowledge",
    description:
      "Mental models, hard-won insights, pattern recognition built over a career. Most people leave this locked in their heads. You'll compound it across every AI interaction, every day.",
    badge: "Knowledge Moat",
    tools: ["Claude", "Obsidian", "Notion"],
  },
];

export const DEMO_PROMPT =
  "Analyze our persona research and KPI targets, then spawn agents to draft the product brief, generate three design directions based on our taste docs, and outline the technical architecture within our stack constraints.";

export const DEMO_STEPS = [
  { label: "Loading knowledge base context", progress: 85 },
  { label: "Spawning research synthesis agent", progress: 70 },
  { label: "Spawning design direction agents (3)", progress: 55 },
  { label: "Spawning architecture planning agent", progress: 65 },
  { label: "Agents complete — artifacts ready", progress: 100, done: true },
];

export const COMMAND_TABS = [
  {
    id: "human-ai",
    title: "Human + AI",
    description:
      "Shared workspaces where your team and AI agents collaborate with full context from your knowledge base. Every interaction deepens your moat — the AI gets sharper, the output gets more defensible, the gap widens.",
  },
  {
    id: "agent-orchestration",
    title: "Agent Orchestration",
    description:
      "A command layer for managing agentic workflows grounded in your taste, craft, and domain knowledge. Your competitors get generic agents. You get agents that think like your best people.",
  },
];

export const ROLE_TASKS = [
  "Map your taste and craft into a knowledge base",
  "Build domain context your competitors can't copy",
  "Design agentic workflows that compound daily",
  "Create collaboration surfaces for your team + AI",
  "Encode personas, KPIs, and strategic context",
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
  { value: 1, suffix: "%", label: "of builders who've built their moat" },
  { value: 99, suffix: "%", label: "still using AI like everyone else" },
  { value: 100, suffix: "x", label: "the gap between them" },
];

export const TESTIMONIALS = [
  {
    quote:
      "I documented my design taste and engineering constraints in a knowledge base. Now Claude ships work that's unmistakably mine. My competitors are all getting the same generic output.",
    name: "Sarah Chen",
    role: "Solo Founder, Design Engineer",
    initials: "SC",
    color: "#C8A2FF",
  },
  {
    quote:
      "We encoded our domain knowledge — regulatory constraints, customer personas, technical debt map — into our AI stack. Our competitors can copy our tools. They can't copy our context.",
    name: "Marcus Rivera",
    role: "CTO at a Series B startup",
    initials: "MR",
    color: "#FFD6A5",
  },
  {
    quote:
      "The moat isn't the AI. The moat is what you feed it. Our knowledge base means every agent we spawn makes decisions with 10 years of institutional knowledge behind it.",
    name: "Priya Sharma",
    role: "VP Product, Fintech",
    initials: "PS",
    color: "#A5D6FF",
  },
  {
    quote:
      "I went from 'using ChatGPT like everyone else' to having AI coworkers that understand my craft, my taste, and my constraints. That's the difference between commoditized and irreplaceable.",
    name: "James Okafor",
    role: "Indie Builder & Vibe Coder",
    initials: "JO",
    color: "#A5FFD6",
  },
];

export const BLOG_POSTS = [
  {
    author: "Path to 100x",
    title: "The 1% Who Built Their Moat: Why Knowledge Bases Are the New Career Capital",
  },
  {
    author: "Path to 100x",
    title: "Your Company's AI Is Only as Good as the Context You Give It",
  },
  {
    author: "Path to 100x",
    title: "Commoditized vs. Irreplaceable: The Builder Who Wields the Moat",
  },
];

export const FOOTER_LINKS = [
  { label: "Home", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "About", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

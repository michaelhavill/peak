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
      "Your aesthetic instincts, design principles, and quality bar — codified so AI can build with your sensibility, not generic defaults.",
    badge: "Taste & Craft",
    tools: ["Claude", "Notion", "Figma"],
  },
  {
    title: "Map your personas and KPIs",
    description:
      "Give your AI peers deep context on who you're building for and what success looks like. They'll make better decisions with every prompt.",
    badge: "Context Layer",
    tools: ["Linear", "Notion", "Amplitude"],
  },
  {
    title: "Capture your domain knowledge",
    description:
      "Regulatory environment, business constraints, engineering capabilities — the unique knowledge that makes your work defensible.",
    badge: "Domain Intel",
    tools: ["Obsidian", "Notion", "GitHub"],
  },
  {
    title: "Build an ideas backlog AI can reason over",
    description:
      "Structure your ideas, hypotheses, and experiments so agents can connect dots, surface patterns, and propose next moves.",
    badge: "Ideas Engine",
    tools: ["Notion", "Linear", "Claude"],
  },
  {
    title: "Define your engineering capabilities",
    description:
      "What your stack can do, what it can't, and where the seams are. AI that understands your constraints ships better code.",
    badge: "Tech Context",
    tools: ["GitHub", "Cursor", "Claude"],
  },
  {
    title: "Codify your unique knowledge",
    description:
      "The hard-won insights, mental models, and pattern recognition that took years to develop — now amplified across every AI interaction.",
    badge: "Knowledge Base",
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
      "Shared workspaces where your team and AI agents collaborate in real-time — reviewing artifacts, iterating on decisions, and building together with full context.",
  },
  {
    id: "agent-orchestration",
    title: "Agent Orchestration",
    description:
      "A command layer for managing agentic workflows — monitoring spawned agents, reviewing outputs, approving decisions, and keeping humans in the loop where it matters.",
  },
];

export const ROLE_TASKS = [
  "Knowledge base architecture setup",
  "Taste document creation workshop",
  "Agent workflow design sprint",
  "Collaboration surface configuration",
  "Persona & KPI context mapping",
  "Agentic deployment pipeline",
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
  { value: 100, suffix: "x", label: "output multiplier with AI peers" },
  { value: 24, suffix: "/7", label: "agents working your knowledge" },
  { value: 1, suffix: "", label: "builder is all it takes" },
];

export const TESTIMONIALS = [
  {
    quote:
      "I documented my design taste and engineering constraints in a knowledge base. Now Claude ships work that actually feels like mine — not generic AI output.",
    name: "Sarah Chen",
    role: "Solo Founder, Design Engineer",
    initials: "SC",
    color: "#C8A2FF",
  },
  {
    quote:
      "The agentic workflow changed everything. I describe the outcome, agents spawn agents, and I review artifacts instead of writing every brief myself.",
    name: "Marcus Rivera",
    role: "Product Lead at a Series B startup",
    initials: "MR",
    color: "#FFD6A5",
  },
  {
    quote:
      "Building a knowledge base of our personas, KPIs, and domain constraints meant our AI collaborators make decisions with the same context we do.",
    name: "Priya Sharma",
    role: "VP Product, Fintech",
    initials: "PS",
    color: "#A5D6FF",
  },
  {
    quote:
      "I went from 'I can use ChatGPT' to having a fleet of AI coworkers that understand my craft, my constraints, and my taste. That's the real 100x.",
    name: "James Okafor",
    role: "Indie Builder & Vibe Coder",
    initials: "JO",
    color: "#A5FFD6",
  },
];

export const BLOG_POSTS = [
  {
    author: "Path to 100x",
    title: "Knowledge Bases Are the New Moat: Why Documenting Your Taste Matters",
  },
  {
    author: "Path to 100x",
    title: "Agents Spawning Agents: The Architecture of Agentic Workflows",
  },
  {
    author: "Path to 100x",
    title: "Building Collaboration Surfaces for Humans and Robots",
  },
];

export const FOOTER_LINKS = [
  { label: "Home", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "About", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

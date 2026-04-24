"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import PretextReveal from "./PretextReveal";

const MOAT_PILLARS = [
  {
    title: "Taste",
    subtitle: "Your judgment can't be replicated",
    description:
      "Every call you've made about what's good - a product direction, a hire, a pricing model, a design choice - that's years of pattern recognition. AI can't replicate it on its own. Write it down, and now it can.",
  },
  {
    title: "Craft",
    subtitle: "Your process is your edge",
    description:
      "How you scope a problem, structure a brief, review a design, ship a feature - that's uniquely yours. Codify it and every AI interaction compounds your way of working. That's the game.",
  },
  {
    title: "Knowledge",
    subtitle: "Your context is irreplaceable",
    description:
      "Personas, KPIs, regulatory constraints, technical debt, market dynamics - the hard-won understanding of your specific domain. This is what turns generic AI into something that actually thinks like your best people.",
  },
];

export default function KnowledgeMoat() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="moat"
      className="py-20 md:py-28 px-8 md:px-16 lg:px-20"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-[12px] font-medium uppercase tracking-widest mb-5"
          style={{ color: "var(--text-secondary)" }}
        >
          The next moat
        </motion.p>
        <PretextReveal
          text="Everyone has access to the same AI. Your taste, craft, and knowledge are what make it yours. That's the whole moat."
          font="42px 'Instrument Serif'"
          className="text-[32px] md:text-[42px] leading-[1.1] mb-5"
          style={{
            fontFamily: "var(--font-instrument-serif)",
            color: "var(--text-primary)",
          }}
          lineDelay={0.08}
          duration={0.5}
          y={14}
        />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[15px] max-w-2xl mb-16 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Here&apos;s what&apos;s actually happening: the models are commoditizing. The prompts are public. The tools are the same. So what can&apos;t be copied? The knowledge you put into your AI stack - years of judgment, domain expertise, creative instinct. That&apos;s the moat. For your career and your business.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-px bg-[var(--border-subtle)] rounded-xl overflow-hidden border border-[var(--border-subtle)]">
          {MOAT_PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              className="p-7 flex flex-col"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div
                className="text-[42px] md:text-[54px] leading-none mb-4"
                style={{
                  fontFamily: "var(--font-instrument-serif)",
                  color: "var(--text-primary)",
                }}
              >
                {pillar.title}
              </div>
              <div
                className="text-[14px] font-medium mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {pillar.subtitle}
              </div>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 rounded-xl p-7"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
            <div className="flex-1">
              <h3
                className="text-[15px] font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Without your knowledge base
              </h3>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Generic output anyone could get. Same prompts, same results, same commoditized work. You&apos;re competing on speed alone - and that&apos;s a race to the bottom.
              </p>
            </div>
            <div
              className="hidden md:block w-px h-16"
              style={{ backgroundColor: "var(--border-subtle)" }}
            />
            <div className="flex-1">
              <h3
                className="text-[15px] font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                With your knowledge base
              </h3>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Work that carries your judgment. Matches your taste. Respects your constraints. You&apos;re competing on depth - and depth compounds. That&apos;s the answer.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

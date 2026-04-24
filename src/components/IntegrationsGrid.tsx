"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import EmailCapture from "./EmailCapture";

const STACK_PREVIEWS = [
  "AI Coding",
  "Knowledge Bases",
  "Design Systems",
  "Orchestration",
  "Context Engines",
  "Deployment",
];

export default function IntegrationsGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="stack"
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
          The stack
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-[32px] md:text-[42px] leading-[1.1] mb-4"
          style={{
            fontFamily: "var(--font-instrument-serif)",
            color: "var(--text-primary)",
          }}
        >
          The exact tools I use to build a moat
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[15px] max-w-2xl mb-12 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Every method in the playbook has a specific stack behind it -
          the tools, configurations, and workflows that make it real.
          Sign up for early access and I&apos;ll send you the full breakdown.
        </motion.p>

        {/* Stack category preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12"
        >
          {STACK_PREVIEWS.map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
              className="flex items-center gap-3 py-4 px-5 rounded-xl"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: "var(--accent-highlight)" }}
              />
              <span
                className="text-[13px] font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Email capture */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-md"
        >
          <p
            className="text-[12px] font-medium uppercase tracking-wider mb-3"
            style={{ color: "var(--text-tertiary)" }}
          >
            Get early access
          </p>
          <EmailCapture variant="compact" />
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import TypingAnimation from "./TypingAnimation";
import { DEMO_PROMPT, DEMO_STEPS } from "@/lib/constants";

export default function InteractiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="agents" className="py-20 md:py-28 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-5xl" ref={ref}>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-xl md:text-2xl font-medium mb-4">Agents that actually carry your context</motion.h2>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.05 }} className="text-[15px] mb-12" style={{ color: "var(--text-secondary)" }}>
          Everyone has agents. Here&apos;s why yours are different - they spawn across your knowledge base, carrying your taste, your domain expertise, your actual constraints. The output is inimitable. That&apos;s the point.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }} className="grid md:grid-cols-2 gap-5">
          <div className="rounded-xl p-6" style={{ border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--text-primary)" }} />
              <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Your Intent</span>
            </div>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-primary)" }}>&ldquo;<TypingAnimation text={DEMO_PROMPT} speed={40} />&rdquo;</p>
          </div>
          <div className="rounded-xl p-6" style={{ border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--text-secondary)" }} />
              <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Agent Swarm</span>
            </div>
            <div className="space-y-4">
              {DEMO_STEPS.map((step, i) => (
                <motion.div key={step.label} initial={{ opacity: 0, x: 8 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.4, delay: 0.4 + i * 0.25 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[14px] font-medium" style={{ color: step.done ? "var(--text-secondary)" : "var(--text-primary)" }}>
                      {step.done && <svg className="inline-block mr-1.5 -mt-0.5" width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      {step.label}
                    </span>
                    {!step.done && <span className="text-[12px] tabular-nums" style={{ color: "var(--text-secondary)" }}>{step.progress}%</span>}
                  </div>
                  {!step.done && (
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: "var(--text-primary)" }} initial={{ width: "0%" }} animate={isInView ? { width: `${step.progress}%` } : { width: "0%" }} transition={{ duration: 1, delay: 0.6 + i * 0.25 }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

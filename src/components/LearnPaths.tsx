"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { LEARN_THEMES, LEARN_PATHS } from "@/lib/constants";

export default function LearnPaths() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTheme, setActiveTheme] = useState("all");

  const filtered =
    activeTheme === "all"
      ? LEARN_PATHS
      : LEARN_PATHS.filter((p) => p.themes.includes(activeTheme));

  return (
    <section
      id="learn"
      className="py-20 md:py-28 px-8 md:px-16 lg:px-20"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-5xl" ref={ref}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-[12px] font-medium uppercase tracking-widest mb-5"
          style={{ color: "var(--text-secondary)" }}
        >
          Learn paths
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
          The moat builder&apos;s playbook
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[15px] max-w-2xl mb-10 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Practical paths for builders who want to make AI carry their taste,
          scale their team, and ship work that can&apos;t be copied.
        </motion.p>

        {/* Theme filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {LEARN_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setActiveTheme(theme.id)}
              className="text-[12px] px-4 py-1.5 rounded-full font-medium transition-all duration-200"
              style={{
                backgroundColor:
                  activeTheme === theme.id
                    ? "var(--text-primary)"
                    : "var(--bg-elevated)",
                color:
                  activeTheme === theme.id
                    ? "var(--bg-primary)"
                    : "var(--text-secondary)",
              }}
            >
              {theme.label}
            </button>
          ))}
        </motion.div>

        {/* Path list */}
        <div className="space-y-0">
          <AnimatePresence mode="popLayout">
            {filtered.map((path, i) => (
              <motion.a
                key={path.slug}
                href={`/blog/${path.slug}`}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="flex items-start justify-between py-6 group cursor-pointer"
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div className="flex-1 pr-8">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {path.themes.map((t) => {
                      const theme = LEARN_THEMES.find((th) => th.id === t);
                      return (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider"
                          style={{
                            backgroundColor: "var(--bg-elevated)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {theme?.label}
                        </span>
                      );
                    })}
                  </div>
                  <div
                    className="text-[15px] font-medium group-hover:underline mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {path.title}
                  </div>
                  <div
                    className="text-[13px] leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {path.description}
                  </div>
                </div>
                <svg
                  className="w-4 h-4 flex-shrink-0 mt-8 transition-transform group-hover:translate-x-1"
                  style={{ color: "var(--text-secondary)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

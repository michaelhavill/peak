"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { LEARN_THEMES, LEARN_PATHS } from "@/lib/constants";

function ThemeSection({
  theme,
  paths,
  isInView,
  sectionIndex,
}: {
  theme: (typeof LEARN_THEMES)[number];
  paths: typeof LEARN_PATHS;
  isInView: boolean;
  sectionIndex: number;
}) {
  const baseDelay = sectionIndex * 0.1;

  return (
    <div className="mb-16 last:mb-0">
      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: baseDelay }}
        className="text-[24px] md:text-[30px] leading-[1.15] mb-2"
        style={{
          fontFamily: "var(--font-instrument-serif)",
          color: "var(--text-primary)",
        }}
      >
        {theme.heading}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: baseDelay + 0.05 }}
        className="text-[14px] max-w-2xl mb-8 leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {theme.description}
      </motion.p>

      <div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-px rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--border-subtle)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {paths.map((path, i) => (
          <motion.a
            key={path.slug}
            href={`/blog/${path.slug}`}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.4,
              delay: baseDelay + 0.1 + i * 0.06,
            }}
            className="flex flex-col p-6 transition-colors duration-200 group"
            style={{ backgroundColor: "var(--bg-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--bg-elevated)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--bg-secondary)")
            }
          >
            <div className="flex flex-wrap gap-1.5 mb-3">
              {path.themes.map((t) => {
                const th = LEARN_THEMES.find((x) => x.id === t);
                return (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {th?.label ?? t}
                  </span>
                );
              })}
            </div>
            <div
              className="text-[15px] font-medium mb-2 group-hover:underline leading-snug"
              style={{ color: "var(--text-primary)" }}
            >
              {path.title}
            </div>
            <p
              className="text-[13px] leading-relaxed flex-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {path.description}
            </p>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

export default function LearnPaths() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTheme, setActiveTheme] = useState("all");

  const visibleThemes =
    activeTheme === "all"
      ? LEARN_THEMES
      : LEARN_THEMES.filter((t) => t.id === activeTheme);

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
          className="flex flex-wrap gap-2 mb-14"
        >
          <button
            onClick={() => setActiveTheme("all")}
            className="text-[12px] px-4 py-1.5 rounded-full font-medium transition-all duration-200"
            style={{
              backgroundColor:
                activeTheme === "all"
                  ? "var(--text-primary)"
                  : "var(--bg-elevated)",
              color:
                activeTheme === "all"
                  ? "var(--bg-primary)"
                  : "var(--text-secondary)",
            }}
          >
            All Paths
          </button>
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

        {/* Theme sections */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTheme}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {visibleThemes.map((theme, si) => {
              const paths = LEARN_PATHS.filter((p) =>
                p.themes.includes(theme.id)
              );
              if (paths.length === 0) return null;
              return (
                <ThemeSection
                  key={theme.id}
                  theme={theme}
                  paths={paths}
                  isInView={isInView}
                  sectionIndex={si}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

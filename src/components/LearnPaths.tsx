"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { LEARN_THEMES, LEARN_PATHS } from "@/lib/constants";

const THEME_COLORS: Record<string, { bg: string; text: string }> = {
  "build-your-moat": { bg: "#EAF0E8", text: "#4A7550" },
  "craft-and-taste": { bg: "#EDE8F5", text: "#6B5A8A" },
  "ship-faster":     { bg: "#F5EDE6", text: "#8A5A38" },
  "ai-teams":        { bg: "#E6EEF5", text: "#3A5C8A" },
  "scale":           { bg: "#F5E8EE", text: "#8A3A5C" },
};

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
  const themeColor = THEME_COLORS[theme.id];
  const chapterNum = String(sectionIndex + 1).padStart(2, "0");

  return (
    <div className="mb-28 last:mb-0">
      {/* Chapter header band */}
      <div
        className="relative mb-10 pt-10 pl-6 md:pl-10"
        style={{
          borderTop: `1px solid var(--border-subtle)`,
        }}
      >
        {/* Color accent bar */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.6, delay: baseDelay }}
          className="absolute left-0 top-10 bottom-0 w-1 rounded-full origin-top"
          style={{ backgroundColor: themeColor?.text ?? "var(--text-primary)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: baseDelay }}
          className="flex items-center gap-3 mb-5"
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: themeColor?.bg ?? "var(--bg-elevated)",
              color: themeColor?.text ?? "var(--text-secondary)",
            }}
          >
            Chapter {chapterNum}
          </span>
          <span
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-secondary)" }}
          >
            {theme.label}
          </span>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: baseDelay + 0.05 }}
          className="text-[34px] md:text-[48px] leading-[1.05] mb-5 max-w-3xl tracking-tight"
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
          transition={{ duration: 0.5, delay: baseDelay + 0.1 }}
          className="text-[16px] md:text-[17px] max-w-2xl leading-[1.6]"
          style={{ color: "var(--text-secondary)" }}
        >
          {theme.description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: baseDelay + 0.15 }}
          className="mt-6 text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--text-secondary)" }}
        >
          {paths.length} {paths.length === 1 ? "article" : "articles"} in this chapter
        </motion.div>
      </div>

      <div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-px rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--border-subtle)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {paths.map((path, i) => {
          return (
            <motion.a
              key={path.slug}
              href={`/blog/${path.slug}`}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: baseDelay + 0.1 + i * 0.06,
              }}
              className="flex flex-col p-7 transition-colors duration-200 group relative"
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
              <div
                className="text-[10px] font-medium uppercase tracking-[0.18em] mb-4"
                style={{ color: themeColor?.text ?? "var(--text-secondary)" }}
              >
                Article {String(i + 1).padStart(2, "0")}
              </div>
              <div
                className="text-[16px] md:text-[17px] font-semibold mb-3 leading-[1.4]"
                style={{ color: "var(--text-primary)" }}
              >
                {path.title}
              </div>
              <p
                className="text-[13px] leading-[1.6] flex-1 mb-5"
                style={{ color: "var(--text-secondary)" }}
              >
                {path.description}
              </p>
              <div
                className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                Read article
                <span aria-hidden="true">→</span>
              </div>
            </motion.a>
          );
        })}
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
          Your learning path
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
          The paths that get you there
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[15px] max-w-2xl mb-10 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Each article is a mental model - a new way of thinking about yourself,
          your craft, and how AI amplifies both. Read one, change how you work.
          Read them all, become someone who can&apos;t be copied.
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

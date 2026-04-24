"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { LEARN_THEMES, LEARN_PATHS } from "@/lib/constants";

const THEME_COLORS: Record<string, { bg: string; text: string }> = {
  "build-your-moat": { bg: "#EAF0E8", text: "#4A7550" },
  "craft-and-taste": { bg: "#EDE8F5", text: "#6B5A8A" },
  "ship-faster":     { bg: "#F5EDE6", text: "#8A5A38" },
  "ai-teams":        { bg: "#E6EEF5", text: "#3A5C8A" },
  "scale":           { bg: "#F5E8EE", text: "#8A3A5C" },
};

const READ_STORAGE_KEY = "read_articles";

function ReadBadge({
  themeColor,
}: {
  themeColor?: { bg: string; text: string };
}) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: themeColor?.bg ?? "var(--bg-elevated)",
        color: themeColor?.text ?? "var(--text-secondary)",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path
          d="M1.5 5.5L4 8l4.5-6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Read
    </span>
  );
}

function ThemeSection({
  theme,
  primaryPaths,
  relatedPaths,
  isInView,
  sectionIndex,
  readSlugs,
  mounted,
}: {
  theme: (typeof LEARN_THEMES)[number];
  primaryPaths: typeof LEARN_PATHS;
  relatedPaths: typeof LEARN_PATHS;
  isInView: boolean;
  sectionIndex: number;
  readSlugs: Set<string>;
  mounted: boolean;
}) {
  const baseDelay = sectionIndex * 0.1;
  const themeColor = THEME_COLORS[theme.id];
  const chapterNum = String(sectionIndex + 1).padStart(2, "0");

  const totalPaths = primaryPaths.length + relatedPaths.length;
  const readCount = mounted
    ? [...primaryPaths, ...relatedPaths].filter((p) => readSlugs.has(p.slug))
        .length
    : 0;

  return (
    <div id={theme.id} className="mb-28 last:mb-0 scroll-mt-28 md:scroll-mt-32">
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
            className="text-[13px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: themeColor?.bg ?? "var(--bg-elevated)",
              color: themeColor?.text ?? "var(--text-secondary)",
            }}
          >
            Chapter {chapterNum}
          </span>
          <span
            className="text-[13px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-secondary)" }}
          >
            {theme.label}
          </span>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: baseDelay + 0.05 }}
          className="text-[40px] md:text-[58px] leading-[1.05] mb-5 max-w-3xl tracking-tight"
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
          className="text-[18px] md:text-[19px] max-w-2xl leading-[1.6]"
          style={{ color: "var(--text-secondary)" }}
        >
          {theme.description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: baseDelay + 0.15 }}
          className="mt-6 text-[13px] font-medium uppercase tracking-[0.18em] flex items-center gap-3"
          style={{ color: "var(--text-secondary)" }}
        >
          <span>
            {primaryPaths.length}{" "}
            core {primaryPaths.length === 1 ? "article" : "articles"}
            {relatedPaths.length > 0 && (
              <>
                {" "}&middot; {relatedPaths.length} related
              </>
            )}
          </span>
          {mounted && totalPaths > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-[12px] font-semibold"
              style={{
                backgroundColor:
                  readCount > 0
                    ? themeColor?.bg ?? "var(--bg-elevated)"
                    : "var(--bg-elevated)",
                color:
                  readCount > 0
                    ? themeColor?.text ?? "var(--text-secondary)"
                    : "var(--text-tertiary)",
              }}
            >
              {readCount} of {totalPaths} read
            </span>
          )}
        </motion.div>
      </div>

      {/* Primary (flagship) cards */}
      <div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-px rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--border-subtle)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {primaryPaths.map((path, i) => {
          const isRead = mounted && readSlugs.has(path.slug);
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
              className="flex flex-col transition-colors duration-200 group relative"
              style={{
                backgroundColor: "var(--bg-secondary)",
                opacity: isRead ? 0.85 : 1,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--bg-elevated)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--bg-secondary)")
              }
            >
              {/* Editorial hero image */}
              <div
                className="relative aspect-square overflow-hidden"
                style={{ backgroundColor: themeColor?.bg ?? "var(--bg-elevated)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/blog/${path.slug}/hero.png`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ filter: isRead ? "saturate(0.85)" : "none" }}
                />
                {isRead && (
                  <div className="absolute top-3 right-3">
                    <ReadBadge themeColor={themeColor} />
                  </div>
                )}
              </div>

              {/* Text content */}
              <div className="flex flex-col p-7 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-[12px] font-medium uppercase tracking-[0.18em]"
                    style={{
                      color: themeColor?.text ?? "var(--text-secondary)",
                    }}
                  >
                    Core learning path
                  </span>
                  <span
                    className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[12px] font-semibold"
                    style={{
                      backgroundColor:
                        themeColor?.text ?? "var(--text-primary)",
                      color: themeColor?.bg ?? "var(--bg-primary)",
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <div
                  className="text-[19px] md:text-[22px] font-semibold mb-3 leading-[1.3]"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-instrument-serif)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {path.title}
                </div>
                <p
                  className="text-[15px] leading-[1.6] flex-1 mb-5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {path.description}
                </p>
                <div
                  className="flex items-center gap-1.5 text-[13px] font-medium uppercase tracking-[0.14em] transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {isRead ? "Revisit article" : "Read article"}
                  <span aria-hidden="true">→</span>
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* Related reading */}
      {relatedPaths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: baseDelay + 0.2 }}
          className="mt-10"
        >
          <div
            className="flex items-center gap-3 mb-4 pl-6 md:pl-10"
          >
            <span
              className="text-[12px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "var(--text-secondary)" }}
            >
              Related reading from other chapters
            </span>
            <span
              className="flex-1 h-px"
              style={{ backgroundColor: "var(--border-subtle)" }}
            />
          </div>
          <div
            className="grid md:grid-cols-2 gap-px rounded-xl overflow-hidden"
            style={{
              backgroundColor: "var(--border-subtle)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {relatedPaths.map((path) => {
              const isRead = mounted && readSlugs.has(path.slug);
              const homeTheme =
                LEARN_THEMES.find((t) => t.id === path.primaryTheme) ?? null;
              const homeColor = homeTheme
                ? THEME_COLORS[homeTheme.id]
                : undefined;
              return (
                <a
                  key={path.slug}
                  href={`/blog/${path.slug}`}
                  className="flex items-stretch gap-4 p-4 transition-colors duration-200 group"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    opacity: isRead ? 0.85 : 1,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--bg-elevated)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--bg-secondary)")
                  }
                >
                  {/* Thumbnail */}
                  <div
                    className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-md overflow-hidden"
                    style={{
                      backgroundColor: homeColor?.bg ?? "var(--bg-elevated)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/blog/${path.slug}/hero.png`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      style={{ filter: isRead ? "saturate(0.85)" : "none" }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="text-[12px] font-medium uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Related
                      </span>
                      {homeTheme && (
                        <span
                          className="text-[12px] font-medium uppercase tracking-[0.14em]"
                          style={{
                            color: homeColor?.text ?? "var(--text-secondary)",
                          }}
                        >
                          from {homeTheme.label}
                        </span>
                      )}
                      {isRead && (
                        <span className="ml-auto">
                          <ReadBadge themeColor={homeColor} />
                        </span>
                      )}
                    </div>
                    <div
                      className="text-[16px] md:text-[17px] font-semibold leading-[1.4] mb-1 group-hover:translate-x-0.5 transition-transform duration-200"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {path.title}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function LearnPaths() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTheme, setActiveTheme] = useState("all");
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // When someone navigates to #<theme-id> (e.g. from the top nav), reset the
  // filter so every chapter renders and scroll the chapter into view. Because
  // the chapter list is wrapped in <AnimatePresence mode="wait">, the old
  // panel has to finish exiting before the target element mounts - so we poll
  // for the element with rAF and scroll as soon as it appears.
  useEffect(() => {
    const themeIds = new Set(LEARN_THEMES.map((t) => t.id));

    const scrollToHashWhenReady = (id: string) => {
      let attempts = 0;
      const tick = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        if (attempts++ < 60) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    };

    const handleHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (themeIds.has(hash)) {
        setActiveTheme("all");
        scrollToHashWhenReady(hash);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Read localStorage once on mount so cards and counters can render as read.
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(READ_STORAGE_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setReadSlugs(new Set(list));
    } catch {
      // ignore
    }
  }, []);

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
      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-[14px] font-medium uppercase tracking-widest mb-5"
          style={{ color: "var(--text-secondary)" }}
        >
          Your learning path
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-[38px] md:text-[50px] leading-[1.1] mb-4"
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
          className="text-[17px] max-w-2xl mb-10 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Each chapter has a handful of core reads plus related articles
          from nearby chapters. Articles you&apos;ve already read are marked
          so you can see progress at a glance.
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
            className="text-[14px] px-4 py-1.5 rounded-full font-medium transition-all duration-200"
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
              className="text-[14px] px-4 py-1.5 rounded-full font-medium transition-all duration-200"
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
              const primaryPaths = LEARN_PATHS.filter(
                (p) => p.primaryTheme === theme.id
              );
              const relatedPaths = LEARN_PATHS.filter(
                (p) =>
                  p.themes.includes(theme.id) && p.primaryTheme !== theme.id
              );
              if (primaryPaths.length === 0 && relatedPaths.length === 0)
                return null;
              return (
                <ThemeSection
                  key={theme.id}
                  theme={theme}
                  primaryPaths={primaryPaths}
                  relatedPaths={relatedPaths}
                  isInView={isInView}
                  sectionIndex={si}
                  readSlugs={readSlugs}
                  mounted={mounted}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

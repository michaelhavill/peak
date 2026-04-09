"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LEARN_THEMES } from "@/lib/constants";
import SubscribeModal from "./SubscribeModal";

// Build chapter nav items from the canonical learning-path themes so the
// header menu stays in sync with LearnPaths. Hrefs resolve to /#<theme-id>
// so they work from any route (blog posts included).
const CHAPTER_NAV_ITEMS = LEARN_THEMES.map((t) => ({
  label: t.label,
  href: `/#${t.id}`,
}));

export default function TopNav() {
  const pathname = usePathname();
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hide on dev-only preview routes where an overlay would be intrusive
  const hidden = pathname?.startsWith("/social-cards");

  // Only the home page has a dark hero video behind the nav.
  // On every other route, treat the nav as if it were scrolled so the
  // dark-text-on-frosted-glass styling is always applied.
  const hasDarkHero = pathname === "/";
  const useDarkTheme = !hasDarkHero || scrolled;

  useEffect(() => {
    if (!hasDarkHero) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasDarkHero]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  const glassStyle: React.CSSProperties = {
    background: useDarkTheme
      ? "rgba(255, 255, 255, 0.55)"
      : "rgba(18, 18, 20, 0.28)",
    backdropFilter: "blur(28px) saturate(180%)",
    WebkitBackdropFilter: "blur(28px) saturate(180%)",
    border: useDarkTheme
      ? "1px solid rgba(255, 255, 255, 0.35)"
      : "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: useDarkTheme
      ? "0 10px 40px rgba(20, 20, 20, 0.08), 0 1px 0 rgba(255, 255, 255, 0.7) inset"
      : "0 12px 40px rgba(0, 0, 0, 0.25), 0 1px 0 rgba(255, 255, 255, 0.22) inset",
    transition:
      "background 300ms ease, box-shadow 300ms ease, border-color 300ms ease",
  };

  const textColor = useDarkTheme ? "var(--text-primary)" : "#FFFFFF";
  const textSecondary = useDarkTheme
    ? "var(--text-secondary)"
    : "rgba(255, 255, 255, 0.75)";

  if (hidden) return null;

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-3 md:pt-4"
      >
        <div
          className={`mx-auto flex items-center justify-between gap-4 md:gap-8 h-12 md:h-14 pl-5 pr-2 md:pl-6 md:pr-2.5 rounded-full ${
            hasDarkHero ? "w-full" : "max-w-[1100px]"
          }`}
          style={glassStyle}
        >
          {/* Brand */}
          <a
            href="/"
            aria-label="Path to 100x - home"
            className="group flex items-baseline gap-[7px] md:gap-[9px] whitespace-nowrap transition-opacity hover:opacity-90"
            style={{
              color: textColor,
              textShadow: useDarkTheme
                ? "none"
                : "0 1px 2px rgba(0, 0, 0, 0.5), 0 2px 18px rgba(0, 0, 0, 0.55)",
            }}
          >
            <span
              className="text-[19px] md:text-[22px] leading-none"
              style={{
                fontFamily: "var(--font-instrument-serif), serif",
                fontStyle: "italic",
                letterSpacing: "-0.005em",
              }}
            >
              Path to
            </span>
            <span
              className="text-[14px] md:text-[16px] leading-none font-semibold"
              style={{
                fontFamily:
                  "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
                letterSpacing: "-0.02em",
                fontFeatureSettings: '"tnum" 1',
                fontVariantNumeric: "tabular-nums",
              }}
            >
              100x
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            {CHAPTER_NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] whitespace-nowrap transition-colors duration-200"
                style={{
                  color: textSecondary,
                  textShadow: useDarkTheme ? "none" : "0 1px 8px rgba(0,0,0,0.35)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = textColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = textSecondary;
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Sign up button (desktop) */}
            <button
              onClick={() => setShowSubscribe(true)}
              className="hidden lg:inline-flex items-center justify-center h-9 px-5 rounded-full text-[13px] font-medium cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: useDarkTheme
                  ? "var(--text-primary)"
                  : "rgba(255, 255, 255, 0.92)",
                color: useDarkTheme
                  ? "var(--bg-primary)"
                  : "var(--text-primary)",
                boxShadow: useDarkTheme
                  ? "0 4px 12px rgba(0, 0, 0, 0.08)"
                  : "0 4px 16px rgba(0, 0, 0, 0.18)",
              }}
            >
              Sign up
            </button>

            {/* Mobile / tablet toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="lg:hidden flex items-center justify-center h-10 w-10 rounded-full cursor-pointer"
              style={{
                color: textColor,
              }}
            >
              <div className="relative w-5 h-[10px]">
                <span
                  className="absolute left-0 right-0 h-[1.5px] rounded-full transition-transform duration-300"
                  style={{
                    backgroundColor: "currentColor",
                    top: mobileOpen ? "4px" : "0px",
                    transform: mobileOpen ? "rotate(45deg)" : "none",
                  }}
                />
                <span
                  className="absolute left-0 right-0 h-[1.5px] rounded-full transition-transform duration-300"
                  style={{
                    backgroundColor: "currentColor",
                    bottom: mobileOpen ? "4px" : "0px",
                    transform: mobileOpen ? "rotate(-45deg)" : "none",
                  }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`lg:hidden mx-auto mt-2 rounded-3xl overflow-hidden ${
                hasDarkHero ? "w-full" : "max-w-[1100px]"
              }`}
              style={glassStyle}
            >
              <nav className="flex flex-col py-3">
                {CHAPTER_NAV_ITEMS.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.03, duration: 0.25 }}
                    onClick={() => setMobileOpen(false)}
                    className="px-6 py-3 text-[15px] transition-colors"
                    style={{
                      color: textColor,
                      fontFamily: "var(--font-instrument-serif)",
                      textShadow: useDarkTheme ? "none" : "0 1px 10px rgba(0,0,0,0.3)",
                    }}
                  >
                    {item.label}
                  </motion.a>
                ))}
                <div className="px-5 pt-3 pb-2">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setShowSubscribe(true);
                    }}
                    className="w-full inline-flex items-center justify-center h-11 px-5 rounded-full text-[14px] font-medium cursor-pointer"
                    style={{
                      backgroundColor: useDarkTheme
                        ? "var(--text-primary)"
                        : "rgba(255, 255, 255, 0.92)",
                      color: useDarkTheme
                        ? "var(--bg-primary)"
                        : "var(--text-primary)",
                      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    Sign up
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <SubscribeModal
        isOpen={showSubscribe}
        onClose={() => setShowSubscribe(false)}
      />
    </>
  );
}

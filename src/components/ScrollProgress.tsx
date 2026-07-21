"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Thin accent line pinned to the very top of the viewport. Width follows
 * how far the reader has scrolled through the page, spring-smoothed so it
 * doesn't jitter. Sits above every section but below the top nav glass.
 */
export default function ScrollProgress() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.25,
  });

  // The spelling game is a self-contained full-page app - no reading progress.
  // It lives at /spelling on the main site and at the root of the spelling.
  // subdomain, so check both.
  const onSpellingHost =
    typeof window !== "undefined" &&
    window.location.hostname.startsWith("spelling.");
  if (pathname?.startsWith("/spelling") || onSpellingHost) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        scaleX,
        transformOrigin: "0% 50%",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "var(--accent-highlight)",
        zIndex: 80,
        pointerEvents: "none",
      }}
    />
  );
}

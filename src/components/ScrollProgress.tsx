"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin accent line pinned to the very top of the viewport. Width follows
 * how far the reader has scrolled through the page, spring-smoothed so it
 * doesn't jitter. Sits above every section but below the top nav glass.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.25,
  });

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

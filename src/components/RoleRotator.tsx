"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ROTATING_ROLES } from "@/lib/constants";
import {
  prepareWithSegments,
  layoutWithLines,
} from "@chenglou/pretext";

/**
 * RoleRotator — cycles through role titles with stable width.
 *
 * Uses @chenglou/pretext to pre-measure every role string and lock the
 * container to the widest one, eliminating the layout shift that occurs
 * when roles of different lengths swap in and out.
 */
export default function RoleRotator() {
  const [index, setIndex] = useState(0);
  const [minWidth, setMinWidth] = useState<number | undefined>(undefined);
  const ref = useRef<HTMLSpanElement>(null);

  const measureRoles = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const heading = el.closest("h1");
    if (!heading) return;

    // Build the CSS font shorthand from computed styles
    const computed = getComputedStyle(heading);
    const font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    const lineHeight =
      parseFloat(computed.lineHeight) ||
      parseFloat(computed.fontSize) * 1.1;

    // Use pretext to measure every role and find the widest
    let maxWidth = 0;
    for (const role of ROTATING_ROLES) {
      const prepared = prepareWithSegments(role, font);
      // Use a very wide maxWidth so each role stays on one line
      const result = layoutWithLines(prepared, 10_000, lineHeight);
      if (result.lines.length > 0 && result.lines[0].width > maxWidth) {
        maxWidth = result.lines[0].width;
      }
    }

    // Ceil + small buffer for sub-pixel rounding
    setMinWidth(Math.ceil(maxWidth + 2));
  }, []);

  useEffect(() => {
    measureRoles();

    // Re-measure on resize (font size changes at breakpoints)
    const observer = new ResizeObserver(() => measureRoles());
    const heading = ref.current?.closest("h1");
    if (heading) observer.observe(heading);
    return () => observer.disconnect();
  }, [measureRoles]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_ROLES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      ref={ref}
      className="inline-block relative"
      style={minWidth ? { minWidth: `${minWidth}px` } : undefined}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_ROLES[index]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="inline-block"
          style={{ color: "var(--text-secondary)" }}
        >
          {ROTATING_ROLES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

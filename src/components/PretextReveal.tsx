"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import {
  prepareWithSegments,
  layoutWithLines,
  type LayoutLine,
} from "@chenglou/pretext";

/**
 * PretextReveal - reveals text line-by-line with staggered animation.
 *
 * Uses @chenglou/pretext to measure text layout without DOM reflow,
 * splitting the text into exact visual lines at the container's current
 * width, then animating each line into view independently.
 */
export default function PretextReveal({
  text,
  font,
  className,
  style,
  lineDelay = 0.08,
  duration = 0.5,
  y = 12,
}: {
  text: string;
  /** CSS font shorthand, e.g. "42px 'Instrument Serif'" */
  font: string;
  className?: string;
  style?: React.CSSProperties;
  /** Delay between each line's entrance (seconds) */
  lineDelay?: number;
  /** Duration of each line's animation (seconds) */
  duration?: number;
  /** Vertical offset for the entrance animation (pixels) */
  y?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(inViewRef, { once: true, margin: "-80px" });
  const [lines, setLines] = useState<LayoutLine[]>([]);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const width = el.clientWidth;
    if (width <= 0) return;

    // Parse line-height from computed styles, falling back to font-size * 1.1
    const computed = getComputedStyle(el);
    const fontSize = parseFloat(computed.fontSize) || 42;
    let lineHeight = parseFloat(computed.lineHeight);
    if (isNaN(lineHeight)) lineHeight = fontSize * 1.1;

    const prepared = prepareWithSegments(text, font);
    const result = layoutWithLines(prepared, width, lineHeight);
    setLines(result.lines);
    setReady(true);
  }, [text, font]);

  useEffect(() => {
    measure();

    // Re-measure on resize so lines stay accurate
    const observer = new ResizeObserver(() => measure());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div ref={containerRef} className={className} style={style}>
      <div ref={inViewRef}>
        {ready ? (
          lines.map((line, i) => (
            <motion.span
              key={`${i}-${line.text}`}
              className="block"
              initial={{ opacity: 0, y }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
              transition={{
                duration,
                delay: i * lineDelay,
                ease: "easeOut",
              }}
            >
              {line.text}
            </motion.span>
          ))
        ) : (
          // Invisible placeholder to reserve space before measurement
          <span className="invisible">{text}</span>
        )}
      </div>
    </div>
  );
}

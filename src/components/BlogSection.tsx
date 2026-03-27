"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BLOG_POSTS } from "@/lib/constants";

export default function BlogSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="writing" className="py-20 md:py-28 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-5xl" ref={ref}>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-xl md:text-2xl font-medium mb-12">Latest thinking</motion.h2>
        <div className="space-y-0">
          {BLOG_POSTS.map((post, i) => (
            <motion.a key={post.title} href="#" initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: i * 0.1 }} className="flex items-center justify-between py-5 group cursor-pointer" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <div className="text-[12px] mb-1" style={{ color: "var(--text-secondary)" }}>{post.author}</div>
                <div className="text-[15px] font-medium group-hover:underline" style={{ color: "var(--text-primary)" }}>{post.title}</div>
              </div>
              <svg className="w-4 h-4 flex-shrink-0 ml-4 transition-transform group-hover:translate-x-1" style={{ color: "var(--text-secondary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

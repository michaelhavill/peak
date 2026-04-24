"use client";

import { FOOTER_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="py-8 px-8 md:px-16 lg:px-20" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>&copy; {new Date().getFullYear()} Path to 100x</div>
        <div className="flex flex-wrap gap-6">
          {FOOTER_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="text-[13px] transition-colors hover:underline" style={{ color: "var(--text-secondary)" }}>{link.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

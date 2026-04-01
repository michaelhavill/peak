"use client";

import { useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import SubscribeModal from "./SubscribeModal";

export default function Sidebar() {
  const [showSubscribe, setShowSubscribe] = useState(false);

  return (
    <>
      <aside
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[180px] flex-col justify-between py-8 px-6 z-40"
        style={{ borderRight: "1px solid var(--border-subtle)" }}
      >
        <div>
          <a
            href="#"
            className="text-lg font-medium mb-12 block"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            Path to 100x
          </a>
          <nav className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] transition-colors duration-200 hover:text-[var(--text-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-3">
          <a href="#" className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Pricing
          </a>
          <a href="#" className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Log in
          </a>
          <button
            onClick={() => setShowSubscribe(true)}
            className="text-[13px] inline-flex items-center justify-center h-9 px-5 rounded-full font-medium cursor-pointer"
            style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-primary)" }}
          >
            Sign up
          </button>
        </div>
      </aside>

      <SubscribeModal isOpen={showSubscribe} onClose={() => setShowSubscribe(false)} />
    </>
  );
}

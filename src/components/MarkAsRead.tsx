"use client";

import { useEffect } from "react";

const STORAGE_KEY = "read_articles";

export default function MarkAsRead({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(slug)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, slug]));
      }
    } catch {
      // localStorage may be unavailable (SSR, privacy mode); fail silent.
    }
  }, [slug]);

  return null;
}

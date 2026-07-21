import type { Metadata } from "next";
import SpellingShowdown from "./SpellingShowdown";

export const metadata: Metadata = {
  title: "Spelling Showdown",
  description: "Chip says the word. You spell it. Real(ish) money on the line.",
  // Personal family game - keep it out of search results
  robots: { index: false, follow: false },
};

export default function SpellingPage() {
  return <SpellingShowdown />;
}

import Link from "next/link";

export const metadata = {
  title: "Not here - 100x Path",
};

export default function NotFound() {
  return (
    <main
      className="min-h-screen px-6 md:px-16 lg:px-20 pt-32 pb-20 flex items-center"
      style={
        {
          "--article-accent": "#4A7550",
          "--article-accent-bg": "#EAF0E8",
          "--article-accent-rgb": "74, 117, 80",
        } as React.CSSProperties
      }
    >
      <div className="max-w-2xl mx-auto w-full">
        <p
          className="text-[13px] font-medium uppercase tracking-[0.22em] mb-6"
          style={{ color: "var(--article-accent)" }}
        >
          404
        </p>
        <h1
          className="text-[44px] md:text-[64px] leading-[1.05] mb-6 tracking-tight"
          style={{
            fontFamily: "var(--font-instrument-serif)",
            color: "var(--text-primary)",
          }}
        >
          This page doesn&apos;t exist.
        </h1>
        <p
          className="text-[18px] md:text-[19px] leading-[1.6] mb-10 max-w-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          Not every URL compounds. The learning paths do - they&apos;re
          still the best place to head back to.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/#learn"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full text-[15px] font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--article-accent)",
              color: "#FFFFFF",
            }}
          >
            See the learning paths
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full text-[15px] font-medium transition-colors"
            style={{
              border: "1px solid var(--border-medium)",
              color: "var(--text-primary)",
            }}
          >
            Back to the start
          </Link>
        </div>
      </div>
    </main>
  );
}

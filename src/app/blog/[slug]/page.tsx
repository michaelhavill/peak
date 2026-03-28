import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { LEARN_THEMES } from "@/lib/constants";
import PersonaPathway from "@/components/PersonaPathway";
import Link from "next/link";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return (
    <main className="min-h-screen px-6 md:px-16 lg:px-20 py-16 lg:ml-[180px]">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/#learn"
          className="inline-flex items-center gap-1.5 text-[13px] mb-10 transition-colors hover:text-[var(--text-primary)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M10 4l-4 4 4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All Learn Paths
        </Link>

        {/* Theme badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {post.themes.map((t) => {
            const theme = LEARN_THEMES.find((th) => th.id === t);
            return (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                }}
              >
                {theme?.label ?? t}
              </span>
            );
          })}
        </div>

        <h1
          className="text-[32px] md:text-[42px] leading-[1.1] mb-4"
          style={{
            fontFamily: "var(--font-instrument-serif)",
            color: "var(--text-primary)",
          }}
        >
          {post.title}
        </h1>

        <p
          className="text-[15px] mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          {post.description}
        </p>

        <div
          className="w-full h-px mb-10"
          style={{ backgroundColor: "var(--border-subtle)" }}
        />

        <article
          className="prose-100x"
          dangerouslySetInnerHTML={{ __html: post.htmlContent }}
        />

        <PersonaPathway slug={slug} />

        {post.htmlCtas && (
          <div
            className="prose-100x mt-10 pt-8"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
            dangerouslySetInnerHTML={{ __html: post.htmlCtas }}
          />
        )}
      </div>
    </main>
  );
}

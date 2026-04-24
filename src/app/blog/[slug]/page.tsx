import { getAllSlugs, getPostBySlug, getPostVariants } from "@/lib/blog";
import { LEARN_THEMES, LEARN_PATHS, THEME_COLORS } from "@/lib/constants";
import PersonaPathway from "@/components/PersonaPathway";
import EmailCapture from "@/components/EmailCapture";
import ShareBar from "@/components/ShareBar";
import ArticleBody from "@/components/ArticleBody";
import AuthorBio from "@/components/AuthorBio";
import MarkAsRead from "@/components/MarkAsRead";
import Link from "next/link";

/**
 * Convert a hex "#RRGGBB" to "r, g, b" so we can use it inside
 * rgba(var(--x), alpha) CSS expressions.
 */
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

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
  const variants = getPostVariants(slug);

  // Resolve the article's primary chapter so we can tint the page accents
  // with that chapter's color. Falls back to the accent-highlight token.
  const learnEntry = LEARN_PATHS.find((p) => p.slug === slug);
  const primaryTheme =
    learnEntry?.primaryTheme ?? post.themes?.[0] ?? "build-your-moat";
  const accent = THEME_COLORS[primaryTheme] ?? THEME_COLORS["build-your-moat"];
  const accentRgb = hexToRgb(accent.text);
  const accentStyle = {
    "--article-accent": accent.text,
    "--article-accent-bg": accent.bg,
    "--article-accent-rgb": accentRgb,
  } as React.CSSProperties;

  return (
    <main
      className="min-h-screen px-6 md:px-16 lg:px-20 pt-28 pb-16"
      style={accentStyle}
    >
      <MarkAsRead slug={slug} />
      <div className="max-w-2xl mx-auto">
        <Link
          href="/#learn"
          className="inline-flex items-center gap-1.5 text-[15px] mb-10 transition-colors hover:text-[var(--article-accent)]"
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

        {/* Theme badges - each themed in its own chapter colors */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {post.themes.map((t) => {
            const theme = LEARN_THEMES.find((th) => th.id === t);
            const c = THEME_COLORS[t];
            return (
              <span
                key={t}
                className="text-[12px] px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: c?.bg ?? "var(--bg-elevated)",
                  color: c?.text ?? "var(--text-secondary)",
                }}
              >
                {theme?.label ?? t}
              </span>
            );
          })}
        </div>

        <h1
          className="text-[38px] md:text-[50px] leading-[1.1] mb-4"
          style={{
            fontFamily: "var(--font-instrument-serif)",
            color: "var(--text-primary)",
          }}
        >
          {post.titleHighlight ? (
            <>
              {post.title.split(post.titleHighlight)[0]}
              <span
                style={{
                  backgroundColor: "rgba(var(--article-accent-rgb), 0.16)",
                  padding: "0.05em 0.15em",
                  borderRadius: "4px",
                  boxDecorationBreak: "clone",
                  WebkitBoxDecorationBreak: "clone",
                }}
              >{post.titleHighlight}</span>
              {post.title.split(post.titleHighlight)[1]}
            </>
          ) : (
            post.title
          )}
        </h1>

        <p
          className="text-[17px] mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          {post.description}
        </p>

        {post.authorName && (
          <p className="text-[15px] mb-8" style={{ color: "var(--text-secondary)" }}>
            By{" "}
            {post.authorUrl ? (
              <a
                href={post.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: "var(--text-primary)" }}
              >
                {post.authorName}
              </a>
            ) : (
              post.authorName
            )}
          </p>
        )}

        <div className="flex items-center justify-between mb-10">
          <div
            className="flex-1 h-px"
            style={{ backgroundColor: "var(--border-subtle)" }}
          />
          <div className="ml-4">
            <ShareBar title={post.title} slug={slug} />
          </div>
        </div>

        {post.heroImage && (
          <div className="mb-10 -mx-6 md:-mx-8 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.heroImage}
              alt={post.title}
              className="w-full h-auto"
              style={{ borderRadius: "8px" }}
            />
          </div>
        )}

        {variants ? (
          <ArticleBody variants={variants} fallbackHtml={post.htmlContent} />
        ) : (
          (() => {
            const paragraphs = post.htmlContent.split(/(?=<(?:p|h[2-6]|pre|ul|ol|blockquote)[\s>])/);
            const totalLength = post.htmlContent.length;
            const targetLength = totalLength * 0.25;
            let cumulative = 0;
            let splitIndex = 1;
            for (let i = 0; i < paragraphs.length; i++) {
              cumulative += paragraphs[i].length;
              if (cumulative >= targetLength) {
                splitIndex = Math.max(1, i + 1);
                break;
              }
            }
            const firstThird = paragraphs.slice(0, splitIndex).join("");
            const rest = paragraphs.slice(splitIndex).join("");

            return (
              <>
                <article
                  className="prose-100x"
                  dangerouslySetInnerHTML={{ __html: firstThird }}
                />
                <EmailCapture variant="teaser" />
                <article
                  className="prose-100x"
                  dangerouslySetInnerHTML={{ __html: rest }}
                />
              </>
            );
          })()
        )}

        <EmailCapture variant="inline" />

        <PersonaPathway slug={slug} />

        {post.htmlCtas && (
          <div
            className="prose-100x mt-10 pt-8"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
            dangerouslySetInnerHTML={{ __html: post.htmlCtas }}
          />
        )}

        <AuthorBio />

        <div
          className="mt-10 pt-6 flex justify-end"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <ShareBar title={post.title} slug={slug} />
        </div>
      </div>
    </main>
  );
}

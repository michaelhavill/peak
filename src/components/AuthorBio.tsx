export default function AuthorBio() {
  return (
    <aside
      className="mt-12 pt-8"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div
        className="text-[11px] uppercase tracking-wider mb-3"
        style={{ color: "var(--text-tertiary, var(--text-secondary))" }}
      >
        About the author
      </div>
      <h3
        className="text-[22px] mb-3"
        style={{
          fontFamily: "var(--font-instrument-serif)",
          color: "var(--text-primary)",
        }}
      >
        Michael Van Havill
      </h3>
      <p
        className="text-[14px] leading-[1.65] mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        Building the future of cognitive care at{" "}
        <a
          href="https://mindspan.co"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: "var(--text-primary)" }}
        >
          Mindspan
        </a>{" "}
        as CPDO. Past and
        present advisor to Harvard&rsquo;s Mittal Institute, Zus Health, Doro
        Mind and a handful of other exciting health tech companies. Founder of
        The Department of Doing, a product studio that&rsquo;s shipped
        industry-shaping and disrupting work for clients like Stanford Medical
        School, Microsoft Ventures, athenahealth and Apple MVP partners. Two
        decades across sales, marketing, technology leadership, product design
        and product management - with $500M+ in exits along the way. Also
        founder of 100xpath, where I teach individuals and teams how to unlock
        high-performance outcomes through AI-native workflows. Based in New
        Zealand, commuting to the US for the last 15 years.
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
        <a
          href="https://www.linkedin.com/in/michaelvanhavill/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "var(--text-primary)" }}
        >
          Connect on LinkedIn →
        </a>
        <a
          href="https://www.linkedin.com/in/michaelvanhavill/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "var(--text-primary)" }}
        >
          Join our team at Mindspan and live 100x in person →
        </a>
      </div>
    </aside>
  );
}

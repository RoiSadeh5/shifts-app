export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  /** Body is an array of paragraphs / headings. */
  body: { type: "h2" | "p" | "quote"; text: string }[];
};

export const posts: Post[] = [
  {
    slug: "what-is-cyber-service-management",
    title: "What is Cyber Service Management — and why your SOC needs it",
    excerpt:
      "Security teams have ITSM for IT and SOAR for automation, but the day-to-day flood of requests still falls through the cracks. Here's the category that fixes it.",
    category: "Perspective",
    date: "June 12, 2026",
    readTime: "6 min read",
    author: "Treat Team",
    authorRole: "Security Operations",
    body: [
      { type: "p", text: "Every security team runs on requests. Someone needs access to a production database. A new vendor needs a firewall exception. An employee forwards a suspicious email. A SIEM fires an alert that needs a human decision. Individually, none of these are hard. Collectively, they are where security operations quietly breaks down." },
      { type: "h2", text: "The problem isn't tooling — it's the gaps between tools" },
      { type: "p", text: "Most teams already own great tools. A SIEM to detect. A SOAR to automate. An ITSM to ticket. But requests don't arrive neatly inside any one of them. They land in Slack DMs, email threads, hallway conversations, and a dozen dashboards. There is no single source of truth for 'what does my team owe a decision on right now?'" },
      { type: "quote", text: "You can't manage what you can't see. Most SOCs can't see their own request backlog — it's scattered across channels nobody owns." },
      { type: "h2", text: "Cyber Service Management, defined" },
      { type: "p", text: "Cyber Service Management is the discipline of aggregating every security request — regardless of where it originates — into a single, prioritized, context-rich queue, and routing each one through a consistent, policy-aligned workflow. Think of it as ITSM purpose-built for the realities of a security team." },
      { type: "p", text: "The payoff is measurable: faster mean time to resolution, consistent decisions across analysts and timezones, and — for the first time — real metrics on where your team's time actually goes." },
    ],
  },
  {
    slug: "ending-the-detective-work",
    title: "Ending the detective work: how AI context cuts triage time",
    excerpt:
      "The slowest part of handling a security request isn't the decision — it's gathering the context to make it. Here's how to give analysts back those hours.",
    category: "Product",
    date: "May 28, 2026",
    readTime: "5 min read",
    author: "Treat Team",
    authorRole: "Product",
    body: [
      { type: "p", text: "Watch an analyst handle a single access request and time it. The decision itself takes seconds. Everything before it — finding the governing policy, identifying the asset owner, checking whether a similar request was approved last quarter — eats the other twenty minutes." },
      { type: "h2", text: "Context is the bottleneck" },
      { type: "p", text: "Multiply that by hundreds of requests a week and the cost is staggering. Analysts spend the majority of their day not deciding, but retrieving — hopping between an identity provider, a CMDB, a wiki, and three Slack channels to assemble the picture they need." },
      { type: "h2", text: "What 'context, surfaced automatically' looks like" },
      { type: "p", text: "When a request lands in Treat, the relevant policy, asset data, owner, and institutional precedent are already attached — summarized in plain language. The analyst opens the item and the homework is done. Decisions that took twenty minutes take two." },
      { type: "quote", text: "Treat doesn't make the decision for you. It makes sure you never have to go hunting to make it." },
    ],
  },
  {
    slug: "consistency-across-timezones",
    title: "Why decision consistency is your most underrated security control",
    excerpt:
      "Two analysts, same request, different answers. Inconsistent decisions are a silent risk — and expert workflows are the fix.",
    category: "Best Practices",
    date: "May 9, 2026",
    readTime: "4 min read",
    author: "Treat Team",
    authorRole: "Security Operations",
    body: [
      { type: "p", text: "Ask two analysts to handle the same firewall-exception request and you may get two different outcomes — one approves, one escalates. Neither is wrong, exactly. They're just operating from memory and judgment instead of a shared, codified policy." },
      { type: "h2", text: "Inconsistency compounds into risk" },
      { type: "p", text: "Across a 24/7 team spanning multiple timezones, that variance becomes a real exposure. Auditors notice it. Attackers exploit it. And your team can't improve a process it doesn't execute the same way twice." },
      { type: "h2", text: "Expert workflows turn policy into practice" },
      { type: "p", text: "When your policies are encoded as guided workflows, every analyst follows the same steps for the same request type — with the same checks, the same approvers, and the same audit trail. Consistency stops being a function of who's on shift." },
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

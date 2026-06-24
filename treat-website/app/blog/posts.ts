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
  {
    slug: "measure-what-matters-in-secops",
    title: "Measure what matters: the metrics that actually tell you how your SOC is performing",
    excerpt:
      "MTTR, alert volume, coverage — not all security metrics are equal. Here's how to build a dashboard that gives leadership a genuine picture of operational health.",
    category: "Best Practices",
    date: "April 22, 2026",
    readTime: "7 min read",
    author: "Treat Team",
    authorRole: "Analytics",
    body: [
      { type: "p", text: "Most security dashboards measure what's easy, not what's meaningful. Alert volume is easy. So is patch percentage. What those numbers rarely reveal is whether your team is actually getting faster, or just better at hiding the backlog." },
      { type: "h2", text: "The metric that matters most: time in queue" },
      { type: "p", text: "A request sitting unacknowledged for six hours is a risk you haven't started managing yet. Tracking mean time to first touch — not just mean time to resolution — gives you a much earlier signal of team overload or triage breakdown." },
      { type: "h2", text: "Time per risk type reveals your blind spots" },
      { type: "p", text: "If your team spends 60% of its time on low-severity access requests and 10% on high-severity anomalies, that ratio is your real risk posture — not your vulnerability score. Breaking MTTR down by risk category surfaces the disconnect between where effort goes and where it should go." },
      { type: "quote", text: "The teams that improve fastest are the ones who measure what they do, not just what they detect." },
      { type: "h2", text: "Consistency rate: the underrated metric" },
      { type: "p", text: "How often does the same request type get handled the same way by different analysts? Low consistency is a leading indicator of gaps in your policy documentation and analyst training — before it becomes an incident." },
    ],
  },
  {
    slug: "building-security-at-business-speed",
    title: "Building security operations that move at business speed",
    excerpt:
      "The security team that always says no is a security team that gets bypassed. Here's how to be the team that says yes — safely, quickly, and at scale.",
    category: "Perspective",
    date: "April 7, 2026",
    readTime: "5 min read",
    author: "Treat Team",
    authorRole: "Security Operations",
    body: [
      { type: "p", text: "Every security team faces some version of the same reputation problem: engineering sees them as blockers, finance sees them as overhead, and leadership sees them as a necessary evil. This is almost always a speed problem, not a security problem." },
      { type: "h2", text: "The bottleneck is the request queue, not the policy" },
      { type: "p", text: "When a developer waits three days for a firewall exception they need to ship a feature, the security team isn't just slow — they become the story. The policy might be perfectly reasonable. The delivery speed makes it unreasonable." },
      { type: "h2", text: "Automation closes the gap without increasing risk" },
      { type: "p", text: "The goal isn't to approve everything faster. It's to automate the gathering of context and the routing of decisions so analysts can spend their time on judgment — not retrieval. The decision is still made by a human. The setup for that decision no longer has to be." },
      { type: "quote", text: "Business speed doesn't mean skipping controls. It means removing everything between the control and the decision." },
    ],
  },
  {
    slug: "soar-vs-cyber-service-management",
    title: "SOAR vs. Cyber Service Management: what's the difference?",
    excerpt:
      "SOAR automates your detection playbooks. Cyber Service Management handles everything else — and that's where most security teams actually spend their time.",
    category: "Product",
    date: "March 18, 2026",
    readTime: "6 min read",
    author: "Treat Team",
    authorRole: "Product",
    body: [
      { type: "p", text: "If you ask a security analyst what their SOAR platform handles, they'll describe a specific set of automated responses to specific alert types: isolate an endpoint on malware detection, block an IP after five failed logins, close a ticket if a scan comes back clean. SOAR is powerful — for that narrow category of work." },
      { type: "h2", text: "But most security work doesn't arrive as structured alerts" },
      { type: "p", text: "It arrives as a Slack message from a dev who needs prod access. An email from legal asking whether a new vendor's data residency is acceptable. A Jira ticket requesting a VPN exception for a new contractor. None of these trigger a SOAR playbook. All of them take analyst time." },
      { type: "h2", text: "Cyber Service Management fills the gap" },
      { type: "p", text: "Where SOAR handles the automated response to machine-generated alerts, Cyber Service Management handles the human-initiated, judgment-required requests that make up the bulk of a SOC's daily workload. They're complementary, not competitive — SOAR fires the automations, Treat handles everything that needs a person." },
      { type: "quote", text: "SOAR handles what your SIEM catches. Cyber Service Management handles what your team receives." },
    ],
  },
  {
    slug: "anatomy-of-a-security-request",
    title: "The anatomy of a security request — and where it breaks down",
    excerpt:
      "Follow one access request from the moment it lands in Slack to the moment it's resolved. Every step where the process leaks time is an opportunity.",
    category: "Deep Dive",
    date: "February 28, 2026",
    readTime: "8 min read",
    author: "Treat Team",
    authorRole: "Security Operations",
    body: [
      { type: "p", text: "A developer at 2:47pm messages your security channel: 'Hey, can I get read access to the payments database? I need it to debug a customer issue.' What happens next is a window into the health of your security operations." },
      { type: "h2", text: "Step 1: Discovery (where it breaks down #1)" },
      { type: "p", text: "The message sits in a Slack channel that three analysts monitor — when they're not in meetings, handling incidents, or working other tickets. If it arrives during a busy period, it might not be acknowledged for hours. There is no intake system. There is no SLA." },
      { type: "h2", text: "Step 2: Context gathering (where it breaks down #2)" },
      { type: "p", text: "Eventually an analyst picks it up. They need to know: is this person authorized to request this access? What's the data classification of the payments database? Has this type of access been granted before, and under what conditions? Answering these questions requires opening four different systems. This takes 15–25 minutes." },
      { type: "h2", text: "Step 3: Decision and routing (where it breaks down #3)" },
      { type: "p", text: "The analyst makes a decision — but there's no record of what policy they applied or why. If a different analyst handles the same request next week, they might decide differently. The institutional knowledge lives in one person's head." },
      { type: "h2", text: "What the fixed version looks like" },
      { type: "p", text: "The request lands in a unified queue immediately. The relevant policy and asset context are already attached. The analyst opens it, reviews the pre-populated context, follows a consistent workflow, and resolves it in under five minutes — with a full audit trail automatically generated." },
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

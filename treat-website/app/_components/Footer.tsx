"use client";

import Logo from "./Logo";

const footerLinks = {
  Product: ["Features", "How it works", "Integrations", "Changelog"],
  Company: ["About", "Blog", "Careers", "Security"],
  Resources: ["Documentation", "API Reference", "Status", "Support"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function Footer() {
  return (
    <footer
      className="border-t mt-32"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              AI-native cyber service management. Stop chasing requests. Start
              managing risk.
            </p>
          </div>

          {/* Link cols */}
          {Object.entries(footerLinks).map(([group, items]) => (
            <div key={group}>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                {group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-150"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--text-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--text-secondary)")
                      }
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Treat Security, Inc. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            {["X (Twitter)", "LinkedIn", "GitHub"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-sm transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";

const links = [
  { label: "Product", href: "/product" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Integrations", href: "/integrations" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Company", href: "/company" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 pt-5">
      <nav
        className="w-full max-w-6xl flex items-center justify-between px-5 py-3 rounded-2xl"
        style={{
          background: "rgba(8,8,14,0.8)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(30,30,46,0.8)",
        }}
      >
        {/* Logo */}
        <Link href="/" aria-label="Treat home">
          <Logo />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: isActive(l.href) ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive(l.href) ? "var(--surface)" : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) => {
                  if (!isActive(l.href))
                    e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/demo"
            className="text-sm font-medium px-5 py-2 rounded-lg transition-all duration-200"
            style={{
              background: "var(--accent)",
              color: "#fff",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--accent)")
            }
          >
            Request Demo
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span
            className="block h-0.5 w-5 rounded transition-all duration-200"
            style={{
              background: "var(--text-secondary)",
              transform: open ? "rotate(45deg) translate(3px, 3px)" : "none",
            }}
          />
          <span
            className="block h-0.5 w-5 rounded transition-all duration-200"
            style={{
              background: "var(--text-secondary)",
              opacity: open ? 0 : 1,
            }}
          />
          <span
            className="block h-0.5 w-5 rounded transition-all duration-200"
            style={{
              background: "var(--text-secondary)",
              transform: open ? "rotate(-45deg) translate(3px, -3px)" : "none",
            }}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div
          className="absolute top-20 left-6 right-6 rounded-2xl p-5 md:hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="block px-4 py-3 rounded-lg text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/demo"
            className="mt-3 block text-center text-sm font-medium px-5 py-3 rounded-lg"
            style={{ background: "var(--accent)", color: "#fff" }}
            onClick={() => setOpen(false)}
          >
            Request Demo
          </Link>
        </div>
      )}
    </header>
  );
}

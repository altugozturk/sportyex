"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Zap } from "lucide-react";

const links = [
  { href: "/", label: "Pulse" },
  { href: "/scoreboard", label: "Scoreboard" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ borderColor: "var(--card-border)", background: "rgba(10,10,15,0.9)" }}
    >
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-1.5">
          <Zap size={15} style={{ color: "var(--accent-bull)" }} />
          <span
            className="font-black text-sm tracking-[0.08em] uppercase"
            style={{ fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.1em" }}
          >
            Sportyex
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Nav links */}
          <nav className="flex items-center gap-0.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors",
                  pathname === l.href
                    ? "text-white"
                    : "text-white/40 hover:text-white/70"
                )}
                style={
                  pathname === l.href
                    ? { background: "var(--card)", borderBottom: "1px solid var(--accent-bull)" }
                    : {}
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Live indicator */}
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full pulse-glow"
              style={{ background: "var(--accent-bull)" }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--accent-bull)", fontFamily: "var(--font-mono, monospace)" }}
            >
              Live
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

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
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: "var(--card-border)",
        background: "rgba(8,8,16,0.96)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-11 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-1.5 group">
          <Zap
            size={13}
            strokeWidth={2.5}
            style={{ color: "var(--accent-bull)" }}
          />
          <span
            className="font-black text-[13px] tracking-[0.12em] uppercase"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
          >
            Sportyex
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Nav links */}
          <nav className="flex items-center gap-0">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    "px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors relative",
                    active ? "text-white" : "text-white/30 hover:text-white/60"
                  )}
                >
                  {l.label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-t"
                      style={{ background: "var(--accent-bull)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full pulse-glow"
              style={{ background: "var(--accent-bull)" }}
            />
            <span
              className="text-[9px] font-black uppercase tracking-[0.2em]"
              style={{ color: "var(--accent-bull)", fontFamily: "var(--font-mono)" }}
            >
              Live
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

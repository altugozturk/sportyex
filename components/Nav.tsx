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
    <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ borderColor: "var(--card-border)", background: "rgba(10,10,15,0.85)" }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Zap size={18} style={{ color: "var(--accent-bull)" }} />
          <span>Sportyex</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === l.href
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              )}
              style={pathname === l.href ? { background: "var(--card)" } : {}}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

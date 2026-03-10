import { getTopTokens, getWeeklyMovers } from "@/lib/mcp";
import Link from "next/link";
import SignalBadge from "@/components/SignalBadge";
import CrestIcon from "@/components/CrestIcon";
import { TrendingUp, TrendingDown, Trophy, Waves } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Weekly Scoreboard | Sportyex",
  description: "Top fan token movers and whale activity this week.",
};

function Delta({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 font-bold tabular-nums text-sm"
      style={{ color: positive ? "var(--accent-bull)" : "var(--accent-bear)" }}
    >
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {positive ? "+" : ""}{value.toFixed(1)}{suffix}
    </span>
  );
}

export default async function ScoreboardPage() {
  const [weekly, all] = await Promise.all([getWeeklyMovers(), getTopTokens()]);

  const sorted7d = [...weekly].sort((a, b) => b.priceChange7d - a.priceChange7d).slice(0, 10);
  const whaleTokens = all.filter((t) => t.whaleAlert).sort((a, b) => b.signalScore - a.signalScore);
  const bullishTokens = all.sort((a, b) => (b.sentimentScore ?? 0) - (a.sentimentScore ?? 0)).slice(0, 5);

  return (
    <div className="pt-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={14} style={{ color: "var(--accent-hot)" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent-hot)" }}>
            Weekly Scoreboard
          </span>
        </div>
        <h1 className="text-2xl font-black">This Week in Fan Tokens</h1>
      </div>

      {/* Top Movers */}
      <section className="mb-8">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <TrendingUp size={14} style={{ color: "var(--accent-bull)" }} />
          Top Movers (7d)
        </h2>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--card-border)", background: "var(--card)" }}
        >
          {sorted7d.map((token, i) => (
            <Link
              key={token.id}
              href={`/token/${token.id.toLowerCase()}`}
              className="flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-white/5"
              style={{ borderBottom: i < sorted7d.length - 1 ? "1px solid var(--card-border)" : "none" }}
            >
              <span className="text-[11px] font-bold tabular-nums w-4 text-right shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>
                {i + 1}
              </span>
              <CrestIcon tokenId={token.id} symbol={token.symbol} size={32} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{token.team}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{token.symbol}</p>
              </div>
              <div className="text-right shrink-0">
                <Delta value={token.priceChange7d} />
                <p className="text-xs tabular-nums mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  ${token.price.toFixed(2)}
                </p>
              </div>
              <SignalBadge level={token.signalLevel} className="hidden sm:inline-flex" />
            </Link>
          ))}
        </div>
      </section>

      {/* Whale Activity */}
      {whaleTokens.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Waves size={14} style={{ color: "var(--accent-hot)" }} />
            Whale Activity
          </h2>
          <div className="flex flex-col gap-2">
            {whaleTokens.slice(0, 5).map((token) => (
              <Link
                key={token.id}
                href={`/token/${token.id.toLowerCase()}`}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors hover:border-white/20"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <CrestIcon tokenId={token.id} symbol={token.symbol} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{token.team}</p>
                  <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {token.whaleAlert?.description}
                  </p>
                </div>
                <Delta value={token.priceChange24h} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Community Picks */}
      <section>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <span style={{ color: "var(--accent-bull)" }}>🟢</span>
          Most Bullish Community Picks
        </h2>
        <div className="flex flex-col gap-2">
          {bullishTokens.map((token) => (
            <Link
              key={token.id}
              href={`/token/${token.id.toLowerCase()}`}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors hover:border-white/20"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            >
              <CrestIcon tokenId={token.id} symbol={token.symbol} size={32} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{token.team}</p>
              </div>
              {token.sentimentScore !== undefined && (
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: "var(--accent-bull)" }}>
                    {token.sentimentScore}% Bull
                  </p>
                </div>
              )}
              <SignalBadge level={token.signalLevel} className="hidden sm:inline-flex" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

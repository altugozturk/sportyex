import { Activity, BarChart2, MessageSquare, ExternalLink } from "lucide-react";
import type { TokenDetail } from "@/lib/types";

interface EvidenceItem {
  icon: React.ReactNode;
  title: string;
  summary: string;
  detail: string;
  badgeLabel: string;
  badgeColor: string;
  badgeBg: string;
}

function buildEvidenceItems(token: TokenDetail): EvidenceItem[] {
  const items: EvidenceItem[] = [];

  // Whale flow evidence
  if (token.whaleAlert) {
    const { direction, count, totalTokens, timeframeHours } = token.whaleAlert;
    const verb = direction === "buy" ? "bought" : direction === "sell" ? "sold" : "moved";
    const total = totalTokens >= 1_000_000
      ? `${(totalTokens / 1_000_000).toFixed(2)}M`
      : `${(totalTokens / 1_000).toFixed(0)}k`;
    const wallets = `${count} wallet${count !== 1 ? "s" : ""}`;
    items.push({
      icon: <Activity size={13} />,
      title: "Whale Flow",
      summary: `${wallets} ${verb} ${total} tokens in ${timeframeHours}h`,
      detail: `Source: Fan Token Intel · ${timeframeHours}h aggregation window`,
      badgeLabel: "Aggregated",
      badgeColor: "#f59e0b",
      badgeBg: "rgba(245,158,11,0.12)",
    });
  }

  // Market data evidence — always present (price is always available)
  const sign = token.priceChange24h >= 0 ? "+" : "";
  const vol = token.volume24h
    ? token.volume24h >= 1_000_000
      ? `$${(token.volume24h / 1_000_000).toFixed(2)}M`
      : `$${(token.volume24h / 1_000).toFixed(0)}k`
    : null;
  const exchange = token.exchange ?? "FanX";
  items.push({
    icon: <BarChart2 size={13} />,
    title: "Market Data",
    summary: [
      `Price ${sign}${token.priceChange24h.toFixed(2)}% (24h)`,
      vol ? `Vol ${vol}` : null,
      exchange,
    ]
      .filter(Boolean)
      .join(" · "),
    detail: `Source: ${exchange} exchange feed · Real-time`,
    badgeLabel: "Market data",
    badgeColor: "#38bdf8",
    badgeBg: "rgba(56,189,248,0.1)",
  });

  // Sentiment evidence
  if (token.sentimentScore !== undefined) {
    const bear = 100 - token.sentimentScore;
    items.push({
      icon: <MessageSquare size={13} />,
      title: "Sentiment Signal",
      summary: `${token.sentimentScore}% bullish · ${bear}% bearish`,
      detail: "Source: Fan Token Intel · Aggregated trader sentiment",
      badgeLabel: "Aggregated",
      badgeColor: "#f59e0b",
      badgeBg: "rgba(245,158,11,0.12)",
    });
  }

  return items;
}

export default function EvidenceCard({ token }: { token: TokenDetail }) {
  const items = buildEvidenceItems(token);
  const updatedAt = new Date().toUTCString();
  const exchange = token.exchange ?? "FanX";

  return (
    <div
      className="rounded-xl mb-4 overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--card-border)" }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.15em]"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Evidence
        </p>
        <p
          className="font-mono text-[9px] tabular-nums"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          Updated {updatedAt}
        </p>
      </div>

      {/* Evidence rows */}
      {items.length === 0 ? (
        <p className="px-4 py-5 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          Insufficient data to generate an evidence summary.
        </p>
      ) : (
        items.map((item, i) => (
          <div
            key={i}
            className="px-4 py-3 border-b"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Icon + content */}
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: item.badgeBg, color: item.badgeColor }}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight mb-0.5">
                    {item.title}
                  </p>
                  <p
                    className="text-sm leading-snug font-mono tabular-nums"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {item.summary}
                  </p>
                  <p
                    className="text-[10px] mt-1 leading-snug"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {item.detail}
                  </p>
                </div>
              </div>

              {/* Badge */}
              <span
                className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 mt-0.5 whitespace-nowrap"
                style={{ color: item.badgeColor, background: item.badgeBg }}
              >
                {item.badgeLabel}
              </span>
            </div>
          </div>
        ))
      )}

      {/* Action row */}
      <div
        className="flex items-center gap-1 px-4 py-3 flex-wrap"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <a
          href="https://explorer.chiliz.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded transition-opacity hover:opacity-80"
          style={{
            color: "rgba(255,255,255,0.6)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          View transactions
          <ExternalLink size={10} />
        </a>

        <a
          href="https://fanex.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded transition-opacity hover:opacity-80"
          style={{
            color: "rgba(255,255,255,0.6)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          View source
          <ExternalLink size={10} />
        </a>

        <button
          disabled
          title="Coming soon"
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded cursor-not-allowed pointer-events-none opacity-30"
          style={{
            color: "rgba(255,255,255,0.6)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          Trade {exchange}
        </button>
      </div>
    </div>
  );
}

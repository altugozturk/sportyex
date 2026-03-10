import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { TokenDetail } from "@/lib/types";

interface Factor {
  label: string;
}

function buildFactors(token: TokenDetail): { positive: Factor[]; risks: Factor[] } {
  const positive: Factor[] = [];
  const risks: Factor[] = [];

  // Price momentum (24h)
  if (token.priceChange24h >= 3) {
    positive.push({ label: `Price up ${token.priceChange24h.toFixed(1)}% in the last 24h` });
  } else if (token.priceChange24h <= -3) {
    risks.push({ label: `Price down ${Math.abs(token.priceChange24h).toFixed(1)}% in the last 24h` });
  }

  // Weekly trend
  if (token.priceChange7d >= 5) {
    positive.push({ label: `Up ${token.priceChange7d.toFixed(1)}% over the past week` });
  } else if (token.priceChange7d <= -5) {
    risks.push({ label: `Down ${Math.abs(token.priceChange7d).toFixed(1)}% over the past week` });
  }

  // Whale activity
  if (token.whaleAlert) {
    const { direction, count, totalTokens, timeframeHours } = token.whaleAlert;
    const total = (totalTokens / 1_000).toFixed(0);
    const wallets = `${count} large wallet${count !== 1 ? "s" : ""}`;
    if (direction === "buy") {
      positive.push({ label: `${wallets} buying — ${total}k tokens in ${timeframeHours}h` });
    } else if (direction === "sell") {
      risks.push({ label: `${wallets} selling — ${total}k tokens in ${timeframeHours}h` });
    } else {
      risks.push({ label: `Mixed whale activity — ${wallets} active in ${timeframeHours}h` });
    }
  }

  // Sentiment
  if (token.sentimentScore !== undefined) {
    if (token.sentimentScore >= 65) {
      positive.push({ label: `${token.sentimentScore}% of traders are bullish` });
    } else if (token.sentimentScore <= 40) {
      risks.push({ label: `Only ${token.sentimentScore}% bullish — bearish sentiment dominates` });
    }
  }

  // Match context
  if (token.upcomingMatch) {
    const { hoursUntil, awayTeam, homeTeam, competition } = token.upcomingMatch;
    const opponent = token.team === homeTeam ? awayTeam : homeTeam;
    if (hoursUntil <= 6) {
      positive.push({ label: `Match in ${hoursUntil}h vs ${opponent} (${competition})` });
      risks.push({ label: `Kickoff imminent — post-game volatility risk` });
    } else if (hoursUntil <= 24) {
      positive.push({ label: `Match in ${hoursUntil}h vs ${opponent} (${competition})` });
    } else if (hoursUntil <= 72) {
      positive.push({ label: `Upcoming match vs ${opponent} (${competition}) in ${Math.round(hoursUntil)}h` });
    } else {
      risks.push({ label: `Next match ${Math.round(hoursUntil / 24)} days away — catalyst may already be priced in` });
    }
  }

  return { positive, risks };
}

const SIGNAL_COLORS: Record<string, string> = {
  HOT: "var(--accent-hot)",
  BULLISH: "var(--accent-bull)",
  WARNING: "var(--accent-bear)",
  QUIET: "rgba(255,255,255,0.4)",
};

export default function SignalBreakdown({ token }: { token: TokenDetail }) {
  const { positive, risks } = buildFactors(token);
  const signalColor = SIGNAL_COLORS[token.signalLevel] ?? "rgba(255,255,255,0.4)";
  const signalLabel = token.signalLevel.charAt(0) + token.signalLevel.slice(1).toLowerCase();
  const hasData = positive.length > 0 || risks.length > 0;

  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
    >
      {/* Header */}
      <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
        Signal Explained
      </p>

      <p className="text-sm font-bold mb-4" style={{ color: signalColor }}>
        Signal: {signalLabel}
      </p>

      {!hasData && (
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          Not enough data to generate a breakdown for this token.
        </p>
      )}

      {/* Positive factors */}
      {positive.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--accent-bull)" }}>
            Why {signalLabel.toLowerCase()}
          </p>
          <ul className="flex flex-col gap-2">
            {positive.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-snug">
                <CheckCircle2
                  size={14}
                  className="shrink-0 mt-0.5"
                  style={{ color: "var(--accent-bull)" }}
                />
                <span style={{ color: "rgba(255,255,255,0.8)" }}>{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk factors */}
      {risks.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "#f59e0b" }}>
            Potential risks
          </p>
          <ul className="flex flex-col gap-2">
            {risks.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-snug">
                <AlertTriangle
                  size={14}
                  className="shrink-0 mt-0.5"
                  style={{ color: "#f59e0b" }}
                />
                <span style={{ color: "rgba(255,255,255,0.8)" }}>{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

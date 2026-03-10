import Link from "next/link";
import { FanToken } from "@/lib/types";
import SignalBadge from "./SignalBadge";
import MatchBadge from "./MatchBadge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  token: FanToken;
  rank?: number;
}

function PriceChange({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-sm font-semibold tabular-nums"
      style={{ color: positive ? "var(--accent-bull)" : "var(--accent-bear)" }}
    >
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export default function TokenCard({ token, rank }: Props) {
  return (
    <Link
      href={`/token/${token.id.toLowerCase()}`}
      className="block rounded-xl p-4 transition-all hover:scale-[1.01] hover:border-white/20 active:scale-[0.99]"
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: logo + name */}
        <div className="flex items-center gap-3 min-w-0">
          {rank && (
            <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: "rgba(255,255,255,0.25)", minWidth: "1.5rem" }}>
              #{rank}
            </span>
          )}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
          >
            {token.symbol.slice(0, 3)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{token.team}</p>
            <p className="text-xs leading-tight truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
              {token.symbol}
            </p>
          </div>
        </div>

        {/* Right: price + signal */}
        <div className="text-right shrink-0">
          <p className="font-bold tabular-nums text-sm">${token.price.toFixed(2)}</p>
          <PriceChange value={token.priceChange24h} />
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <SignalBadge level={token.signalLevel} />
        {token.upcomingMatch && <MatchBadge match={token.upcomingMatch} />}
        {token.whaleAlert && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              color: token.whaleAlert.direction === "buy" ? "var(--accent-bull)" : "var(--accent-bear)",
              background: token.whaleAlert.direction === "buy" ? "rgba(0,255,135,0.08)" : "rgba(255,59,92,0.08)",
            }}
          >
            🐋 Whale
          </span>
        )}
      </div>

      {/* Signal score bar */}
      <div className="mt-3">
        <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${token.signalScore}%`,
              background: token.signalScore >= 70
                ? "var(--accent-bull)"
                : token.signalScore < 35
                ? "var(--accent-bear)"
                : "var(--accent-hot)",
            }}
          />
        </div>
      </div>
    </Link>
  );
}

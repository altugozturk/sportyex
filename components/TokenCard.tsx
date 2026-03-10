import Link from "next/link";
import { FanToken } from "@/lib/types";
import { getClubIdentity } from "@/lib/crests";
import SignalBadge from "./SignalBadge";
import MatchBadge from "./MatchBadge";
import CrestIcon from "./CrestIcon";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  token: FanToken;
  rank?: number;
}

function PriceChange({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[13px] font-bold tabular-nums"
      style={{ color: positive ? "var(--accent-bull)" : "var(--accent-bear)" }}
    >
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export default function TokenCard({ token, rank }: Props) {
  const identity = getClubIdentity(token.id);
  const leagueCode = identity?.leagueCode;

  const barColor =
    token.signalScore >= 70
      ? "var(--accent-bull)"
      : token.signalScore < 35
      ? "var(--accent-bear)"
      : "var(--accent-hot)";

  const glowPx =
    token.signalScore >= 75 ? 10 : token.signalScore >= 50 ? 6 : 3;

  return (
    <Link
      href={`/token/${token.id.toLowerCase()}`}
      className="block rounded-xl p-3 transition-all hover:scale-[1.005] active:scale-[0.99]"
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
      }}
    >
      {/* Row 1: crest / name / league | price / change */}
      <div className="flex items-center gap-2.5">
        {/* Rank */}
        {rank !== undefined && (
          <span
            className="text-[11px] font-bold tabular-nums shrink-0 w-4 text-right"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            {rank}
          </span>
        )}

        {/* Crest */}
        <CrestIcon tokenId={token.id} symbol={token.symbol} size={36} />

        {/* Club info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-black text-[15px] truncate leading-tight">
              {token.team}
            </span>
            {leagueCode && (
              <span
                className="text-[9px] font-black uppercase px-1 py-px rounded shrink-0"
                style={{
                  color: identity?.primary ?? "rgba(255,255,255,0.4)",
                  background: `${identity?.primary ?? "#ffffff"}20`,
                  border: `1px solid ${identity?.primary ?? "#ffffff"}30`,
                }}
              >
                {leagueCode}
              </span>
            )}
          </div>
          <span
            className="text-[11px] font-medium"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            {token.symbol}
          </span>
        </div>

        {/* Price block */}
        <div className="text-right shrink-0">
          <p
            className="font-black tabular-nums text-[15px] leading-tight"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ${token.price.toFixed(2)}
          </p>
          <PriceChange value={token.priceChange24h} />
        </div>
      </div>

      {/* Row 2: signal badges */}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <SignalBadge level={token.signalLevel} />
        {token.upcomingMatch && <MatchBadge match={token.upcomingMatch} />}
        {token.whaleAlert && (
          <span
            className="text-[11px] px-1.5 py-px rounded-full font-semibold"
            style={{
              color:
                token.whaleAlert.direction === "buy"
                  ? "var(--accent-bull)"
                  : "var(--accent-bear)",
              background:
                token.whaleAlert.direction === "buy"
                  ? "rgba(0,255,135,0.08)"
                  : "rgba(255,59,92,0.08)",
            }}
          >
            🐋 Whale
          </span>
        )}
      </div>

      {/* Signal bar with glow */}
      <div className="mt-2.5">
        <div
          className="h-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${token.signalScore}%`,
              background: barColor,
              boxShadow: `0 0 ${glowPx}px ${barColor}70`,
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>
    </Link>
  );
}

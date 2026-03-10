import Link from "next/link";
import { FanToken } from "@/lib/types";
import { getClubIdentity } from "@/lib/crests";
import SignalBadge from "./SignalBadge";
import MatchBadge from "./MatchBadge";
import CrestIcon from "./CrestIcon";

interface Props {
  token: FanToken;
  rank?: number;
}

function PriceChange({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className="text-[12px] font-bold tabular-nums"
      style={{
        color: positive ? "var(--accent-bull)" : "var(--accent-bear)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {positive ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}

export default function TokenCard({ token, rank }: Props) {
  const identity = getClubIdentity(token.id);
  const clubColor = identity?.primary ?? "rgba(255,255,255,0.1)";

  const barColor =
    token.signalScore >= 70
      ? "var(--accent-bull)"
      : token.signalScore < 35
      ? "var(--accent-bear)"
      : "var(--accent-hot)";

  return (
    <Link
      href={`/token/${token.id.toLowerCase()}`}
      className="flex items-center gap-2.5 px-3 py-2.5 transition-colors group"
      style={{
        borderLeft: `3px solid ${clubColor}`,
        borderBottom: "1px solid var(--card-border)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--card-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {/* Rank */}
      {rank !== undefined && (
        <span
          className="text-[11px] tabular-nums shrink-0 w-5 text-right font-bold"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
        >
          {rank}
        </span>
      )}

      {/* Crest */}
      <CrestIcon tokenId={token.id} symbol={token.symbol} size={30} />

      {/* Team + ticker */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-bold text-[14px] truncate" style={{ color: "var(--foreground)" }}>
            {token.team}
          </span>
          {identity?.leagueCode && (
            <span
              className="text-[8px] font-black uppercase px-1 py-px rounded shrink-0 tracking-wider"
              style={{
                color: clubColor,
                background: `${clubColor}18`,
                border: `1px solid ${clubColor}28`,
              }}
            >
              {identity.leagueCode}
            </span>
          )}
        </div>
        <span
          className="text-[11px] font-medium tracking-wider"
          style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}
        >
          {token.symbol}
        </span>
      </div>

      {/* Signal + match badges */}
      <div className="hidden sm:flex items-center gap-1 shrink-0">
        <SignalBadge level={token.signalLevel} compact />
        {token.upcomingMatch && <MatchBadge match={token.upcomingMatch} />}
        {token.whaleAlert && (
          <span
            className="text-[10px] px-1.5 py-px rounded font-bold tracking-wide"
            style={{
              color: token.whaleAlert.direction === "buy" ? "var(--accent-bull)" : "var(--accent-bear)",
              background: token.whaleAlert.direction === "buy" ? "rgba(0,230,118,0.08)" : "rgba(255,59,92,0.08)",
              border: `1px solid ${token.whaleAlert.direction === "buy" ? "rgba(0,230,118,0.2)" : "rgba(255,59,92,0.2)"}`,
            }}
          >
            🐋
          </span>
        )}
      </div>

      {/* Score bar */}
      <div className="hidden sm:block shrink-0 w-14">
        <div className="h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${token.signalScore}%`,
              background: barColor,
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <p
          className="text-[9px] tabular-nums mt-0.5 text-right"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
        >
          {token.signalScore}
        </p>
      </div>

      {/* Price + change */}
      <div className="text-right shrink-0 ml-1">
        <p
          className="font-black tabular-nums text-[14px] leading-none"
          style={{ color: "var(--foreground)", fontFamily: "var(--font-mono)" }}
        >
          ${token.price.toFixed(2)}
        </p>
        <div className="mt-0.5">
          <PriceChange value={token.priceChange24h} />
        </div>
      </div>
    </Link>
  );
}

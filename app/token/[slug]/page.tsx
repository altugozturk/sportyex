import { notFound } from "next/navigation";
import { getTokenDetail } from "@/lib/mcp";
import { getClubIdentity } from "@/lib/crests";
import SignalBadge from "@/components/SignalBadge";
import SignalRing from "@/components/SignalRing";
import SignalBreakdown from "@/components/SignalBreakdown";
import EvidenceCard from "@/components/EvidenceCard";
import CrestIcon from "@/components/CrestIcon";
import MatchBadge from "@/components/MatchBadge";
import ShareButton from "@/components/ShareButton";
import { TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const token = await getTokenDetail(slug.toUpperCase());
  if (!token) return { title: "Token Not Found" };
  return {
    title: `${token.symbol} — ${token.signalLevel} Signal | Sportyex`,
    description: `${token.name} is ${token.signalLevel.toLowerCase()} right now. Signal score: ${token.signalScore}/100.`,
  };
}

export default async function TokenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getTokenDetail(slug.toUpperCase());
  if (!token) notFound();

  const positive = token.priceChange24h >= 0;
  const priceColor = positive ? "var(--accent-bull)" : "var(--accent-bear)";
  const identity = getClubIdentity(token.id);

  return (
    <div className="pt-6 max-w-lg mx-auto">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[11px] mb-3 transition-opacity hover:opacity-70"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        <ArrowLeft size={13} /> All tokens
      </Link>

      {/* Hero */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderTop: identity ? `2px solid ${identity.primary}` : "1px solid var(--card-border)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Token identity */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CrestIcon tokenId={token.id} symbol={token.symbol} size={48} />
              <div>
                <h1 className="font-black text-xl leading-tight">{token.team}</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{token.symbol}</p>
                  {identity?.leagueCode && (
                    <span
                      className="text-[9px] font-black uppercase px-1 py-px rounded"
                      style={{
                        color: identity.primary,
                        background: `${identity.primary}20`,
                        border: `1px solid ${identity.primary}30`,
                      }}
                    >
                      {identity.leagueCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <SignalBadge level={token.signalLevel} />
              {token.upcomingMatch && <MatchBadge match={token.upcomingMatch} />}
            </div>
          </div>

          {/* Signal ring */}
          <SignalRing score={token.signalScore} />
        </div>

        {/* Price */}
        <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--card-border)" }}>
          <p className="text-2xl font-black tabular-nums">${token.price.toFixed(2)}</p>
          <p className="flex items-center gap-1 mt-1 text-sm font-semibold tabular-nums" style={{ color: priceColor }}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {positive ? "+" : ""}{token.priceChange24h.toFixed(2)}% today
          </p>
          {token.volume24h && (
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
              Vol: ${(token.volume24h / 1_000).toFixed(0)}k · {token.exchange ?? "FanX"}
            </p>
          )}
        </div>
      </div>

      {/* Signal breakdown */}
      <SignalBreakdown token={token} />

      {/* Evidence */}
      <EvidenceCard token={token} />

      {/* Share */}
      <ShareButton symbol={token.symbol} />
    </div>
  );
}

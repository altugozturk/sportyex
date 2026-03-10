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
    <div className="pt-5 max-w-lg mx-auto">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-3 transition-opacity hover:opacity-70"
        style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}
      >
        <ArrowLeft size={11} /> All tokens
      </Link>

      {/* Hero */}
      <div
        className="rounded-lg p-4 mb-3"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderLeft: identity ? `3px solid ${identity.primary}` : "1px solid var(--card-border)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Token identity */}
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <CrestIcon tokenId={token.id} symbol={token.symbol} size={44} />
              <div>
                <h1
                  className="font-black text-lg leading-tight tracking-tight"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {token.team}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p
                    className="text-[11px] font-bold tracking-wider"
                    style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}
                  >
                    {token.symbol}
                  </p>
                  {identity?.leagueCode && (
                    <span
                      className="text-[8px] font-black uppercase px-1 py-px rounded tracking-wider"
                      style={{
                        color: identity.primary,
                        background: `${identity.primary}18`,
                        border: `1px solid ${identity.primary}28`,
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
          <p
            className="text-2xl font-black tabular-nums leading-none"
            style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}
          >
            ${token.price.toFixed(2)}
          </p>
          <p
            className="flex items-center gap-1 mt-1.5 text-[13px] font-bold tabular-nums"
            style={{ color: priceColor }}
          >
            {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {positive ? "+" : ""}{token.priceChange24h.toFixed(2)}% today
          </p>
          {token.volume24h && (
            <p
              className="text-[11px] mt-1.5"
              style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}
            >
              Vol ${(token.volume24h / 1_000).toFixed(0)}k · {token.exchange ?? "FanX"}
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

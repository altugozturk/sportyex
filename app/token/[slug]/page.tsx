import { notFound } from "next/navigation";
import { getTokenDetail } from "@/lib/mcp";
import SignalBadge from "@/components/SignalBadge";
import SignalRing from "@/components/SignalRing";
import SignalBreakdown from "@/components/SignalBreakdown";
import VoteStrip from "@/components/VoteStrip";
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

  return (
    <div className="pt-6 max-w-lg mx-auto">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        <ArrowLeft size={14} /> All tokens
      </Link>

      {/* Hero */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Token identity */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
              >
                {token.symbol.slice(0, 3)}
              </div>
              <div>
                <h1 className="font-black text-xl leading-tight">{token.team}</h1>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{token.symbol}</p>
              </div>
            </div>
            <SignalBadge level={token.signalLevel} />
          </div>

          {/* Signal ring */}
          <SignalRing score={token.signalScore} />
        </div>

        {/* Price */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--card-border)" }}>
          <p className="text-3xl font-black tabular-nums">${token.price.toFixed(2)}</p>
          <p className="flex items-center gap-1 mt-1 text-sm font-semibold tabular-nums" style={{ color: priceColor }}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {positive ? "+" : ""}{token.priceChange24h.toFixed(2)}% today
          </p>
          {token.volume24h && (
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
              Vol: ${(token.volume24h / 1_000).toFixed(0)}k · {token.exchange ?? "Chiliz"}
            </p>
          )}
        </div>
      </div>

      {/* Signal breakdown */}
      <SignalBreakdown token={token} />

      {/* Community vote */}
      <VoteStrip tokenId={token.id} />

      {/* Share */}
      <ShareButton symbol={token.symbol} />
    </div>
  );
}

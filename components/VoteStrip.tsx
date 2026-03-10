"use client";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  tokenId: string;
}

function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  let fp = localStorage.getItem("sportyex_fp");
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("sportyex_fp", fp);
  }
  return fp;
}

export default function VoteStrip({ tokenId }: Props) {
  const [voted, setVoted] = useState<"bull" | "bear" | null>(null);
  const [tally, setTally] = useState({ bull: 0, bear: 0, total: 0, bullPercent: 50 });
  const [loading, setLoading] = useState(false);

  // Load existing tally
  useEffect(() => {
    fetch(`/api/votes/${tokenId}`)
      .then((r) => r.json())
      .then((d) => setTally(d))
      .catch(() => {});

    // Check if already voted this session
    const key = `voted_${tokenId}`;
    const prev = localStorage.getItem(key) as "bull" | "bear" | null;
    if (prev) setVoted(prev);
  }, [tokenId]);

  async function handleVote(direction: "bull" | "bear") {
    if (voted || loading) return;
    setLoading(true);
    const fp = getFingerprint();

    try {
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, direction, fingerprint: fp }),
      });
      setVoted(direction);
      localStorage.setItem(`voted_${tokenId}`, direction);

      // Update tally optimistically
      setTally((prev) => {
        const bull = direction === "bull" ? prev.bull + 1 : prev.bull;
        const bear = direction === "bear" ? prev.bear + 1 : prev.bear;
        const total = bull + bear;
        return { bull, bear, total, bullPercent: total ? Math.round((bull / total) * 100) : 50 };
      });
    } finally {
      setLoading(false);
    }
  }

  const bearPercent = 100 - tally.bullPercent;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
        Community Signal
      </p>

      {!voted ? (
        <div className="flex gap-3">
          <button
            onClick={() => handleVote("bull")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all active:scale-95 hover:opacity-90"
            style={{ background: "rgba(0,255,135,0.12)", color: "var(--accent-bull)", border: "1px solid rgba(0,255,135,0.25)" }}
          >
            <TrendingUp size={16} /> Bullish
          </button>
          <button
            onClick={() => handleVote("bear")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all active:scale-95 hover:opacity-90"
            style={{ background: "rgba(255,59,92,0.12)", color: "var(--accent-bear)", border: "1px solid rgba(255,59,92,0.25)" }}
          >
            <TrendingDown size={16} /> Bearish
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span style={{ color: "var(--accent-bull)" }}>
              <TrendingUp size={11} className="inline mr-1" />
              Bull {tally.bullPercent}%
            </span>
            <span style={{ color: "var(--accent-bear)" }}>
              Bear {bearPercent}%
              <TrendingDown size={11} className="inline ml-1" />
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,59,92,0.3)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${tally.bullPercent}%`, background: "var(--accent-bull)" }}
            />
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
            {tally.total} {tally.total === 1 ? "vote" : "votes"} · You voted {voted === "bull" ? "🟢 Bullish" : "🔴 Bearish"}
          </p>
        </div>
      )}
    </div>
  );
}

import { getTopTokens } from "@/lib/mcp";
import TokenCard from "@/components/TokenCard";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tokens = await getTopTokens();
  const sorted = [...tokens].sort((a, b) => b.signalScore - a.signalScore);

  const hotCount      = sorted.filter((t) => t.signalLevel === "HOT").length;
  const bullishCount  = sorted.filter((t) => t.signalLevel === "BULLISH").length;
  const warningCount  = sorted.filter((t) => t.signalLevel === "WARNING").length;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });

  return (
    <div className="pt-5">
      {/* Page header */}
      <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.18em] mb-1"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
          >
            Fan Token Signals
          </p>
          <h1
            className="text-lg font-black leading-none tracking-tight"
            style={{ letterSpacing: "-0.01em" }}
          >
            Market Pulse
          </h1>
          <p
            className="text-[11px] mt-1"
            style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}
          >
            {today}
          </p>
        </div>

        {/* Signal summary pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {hotCount > 0 && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded"
              style={{ background: "rgba(255,149,0,0.10)", color: "var(--accent-hot)", border: "1px solid rgba(255,149,0,0.20)" }}
            >
              {hotCount} HOT
            </span>
          )}
          {bullishCount > 0 && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded"
              style={{ background: "rgba(0,230,118,0.07)", color: "var(--accent-bull)", border: "1px solid rgba(0,230,118,0.15)" }}
            >
              {bullishCount} BULL
            </span>
          )}
          {warningCount > 0 && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded"
              style={{ background: "rgba(255,59,92,0.08)", color: "var(--accent-bear)", border: "1px solid rgba(255,59,92,0.15)" }}
            >
              {warningCount} WARN
            </span>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div
        className="flex items-center gap-2.5 px-3 pb-1.5 mb-0"
        style={{ borderBottom: "1px solid var(--border-strong)" }}
      >
        <span className="w-5 shrink-0" />
        <span className="w-[30px] shrink-0" />
        <span
          className="flex-1 text-[9px] font-black uppercase tracking-[0.15em]"
          style={{ color: "var(--text-muted)" }}
        >
          Token
        </span>
        <span
          className="hidden sm:block text-[9px] font-black uppercase tracking-[0.15em] shrink-0"
          style={{ color: "var(--text-muted)", minWidth: 80 }}
        >
          Signal
        </span>
        <span
          className="hidden sm:block text-[9px] font-black uppercase tracking-[0.15em] shrink-0 w-14 text-right"
          style={{ color: "var(--text-muted)" }}
        >
          Score
        </span>
        <span
          className="text-[9px] font-black uppercase tracking-[0.15em] shrink-0 text-right ml-1"
          style={{ color: "var(--text-muted)", minWidth: 70 }}
        >
          Price / 24h
        </span>
      </div>

      {/* Token rows */}
      <div
        className="rounded-b-lg overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderTop: "none" }}
      >
        {sorted.map((token, i) => (
          <TokenCard key={token.id} token={token} rank={i + 1} />
        ))}
      </div>

      <p
        className="text-center text-[9px] mt-6"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
      >
        SPORTYEX · Signals powered by Fan Token Intel · Refreshes every 5 min
      </p>
    </div>
  );
}

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
      {/* Header */}
      <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.15em] mb-0.5"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}
          >
            Fan Token Signals
          </p>
          <h1 className="text-xl font-black leading-tight">Today&apos;s Pulse</h1>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}
          >
            {today}
          </p>
        </div>

        {/* Signal count pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {hotCount > 0 && (
            <span
              className="text-[10px] font-black uppercase px-2 py-1 rounded"
              style={{ background: "rgba(255,149,0,0.12)", color: "var(--accent-hot)", border: "1px solid rgba(255,149,0,0.2)" }}
            >
              🔥 {hotCount} HOT
            </span>
          )}
          {bullishCount > 0 && (
            <span
              className="text-[10px] font-black uppercase px-2 py-1 rounded"
              style={{ background: "rgba(0,255,135,0.08)", color: "var(--accent-bull)", border: "1px solid rgba(0,255,135,0.15)" }}
            >
              ↑ {bullishCount} BULLISH
            </span>
          )}
          {warningCount > 0 && (
            <span
              className="text-[10px] font-black uppercase px-2 py-1 rounded"
              style={{ background: "rgba(255,59,92,0.08)", color: "var(--accent-bear)", border: "1px solid rgba(255,59,92,0.15)" }}
            >
              ⚠ {warningCount} WARNING
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mb-3" style={{ height: "1px", background: "var(--card-border)" }} />

      {/* Token grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sorted.map((token, i) => (
          <TokenCard key={token.id} token={token} rank={i + 1} />
        ))}
      </div>

      <p
        className="text-center text-[10px] mt-8"
        style={{ color: "rgba(255,255,255,0.15)", fontFamily: "var(--font-mono)" }}
      >
        Signals powered by Fan Token Intel · Refreshes every 5 min
      </p>
    </div>
  );
}

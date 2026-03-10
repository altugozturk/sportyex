import { getTopTokens } from "@/lib/mcp";
import TokenCard from "@/components/TokenCard";
import { Zap } from "lucide-react";

export const revalidate = 300;

export default async function HomePage() {
  const tokens = await getTopTokens();
  const sorted = [...tokens].sort((a, b) => b.signalScore - a.signalScore);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const hotCount = sorted.filter((t) => t.signalLevel === "HOT").length;

  return (
    <div className="pt-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} style={{ color: "var(--accent-bull)" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent-bull)" }}>
            Today&apos;s Pulse
          </span>
        </div>
        <h1 className="text-2xl font-black leading-tight">Fan Token Signals</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          {today}
          {hotCount > 0 && (
            <span className="ml-2 font-semibold" style={{ color: "var(--accent-hot)" }}>
              · {hotCount} token{hotCount > 1 ? "s" : ""} 🔥 hot right now
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map((token, i) => (
          <TokenCard key={token.id} token={token} rank={i + 1} />
        ))}
      </div>

      <p className="text-center text-xs mt-8" style={{ color: "rgba(255,255,255,0.2)" }}>
        Signals powered by Fan Token Intel · Refreshes every 5 min
      </p>
    </div>
  );
}

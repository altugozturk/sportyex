import { UpcomingMatch } from "@/lib/types";
import { Calendar, Clock } from "lucide-react";

interface Props {
  match: UpcomingMatch;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${pad(d.getHours())}:${pad(d.getMinutes())} UTC`;
}

export default function MatchContext({ match }: Props) {
  const urgent = match.hoursUntil <= 24;
  const accentColor = urgent ? "var(--accent-hot)" : "rgba(255,255,255,0.5)";

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <Calendar size={13} style={{ color: accentColor }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
          Upcoming Match
        </span>
        {urgent && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold pulse-glow"
            style={{ background: "rgba(255,149,0,0.15)", color: "var(--accent-hot)" }}
          >
            Soon
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 text-center mb-3">
        <div>
          <p className="font-black text-lg leading-tight">{match.homeTeam}</p>
        </div>
        <span className="font-black text-xl" style={{ color: "rgba(255,255,255,0.25)" }}>vs</span>
        <div>
          <p className="font-black text-lg leading-tight">{match.awayTeam}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        <span className="font-semibold">{match.competition}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {match.hoursUntil < 1 ? "Starting now" : match.hoursUntil < 24 ? `In ${match.hoursUntil}h` : formatKickoff(match.kickoffAt)}
        </span>
      </div>
    </div>
  );
}

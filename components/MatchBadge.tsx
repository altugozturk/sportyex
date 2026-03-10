import { Clock } from "lucide-react";
import { UpcomingMatch } from "@/lib/types";

interface Props {
  match: UpcomingMatch;
}

export default function MatchBadge({ match }: Props) {
  const urgent = match.hoursUntil <= 24;
  const color = urgent ? "#ff9500" : "rgba(255,255,255,0.5)";
  const bg = urgent ? "rgba(255,149,0,0.10)" : "rgba(255,255,255,0.05)";

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color, background: bg, border: `1px solid ${color}40` }}
    >
      <Clock size={9} />
      {match.hoursUntil < 1 ? "Now" : `${match.hoursUntil}h`}
    </span>
  );
}

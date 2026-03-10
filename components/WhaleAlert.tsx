import { WhaleAlert as WhaleAlertType } from "@/lib/types";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";

interface Props {
  alert: WhaleAlertType;
}

export default function WhaleAlert({ alert }: Props) {
  const isBuy = alert.direction === "buy";
  const isSell = alert.direction === "sell";
  const color = isBuy ? "var(--accent-bull)" : isSell ? "var(--accent-bear)" : "var(--accent-hot)";
  const bg = isBuy ? "rgba(0,255,135,0.07)" : isSell ? "rgba(255,59,92,0.07)" : "rgba(255,149,0,0.07)";
  const Icon = isBuy ? ArrowUpRight : isSell ? ArrowDownRight : ArrowLeftRight;

  return (
    <div
      className="rounded-xl p-4 flex items-start gap-3"
      style={{ background: bg, border: `1px solid ${color}25` }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base"
        style={{ background: `${color}15` }}
      >
        🐋
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon size={13} style={{ color }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
            Whale Activity
          </span>
        </div>
        <p className="text-sm font-medium leading-snug">{alert.description}</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          Last {alert.timeframeHours}h · {alert.count} wallet{alert.count !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

import { clsx } from "clsx";
import { SignalLevel } from "@/lib/types";
import { Flame, TrendingUp, Minus, AlertTriangle } from "lucide-react";

interface Props {
  level: SignalLevel;
  className?: string;
  compact?: boolean;
}

const config: Record<SignalLevel, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  HOT:     { label: "HOT",     icon: Flame,         color: "#ff9500", bg: "rgba(255,149,0,0.10)",  border: "rgba(255,149,0,0.22)" },
  BULLISH: { label: "BULL",    icon: TrendingUp,    color: "#00e676", bg: "rgba(0,230,118,0.08)",  border: "rgba(0,230,118,0.20)" },
  QUIET:   { label: "QUIET",   icon: Minus,         color: "rgba(255,255,255,0.35)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)" },
  WARNING: { label: "WARN",    icon: AlertTriangle, color: "#ff3b5c", bg: "rgba(255,59,92,0.10)",  border: "rgba(255,59,92,0.22)" },
};

export default function SignalBadge({ level, className, compact }: Props) {
  const { label, icon: Icon, color, bg, border } = config[level];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 font-black uppercase tracking-widest",
        compact
          ? "px-1.5 py-px text-[9px] rounded"
          : "px-2 py-0.5 text-[10px] rounded",
        className
      )}
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      <Icon size={compact ? 8 : 9} strokeWidth={2.5} />
      {label}
    </span>
  );
}

import { clsx } from "clsx";
import { SignalLevel } from "@/lib/types";
import { Flame, TrendingUp, Minus, AlertTriangle } from "lucide-react";

interface Props {
  level: SignalLevel;
  className?: string;
}

const config: Record<SignalLevel, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  HOT: { label: "HOT", icon: Flame, color: "#ff9500", bg: "rgba(255,149,0,0.12)" },
  BULLISH: { label: "BULLISH", icon: TrendingUp, color: "#00ff87", bg: "rgba(0,255,135,0.10)" },
  QUIET: { label: "QUIET", icon: Minus, color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)" },
  WARNING: { label: "WARNING", icon: AlertTriangle, color: "#ff3b5c", bg: "rgba(255,59,92,0.12)" },
};

export default function SignalBadge({ level, className }: Props) {
  const { label, icon: Icon, color, bg } = config[level];
  return (
    <span
      className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide", className)}
      style={{ color, background: bg, border: `1px solid ${color}30` }}
    >
      <Icon size={10} />
      {label}
    </span>
  );
}

"use client";
import { useEffect, useState } from "react";

interface Props {
  score: number; // 0–100
}

export default function SignalRing({ score }: Props) {
  const [animated, setAnimated] = useState(0);
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animated / 100) * circumference;
  const color =
    animated >= 70 ? "#00ff87" : animated >= 45 ? "#ff9500" : "#ff3b5c";

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.3s",
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </svg>
      {/* Score label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black tabular-nums" style={{ color }}>
          {animated}
        </span>
        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
          Signal
        </span>
      </div>
    </div>
  );
}

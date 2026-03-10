"use client";
import { useState } from "react";
import { getClubIdentity } from "@/lib/crests";

interface Props {
  tokenId: string;
  symbol: string;
  size?: number;
}

export default function CrestIcon({ tokenId, symbol, size = 40 }: Props) {
  const [failed, setFailed] = useState(false);
  const identity = getClubIdentity(tokenId);
  const initials = symbol.slice(0, 3).toUpperCase();

  if (!failed) {
    return (
      <img
        src={`/clubs/${tokenId.toLowerCase()}.svg`}
        alt={symbol}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: "50%", display: "block", flexShrink: 0 }}
        onError={() => setFailed(true)}
      />
    );
  }

  // Fallback: gradient circle from club identity or generic
  const primary = identity?.primary ?? "#1e1e2e";
  const secondary = identity?.secondary ?? "#2a2a3e";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${primary} 55%, ${secondary} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: size * 0.27,
        fontWeight: 900,
        color: "rgba(255,255,255,0.9)",
        letterSpacing: "0.02em",
        fontFamily: "Arial Black, Arial, sans-serif",
      }}
    >
      {initials}
    </div>
  );
}

"use client";
import { useState } from "react";
import { getClubIdentity } from "@/lib/crests";

interface Props {
  tokenId: string;
  symbol: string;
  size?: number;
}

export default function CrestIcon({ tokenId, symbol, size = 40 }: Props) {
  // Try PNG (official) → SVG → gradient fallback
  const [attempt, setAttempt] = useState<"png" | "svg" | "fallback">("png");
  const identity = getClubIdentity(tokenId);
  const initials = symbol.slice(0, 3).toUpperCase();
  const clubColor = identity?.primary ?? "#1e1e3a";
  const id = tokenId.toLowerCase();

  const ringStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    display: "block",
    outline: `1.5px solid ${clubColor}50`,
    outlineOffset: "1px",
  };

  if (attempt === "png") {
    return (
      <img
        src={`/clubs/${id}.png`}
        alt={symbol}
        width={size}
        height={size}
        style={{ ...ringStyle, objectFit: "contain" }}
        onError={() => setAttempt("svg")}
      />
    );
  }

  if (attempt === "svg") {
    return (
      <img
        src={`/clubs/${id}.svg`}
        alt={symbol}
        width={size}
        height={size}
        style={{ ...ringStyle, objectFit: "contain" }}
        onError={() => setAttempt("fallback")}
      />
    );
  }

  // Gradient fallback
  const secondary = identity?.secondary ?? "#2a2a4e";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${clubColor} 50%, ${secondary} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: size * 0.27,
        fontWeight: 900,
        color: "rgba(255,255,255,0.92)",
        letterSpacing: "0.01em",
        fontFamily: "var(--font-sans, Arial Black, Arial, sans-serif)",
        outline: `1.5px solid ${clubColor}50`,
        outlineOffset: "1px",
      }}
    >
      {initials}
    </div>
  );
}

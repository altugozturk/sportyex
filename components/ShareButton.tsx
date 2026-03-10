"use client";
import { Share2, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  symbol: string;
}

export default function ShareButton({ symbol }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `${symbol} Signal on Sportyex`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> Share this signal</>}
    </button>
  );
}

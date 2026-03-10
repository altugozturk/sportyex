export type SignalLevel = "HOT" | "BULLISH" | "QUIET" | "WARNING";

export interface FanToken {
  id: string;           // e.g. "PSG"
  symbol: string;       // e.g. "PSG"
  name: string;         // e.g. "Paris Saint-Germain Fan Token"
  team: string;         // e.g. "PSG"
  sport: string;        // e.g. "football"
  price: number;
  priceChange24h: number;   // percentage
  priceChange7d: number;    // percentage
  marketCap?: number;
  volume24h?: number;
  signalScore: number;      // 0-100
  signalLevel: SignalLevel;
  logoUrl?: string;
  upcomingMatch?: UpcomingMatch;
  whaleAlert?: WhaleAlert;
  sentimentScore?: number;  // 0-100, bullish %
}

export interface UpcomingMatch {
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickoffAt: string;    // ISO timestamp
  hoursUntil: number;
}

export interface WhaleAlert {
  description: string;   // "3 wallets moved 50k+ tokens in 6h"
  count: number;
  totalTokens: number;
  direction: "buy" | "sell" | "mixed";
  timeframeHours: number;
}

export interface TokenDetail extends FanToken {
  priceHistory?: PricePoint[];
  topHolders?: number;
  circulatingSupply?: number;
  exchange?: string;
}

export interface PricePoint {
  timestamp: string;
  price: number;
}

export interface VoteTally {
  tokenId: string;
  bull: number;
  bear: number;
  total: number;
  bullPercent: number;
}

export interface WeeklyMover {
  token: FanToken;
  weeklyChange: number;
  rank: number;
}

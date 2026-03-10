/**
 * Fan Token Intel MCP client wrapper.
 * Connects to the MCP server via SSE and calls tools server-side.
 * All MCP calls happen here — never on the client.
 */

import { connection } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { FanToken, TokenDetail, SignalLevel, WhaleAlert, UpcomingMatch } from "./types";

const MCP_URL = process.env.FAN_TOKEN_MCP_URL || "https://mcp-production-f681.up.railway.app/sse";

let _client: Client | null = null;
let _toolNames: string[] = [];

async function getClient(): Promise<Client> {
  // Ensure this always runs in a dynamic (request-time) context so Next.js
  // never throws DynamicServerError when the MCP SDK makes no-cache SSE fetches.
  await connection();

  if (_client) return _client;

  const transport = new SSEClientTransport(new URL(MCP_URL));
  const client = new Client({ name: "sportyex", version: "1.0.0" });

  await client.connect(transport);
  _client = client;

  // Cache available tool names
  const toolsResult = await client.listTools();
  _toolNames = toolsResult.tools.map((t) => t.name);
  console.log("[MCP] Connected. Available tools:", _toolNames);

  return client;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function callTool(name: string, args: Record<string, any> = {}): Promise<any> {
  const client = await getClient();
  const result = await client.callTool({ name, arguments: args });
  if (result.isError) {
    throw new Error(`MCP tool error [${name}]: ${JSON.stringify(result.content)}`);
  }
  // MCP returns content array; parse text content
  const content = result.content as Array<{ type: string; text?: string }>;
  const text = content.find((c) => c.type === "text")?.text;
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function getAvailableTools(): Promise<string[]> {
  await getClient();
  return _toolNames;
}

// ─── Token List ─────────────────────────────────────────────────────────────

export async function getTopTokens(): Promise<FanToken[]> {
  try {
    // Try common tool name patterns for listing fan tokens
    const toolCandidates = [
      "get_fan_tokens",
      "list_fan_tokens",
      "get_tokens",
      "fan_tokens_list",
      "get_market_data",
      "get_all_tokens",
    ];

    const available = await getAvailableTools();
    const toolName = toolCandidates.find((t) => available.includes(t));

    if (!toolName) {
      console.warn("[MCP] No token list tool found, available:", available);
      return getMockTokens();
    }

    const raw = await callTool(toolName);
    return normalizeTokenList(raw);
  } catch (err) {
    console.error("[MCP] getTopTokens failed:", err);
    return getMockTokens();
  }
}

export async function getTokenDetail(tokenId: string): Promise<TokenDetail | null> {
  try {
    const available = await getAvailableTools();

    const detailCandidates = [
      "get_token_detail",
      "get_fan_token",
      "token_detail",
      "get_token_info",
    ];
    const detailTool = detailCandidates.find((t) => available.includes(t));

    const whaleCandidates = [
      "get_whale_activity",
      "whale_activity",
      "get_whale_flows",
      "whale_flows",
      "get_large_transfers",
    ];
    const whaleTool = whaleCandidates.find((t) => available.includes(t));

    const matchCandidates = [
      "get_upcoming_matches",
      "upcoming_matches",
      "get_sports_calendar",
      "sports_calendar",
      "get_match_context",
    ];
    const matchTool = matchCandidates.find((t) => available.includes(t));

    const [detail, whaleData, matchData] = await Promise.allSettled([
      detailTool ? callTool(detailTool, { token: tokenId, symbol: tokenId }) : Promise.resolve(null),
      whaleTool ? callTool(whaleTool, { token: tokenId, symbol: tokenId }) : Promise.resolve(null),
      matchTool ? callTool(matchTool, { token: tokenId, team: tokenId }) : Promise.resolve(null),
    ]);

    const base = detail.status === "fulfilled" && detail.value
      ? normalizeTokenDetail(detail.value, tokenId)
      : getMockTokenDetail(tokenId);

    if (whaleData.status === "fulfilled" && whaleData.value) {
      base.whaleAlert = normalizeWhaleAlert(whaleData.value);
    }
    if (matchData.status === "fulfilled" && matchData.value) {
      base.upcomingMatch = normalizeMatch(matchData.value);
    }

    return base;
  } catch (err) {
    console.error("[MCP] getTokenDetail failed:", err);
    return getMockTokenDetail(tokenId);
  }
}

export async function getWeeklyMovers(): Promise<FanToken[]> {
  try {
    const available = await getAvailableTools();
    const candidates = [
      "get_weekly_movers",
      "weekly_movers",
      "get_top_performers",
      "get_price_performance",
      "top_movers",
    ];
    const toolName = candidates.find((t) => available.includes(t));
    if (!toolName) return getMockTokens().sort((a, b) => b.priceChange7d - a.priceChange7d);

    const raw = await callTool(toolName, { period: "7d" });
    return normalizeTokenList(raw);
  } catch (err) {
    console.error("[MCP] getWeeklyMovers failed:", err);
    return getMockTokens().sort((a, b) => b.priceChange7d - a.priceChange7d);
  }
}

// ─── Normalizers ────────────────────────────────────────────────────────────
// These map raw MCP response shapes to our clean types.
// Adjust field names once actual MCP schema is confirmed.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTokenList(raw: any): FanToken[] {
  if (!raw) return getMockTokens();
  const list = Array.isArray(raw) ? raw : raw.tokens || raw.data || raw.results || [];
  if (!list.length) return getMockTokens();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return list.map((t: any) => normalizeToken(t)).filter(Boolean);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeToken(t: any): FanToken {
  const change24h = parseFloat(t.price_change_24h ?? t.priceChange24h ?? t.change24h ?? 0);
  const score = parseInt(t.signal_score ?? t.signalScore ?? t.score ?? "50");
  return {
    id: t.symbol ?? t.id ?? t.token_id ?? "UNKNOWN",
    symbol: t.symbol ?? t.ticker ?? "?",
    name: t.name ?? t.token_name ?? t.symbol ?? "Unknown Token",
    team: t.team ?? t.club ?? t.symbol ?? "Unknown",
    sport: t.sport ?? "football",
    price: parseFloat(t.price ?? t.current_price ?? 0),
    priceChange24h: change24h,
    priceChange7d: parseFloat(t.price_change_7d ?? t.priceChange7d ?? t.change7d ?? 0),
    marketCap: t.market_cap ?? t.marketCap,
    volume24h: t.volume_24h ?? t.volume24h,
    signalScore: isNaN(score) ? 50 : score,
    signalLevel: scoreToLevel(isNaN(score) ? 50 : score, change24h),
    logoUrl: t.logo_url ?? t.logoUrl ?? t.image ?? undefined,
    upcomingMatch: t.upcoming_match ? normalizeMatch(t.upcoming_match) : undefined,
    whaleAlert: t.whale_alert ? normalizeWhaleAlert(t.whale_alert) : undefined,
    sentimentScore: t.sentiment_score ?? t.bullish_percent,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTokenDetail(raw: any, fallbackId: string): TokenDetail {
  const base = normalizeToken({ ...raw, symbol: raw.symbol ?? fallbackId });
  return {
    ...base,
    topHolders: raw.top_holders ?? raw.topHolders,
    circulatingSupply: raw.circulating_supply ?? raw.circulatingSupply,
    exchange: raw.exchange ?? raw.dex ?? "Chiliz",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeWhaleAlert(raw: any): WhaleAlert {
  return {
    description: raw.description ?? raw.summary ?? `Large wallet activity detected`,
    count: parseInt(raw.count ?? raw.wallet_count ?? 1),
    totalTokens: parseFloat(raw.total_tokens ?? raw.amount ?? 0),
    direction: raw.direction ?? raw.side ?? "mixed",
    timeframeHours: parseInt(raw.timeframe_hours ?? raw.hours ?? 24),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMatch(raw: any): UpcomingMatch {
  const kickoff = raw.kickoff_at ?? raw.kickoffAt ?? raw.date ?? raw.start_time ?? new Date().toISOString();
  const hours = Math.max(0, Math.round((new Date(kickoff).getTime() - Date.now()) / 3_600_000));
  return {
    homeTeam: raw.home_team ?? raw.homeTeam ?? raw.home ?? "TBD",
    awayTeam: raw.away_team ?? raw.awayTeam ?? raw.away ?? "TBD",
    competition: raw.competition ?? raw.league ?? raw.tournament ?? "League",
    kickoffAt: kickoff,
    hoursUntil: hours,
  };
}

function scoreToLevel(score: number, change24h: number): SignalLevel {
  if (score >= 75 || (score >= 60 && change24h > 5)) return "HOT";
  if (score >= 55 || change24h > 2) return "BULLISH";
  if (change24h < -5 || score < 30) return "WARNING";
  return "QUIET";
}

// ─── Mock Data (fallback when MCP is unavailable) ──────────────────────────

export function getMockTokens(): FanToken[] {
  return [
    {
      id: "PSG",
      symbol: "PSG",
      name: "Paris Saint-Germain Fan Token",
      team: "PSG",
      sport: "football",
      price: 3.24,
      priceChange24h: 8.4,
      priceChange7d: 14.2,
      signalScore: 87,
      signalLevel: "HOT",
      sentimentScore: 74,
      upcomingMatch: {
        homeTeam: "PSG",
        awayTeam: "Man City",
        competition: "UCL",
        kickoffAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
        hoursUntil: 18,
      },
      whaleAlert: {
        description: "3 wallets moved 50k+ tokens in 6h",
        count: 3,
        totalTokens: 152000,
        direction: "buy",
        timeframeHours: 6,
      },
    },
    {
      id: "BAR",
      symbol: "BAR",
      name: "FC Barcelona Fan Token",
      team: "Barcelona",
      sport: "football",
      price: 2.81,
      priceChange24h: 5.1,
      priceChange7d: 9.3,
      signalScore: 72,
      signalLevel: "BULLISH",
      sentimentScore: 68,
      upcomingMatch: {
        homeTeam: "Barcelona",
        awayTeam: "Real Madrid",
        competition: "La Liga",
        kickoffAt: new Date(Date.now() + 42 * 3600 * 1000).toISOString(),
        hoursUntil: 42,
      },
    },
    {
      id: "JUV",
      symbol: "JUV",
      name: "Juventus Fan Token",
      team: "Juventus",
      sport: "football",
      price: 1.95,
      priceChange24h: -2.3,
      priceChange7d: 1.1,
      signalScore: 41,
      signalLevel: "QUIET",
      sentimentScore: 48,
    },
    {
      id: "ACM",
      symbol: "ACM",
      name: "AC Milan Fan Token",
      team: "AC Milan",
      sport: "football",
      price: 2.44,
      priceChange24h: 3.7,
      priceChange7d: 6.8,
      signalScore: 63,
      signalLevel: "BULLISH",
      sentimentScore: 61,
      upcomingMatch: {
        homeTeam: "AC Milan",
        awayTeam: "Inter Milan",
        competition: "Serie A",
        kickoffAt: new Date(Date.now() + 29 * 3600 * 1000).toISOString(),
        hoursUntil: 29,
      },
    },
    {
      id: "ATM",
      symbol: "ATM",
      name: "Atlético de Madrid Fan Token",
      team: "Atlético Madrid",
      sport: "football",
      price: 3.07,
      priceChange24h: -6.1,
      priceChange7d: -3.4,
      signalScore: 28,
      signalLevel: "WARNING",
      sentimentScore: 38,
      whaleAlert: {
        description: "Large sell-off: 2 wallets dumped 80k tokens",
        count: 2,
        totalTokens: 80000,
        direction: "sell",
        timeframeHours: 12,
      },
    },
    {
      id: "CITY",
      symbol: "CITY",
      name: "Manchester City Fan Token",
      team: "Man City",
      sport: "football",
      price: 4.15,
      priceChange24h: 11.2,
      priceChange7d: 18.6,
      signalScore: 91,
      signalLevel: "HOT",
      sentimentScore: 81,
      upcomingMatch: {
        homeTeam: "PSG",
        awayTeam: "Man City",
        competition: "UCL",
        kickoffAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
        hoursUntil: 18,
      },
      whaleAlert: {
        description: "5 whales accumulated 200k+ tokens",
        count: 5,
        totalTokens: 210000,
        direction: "buy",
        timeframeHours: 8,
      },
    },
    {
      id: "INTER",
      symbol: "INTER",
      name: "Inter Milan Fan Token",
      team: "Inter Milan",
      sport: "football",
      price: 1.88,
      priceChange24h: 1.4,
      priceChange7d: 4.2,
      signalScore: 54,
      signalLevel: "QUIET",
      sentimentScore: 55,
    },
    {
      id: "GAL",
      symbol: "GAL",
      name: "Galatasaray Fan Token",
      team: "Galatasaray",
      sport: "football",
      price: 1.62,
      priceChange24h: 4.9,
      priceChange7d: 7.7,
      signalScore: 67,
      signalLevel: "BULLISH",
      sentimentScore: 63,
    },
  ];
}

function getMockTokenDetail(tokenId: string): TokenDetail {
  const base = getMockTokens().find((t) => t.id === tokenId.toUpperCase()) ?? getMockTokens()[0];
  return {
    ...base,
    topHolders: 1420,
    circulatingSupply: 20_000_000,
    exchange: "Chiliz Exchange",
  };
}

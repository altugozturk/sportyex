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
const API_KEY = process.env.FAN_TOKEN_INTEL_API_KEY;

let _client: Client | null = null;
let _toolNames: string[] = [];

async function getClient(): Promise<Client> {
  // Ensure this always runs in a dynamic (request-time) context so Next.js
  // never throws DynamicServerError when the MCP SDK makes no-cache SSE fetches.
  await connection();

  if (_client) return _client;

  const headers: Record<string, string> = API_KEY
    ? { Authorization: `Bearer ${API_KEY}` }
    : {};

  const transport = new SSEClientTransport(new URL(MCP_URL), {
    requestInit: { headers },
    eventSourceInit: { headers } as EventSourceInit,
  });
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

/** Exposed for the debug endpoint — calls any tool and returns raw response */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function callToolDebug(name: string, args: Record<string, any> = {}): Promise<any> {
  return callTool(name, args);
}

// ─── Tool name matching ──────────────────────────────────────────────────────
// Keyword-in-name matching: broader than exact list for 67+ tool servers

function findTool(available: string[], keywords: string[]): string | undefined {
  return available.find((name) =>
    keywords.some((kw) => name.toLowerCase().includes(kw))
  );
}

// ─── Token List ─────────────────────────────────────────────────────────────

export async function getTopTokens(): Promise<FanToken[]> {
  try {
    const available = await getAvailableTools();
    const toolName = findTool(available, [
      "realtime_prices", "daily_brief", "briefing", "market_regime",
      "fan_token", "token_list", "get_tokens", "market_data", "all_token", "list_token",
    ]);

    if (!toolName) {
      console.warn("[MCP] No token list tool found, available:", available);
      return [];
    }

    const raw = await callTool(toolName);
    console.log("[MCP] getTopTokens raw (first 800 chars):", JSON.stringify(raw).slice(0, 800));
    const tokens = normalizeTokenList(raw);
    if (tokens.length === 0) {
      console.warn("[MCP] getTopTokens normalised to empty list. Raw was:", JSON.stringify(raw).slice(0, 400));
    }
    return tokens;
  } catch (err) {
    console.error("[MCP] getTopTokens failed:", err);
    return [];
  }
}

export async function getTokenDetail(tokenId: string): Promise<TokenDetail | null> {
  try {
    const available = await getAvailableTools();

    const detailTool = findTool(available, [
      "token_context", "analytics", "signals_history", "signal_bundle",
      "token_detail", "token_info", "get_fan_token", "token_data",
    ]);

    const whaleTool = findTool(available, [
      "whale", "large_transfer", "big_wallet", "flow",
    ]);

    const matchTool = findTool(available, [
      "match", "fixture", "calendar", "schedule", "game", "kickoff",
    ]);

    console.log(`[MCP] getTokenDetail(${tokenId}) tools — detail:${detailTool} whale:${whaleTool} match:${matchTool}`);

    const [detail, whaleData, matchData] = await Promise.allSettled([
      detailTool ? callTool(detailTool, { token: tokenId, symbol: tokenId }) : Promise.resolve(null),
      whaleTool ? callTool(whaleTool, { token: tokenId, symbol: tokenId }) : Promise.resolve(null),
      matchTool ? callTool(matchTool, { token: tokenId, team: tokenId }) : Promise.resolve(null),
    ]);

    if (detail.status === "fulfilled" && detail.value) {
      console.log(`[MCP] detail raw (${tokenId}, first 600):`, JSON.stringify(detail.value).slice(0, 600));
    }
    if (whaleData.status === "fulfilled" && whaleData.value) {
      console.log(`[MCP] whale raw (${tokenId}, first 400):`, JSON.stringify(whaleData.value).slice(0, 400));
    }

    if (detail.status !== "fulfilled" || !detail.value) {
      console.warn(`[MCP] No detail data for ${tokenId}`);
      return null;
    }

    const base = normalizeTokenDetail(detail.value, tokenId);

    // If core fields didn't map (price=0, default score), log and return null
    // so the UI shows an appropriate empty state rather than misleading data.
    if (base.price === 0 && base.signalScore === 50) {
      console.warn(`[MCP] normalizeTokenDetail produced defaults for ${tokenId} — field mapping likely wrong. Raw:`, JSON.stringify(detail.value).slice(0, 600));
      return null;
    }

    if (whaleData.status === "fulfilled" && whaleData.value) {
      base.whaleAlert = normalizeWhaleAlert(whaleData.value);
    }
    if (matchData.status === "fulfilled" && matchData.value) {
      base.upcomingMatch = normalizeMatch(matchData.value);
    }

    return base;
  } catch (err) {
    console.error("[MCP] getTokenDetail failed:", err);
    return null;
  }
}

export async function getWeeklyMovers(): Promise<FanToken[]> {
  try {
    const available = await getAvailableTools();
    const toolName = findTool(available, [
      "realtime_prices", "accumulation_signals", "signals_active",
      "weekly", "mover", "top_performer", "price_change", "gainers",
    ]);
    if (!toolName) return [];

    const raw = await callTool(toolName, { period: "7d" });
    return normalizeTokenList(raw);
  } catch (err) {
    console.error("[MCP] getWeeklyMovers failed:", err);
    return [];
  }
}

// ─── Normalizers ────────────────────────────────────────────────────────────
// These map raw MCP response shapes to our clean types.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTokenList(raw: any): FanToken[] {
  if (!raw) return [];
  // Try every common wrapper field an API might use
  const list = Array.isArray(raw) ? raw
    : raw.tokens ?? raw.data ?? raw.results ?? raw.prices
    ?? raw.market_data ?? raw.fan_tokens ?? raw.market
    ?? raw.items ?? raw.records ?? [];
  if (!Array.isArray(list) || list.length === 0) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return list.map((t: any) => normalizeToken(t)).filter(Boolean);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeToken(t: any): FanToken {
  const change24h = parseFloat(
    t.price_change_24h ?? t.priceChange24h ?? t.change_24h ?? t.change24h
    ?? t.daily_change ?? t.change ?? 0
  );
  const rawScore =
    t.signal_score ?? t.signalScore ?? t.score ?? t.momentum_score
    ?? t.trend_score ?? t.strength ?? t.rating ?? "50";
  const score = parseInt(String(rawScore));
  const price = parseFloat(
    t.price ?? t.current_price ?? t.last_price ?? t.latest_price
    ?? t.price_usd ?? t.value ?? 0
  );
  return {
    id: t.symbol ?? t.id ?? t.token_id ?? t.token ?? "UNKNOWN",
    symbol: t.symbol ?? t.ticker ?? t.token ?? "?",
    name: t.name ?? t.token_name ?? t.symbol ?? "Unknown Token",
    team: t.team ?? t.club ?? t.club_name ?? t.symbol ?? "Unknown",
    sport: t.sport ?? "football",
    price,
    priceChange24h: change24h,
    priceChange7d: parseFloat(
      t.price_change_7d ?? t.priceChange7d ?? t.change_7d ?? t.change7d
      ?? t.weekly_change ?? 0
    ),
    marketCap: t.market_cap ?? t.marketCap,
    volume24h: t.volume_24h ?? t.volume24h ?? t.volume,
    signalScore: isNaN(score) ? 50 : score,
    signalLevel: scoreToLevel(isNaN(score) ? 50 : score, change24h),
    logoUrl: t.logo_url ?? t.logoUrl ?? t.image ?? t.logo ?? undefined,
    upcomingMatch: t.upcoming_match ? normalizeMatch(t.upcoming_match) : undefined,
    whaleAlert: t.whale_alert ? normalizeWhaleAlert(t.whale_alert) : undefined,
    sentimentScore: t.sentiment_score ?? t.bullish_percent ?? t.bullish_percentage,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTokenDetail(raw: any, fallbackId: string): TokenDetail {
  // Unwrap array or common nested wrappers
  const t = Array.isArray(raw) ? raw[0]
    : raw?.data ?? raw?.token ?? raw?.result ?? raw?.bundle
    ?? raw?.details ?? raw?.token_data ?? raw?.info ?? raw;
  const base = normalizeToken({ ...t, symbol: t?.symbol ?? fallbackId });
  return {
    ...base,
    topHolders: t.top_holders ?? t.topHolders ?? t.holder_count,
    circulatingSupply: t.circulating_supply ?? t.circulatingSupply ?? t.supply,
    exchange: t.exchange ?? t.dex ?? t.platform ?? "FanX",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeWhaleAlert(raw: any): WhaleAlert {
  // Unwrap array or nested containers
  const d = Array.isArray(raw) ? raw[0]
    : raw?.flows?.[0] ?? raw?.whale_data ?? raw?.data ?? raw?.alert ?? raw;
  return {
    description: d.description ?? d.summary ?? d.message ?? "Large wallet activity detected",
    count: parseInt(d.count ?? d.wallet_count ?? d.wallets ?? d.num_wallets ?? 1),
    totalTokens: parseFloat(d.total_tokens ?? d.amount ?? d.volume ?? d.token_amount ?? 0),
    direction: d.direction ?? d.side ?? d.flow_direction ?? d.type ?? "mixed",
    timeframeHours: parseInt(d.timeframe_hours ?? d.hours ?? d.window_hours ?? d.period_hours ?? 24),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMatch(raw: any): UpcomingMatch {
  const d = Array.isArray(raw) ? raw[0]
    : raw?.match ?? raw?.fixture ?? raw?.data ?? raw?.game ?? raw;
  const kickoff =
    d.kickoff_at ?? d.kickoffAt ?? d.kickoff ?? d.date ?? d.start_time
    ?? d.match_date ?? d.datetime ?? new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const hours = Math.max(0, Math.round((new Date(kickoff).getTime() - Date.now()) / 3_600_000));
  return {
    homeTeam: d.home_team ?? d.homeTeam ?? d.home ?? d.home_club ?? "TBD",
    awayTeam: d.away_team ?? d.awayTeam ?? d.away ?? d.away_club ?? "TBD",
    competition: d.competition ?? d.league ?? d.tournament ?? d.cup ?? "League",
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

// ─── Mock Data (kept for local dev / tests only — not used at runtime) ──────

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
      signalScore: 78,
      signalLevel: "HOT",
      sentimentScore: 63,
      upcomingMatch: {
        homeTeam: "Galatasaray",
        awayTeam: "Bayern Munich",
        competition: "UCL",
        kickoffAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        hoursUntil: 6,
      },
    },
  ];
}

export function getMockTokenDetail(tokenId: string): TokenDetail {
  const base = getMockTokens().find((t) => t.id === tokenId.toUpperCase()) ?? getMockTokens()[0];
  return {
    ...base,
    topHolders: 1420,
    circulatingSupply: 20_000_000,
    exchange: "FanX",
  };
}

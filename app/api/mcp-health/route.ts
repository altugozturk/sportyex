import { NextResponse } from "next/server";
import { getAvailableTools } from "@/lib/mcp";

export const dynamic = "force-dynamic";

export async function GET() {
  const t0 = Date.now();
  try {
    const tools = await getAvailableTools();
    return NextResponse.json({
      connected: true,
      tools,
      mcpUrl: process.env.FAN_TOKEN_MCP_URL || "(default: mcp-production-f681.up.railway.app)",
      hasApiKey: !!process.env.FAN_TOKEN_INTEL_API_KEY,
      latencyMs: Date.now() - t0,
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        connected: false,
        tools: [],
        mcpUrl: process.env.FAN_TOKEN_MCP_URL || "(default: mcp-production-f681.up.railway.app)",
        hasApiKey: !!process.env.FAN_TOKEN_INTEL_API_KEY,
        latencyMs: Date.now() - t0,
        error: message,
      },
      { status: 502 },
    );
  }
}

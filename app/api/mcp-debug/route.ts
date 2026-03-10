import { NextRequest } from "next/server";
import { getAvailableTools, callToolDebug } from "@/lib/mcp";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const toolName = searchParams.get("tool");
  const tokenParam = searchParams.get("token") ?? "CITY";

  const tools = await getAvailableTools();

  if (toolName) {
    const raw = await callToolDebug(toolName, { token: tokenParam, symbol: tokenParam });
    return Response.json({ tool: toolName, token: tokenParam, raw });
  }

  return Response.json({ count: tools.length, tools });
}

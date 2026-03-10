import { NextResponse } from "next/server";
import { getAvailableTools } from "@/lib/mcp";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tools = await getAvailableTools();
    return NextResponse.json({ connected: true, tools, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ connected: false, tools: [], error: message }, { status: 502 });
  }
}

import { NextResponse } from "next/server";
import { getTopTokens } from "@/lib/mcp";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tokens = await getTopTokens();
    return NextResponse.json(tokens);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}

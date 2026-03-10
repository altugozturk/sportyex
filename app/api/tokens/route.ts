import { NextResponse } from "next/server";
import { getTopTokens } from "@/lib/mcp";

export const revalidate = 300; // 5 min ISR

export async function GET() {
  try {
    const tokens = await getTopTokens();
    return NextResponse.json(tokens);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}

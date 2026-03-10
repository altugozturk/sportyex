import { NextRequest, NextResponse } from "next/server";
import { getTokenDetail } from "@/lib/mcp";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const token = await getTokenDetail(slug.toUpperCase());
    if (!token) return NextResponse.json({ error: "Token not found" }, { status: 404 });
    return NextResponse.json(token);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { castVote, VoteDirection } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tokenId, direction, fingerprint } = body as {
    tokenId: string;
    direction: VoteDirection;
    fingerprint: string;
  };

  if (!tokenId || !direction || !fingerprint) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!["bull", "bear"].includes(direction)) {
    return NextResponse.json({ error: "Invalid direction" }, { status: 400 });
  }

  const result = await castVote(tokenId, direction, fingerprint);
  if (result?.error) {
    return NextResponse.json({ error: String(result.error) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

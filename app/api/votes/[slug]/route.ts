import { NextRequest, NextResponse } from "next/server";
import { getVoteTally } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const tally = await getVoteTally(slug.toUpperCase());
  return NextResponse.json(tally);
}

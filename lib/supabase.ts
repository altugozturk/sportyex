import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type VoteDirection = "bull" | "bear";

export async function castVote(tokenId: string, direction: VoteDirection, fingerprint: string) {
  if (!supabase) return { error: "Supabase not configured" };
  return supabase.from("votes").insert({ token_id: tokenId, direction, fingerprint });
}

export async function getVoteTally(tokenId: string) {
  if (!supabase) return { bull: 0, bear: 0, total: 0, bullPercent: 50 };

  const { data, error } = await supabase
    .from("votes")
    .select("direction")
    .eq("token_id", tokenId);

  if (error || !data) return { bull: 0, bear: 0, total: 0, bullPercent: 50 };

  const bull = data.filter((r) => r.direction === "bull").length;
  const bear = data.filter((r) => r.direction === "bear").length;
  const total = bull + bear;
  return { bull, bear, total, bullPercent: total ? Math.round((bull / total) * 100) : 50 };
}

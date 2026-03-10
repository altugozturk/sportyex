export const dynamic = 'force-dynamic';

export async function GET() {
  const { getAvailableTools } = await import("@/lib/mcp");
  const tools = await getAvailableTools();
  return Response.json({ count: tools.length, tools });
}

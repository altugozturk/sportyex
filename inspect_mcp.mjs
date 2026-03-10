import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const MCP_URL = "https://mcp-production-f681.up.railway.app/sse";

async function inspectMCP() {
  try {
    const transport = new SSEClientTransport(new URL(MCP_URL));
    const client = new Client({ name: "inspector", version: "1.0.0" });
    
    console.log("Connecting to MCP server...");
    await client.connect(transport);
    
    console.log("Fetching available tools...");
    const toolsResult = await client.listTools();
    const tools = toolsResult.tools;
    
    console.log(`\nFound ${tools.length} tools:\n`);
    
    tools.forEach((tool, i) => {
      console.log(`${i + 1}. ${tool.name}`);
      console.log(`   Description: ${tool.description || 'N/A'}`);
      if (tool.inputSchema) {
        console.log(`   Input Schema:`, JSON.stringify(tool.inputSchema, null, 2));
      }
      console.log();
    });
    
    // Try calling tools to get response structures
    console.log("\n=== TESTING TOOL CALLS ===\n");
    
    const tokenListTools = tools.filter(t => 
      /list|token|all/.test(t.name.toLowerCase())
    );
    
    console.log("Token list candidates:", tokenListTools.map(t => t.name));
    
    for (const tool of tokenListTools) {
      try {
        console.log(`\nCalling ${tool.name}...`);
        const result = await client.callTool({ 
          name: tool.name, 
          arguments: {} 
        });
        if (!result.isError) {
          const content = result.content;
          console.log(`Response type: ${typeof content}`);
          console.log(`Response:`, JSON.stringify(content, null, 2).substring(0, 500));
        } else {
          console.log(`Error: ${JSON.stringify(result.content)}`);
        }
      } catch (e) {
        console.log(`Exception: ${e.message}`);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

inspectMCP();

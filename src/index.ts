import { render } from "ink";
import { createElement } from "react";
import { App } from "#tui/App.js";
import { LlmClient } from "#llm/client.js";
import { Agent, ToolRegistry } from "#agent/index.js";
import { createWebSearchTool } from "#tools/web-search.js";
import { createBrowseTool } from "#tools/browse.js";

const client = new LlmClient();
const toolRegistry = new ToolRegistry();
toolRegistry.register(createWebSearchTool());
toolRegistry.register(createBrowseTool());

const healthy = await client.isHealthy();
if (!healthy) {
  console.error(
    "Could not connect to LM Studio at http://localhost:1234. Is it running?",
  );
  process.exit(1);
}

const models = await client.listModels();
const modelNames = models.data.map((m) => m.id);
console.log(
  `Connected to LM Studio. Available models: ${modelNames.join(", ")}`,
);
console.log(`Tools registered: ${String(toolRegistry.toLlmTools().length)}`);
console.log("Starting TUI...\n");

const agent = new Agent({
  llmClient: client,
  toolRegistry,
  systemPrompt: [
    "You are a job search assistant with access to tools.",
    "",
    "RULES:",
    "- NEVER fabricate, guess, or assume information. Every fact you present must come directly from tool results.",
    "- If you cannot find or verify something, say so honestly.",
    "- When reporting dates, posting times, or any details, only use what is explicitly stated in the page content.",
    "",
    "WORKFLOW:",
    "1. Use web_search to find job listings. Use the freshness parameter to filter for recent results when the user wants recent postings.",
    "2. Use browse to read the full content of promising results. Do NOT summarize based on search snippets alone.",
    "3. ALWAYS try to browse a page before assuming it is inaccessible. Many pages work fine even if you think they require login.",
    "4. Present your findings based only on what you actually read from the pages.",
    "5. You can run multiple searches with different queries to get better results.",
  ].join("\n"),
});

render(createElement(App, { agent }));

import { render } from "ink";
import { createElement } from "react";
import { App } from "#tui/App.js";
import { LlmClient } from "#llm/client.js";
import { Agent, ToolRegistry } from "#agent/index.js";
import { createWebSearchTool } from "#tools/web-search.js";

const client = new LlmClient();
const toolRegistry = new ToolRegistry();
toolRegistry.register(createWebSearchTool());

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
    "When the user asks you to find jobs or search for positions, you MUST use the web_search tool to find real, current results.",
    "Do NOT make up job listings or provide generic advice. Always search first, then present what you find.",
    "You can run multiple searches with different queries to get better results.",
  ].join("\n"),
});

render(createElement(App, { agent }));

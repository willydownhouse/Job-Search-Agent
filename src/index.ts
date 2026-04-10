import { render } from "ink";
import { createElement } from "react";
import { App } from "#tui/App.js";
import { LlmClient } from "#llm/client.js";
import { Agent, ToolRegistry } from "#agent/index.js";

const client = new LlmClient();
const toolRegistry = new ToolRegistry();

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
  systemPrompt: "You are a helpful job search assistant.",
});

render(createElement(App, { agent }));

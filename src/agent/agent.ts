import type { LlmClient } from "#llm/client.js";
import type { ChatMessage } from "#types/llm.js";
import type { ToolRegistry } from "./tool-registry.js";

const MAX_ITERATIONS = 10;

export interface AgentEvent {
  type: "tool_call" | "tool_result" | "error";
  toolName: string;
  args?: Record<string, unknown>;
  result?: string;
}

type EventHandler = (event: AgentEvent) => void;

interface AgentConfig {
  llmClient: LlmClient;
  toolRegistry: ToolRegistry;
  systemPrompt?: string;
}

interface RunOptions {
  onEvent?: EventHandler;
}

export class Agent {
  private readonly llmClient: LlmClient;
  private readonly toolRegistry: ToolRegistry;
  private readonly systemPrompt: string;

  constructor(config: AgentConfig) {
    this.llmClient = config.llmClient;
    this.toolRegistry = config.toolRegistry;
    this.systemPrompt = config.systemPrompt ?? "You are a helpful assistant.";
  }

  async run(userMessage: string, options?: RunOptions): Promise<string> {
    const onEvent = options?.onEvent;
    const messages: ChatMessage[] = [
      { role: "system", content: this.systemPrompt },
      { role: "user", content: userMessage },
    ];

    const tools = this.toolRegistry.toLlmTools();
    const hasTools = tools.length > 0;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await this.llmClient.chatCompletion(
        messages,
        hasTools ? { tools } : undefined,
      );

      const choice = response.choices[0];
      if (choice === undefined) {
        throw new Error("No choice in LLM response");
      }

      const { message } = choice;

      messages.push({
        role: "assistant",
        content: message.content,
        ...(message.tool_calls ? { tool_calls: message.tool_calls } : {}),
      });

      if (!message.tool_calls || message.tool_calls.length === 0) {
        return message.content ?? "";
      }

      for (const toolCall of message.tool_calls) {
        const result = await this.executeTool(
          toolCall.function.name,
          toolCall.function.arguments,
          onEvent,
        );

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    }

    throw new Error(
      `Agent exceeded maximum iterations (${String(MAX_ITERATIONS)})`,
    );
  }

  private async executeTool(
    name: string,
    argsJson: string,
    onEvent?: EventHandler,
  ): Promise<string> {
    const tool = this.toolRegistry.get(name);

    if (tool === undefined) {
      const errorMsg = `Unknown tool: ${name}`;
      onEvent?.({ type: "error", toolName: name, result: errorMsg });
      return errorMsg;
    }

    let args: unknown;
    try {
      args = JSON.parse(argsJson) as unknown;
    } catch {
      const errorMsg = `Failed to parse arguments for ${name}: ${argsJson}`;
      onEvent?.({ type: "error", toolName: name, result: errorMsg });
      return errorMsg;
    }

    const parsed = tool.parameters.safeParse(args);
    if (!parsed.success) {
      const errorMsg = `Invalid arguments for ${name}: ${parsed.error.message}`;
      onEvent?.({ type: "error", toolName: name, result: errorMsg });
      return errorMsg;
    }

    onEvent?.({
      type: "tool_call",
      toolName: name,
      args: parsed.data as Record<string, unknown>,
    });

    try {
      const result = await tool.execute(parsed.data);
      onEvent?.({ type: "tool_result", toolName: name, result });
      return result;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Tool execution failed";
      onEvent?.({ type: "error", toolName: name, result: errorMsg });
      return `Error: ${errorMsg}`;
    }
  }
}

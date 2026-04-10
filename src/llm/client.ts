import type { ChatMessage } from "#types/llm.js";
import {
  ChatCompletionResponseSchema,
  ModelsResponseSchema,
} from "#types/llm.js";
import type { ChatCompletionRequest, ModelsResponse } from "#types/llm.js";

interface LlmClientConfig {
  baseUrl: string;
  model: string;
}

const DEFAULT_CONFIG: LlmClientConfig = {
  baseUrl: "http://localhost:1234",
  model: "google/gemma-4-26b-a4b",
};

export class LlmClient {
  private readonly config: LlmClientConfig;

  constructor(config?: Partial<LlmClientConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async listModels(): Promise<ModelsResponse> {
    const response = await fetch(`${this.config.baseUrl}/v1/models`);

    if (!response.ok) {
      throw new Error(
        `Failed to list models: ${String(response.status)} ${response.statusText}`,
      );
    }

    return ModelsResponseSchema.parse(await response.json());
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.listModels();
      return true;
    } catch {
      return false;
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const body: ChatCompletionRequest = {
      model: this.config.model,
      messages,
      temperature: 0.7,
      stream: false,
    };

    const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Chat completion failed: ${String(response.status)} ${response.statusText} - ${errorText}`,
      );
    }

    const data = ChatCompletionResponseSchema.parse(await response.json());
    const content = data.choices[0]?.message.content;

    if (content === undefined) {
      throw new Error("No content in response from LLM");
    }

    return content;
  }
}

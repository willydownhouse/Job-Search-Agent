import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  ModelsResponse,
} from "#types/llm.js";
import {
  ChatCompletionResponseSchema,
  ModelsResponseSchema,
} from "#types/llm.js";

interface LlmClientConfig {
  baseUrl: string;
  model: string;
}

const DEFAULT_CONFIG: LlmClientConfig = {
  baseUrl: "http://localhost:1234",
  model: "google/gemma-4-26b-a4b",
};

interface ChatOptions {
  tools?: ChatCompletionRequest["tools"];
}

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

  async chatCompletion(
    messages: ChatMessage[],
    options?: ChatOptions,
  ): Promise<ChatCompletionResponse> {
    const body: ChatCompletionRequest = {
      model: this.config.model,
      messages,
      temperature: 0.7,
      stream: false,
      ...(options?.tools ? { tools: options.tools } : {}),
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

    return ChatCompletionResponseSchema.parse(await response.json());
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const data = await this.chatCompletion(messages);
    const content = data.choices[0]?.message.content;

    if (content === undefined || content === null) {
      throw new Error("No content in response from LLM");
    }

    return content;
  }
}

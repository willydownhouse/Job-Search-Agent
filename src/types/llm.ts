import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatCompletionRequestSchema = z.object({
  model: z.string(),
  messages: z.array(ChatMessageSchema),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  stream: z.boolean().optional(),
});

export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>;

const ChatCompletionChoiceSchema = z.object({
  index: z.number(),
  message: ChatMessageSchema,
  finish_reason: z.enum(["stop", "length", "tool_calls"]).nullable(),
});

export const ChatCompletionResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(ChatCompletionChoiceSchema),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

const ModelSchema = z.object({
  id: z.string(),
  object: z.string(),
  owned_by: z.string(),
});

export const ModelsResponseSchema = z.object({
  data: z.array(ModelSchema),
  object: z.string(),
});

export type ModelsResponse = z.infer<typeof ModelsResponseSchema>;

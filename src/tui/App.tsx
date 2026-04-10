import { useState, useCallback } from "react";
import { Box, Text, useApp, useInput } from "ink";
import TextInput from "ink-text-input";
import type { LlmClient } from "#llm/client.js";
import type { ChatMessage } from "#types/llm.js";
import { Header } from "./components/Header.js";
import { MessageArea } from "./components/MessageArea.js";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AppProps {
  llmClient: LlmClient;
}

export function App({ llmClient }: AppProps) {
  const app = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendToLlm = useCallback(
    async (updatedMessages: Message[]) => {
      setIsLoading(true);

      try {
        const chatMessages: ChatMessage[] = updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const reply = await llmClient.chat(chatMessages);

        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${errorMessage}` },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [llmClient],
  );

  useInput((_input, key) => {
    if (key.escape) {
      app.exit();
    }
  });

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || isLoading) {
      return;
    }

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    void sendToLlm(updatedMessages);
  };

  return (
    <Box flexDirection="column" height="100%">
      <Header isLoading={isLoading} />

      <MessageArea messages={messages} isLoading={isLoading} />

      <Box
        borderStyle="single"
        borderColor={isLoading ? "gray" : "cyan"}
        paddingX={1}
      >
        <Text color={isLoading ? "gray" : "cyan"} bold>
          {"❯ "}
        </Text>
        <TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
      </Box>
    </Box>
  );
}

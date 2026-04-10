import { useState, useCallback } from "react";
import { Box, Text, useApp, useInput } from "ink";
import TextInput from "ink-text-input";
import type { Agent, AgentEvent } from "#agent/index.js";
import { Header } from "./components/Header.js";
import { MessageArea } from "./components/MessageArea.js";

export interface Message {
  type: "user" | "assistant" | "tool_call" | "tool_result" | "error";
  content: string;
}

interface AppProps {
  agent: Agent;
}

export function App({ agent }: AppProps) {
  const app = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAgentEvent = useCallback((event: AgentEvent) => {
    switch (event.type) {
      case "tool_call": {
        setMessages((prev) => [
          ...prev,
          {
            type: "tool_call",
            content: `Calling ${event.toolName}(${JSON.stringify(event.args)})`,
          },
        ]);
        break;
      }
      case "tool_result": {
        const preview =
          event.result !== undefined && event.result.length > 200
            ? `${event.result.slice(0, 200)}...`
            : (event.result ?? "");
        setMessages((prev) => [
          ...prev,
          {
            type: "tool_result",
            content: `${event.toolName} → ${preview}`,
          },
        ]);
        break;
      }
      case "error": {
        setMessages((prev) => [
          ...prev,
          {
            type: "error",
            content: `${event.toolName}: ${event.result ?? "Unknown error"}`,
          },
        ]);
        break;
      }
    }
  }, []);

  const sendToAgent = useCallback(
    async (userMessage: string) => {
      setIsLoading(true);

      try {
        const reply = await agent.run(userMessage, {
          onEvent: handleAgentEvent,
        });

        setMessages((prev) => [...prev, { type: "assistant", content: reply }]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setMessages((prev) => [
          ...prev,
          { type: "error", content: errorMessage },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [agent],
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

    setMessages((prev) => [...prev, { type: "user", content: trimmed }]);
    setInput("");

    void sendToAgent(trimmed);
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

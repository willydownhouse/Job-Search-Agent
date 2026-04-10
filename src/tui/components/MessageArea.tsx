import { Box, Text } from "ink";
import type { Message } from "../App.js";

interface MessageAreaProps {
  messages: Message[];
  isLoading?: boolean;
}

const MESSAGE_STYLES: Record<
  Message["type"],
  { label: string; color: string }
> = {
  user: { label: "You", color: "green" },
  assistant: { label: "Agent", color: "magenta" },
  tool_call: { label: "🔧 Tool", color: "yellow" },
  tool_result: { label: "📋 Result", color: "cyan" },
  error: { label: "⚠ Error", color: "red" },
};

export function MessageArea({ messages, isLoading = false }: MessageAreaProps) {
  if (messages.length === 0) {
    return (
      <Box flexGrow={1} justifyContent="center" alignItems="center">
        <Text dimColor>Type a message to start chatting with the agent.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
      {messages.map((msg, i) => {
        const style = MESSAGE_STYLES[msg.type];
        return (
          <Box key={i} marginBottom={1} flexDirection="column">
            <Text bold color={style.color}>
              {style.label}
            </Text>
            <Text
              dimColor={msg.type === "tool_call" || msg.type === "tool_result"}
            >
              {msg.content}
            </Text>
          </Box>
        );
      })}
      {isLoading && (
        <Box marginBottom={1}>
          <Text color="yellow">⏳ Agent is thinking...</Text>
        </Box>
      )}
    </Box>
  );
}

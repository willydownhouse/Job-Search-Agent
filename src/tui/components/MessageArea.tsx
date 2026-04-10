import { Box, Text } from "ink";
import type { Message } from "../App.js";

interface MessageAreaProps {
  messages: Message[];
  isLoading?: boolean;
}

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
      {messages.map((msg, i) => (
        <Box key={i} marginBottom={1} flexDirection="column">
          <Text bold color={msg.role === "user" ? "green" : "magenta"}>
            {msg.role === "user" ? "You" : "Agent"}
          </Text>
          <Text>{msg.content}</Text>
        </Box>
      ))}
      {isLoading && (
        <Box marginBottom={1}>
          <Text color="yellow">⏳ Agent is thinking...</Text>
        </Box>
      )}
    </Box>
  );
}

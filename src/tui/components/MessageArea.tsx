import { Box, Text } from "ink";
import type { Message } from "../App.js";

interface MessageAreaProps {
  messages: Message[];
}

export function MessageArea({ messages }: MessageAreaProps) {
  if (messages.length === 0) {
    return (
      <Box flexGrow={1} justifyContent="center" alignItems="center">
        <Text dimColor>
          Type a message to get started. The agent will be connected in a future
          step.
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
      {messages.map((msg, i) => (
        <Box key={i} marginBottom={1}>
          <Text bold color={msg.role === "user" ? "green" : "magenta"}>
            {msg.role === "user" ? "You: " : "Agent: "}
          </Text>
          <Text>{msg.content}</Text>
        </Box>
      ))}
    </Box>
  );
}

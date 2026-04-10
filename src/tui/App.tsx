import { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import TextInput from "ink-text-input";
import { Header } from "./components/Header.js";
import { MessageArea } from "./components/MessageArea.js";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export function App() {
  const app = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useInput((_input, key) => {
    if (key.escape) {
      app.exit();
    }
  });

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
  };

  return (
    <Box flexDirection="column" height="100%">
      <Header />

      <MessageArea messages={messages} />

      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Text color="cyan" bold>
          {"❯ "}
        </Text>
        <TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
      </Box>
    </Box>
  );
}

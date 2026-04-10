import { Box, Text } from "ink";

interface HeaderProps {
  isLoading?: boolean;
}

export function Header({ isLoading = false }: HeaderProps) {
  return (
    <Box
      borderStyle="double"
      borderColor="blue"
      paddingX={1}
      justifyContent="space-between"
    >
      <Text bold color="blue">
        Job Search Agent
      </Text>
      <Box gap={2}>
        {isLoading && <Text color="yellow">⏳ Thinking...</Text>}
        <Text dimColor>ESC to quit</Text>
      </Box>
    </Box>
  );
}

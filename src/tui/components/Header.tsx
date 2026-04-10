import { Box, Text } from "ink";

export function Header() {
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
      <Text dimColor>ESC to quit</Text>
    </Box>
  );
}

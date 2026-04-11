import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import type { Tool } from "#types/tool.js";

const execFileAsync = promisify(execFile);

const MAX_OUTPUT_LENGTH = 20_000;

const parametersSchema = z.object({
  url: z.url().describe("The URL to browse"),
});

async function runAgentBrowser(...args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("agent-browser", args, {
    timeout: 30_000,
  });
  return stdout;
}

export function createBrowseTool(): Tool<typeof parametersSchema> {
  return {
    name: "browse",
    description:
      "Open a URL in a browser and return the page content as an accessibility tree. Use this to read the full content of a web page, such as a job listing.",
    parameters: parametersSchema,
    execute: async (params) => {
      await runAgentBrowser("open", params.url);
      const snapshot = await runAgentBrowser("snapshot", "-c");

      if (snapshot.length > MAX_OUTPUT_LENGTH) {
        return `${snapshot.slice(0, MAX_OUTPUT_LENGTH)}\n\n[Content truncated at ${String(MAX_OUTPUT_LENGTH)} characters]`;
      }

      return snapshot;
    },
  };
}

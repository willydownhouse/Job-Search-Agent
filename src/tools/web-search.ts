import { z } from "zod";
import type { Tool } from "#types/tool.js";

const BRAVE_API_URL = "https://api.search.brave.com/res/v1/web/search";

const parametersSchema = z.object({
  query: z.string().describe("The search query"),
  count: z
    .number()
    .min(1)
    .max(20)
    .default(10)
    .describe("Number of results to return (1-20)"),
});

const BraveSearchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string().optional(),
  age: z.string().optional(),
});

const BraveSearchResponseSchema = z.object({
  web: z
    .object({
      results: z.array(BraveSearchResultSchema),
    })
    .optional(),
});

export function createWebSearchTool(): Tool<typeof parametersSchema> {
  const apiKey = process.env.BRAVE_API_KEY;

  if (apiKey === undefined || apiKey.length === 0) {
    throw new Error("BRAVE_API_KEY environment variable is not set");
  }

  return {
    name: "web_search",
    description:
      "Search the web using Brave Search. Returns a list of results with titles, URLs, and descriptions. Use this to find job listings, company pages, or any web content.",
    parameters: parametersSchema,
    execute: async (params) => {
      const url = new URL(BRAVE_API_URL);
      url.searchParams.set("q", params.query);
      url.searchParams.set("count", String(params.count));

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Brave Search failed: ${String(response.status)} ${response.statusText}`,
        );
      }

      const data = BraveSearchResponseSchema.parse(await response.json());

      const results = data.web?.results ?? [];

      if (results.length === 0) {
        return "No results found.";
      }

      return results
        .map((r, i) => {
          const parts = [`${String(i + 1)}. ${r.title}`, `   ${r.url}`];
          if (r.description) {
            parts.push(`   ${r.description}`);
          }
          return parts.join("\n");
        })
        .join("\n\n");
    },
  };
}

# Job Search Agent

A terminal-based AI agent that searches the web for job listings and evaluates them using a local LLM. Chat with the agent in your terminal — it uses web search and browser tools to find real listings and report only what it can verify from the pages it reads.

**Stack:** Node.js, TypeScript, Ink (TUI), LM Studio, Brave Search

## How it works

1. You describe what you're looking for in the TUI (role, location, preferences, etc.).
2. The agent searches the web via Brave Search.
3. It opens promising pages with a browser tool and reads the content.
4. It responds with findings grounded in what it actually retrieved — no fabricated listings or details.

The LLM runs locally through [LM Studio](https://lmstudio.ai/), so your conversations stay on your machine.

## Prerequisites

- **Node.js** 20+
- **[LM Studio](https://lmstudio.ai/)** running locally with a model loaded (default expected: `google/gemma-4-26b-a4b`)
- **[Brave Search API key](https://brave.com/search/api/)** for web search
- **[agent-browser](https://agent-browser.dev/)** CLI on your `PATH` (used by the browse tool to fetch page content)

  ```bash
  npm install -g agent-browser
  agent-browser install   # downloads Chrome (first time only)
  ```

## Setup

```bash
git clone <repo-url>
cd job-search
npm install
```

Copy the example env file and add your Brave API key:

```bash
cp .env.example .env
```

Edit `.env`:

```
BRAVE_API_KEY=your-brave-api-key-here
```

Start LM Studio and load a model. The local server should be available at `http://localhost:1234`.

## Usage

```bash
npm run dev
```

The app checks the LM Studio connection on startup, then launches the TUI. Type a message and press Enter to send. Press **Esc** to quit.

Example prompts:

- "Find senior TypeScript developer roles in Helsinki posted in the last week."
- "Search for remote backend engineer jobs at startups and summarize the top matches."
- "Look for product manager roles in Stockholm and tell me which ones mention hybrid work."

While the agent works, you'll see tool calls (`web_search`, `browse`) and truncated results in the message area.

## Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Run the app with hot reload via tsx |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | Run ESLint |
| `npm run format` | Format source with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run knip` | Find unused exports and dependencies |
| `npm run check` | Run build, lint, format check, and knip in parallel |

## Project structure

```
src/
├── index.ts          # Entry point — wires LLM, tools, agent, and TUI
├── agent/            # Agent loop and tool registry
├── llm/              # LM Studio REST client
├── tools/
│   ├── web-search.ts # Brave Search integration
│   └── browse.ts     # Page fetching via agent-browser
├── tui/              # Ink terminal UI
└── types/            # Shared TypeScript types
```

## Configuration

| Setting | Default | Where |
|---------|---------|-------|
| LM Studio URL | `http://localhost:1234` | `src/llm/client.ts` |
| Model | `google/gemma-4-26b-a4b` | `src/llm/client.ts` |
| Brave API key | — | `.env` (`BRAVE_API_KEY`) |

To use a different model or server URL, pass a config object when constructing `LlmClient` in `src/index.ts`.

## Roadmap

See [PLAN.md](./PLAN.md) for the full build plan. Upcoming work includes:

- **User profile** — `profile.yaml` for skills, preferences, and deal-breakers
- **Structured results** — job cards with match reasoning in the TUI
- **Persistence** — save found jobs, track seen listings, mark favorites
- **Polish** — streaming responses, retries, keyboard shortcuts, filtering

## License

Private / personal project.

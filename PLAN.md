# Job Search AI Agent - Build Plan

## Overview

A CLI-based AI agent that searches for open job positions using a local LLM (Gemma 4 via LM Studio). The agent uses tools (web search, browser) to find and evaluate jobs against a user-defined profile.

**Stack:** Node.js, TypeScript, ESLint, Prettier, Knip, Ink (TUI)

---

## Phase 1: Project Foundation

### Step 1 - Project Scaffolding
Node.js project with TypeScript, ESLint, Prettier, Knip. Folder structure, `package.json`, `tsconfig.json`, config files.

### Step 2 - Basic TUI Shell
Terminal UI skeleton using Ink (React for CLI). Status bar, message area, input field. Just the shell - no logic yet.

---

## Phase 2: LLM Integration

### Step 3 - LM Studio REST Client
Module that talks to LM Studio's OpenAI-compatible API. Send messages, receive responses. Connection health check.

### Step 4 - Chat Loop in TUI
Wire LLM client into the TUI. Type a message, see the LLM response. Basic conversation display with streaming.

---

## Phase 3: Agentic Tool System

### Step 5 - Tool Interface & Registry
Define the tool contract: name, description, parameter JSON schema, execute function. Build a registry that collects tools and formats them for function calling.

### Step 6 - Agent Loop
Core loop: send messages + tool definitions to LLM → detect tool calls → execute tools → feed results back → repeat until final answer.

---

## Phase 4: Tools

### Step 7 - Web Search Tool
Integrate a search API (SearXNG, Brave Search, or Serper) so the LLM can search the web.

### Step 8 - Browser Tool
Fetch and parse web pages. Playwright/Puppeteer for JS-heavy sites like LinkedIn. Extract readable content.

---

## Phase 5: Job Search Logic

### Step 9 - User Profile Spec
YAML file (`profile.yaml`) describing skills, experience, preferences, location, salary, deal-breakers. The agent reads this to understand what to look for.

### Step 10 - Job Search Orchestration
System prompt and orchestration logic that instructs the LLM to find jobs matching the profile using its tools. Parse and structure results.

### Step 11 - Results Display in TUI
Job cards with title, company, match reasoning, link. Scrollable list with detail view.

---

## Phase 6: Polish

### Step 12 - Persistence
Store found jobs locally (SQLite or JSON). Track seen jobs, avoid duplicates, mark favorites.

### Step 13 - Error Handling
Retries, rate limiting, graceful degradation, timeout handling.

### Step 14 - UX Refinements
Streaming LLM responses, progress indicators, keyboard shortcuts, filtering/sorting results.

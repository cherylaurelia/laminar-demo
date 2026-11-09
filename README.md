# Laminar traces stop after the first turn on Claude Agent SDK 0.3.304+

Unofficial demo by Cheryl Aurelia: not affiliated with Laminar.

**Problem.** Since Claude Agent SDK 0.3.304 (npm, 2026-10-19), a run traced with Laminar's documented setup stores a small side call plus the first real model turn. Later turns and all TOOL spans are missing, with no output unless `LMNR_LOG_LEVEL=debug` is set. The [docs](https://laminar.sh/docs/integrations/claude-agent-sdk) promise every model turn and tool call.

**Cause.** Requests from that version on carry `system` messages with `tool_addition` blocks. `@lmnr-ai/claude-code-proxy` (0.1.24 and 0.2.0) fails to parse them and exports nothing for that request.

**Fix.** It belongs in the proxy, whose source I couldn't find, so this is a diagnosis and repro, not a patch.

## Run the repro

```sh
cd repro && npm install && npm start
```

No API key and no Anthropic call. Expected: 1 trace export request without the block, a parse error and 0 with it.

## Results

`data/results.jsonl` has all 18 bench runs (3 public repos x 3 setups x 2 runs, Haiku). `data/summary.json` is what the page shows.

| Setup | SDK turns | LLM spans | TOOL spans | Stored / SDK cost | Median run cost |
|---|---|---|---|---|---|
| Default (SDK 0.3.319) | 5–11 | 2 | 0 | 15% | $0.0047 |
| SDK pinned to 0.3.303 | 5–10 | 5–10 | 4–8 | 81% | $0.0409 |
| `ENABLE_TOOL_SEARCH=false` | 5–10 | 6–11 | 4–9 | 82% | $0.0537 |

Both workarounds restore the spans but cost about 9x and 11x more per run on these tasks, so neither is a real fix.

## Limits

Self-hosted at 99d1eae with a Claude login on one Mac. Host gRPC was mapped to 18001 because another app holds 8001. The SDK pin is for TypeScript; no Python workaround was measured. Not run on Laminar Cloud or with an API key. Small tasks, one run per SDK version in the window. Cost gap in complete traces not looked into. No user report found.

## Run the page

```sh
npm install && npm run build && npm run start
```

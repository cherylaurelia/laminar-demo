// Sends the proxy the same request with and without a tool_addition block.
// No API key, no Anthropic call: the upstream and the Laminar endpoint are local mocks.
import http from "node:http";
import { createRequire } from "node:module";

process.env.LMNR_LOG_LEVEL = "debug"; // The proxy only prints its parse error at debug level.

const { ProxyServer } = createRequire(import.meta.url)("@lmnr-ai/claude-code-proxy");

const reply = {
  id: "msg_mock",
  type: "message",
  role: "assistant",
  model: "mock",
  content: [{ type: "text", text: "ok" }],
  stop_reason: "end_turn",
  usage: { input_tokens: 1, output_tokens: 1 },
};

let exports = 0;

const mock = http.createServer((req, res) => {
  req.resume();
  req.on("end", () => {
    if (req.url.startsWith("/v1/traces")) exports += 1;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(reply));
  });
});

await new Promise((resolve) => mock.listen(18200, "127.0.0.1", resolve));

const proxy = new ProxyServer(45999);

proxy.runServer("http://127.0.0.1:18200");

await new Promise((resolve) => setTimeout(resolve, 500));

await proxy.setCurrentTrace({
  traceId: "11111111111111111111111111111111",
  spanId: "2222222222222222",
  projectApiKey: "dummy",
  spanIdsPath: [],
  spanPath: ["repro"],
  laminarUrl: "http://127.0.0.1:18200",
});

const user = { role: "user", content: [{ type: "text", text: "hi" }] };

const toolAddition = {
  role: "system",
  content: [{ type: "tool_addition", tool: { name: "Bash", description: "Run a command", input_schema: { type: "object" } } }],
};

for (const [label, messages] of [
  ["without tool_addition", [user]],
  ["with tool_addition", [user, toolAddition]],
]) {
  const before = exports;
  console.log(`--- ${label}`);
  await fetch("http://127.0.0.1:45999/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": "dummy" },
    body: JSON.stringify({ model: "mock", max_tokens: 5, messages }),
  }).then((response) => response.text());
  await new Promise((resolve) => setTimeout(resolve, 6000));
  console.log(`trace export requests: ${exports - before}`);
}

proxy.stopServer();

mock.close();

process.exit(0);

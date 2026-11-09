import Image from "next/image";
import summary from "../data/summary.json";

const REPO_URL = "https://github.com/cherylaurelia/laminar-demo";
const REPRO_URL = `${REPO_URL}/tree/main/repro`;
const RESULTS_URL = `${REPO_URL}/blob/main/data/results.jsonl`;
const DOCS_URL = "https://laminar.sh/docs/integrations/claude-agent-sdk";
const LITELLM_URL = "https://github.com/BerriAI/litellm/issues/47531";

const REPRO_COMMAND = `git clone ${REPO_URL}
cd laminar-demo/repro && npm install && npm start`;

const REPRO_OUTPUT = `--- without tool_addition
trace export requests: 1
--- with tool_addition
Failed to parse request body: Error("data did not match any variant of untagged enum MessageContent", ...)
trace export requests: 0`;

const versions = [
  { sdk: "0.3.302", date: "before Oct 18", spans: "5", failures: "0" },
  { sdk: "0.3.303", date: "Oct 18", spans: "4", failures: "0" },
  { sdk: "0.3.304", date: "Oct 19", spans: "2", failures: "1" },
  { sdk: "0.3.305", date: "after Oct 19", spans: "2", failures: "3" },
  { sdk: "0.3.319", date: "Nov 6, latest", spans: "2", failures: "1" },
];

function Code({ text }: { text: string }) {
  return (
    <pre tabIndex={0} className="overflow-x-auto rounded-xl border border-line bg-surface p-4 font-mono text-[12.5px] leading-relaxed whitespace-pre">
      {text}
    </pre>
  );
}

function Shot({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="min-w-0 overflow-hidden rounded-xl border border-line">
      <Image src={src} alt={alt} width={733} height={500} sizes="(min-width: 768px) 460px, 100vw" className="h-auto w-full" />
      <figcaption className="border-t border-line bg-surface px-4 py-2 text-[13px] text-muted">{caption}</figcaption>
    </figure>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl border-x border-line">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-5 sm:px-10">
        <p className="font-semibold">Laminar + Claude Agent SDK</p>
        <p className="text-[13px] text-muted">Unofficial demo · tested {summary.testedOn}</p>
      </header>

      <section className="border-b border-line px-5 py-14 sm:px-10 sm:py-20">
        <h1 className="max-w-3xl text-4xl leading-[1.12] font-medium tracking-tight sm:text-5xl">
          <span className="text-muted">In my runs since Claude Agent SDK 0.3.304, </span>
          <span>Laminar traces stop after the first real model turn.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-xl leading-relaxed text-muted">
          The Claude Code proxy can&apos;t parse the new <code className="font-mono text-[0.9em]">tool_addition</code> block, so it exports nothing for later turns or tool calls, and only debug logging shows why. The fix belongs in the proxy: accept that block, and don&apos;t lose the span when a request has a block it doesn&apos;t know.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          This is a diagnosis and repro, not a patch: I couldn&apos;t find the proxy&apos;s source. Tested on self-hosted Laminar with a Claude login. <strong className="font-medium text-fg">Not run on Laminar Cloud or with an API key.</strong> The failure happens in the local proxy before export, so I expect the same there, but I haven&apos;t seen it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="rounded-md bg-accent px-5 py-2.5 font-medium text-bg hover:bg-fg" href={REPRO_URL}>See the repro</a>
          <a className="rounded-md border border-line px-5 py-2.5 font-medium hover:border-fg" href={REPO_URL}>Repo and raw results</a>
        </div>
      </section>

      <section aria-labelledby="repro" className="border-b border-line px-5 py-12 sm:px-10">
        <h2 id="repro" className="text-2xl font-medium">Check it in a minute</h2>
        <p className="mt-2 max-w-3xl text-muted">
          No API key and no Anthropic call. It sends the proxy one request with the block and one without, against local mocks. Same result on proxy 0.1.24, which lmnr 0.8.61 installs, and 0.2.0, the latest.
        </p>
        <div className="mt-6 grid gap-3">
          <Code text={REPRO_COMMAND} />
          <Code text={REPRO_OUTPUT} />
        </div>
      </section>

      <section aria-labelledby="result" className="border-b border-line px-5 py-12 sm:px-10">
        <h2 id="result" className="text-2xl font-medium">Same tasks, three setups</h2>
        <p className="mt-2 max-w-3xl text-muted">
          Haiku on three public repos (chalk, jshttp/cookie, pallets/markupsafe), two runs each, a fresh clone each time. Your <a className="text-accent underline" href={DOCS_URL}>docs</a> promise every model turn and tool call, with cost.
        </p>
        <div tabIndex={0} className="mt-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="bg-surface text-[13px] text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Setup</th>
                <th scope="col" className="px-4 py-3 font-medium">SDK turns</th>
                <th scope="col" className="px-4 py-3 font-medium">LLM spans stored</th>
                <th scope="col" className="px-4 py-3 font-medium">TOOL spans stored</th>
                <th scope="col" className="px-4 py-3 font-medium">Stored cost / SDK cost</th>
                <th scope="col" className="px-4 py-3 font-medium">Median SDK-reported run cost</th>
              </tr>
            </thead>
            <tbody>
              {summary.arms.map((arm) => (
                <tr key={arm.label} className="border-t border-line">
                  <th scope="row" className="px-4 py-3 font-normal">{arm.label}</th>
                  <td className="px-4 py-3 font-mono text-sm">{arm.turns}</td>
                  <td className="px-4 py-3 font-mono text-sm">{arm.spans}</td>
                  <td className="px-4 py-3 font-mono text-sm">{arm.toolSpans}</td>
                  <td className="px-4 py-3 font-mono text-sm">{arm.storedShare}</td>
                  <td className="px-4 py-3 font-mono text-sm">{arm.medianCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">
          The two stored spans are a small side call (no tools, about 20 output tokens) and the first real turn. The cost share depends on run length, so span count is the better signal. Even complete traces stored less than the SDK reported, and I didn&apos;t look into that gap. <a className="text-accent underline" href={RESULTS_URL}>All {summary.runs} runs</a>.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Shot src="/trace-default.png" alt="Laminar trace view of a 41 second run. The timeline has bars only in the first three seconds and the transcript ends after the first turn." caption="Default: 41 s run, 11 SDK turns. Transcript ends at the first turn, with no warning." />
          <Shot src="/trace-tool-search-off.png" alt="Laminar trace view of another run of the same task with tool search off. Turns and Bash calls are listed." caption="ENABLE_TOOL_SEARCH=false: another run of the same task, 9 turns, with its turns and Bash calls listed (cropped to the first few)." />
        </div>
      </section>

      <section aria-labelledby="window" className="border-b border-line px-5 py-12 sm:px-10">
        <h2 id="window" className="text-2xl font-medium">When it started</h2>
        <p className="mt-2 max-w-3xl text-muted">
          One short run per SDK version, with lmnr 0.8.61. Your docs install <code className="font-mono text-sm">@latest</code>, so new setups get it. Spans include the side call. Failures are parse errors printed at debug level.
        </p>
        <div tabIndex={0} className="mt-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-left">
            <thead className="bg-surface text-[13px] text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">SDK</th>
                <th scope="col" className="px-4 py-3 font-medium">npm date</th>
                <th scope="col" className="px-4 py-3 font-medium">LLM spans</th>
                <th scope="col" className="px-4 py-3 font-medium">Parse failures</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((row) => (
                <tr key={row.sdk} className="border-t border-line">
                  <th scope="row" className="px-4 py-3 font-mono text-sm font-normal">{row.sdk}</th>
                  <td className="px-4 py-3 text-sm text-muted">{row.date}</td>
                  <td className="px-4 py-3 font-mono text-sm">{row.spans}</td>
                  <td className="px-4 py-3 font-mono text-sm">{row.failures}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">
          This changed underneath you: the same block <a className="text-accent underline" href={LITELLM_URL}>caused problems in LiteLLM</a> around the same time. Python hits it too: one run on lmnr 0.8.9, claude-agent-sdk 0.2.179 and proxy 0.2.0 stored 2 LLM spans for 4 turns. So did one Sonnet run on TypeScript.
        </p>
      </section>

      <section aria-labelledby="workarounds" className="border-b border-line px-5 py-12 sm:px-10">
        <h2 id="workarounds" className="text-2xl font-medium">Until the proxy changes</h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted">
          {summary.workaroundNote}
        </p>
      </section>

      <section aria-labelledby="limits" className="border-b border-line px-5 py-12 sm:px-10">
        <h2 id="limits" className="text-2xl font-medium">Limits</h2>
        <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-muted">
          <li>One Mac, small tasks, {summary.runs} bench runs, one run per version in the window. No user has reported this that I could find.</li>
          <li>Claude login only, so I confirmed <code className="font-mono text-sm">tool_addition</code> is sent under that auth, not under an API key.</li>
          <li>The cause comes from the proxy&apos;s error text and replaying a captured request against it, not from reading its source.</li>
          <li>Throwaway local account on self-hosted 99d1eae.</li>
        </ul>
      </section>

      <footer className="px-5 py-8 text-sm text-muted sm:px-10">
        Unofficial demo by Cheryl Aurelia: not affiliated with Laminar.
      </footer>
    </main>
  );
}

#!/usr/bin/env node
// Project the canonical sdd/ source into per-agent adapter files.
// Usage: node scripts/build-agent-adapters.mjs [--agents claude,opencode] [--target DIR] [--sdd DIR]

import { readFileSync } from "node:fs";
import path from "node:path";
import {
  ALL_AGENTS,
  readCanonical,
  buildPlan,
  writeActions,
} from "./lib/agent-adapters.mjs";

function parseArgs(argv) {
  const options = { agents: null, target: process.cwd(), sdd: "sdd" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const take = () => argv[(i += 1)];
    if (arg === "--agents") options.agents = take();
    else if (arg.startsWith("--agents=")) options.agents = arg.slice("--agents=".length);
    else if (arg === "--target") options.target = take();
    else if (arg.startsWith("--target=")) options.target = arg.slice("--target=".length);
    else if (arg === "--sdd") options.sdd = take();
    else if (arg.startsWith("--sdd=")) options.sdd = arg.slice("--sdd=".length);
  }
  return options;
}

const opts = parseArgs(process.argv.slice(2));
const manifest = JSON.parse(
  readFileSync(path.join(opts.sdd, "agents.manifest.json"), "utf8")
);

const requested = opts.agents
  ? opts.agents.split(",").map((a) => a.trim()).filter(Boolean)
  : ALL_AGENTS;

const unknown = requested.filter((a) => !manifest.agents[a]);
if (unknown.length > 0) {
  console.error(`Unknown agent(s): ${unknown.join(", ")}. Known: ${ALL_AGENTS.join(", ")}`);
  process.exit(1);
}

const canonical = readCanonical(opts.sdd);
const actions = buildPlan({ canonical, manifest, agents: requested });
writeActions(actions, opts.target);

console.log(
  `Projected [${requested.join(", ")}] -> ${actions.length} files into ${opts.target}`
);

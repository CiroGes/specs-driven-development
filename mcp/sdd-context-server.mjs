#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import * as z from "zod/v4";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

function getCliOption(name) {
  const flag = `--${name}`;
  const prefixedFlag = `${flag}=`;

  for (let index = 0; index < process.argv.length; index += 1) {
    const arg = process.argv[index];
    if (arg === flag) {
      return process.argv[index + 1] ?? null;
    }
    if (arg.startsWith(prefixedFlag)) {
      return arg.slice(prefixedFlag.length);
    }
  }

  return null;
}

const REPO_ROOT = process.cwd();
const PRODUCT_PRD_PATH = "docs/product-prd.md";
const FEATURES_DIR =
  getCliOption("features-dir") ||
  process.env.SDD_FEATURES_DIR ||
  "specs/features";
const SKILL_DIRS = [".agents/skills"];

function resolvePath(relativePath) {
  return path.resolve(REPO_ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolvePath(relativePath));
}

function readText(relativePath) {
  const absolutePath = resolvePath(relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing file: ${relativePath}`);
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function listFeatureNames() {
  const absoluteDir = resolvePath(FEATURES_DIR);
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }
  return fs
    .readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function walkForSkillFiles(startDir) {
  const root = resolvePath(startDir);
  if (!fs.existsSync(root)) {
    return [];
  }

  const results = [];
  const queue = [root];
  while (queue.length > 0) {
    const current = queue.shift();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    let hasSkillFile = false;

    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isFile() && entry.name === "SKILL.md") {
        hasSkillFile = true;
      }
      if (entry.isDirectory()) {
        queue.push(absolute);
      }
    }

    if (hasSkillFile) {
      results.push(path.relative(REPO_ROOT, path.join(current, "SKILL.md")));
    }
  }

  return results.sort();
}

function parseFrontmatter(skillContent) {
  const match = skillContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return { name: "", description: "" };
  }

  const lines = match[1].split("\n");
  const metadata = { name: "", description: "" };

  for (const line of lines) {
    if (line.startsWith("name:")) {
      metadata.name = line.slice("name:".length).trim();
    }
    if (line.startsWith("description:")) {
      metadata.description = line.slice("description:".length).trim();
    }
  }

  return metadata;
}

function listSkillMetadata(includeContent = false) {
  const skillPaths = SKILL_DIRS.flatMap((dir) => walkForSkillFiles(dir));
  const seen = new Set();
  const result = [];

  for (const skillPath of skillPaths) {
    if (seen.has(skillPath)) {
      continue;
    }
    seen.add(skillPath);

    const content = readText(skillPath);
    const metadata = parseFrontmatter(content);
    const item = {
      name: metadata.name || path.basename(path.dirname(skillPath)),
      description: metadata.description || "",
      path: skillPath,
    };
    if (includeContent) {
      item.content = content;
    }
    result.push(item);
  }

  return result.sort((a, b) => a.path.localeCompare(b.path));
}

function getFeatureDocPaths(feature) {
  return {
    spec: path.posix.join(FEATURES_DIR, feature, "feature.spec.md"),
    tasks: path.posix.join(FEATURES_DIR, feature, "tasks.md"),
    acceptance: path.posix.join(FEATURES_DIR, feature, "acceptance.md"),
  };
}

function getFeatureContext(feature, includeContent = true) {
  const featureNames = listFeatureNames();
  if (!featureNames.includes(feature)) {
    throw new Error(`Unknown feature: ${feature}`);
  }

  const docPaths = getFeatureDocPaths(feature);
  const context = {
    feature,
    files: {
      spec: { path: docPaths.spec },
      tasks: { path: docPaths.tasks },
      acceptance: { path: docPaths.acceptance },
    },
  };

  if (includeContent) {
    context.files.spec.content = readText(docPaths.spec);
    context.files.tasks.content = readText(docPaths.tasks);
    context.files.acceptance.content = readText(docPaths.acceptance);
  }

  return context;
}

function buildContextBundle({ feature, task, command, includeContent = true }) {
  const bundle = {
    generatedAt: new Date().toISOString(),
    repository: path.basename(REPO_ROOT),
    task: task ?? null,
    command: command ?? null,
    productPrd: {
      path: PRODUCT_PRD_PATH,
    },
    skills: listSkillMetadata(includeContent),
    feature: getFeatureContext(feature, includeContent),
    recommendedChecks: [
      "npm run test",
      "npm run typecheck",
      "npm run lint",
      "npm run validate:specs",
      "npm run map:specs",
    ],
  };

  if (includeContent) {
    bundle.productPrd.content = readText(PRODUCT_PRD_PATH);
  }

  return bundle;
}

function registerStaticResources(server) {
  if (exists(PRODUCT_PRD_PATH)) {
    server.registerResource(
      "product-prd",
      "context://prd/product",
      {
        mimeType: "text/markdown",
        description: "Global product PRD for this repository.",
      },
      async () => ({
        contents: [
          {
            uri: "context://prd/product",
            text: readText(PRODUCT_PRD_PATH),
          },
        ],
      })
    );
  }

  for (const feature of listFeatureNames()) {
    const paths = getFeatureDocPaths(feature);
    const resources = [
      { suffix: "feature-spec", path: paths.spec },
      { suffix: "tasks", path: paths.tasks },
      { suffix: "acceptance", path: paths.acceptance },
    ];

    for (const resource of resources) {
      const name = `${feature}-${resource.suffix}`;
      const uri = `context://features/${feature}/${resource.suffix}`;
      if (!exists(resource.path)) {
        continue;
      }
      server.registerResource(
        name,
        uri,
        {
          mimeType: "text/markdown",
          description: `${feature} ${resource.suffix} document`,
        },
        async () => ({
          contents: [
            {
              uri,
              text: readText(resource.path),
            },
          ],
        })
      );
    }
  }
}

function createServer() {
  const server = new McpServer({
    name: "sdd-context-server",
    version: "0.1.0",
  });

  registerStaticResources(server);

  server.registerTool(
    "list_context_sources",
    {
      description:
        "List available PRD, skills, and feature specs that can be used as structured context.",
    },
    async () => {
      const features = listFeatureNames();
      const skills = listSkillMetadata(false);
      const output = {
        productPrd: exists(PRODUCT_PRD_PATH) ? PRODUCT_PRD_PATH : null,
        skills: skills.map((skill) => ({
          name: skill.name,
          path: skill.path,
          description: skill.description,
        })),
        features,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(output, null, 2),
          },
        ],
        structuredContent: output,
      };
    }
  );

  server.registerTool(
    "get_feature_context",
    {
      description:
        "Read spec, tasks, and acceptance documents for a given feature under specs/features.",
      inputSchema: {
        feature: z.string().describe("Feature folder name under specs/features"),
        includeContent: z
          .boolean()
          .optional()
          .default(true)
          .describe("Whether to include full markdown content"),
      },
    },
    async ({ feature, includeContent = true }) => {
      try {
        const output = getFeatureContext(feature, includeContent);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(output, null, 2),
            },
          ],
          structuredContent: output,
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    "build_context_bundle",
    {
      description:
        "Build a single context bundle for an SDD task by combining PRD, skills, and one feature context.",
      inputSchema: {
        feature: z.string().describe("Feature folder name under specs/features"),
        task: z
          .string()
          .optional()
          .describe("Natural language task description"),
        command: z
          .string()
          .optional()
          .describe("Command or workflow step (e.g., sdd-plan, sdd-implement)"),
        includeContent: z
          .boolean()
          .optional()
          .default(true)
          .describe("Whether to include full text of files"),
      },
    },
    async ({ feature, task, command, includeContent = true }) => {
      try {
        const output = buildContextBundle({
          feature,
          task,
          command,
          includeContent,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(output, null, 2),
            },
          ],
          structuredContent: output,
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  return server;
}

function runSelfCheck() {
  const summary = {
    repository: path.basename(REPO_ROOT),
    productPrdPresent: exists(PRODUCT_PRD_PATH),
    skillCount: listSkillMetadata(false).length,
    featureCount: listFeatureNames().length,
    features: listFeatureNames(),
  };
  console.log(JSON.stringify(summary, null, 2));
}

async function main() {
  if (process.argv.includes("--self-check")) {
    runSelfCheck();
    return;
  }

  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SDD MCP context server running on stdio");
}

main().catch((error) => {
  console.error("MCP server error:", error);
  process.exit(1);
});

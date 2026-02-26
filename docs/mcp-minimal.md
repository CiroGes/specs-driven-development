# MCP Minimal Setup (Context Bundle)

This project includes a minimal MCP server to provide structured context to agents from versioned repository sources.

## What it exposes

### Resources
- `context://prd/product` -> `docs/product-prd.md`
- `context://rules/<rule-name>` -> each file in `.cursor/rules/`
- `context://features/<feature>/feature-spec` -> `specs/features/<feature>/feature.spec.md`
- `context://features/<feature>/tasks` -> `specs/features/<feature>/tasks.md`
- `context://features/<feature>/acceptance` -> `specs/features/<feature>/acceptance.md`

### Tools
- `list_context_sources`
- `get_feature_context`
- `build_context_bundle`

## Local usage

- Start MCP server over stdio:
  - `npm run mcp:start`
- Validate setup:
  - `npm run mcp:self-check`

## Cursor wiring

The server is wired in `.cursor/mcp.json`:

- Server name: `sdd-context`
- Command: `node mcp/sdd-context-server.mjs`

This allows agents to consult PRD/rules/specs as structured context instead of manual prompt injection.

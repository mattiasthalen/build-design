# Testing this repository

This repository is a Claude Code plugin marketplace: `.claude-plugin/marketplace.json` at the root, the plugin under `plugins/build-design/` (`.claude-plugin/plugin.json`, `skills/build/SKILL.md`, `workflows/execute.js`, `references/`). Decided in the build-design interview (2026-09-14), testing branch.

**Test command:** `node --test tests/ && claude plugin validate . && claude plugin validate plugins/build-design`

Node's built-in runner (`node:test`, `node:assert`), no dependencies. Tests live in `tests/*.test.mjs`, one case per acceptance criterion, named after it.

Three kinds of test, by what the behavior is made of:

- **Executor logic** (`workflows/execute.js`, a Workflow tool script: `export const meta`, top-level `await`, globals `args`, `agent`, `log`, `phase`, no Node APIs). Test it under a harness: read the file, replace `export const meta` with `const meta`, wrap the source in an `AsyncFunction('args','agent','log','phase', src)`, and call it with fake `agent()` implementations keyed on the `label` option. Assert on the returned summary and on the sequence of agent calls (models, efforts, labels). Args validation is asserted by mutating a valid args block.
- **Skill instructions** (`SKILL.md`, references): structural tests only. Frontmatter parses and has `name`, `description`, `argument-hint`; the rules and behaviors the brief names are present; every referenced file exists. Behavioral checks of the skill are plugin eval cases under `evals/`, run by hand with `claude plugin eval`, never in the test command.
- **Manifests**: `claude plugin validate` for both roots, plus a test that `plugin.json` declares the `design` dependency and `marketplace.json` lists both plugins with the pinned upstream source.

A fixture brief for `--dry-run` and the eval cases lives under `tests/fixtures/brief/`.

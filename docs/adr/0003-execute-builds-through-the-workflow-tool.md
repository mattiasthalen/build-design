# ADR-0003 — Execute builds through the Workflow tool

**Status:** Accepted (2026-09-14)

## Context

The main session's context must stay lean: the reason for delegating the build at all. Candidates were the Workflow tool, Agent-tool fan-out from the main loop, remote Claude Code sessions, and `claude -p` subprocesses. The Workflow tool runs a deterministic script whose only return to the main loop is the script's result; a skill or an approved plan that names it satisfies its opt-in rule; plugins can ship named workflows; subagents cannot see the conversation.

## Decision

**One static executor workflow, `build-design:execute`, shipped in the plugin's `workflows/` directory, parameterized by the args block.** The main loop sees only the summary it returns.

Rejected: Agent-tool fan-out, because the main loop orchestrates every step and its context grows with each unit. Rejected: remote sessions, because there is no shared working tree and approval lands in a browser. Rejected: `claude -p` subprocesses, because they have no progress tree, no resume, and re-solve permissions from scratch. Rejected: generating a workflow script per run, because that is untested code on every run; a static script tested once with the plan as data is not.

## Consequences

The tree in the conversation is unreachable from the executor, so everything agents need is materialized in the brief and the args block. Workflow API changes are a dependency risk owned by this plugin. Parallelism is available in the tool but deferred in the design. Resume of a partially run workflow by run id is same-session only, which is why ADR-0002 keeps the durable record in git.

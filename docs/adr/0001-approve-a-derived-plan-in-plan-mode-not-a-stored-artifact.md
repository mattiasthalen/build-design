# ADR-0001 — Approve a derived plan in plan mode, never store it as an artifact

**Status:** Accepted (2026-09-14)

## Context

The design brief written by the `design` plugin already states what to build, what goes wrong, and how to know it is done. What a build needs beyond it is small: grouping into units, order, a model tier and effort per role, and which units are withheld. All of it derives from the brief by rule.

A plan kept as its own artifact becomes a second source of truth that drifts from the brief and drops the brief's provenance marks. The user wants the review to happen in Claude Code's plan mode, whose rules are: read-only until approval except the plan file, approval is the "implement this plan" turn, rejection carries feedback.

## Decision

**The plan is a view of the brief, generated at run time.** The skill runs the planner as a read-only subagent, enters plan mode, renders the plan into the plan file as a human table plus a verbatim JSON args block plus the instruction to invoke the executor workflow with that block, and exits plan mode. Approval invokes the executor; rejection feedback is applied to the plan data and the plan is re-rendered. Nothing about the plan is stored anywhere else.

Rejected: a durable plan file in the repository or under `~/.claude/plans` as the source of execution across runs, because it diverges from the brief and loses provenance. Rejected: a printed table in the conversation as the approval gate, because it duplicates what plan mode already provides and the user prefers the standard flow. Rejected for this version: `/ultraplan`.

## Consequences

Overrides given at review live only in the approved plan; a re-run re-derives and asks again. The planner must run before plan mode is entered, since plan mode forbids non-read-only tools. Execution parameters travel through the plan text, so the executor validates the block against a schema before creating anything. Headless use needs `--yes`, which skips the gate entirely. Resume needs a record of what was built, which this decision does not provide; ADR-0002 does.

# ADR-0004 — Select models per unit from a rule table with an escalation ladder

**Status:** Accepted (2026-09-14)

## Context

Four tiers with an input cost ratio near 10:5:2:1. Per unit, four signals are available without reading the code: size by criteria count, cross-cutting (touches a contract, domain concept, or lifecycle), contested (the design tree recorded a fork, a reopen, or an adversarial hit), and inference present. Selection has to be inspectable in the plan, overridable at review, and checkable after the fact. The environment variable `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` overrides every per-agent choice silently.

## Decision

**A fixed table assigns tier and effort per role, and a ladder escalates on failure.** Implementer: sonnet, opus on any of cross-cutting, contested, inference. Test writer: one tier below, haiku only for small uncontested units. Verifier: the implementer's tier, fresh context, instructed to refute, naming the failing side. Effort: medium on haiku and sonnet, high on opus. Ladder: retry at the same tier with the verifier's reason, then one tier up at high effort, then failed; three attempts; capped at a ceiling that defaults to the session model and that the table never assigns. Overrides: per unit at review, `--ceiling`, `--floor`, `--uniform`. When the FORCE variable is set the plan states that selection is void. Escalations are written to the commit trailers.

Rejected: letting the planner model choose, because the choice is neither inspectable nor reproducible. Rejected: one model for everything, because it removes the cost lever the feature exists for. Rejected: a scout pass to count files touched, because it spends tokens before any value is produced.

## Consequences

An under-assigning table costs two extra attempts per unit before reaching the right tier; the trailers show where that happens, which is the data for tuning the table. The tier order is hard-coded to the current lineup and changes when the lineup does. Under the FORCE variable the plan is honest but the feature is inert.

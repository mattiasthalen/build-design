# Non-Functional Requirements — build-design

- **Sourced from:** the design tree of 2026-09-14, "build-design", 19 branches decided.
- **Gaps:** 1. Run length has no bound (G4); recorded as an accepted property, not a requirement.
- **Inference:** none; each row traces to a decided branch (lean context, output discipline, table plus ladder, sequential worktree, git-only state, pinned upstream).

Completeness test used: every requirement names what is measured and where it is enforced or observed.

| # | Requirement | Measure | Enforced or observed |
|---|---|---|---|
| N1 | Main-context footprint is bounded by the unit count | What enters the conversation per run: plan table rows, one log line per unit start and end, summary rows, one prompt. No agent transcript, file content, or diff. | Executor returns only the summary; the skill prints only R9 items. Observed by AC-50. |
| N2 | Prose discipline | Status lines and tables only; no narration | Skill and executor prompts; AC-50 |
| N3 | Deterministic selection | Same brief, signals, and flags produce the same tiers and efforts | The table is a pure function; planner judgment is excluded by design |
| N4 | Bounded spend per unit | ≤ 3 attempts; every tier ≤ ceiling; the table never assigns the ceiling | Executor loop; preflight; trailers record attempts for audit |
| N5 | Sequential execution | One unit at a time, one worktree | Executor; parallelism deferred |
| N6 | Repository hygiene | Writes only in the build worktree and the plan file; the user's tree unchanged; the only residue is the build branch and side branches | Executor; AC-39 |
| N7 | Resumable from git alone | Any interruption resumable with no state outside the repository | R8; AC-54, AC-55 |
| N8 | Upstream compatibility | Works with the pinned `design` version; header drift warns, never stops | Validation; AC-12 |
| N9 | Headless-safe | `--yes` needs no interaction and never pushes | AC-35, AC-52 |
| N10 | Run length | Linear in units, no bound (G4) | Accepted; not enforced |

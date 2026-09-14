# ADR-0006 — Build sequentially in a single dedicated worktree

**Status:** Accepted (2026-09-14)

## Context

The user's checkout must stay usable during a build, and a run must never commit to the branch the user has checked out. Parallel units in per-unit worktrees with rebase-then-fast-forward integration were designed and judged too much for the first version. Building in place would force a stop on any uncommitted change and switch the user's branch under them.

## Decision

**One build worktree with `build/<slug>` checked out; units run sequentially in it; each unit starts from the branch tip.** A failed unit's partial work is saved to a side branch before the reset. Uncommitted changes in the user's tree are reported as a warning, not a stop.

Rejected: building in the user's checkout, for the reasons above. Deferred: parallel worktrees, with the integration design recorded as the resolution path.

## Consequences

The worktree needs the project's setup, which is what the `WorktreeCreate` hook exists for. Run time is linear in the number of units. When parallelism arrives, the sequential path is its degenerate case: same worktree convention, same commit-per-unit record, integration added rather than changed.

# Bootstrap artifacts from the first build run (2026-09-15)

Kept for the next attempt. The `build-design` skill does not exist yet; this directory is what a hand-run of the designed process produced, and what it learned. Delete it once the plugin ships its own executor.

| File | What it is |
|---|---|
| `execute.js` | Bootstrap executor: a Workflow tool script implementing brief behavior 9 (args validation, preflight, per-unit reset → test writer → implementer → test run → refuting verifier → ladder → commit with trailers, side branches, final suite, summary). Git mechanics run through a haiku/low "steward" agent given exact commands. Corrected after the run: side-branch names use `--`, preflight excludes `.claude/worktrees/` locally. |
| `harness.mjs` | Fake-agent harness: runs `execute.js` with canned agent results to check control flow (ladder, cascade, args rejection). `node bootstrap/harness.mjs bootstrap/plan-args.json`. |
| `plan-args.json` | The args block the run used: 15 units derived from issue #4 (12 planned, 3 withheld for gaps G1–G3), tiers from the selection table, ceiling fable, test command from `docs/testing.md`. |
| `plan.md` | The plan as presented in plan mode and approved. |

## Run outcome (workflow `wf_273796ca-bd6`, 41 min, 30 agents, 1.77M subagent tokens)

| Unit | Result |
|---|---|
| `invocation` | done, 1 attempt: marketplace and plugin manifests, `skills/build/SKILL.md` skeleton, `tests/` with `node:test` |
| `capture-when-the-tree-is-live` | done, 1 attempt |
| `discover-the-brief` | failed after 3 attempts; partial work lost (see defect 1) |
| 9 others | withheld, `dependency-failed` cascade from `discover-the-brief` |
| 3 gap units | withheld, `gap` |

Branch `build/build-design` (local, two unit commits on top of `a941b2f`) and worktree `.claude/worktrees/build-build-design` were left in place. Final suite on the tip passed.

## Defects and observations

1. **Nested side-branch names are impossible in git.** The brief said `build/<slug>/failed-<unit>`; git cannot create a ref under an existing branch name. Corrected in issue #4 (body + errata), the executor, and recorded as fact F12 in `docs/assumptions.md`.
2. **The verifier is strict and right.** Attempts 1 and 2 of `discover-the-brief` fell to vacuous test assertions, proved by mutation; attempt 3 to a lexicon violation in the skill text ("the *unit* of the scan"). Each verdict was sound; the ladder's three attempts were spent on two different sides, so the side named last never got a retry. Tuning data for the table and ladder, as ADR-0004 intended.
3. **One early failure withholds most of the plan.** Sequential order plus dependency cascade meant 9 of 12 planned units never ran. Resume (fresh preflight reads trailers, skips done units) is the designed recovery.
4. **Almost every unit went to opus.** The cross-cutting signal held for nearly all units of a contract-heavy plugin, so the table gave opus/high to all but one implementer. Savings came from haiku stewards and sonnet test writers, not from cheap implementers.
5. **Ideas not in the design**, from Tobias's build prompt: implementation-time ADR-worthy decisions written (via the `adr` skill) before the verifier runs; a pre-build peer consult per unit. Both are small executor prompt changes plus a behavior-9 amendment and a criterion.

## To resume later

Re-invoke the executor with `plan-args.json` as args (fresh run, not a cache resume: preflight must re-read the trailers). It skips the two done units and retries the rest. The brief snapshot must be re-materialized from issue #4 first (R1a), since the scratchpad is gone.

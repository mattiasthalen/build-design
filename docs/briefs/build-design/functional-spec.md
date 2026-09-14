# Functional Specification — build-design

- **Sourced from:** the design tree of 2026-09-14, "build-design" (plan-approved build from a design brief), 19 branches decided.
- **Gaps:** 4. (G1) What *fresh* does with an existing build branch. (G2) Two invocations at once on the same brief. (G3) A target-repo commit hook rejecting a unit commit. (G4) No maximum on brief size or run length. Each is named where it falls; a marked default is written for G1 only.
- **Inference:** roughly a tenth of the statements, each marked inline as *(inference: …)*; mostly defaults for slugs, the PR base, the per-unit regression scope, and orphan criteria.

## Scope

One user-invoked skill, `/build-design:build`, that turns a finished design **brief** into an approved **plan** and, on approval, has one static **executor** workflow build it in the target repository: one **unit** per functional-spec behavior, tests first, verified against the unit's acceptance criteria, one commit per unit on a **build branch**.

## Non-goals

From branches closed *out-of-scope* or *deferred-later*:

- Running or altering the design interview; changing the upstream `design` plugin.
- Parallel units (deferred-later; sequential only in this version).
- Stacked-PR output (deferred-later).
- Discovering a brief on a tracker issue (deferred-later; disk only).
- A cost estimate in the plan (deferred-later; the ladder cap and ceiling are the controls).
- `/ultraplan` as the gate (out-of-scope).
- Pushing or opening a PR without an explicit yes (the run ends with a prompt, never an action).
- Sandboxing agents beyond Claude Code's own permission system (out-of-scope).

## Rules, in one place

- **R1 Discovery precedence.** An explicit path argument wins. Otherwise scan the project's documentation directory for artifacts opening with the `**Sourced from:**` header; artifacts in one directory form one brief *(inference: from upstream keeping a brief's artifacts together)*. Exactly one brief: use it. Several: list them and stop. None: stop and point at design-interview Phase 9.
- **R2 Required set.** Functional spec, edge cases, acceptance criteria, and the project lexicon must exist. Interface contract, domain model, non-functional requirements, ADRs, and the assumptions record are read and binding when present, never required.
- **R3 Unit derivation.** One unit per behavior heading in the functional spec. A unit's criteria are the acceptance-criteria cases that name that behavior, happy path and edge cases together. Order is the spec's order; a unit whose preconditions need another unit's result runs after it. The planner may split a behavior or merge trivial ones; the plan shows the mapping.
- **R4 Withholding.** A unit is *withheld*, never built, when its behavior or criteria touch a `Gaps:` entry, a deferred-later or out-of-scope non-goal, a failed unit it depends on, or the user's feedback says skip. Marked inference in the brief is built and flagged, not withheld.
- **R5 Selection table.** Per unit, four **signals**: size (small ≤3 criteria, medium 4–8, large >8), cross-cutting (touches an interface contract, a domain-model concept, or a lifecycle), contested (the tree recorded a fork, a reopen, or an adversarial hit), inference present. Implementer **tier** is sonnet, raised to opus when cross-cutting, contested, or inference holds. Test writer is one tier below the implementer, haiku only when the unit is small and not contested. Verifier runs at the implementer's tier. Effort is medium on haiku and sonnet, high on opus. The **ceiling** defaults to the session model; the table never assigns it.
- **R6 Ladder.** On a failed verification: attempt 2 at the same tier with the verifier's reason; attempt 3 one tier up at high effort, capped at the ceiling; a failure at the ceiling, or a third failure, marks the unit *failed*. Three attempts maximum. The ladder applies to the **role** the verifier names (tests or code). An agent that dies or is skipped counts as one failed attempt.
- **R7 Atomicity.** Before a unit starts, the build worktree is reset to the build branch tip. A unit either lands as exactly one commit or leaves nothing on the branch.
- **R8 Run record.** The build branch's history is the only record: one commit per done unit, with trailers carrying unit id, status, tier and effort per role, attempts, and flags. Resume reads them. Nothing else is persisted; the plan file is disposable.
- **R9 Output discipline.** The main conversation receives the plan table, one log line per unit, the summary table, and the push prompt. No narration.

## Behaviors

### 1. Invocation

- **Trigger:** `/build-design:build [source] [--ceiling T] [--floor T] [--uniform T] [--yes] [--dry-run]`. `source` is a brief directory or one of its files.
- **Preconditions:** the working directory is a git repository; the Workflow tool is available; the `design` plugin is installed (it is a declared dependency). Any failing precondition stops before planning with one line naming it.
- **Result:** discovery (2), capture if a tree is live (3), validation (4), derivation (5), selection (6), plan (7), gate (8).

### 2. Discover the brief

- **Trigger:** invocation.
- **Rules:** R1.
- **Result:** one brief directory chosen, printed in one line; or the several-briefs list, or the pointer to Phase 9, and a stop.

### 3. Capture when the tree is live

- **Trigger:** the conversation holds a completed design tree (Phase 8 laid out) for the design being built.
- **Behavior:** run design-interview's Phase 9 capture before discovery, so the brief on disk equals the tree. While the tree is in context, extract per behavior the signals only the tree carries: fork, reopen count, adversarial hit. These pass to the planner as data; agents never see the tree.
- **Result:** the brief exists on disk; discovery proceeds on it. Without a live tree, signals come from the brief alone (size, cross-cutting, inference marks) and contested is false.

### 4. Validate the brief

- **Rules:** R2. Each artifact should open with the `Sourced from` / `Gaps` / `Inference` header lines; a missing or renamed header means format drift: warn in one line and continue.
- **Result:** missing required artifact: stop, name it, say capture did not finish. Otherwise proceed.

### 5. Derive units

- **Rules:** R3, R4.
- **Behavior:** the planner, a read-only subagent, reads the brief and returns the unit list as data: id, behavior, criteria references, dependencies, signals, withheld reason if any. Unit ids are stable across re-plans of an unchanged brief (deferred-implementation: the id is a slug of the behavior heading).
- **Edge:** a criterion naming no behavior is listed under a final planner-named unit and shown in the plan for the user to reassign via feedback *(inference: from "the plan shows the mapping")*. A behavior with no criteria is withheld with reason `no-criteria` *(inference: the done-condition needs criteria)*. Zero units: stop, nothing to build.

### 6. Assign tiers and effort

- **Rules:** R5; `--floor` raises any tier below it; `--ceiling` caps; `--uniform T` sets every role's tier to T, effort still by table.
- **Edge:** `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` set in the environment: tiers are still shown, and the plan states in one line that selection is void under it.

### 7. Render the plan

- **Content:** a human table (unit id, behavior, criteria count, signals, tier and effort per role, flags: inference, withheld reason, dependency), the test command row, the branch name, the ceiling and floor; then a fenced JSON args block carrying the same data; then one line: "Implement by invoking workflow `build-design:execute` with the args block above."
- **Test command:** detected from the repository (deferred-implementation: the heuristics) and shown for correction; if none is detectable the row reads "unknown, set via feedback". It is a hard precondition: the executor refuses an empty test command.
- **`--dry-run`:** print the human table to the conversation and stop. No plan mode, no execution.

### 8. Gate: plan mode

- **Behavior:** enter plan mode (the user consents), write the rendered plan to the plan file, exit plan mode. Approval is Claude Code's normal "implement this plan" turn: it invokes the executor with the args block verbatim. Rejection with feedback: apply the feedback to the plan data (tier or effort per unit or role, skip a unit → withheld with reason `user`, reorder, split or merge, test command, branch name, ceiling or floor), re-render, exit plan mode again.
- **`--yes`:** skip plan mode and invoke the executor immediately with the same args. Intended for headless use.
- **Result:** the skill ends at plan exit; nothing has been written to the repository yet.

### 9. Execute

- **Trigger:** the executor workflow receives the args block.
- **Preconditions:** the block validates against the executor's schema (see the interface contract); the test command is non-empty. Otherwise return one error line; nothing is created.
- **Preflight:** if the build branch exists with build-design trailers, follow Resume (12). Otherwise create `build/<slug>` from the current HEAD *(inference: slug from the brief directory name)* and a build worktree for it (deferred-implementation: path under `.claude/worktrees/`). A dirty user working tree is reported in one warning line, "uncommitted changes are not part of the build", and does not stop the run. G2: a second invocation while an executor is running on the same brief is undecided.
- **Per unit, in plan order:**
  1. Withheld: record in the summary, no commit, next unit. A unit depending on a *failed* unit becomes withheld with reason `dependency-failed`.
  2. Reset the worktree to the branch tip (R7).
  3. Test writer writes the unit's criteria as tests in the repository's test framework.
  4. Implementer implements until the unit's tests pass, loading `design-philosophy` for structural latitude.
  5. Verification: run the unit's tests and the existing suite *(inference: regression scope, from atomic units plus the final full-suite rule)*; then the verifier, in a fresh context at the implementer's tier, reads the criteria and the diff with the instruction to refute, and returns pass, or fail with the side (tests or code) and a reason.
  6. Pass: commit everything in the worktree as one commit with the R8 trailers; one log line.
  7. Fail: R6. After the final failure, save the partial work to a side branch `build/<slug>/failed-<unit>`, reset the worktree, mark the unit *failed*, one log line, next unit. G3: a commit rejected by a repository hook is undecided.
- **After the last unit:** run the full suite on the branch tip; its result goes in the summary and does not start a ladder *(inference: no decision on post-run repair)*.
- **Result:** return the structured summary (see contract) to the main loop.

### 10. Summary and push prompt

- **Behavior:** the main loop prints one table: per unit, state, tier and effort used per role, attempts, flags; then withheld reasons, failed units with their side branches, and the final suite result. Then it asks: "push `build/<slug>` and open a PR against `<base>`?" where base is the branch HEAD was on when the build branch was created *(inference)*. The summary table is the PR body.
- **`--yes` or no human present:** no push, print the push command instead.

### 11. Progress and cancel

- **Progress:** the Workflow progress tree, plus one log line at each unit's start and end.
- **Cancel:** committed units persist. The in-flight unit's partial work stays in the build worktree until the next run's resume handles it.

### 12. Resume

- **Trigger:** the build branch exists with build-design trailers at invocation.
- **Behavior:** the plan shows units recorded done as done. Ask continue or fresh; `--yes` means continue. Continue: the executor skips done units; uncommitted leftovers in the build worktree are saved to a side branch `build/<slug>/leftover-<n>` *(inference: name)*, the worktree is reset, and the next unit re-runs from scratch. A brief whose unit ids no longer match the trailers is treated as fresh. **G1:** what fresh does with the existing branch is undecided; the marked default is a new branch `build/<slug>-<n>` with the old one kept *(inference)*.

## State and lifecycle

| Entity | States | Transitions | Terminal |
|---|---|---|---|
| Unit | planned → running → done; planned → withheld; running → failed | planned→withheld at derivation, feedback, or dependency failure; planned→running at reset (R7); running→done on commit; running→failed after R6 | done, failed, withheld |
| Run | planning → awaiting-approval → executing → finished; executing → aborted | approval starts executing; the summary ends it; cancel aborts; resume re-enters executing | finished (aborted re-enters via resume) |

A withheld unit leaves no commit and is re-derived on every plan, so it becomes buildable only when the brief changes.

# Acceptance Criteria — build-design

- **Sourced from:** the design tree of 2026-09-14, "build-design", 19 branches decided.
- **Gaps:** 4. G1 (fresh vs existing branch) has one criterion marked inference; G2 (concurrent invocation), G3 (hook-rejected commit), G4 (no maximum) have none, deliberately.
- **Inference:** 5 of 61 cases marked *(inference)*; they assert the marked defaults from the functional spec and should be dropped or confirmed if those defaults are rejected.

Form: Given / When / Then. Every result is observable from the conversation, the repository, or the plan file.

## Invocation and preconditions

- **AC-01** Given the working directory is not a git repository, when `/build-design:build` runs, then one line says so, plan mode is not entered, and no file is written.
- **AC-02** Given the Workflow tool is unavailable, when invoked, then one line names it and the run stops before planning.
- **AC-03** Given an unknown tier alias in `--ceiling`, `--floor`, or `--uniform`, when invoked, then the run stops before planning and lists the accepted aliases.

## Discovery

- **AC-04** Given a path argument to a brief directory, when invoked, then that brief is used and no scan of the docs directory occurs.
- **AC-05** Given no argument and exactly one directory under the docs directory holding artifacts that open with `**Sourced from:**`, then that brief is used.
- **AC-06** Given two such directories, then both are listed, the run stops, nothing is written.
- **AC-07** Given none, then one line points at design-interview Phase 9 and the run stops.

## Capture and signals

- **AC-08** Given a completed design tree in the conversation and no brief on disk, when invoked, then capture runs and the brief exists on disk before any plan is rendered.
- **AC-09** Given a live tree in which a behavior's branch closed as a fork, then that behavior's unit shows the *contested* signal in the plan.
- **AC-10** Given no live tree, then no unit shows *contested*.

## Validation

- **AC-11** Given a brief without an acceptance-criteria artifact, then the run stops, names it, and says capture did not finish.
- **AC-12** Given an artifact without the three header lines, then exactly one warning line appears and planning continues.

## Unit derivation

- **AC-13** Given a functional spec with N behavior headings and no split or merge, then the plan has N units, and planning the same brief twice yields the same unit ids.
- **AC-14** Given a criterion naming behavior X, then it is listed under unit X in the plan.
- **AC-15** Given a criterion that touches a `Gaps:` entry, then its unit is withheld with reason `gap` and appears in the plan as such.
- **AC-16** Given a behavior that maps to a non-goal recorded deferred-later or out-of-scope, then its unit is withheld with reason `deferred` or `out-of-scope`.
- **AC-17** Given a behavior carrying marked inference, then its unit is not withheld and carries the flag `inference`.
- **AC-18** Given unit B's preconditions reference unit A's result, then B appears after A in the plan order.
- **AC-19** Given a spec with zero behaviors, then the run stops with "nothing to build".
- **AC-20** *(inference)* Given a criterion naming no behavior, then it appears under a final planner-named unit in the plan.

## Tier and effort assignment

- **AC-21** Given a small unit with no signals, then the plan shows implementer sonnet/medium and test writer haiku/medium.
- **AC-22** Given a medium unit with no signals, then implementer sonnet/medium and test writer sonnet/medium.
- **AC-23** Given a cross-cutting, contested, or inference-flagged unit, then implementer opus/high, test writer sonnet/medium, verifier opus/high.
- **AC-24** Given default flags and a fable session model, then no role of any unit is assigned fable.
- **AC-25** Given `--uniform opus`, then every role of every unit is opus/high.
- **AC-26** Given `--floor opus`, then no role is below opus.
- **AC-27** Given `--ceiling sonnet` and a cross-cutting unit, then its implementer is sonnet and the plan marks the cap.
- **AC-28** Given `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` set, then the plan contains one line stating that model selection is void.

## Plan rendering

- **AC-29** Given planning completes, then the plan file holds the human table, a fenced JSON block that validates against the executor schema, and the line instructing to invoke `build-design:execute` with it.
- **AC-30** Given a repository with a detectable test command, then the plan shows it; given none, the row reads unknown and the executor refuses the block until it is set.
- **AC-31** Given `--dry-run`, then the table prints in the conversation, plan mode is not entered, and no branch exists afterwards.

## Gate

- **AC-32** Given the plan is approved, then the next turn invokes `build-design:execute` with an args block identical to the plan file's.
- **AC-33** Given rejection with feedback "opus for unit 3", then the re-rendered plan shows unit 3's implementer as opus and the args block matches.
- **AC-34** Given feedback "skip unit 5", then unit 5 is withheld with reason `user`.
- **AC-35** Given `--yes`, then plan mode is not entered and the executor runs with the same block the plan would have carried.
- **AC-36** Given plan mode exited without approval, then the repository has no build branch.

## Execution

- **AC-37** Given an args block that fails the schema, then one error line appears and no branch or worktree is created.
- **AC-38** Given a valid block and no build branch, then `build/<slug>` exists at the invoking HEAD and a worktree for it exists before unit 1 starts.
- **AC-39** Given uncommitted changes in the user's working tree, then one warning line appears, the run proceeds, and the user's tree is unchanged after the run.
- **AC-40** Given a withheld unit, then the branch gains no commit for it and the summary lists its reason.
- **AC-41** Given a unit passes verification on the first attempt, then the branch gains exactly one commit whose trailers carry the unit id, status done, per-role tier and effort, and attempts 1.
- **AC-42** Given verification fails once and then passes, then exactly one commit, attempts 2, same tier as attempt 1.
- **AC-43** Given verification fails twice and passes on the third attempt, then the commit's trailers show the ladder role one tier above its table tier at high effort.
- **AC-44** Given three failed attempts, then no commit for the unit, a branch `build/<slug>/failed-<unit>` holds the partial work, the worktree is at the branch tip, and the summary marks the unit failed.
- **AC-45** Given unit A failed and unit B depends on A, then B is withheld with reason `dependency-failed` and has no commit.
- **AC-46** Given an agent returns nothing (died or skipped) on attempt 1 and the unit passes on attempt 2, then attempts reads 2.
- **AC-47** Given the verifier fails a unit naming side `tests`, then the next attempt is by the test writer role and the trailers record that role's tier for the ladder.
- **AC-48** Given all units processed, then the full suite runs on the branch tip and the summary shows its result.
- **AC-49** *(inference)* Given the final suite fails, then the summary says so and the branch gains no further commits.
- **AC-50** Given execution completes, then the main conversation contains one summary table, at most one log line per unit start and end, and the push prompt, and nothing else from the run.

## Summary and push

- **AC-51** Given the push prompt is answered yes, then `build/<slug>` is pushed and a PR is opened against the base with the summary table as its body.
- **AC-52** Given `--yes` or no human present, then nothing is pushed and the push command is printed.

## Cancel and resume

- **AC-53** Given the run is cancelled during unit k, then commits for units before k exist and none for k.
- **AC-54** Given a build branch whose trailers record units 1–3 done, when invoked, then the plan shows them done and asks continue or fresh.
- **AC-55** Given continue, then the executor starts at unit 4, any uncommitted leftovers are on a side branch, and the worktree is at the tip before unit 4 starts.
- **AC-56** Given `--yes` and an existing build branch, then the run continues without asking.
- **AC-57** Given a brief whose unit ids no longer match the trailers, then the run is treated as fresh.
- **AC-58** *(inference, G1)* Given fresh with an existing `build/<slug>`, then a new branch `build/<slug>-2` is created and the old branch is untouched.

## Contract edges

- **AC-59** *(inference)* Given an args block with an unknown top-level field, then the executor rejects it.
- **AC-60** Given an args block with an empty test command, then the executor refuses with "test command required".
- **AC-61** *(inference)* Given `--uniform` outside `--floor`..`--ceiling`, then the run stops before planning.

## Non-criteria (deliberately unspecified; implementer's latitude)

Trailer key names. The slug algorithm for unit ids and the branch. Test-command detection heuristics. Plan file name. Worktree path. Exact wording of lines and prompts. How cross-cutting is detected in the text. The planner's split and merge heuristics. Log line format. How the verifier's reason is phrased.

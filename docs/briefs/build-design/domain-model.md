# Domain Model — build-design

- **Sourced from:** the design tree of 2026-09-14, "build-design", 19 branches decided.
- **Gaps:** 1. Enforcement of the criteria partition (each criterion in exactly one unit) is nowhere beyond the planner's output; recorded as a hope, not an invariant.
- **Inference:** the collision rule for unit ids, the treatment of attempts as unpersisted values, and the version-mismatch reading rule are marked.

Terms are the lexicon's. This document says what is true of them.

## Concepts

| Concept | Identity | Assigned by | Stable for life? |
|---|---|---|---|
| Brief | its directory path | the `design` plugin at capture | yes, while the directory exists |
| Unit | `id`, a slug of its behavior heading | the planner | yes, for an unchanged brief; a changed heading is a new unit |
| Run | the build branch name `build/<slug>` | the executor at first execution | yes |
| Side branch | its name (`…/failed-<unit>`, `…/leftover-<n>`) | the executor | yes |

Value concepts, no identity, compared by content: **plan** (derived), **signals**, **policy**, **attempt**, **tier**, **role**, **summary**.

Unit id collision (two behaviors slugging alike): the planner suffixes the later one *(inference)*; the executor rejects duplicates it still receives.

## Relationships

| From | To | Cardinality | Kind | On removal |
|---|---|---|---|---|
| Brief | Unit | 1 → 1..*, unit → exactly 1 brief | structural | brief gone: units unreconstructable; the run's record stays in git |
| Unit | Criterion | 1 → 0..*, criterion → exactly 1 unit | partition (see gap) | criterion removed from brief: unit shrinks on next plan |
| Unit | Unit (`depends_on`) | * → *, acyclic | reference | dependency failed: dependent withheld |
| Unit | Commit | 1 → 0..1; done ⇔ 1 | structural | commit rewritten: record lost; resume treats the unit as not done |
| Run | Commit | 1 → 0..* | structural | branch deleted: run gone, nothing else records it |
| Unit | Side branch | 1 → 0..1 | reference | deleting the side branch loses partial work only |
| Plan | Args block | 1 → 1 | rendering | regenerated together on every feedback round |
| Brief | Run | 1 → 0..* (one per slug, fresh adds a suffix) | reference | — |

## Invariants and where each is enforced

| Invariant | Where | Holds |
|---|---|---|
| Unit ids unique within a plan | executor preflight | before execution |
| `depends_on` acyclic, targets exist | executor preflight | before execution |
| Every role tier within floor..ceiling | planner sets; executor preflight verifies | before execution |
| The table never assigns the ceiling | planner (pure function of signals and policy) | at planning |
| Attempts per unit ≤ 3 | executor loop | always |
| done ⇔ exactly one commit carrying the unit's trailers | executor: trailers are part of the single commit | at rest |
| failed or withheld ⇒ no commit on the build branch | executor | at rest |
| Worktree equals branch tip when a unit starts | executor reset (R7) | at the moment a unit starts, not mid-unit |
| `test_command` non-empty | args schema | before execution |
| Each criterion in exactly one unit | **nowhere** beyond the planner's output | hope |
| A withheld unit stays withheld until the brief changes | derivation is a pure function of the brief | at planning |

"Worktree equals tip" is a moment invariant, not an at-rest one: mid-unit the worktree is dirty by design.

## Representations

A unit exists in six shapes:

| Shape | Where | Carries | Authoritative for |
|---|---|---|---|
| Planner output | main loop, data | everything | nothing; input to the plan |
| Plan table | plan file, markdown | everything, human-readable | nothing; a rendering of the block |
| Args block | plan file, JSON | everything, machine-readable | execution parameters, once approved |
| Executor state | workflow memory | block + attempts so far | the running unit |
| Trailers | git commit on the build branch | id, status, roles, attempts, flags | run state (done or not) |
| Summary | workflow result, JSON → table | id, state, reason, attempts, roles, flags, commit, side branch | the PR body |

Where shapes disagree: the brief wins on behavior, the approved args block wins on how to build, the trailers win on what was built. Behavior text, criteria, dependencies, and signals are **lost** in the trailers by design; resume recovers them by re-deriving from an unchanged brief, which is why a changed brief means fresh.

Absent, null, and empty differ: an absent `withheld_reason` means planned; `depends_on: []` means independent and an absent `depends_on` is invalid; `commit: null` in the summary means not done.

Identity survives every round trip: `id` is the same string in all six shapes.

Versioned independently: the brief (by the `design` plugin version), the args block (`schema_version`), the trailers (`Build-Design-Version`). The plan table is unversioned because it is disposable. A trailer version newer than the reading plugin is read as no record, with a warning *(inference)*.

## Tier

An ordered value: haiku < sonnet < opus < fable. "One tier up" and "one below" mean this order; the ceiling and floor are bounds on it. Attempts are values inside a unit and are not persisted individually; only their count survives, in the trailer *(inference: nothing decided keeps per-attempt detail)*.

## Completeness check

A valid unit: an id, a behavior heading, at least one criterion, roles within bounds, state planned. Invalid: duplicate id, a dependency on itself, a tier above the ceiling, withheld without a reason, planned with a reason. A round trip block → trailers → re-derivation preserves id, status, roles, attempts, flags and loses everything the brief can restore.

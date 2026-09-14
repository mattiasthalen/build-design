# Edge Cases and Error Handling — build-design

- **Sourced from:** the design tree of 2026-09-14, "build-design", 19 branches decided.
- **Gaps:** 4, shared with the functional spec: G1 fresh vs an existing branch, G2 concurrent invocations, G3 commit hooks, G4 no size or run-length maximum. Listed under the operations they hit, not resolved here.
- **Inference:** the boundary rows marked *(inference)* extend decided rules to zero and many; the error inventory's channel column is decided (R9), its recovery column is partly inferred.

## Boundary values

| Operation | Zero | Exactly one | Many | Unbounded growth |
|---|---|---|---|---|
| Discover brief | Stop, point at Phase 9 | Use it | List and stop; never a silent pick | n/a |
| Validate brief | Zero required artifacts: stop naming the first missing | — | Optional artifacts: all read, all binding | n/a |
| Derive units | Zero behaviors: stop, nothing to build | One unit: normal run | Hundreds: **G4**, no cap; sequential run length grows with it | Criteria per unit: none; large is a signal, not a limit |
| Criteria per unit | Withheld, reason `no-criteria` *(inference)* | Normal | Normal; size signal large | n/a |
| Signals | None held: sonnet, medium | — | All held: opus, high; still below ceiling | n/a |
| Ladder attempts | — | — | Exactly 3, then failed | Never |
| Side branches | — | One per failed unit or leftover | Accumulate across runs; never reclaimed *(inference: nothing decided reclaims them)* | Yes, by design; user deletes |
| Resume | No trailers: fresh start | — | All units done: plan shows nothing to build, summary only | n/a |

Empty and absent are distinct here: an absent `Gaps:` line is header drift (warn); a present `Gaps: none` line means no withholding on that account.

## Malformed and hostile input

| Input | Where rejected | What is disclosed |
|---|---|---|
| Artifact without the three header lines | Validation, as a warning, not a rejection | The file and the missing header |
| Required artifact missing | Validation | Which artifact; "capture did not finish" |
| Brief from a newer `design` version with renamed headers | Validation warning; unit derivation proceeds on content | The version pinned vs found, when the header carries it |
| Args block that fails the executor schema | Executor preflight | The failing field; nothing is created |
| Empty test command | Executor preflight | "test command required" |
| Unknown tier alias in `--ceiling`, `--floor`, `--uniform` | Skill, before planning | The accepted aliases |
| `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` set | Not rejected; plan says selection is void | The variable name |
| Non-git directory | Skill precondition | "not a git repository" |

The brief is user-authored; agents run under Claude Code's permission mode. No further trust boundary is defined (out-of-scope).

## Concurrency

Sequential by design; one unit at a time, one worktree. **G2:** two `/build-design:build` invocations on the same brief at once (two sessions, or a re-invoke while the executor runs) are undecided. The second would find the build branch, offer resume, and could commit onto a tip the first is still moving. Nothing decided detects or prevents it.

## Partial failure, seam by seam

| Seam | Left behind | Known to the design? |
|---|---|---|
| Capture writes some artifacts, then fails | A partial brief | Yes: required-set check stops the run |
| Planner returns null | No plan | Yes: one failed attempt; the skill reports and stops |
| Plan approved, session ends before the executor starts | Nothing in the repository | Yes: re-invoke re-plans; no state to recover |
| Executor validates args, worktree creation fails | Possibly the branch, no worktree | Partly: stop with the error; branch without commits is harmless *(inference)* |
| Tests written, implementer dies | Uncommitted tests in the worktree | Yes: one failed attempt; ladder continues; R7 reset on the next unit or resume |
| Verification passes, commit rejected by a repository hook | Verified work, no commit | **G3:** undecided |
| Commit lands, log line never printed | Correct branch, terse output | Yes: the record is git, not the log |
| Cancel mid-unit | Partial work in worktree | Yes: resume saves it to a side branch and resets |
| Full suite fails after all units passed | Green units, red branch | Yes: reported in summary, no repair started *(inference)* |
| Push confirmed, push fails | Local branch intact | Yes: print the command; nothing lost |

## Time-related edges

No clocks in the design. An agent that times out or dies is one failed attempt (R6). A run has no deadline (**G4**). Resume is unaffected by elapsed time; only trailers matter.

## Stuck states

| State | Exit | Who | Visible? |
|---|---|---|---|
| Unit running while the executor hangs | Cancel, then resume | User | Yes: progress tree stalls on the unit |
| Withheld unit | Change the brief (close the gap, promote the deferred item) | User via the interview | Yes: listed with reason in every plan and summary |
| Failed unit | Fix by hand from its side branch, or re-run after changing the brief | User | Yes: summary names the side branch |
| Plan awaiting approval, nobody answers | Reject, or `--yes` next time | User | Yes: plan mode shows it |
| Side branches accumulating | Manual deletion | User | Only via `git branch` *(inference: not surfaced)* |

## Error inventory

| Failure | Who learns | Channel | What they can do | Self-recovers |
|---|---|---|---|---|
| No brief found | User | One line in conversation | Run Phase 9 capture, or pass a path | No |
| Several briefs | User | List in conversation | Pass a path | No |
| Required artifact missing | User | One line | Finish capture | No |
| Header drift | User | One warning line | Update the plugin pin, or ignore | Yes, continues |
| Precondition failed (git, Workflow tool, design plugin) | User | One line | Fix the environment | No |
| Test command unknown | User | Plan row | Set it via feedback | No |
| FORCE env set | User | One line in the plan | Unset it, or accept uniform tiers | Continues |
| Args invalid | User | Executor error line | Re-run the skill | No |
| Attempt failed | Nobody, until the summary | Trailer `attempts` and the log line | Nothing during the run | Yes, via the ladder |
| Unit failed | User | Log line, summary, side branch | Finish by hand or re-run | No |
| Unit withheld | User | Plan and summary, with reason | Reopen the design | No |
| Dependent withheld | User | Summary, reason `dependency-failed` | Fix the failed unit, resume | No |
| Full suite red at the end | User | Summary | Fix by hand or re-run | No |
| Push failed | User | Command output | Retry by hand | No |
| Concurrent invocation (G2) | Nobody | None | — | Undecided |
| Hook-rejected commit (G3) | Nobody, in the current design | None | — | Undecided |

Two rows are silent failures today, and are listed as such: G2 and G3.

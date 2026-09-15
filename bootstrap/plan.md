# Build plan: build-design (from brief mattiasthalen/build-design#4)

Planned by hand-run of the build-design process on 2026-09-15 (the skill does not exist yet; this build creates it). Source: issue #4, materialized to `/tmp/claude-0/-home-user-build-design/7cf8ec39-d6a7-54ac-b7ff-cba3d586eee5/scratchpad/brief-4` (6 artifacts; the errata comment ignored per R1a). Required set present: functional specification, edge cases, acceptance criteria, `docs/lexicon.md`. Contracts, domain model, NFRs, ADR-0001..0007, assumptions record present and binding. Signals: size and inference from the brief; cross-cutting from the contract and domain model; contested from the live design tree (forks, reopens, adversarial hits).

| Branch | `build/build-design` from HEAD of `claude/design-interview-build-skill-o222zh`, built in its own worktree |
|---|---|
| Base for the PR | `claude/design-interview-build-skill-o222zh` |
| Test command | `node --test tests/ && claude plugin validate . && claude plugin validate plugins/build-design` (see `docs/testing.md`) |
| Ceiling / floor | fable (session model, never table-assigned) / haiku |
| Ladder | retry same tier → one tier up at high → failed; 3 attempts; role named by the verifier |
| Model selection | active (`CLAUDE_CODE_SUBAGENT_MODEL_FORCE` unset) |
| Order | sequential, plan order; dependents of a failed or withheld unit are withheld |

## Units

| # | id | behavior | criteria | signals | roles | depends on | flags | state |
|---|---|---|---|---|---|---|---|---|
| 1 | `invocation` | 1. Invocation | 3 | size:small,cross,contested | tw sonnet/medium · impl opus/high · ver opus/high | — | — | planned |
| 2 | `discover-the-brief` | 2. Discover the brief | 8 | size:medium,cross,contested,inference | tw sonnet/medium · impl opus/high · ver opus/high | invocation | inference | planned |
| 3 | `capture-when-the-tree-is-live` | 3. Capture when the tree is live | 3 | size:small,cross,contested | tw sonnet/medium · impl opus/high · ver opus/high | invocation | — | planned |
| 4 | `validate-the-brief` | 4. Validate the brief | 2 | size:small,cross | tw sonnet/medium · impl opus/high · ver opus/high | discover-the-brief | — | planned |
| 5 | `derive-units` | 5. Derive units | 8 | size:medium,cross,contested,inference | tw sonnet/medium · impl opus/high · ver opus/high | validate-the-brief | inference | planned |
| 6 | `assign-tiers-and-effort` | 6. Assign tiers and effort | 9 | size:large,cross,contested | tw sonnet/medium · impl opus/high · ver opus/high | derive-units | — | planned |
| 7 | `render-the-plan` | 7. Render the plan | 3 | size:small,cross,contested | tw sonnet/medium · impl opus/high · ver opus/high | assign-tiers-and-effort | — | planned |
| 8 | `gate-plan-mode` | 8. Gate: plan mode | 5 | size:medium,cross,contested | tw sonnet/medium · impl opus/high · ver opus/high | render-the-plan | — | planned |
| 9 | `execute` | 9. Execute | 16 | size:large,cross,contested,inference | tw sonnet/medium · impl opus/high · ver opus/high | render-the-plan | split,inference | planned |
| 10 | `execute-concurrent-invocation` | 9. Execute: concurrent invocation on the same brief (G2) | 0 | size:small | tw haiku/medium · impl sonnet/medium · ver sonnet/medium | execute | split | withheld (gap) |
| 11 | `execute-hook-rejected-commit` | 9. Execute: commit rejected by a repository hook (G3) | 0 | size:small | tw haiku/medium · impl sonnet/medium · ver sonnet/medium | execute | split | withheld (gap) |
| 12 | `summary-and-push-prompt` | 10. Summary and push prompt | 2 | size:small,cross,inference | tw sonnet/medium · impl opus/high · ver opus/high | execute | inference | planned |
| 13 | `progress-and-cancel` | 11. Progress and cancel | 1 | size:small | tw haiku/medium · impl sonnet/medium · ver sonnet/medium | execute | — | planned |
| 14 | `resume` | 12. Resume (continue) | 6 | size:medium,cross,contested,inference | tw sonnet/medium · impl opus/high · ver opus/high | execute,gate-plan-mode | split,inference | planned |
| 15 | `resume-fresh` | 12. Resume: fresh with an existing build branch (G1) | 1 | size:small,inference | tw sonnet/medium · impl opus/high · ver opus/high | resume | split,inference | withheld (gap) |

12 planned, 3 withheld (the three gaps G1–G3 split out of behaviors 9 and 12 so they are visible and never built). Units flagged `inference` carry marked inference in the brief: built and flagged, per R4.

## Executor

`build-design:execute` is not shipped yet. This bootstrap executor implements the brief's behavior 9 (validation, preflight, reset, test writer, implementer, test run, refuting verifier, ladder, commit with trailers, side branches, final suite, summary) and is the first version unit `execute` adopts into `plugins/build-design/workflows/execute.js`:

`/tmp/claude-0/-home-user-build-design/7cf8ec39-d6a7-54ac-b7ff-cba3d586eee5/scratchpad/build/execute.js`

Smoke-tested under a fake-agent harness: ladder tier-up on the named side, three failures → side branch, dependency cascade, args rejection (unknown field, empty test command, duplicate id, cycle).

## Args block

```json
{
  "schema_version": 1,
  "brief": "/tmp/claude-0/-home-user-build-design/7cf8ec39-d6a7-54ac-b7ff-cba3d586eee5/scratchpad/brief-4",
  "brief_source": {
    "type": "issue",
    "ref": "mattiasthalen/build-design#4"
  },
  "branch": "build/build-design",
  "base": "claude/design-interview-build-skill-o222zh",
  "test_command": "node --test tests/ && claude plugin validate . && claude plugin validate plugins/build-design",
  "policy": {
    "ceiling": "fable",
    "floor": "haiku",
    "max_attempts": 3,
    "selection_void": false
  },
  "units": [
    {
      "id": "invocation",
      "behavior": "1. Invocation",
      "criteria": [
        "AC-01",
        "AC-02",
        "AC-03"
      ],
      "depends_on": [],
      "signals": {
        "size": "small",
        "cross_cutting": true,
        "contested": true,
        "inference": false
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "planned"
    },
    {
      "id": "discover-the-brief",
      "behavior": "2. Discover the brief",
      "criteria": [
        "AC-04",
        "AC-05",
        "AC-06",
        "AC-07",
        "AC-62",
        "AC-63",
        "AC-64",
        "AC-65"
      ],
      "depends_on": [
        "invocation"
      ],
      "signals": {
        "size": "medium",
        "cross_cutting": true,
        "contested": true,
        "inference": true
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "planned",
      "flags": [
        "inference"
      ]
    },
    {
      "id": "capture-when-the-tree-is-live",
      "behavior": "3. Capture when the tree is live",
      "criteria": [
        "AC-08",
        "AC-09",
        "AC-10"
      ],
      "depends_on": [
        "invocation"
      ],
      "signals": {
        "size": "small",
        "cross_cutting": true,
        "contested": true,
        "inference": false
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "planned"
    },
    {
      "id": "validate-the-brief",
      "behavior": "4. Validate the brief",
      "criteria": [
        "AC-11",
        "AC-12"
      ],
      "depends_on": [
        "discover-the-brief"
      ],
      "signals": {
        "size": "small",
        "cross_cutting": true,
        "contested": false,
        "inference": false
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "planned"
    },
    {
      "id": "derive-units",
      "behavior": "5. Derive units",
      "criteria": [
        "AC-13",
        "AC-14",
        "AC-15",
        "AC-16",
        "AC-17",
        "AC-18",
        "AC-19",
        "AC-20"
      ],
      "depends_on": [
        "validate-the-brief"
      ],
      "signals": {
        "size": "medium",
        "cross_cutting": true,
        "contested": true,
        "inference": true
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "planned",
      "flags": [
        "inference"
      ]
    },
    {
      "id": "assign-tiers-and-effort",
      "behavior": "6. Assign tiers and effort",
      "criteria": [
        "AC-21",
        "AC-22",
        "AC-23",
        "AC-24",
        "AC-25",
        "AC-26",
        "AC-27",
        "AC-28",
        "AC-61"
      ],
      "depends_on": [
        "derive-units"
      ],
      "signals": {
        "size": "large",
        "cross_cutting": true,
        "contested": true,
        "inference": false
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "planned"
    },
    {
      "id": "render-the-plan",
      "behavior": "7. Render the plan",
      "criteria": [
        "AC-29",
        "AC-30",
        "AC-31"
      ],
      "depends_on": [
        "assign-tiers-and-effort"
      ],
      "signals": {
        "size": "small",
        "cross_cutting": true,
        "contested": true,
        "inference": false
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "planned"
    },
    {
      "id": "gate-plan-mode",
      "behavior": "8. Gate: plan mode",
      "criteria": [
        "AC-32",
        "AC-33",
        "AC-34",
        "AC-35",
        "AC-36"
      ],
      "depends_on": [
        "render-the-plan"
      ],
      "signals": {
        "size": "medium",
        "cross_cutting": true,
        "contested": true,
        "inference": false
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "planned"
    },
    {
      "id": "execute",
      "behavior": "9. Execute",
      "criteria": [
        "AC-37",
        "AC-38",
        "AC-39",
        "AC-40",
        "AC-41",
        "AC-42",
        "AC-43",
        "AC-44",
        "AC-45",
        "AC-46",
        "AC-47",
        "AC-48",
        "AC-49",
        "AC-50",
        "AC-59",
        "AC-60"
      ],
      "depends_on": [
        "render-the-plan"
      ],
      "signals": {
        "size": "large",
        "cross_cutting": true,
        "contested": true,
        "inference": true
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "planned",
      "flags": [
        "split",
        "inference"
      ]
    },
    {
      "id": "execute-concurrent-invocation",
      "behavior": "9. Execute: concurrent invocation on the same brief (G2)",
      "criteria": [],
      "depends_on": [
        "execute"
      ],
      "signals": {
        "size": "small",
        "cross_cutting": false,
        "contested": false,
        "inference": false
      },
      "roles": {
        "test_writer": {
          "tier": "haiku",
          "effort": "medium"
        },
        "implementer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "verifier": {
          "tier": "sonnet",
          "effort": "medium"
        }
      },
      "state": "withheld",
      "withheld_reason": "gap",
      "flags": [
        "split"
      ]
    },
    {
      "id": "execute-hook-rejected-commit",
      "behavior": "9. Execute: commit rejected by a repository hook (G3)",
      "criteria": [],
      "depends_on": [
        "execute"
      ],
      "signals": {
        "size": "small",
        "cross_cutting": false,
        "contested": false,
        "inference": false
      },
      "roles": {
        "test_writer": {
          "tier": "haiku",
          "effort": "medium"
        },
        "implementer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "verifier": {
          "tier": "sonnet",
          "effort": "medium"
        }
      },
      "state": "withheld",
      "withheld_reason": "gap",
      "flags": [
        "split"
      ]
    },
    {
      "id": "summary-and-push-prompt",
      "behavior": "10. Summary and push prompt",
      "criteria": [
        "AC-51",
        "AC-52"
      ],
      "depends_on": [
        "execute"
      ],
      "signals": {
        "size": "small",
        "cross_cutting": true,
        "contested": false,
        "inference": true
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "planned",
      "flags": [
        "inference"
      ]
    },
    {
      "id": "progress-and-cancel",
      "behavior": "11. Progress and cancel",
      "criteria": [
        "AC-53"
      ],
      "depends_on": [
        "execute"
      ],
      "signals": {
        "size": "small",
        "cross_cutting": false,
        "contested": false,
        "inference": false
      },
      "roles": {
        "test_writer": {
          "tier": "haiku",
          "effort": "medium"
        },
        "implementer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "verifier": {
          "tier": "sonnet",
          "effort": "medium"
        }
      },
      "state": "planned"
    },
    {
      "id": "resume",
      "behavior": "12. Resume (continue)",
      "criteria": [
        "AC-54",
        "AC-55",
        "AC-56",
        "AC-57",
        "AC-66",
        "AC-67"
      ],
      "depends_on": [
        "execute",
        "gate-plan-mode"
      ],
      "signals": {
        "size": "medium",
        "cross_cutting": true,
        "contested": true,
        "inference": true
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "planned",
      "flags": [
        "split",
        "inference"
      ]
    },
    {
      "id": "resume-fresh",
      "behavior": "12. Resume: fresh with an existing build branch (G1)",
      "criteria": [
        "AC-58"
      ],
      "depends_on": [
        "resume"
      ],
      "signals": {
        "size": "small",
        "cross_cutting": false,
        "contested": false,
        "inference": true
      },
      "roles": {
        "test_writer": {
          "tier": "sonnet",
          "effort": "medium"
        },
        "implementer": {
          "tier": "opus",
          "effort": "high"
        },
        "verifier": {
          "tier": "opus",
          "effort": "high"
        }
      },
      "state": "withheld",
      "withheld_reason": "gap",
      "flags": [
        "split",
        "inference"
      ]
    }
  ]
}
```

## Implement

Implement by invoking the Workflow tool with `scriptPath` = the executor path above and `args` = the JSON block above, verbatim. Then print the returned summary as one table and ask whether to push `build/build-design` and open a PR against `claude/design-interview-build-skill-o222zh`.

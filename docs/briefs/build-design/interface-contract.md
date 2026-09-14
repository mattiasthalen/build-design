# Interface Contracts — build-design

- **Sourced from:** the design tree of 2026-09-14, "build-design", 19 branches decided.
- **Gaps:** 1. The unknown-field rule for the args block was never decided; written as inference (reject).
- **Inference:** every field *name* below is inference; the interview decided which data crosses each boundary, not what it is called. The unknown-field rule and the closed error set are inference. Everything else traces to a decided branch.

Five boundaries. Two cross plugin borders (the brief from `design`, the CLI to the user); three are inside the plugin but persist or cross an approval, so they get contracts too.

## 1. Brief (input, produced by the `design` plugin)

**Surface.** A directory holding markdown artifacts. Each artifact opens with three list items, in this order:

```
- **Sourced from:** …
- **Gaps:** … | none
- **Inference:** …
```

| Artifact | Required | Recognized by |
|---|---|---|
| Functional specification | yes | H1 contains "Functional Specification" *(inference)* |
| Edge cases and error handling | yes | H1 contains "Edge Cases" *(inference)* |
| Acceptance criteria | yes | H1 contains "Acceptance Criteria" *(inference)* |
| Interface contract, domain model, non-functional requirements | no; binding when present | H1 |
| Project lexicon | yes; at the project's lexicon path, not in the brief directory | design-interview's lexicon scan paths |
| ADRs, assumptions record | no; binding when present | design-interview's scan paths |

Behaviors are the functional spec's behavior sections; criteria are cases that name a behavior. Unknown files in the directory are ignored. The contract version is the pinned `design` plugin version; there is no in-file version marker, so drift is detected by header shape and reported as a warning, never a rejection.

**Failure surface.** `brief-not-found`, `brief-ambiguous` (several directories), `brief-incomplete` (names the artifact): all terminal for the run, all printed as one line. `header-drift`: warning, continues.

## 2. Args block (plan → executor)

The plan file carries this block verbatim; the approving turn passes it as the executor's `args`. Presence of every field is decided; names are inference.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": false,
  "required": ["schema_version", "brief", "branch", "test_command", "policy", "units"],
  "properties": {
    "schema_version": { "const": 1 },
    "brief":          { "type": "string", "description": "brief directory, repo-relative" },
    "branch":         { "type": "string", "pattern": "^build/" },
    "base":           { "type": "string", "description": "PR base; branch HEAD was on at creation" },
    "test_command":   { "type": "string", "minLength": 1 },
    "policy": {
      "type": "object", "additionalProperties": false,
      "required": ["ceiling", "floor", "max_attempts"],
      "properties": {
        "ceiling":        { "$ref": "#/$defs/tier" },
        "floor":          { "$ref": "#/$defs/tier" },
        "max_attempts":   { "const": 3 },
        "selection_void": { "type": "boolean", "description": "true when CLAUDE_CODE_SUBAGENT_MODEL_FORCE is set" }
      }
    },
    "units": { "type": "array", "minItems": 1, "items": { "$ref": "#/$defs/unit" } }
  },
  "$defs": {
    "tier":   { "enum": ["haiku", "sonnet", "opus", "fable"] },
    "effort": { "enum": ["low", "medium", "high", "xhigh", "max"] },
    "role":   { "type": "object", "additionalProperties": false, "required": ["tier", "effort"],
                "properties": { "tier": { "$ref": "#/$defs/tier" }, "effort": { "$ref": "#/$defs/effort" } } },
    "unit": {
      "type": "object", "additionalProperties": false,
      "required": ["id", "behavior", "criteria", "depends_on", "signals", "roles", "state"],
      "properties": {
        "id":         { "type": "string", "pattern": "^[a-z0-9][a-z0-9-]*$" },
        "behavior":   { "type": "string", "description": "the spec heading" },
        "criteria":   { "type": "array", "items": { "type": "string" }, "description": "criterion ids or headings" },
        "depends_on": { "type": "array", "items": { "type": "string" } },
        "signals": {
          "type": "object", "additionalProperties": false,
          "required": ["size", "cross_cutting", "contested", "inference"],
          "properties": {
            "size":          { "enum": ["small", "medium", "large"] },
            "cross_cutting": { "type": "boolean" },
            "contested":     { "type": "boolean" },
            "inference":     { "type": "boolean" }
          }
        },
        "roles": {
          "type": "object", "additionalProperties": false,
          "required": ["test_writer", "implementer", "verifier"],
          "properties": { "test_writer": { "$ref": "#/$defs/role" }, "implementer": { "$ref": "#/$defs/role" }, "verifier": { "$ref": "#/$defs/role" } }
        },
        "state":           { "enum": ["planned", "withheld"] },
        "withheld_reason": { "enum": ["gap", "deferred", "out-of-scope", "dependency-failed", "user", "no-criteria"] },
        "flags":           { "type": "array", "items": { "enum": ["inference", "capped", "split", "merged"] } }
      }
    }
  }
}
```

Rules the schema cannot express, checked by the executor before anything is created: unit ids unique; every `depends_on` names an existing id and the graph is acyclic; every role tier lies within `floor`..`ceiling`; `withheld_reason` present iff `state` is `withheld`.

**Unknown fields:** rejected *(inference)*. **Optional fields:** `base` (default: the branch HEAD is on at execution), `selection_void` (default false), `withheld_reason`, `flags` (default empty). Absent `depends_on` is invalid; an empty array means no dependencies.

**Failure surface**, all terminal, all one line, closed set for schema version 1 *(inference)*: `invalid-args` (names the first failing rule), `test-command-required`, `precondition-failed` (git or worktree). Per-unit outcomes are not errors; they travel in the summary.

**Guarantees.** Units execute strictly in array order. Re-invoking with the same block is idempotent: units whose id has a done trailer on `branch` are skipped. A unit lands as one commit or not at all. No deadline; an agent that dies is one attempt.

**Evolution.** Breaking changes bump `schema_version`; the executor rejects any other value, so a stale plan file approved after a plugin upgrade fails loudly instead of running on the wrong shape. Additive fields also require a bump because unknown fields are rejected.

## 3. Summary (executor → main loop)

Returned as the workflow's result; the main loop renders it as the table and the PR body.

```json
{
  "branch": "build/<slug>", "base": "<base>",
  "units": [{
    "id": "…", "state": "done|failed|withheld", "reason": null,
    "attempts": 1, "roles": { "test_writer": {"tier":"…","effort":"…"}, "implementer": {…}, "verifier": {…} },
    "flags": [], "commit": "<sha>|null", "side_branch": null
  }],
  "suite": { "command": "…", "passed": true },
  "leftover_branch": null
}
```

`commit` is non-null iff `state` is `done`; `side_branch` is non-null iff `state` is `failed`.

## 4. Run record (git trailers, written by the executor, read by resume)

One commit per done unit on `branch`. Trailer keys are deferred-implementation; this is the proposal, and the *content* is decided:

```
Build-Design-Version: <plugin version>
Build-Design-Unit: <id>
Build-Design-Status: done
Build-Design-Roles: test_writer=haiku/medium implementer=sonnet/medium verifier=sonnet/medium
Build-Design-Attempts: 2
Build-Design-Flags: inference
```

Only `done` is ever written; failed and withheld units leave no commit. Unknown trailers are ignored. A record written by a newer plugin version than the reader is treated as no record, with a warning *(inference)*. Resume matches units by id; ids that no longer derive from the brief mean fresh.

## 5. CLI surface (user → skill)

```
/build-design:build [source] [--ceiling T] [--floor T] [--uniform T] [--yes] [--dry-run]
```

`source`: brief directory or one of its files; omitted means discovery. `T`: one of `haiku sonnet opus fable`. `--uniform` must lie within floor..ceiling *(inference)*. `--yes`: skip plan mode, run the executor, never push. `--dry-run`: print the plan table, stop. Outcomes: plan exited for approval; run stopped with one line naming why; dry-run printed.

**Authorization.** None beyond the user's own git credentials, which the push prompt exercises only on an explicit yes.

## Completeness check

Malformed block: `invalid-args`, nothing created. Executor times out mid-unit: safe to re-invoke, done units skipped. Unrecognized field: rejected (inference). Newer `design` plugin: header drift warning, run continues. The remaining "it depends" is the inferred unknown-field rule, reported above.

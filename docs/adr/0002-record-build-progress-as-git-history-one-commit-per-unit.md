# ADR-0002 — Record build progress as git history, one commit per unit

**Status:** Accepted (2026-09-14)

## Context

With the plan derived and not stored (ADR-0001), a run interrupted at unit six of ten and resumed in a fresh session has no record of what is done. Units are atomic by design. Some target repositories require linear history.

## Decision

**The build branch's history is the run record.** Each done unit is exactly one commit on `build/<slug>`, carrying trailers for unit id, status, tier and effort per role, attempts, flags, and the plugin version. Failed and withheld units leave no commit. Resume reads the trailers and skips done units.

**A unit is one behavior of the functional specification** together with the acceptance criteria that name it, done when those criteria pass as tests. This fixes commit granularity.

Rejected: a status file in the repository, because it is a second piece of state that shows up in diffs and merges. Rejected: local state under `.claude/`, because it is invisible in the PR and tied to one machine. Rejected: one unit per criterion, because a criterion is a test, not a work package. Rejected: units by module, because module structure is implementation and the brief does not carry it.

## Consequences

Resume is a `git log` read. Trailer keys become a compatibility surface across plugin versions, hence the version trailer. Partial work of a failed or interrupted unit goes to side branches that accumulate until the user deletes them. A brief whose behavior headings change invalidates unit ids, so resume treats it as fresh. If parallel units arrive later, the record must stay linear, which constrains that design to rebase-then-fast-forward integration.

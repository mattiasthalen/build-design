# ADR-0007 — Read briefs from a tracker issue as well as from disk

**Status:** Accepted (2026-09-14)

## Context

The `design` plugin writes a feature's brief "on the tracker issue when the project works from one, else in the documentation directory marked as a brief". This project, and the projects it will be used on, work from GitHub Issues, so the brief's first home is an issue. Build agents read files. Upstream does not specify how a brief is laid out on an issue.

## Decision

**`source` accepts an issue reference; the issue is fetched and its artifacts are materialized into a local snapshot directory, after which the pipeline is the disk pipeline.** Discovery precedence is explicit path, explicit issue, docs-directory scan. The tracker is never scanned. Layout convention: the body is one artifact and each comment opening with an H1 and the three header lines is one artifact; other comments are ignored.

Rejected: disk only, because it misses upstream's first choice. Rejected: issue only, because projects without a tracker exist and upstream has a disk fallback for them. Rejected: scanning open issues for briefs, because it adds API calls to every run and an ambiguity the docs scan already has to stop on.

## Consequences

An issue source needs `gh` or the GitHub connector; its absence is a precondition failure, not a silent fallback. The layout is an assumption about upstream and is recorded as one. Within a run, execution reads the snapshot; an issue edited afterwards is noticed at the next invocation through the unit-id rule. This repository's own brief moves from `docs/briefs/` to an issue.

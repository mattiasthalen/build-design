# ADR-0005 — Distribute the design plugin as a pinned remote marketplace entry and dependency

**Status:** Accepted (2026-09-14)

## Context

One install from this repository's marketplace should provide both `build-design` and the upstream `design` plugin it consumes. Upstream (`the-exodus/claude-design-skills`) carries no license file, so copying its files needs permission that has not been sought. Claude Code marketplaces accept plugin entries sourced from another git repository and subdirectory, pinned by ref or sha; plugins declare dependencies that auto-install; two same-named plugins from different marketplaces both load, skills included, with no de-duplication.

## Decision

**The marketplace lists `design` as a `git-subdir` entry pointing at the upstream repository, path `plugins/design`, pinned to the validated sha or the `design--v0.4.0` tag. `build-design` declares `design ~0.4.0` as a dependency.** No upstream file is copied. The README tells users to install `design` from one marketplace only. The pin is the upstream-coupling control: `build-design` records the `design` version it was validated against and warns on artifact-header drift.

Rejected: a vendored copy via git subtree, because upstream is unlicensed. Rejected: a git submodule, because the plugin installer may not initialize it. Rejected: an unpinned ref, because it breaks the validated pairing without notice.

## Consequences

Upgrading upstream is a deliberate re-pin with a compatibility check, not an automatic pull. Users who already have upstream installed get duplicate skill names unless they choose one marketplace. If the upstream repository disappears, installs break; accepted.

# Architecture Decision Records

This directory holds Architecture Decision Records (ADRs) in Michael Nygard's
lightweight format: a short **Context / Decision / Consequences** note per
decision, with a **Status**.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-approve-a-derived-plan-in-plan-mode-not-a-stored-artifact.md) | Approve a derived plan in plan mode, never store it as an artifact | Accepted |
| [0002](0002-record-build-progress-as-git-history-one-commit-per-unit.md) | Record build progress as git history, one commit per unit | Accepted |
| [0003](0003-execute-builds-through-the-workflow-tool.md) | Execute builds through the Workflow tool | Accepted |
| [0004](0004-select-models-per-unit-from-a-rule-table-with-an-escalation-ladder.md) | Select models per unit from a rule table with an escalation ladder | Accepted |
| [0005](0005-distribute-the-design-plugin-as-a-pinned-remote-marketplace-entry.md) | Distribute the design plugin as a pinned remote marketplace entry and dependency | Accepted |
| [0006](0006-build-sequentially-in-a-single-dedicated-worktree.md) | Build sequentially in a single dedicated worktree | Accepted |
| [0007](0007-read-briefs-from-a-tracker-issue-as-well-as-from-disk.md) | Read briefs from a tracker issue as well as from disk | Accepted |

## Conventions

- This index is the canonical list of ADRs; keep it in step with the files.
- Filenames: `NNNN-kebab-case-title.md`, numbered sequentially.
- Status is one of: Proposed, Accepted, Deprecated, Superseded.
- An ADR records a decision and why; it is not updated when the decision is
  implemented. Supersede it with a new ADR if the decision changes.

# Lexicon

The project's vocabulary. Every design artifact and the code use these terms with exactly these meanings. Terms are admitted only when getting one wrong would produce divergent implementations; an entry that restates the ordinary meaning of a word does not belong here.

Inherited entries come from the `design` plugin's skills and belong to that vocabulary; they are used here as defined there. New entries were admitted by the build-design interview of 2026-09-14.

| Term | Meaning | Origin |
|---|---|---|
| brief | The set of artifacts the design interview's capture writes for one feature: functional specification, edge cases, acceptance criteria, and, when their conditions held, interface contract, domain model, non-functional requirements. Spent when the feature ships. Distinct from the durable three: ADRs, lexicon, assumptions record. | inherited |
| branch (design) | A topic of a design interview, closed in one terminal state with rationale. Not a git branch; where both could be meant, say *design branch* or *git branch*. | inherited |
| closure states | *decided*, *deferred-implementation*, *deferred-later*, *out-of-scope*, *blocked*, *stable-open*: the terminal states of a design branch. | inherited |
| fork / no fork | A closure recorded as a fork had alternatives that were rejected for stated reasons; no fork means one option was forced. Only forks are ADR-worthy. | inherited |
| four locks | The closure gate of the interview: probes addressed, recap, adversarial check, explicit confirmation. | inherited |
| ADR | Architecture Decision Record in Nygard's Context / Decision / Consequences form, under `docs/adr/`, superseded rather than edited. | inherited |
| lexicon | This file. | inherited |
| assumptions record | `docs/assumptions.md`: standing assumptions with the observation that would falsify each, plus measured facts. | inherited |
| tracker candidate | A design branch closed deferred-later, blocked, or stable-open, emitted as one line for the issue tracker and never written to a file in the tree. | inherited |
| unit | One behavior of the functional specification together with the acceptance criteria that name it. The atom of the plan, of execution, and of the run record: one unit, one commit. | new |
| withheld | The state of a unit that is deliberately not built because its behavior or criteria touch a gap, a deferred-later or out-of-scope non-goal, a failed dependency, or the user said skip. Distinct from the design closure state *blocked*, which is about a design branch, and from *failed*, which means built and not verified. | new |
| plan | The derived view of a brief that the executor runs: units in order, tier and effort per role, withheld and inference flags, test command, branch. Rendered into Claude Code's plan file as a human table plus a verbatim args block. Never stored as its own artifact. | new |
| tier | One of the ordered model tiers haiku < sonnet < opus < fable. "One tier up" and "one below" follow this order. | new |
| ceiling | The highest tier a run may use. Defaults to the session model; the selection table never assigns it, only the ladder or an override reaches it. | new |
| ladder | The escalation rule after a failed verification: retry at the same tier with the verifier's reason, then one tier up at high effort, then failed. Three attempts, capped at the ceiling, applied to the role the verifier names. | new |
| signals | The four per-unit inputs to the selection table: size, cross-cutting, contested, inference. Contested comes only from a live design tree. | new |
| roles | The three agents that work a unit: test writer, implementer, verifier. Each has its own tier and effort. | new |
| executor | The static workflow `build-design:execute` shipped by the plugin, parameterized by the plan's args block. The only thing that writes to the build branch. | new |
| build branch | `build/<slug>`, created from HEAD at first execution and checked out in its own worktree. Units are committed to it; the user's checked-out branch is never touched. | new |
| run record | The build branch's commit history read through its trailers: which units are done, at which tiers, in how many attempts. The only persisted state of a run. | new |

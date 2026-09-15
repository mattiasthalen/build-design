# Assumptions Record

Standing assumptions the design depends on, each with the observation that would show it stopped holding, followed by facts measured against the platform. Read at the start of every design interview and by any review of a build. Remove an assumption the moment it is invalidated; if the resolution was a real fork it becomes an ADR.

Last updated 2026-09-14 by the build-design interview. Platform measured: Claude Code 2.1.270, `design` plugin 0.4.0.

## Standing assumptions

| Id | Assumption | Subject | You would know it stopped holding when |
|---|---|---|---|
| A01 | The Workflow tool is present in every environment the skill runs in. | execution | The skill's precondition check reports it absent. |
| A02 | The Workflow `agent()` call honors per-call `model` and `effort`. | model selection | Trailers show a tier other than the assigned one with the FORCE variable unset. |
| A03 | All four tiers (haiku, sonnet, opus, fable) resolve on the account. | model selection | An alias fails to resolve at agent spawn. |
| A04 | Workflow subagents can invoke skills, so the implementer can load `design-philosophy`. | execution | An implementer reports the Skill tool unavailable; fallback is injecting the file content. |
| A05 | Plan mode permits read-only subagents, so the planner can run inside it. | gate | Entering plan mode blocks the Agent tool; fallback is running the planner before entering. |
| A06 | Upstream tags releases as `design--v<version>`. | distribution | The tag is missing; pin by sha instead. |
| A07 | The turn that implements an approved plan passes the args block to the executor verbatim. | gate | The executor's schema validation rejects a block the plan file carried intact. |
| A08 | The `fork` subagent type stays gated and parent-model only, so nothing here may depend on it. | execution | Irrelevant unless a design starts relying on it. |
| A09 | A brief captured to a tracker issue is laid out as: body = one artifact, each further artifact = one comment, every artifact opening with its H1 and the three header lines. | discovery | A captured issue brief that build-design fails to recognize. |
| A10 | `gh` or the GitHub connector is available wherever an issue is named as `source`. | discovery | The `issue-access-failed` precondition fires in a normal environment. |

## Measured facts

| Id | Fact | Measured |
|---|---|---|
| F01 | Plan mode: no edits and no non-read-only tools until approval; the plan file is the exception. Plan files default to `~/.claude/plans/`; a setting can move them under the project. | CLI 2.1.270 |
| F02 | `/plan` enables plan mode or shows the session plan; `/ultraplan` plans in a cloud session with browser approval. | CLI 2.1.270 |
| F03 | Workflow `agent()` accepts `model`, `effort`, `schema`, `isolation: 'worktree'`, `agentType`, `disallowedTools`. Resume by run id is same-session only. Concurrency cap is min(16, cpus − 2). | CLI 2.1.270 |
| F04 | `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` overrides every per-agent model choice, including workflow agents, silently. | CLI 2.1.270 |
| F05 | Plugins ship workflows in `workflows/`, namespaced `/plugin:name`; named workflows also load from `.claude/workflows/<name>.js`. | docs + CLI 2.1.270 |
| F06 | Marketplace plugin entries accept `github`, `url`, `git-subdir` (with `path`), `npm`, `archive`, `command` sources, pinnable by `ref` or `sha`. Plugins declare `dependencies` that auto-install. Same-named plugins from two marketplaces both load; skills are not de-duplicated. | docs |
| F07 | Subagents never see the parent conversation; the one exception, `fork`, is feature-gated and inherits the parent model. | CLI 2.1.270 |
| F08 | Input price ratio across tiers is about 10 : 5 : 2 : 1 (fable : opus : sonnet : haiku). | claude-api reference, 2026-06 |
| F09 | Upstream `the-exodus/claude-design-skills` carries no license file. | repo at sha 2e41d93 |
| F10 | The `design` plugin's capture writes every artifact with three opening lines: Sourced from, Gaps, Inference; a brief goes to the tracker issue when the project works from one, else a docs directory; ADRs, lexicon, and assumptions are written to fixed scan paths. | plugin 0.4.0 |
| F11 | GitHub caps an issue body or comment at 65536 characters. | GitHub |
| F12 | Git refuses a branch named under an existing branch (`build/x/failed-y` cannot exist while `build/x` does: refs are files). Side branches use a `--` separator, never a nested path. | measured 2026-09-15, first build run |

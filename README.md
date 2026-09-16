# build-design

Build what a design interview decided. The design comes from Tobias
Karlsson's `design` plugin (`the-exodus/claude-design-skills`): an interview
that closes every branch, then a brief, ADRs, a lexicon, and the open questions
filed as tickets. This repository is the other half, a skill that builds one of
those tickets in a fresh session, and a marketplace that pulls the `design`
plugin in beside it so the two install together.

## As a plugin

```
/plugin marketplace add mattiasthalen/build-design
/plugin install build-design@build-design
```

`build-design` depends on `design`, so installing it installs both, and the
skills arrive as `/build-design:implement-design`, `/design:design-interview`,
`/design:adr` and `/design:design-philosophy`. A `design` already installed
from `the-exodus/claude-design-skills` is the same plugin twice; keep one.

## As plain files

Every skill is a self-contained directory under `skills/`. Copy one into
`~/.claude/skills/` for yourself, or into a repository's `.claude/skills/` for
everyone working in it. It still needs the `design` plugin installed by some
route, since it calls `design:adr` and `design:design-philosophy` by name.

```
cp -r skills/implement-design ~/.claude/skills/
```

## What is here

| skill | what it does |
| --- | --- |
| [`implement-design`](skills/implement-design) | One ticket of a design, in a fresh session after the interview: ground, ask the peers, ask me, build, record the decisions, review |

## Layout

```
.claude-plugin/
  plugin.json                     the plugin, and its dependency on design
  marketplace.json                the marketplace: this plugin, and design pulled in from its repo
skills/<name>/
  SKILL.md                        the skill
  README.md                       what it is for, and where its rules came from
```

The repository is both the marketplace and one of the two plugins it serves,
so that entry takes `"source": "./"`. The other, `design`, is a `git-subdir`
source: `plugins/design` of `the-exodus/claude-design-skills`, pinned to a
commit. Moving to a newer `design` is editing that `sha` and the `version`
beside it, and nothing else.

Skills are discovered from `skills/`, so adding one is a directory there and
nothing else. `plugin.json` and the marketplace entry both carry the name and
version, and `claude plugin tag` fails if they drift apart.

`SKILL.md` carries its name in the front matter. Without it the invocation name
falls back to the directory name and changes whenever the directory does. It
also carries `disable-model-invocation: true`: a skill runs by
`/implement-design` and never because a message matched its description.

## Checking a change

```
claude plugin validate . --strict
```

# build-design

Build what a design interview decided. The design comes from Tobias
Karlsson's `design` plugin (`the-exodus/claude-design-skills`), pulled in here
as `software-design` since Anthropic ships a skill called `design`: an interview
that closes every branch, then a brief, ADRs, a lexicon, and the open questions
filed as tickets. This repository is the other half: `build`, a plugin with a
skill that builds one of those tickets in a fresh session, and a marketplace
that pulls the `design` plugin in beside it so the two install together.

## As a plugin

```
/plugin marketplace add mattiasthalen/build-design
/plugin install build@build-design
```

`build` depends on `software-design`, so installing it installs both, and the
skills arrive as `/build:implement-design`, `/software-design:design-interview`,
`/software-design:adr` and `/software-design:design-philosophy`. A `design`
installed from `the-exodus/claude-design-skills` is the same plugin under its
own name; keep one.

## As plain files

Every skill is a self-contained directory under `skills/`. Copy one into
`~/.claude/skills/` for yourself, or into a repository's `.claude/skills/` for
everyone working in it. It still needs `software-design` installed from this
marketplace, since it calls `software-design:adr` and
`software-design:design-philosophy` by that name.

```
cp -r skills/implement-design ~/.claude/skills/
cp workflows/*.js ~/.claude/workflows/
```

`implement-design` calls `the-reading` and `build-behaviors` by name, so the
workflows travel with it. Installed as a plugin they are already there.

## What is here

| skill | what it does |
| --- | --- |
| [`implement-design`](skills/implement-design) | One ticket of a design, in a fresh session after the interview: ground, ask the peers, ask me, build, record the decisions, review |

## Layout

```
.claude-plugin/
  plugin.json                     the build plugin, and its dependency on design
  marketplace.json                the marketplace: build, and software-design pulled in from its repo
skills/<name>/
  SKILL.md                        the skill
  README.md                       what it is for, and where its rules came from
workflows/<name>.js               a workflow a skill calls by name
```

The repository is both the marketplace, `build-design`, and one of the two
plugins it serves, `build`, so that entry takes `"source": "./"`. The other,
`software-design`, is Tobias Karlsson's `design` as a `git-subdir` source:
`plugins/design` of `the-exodus/claude-design-skills`, pinned to a commit, and
renamed on the way in. Moving to a newer one is editing that `sha` and the
`version` beside it, and nothing else.

Skills are discovered from `skills/` and workflows from `workflows/`, so
adding either is a file there and nothing else. A workflow is named by the
`meta.name` in its script, which is the name a skill calls and need not match
the filename — keep them the same anyway. `plugin.json` and the marketplace entry both carry the name and
version, and `claude plugin tag` fails if they drift apart.

`SKILL.md` carries its name in the front matter. Without it the invocation name
falls back to the directory name and changes whenever the directory does. It
also carries `disable-model-invocation: true`: a skill runs by
`/implement-design` and never because a message matched its description.

## Checking a change

```
claude plugin validate . --strict
```

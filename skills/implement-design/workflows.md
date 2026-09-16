# Calling the workflows

Both ship with the plugin and load by name. `Workflow({name, args})` — you
never read the script, so what it costs this session is this page.

## `the-reading` — step 1

```js
args = {
  ticket: '<the ticket, body and comments, as you read it>',
  sources: [
    // one per link the ticket carries, and per code region those links name
    { name: 'the brief', where: 'docs/design/checkout.md', kind: 'record' },
    { name: 'ADR-7', where: 'docs/adr/0007-one-basket.md', kind: 'record', model: 'opus' },
    { name: 'the basket module', where: 'src/basket/', kind: 'code' },
  ],
  models: { critique: { model: 'haiku' } },   // optional, moves a whole stage
}
```

`kind` is `record` — a document, read by extraction — or `code`, read for
what it does and for what it leaves unsaid. `model` and `effort` on a source
override its kind's tier; `models` keys are `record`, `code`, `synthesize`,
`critique`, `revise`.

Returns `{building, criteria: [{criterion, check}], decisions, unread}`.
`unread` is a source no agent came back for; it is yours to tell me about.

## `build-behaviors` — step 4

```js
args = {
  behaviors: [
    // the reading's criteria, in build order, once I have answered step 3
    { criterion: 'An empty basket cannot be checked out',
      notes: '<what step 3 settled about this one>',
      models: { red: { model: 'sonnet' } } },   // optional, this behavior only
  ],
  models: { green: { model: 'haiku' } },        // optional, moves a whole stage
}
```

`models` keys are `red`, `green`, `review`, `fix`, `commit`. Each behavior
runs red → green → three review lenses → fix → commit, and commits to the
branch's own working tree.

Returns one row per behavior: `{behavior, test, findings}`. A run that stops
because a test never went red says so in its log and leaves the rest
unbuilt — that is a finding for step 6, not a failure to retry.

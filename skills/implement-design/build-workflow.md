# The build workflow

Step 4 of `implement-design` runs as one `Workflow` call. The loop is control
flow — red, green, reviewed, committed, once per behavior — so the script
holds it and the model stops re-deciding it every round. The script is also
where each stage gets the model it deserves.

## Shape

Behaviors run **in sequence**: one working tree, one commit each, and a
behavior often builds on the one before it. Inside a behavior the review
**fans out**, because lenses only read.

Set no `isolation` — the loops share the branch's working tree on purpose,
and a worktree would strand the commits off it.

## Model allocation

Inherit nothing by default here: each stage asks for something different.

| stage | model | effort | why |
| --- | --- | --- | --- |
| Red | opus | high | the test is the behavior's contract — its name, its boundary, its assertion. Wrong here and green is wrong quietly |
| Green | sonnet | medium | the change the red test already specified, bounded and checked by that test |
| Review | sonnet ×3 | high | three lenses over a small diff see more than one reader does, at a third of the weight each |
| Fix | opus | high | a finding that survived its lens is where judgement is owed, and this is the only stage that edits reviewed code |
| Commit | haiku | low | a message, from a diff |

## The script

Pass the behaviors in as `args`: one entry per acceptance criterion, in
build order, each carrying what step 3 settled about it.

```js
export const meta = {
  name: 'build-behaviors',
  description: 'Build each behavior test-first: red, green, reviewed, committed',
  phases: [
    { title: 'Red', detail: 'one failing test per behavior', model: 'opus' },
    { title: 'Green', detail: 'the code that passes it', model: 'sonnet' },
    { title: 'Review', detail: 'three lenses over the slice', model: 'sonnet' },
    { title: 'Commit', detail: 'the loop, recorded', model: 'haiku' },
  ],
}

const RED = {
  type: 'object',
  properties: {
    testPath: { type: 'string' },
    red: { type: 'boolean', description: 'ran and failed for the expected reason' },
    failure: { type: 'string', description: 'the failure as reported' },
  },
  required: ['testPath', 'red', 'failure'],
}

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: { file: { type: 'string' }, line: { type: 'number' }, finding: { type: 'string' } },
        required: ['file', 'finding'],
      },
    },
  },
  required: ['findings'],
}

const LENSES = [
  'correctness: what input makes this wrong',
  'design: depth behind a small interface, information hiding, pass-through layers, per software-design:design-philosophy',
  'security: what an untrusted caller reaches',
]

const built = []

for (const [i, behavior] of args.behaviors.entries()) {
  const at = `${i + 1}/${args.behaviors.length}`

  phase('Red')
  const red = await agent(
    `Write one failing test for this behavior, and nothing else:\n\n${behavior.criterion}\n\n${behavior.notes ?? ''}\n\n` +
    `Follow the suite's own conventions. Run it. Return its path, whether it failed for the reason the behavior predicts, ` +
    `and the failure as reported. Write no production code.`,
    { label: `red ${at}`, phase: 'Red', model: 'opus', effort: 'high', schema: RED })

  if (!red?.red) {
    log(`${at} stopped: the test never went red (${red?.failure ?? 'no result'}). ${args.behaviors.length - i} behaviors unbuilt.`)
    break
  }

  phase('Green')
  await agent(
    `Make ${red.testPath} pass. The failure to clear: ${red.failure}\n\n` +
    `Smallest change that earns it. Leave the test alone. Run the whole suite and report it green.`,
    { label: `green ${at}`, phase: 'Green', model: 'sonnet', effort: 'medium' })

  phase('Review')
  const findings = (await parallel(LENSES.map((lens) => () =>
    agent(
      `Review the uncommitted diff through one lens — ${lens}. Report only what this lens sees, in the diff itself.`,
      { label: `review ${at}: ${lens.split(':')[0]}`, phase: 'Review', model: 'sonnet', effort: 'high', schema: FINDINGS })
  ))).filter(Boolean).flatMap((r) => r.findings)

  if (findings.length) {
    phase('Review')
    await agent(
      `Fix these findings in the working tree, keeping every test green:\n` +
      findings.map((f) => `- ${f.file}${f.line ? `:${f.line}` : ''} — ${f.finding}`).join('\n') +
      `\n\nA finding you judge wrong stays unfixed and comes back with the reason.`,
      { label: `fix ${at}`, phase: 'Review', model: 'opus', effort: 'high' })
  }

  phase('Commit')
  await agent(
    `Commit the working tree. The message names the behavior — ${behavior.criterion} — and says why it is built this way.`,
    { label: `commit ${at}`, phase: 'Commit', model: 'haiku', effort: 'low' })

  built.push({ behavior: behavior.criterion, test: red.testPath, findings: findings.length })
}

return built
```

The run returns one row per behavior: the criterion, the test that met it,
and how many findings its loop fixed. That is what step 6 reports from.

export const meta = {
  name: 'build-behaviors',
  description: 'Build each behavior test-first: red, green, reviewed, committed',
  whenToUse: 'Step 4 of implement-design, once the reading\'s criteria are settled',
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

const GREEN = {
  type: 'object',
  properties: {
    green: { type: 'boolean', description: 'the whole suite passes' },
    failure: { type: 'string', description: 'what still fails, when it does not' },
    decisions: {
      type: 'array',
      items: { type: 'string' },
      description: 'forks this stage took that the behavior did not settle, each with what it rejected',
    },
  },
  required: ['green', 'failure', 'decisions'],
}

const DECISIONS = {
  type: 'object',
  properties: {
    decisions: {
      type: 'array',
      items: { type: 'string' },
      description: 'forks this stage took that the behavior did not settle, each with what it rejected',
    },
  },
  required: ['decisions'],
}

const COMMIT = {
  type: 'object',
  properties: {
    sha: { type: 'string', description: "the commit's sha, empty when nothing was committed" },
    refused: { type: 'string', description: 'what refused it — a hook, an empty index, an unset identity' },
  },
  required: ['sha', 'refused'],
}

const DEFAULT = {
  red: { model: 'opus', effort: 'high' },
  green: { model: 'sonnet', effort: 'medium' },
  review: { model: 'sonnet', effort: 'high' },
  fix: { model: 'opus', effort: 'high' },
  commit: { model: 'haiku', effort: 'low' },
}

// the script's default, the run's override, then the behavior's own
const tier = (stage, behavior) => ({
  ...DEFAULT[stage],
  ...((args.models ?? {})[stage] ?? {}),
  ...((behavior?.models ?? {})[stage] ?? {}),
})

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
    { label: `red ${at}`, phase: 'Red', ...tier('red', behavior), schema: RED })

  if (!red?.red) {
    log(`${at} stopped: the test never went red (${red?.failure ?? 'no result'}). ${args.behaviors.length - i} behaviors unbuilt.`)
    break
  }

  phase('Green')
  const green = await agent(
    `Make ${red.testPath} pass. The failure to clear: ${red.failure}\n\n` +
    `Smallest change that earns it. Leave the test alone. Run the whole suite and report whether it is green. ` +
    `Stage the slice when it is — \`git add -A\` — so the review reads the new test with the change. ` +
    `Report every fork you took that the behavior did not settle, with what you rejected — a shape the ` +
    `criterion allowed two of, an invariant you chose to enforce here, a name you had to coin.`,
    { label: `green ${at}`, phase: 'Green', ...tier('green', behavior), schema: GREEN })

  if (!green?.green) {
    log(`${at} stopped: ${red.testPath} never went green (${green?.failure ?? 'no result'}). ${args.behaviors.length - i} behaviors unbuilt.`)
    break
  }

  phase('Review')
  const findings = (await parallel(LENSES.map((lens) => () =>
    agent(
      `Review this slice — \`git diff --cached\`, the new test ${red.testPath} and the change that passes it — ` +
      `through one lens: ${lens}. Report only what this lens sees, in the slice itself.`,
      { label: `review ${at}: ${lens.split(':')[0]}`, phase: 'Review', ...tier('review', behavior), schema: FINDINGS })
  ))).filter(Boolean).flatMap((r) => r.findings)

  let fixes = null
  if (findings.length) {
    phase('Review')
    fixes = await agent(
      `Fix these findings in the slice, keeping every test green, and stage what you change:\n` +
      findings.map((f) => `- ${f.file}${f.line ? `:${f.line}` : ''} — ${f.finding}`).join('\n') +
      `\n\nA finding you judge wrong stays unfixed and comes back with the reason, which is a fork like ` +
      `any other. Report every fork the fixes took.`,
      { label: `fix ${at}`, phase: 'Review', ...tier('fix', behavior), schema: DECISIONS })
  }

  phase('Commit')
  const commit = await agent(
    `Commit the staged slice. The message names the behavior — ${behavior.criterion} — and says why it is built ` +
    `this way. Return the commit's sha, or say what refused it.`,
    { label: `commit ${at}`, phase: 'Commit', ...tier('commit', behavior), schema: COMMIT })

  if (!commit?.sha) {
    log(`${at} stopped: nothing committed (${commit?.refused ?? 'no result'}). Its slice is loose in the tree and the next loop would swallow it.`)
    break
  }

  built.push({
    behavior: behavior.criterion,
    test: red.testPath,
    findings: findings.length,
    commit: commit.sha,
    decisions: [...(green?.decisions ?? []), ...(fixes?.decisions ?? [])],
  })
}

return built

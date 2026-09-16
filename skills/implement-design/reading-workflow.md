# The reading workflow

Step 1 of `implement-design` ends in the reading, and the sources it comes
from are read in parallel. One session reading six artifacts in a row holds
the first one in a context the sixth has crowded; one agent per source holds
all of it, and the synthesis sees six slices at full weight.

## Shape

**Scout inline first.** Read the ticket yourself — body and comments — since
what it links is what the workflow reads, and you cannot pass a source list
you have not discovered. Each link, and each code region those links name,
is one entry in `args.sources`.

Sources are `record` or `code`, and the kinds ask for different work. A
record says what it says: the read is extraction. Code has to be inferred
from, and what it leaves unsaid — an invariant enforced nowhere, a concept
with two shapes and no authority — is the part step 1 turns into a decision.

The synthesis is a **barrier**: the reading is one document and needs every
slice at once. The critique fans out again, because a gap in the reading can
be a gap of three different kinds.

## Model allocation

The table is the default. A source arrives with its own `model` and
`effort` when the session that read the ticket can see this one is harder
or flatter than its kind — an ADR that settled the whole feature, a lexicon
of six lines — and `args.models` moves a whole stage for a run.

| stage | model | effort | why |
| --- | --- | --- | --- |
| Read a record | sonnet | medium | extraction from a document that already says it, against a ticket the prompt carries |
| Read code | sonnet | high | the same read plus the absences, which are inference and are the ones the reading exists to surface |
| Synthesize | opus | high | the one stage that sees everything, and the stage whose output every later step is built on — the criteria here become the build workflow's behaviors |
| Critique | sonnet ×3 | high | three narrow reads of one document; each lens is blind to the others' failure and none needs the whole design in mind |
| Revise | opus | high | a gap that survived its lens is a judgement about the design, taken against the full reading |

## The script

```js
export const meta = {
  name: 'the-reading',
  description: "Read a ticket's sources in parallel and synthesize the reading",
  phases: [
    { title: 'Read', detail: 'one agent per source', model: 'sonnet' },
    { title: 'Synthesize', detail: 'the slices into one reading', model: 'opus' },
    { title: 'Critique', detail: 'three lenses over the reading', model: 'sonnet' },
    { title: 'Revise', detail: 'the reading, corrected', model: 'opus' },
  ],
}

const SLICE = {
  type: 'object',
  properties: {
    source: { type: 'string' },
    bears: { type: 'string', description: 'what this source says that bears on the ticket' },
    decides: { type: 'array', items: { type: 'string' }, description: 'decisions it records, and what each rejected' },
    names: { type: 'array', items: { type: 'string' }, description: 'names it fixes, with what each means here' },
    leaves: { type: 'array', items: { type: 'string' }, description: 'what it leaves open, absences included' },
  },
  required: ['source', 'bears', 'decides', 'names', 'leaves'],
}

const READING = {
  type: 'object',
  properties: {
    building: { type: 'string', description: 'what you will build, in the domain\'s words' },
    criteria: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion: { type: 'string' },
          check: { type: 'string', description: 'the check that could fail if it were unmet' },
        },
        required: ['criterion', 'check'],
      },
    },
    decisions: { type: 'array', items: { type: 'string' }, description: 'every decision the ticket leaves to you' },
    unread: { type: 'array', items: { type: 'string' }, description: 'sources named but not read' },
  },
  required: ['building', 'criteria', 'decisions', 'unread'],
}

const GAPS = {
  type: 'object',
  properties: { gaps: { type: 'array', items: { type: 'string' } } },
  required: ['gaps'],
}

const DEFAULT = {
  record: { model: 'sonnet', effort: 'medium' },
  code: { model: 'sonnet', effort: 'high' },
  synthesize: { model: 'opus', effort: 'high' },
  critique: { model: 'sonnet', effort: 'high' },
  revise: { model: 'opus', effort: 'high' },
}

// the script's default, the run's override, then the source's own
const tier = (stage, source) => ({
  ...DEFAULT[stage],
  ...((args.models ?? {})[stage] ?? {}),
  ...(source?.model ? { model: source.model } : {}),
  ...(source?.effort ? { effort: source.effort } : {}),
})

const LENSES = [
  'coverage: a source nobody read, a claim in the reading with no source behind it',
  'absence: an invariant enforced nowhere, a concept with two shapes and no authority, a name that says how instead of what',
  'criteria: a criterion whose check could not fail, or a criterion the ticket implies and the reading dropped',
]

phase('Read')
const slices = (await parallel(args.sources.map((s) => () =>
  agent(
    `Read ${s.name} at ${s.where}. The ticket it serves:\n\n${args.ticket}\n\n` +
    (s.kind === 'code'
      ? `Report what it does that bears on this ticket, and what it leaves unsaid — an invariant enforced nowhere, ` +
        `a concept with two shapes and no authority. An absence is a finding here, not a gap in your reading.`
      : `Report what it says that bears on this ticket, every decision it records with what that decision rejected, ` +
        `and what it leaves open.`),
    { label: `read ${s.name}`, phase: 'Read', ...tier(s.kind, s), schema: SLICE })
))).filter(Boolean)

const unread = args.sources.filter((s) => !slices.some((r) => r.source === s.name)).map((s) => s.name)
if (unread.length) log(`unread: ${unread.join(', ')} — the reading is short by ${unread.length} of ${args.sources.length} sources`)

phase('Synthesize')
const slate = JSON.stringify(slices)
let reading = await agent(
  `These are the sources of this ticket, read one at a time:\n\n${slate}\n\nThe ticket:\n\n${args.ticket}\n\n` +
  `Write the reading: what you will build, its acceptance criteria and the check that proves each — write the criteria ` +
  `yourself where the ticket has none — and every decision the ticket leaves to whoever builds it. ` +
  `Two sources that disagree are a decision, not a merge.` +
  (unread.length ? `\n\nUnread, and yours to report: ${unread.join(', ')}.` : ''),
  { label: 'the reading', phase: 'Synthesize', ...tier('synthesize'), schema: READING })

phase('Critique')
const gaps = (await parallel(LENSES.map((lens) => () =>
  agent(
    `The sources:\n\n${slate}\n\nThe reading drawn from them:\n\n${JSON.stringify(reading)}\n\n` +
    `Critique it through one lens — ${lens}. Report only what this lens sees.`,
    { label: `critique: ${lens.split(':')[0]}`, phase: 'Critique', ...tier('critique'), schema: GAPS })
))).filter(Boolean).flatMap((c) => c.gaps)

if (gaps.length) {
  phase('Revise')
  reading = await agent(
    `The reading:\n\n${JSON.stringify(reading)}\n\nThe sources:\n\n${slate}\n\n` +
    `Three lenses found these gaps:\n${gaps.map((g) => `- ${g}`).join('\n')}\n\n` +
    `Return the reading with each one closed. A gap you judge wrong stays open and its entry says why.`,
    { label: 'the reading, revised', phase: 'Revise', ...tier('revise'), schema: READING })
}

return reading
```

The reading is what step 2 sends the peers and what step 3 puts to me. Its
`criteria` are the build workflow's `behaviors` once I have answered.

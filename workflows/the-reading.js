export const meta = {
  name: 'the-reading',
  description: "Read a ticket's sources in parallel and synthesize the reading",
  whenToUse: 'Step 1 of implement-design, once the ticket has been read and its sources listed',
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
          source: { type: 'string', description: "the brief that carries it, or 'unsourced' for one the reading wrote" },
        },
        required: ['criterion', 'check', 'source'],
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
  'criteria: a criterion whose check could not fail, one the brief carries and the reading dropped, or one the reading wrote that the brief does not have',
]

phase('Read')
const read = await parallel(args.sources.map((s) => () =>
  agent(
    `Read ${s.name} at ${s.where}. The ticket it serves:\n\n${args.ticket}\n\n` +
    (s.kind === 'code'
      ? `Report what it does that bears on this ticket, and what it leaves unsaid — an invariant enforced nowhere, ` +
        `a concept with two shapes and no authority. An absence is a finding here, not a gap in your reading.`
      : `Report what it says that bears on this ticket, every decision it records with what that decision rejected, ` +
        `and what it leaves open.`),
    { label: `read ${s.name}`, phase: 'Read', ...tier(s.kind, s), schema: SLICE })
))

// parallel keeps the input order, so position is the identity — an agent's own
// `source` string is whatever it chose to call the thing and never matches
const slices = read.filter(Boolean)
const unread = args.sources.filter((s, i) => !read[i]).map((s) => s.name)
if (unread.length) log(`unread: ${unread.join(', ')} — the reading is short by ${unread.length} of ${args.sources.length} sources`)

phase('Synthesize')
const slate = JSON.stringify(slices)
let reading = await agent(
  `These are the sources of this ticket, read one at a time:\n\n${slate}\n\nThe ticket:\n\n${args.ticket}\n\n` +
  `Write the reading: what you will build, its acceptance criteria and the check that proves each, and every decision ` +
  `the ticket leaves to whoever builds it. The criteria are the brief's — it always carries them — so a criterion ` +
  `you write yourself belongs in the reading as a gap, named as one, and not as a criterion. ` +
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

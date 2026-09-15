// Smoke harness: runs execute.js with fake agents to check control flow. Not part of the plugin.
import { readFileSync } from 'node:fs'
const src = readFileSync(new URL('./execute.js', import.meta.url), 'utf8').replace(/^export const meta/m, 'const meta')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
const run = new AsyncFunction('args', 'agent', 'log', 'phase', src)

function fakeAgent(plan) {
  const calls = []
  const agent = async (prompt, opts) => {
    const label = opts.label || ''
    calls.push({ label, model: opts.model, effort: opts.effort })
    const [unit, step] = label.includes(':') ? label.split(':') : [null, label]
    if (step === 'preflight') return { ok: true, base: 'main', worktree: '.claude/worktrees/x', done_units: plan.done || [], dirty: !!plan.dirty, leftover_branch: null, output: '' }
    if (step === 'reset' || step === 'test-run' || step === 'final-suite') return { ok: true, output: '' }
    if (step === 'tests') { const f = plan.tests?.[unit]; if (f && f.shift() === 'null') return null; return { done: true, files_changed: ['tests/x.test.mjs'], notes: '' } }
    if (step === 'implement') return { done: true, files_changed: ['src/x.mjs'], notes: '' }
    if (step === 'verify') { const v = plan.verify?.[unit]; const r = v ? v.shift() : 'pass'; return r === 'pass' ? { verdict: 'pass', side: 'none', reason: '' } : { verdict: 'fail', side: r, reason: `refuted (${r})` } }
    if (step === 'commit') return { ok: true, sha: 'abc' + calls.length, output: '' }
    if (step === 'save-failed') return { ok: true, branch: `build/x/failed-${unit}`, output: '' }
    throw new Error('unexpected label ' + label)
  }
  return { agent, calls }
}
const args = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const logs = []
// Scenario: unit 'assign-tiers-and-effort' verifier fails twice on tests then passes (ladder tier-up on test_writer);
// unit 'execute' test writer dies once then passes; unit 'render-the-plan' fails 3x -> its dependent 'gate-plan-mode' withheld.
const { agent, calls } = fakeAgent({ verify: { 'assign-tiers-and-effort': ['tests', 'tests', 'pass'], 'render-the-plan': ['code', 'code', 'code'] }, tests: { execute: ['null'] } })
const out = await run(args, agent, (m) => logs.push(m), () => {})
console.log(JSON.stringify(out.units.map(u => [u.id, u.state, u.attempts, u.roles.test_writer.tier + '/' + u.roles.test_writer.effort, u.roles.implementer.tier, u.side_branch, u.reason && u.reason.slice(0, 30)]), null, 0))
console.log('logs:', logs.length, '| agent calls:', calls.length, '| models used:', [...new Set(calls.map(c => c.model))].join(','))
// invalid args cases
for (const [name, mut] of [['unknown field', a => { a.extra = 1 }], ['empty test cmd', a => { a.test_command = ' ' }], ['dup id', a => { a.units[1].id = a.units[0].id }], ['tier over ceiling', a => { a.units[0].roles.implementer.tier = 'fable' }], ['cycle', a => { a.units[0].depends_on = [a.units[1].id]; a.units[1].depends_on = [a.units[0].id] }]]) {
  const b = JSON.parse(JSON.stringify(args)); mut(b); const r = await run(b, agent, () => {}, () => {}); console.log(name, '->', r.error, '|', r.detail)
}

export const meta = {
  name: 'build-design-execute',
  description: 'Execute an approved build-design plan: per unit, tests first, implement, verify, one commit per unit on the build branch',
  phases: [
    { title: 'Preflight', detail: 'validate args, build branch, worktree, resume scan' },
    { title: 'Units', detail: 'sequential: reset, tests, implement, verify, ladder, commit' },
    { title: 'Finish', detail: 'full suite on the branch tip, summary' },
  ],
}

// ---------- pure helpers ----------
const TIERS = ['haiku', 'sonnet', 'opus', 'fable']
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max']
const REASONS = ['gap', 'deferred', 'out-of-scope', 'dependency-failed', 'user', 'no-criteria']
const ROLES = ['test_writer', 'implementer', 'verifier']
const tierUp = (t, ceiling) => TIERS[Math.min(TIERS.indexOf(t) + 1, TIERS.indexOf(ceiling))]
const within = (t, floor, ceiling) => TIERS.indexOf(t) >= TIERS.indexOf(floor) && TIERS.indexOf(t) <= TIERS.indexOf(ceiling)

function validate(a) {
  const fail = (m) => ({ error: 'invalid-args', detail: m })
  if (!a || typeof a !== 'object') return fail('args must be an object')
  const allowed = ['schema_version', 'brief', 'brief_source', 'branch', 'base', 'test_command', 'policy', 'units']
  for (const k of Object.keys(a)) if (!allowed.includes(k)) return fail(`unknown field ${k}`)
  for (const k of ['schema_version', 'brief', 'branch', 'test_command', 'policy', 'units']) if (a[k] === undefined) return fail(`missing ${k}`)
  if (a.schema_version !== 1) return fail(`schema_version ${a.schema_version} unsupported`)
  if (typeof a.brief !== 'string' || !a.brief) return fail('brief must be a path')
  if (typeof a.branch !== 'string' || !/^build\//.test(a.branch)) return fail('branch must start with build/')
  if (typeof a.test_command !== 'string' || !a.test_command.trim()) return { error: 'test-command-required', detail: 'test_command is empty' }
  const p = a.policy
  if (!p || !TIERS.includes(p.ceiling) || !TIERS.includes(p.floor) || p.max_attempts !== 3) return fail('policy needs ceiling, floor (tiers) and max_attempts 3')
  if (TIERS.indexOf(p.floor) > TIERS.indexOf(p.ceiling)) return fail('floor above ceiling')
  if (!Array.isArray(a.units) || a.units.length === 0) return fail('units must be a non-empty array')
  const ids = new Set()
  for (const u of a.units) {
    for (const k of ['id', 'behavior', 'criteria', 'depends_on', 'signals', 'roles', 'state']) if (u[k] === undefined) return fail(`unit missing ${k}`)
    if (!/^[a-z0-9][a-z0-9-]*$/.test(u.id)) return fail(`bad unit id ${u.id}`)
    if (ids.has(u.id)) return fail(`duplicate unit id ${u.id}`)
    ids.add(u.id)
    if (!Array.isArray(u.depends_on) || !Array.isArray(u.criteria)) return fail(`unit ${u.id}: criteria and depends_on must be arrays`)
    if (!['planned', 'withheld'].includes(u.state)) return fail(`unit ${u.id}: bad state`)
    if ((u.state === 'withheld') !== (u.withheld_reason !== undefined)) return fail(`unit ${u.id}: withheld_reason iff withheld`)
    if (u.withheld_reason !== undefined && !REASONS.includes(u.withheld_reason)) return fail(`unit ${u.id}: bad withheld_reason`)
    for (const r of ROLES) {
      const role = u.roles[r]
      if (!role || !TIERS.includes(role.tier) || !EFFORTS.includes(role.effort)) return fail(`unit ${u.id}: role ${r} needs tier and effort`)
      if (!within(role.tier, p.floor, p.ceiling)) return fail(`unit ${u.id}: role ${r} tier ${role.tier} outside floor..ceiling`)
    }
  }
  for (const u of a.units) for (const d of u.depends_on) if (!ids.has(d)) return fail(`unit ${u.id}: unknown dependency ${d}`)
  // acyclic
  const seen = new Set(), stack = new Set()
  const byId = Object.fromEntries(a.units.map(u => [u.id, u]))
  const visit = (id) => { if (stack.has(id)) return false; if (seen.has(id)) return true; stack.add(id); for (const d of byId[id].depends_on) if (!visit(d)) return false; stack.delete(id); seen.add(id); return true }
  for (const u of a.units) if (!visit(u.id)) return fail(`dependency cycle through ${u.id}`)
  return null
}

const SHELL_SCHEMA = { type: 'object', required: ['ok', 'output'], properties: { ok: { type: 'boolean' }, output: { type: 'string' } } }
const PREFLIGHT_SCHEMA = { type: 'object', required: ['ok', 'base', 'worktree', 'done_units', 'dirty', 'leftover_branch', 'output'],
  properties: { ok: { type: 'boolean' }, base: { type: 'string' }, worktree: { type: 'string' }, done_units: { type: 'array', items: { type: 'string' } }, dirty: { type: 'boolean' }, leftover_branch: { type: ['string', 'null'] }, output: { type: 'string' } } }
const WORK_SCHEMA = { type: 'object', required: ['done', 'files_changed', 'notes'], properties: { done: { type: 'boolean' }, files_changed: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' } } }
const VERDICT_SCHEMA = { type: 'object', required: ['verdict', 'side', 'reason'], properties: { verdict: { enum: ['pass', 'fail'] }, side: { enum: ['tests', 'code', 'none'] }, reason: { type: 'string' } } }
const COMMIT_SCHEMA = { type: 'object', required: ['ok', 'sha', 'output'], properties: { ok: { type: 'boolean' }, sha: { type: ['string', 'null'] }, output: { type: 'string' } } }
const SIDE_SCHEMA = { type: 'object', required: ['ok', 'branch', 'output'], properties: { ok: { type: 'boolean' }, branch: { type: ['string', 'null'] }, output: { type: 'string' } } }

const STEWARD = { model: 'haiku', effort: 'low' }
const stewardRules = 'You are a mechanical git steward. First run: cd "$(git rev-parse --show-toplevel)" so every path below is relative to the repository root. Then run exactly the commands given, in order, with Bash. Do not improvise, do not fix anything, do not edit files. Report faithfully: ok=false on any non-zero exit, with the command output (last 60 lines) in output.'

// ---------- main ----------
const a = args
const bad = validate(a)
if (bad) return bad
const { branch, test_command, policy } = a
const brief = a.brief
const units = a.units
const wtName = branch.replace(/[^a-z0-9]+/gi, '-')
const wtPath = `.claude/worktrees/${wtName}`
const unitText = (u) => `Unit ${u.id}: behavior "${u.behavior}". Criteria (ids or headings in the brief's acceptance criteria): ${u.criteria.join('; ') || '(none listed)'}.`
const briefText = `The brief is the directory ${brief}: read its functional specification (the behavior section for this unit and the rules), edge cases, acceptance criteria, and the interface contract and domain model when present. The project lexicon is docs/lexicon.md; use its terms exactly. ADRs under docs/adr/ are binding. docs/testing.md says how this repository is tested.`

phase('Preflight')
const pre = await agent(`${stewardRules}
Repository: the current working directory. Build branch: ${branch}. Worktree path: ${wtPath}.
1. git rev-parse --is-inside-work-tree
2. base=$(git rev-parse --abbrev-ref HEAD); echo "BASE=$base"
3. dirty: git status --porcelain --untracked-files=no | head -5 ; report dirty=true if any line printed
4. if ! git rev-parse --verify --quiet ${branch}; then git branch ${branch} HEAD; fi
5. if [ ! -d ${wtPath} ]; then mkdir -p .claude/worktrees && git worktree add ${wtPath} ${branch}; fi; grep -qx '.claude/worktrees/' .git/info/exclude 2>/dev/null || echo '.claude/worktrees/' >> .git/info/exclude
6. leftovers: if git -C ${wtPath} status --porcelain | grep -q .; then n=$(git branch --list '${branch}--leftover-*' | wc -l); lb="${branch}--leftover-$((n+1))"; git -C ${wtPath} checkout -q -b "$lb" && git -C ${wtPath} add -A && git -c user.name=build-design -c user.email=build-design@localhost -C ${wtPath} commit -q --no-verify -m "build-design: leftover work saved" && git -C ${wtPath} checkout -q ${branch} && git -C ${wtPath} reset -q --hard ${branch}; echo "LEFTOVER=$lb"; else echo "LEFTOVER=none"; fi
7. done units: git log ${branch} --format=%B | grep -E '^Build-Design-Unit: ' | sed 's/^Build-Design-Unit: //' | sort -u
Return ok, base (from step 2), worktree="${wtPath}", done_units (array from step 7, empty if none), dirty (step 3), leftover_branch (the LEFTOVER value or null), output.`,
  { ...STEWARD, label: 'preflight', phase: 'Preflight', schema: PREFLIGHT_SCHEMA })
if (!pre || !pre.ok) return { error: 'precondition-failed', detail: pre ? pre.output : 'preflight agent returned nothing' }
const base = a.base || pre.base
const done = new Set(pre.done_units || [])
if (pre.dirty) log('warning: uncommitted changes in your working tree are not part of the build')
if (pre.leftover_branch) log(`leftover work saved to ${pre.leftover_branch}`)

phase('Units')
const results = []
const failed = new Set()
const notBuilt = new Set() // failed or withheld: a dependent of any of these is withheld too
const record = (u, r) => { results.push({ id: u.id, ...r }); return r }
const total = units.length
let n = 0
for (const u of units) {
  n++
  const rolesUsed = JSON.parse(JSON.stringify(u.roles))
  if (u.state === 'withheld') { notBuilt.add(u.id); log(`unit ${n}/${total} ${u.id}: withheld (${u.withheld_reason})`); record(u, { state: 'withheld', reason: u.withheld_reason, attempts: 0, roles: rolesUsed, flags: u.flags || [], commit: null, side_branch: null }); continue }
  const dep = u.depends_on.find(d => notBuilt.has(d))
  if (dep) { notBuilt.add(u.id); log(`unit ${n}/${total} ${u.id}: withheld (dependency-failed: ${dep})`); record(u, { state: 'withheld', reason: 'dependency-failed', attempts: 0, roles: rolesUsed, flags: u.flags || [], commit: null, side_branch: null }); continue }
  if (done.has(u.id)) { log(`unit ${n}/${total} ${u.id}: already done (resume)`); record(u, { state: 'done', reason: null, attempts: 0, roles: rolesUsed, flags: [...(u.flags || []), 'resumed'], commit: null, side_branch: null }); continue }

  log(`unit ${n}/${total} ${u.id}: start (${u.roles.implementer.tier}/${u.roles.implementer.effort})`)
  let outcome = null, lastReason = '', side = 'code', attempts = 0
  for (let attempt = 1; attempt <= policy.max_attempts; attempt++) {
    attempts = attempt
    // ladder: attempt 2 same tier with reason; attempt 3 one tier up at high, on the named side
    if (attempt === 3) { const r = side === 'tests' ? 'test_writer' : 'implementer'; rolesUsed[r] = { tier: tierUp(rolesUsed[r].tier, policy.ceiling), effort: 'high' } }
    const feedback = attempt > 1 ? `Previous attempt failed on the ${side} side: ${lastReason}. Fix that.` : ''

    const reset = await agent(`${stewardRules}
1. git -C ${wtPath} reset -q --hard ${branch}
2. git -C ${wtPath} clean -q -fd
3. git -C ${wtPath} status --porcelain | wc -l
Return ok and output.`, { ...STEWARD, label: `${u.id}:reset`, phase: 'Units', schema: SHELL_SCHEMA })
    if (!reset || !reset.ok) { lastReason = 'worktree reset failed: ' + (reset ? reset.output : 'no output'); continue }

    const tw = rolesUsed.test_writer
    const tests = await agent(`You are the test writer for one unit of a build. Work ONLY inside the worktree ${wtPath} (cd there first; never touch files outside it). ${briefText}
${unitText(u)}
Write tests that check exactly this unit's acceptance criteria as observable behavior, in the repository's existing test framework (the test command is: ${test_command}; if the repository has no tests yet, create the minimal structure that command needs). Do not implement the behavior; tests may fail now. Keep tests small, one criterion per case, named after the criterion. ${feedback && side === 'tests' ? feedback : ''}
Return done=true when the tests are written, files_changed, and notes (one or two lines).`,
      { model: tw.tier, effort: tw.effort, label: `${u.id}:tests`, phase: 'Units', schema: WORK_SCHEMA })
    if (!tests || !tests.done) { lastReason = 'test writer did not finish: ' + (tests ? tests.notes : 'no output'); side = 'tests'; continue }

    const im = rolesUsed.implementer
    const impl = await agent(`You are the implementer for one unit of a build. Work ONLY inside the worktree ${wtPath} (cd there first; never touch files outside it). Before structural decisions, invoke the skill design:design-philosophy if the Skill tool is available; otherwise apply: minimize complexity, deep modules behind small interfaces, no pass-through layers, push complexity down, name the alternative you rejected. ${briefText}
${unitText(u)}
Tests for this unit were just written (${(tests.files_changed || []).join(', ')}). Implement the behavior until the test command passes: ${test_command}. Do not weaken or delete tests; if a test contradicts the brief, say so in notes and leave it. Implement only this unit's behavior; do not build other units. ${feedback && side === 'code' ? feedback : ''}
Return done=true only when the test command passes, files_changed, and notes.`,
      { model: im.tier, effort: im.effort, label: `${u.id}:implement`, phase: 'Units', schema: WORK_SCHEMA })
    if (!impl || !impl.done) { lastReason = 'implementer did not get tests green: ' + (impl ? impl.notes : 'no output'); side = 'code'; continue }

    const run = await agent(`${stewardRules}
1. cd ${wtPath} && ${test_command}
Return ok (true only if the command exited 0) and output.`, { ...STEWARD, label: `${u.id}:test-run`, phase: 'Units', schema: SHELL_SCHEMA })
    if (!run || !run.ok) { lastReason = 'test command failed: ' + (run ? run.output.slice(-1500) : 'no output'); side = 'code'; continue }

    const ve = rolesUsed.verifier
    const verdict = await agent(`You are the verifier for one unit of a build, in a fresh context. Your job is to REFUTE: find a reason this unit does not satisfy its acceptance criteria. Work read-only inside ${wtPath}. ${briefText}
${unitText(u)}
Inspect: git -C ${wtPath} diff ${branch} --stat and the full diff; the tests written; the criteria in the brief. Check that every criterion of this unit has a test that asserts observable behavior (not internals), that no test was weakened to pass, that the implementation does what the brief says and nothing the brief withholds, and that lexicon terms are used exactly. Tests already pass.
Return verdict pass or fail; on fail, side = tests (the tests are wrong or missing a criterion) or code (the implementation is wrong), and a reason another agent can act on. Default to fail if uncertain.`,
      { model: ve.tier, effort: ve.effort, label: `${u.id}:verify`, phase: 'Units', schema: VERDICT_SCHEMA })
    if (!verdict) { lastReason = 'verifier returned nothing'; side = 'code'; continue }
    if (verdict.verdict !== 'pass') { lastReason = verdict.reason; side = verdict.side === 'tests' ? 'tests' : 'code'; continue }

    const roleStr = ROLES.map(r => `${r}=${rolesUsed[r].tier}/${rolesUsed[r].effort}`).join(' ')
    const flags = (u.flags || []).join(',') || 'none'
    const commit = await agent(`${stewardRules}
1. cd ${wtPath} && git add -A
2. git commit -q -m "${u.behavior.replace(/"/g, "'")}" -m "Unit ${u.id} of the build-design plan for ${brief}." --trailer "Build-Design-Version: 0.1.0" --trailer "Build-Design-Unit: ${u.id}" --trailer "Build-Design-Status: done" --trailer "Build-Design-Roles: ${roleStr}" --trailer "Build-Design-Attempts: ${attempt}" --trailer "Build-Design-Flags: ${flags}" --trailer "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" --trailer "Claude-Session: https://claude.ai/code/session_01BRUsyqA6hXFc6nFDsVE5Hw"
3. git rev-parse HEAD
Return ok, sha (from step 3), output.`, { ...STEWARD, label: `${u.id}:commit`, phase: 'Units', schema: COMMIT_SCHEMA })
    if (!commit || !commit.ok) { lastReason = 'commit failed: ' + (commit ? commit.output : 'no output'); side = 'code'; continue }
    outcome = { state: 'done', reason: null, attempts: attempt, roles: rolesUsed, flags: u.flags || [], commit: commit.sha, side_branch: null }
    break
  }
  if (outcome) { record(u, outcome); log(`unit ${n}/${total} ${u.id}: done (${attempts} attempt${attempts > 1 ? 's' : ''})`); continue }

  const sideBranch = `${branch}--failed-${u.id}`
  const saved = await agent(`${stewardRules}
1. cd ${wtPath} && git checkout -q -B ${sideBranch}
2. git add -A && git -c user.name=build-design -c user.email=build-design@localhost commit -q --no-verify --allow-empty -m "build-design: failed attempts for unit ${u.id}" -m "${lastReason.replace(/"/g, "'").slice(0, 500)}"
3. git checkout -q ${branch} && git reset -q --hard ${branch}
Return ok, branch="${sideBranch}", output.`, { ...STEWARD, label: `${u.id}:save-failed`, phase: 'Units', schema: SIDE_SCHEMA })
  failed.add(u.id); notBuilt.add(u.id)
  record(u, { state: 'failed', reason: lastReason.slice(0, 300), attempts, roles: rolesUsed, flags: u.flags || [], commit: null, side_branch: saved && saved.ok ? saved.branch : null })
  log(`unit ${n}/${total} ${u.id}: failed after ${attempts} attempts`)
}

phase('Finish')
const suite = await agent(`${stewardRules}
1. cd ${wtPath} && ${test_command}
Return ok (true only if exit 0) and output.`, { ...STEWARD, label: 'final-suite', phase: 'Finish', schema: SHELL_SCHEMA })
return {
  branch, base,
  worktree: wtPath,
  units: results,
  suite: { command: test_command, passed: !!(suite && suite.ok), output: suite ? suite.output.slice(-800) : '' },
  leftover_branch: pre.leftover_branch || null,
  dirty_warning: !!pre.dirty,
}

# implement-design

Implement one ticket of a design. It runs in a fresh session after
`design-interview` has closed the tree, written the brief and the ADRs, and
left the open questions on the tracker as tickets.
`/implement-design <ticket>`: the ticket is the whole argument, and the
sessions worth asking — the design interview above all — are a question the
skill puts to me in step 2. The design plugin it leans on
(Tobias Karlsson's `design`, `the-exodus/claude-design-skills`) is pulled in by
this repository's marketplace as `software-design`, a dependency of `build`, the
plugin carrying this skill.

The skill is the prompt it replaces, made to survive a fresh session:

> Let's build the ticket. Ground yourself in the ticket and code. Ask the
> peer agent in case you're missing something, and then ask me any
> clarifying questions you may have before building. Any ADR-worthy
> decisions that are made during implementation should be written before
> running the review cycle.

Six steps, one artifact between them: the reading, synthesized at the end of
step 1, corrected by the peers in step 2, and put to me in step 3 as the
questions and then as the plan. What survives that is what gets built — its
criteria become the behaviors step 4 builds one loop at a time, and the forks
those loops take come back for step 5 to weigh.

Steps 1 and 4 are workflows the plugin ships — `the-reading` and
`build-behaviors`, scripts under `workflows/` at the repository root — and
the skill calls them by name. `workflows.md` beside the skill is what it
reads instead: the two call contracts, and nothing about how either runs.

## Where each line came from

Most rows pair a line with its source rather than with an incident. Two
groups are earned: the loop in step 4, from a run that batched the tests,
and the six fixes a Fable review of the unrun skill found — the peer wait,
the refused-decision channel, step 6's review target, the uncommitted ADRs,
`unread` by position, and the green and commit gates. A line that a run breaks
without gets its row rewritten to say what went wrong; a line no run ever
needed gets cut.

| line | where it came from |
| --- | --- |
| `implement-design`, the name | asked for, with the rule that came with it: call it what it is. The skill implements a design, one ticket of it; `implement` alone said what every build session does |
| `Let's build $ARGUMENTS` and the six steps | the prompt above, typed by hand at the start of every build session. Asked for, not measured. `$0` at first, until a Fable review asked what it does to a multi-word ticket: the harness splits the argument into positionals, `$0` takes the first token, and `PROJ-12 checkout flow` arrives as `PROJ-12`. `$ARGUMENTS` is the whole string, which is what the ticket now is |
| `body, comments, and what it links: the brief, the ADRs, the lexicon, the assumptions record` | what `design-interview` leaves behind. The brief lives on the ticket or in the docs directory and is spent when the feature ships; the ADRs, the lexicon and the assumptions record outlive it and are the project's. A fresh session reads the issue body by default and stops there |
| `Read the ticket yourself ... and the code they name are the sources` | the reference's hybrid rule: scout inline, then orchestrate. The source list is what the ticket links, so it cannot be an argument to the read — it is the read's first finding. The ticket is also the one source every later prompt carries |
| `Read those with the the-reading workflow, the sources as its args` | suggested, of the peer step, and true one step earlier. Six artifacts read in sequence land in a context the last of them is crowding, and the ADR read at position six gets the attention position six has left. One agent per source reads all of them at full weight, and the synthesis sees six slices instead of one fading memory. The peers are why it is step 1 and not step 2: a peer is a live session holding the interview, and a subagent spawned to stand in for one holds nothing the main session could not read itself |
| `You plan, allocate and ask; the workflows read, build and review` | the session that runs this skill is not necessarily the one that should do the reading. Fable can drive it, and the reason to is that it never has to be the model doing the subtle work: it plans the run, picks the tier each piece deserves, and holds the conversation with me. Naming the division once at the top is what keeps the model from reading a source itself because it is right there |
| `Keep what a workflow returns ... leave how it got there in the run` | the main session's context is the scarce one — it survives every step, and everything it reads it carries to the end. A workflow's agents each get their own, so the source text, the diffs and the review bodies cost nothing there and cost the rest of the run if they land here. The `Workflow` reference says the same thing from the other side: an agent's final text is the return value, not a report |
| `Each workflow's default tiers are in workflows.md ... travels in args with the tier you give it` | asked for: the plan picks the models, and a table frozen in a script cannot know that this ticket's ADR settled the whole feature while its lexicon is six lines. Three layers, narrowest wins — the script's default, `args.models` for a run, the source's or behavior's own — so the common case stays silent and the exception is one field |
| `workflows this plugin ships, called by name and never read` | asked for. A script the session reads to run it costs that session the whole script; a workflow the plugin ships is invoked by its `meta.name` and costs the call. `workflows.md` is what remains in the skill: the args each one takes and what it returns, which the caller genuinely needs, and nothing about how either runs. Plugins auto-load `workflows/` at their root, so shipping them is a directory |
| `every tier the plan moved off its default, with what ... moved it` | the tiers are guesses until a run has an opinion. Reporting only the moves keeps the report short and puts the evidence where the next edit to the table needs it |
| `Steps 1 and 4 run as workflows ... your authorization` | the `Workflow` tool refuses to run without explicit opt-in, and names a skill's instructions as one of the forms that opt-in takes. Without the line the model reaches step 1, reads the tool's own rule, and builds inline instead. Written once above the run rather than in both steps, since it is one permission and not two |
| `Steps 1 to 3 are plan mode: EnterPlanMode first` | asked for, and the mechanism the run was already reaching for. Steps 1 to 3 read, ask and decide and write nothing but the plan, which is exactly what plan mode enforces; step 4 is the first step that touches the tree. The reading workflow runs inside it because its agents only read |
| the plan file as the artifact | plan mode already has one, and `ExitPlanMode` puts what is in it to me. The reading was previously something the model held and paraphrased into questions; written to the plan file it is a document I read once and approve, which is also the cheapest way to review an allocation before it is spent |
| `the tier each stage will run on` | the tiers are the model's own judgement about my money, and the plan is the one moment they are cheap to correct. Naming them there turns "smart allocation" from a thing I find out afterwards into a line I can move before the run |
| `ExitPlanMode is where I approve it` | it replaced "Build when I have answered", which asked the model to decide that my answers amounted to consent. `ExitPlanMode` is consent with a mechanism: rejecting it keeps the session in plan mode, so a no costs nothing and leaves the plan open to edit |
| `in one message` | asked for: "any clarifying questions you may have", a batch before building, in place of one at a time across the build. Briefly written as `AskUserQuestion`, since plan mode's protocol reaches for it; taken back out because these questions are not multiple choice. A decision the ticket left open, a name that should say what the thing is — the answers are prose, and a tool that wants options either flattens them into options or spends a turn on a question that reads as a form. `ExitPlanMode` still carries the approval, which is the one thing that tool is for |
| `it returns the test that met each criterion, what its review fixed, and the forks its loops took` | step 5 said "a decision made while building" when the session did the building. The loops run in agents now, and a fork taken inside one dies with that agent's context unless the loop reports it, so the workflow's green and fix stages return their decisions and step 5 has material again. Found by reading step 5 against step 4 after the workflows landed, not by a run |
| `Put every candidate to the peers the moment step 4 returns` | in practice the original prompt's peer channel stayed open all run, and ADRs were where it earned most: the peer holds the tree, so it knows the decision the design already settled and the one it explicitly rejected. Step 2 asks once and closes the channel, which loses exactly that. The send is at step 4's return rather than inside step 5 because the ADRs must be in the diff the reviewers read, so the wait has to start before the writing does |
| `ListAgents first: a peer that answered in step 2 and is no longer listed` | the roster is established in step 2 and spent in step 5, an hour and a build apart, and a session can end in between. Without the re-check the send goes to an address nothing answers to and the wait never resolves — a silence identical to a peer with nothing to add. Named rather than waited on, since a dead peer's answer is not coming |
| `A new ADR goes in on the answers you have by then; a supersession waits for its peer` | the error is one-sided. A new ADR written without the peer is a duplicate in the index, and superseding is the mechanism that corrects it. A supersession written without the peer edits an ADR someone else wrote, on a guess. So the block is on the expensive half only — blocking both would stall the run on a reply that arrives when that session next takes a turn, which may be after this one ends |
| `A peer that has not answered ... goes into them as an outstanding wait` | a reply lands when the peer session next takes a turn, and nothing in this session makes that happen. Without the clause the run holds at step 2 for something no one is going to do, and the questions I could have answered an hour ago never arrive. The wait travels inside the questions instead |
| `A design decision the code refuses is a fork the loop reports` | the line used to say the refusal "comes back to me first", written when the session did the building. A green agent cannot reach me — it would take the fork and say nothing — so the report is what the loop can actually do, and the arrival is the workflow's return |
| `the change is the diff since this branch left its base and never the working tree` | every loop commits, so by step 6 the working tree holds the ADRs and nothing else. `/code-review` with no target reads that tree: the cycle would have ended on its first pass having reviewed no code at all, and "a pass that finds nothing ends it" would have made that look like success |
| `The ADRs and these fixes are commits of their own` | step 4's loops commit and nothing after them did. The report claimed a history that did not hold the ADRs the report was naming |
| `A candidate still waiting when the cycle ends is one you name to me` | the wait is invisible otherwise: a peer that never answered and a peer that answered "nothing to add" leave the same trace, which is no ADR. Naming it puts the decision back to me while I still have the diff in front of me |
| `its acceptance criteria where the ticket has none` | `design-interview`'s claim that criteria written from the design alone prove the design is done. A ticket that did not come from it has none, and then the reading carries them, for me to confirm in step 3 |
| `What the code cannot tell you ... is one of those decisions` | `design-interview`'s Phase 2: exploration reads what is there and is blind to what isn't, and the absences are decisions. At build time the same absence gets enforced silently or stepped around; naming it a decision puts it in the questions |
| `Ask me who the peers are` | the peers were first an argument, `/implement-design <ticket> @peer ...`, on the assumption that a session is tagged the way a file is. There is no tagging in the message that starts a session, so a peer arrived as a hand-typed name — approximate, unverifiable, and demanding I remember the roster before the skill had shown it to me. The skill holds the roster: `ListAgents` prints it, so it asks. The argument is the ticket and nothing else |
| `Show me that list, name the ones that look like this ticket's design and say what makes each look that way` | the question has to be answerable at a glance. A bare list makes me read every session title; a list with a recommendation and its evidence makes me confirm or correct one. The evidence is what lets me correct it — a title that matches the feature is a guess, not a design interview |
| `ask which to ask` | mine to decide, and cheap to decide: a peer that was never in the design costs a message and an answer worth nothing, and a peer left out costs the half of the design it was holding |
| `A peer I name that nothing answers to is a gap you tell me about` | I can still name a session the list does not have, from memory of a session that has since ended. Silently dropping it loses what that peer held; saying so lets me go find it |
| `what the design decided that the ticket does not carry, and what it rejected` | the interview's own rule for surfacing an ADR: the rejected half is the valuable half, since without it the same option gets re-proposed and ruled out a second time. Asked for as "in case you're missing something"; this is the shape the question has to take to get that back |
| `Read every answer before you ask me anything else` | a peer's reply arrives when that session next takes a turn, which may be after this one ends, so the questions to me wait on a list I named myself and can see outstanding. Reading every answer first keeps those questions down to what no one else could settle. "Say who you asked" stood here while the peers were an argument; step 2 now asks me who they are, so I already know |
| `Names are up for debate` | asked for, from a note handed over with the ticket: the names in it are proposals and better ones are welcome. The rule the proposals are judged by, call it what it is, lives in my global instructions, so this line grants the challenge and leaves the criterion where every session already has it |
| `Done is every acceptance criterion met by a test in the history` | borrowed from the record of `grill-to-build` (`mattiasthalen/skills`): five decision records, five confirmation sections naming checks nobody had written. Derive what you tell me from a test that ran, and one a reader can find in the commits rather than in a claim |
| `Each is a loop: ... One loop, one commit` | a run of the six steps wrote every function, then every test, then committed. Nothing in step 4 said otherwise: "Build" is one word and the acceptance criteria are a list, so the model batched them and lost the feedback loop. Naming the loop and naming the commit as its unit is what makes a criterion's test land before its code |
| `red` / `green` | `writing-for-agents`' leading-word lever, and its own worked example: "a loop you believe in" → _red_, a fuzzy gate turned into a binary state the model can observe. Two pretrained words carry the whole TDD cycle that "watched failing for the reason you expect, then the code that passes it" spent a line on |
| `for the reason you expect` | red alone is not evidence: an import error, a missing fixture, an assertion that never ran are all red. The reason is what distinguishes a test that describes the behavior from one that describes a typo |
| `review over that slice, its findings fixed` | asked for: the review cycle ran once, at the end, over the whole diff, so a habit set in loop one was found in loop nine and cost every loop after it. A slice review is cheap, its findings are local, and it keeps the final cycle for what only the whole shows |
| `Run the loops with the build-behaviors workflow` | asked for. The loop is control flow — fixed order, fixed count, one commit each — and the `Workflow` tool is where control flow stops being a judgement the model remakes every round. It also buys the per-stage model allocation that a single session cannot have. The script is named by path, not by a skill pointer: a file in the skill's own folder is reached by reading it. Both scripts sit outside `SKILL.md` because each is forty lines that one step reads, and inlining either would bury the other five steps |
| `the reading's criteria as its args` | the two workflows are one pipe: step 1's `criteria` are step 4's `behaviors`, each with the check that proves it. `args` is how a workflow takes input; without the phrase the model writes the behaviors into the script text, and the script stops being the same script twice |
| `The loop reviews saw slices; this one sees what they add up to` | the final cycle's reason for surviving the per-loop reviews — without it the model reads step 6 as the work step 4 already did. Duplication across slices, a seam neither side owns, an ADR written in step 5 and reviewed by nobody: none of it is visible inside one loop |
| `A run that stops is a finding about the plan, not a hiccup` | the workflow stops on three things — a test that never went red, one that never went green, a commit something refused — and `workflows.md` said the run resumed as a fresh call while step 4 said nothing and step 6 said done is every criterion. Asked for, chosen against resuming: each of those stops says the plan was wrong about what the behavior was, and a second loop on the same cause is the same loop. The re-plan is the point |
| `Structure the ticket leaves open follows software-design:design-philosophy` | the `design-philosophy` skill says of itself that it applies when an agent implements from a spec with structural decisions still open, and its description would trigger on that. A must-have target behind a far pointer is a variance bug, so the skill names it in one line rather than trusting the description to fire |
| `A design decision the code refuses comes back to me first` | the interview's contradiction rule, carried to build time: a decision the design made is not the implementer's to remake, and a workaround typed at the moment the code refuses it is exactly that. Seen in ordinary sessions, not measured |
| `mine included` | an answer I give in step 3 or on a refused decision is a decision made while building too, and one that reverses an ADR is a supersession, which the `adr` skill owns once it is handed the decision |
| `a real fork existed, its consequences outlive the change, and a future reader would ask why` | the ADR-worthy test from `design-interview`'s `artifacts.md`, all three at once. Inlined because the interview's text is not in a fresh session's context, and it is the one definition the step turns on |
| `before the review cycle runs` | asked for. The ADRs are in the diff the reviewers read, and a decision written after the review is a decision the review never saw |
| `/code-review and /security-review ... and both run again` | the two reviews `grill-to-build`'s record has the driver running after every slice, which is what "the review cycle" has meant so far, made a loop with an end: a pass that finds nothing. The pair is a guess at the name's meaning, to be corrected by the first run that means something else |
| `disable-model-invocation: true` | as in `grill-to-build`: the skill runs when I type `/implement-design` and never because a message matched its description, so the description is a one-line summary for the `/` menu and the skill costs a session nothing until called |

## The reading workflow

`workflows/the-reading.js` at the plugin root is step 1's script. Its
sources are read in parallel because one session reading six artifacts in a
row holds the first in a context the sixth has crowded; one agent per source
holds all of it, and the synthesis sees six slices at full weight. The
session still reads the ticket itself — what it links is what the workflow
reads, so the source list cannot be an argument to it.

Its default tiers, which a source or `args.models` overrides:

| stage | model | effort | why |
| --- | --- | --- | --- |
| Read a record | sonnet | medium | extraction from a document that already says it, against a ticket the prompt carries |
| Read code | sonnet | high | the same read plus the absences, which are inference and are the ones the reading exists to surface |
| Synthesize | opus | high | the one stage that sees everything, and the stage whose output every later step is built on — the criteria here become the build workflow's behaviors |
| Critique | sonnet ×3 | high | three narrow reads of one document; each lens is blind to the others' failure and none needs the whole design in mind |
| Revise | opus | high | a gap that survived its lens is a judgement about the design, taken against the full reading |

| line | where it came from |
| --- | --- |
| the sources in `parallel`, the synthesis behind a barrier | the reference's own Understand pattern, and the one barrier it calls justified: the reading is a single document and every slice bears on it. The reads themselves share nothing and only read |
| `record` and `code` as the two kinds | a document says what it says and the read is extraction; code has to be inferred from, and what it leaves unsaid is what step 1 turns into a decision. One prompt for both kinds asks the document reader for absences it cannot have and lets the code reader answer as if the code were a document |
| `An absence is a finding here, not a gap in your reading` | an agent told to report what a source says treats what it does not say as its own failure and hunts harder instead of reporting. The code reader's whole value is the second list |
| `every decision it records with what that decision rejected` | the same rule the peers are asked under, applied to the ADRs directly: without the rejected half the option gets re-proposed at build time and ruled out a second time |
| `Two sources that disagree are a decision, not a merge` | the synthesis stage is the one place two artifacts meet, and a model handed both will reconcile them into prose that sounds settled. A lexicon and an ADR that disagree about a name is exactly what step 3 exists to put to me |
| the three critique lenses | coverage (a source nobody read, a claim with no source), absence (step 1's own line, turned on the reading itself), criteria (a check that could not fail). A reading is wrong in three unrelated ways, and one critic asked for all three returns the easiest |
| `a name that says how instead of what` | my global rule, inside the absence lens. Step 3 already says names are up for debate; naming the test in the lens is what surfaces the candidates in time for that conversation |
| one revision round, not a loop | the lenses read a document they have already seen; a second round grades the revision rather than the reading. The gaps that survive belong in step 3's questions, where I answer them |
| `A gap you judge wrong stays open and its entry says why` | the fix stage's rule in the build workflow, for the same reason: the reviser is the critic's peer, and a gap argued down is a better reading than a gap papered over |
| Read on sonnet, Synthesize on opus | the reads are bounded — one source, one prompt, one shape of answer. The synthesis holds every slice at once and everything after step 1 is built on what it writes, including the criteria the build workflow turns into behaviors |

## The build workflow

`workflows/build-behaviors.js` at the plugin root is step 4's script. The
loop is control flow — red, green, reviewed, committed, once per behavior —
so the script holds it and the model stops re-deciding it every round.

Its default tiers, which a behavior or `args.models` overrides:

| stage | model | effort | why |
| --- | --- | --- | --- |
| Red | opus | high | the test is the behavior's contract — its name, its boundary, its assertion. Wrong here and green is wrong quietly |
| Green | sonnet | medium | the change the red test already specified, bounded and checked by that test |
| Review | sonnet ×3 | high | three lenses over a small diff see more than one reader does, at a third of the weight each |
| Fix | opus | high | a finding that survived its lens is where judgement is owed, and this is the only stage that edits reviewed code |
| Commit | haiku | low | a message, from a diff |

| line | where it came from |
| --- | --- |
| behaviors in sequence, `for` over `pipeline` | the authoring reference defaults to `pipeline`, and it is wrong here: every loop ends in a commit to one working tree, and behavior *n* is usually the code behavior *n+1* builds on. Parallel loops would race on the index and interleave the history |
| the review lenses in `parallel` | the one stage that only reads. Three lenses over one small diff cost what one reader costs, and the reference's perspective-diverse rule says a finding that can fail in several ways needs a reader per way |
| `correctness`, `design`, `security` as the three | the two reviews step 6 runs, plus the structural read that `software-design:design-philosophy` owns and neither `/code-review` nor `/security-review` is asked for. A loop-level lens is cheaper than the same finding surviving to the final cycle |
| no `isolation` | the loops share the branch's working tree deliberately: a worktree per agent would strand each commit on a tree that is thrown away |
| the model per stage | asked for: "smart model allocation, not blatantly defaulted to the main session's model". The reference says to inherit unless a tier is clearly right, and in this loop each stage is a different job — see the table above |
| Red on opus, Green on sonnet | the test is where the behavior gets its contract: its name, its boundary, its assertion. Wrong there and green is wrong quietly, which is the one failure the loop cannot catch. Green is the change that test already specified, and the test is the check on it |
| Fix on opus | a finding that survived its lens is where judgement is owed, and it is the only stage that edits code a reviewer already read |
| Commit on haiku | a message, from a diff |
| `unread` from position, not from the returned `source` | a Fable review predicted it and the probe run had already done it: an agent told to read "the skill at skills/implement-design/SKILL.md" returns `source: '/home/user/build-design/skills/implement-design/SKILL.md'`. The name in `args` is what I called the thing; the string in the slice is what the agent called it, and they match by luck. `parallel` preserves input order, so position is the identity and the echoed name is only a label. Missed on the first read of that run, which reported two read sources as unread and had the synthesis invent a list |
| the green and commit gates | the same review: `green` returned only its decisions and `commit` returned nothing, so a suite that never went green went on to be reviewed and committed red, and a commit a hook refused left its slice loose in the tree for the next loop to swallow. Both stages report now, and both stop the run — "one loop, one commit" is checked rather than asserted |
| `git add -A` in green, `git diff --cached` in the lenses | the lenses read "the uncommitted diff", and `git diff` does not show an untracked file. The new test is untracked by construction, so the three reviewers saw the change and not the contract it was written against — the correctness lens reading a diff with its test missing |
| stopping when the test never goes red | a test that passes on its first run says the behavior already exists or the test misses it, and either way the rest of the loops are built on a check that proves nothing. The reference's no-silent-caps rule makes the stop a `log` line naming how many behaviors went unbuilt |
| `A finding you judge wrong stays unfixed and comes back with the reason` | the same rule step 4 has for a design decision the code refuses, at the scale of one loop: the fix stage is the reviewer's peer, not its clerk |

## The writing pass

The skill was run through `mattpocock/skills`' `writing-for-agents` once
written, as `CLAUDE.md` asks. It cut four things and moved one:

- "is one of those decisions, not a finding": the negation. The positive
  alone says it.
- "Then the code it touches", after the ticket's links: the step's lead
  already says the code, and the sentence restated it.
- "the design interview, usually", describing the peers: the question the
  next sentence asks is already written for the design, and a peer that is
  something else gets asked the same thing.
- "before building" said twice in step 3: once as the criterion, "Build
  when I have answered".
- The ticket without acceptance criteria was first a clause in step 4, and
  moved to step 1, where the reading it belongs to is defined.

Three things it flagged stood, with their reason. Two of them are gone
since, both with the peers-as-argument:

- `$ARGUMENTS` substituted into the middle of a sentence reads oddly once
  expanded, "Every `@name` in `#12 @design` is a session". It stood because
  the alternative lost the peers, and went with the peers-as-argument. The
  placeholder came back on its own in `Let's build`, where it is the whole
  ticket and reads as one.
- The `design-philosophy` pointer, on a skill whose description would
  trigger on its own: the table's row. One line against a coin flip.
- "Say who you asked", which describes what the model would report anyway
  when it sends a message: it did not, reliably, when the send was one tool
  call among the reads of step 1. Retired since, by the step that asks me
  who the peers are.

The loop and the workflow went through it as a second pass. It took three
things out of step 4:

- "watched failing for the reason you expect ... the code that passes it"
  became "red ... green", the pass's own leading-word example. Two
  pretrained words where a clause had been, and a binary state the model can
  report rather than a judgement it has to make.
- "code no test drove, or a test you never watched fail, means the loop was
  skipped": the negation, and the elephant with it. "One loop, one commit"
  is the same rule stated positively, so the batch is never spoken.
- "then ... then ... then", the third time: the semicolons already order the
  loop.

And it decided where the scripts live. Forty lines of schema and prompt
inside `SKILL.md` would bury the steps around them — the ladder's
disclosed-reference rung, and the one rung that costs nothing here, since
every run reads the file anyway when it reaches the step.

The plan gate was written against an assumption, and the assumption has
been run. `the-reading` executes inside plan mode: the `Workflow` call is
accepted there, and the whole script completed — two sources read in
parallel, synthesis, three critique lenses, revise — as 7 agents with no
errors, the read agents using `Read` and `Bash` and every one of them
returning a schema-valid object. Run `wf_63a72e15-eba`, 306 seconds on
haiku throughout. Plan mode's own rule is read-only except the plan file,
which is why the order is what it is: `the-reading` only reads, so it
belongs before approval, and `build-behaviors` writes, so it belongs
after.

The allocation lines went through it as a third pass, which cut two things
from one paragraph: "Two rules follow", a signpost for two sentences already
in view, and the "And allocate:" that opened the second, restating a verb the
paragraph's first sentence had already spent.

The reading workflow went through it too, and moved one line: the
authorization to call `Workflow`, written into step 4 and then into step 1
as well. One permission stated twice is duplication, and it now sits once
above the run, where both steps are in view.

The two pointers into the design plugin are namespaced, `software-design:adr`
and `software-design:design-philosophy`, since a pointer reaches its target by
the name the harness lists. This marketplace pulls the plugin in under
`software-design` because its own name, `design`, is also the name of an
Anthropic skill, and a pointer that says `design` reaches whichever answers
first.

Each pointer names the other install too — `design:adr`, `design:design-philosophy`
— because the rename is this marketplace's and the upstream plugin lists
under its own name. A Fable review found it on a machine with the upstream
install, where both pointers resolve to nothing; the miss is silent, and what
follows it is an ADR in whatever format the model invents. The skill costs a
clause per pointer and works either way.

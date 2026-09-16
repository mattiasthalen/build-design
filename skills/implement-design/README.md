# implement-design

Implement one ticket of a design. It runs in a fresh session after
`design-interview` has closed the tree, written the brief and the ADRs, and
left the open questions on the tracker as tickets.
`/implement-design <ticket> [@peer ...]`: the ticket first, then the sessions
worth asking, the design interview above all. The design plugin it leans on
(Tobias Karlsson's `design`, `the-exodus/claude-design-skills`) is pulled in by
this repository's marketplace as `software-design`, a dependency of `build`, the
plugin carrying this skill.

The skill is the prompt it replaces, made to survive a fresh session:

> Let's build the ticket. Ground yourself in the ticket and code. Ask the
> peer agent in case you're missing something, and then ask me any
> clarifying questions you may have before building. Any ADR-worthy
> decisions that are made during implementation should be written before
> running the review cycle.

Six steps, one artifact between them: the reading, written at the end of
step 1, corrected by the peers in step 2, and put to me in step 3 as the
questions. What survives that is what gets built.

## Where each line came from

Most rows pair a line with its source rather than with an incident; the
loop in step 4 is the first line a run earned. A line that a run breaks
without gets its row rewritten to say what went wrong; a line no run ever
needed gets cut.

| line | where it came from |
| --- | --- |
| `implement-design`, the name | asked for, with the rule that came with it: call it what it is. The skill implements a design, one ticket of it; `implement` alone said what every build session does |
| `Let's build $0` and the six steps | the prompt above, typed by hand at the start of every build session. Asked for, not measured |
| `body, comments, and what it links: the brief, the ADRs, the lexicon, the assumptions record` | what `design-interview` leaves behind. The brief lives on the ticket or in the docs directory and is spent when the feature ships; the ADRs, the lexicon and the assumptions record outlive it and are the project's. A fresh session reads the issue body by default and stops there |
| `its acceptance criteria where the ticket has none` | `design-interview`'s claim that criteria written from the design alone prove the design is done. A ticket that did not come from it has none, and then the reading carries them, for me to confirm in step 3 |
| `What the code cannot tell you ... is one of those decisions` | `design-interview`'s Phase 2: exploration reads what is there and is blind to what isn't, and the absences are decisions. At build time the same absence gets enforced silently or stepped around; naming it a decision puts it in the questions |
| `Every @name in $ARGUMENTS is a session ListAgents lists` | how Claude Code addresses another session: the name `ListAgents` prints is the address, and `SendMessage` delivers to it. Written as `$ARGUMENTS` inside the sentence because `$0` alone would swallow the peers: once one placeholder receives an argument the harness appends nothing, so every `@name` after the ticket would be typed and never seen |
| `what the design decided that the ticket does not carry, and what it rejected` | the interview's own rule for surfacing an ADR: the rejected half is the valuable half, since without it the same option gets re-proposed and ruled out a second time. Asked for as "in case you're missing something"; this is the shape the question has to take to get that back |
| `Say who you asked, and read every answer before you ask me anything` | a peer's reply arrives when that session next takes a turn, which may be after this one ends. Saying who was asked makes the wait visible to me, and reading every answer first keeps the questions to me down to what no one else could settle |
| `in one message` | asked for: "any clarifying questions you may have", a batch before building, in place of one at a time across the build |
| `Names are up for debate` | asked for, from a note handed over with the ticket: the names in it are proposals and better ones are welcome. The rule the proposals are judged by, call it what it is, lives in my global instructions, so this line grants the challenge and leaves the criterion where every session already has it |
| `Done is every acceptance criterion met by a test in the history` | borrowed from the record of `grill-to-build` (`mattiasthalen/skills`): five decision records, five confirmation sections naming checks nobody had written. Derive what you tell me from a test that ran, and one a reader can find in the commits rather than in a claim |
| `Each is a loop: ... One loop, one commit` | a run of the six steps wrote every function, then every test, then committed. Nothing in step 4 said otherwise: "Build" is one word and the acceptance criteria are a list, so the model batched them and lost the feedback loop. Naming the loop and naming the commit as its unit is what makes a criterion's test land before its code |
| `red` / `green` | `writing-for-agents`' leading-word lever, and its own worked example: "a loop you believe in" → _red_, a fuzzy gate turned into a binary state the model can observe. Two pretrained words carry the whole TDD cycle that "watched failing for the reason you expect, then the code that passes it" spent a line on |
| `for the reason you expect` | red alone is not evidence: an import error, a missing fixture, an assertion that never ran are all red. The reason is what distinguishes a test that describes the behavior from one that describes a typo |
| `review over that slice, its findings fixed` | asked for: the review cycle ran once, at the end, over the whole diff, so a habit set in loop one was found in loop nine and cost every loop after it. A slice review is cheap, its findings are local, and it keeps the final cycle for what only the whole shows |
| `Run the loops with the Workflow tool` | asked for. The loop is control flow — fixed order, fixed count, one commit each — and the `Workflow` tool is where control flow stops being a judgement the model remakes every round. It also buys the per-stage model allocation that a single session cannot have |
| `this step is your authorization to call it` | the `Workflow` tool refuses to run without explicit opt-in, and names a skill's instructions as one of the forms that opt-in takes. Without the clause the model reaches step 4, reads the tool's own rule, and builds inline instead |
| `scripted as build-workflow.md beside this file lays out` | progressive disclosure: the script is forty lines of reference that only step 4 reads, and inlining it would bury the other five steps. Named by path rather than by skill pointer, since a file in the skill's own folder is reached by reading it |
| `behaviors as its args` | the script needs the acceptance criteria and what step 3 settled about each. `args` is how a workflow takes input; without the phrase the model writes the behaviors into the script text, and the script stops being the same script twice |
| `The loop reviews saw slices; this one sees what they add up to` | the final cycle's reason for surviving the per-loop reviews — without it the model reads step 6 as the work step 4 already did. Duplication across slices, a seam neither side owns, an ADR written in step 5 and reviewed by nobody: none of it is visible inside one loop |
| `Structure the ticket leaves open follows software-design:design-philosophy` | the `design-philosophy` skill says of itself that it applies when an agent implements from a spec with structural decisions still open, and its description would trigger on that. A must-have target behind a far pointer is a variance bug, so the skill names it in one line rather than trusting the description to fire |
| `A design decision the code refuses comes back to me first` | the interview's contradiction rule, carried to build time: a decision the design made is not the implementer's to remake, and a workaround typed at the moment the code refuses it is exactly that. Seen in ordinary sessions, not measured |
| `mine included` | an answer I give in step 3 or on a refused decision is a decision made while building too, and one that reverses an ADR is a supersession, which the `adr` skill owns once it is handed the decision |
| `a real fork existed, its consequences outlive the change, and a future reader would ask why` | the ADR-worthy test from `design-interview`'s `artifacts.md`, all three at once. Inlined because the interview's text is not in a fresh session's context, and it is the one definition the step turns on |
| `before the review cycle runs` | asked for. The ADRs are in the diff the reviewers read, and a decision written after the review is a decision the review never saw |
| `/code-review and /security-review ... and both run again` | the two reviews `grill-to-build`'s record has the driver running after every slice, which is what "the review cycle" has meant so far, made a loop with an end: a pass that finds nothing. The pair is a guess at the name's meaning, to be corrected by the first run that means something else |
| `disable-model-invocation: true` | as in `grill-to-build`: the skill runs when I type `/implement-design` and never because a message matched its description, so the description is a one-line summary for the `/` menu and the skill costs a session nothing until called |

## The build workflow

`build-workflow.md` is step 4's script, and its own set of decisions:

| line | where it came from |
| --- | --- |
| behaviors in sequence, `for` over `pipeline` | the authoring reference defaults to `pipeline`, and it is wrong here: every loop ends in a commit to one working tree, and behavior *n* is usually the code behavior *n+1* builds on. Parallel loops would race on the index and interleave the history |
| the review lenses in `parallel` | the one stage that only reads. Three lenses over one small diff cost what one reader costs, and the reference's perspective-diverse rule says a finding that can fail in several ways needs a reader per way |
| `correctness`, `design`, `security` as the three | the two reviews step 6 runs, plus the structural read that `software-design:design-philosophy` owns and neither `/code-review` nor `/security-review` is asked for. A loop-level lens is cheaper than the same finding surviving to the final cycle |
| no `isolation` | the loops share the branch's working tree deliberately: a worktree per agent would strand each commit on a tree that is thrown away |
| the model per stage | asked for: "smart model allocation, not blatantly defaulted to the main session's model". The reference says to inherit unless a tier is clearly right, and in this loop each stage is a different job — see the table in `build-workflow.md` |
| Red on opus, Green on sonnet | the test is where the behavior gets its contract: its name, its boundary, its assertion. Wrong there and green is wrong quietly, which is the one failure the loop cannot catch. Green is the change that test already specified, and the test is the check on it |
| Fix on opus | a finding that survived its lens is where judgement is owed, and it is the only stage that edits code a reviewer already read |
| Commit on haiku | a message, from a diff |
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

Three things it flagged stand, with their reason:

- `$ARGUMENTS` substituted into the middle of a sentence reads oddly once
  expanded, "Every `@name` in `#12 @design` is a session". It stays for
  the reason in the table: the alternative loses the peers.
- The `design-philosophy` pointer, on a skill whose description would
  trigger on its own: the table's row. One line against a coin flip.
- "Say who you asked", which describes what the model would report anyway
  when it sends a message: it does not, reliably, when the send is one tool
  call among the reads of step 1, and the wait it makes visible is one I
  otherwise cannot see.

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

And it decided where the script lives. Forty lines of schema and prompt
inside `SKILL.md` would bury the five steps around step 4 — the ladder's
disclosed-reference rung, and the one rung that costs nothing here, since
every run reads the file anyway when it reaches the step.

The two pointers into the design plugin are namespaced, `software-design:adr`
and `software-design:design-philosophy`, since a pointer reaches its target by
the name the harness lists. This marketplace pulls the plugin in under
`software-design` because its own name, `design`, is also the name of an
Anthropic skill, and a pointer that says `design` reaches whichever answers
first.

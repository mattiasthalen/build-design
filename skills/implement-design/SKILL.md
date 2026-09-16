---
name: "implement-design"
description: "Implement one ticket of a design."
argument-hint: "<ticket>"
disable-model-invocation: true
---

Let's build $ARGUMENTS.

Steps 1 and 4 run as workflows this plugin ships, called by name and
never read: `workflows.md` beside this file is their contract. This skill
is your authorization to call the `Workflow` tool.

You plan, allocate and ask; the workflows read, build and review. Keep
what a workflow returns — the reading, the rows — and leave how it got
there in the run: a source's text, a slice's diff, a review's body. Each
workflow's default tiers are in `workflows.md`, and a source or a
behavior you can see is subtler or flatter than its kind travels in
`args` with the tier you give it.

Steps 1 to 3 are plan mode: `EnterPlanMode` first. The plan file is
where the run becomes reviewable — the reading, the behaviors in build
order, and the tier each stage will run on — and `ExitPlanMode` is where
I approve it. Step 4 starts on that approval.

## The run
1. **Ground yourself in the ticket and the code.** Read the ticket
   yourself, body and comments: what it links — the brief, the ADRs,
   the lexicon, the assumptions record — and the code they name are
   the sources. Read those with the `the-reading` workflow, the sources
   as its `args`. It returns your reading: what you will build, its
   acceptance criteria where the ticket has none, and every decision
   the ticket leaves to you. What the code cannot tell you — an
   invariant enforced nowhere, a concept with two shapes and no
   authority — is one of those decisions.
2. **Ask me who the peers are.** `ListAgents` prints the live sessions.
   Show me that list, name the ones that look like this ticket's design
   and say what makes each look that way, and ask which to ask. Send
   each of those your reading, and ask what the design decided that the
   ticket does not carry and what it rejected. Read every answer before
   you ask me anything else. A peer that has not answered by the time
   the questions are ready goes into them as an outstanding wait, not as
   a wait you hold; a peer I name that nothing answers to is a gap you
   tell me about.
3. **Ask me the clarifying questions**, in one message: every decision
   still yours after the ticket, the docs and the peers. Names are up
   for debate — one that does not say what the thing is comes back with
   the one that does. Then write the plan and put it to me with
   `ExitPlanMode`.
4. **Build the plan, one behavior at a time.** Each is a loop: the test
   first, red for the reason you expect; the code that turns it green;
   review over that slice, its findings fixed; the commit. One loop, one
   commit. Run the loops with the `build-behaviors` workflow, the plan's
   behaviors and their tiers as its `args`; it returns the test that met
   each criterion, what its review fixed, and the forks its loops took.
   Done is every acceptance criterion met by a test in the history. A run
   that stops is a finding about the plan, not a hiccup: tell me what was
   built, what stopped it, and what is left, and let me decide. Nothing
   resumes on its own.
   Structure the ticket leaves open follows
   `software-design:design-philosophy`, or `design:design-philosophy`
   where that plugin was installed under its own name. A design decision
   the code refuses is a fork the loop reports rather than one it takes
   quietly, and it comes to me before anything is recorded.
5. **Record the decisions.** A decision made while building, mine and
   the loops' included, is ADR-worthy when a real fork existed, its
   consequences outlive the change, and a future reader would ask why.
   Put every candidate to the peers the moment step 4 returns — did the
   design settle this, and does an ADR already carry it. `ListAgents`
   first: a peer that answered in step 2 and is no longer listed is one
   you name to me, not one you wait on. Then write with the
   `software-design:adr` skill — `design:adr` where that plugin was
   installed under its own name — before the review cycle runs. A new
   ADR goes in on the answers you have by then; a supersession waits for
   its peer, since it edits an ADR someone else wrote. A candidate still
   waiting when the cycle ends is one you name to me.
6. **Review the whole.** The loop reviews saw slices; this one sees what
   they add up to. The loops committed, so the change is the diff since
   this branch left its base and never the working tree: name that base
   to `/code-review` and `/security-review`, fix what they find, and run
   both again; a pass that finds nothing ends it. The ADRs and these
   fixes are commits of their own. Then tell me: each criterion and the
   test that met it, the ADRs written, what the reviews found, and every
   tier the plan moved off its default, with what in the source or the
   behavior moved it.

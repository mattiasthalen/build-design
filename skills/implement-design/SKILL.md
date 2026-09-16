---
name: "implement-design"
description: "Implement one ticket of a design."
argument-hint: "<ticket>"
disable-model-invocation: true
---

Let's build $0.

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
   you ask me anything else. A peer I name that nothing answers to is a
   gap you tell me about.
3. **Ask me the clarifying questions**, in one `AskUserQuestion`: every
   decision still yours after the ticket, the docs and the peers. Names
   are up for debate — one that does not say what the thing is comes
   back with the one that does. Then write the plan and put it to me
   with `ExitPlanMode`.
4. **Build the plan, one behavior at a time.** Each is a loop: the test
   first, red for the reason you expect; the code that turns it green;
   review over that slice, its findings fixed; the commit. One loop, one
   commit. Run the loops with the `build-behaviors` workflow, the plan's
   behaviors and their tiers as its `args`. Done is every acceptance
   criterion met by a test in the history. Structure the ticket leaves
   open follows `software-design:design-philosophy`. A design decision
   the code refuses comes back to me first.
5. **Record the decisions.** A decision made while building, mine
   included, is ADR-worthy when a real fork existed, its consequences
   outlive the change, and a future reader would ask why. Write it
   with the `software-design:adr` skill before the review cycle runs.
6. **Review the whole.** The loop reviews saw slices; this one sees what
   they add up to. The review cycle is `/code-review` and
   `/security-review` over the full diff, their findings fixed, and both
   run again; a pass that finds nothing ends it. Then tell me: each
   criterion and the test that met it, the ADRs written, what the
   reviews found, and every tier the plan moved off its default, with
   what in the source or the behavior moved it.

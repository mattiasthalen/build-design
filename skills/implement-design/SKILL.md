---
name: "implement-design"
description: "Implement one ticket of a design."
argument-hint: "<ticket> [@peer ...]"
disable-model-invocation: true
---

Let's build $0.

## The run
1. **Ground yourself in the ticket and the code.** The ticket whole —
   body, comments, and what it links: the brief, the ADRs, the
   lexicon, the assumptions record. Grounding ends in your reading:
   what you will build, its acceptance criteria where the ticket has
   none, and every decision the ticket leaves to you. What the code
   cannot tell you — an invariant enforced nowhere, a concept with two
   shapes and no authority — is one of those decisions.
2. **Ask the peers what you are missing.** Every `@name` in
   `$ARGUMENTS` is a session `ListAgents` lists. Send each your
   reading and ask what the design decided that the ticket does not
   carry, and what it rejected. Say who you asked, and read every
   answer before you ask me anything. A name that is not listed is a
   gap you tell me about.
3. **Ask me the clarifying questions**, in one message: every decision
   still yours after the ticket, the docs and the peers. Names are up
   for debate — one that does not say what the thing is comes back
   with the one that does. Build when I have answered.
4. **Build.** Done is every acceptance criterion met by a check you
   ran. Structure the ticket leaves open follows
   `software-design:design-philosophy`. A design decision the code
   refuses comes back to me first.
5. **Record the decisions.** A decision made while building, mine
   included, is ADR-worthy when a real fork existed, its consequences
   outlive the change, and a future reader would ask why. Write it
   with the `software-design:adr` skill before the review cycle runs.
6. **Review.** The review cycle is `/code-review` and
   `/security-review` over the diff, their findings fixed, and both
   run again; a pass that finds nothing ends it. Then tell me: each
   criterion and the check that met it, the ADRs written, what the
   reviews found.

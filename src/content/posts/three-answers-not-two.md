---
title: 'Three answers, not two: building proof-of-agent-run'
date: '2026-10-18'
excerpt: 'A replay engine for AI agent runs that is allowed to say "I could not check", and why that third answer is the whole design.'
order: 2
---

proof-of-agent-run is a replay engine for AI agent runs. It reads a recorded run, re-derives the steps a machine can re-derive, and reports, step by step, which matched, which diverged, and which it could not check at all. Python, standard library only, no dependencies. It is public at [github.com/dassmod/proof-of-agent-run](https://github.com/dassmod/proof-of-agent-run), and it is the engine under my receptionist agent, [auditable-front-desk](https://github.com/dassmod/auditable-front-desk).

### Why I built it

An agent's report about itself is written by the party whose honesty is in question. I have built a lot of agents for real use, and that question kept coming back and never had a good answer. So I built the smallest honest piece of one: a program that takes the record, re-checks what can be re-checked, and says plainly where that line sits.

The repo stayed private until its README could say what it does not claim. A public repo of working code with no statement of its limits is exactly the misreading this project exists to prevent.

### What it is

A recorded run is a list of steps. Each step has a name, a kind, its inputs and its outputs. The engine re-runs a step only if it is a pure function of its recorded inputs: no clock, no randomness, no network, no filesystem, no global state. That is the whole admission test, and it is why the claim is "replay-faithful" and not "true".

The caller hands the engine a table: each step name maps to the function that re-derives it and to the key where the step records its answer. The engine runs nothing outside the table. The trace never chooses what runs, or which field gets compared, because a trace that picked the field could point the check at one that matches and leave the lying one unread. Nothing here trusts the trace. Every value taken from it is a claim.

For each step the engine gives one of six statuses:

| status | what it means | what it is about |
| --- | --- | --- |
| `match` | re-derived value equals the recorded one | the run |
| `divergence` | re-derived value differs from the recorded one | the run |
| `skipped` | the trace declared the step non-deterministic | the engine's reach |
| `unknown_guard` | the trace named a function this engine does not have | the engine's reach |
| `signature_mismatch` | the engine has the function and cannot call it with what was recorded | the engine's reach |
| `wrong_type` | the call was made, and a recorded value broke it | the engine's reach |

The last four are one category: could not check. They are facts about the engine, never about the run. Most verifiers have two answers. This one has three, and the third is the point. A validator that cannot separate "you lied" from "I could not look" is not a validator. It is a machine that accuses honest agents when its own reach runs out.

There is no overall verdict, on purpose. Collapsing a run to one pass or fail hides which steps were never checked at all.

The spec, `TRACE-FORMAT.md`, was written after the first working code, not before. Every clause in it is something the code needed, so the format is evidence rather than a guess. Its settled clauses and its open ones are both in the document, so a gap is visible where a reader will look.

### What broke, and what each break decided

Almost every rule above came out of something breaking.

**The silent status.** The first evening the engine ran, three bugs sorted themselves by loudness. `step{"name"}` was a SyntaxError and never loaded. `step["nam"]` was a KeyError and died pointing at itself. And `"status": "skipped"`, hardcoded in the final return, never failed at all. It would have made the validator report every honest run and every forged run identically. The output described the observer's state rather than the world's, and nothing would have told me.

**The crash that erased a forgery.** One test run, `run-0005`, records a file path that is the number 5 instead of a string. The function choked on it and the error walked out through every function above it. I moved that run to second place in the list of five test runs, and the three runs after it printed nothing. One of them was a forgery the engine never got to look at. That became a rule in the spec: a crash is not a verdict. One step the engine cannot check must not erase the report for every step it could. The engine now reports `wrong_type` for that step and carries on.

**Limit and defect.** Then the hard question: what deserves a status at all? My words for it in that build hour: a limit faces outward, a defect faces inward. A limit is something the reader of the report needs to hear. A defect is a bug in the engine that no reader should ever see turned into a status. One question separates them: would this still happen if the engine were written perfectly? A trace naming a function nobody wrote, yes, so it is a limit and gets `unknown_guard`. A broken entry in my own table, no, so it is a defect and gets a traceback. A limit is repaired by growing the engine. A defect is repaired by fixing it.

**The width of a try.** I tested that rule by breaking the engine on purpose. I wrapped the function call in a bare `except:` and planted a typo in the function's own body, `norm_path` for `normpath`. The bare `except` caught my `NameError` and reported `wrong_type`, a limit's word, for every run in the test set, honest ones included. Narrowed to `except TypeError`, the planted typo crashes with a traceback, as a defect should. The width of a `try` is a decision about who gets blamed. Even the narrow version is an approximation, and the spec says so: `except TypeError` cannot tell a bad recorded value from an unrelated `TypeError` bug inside a function. Checking the value against the function's type hints before the call would close it; that is named and not built.

**The rename.** A step's input keys are the parameter names of the function that re-derives it, and the engine calls the function with exactly those names. I chose that on purpose, executable over stable: a trace that does not fit its function fails at the moment of the call instead of quietly producing a verdict. The price showed up on a real trace from the clinic agent. I renamed one parameter, `start` to `slot`. The agent kept working, because it calls the function by position. Replay calls it by name and reported `signature_mismatch`. Three stories produce that exact line: the trace was forged, the code was refactored, or an honest rename drifted the two apart. From inside the engine they look identical, so the only sentence it can write truthfully is about itself. `signature_mismatch` names no culprit, on purpose. One test run, `run-0004`, hides a forged `allow` under a renamed key; the engine reports `signature_mismatch` and never reads the lie. Could not check is not a pass.

**The traversal.** The first function in the engine checks that an agent writes only inside allowed folders, by prefix. `workspace/../../etc/passwd` begins with an allowed prefix and lands outside. I wrote a test run that recorded `allow` for it and ran it once against the unfixed function, to watch the validator certify an escape with every step matching and nothing lying. Then the function learned to normalize the path first, with `posixpath` rather than `os.path`, because `os.path` behaves differently on Windows and the host's operating system is exactly the hidden input the admission test forbids. The test run now records `deny`: it matches while the function stays correct, and diverges the day the normalization is removed.

### What it proves

The question it answers: did this record tell the truth about the steps that can be checked? The question it refuses: everything else. It says nothing about the steps it could not check, and it says so out loud.

### What is still open

The open clauses are written into the spec, not hidden. Each step declares its own kind, and the kind is written by the party under suspicion: an agent that marks every step non-deterministic replays perfectly clean and has said nothing. Either the engine decides which steps are checkable, or it reports coverage. Comparison is plain `==`, the strictest possible policy, chosen by nobody; it holds only while functions return short strings. No test run covers the sibling-prefix case, `workspace` without its trailing slash, so nothing here would catch that slash going missing. And a trace that simply leaves a step out replays clean; the clinic agent's forged traces show it, and a check that every booking is preceded by its guard steps is the planned answer.

### Where it is used

For its first weeks the engine only ever checked five test runs I wrote by hand. Now auditable-front-desk installs it, passes its own table, and replays every conversation it records. Its guards, its argument check and its read tool all replay as `match`, and its forged traces show the limits on real runs. The field-level version of the third answer is a Plain Strata episode, "Could Not Check". This repo is where it got into code.

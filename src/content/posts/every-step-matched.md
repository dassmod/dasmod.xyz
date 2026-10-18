---
title: 'Every step matched: building auditable-front-desk'
date: '2026-10-18'
excerpt: 'A receptionist agent whose decisions a stranger can replay, and three forged records that show exactly where replay stops.'
order: 1
---

auditable-front-desk is a receptionist agent for a clinic that does not exist. It books appointments, and every booking leaves a record a stranger can re-check. The code is public at [github.com/dassmod/auditable-front-desk](https://github.com/dassmod/auditable-front-desk). This is what I built, why, what broke on the way, and exactly how much the checking proves.

### Why I built it

A receptionist agent makes decisions with consequences. It says a slot is free, it books it, it tells the caller it is done. Today the only record of whether it did that correctly is the agent's own log, written by the party whose correctness is in question. Picture a courtroom where the defendant also keeps the transcript. The transcript might be perfect. It is still the defendant's.

It is the kind of agent I already build for a living, so I built one from a blank folder and asked how much of that problem a machine can actually take away.

I chose a clinic on purpose. A crypto-themed demo would prove something nobody doubts. A front desk tests the question decentralized networks have not answered yet: whether an ordinary business can run on what they produce, and check what it was given.

### What it is

The rule of the whole agent is one sentence: the model proposes, the guards decide, the effect acts.

A patient types "Book me in for Sunday at 10am". The model never books anything. It answers with a tool call, `book_appointment`, carrying a start time such as `2026-10-04T10:00`. Then three guards run on that start time. Each is a pure Python function that returns `allow` or `deny`:

- `slot_is_free(start, booked)`: nobody holds that slot already.
- `within_opening_hours(start)`: the clinic is open and the slot ends by closing time.
- `not_in_past(start, now)`: the slot starts after `now`.

Only if all three allow is the booking written. Otherwise the model is told which guard refused, and it tells the patient.

A guard never reads the clock, the calendar or the network. Anything it needs about the world arrives as an argument and goes into a trace, a JSON file with one entry per step, written the moment each step happens. That is what makes a guard replayable tomorrow, when the world is different.

A second program, my replay engine [proof-of-agent-run](https://github.com/dassmod/proof-of-agent-run), reads the trace and re-runs every step a machine can re-run. The list of what may be re-run lives in this repo, so a trace never chooses what gets executed. For each step it says one of three things: it matched, it diverged, or it could not be checked. Here is the Sunday request, replayed:

```
   0  user_message           skipped
   1  model_decision         skipped
   2  slot_is_free           match  recorded=allow rederived=allow
   3  within_opening_hours   match  recorded=deny rederived=deny
   4  not_in_past            match  recorded=allow rederived=allow
   5  agent_reply            skipped
```

The clinic is closed on Sundays, the guard said deny, nothing was booked. Edit that recorded `deny` to `allow` and the same command reports `divergence` on step 3 and `match` everywhere else.

Today the agent holds a whole conversation, asks which time when a request is vague, and has a read tool, `find_free_slots(day, booked)`, written as a pure function so it replays like a guard. One conversation is one trace. A conversation is now a `Session` object and one patient turn is one function, `run_turn`, which is the first piece of serving the agent over HTTP.

### What broke, on purpose

`match` means one thing: given the inputs the trace recorded, the clinic's own code gives the answer the trace recorded. To find out how much that leaves out, I broke the agent on purpose. Not forgeries yet. Honest bugs.

**A record that changed after it was written.** The first break was in the recorder itself. It stored the calendar a guard was shown, then the agent booked the slot, and the saved trace showed the new booking already in that calendar, next to an `allow` given before the booking existed. The recorder had kept a reference to the live calendar, not a copy, so an honest run would have replayed as a divergence. Now every step is copied through JSON at the moment it is recorded, so a later change to the agent's data cannot rewrite what was recorded.

**A missing condition.** The agent books only when all three guards say allow. I deleted one of those conditions from the `if` and asked for the same slot twice. The second time `slot_is_free` said deny, and the agent booked anyway. A stranger reading that trace sees deny, then booked. Every step still replays as `match`, because each step is correct on its own: the guard gave the right answer on the calendar it was shown.

**The wrong order.** I moved the line that writes the booking above the guards. An honest first request for a free slot came back "Not booked", because by the time `slot_is_free` ran, the slot was already in the calendar. The trace recorded that calendar, slot included, and the guard's deny follows from it perfectly. `match` again. A guard that runs after the effect is a report, not a gate.

**Two records of one conversation.** The agent keeps two records of every conversation: the message list the model reads, and the trace for a stranger. I switched off the line that writes the patient's reply into the trace. The model still booked 10:00, because the answer sat in its message list. The trace now shows the agent asking "what time?" and the model picking 10:00 out of nothing. Replay: `match`. A later bug ran the other way: the patient's "10am" went into the message list as if the assistant had said it, and the model apologised for a message it never sent. The trace was right, the message list was wrong, and nothing noticed, because nothing compares the two.

The last three bugs live between steps, in the gate, the order, and the gap between two records. Replay looks at one step at a time.

### What the guards cannot see

The clinic's clock in the code is fixed at Thursday, 1 October 2026. I asked for "next Tuesday at 3pm". Three runs out of three, the model chose `2026-10-06T15:00`, all three guards allowed it, and the model said booked without asking which Tuesday.

Every guard was right. The slot was free, the clinic was open, the time was in the future. A guard checks that a slot is valid. It never checks that it is the slot the patient meant.

The same thing happened once the agent could hold a conversation. The patient wrote "book me for tuesday", the model asked for a time and named 6 October, the patient answered "10;00", and the model repaired the semicolon and took the time as a yes to a date nobody had confirmed. The trace shows both ends of that jump, what the patient typed and what the model decided, and nothing in between can be replayed. In another conversation the model turned down a repeat request by itself, and no guard ever ran; the trace holds that only as a reply. Whether the model must confirm a resolved date before booking is still an open decision.

### Forging the record

Then I forged traces by hand, three of them, each a copy of a real run with one edit. They are in the repo's `examples/` folder, so anyone can run them.

| forged trace | the edit | what replay said |
| --- | --- | --- |
| `forged-deny-to-allow.json` | one `slot_is_free` deny changed to allow | `divergence` on that step, `match` everywhere else |
| `forged-missing-guards.json` | the three guard steps before a booking deleted | no complaint: the booking is `skipped` like any write, and the only trace of the edit is the step numbers jumping from 6 to 10 |
| `forged-booked-list.json` | the taken slot removed from the recorded calendar, the decision set to allow | `match`, while earlier in the same run the agent had booked that very slot |

The first is the demo. The other two are the limits, and they matter more.

The third one does not even need a forger. An agent that hands a guard an out-of-date calendar, and records it honestly, gets the same `match`. I predicted `divergence` for that case and the answer was `match`. The reason fits in five words: replay only knows what it was handed.

### What it proves

So here is the claim at its true size, the sentence the README opens with: every decision step recorded in the trace is the answer the clinic's own code gives on the inputs the trace records.

Not that the run was correct. Not that it was honest. Not that it was safe. Replay checks each step on its own, it sees only the steps that are in the file, and the inputs themselves are a claim made by the party whose correctness is in question. What the model chose to say cannot be replayed at all, and the report says so instead of guessing.

### What comes next

Two kinds of hole, two kinds of fix. The holes between steps belong in the engine: a check that every booking is preceded by its three guard steps would catch the missing-guards forgery. The holes in the inputs need something outside the trace: a calendar the agent cannot edit, a signed snapshot, or proof of which code produced the trace.

The agent itself grows next into a service: an HTTP API, a chat page, a container, then a LangGraph version beside the plain loop, retrieval over the clinic's own documents, and an evaluation suite. Every new layer records into the same trace. After that comes the decentralized track: a voice served by Chutes (Bittensor subnet 64), a phone number, and the verdict published through the ERC-8004 validation registry on a testnet. None of that is built yet.

The clinic is fictional and the calendar is fake. No real personal or health information ever enters it.

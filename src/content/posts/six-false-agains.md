---
title: 'Six false Agains: building smart-repetition-agent'
date: '2026-10-18'
excerpt: 'A tutor that reads my notes, asks real questions and proves on chain what was studied, and the bug that made it lie about my memory.'
order: 3
---

smart-repetition-agent is a spaced-repetition tutor. It reads my own notes, asks me real questions about them, and decides its next move from my answer. Each session ends as one rating for the FSRS scheduler, and a signed proof of what was studied goes onto Ethereum's Sepolia testnet. It is public at [github.com/dassmod/smart-repetition-agent](https://github.com/dassmod/smart-repetition-agent).

### Why I built it

Flashcard apps make you write your own cards, quiz surface facts, and mark you wrong the moment you are unsure. And none of them can show that you learned anything.

My learning already lives in notes, and every lesson I write ends with a short list of retrieval prompts. I wanted a tutor that reads the notes I already have, asks at the level my memory has earned, and teaches me when I say "I don't know", instead of just marking me wrong. And I wanted what it records about me to be honest.

### What it is

**It finds material by meaning.** The notes are cut into passages and embedded locally with model2vec, so search works on meaning, not filenames, and needs no API key.

**FSRS decides what is due and how hard.** FSRS models each card's own forgetting curve and schedules it for the moment it is about to slip. The same card gets asked harder as memory strengthens:

| level | memory stability | what the question asks |
| --- | --- | --- |
| 1 | under 5 days | recall from one lesson |
| 2 | 5 to 19 days | why and how |
| 3 | 20 to 59 days | connections across lessons |
| 4 | 60 days and more | synthesis across courses |

**The dialogue decides at runtime.** A LangGraph agent asks one question, grades my real answer with Claude, and picks the next move from what it just read:

| my answer | what happens |
| --- | --- |
| solid | the dialogue ends, recorded at the current level |
| fuzzy, with a level below | it drops one level and asks again on the same lesson |
| fuzzy, already at the floor | it ends, recorded as bottomed out |
| "I don't know", however phrased | it teaches the concept from the ground up until I say I am ready, and records Again |

The same graph runs in a terminal and as a Telegram bot. The bot pauses the dialogue between messages with LangGraph's checkpointer, so a conversation survives a gap of hours, and many people's paused dialogues run side by side.

**The rating is the first attempt, never the retry.** A dialogue that needed an easier retry is still scheduled on its first answer. The first answer is the honest signal of what I knew at the level FSRS believed I was at. The retry helps me leave with something solid; it does not inflate what gets scheduled or proven.

**The proof names the learner, not the machine.** The learners are Telegram users. They hold no keys and pay no gas, so the obvious version, where the agent submits each proof itself and the contract records the sender, collapses every learner onto one address and makes per-learner history meaningless. So the agent is an attestor instead. It signs an EIP-712 attestation naming the learner, and anyone can relay it. The contract recovers the signer, checks it against a list of authorised attestors and credits the named learner. The relayer pays gas and can do nothing else, since editing any field breaks the signature. Each session id works once, so a captured signature cannot be replayed. One honest limit: since Telegram users hold no keys, the learner address is a pseudonym derived from the user id. It separates learners on chain, but nobody holds its private key. Letting a learner link a wallet they control is the next step there.

**The contract tests were tested too.** The `ProofOfKnowledge` contract has 38 Foundry tests and full line coverage. But coverage only proves that lines ran, not that the assertions bite, so I broke the contract five ways on purpose and checked that the tests noticed:

| deliberate break | tests that failed |
| --- | --- |
| remove the attestor check | 5 |
| remove replay protection | 2 |
| remove the signature malleability check | 1 |
| credit the sender instead of the named learner | 6 |
| drop the chain id from the EIP-712 domain | 3 |

One more test pins the EIP-712 encoding against the Python signer. The two are written independently, and a drifting type string would make every signature recover to the wrong address with nothing to say why.

### What broke

**Six false Agains.** In August I moved my lessons to a new folder in my notes and pointed the agent at it. The review then ran end to end, and all six cards it drew came back with empty content, because the stored cards named a course I had deleted. The older review command, from before the agent had a graph, handles a missing lesson file by submitting the rating Again and saving it. So a tooling failure was written down as a memory failure. The summary said "Reviewed: 6" and "Duration: 0.0s". Six cards now carry an Again I never earned. The output described the observer's state, not the world's. It is the same class of bug I met days later in my replay engine, where a hardcoded "skipped" made every run look the same.

**A capital P.** The new card parser looks for the heading `## Retrieval prompts`. I typed it as `## Retrieval Prompts`. It matched nothing and returned zero cards from all 33 files, with no error at all. The fix put both assumptions about the lesson format, the heading and the pattern for a numbered prompt, together as constants at the top of the file, where the next mismatch is easy to see.

**A path that never failed.** The old folder was gone, and the agent still booted. It turned out the course list was a cached copy of an earlier parse, not a pointer to the folder, so nothing ever looked at the dead path. When I rewired it I chose the opposite on purpose: a missing notes folder now crashes loudly instead of returning an empty string.

**What a card is.** The rework gives every retrieval prompt its own card, and a card's identity is a short hash of the prompt's text, because prompts get reordered and not reworded. Every card keeps the path and heading of its source, so a card whose source is gone can retire instead of quizzing dead material.

### The rule underneath

A planned local page for the agent, Strata, is specified in the repo as a geological column of a learning field: ten layers, read from the bottom. Its spec opens with a hard rule. Everything shown describes the material, never the person. No completion percentages, no streaks, no session counts, no red overdue styling, no notifications. "Cards due" is the strongest statement allowed, and it is phrased about the material.

The first-attempt rating, the attestation that names the learner, and the six false Agains are the same idea seen three times. A record should say what actually happened, to the right party, and judge nobody. The Again bug broke that rule by recording a tool's failure as a learner's. The fix is planned for a specific moment: before the first real card is ever saved, because from then on a false Again would be a lie about a card that means something.

### Where it stands

The code stops at a finished card parser. On real notes it gives 10 cards from 2 lesson files, and the other 31 files return nothing and raise nothing. The ids are stable across runs and every card is ready to save as JSON. Nothing is persisted yet. Work here paused in August in favour of the replay engine: the repo's own history showed two months with no commits during my heaviest note-writing months, and tooling had been getting in front of the work it was meant to serve. When it resumes, the next moves are written in its worklog: save the new cards, archive the old deck, and fix the false Again before the first save. Strata is a spec, not yet a page.

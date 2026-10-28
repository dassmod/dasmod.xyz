// Everything on the site that is written by hand lives here.
// Anything that changes by itself (episodes, long-reads, commits) comes from live.json.

// Posts are written and kept in src/content/posts and listed on Writing under Articles.
export const SHOW_POSTS = true;

// Where I am now. The home clock reads this zone.
export const PLACE = { city: 'Bishkek, Kyrgyzstan', zone: 'Asia/Bishkek' };

export const LINKS = {
  email: 'mailto:dasmodubash@gmail.com',
  github: 'https://github.com/dassmod',
  linkedin: 'https://www.linkedin.com/in/dastan-modubash',
  x: 'https://x.com/dassmod',
  plainstrata: 'https://plainstrata.com',
  apple: 'https://podcasts.apple.com/us/podcast/plain-strata/id6783455764',
  newsletter: 'https://buttondown.com/plainstrata',
};

export const DESCRIPTION =
  'Dastan Modubash, solution engineer. I ship AI agents in production and build the tools that make their runs verifiable.';

const external = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

export const STORY = [
  {
    title: 'The studio',
    when: '2018 to 2022',
    html: 'At Tentek, the animation studio I ran for four years, I went digging into web3 to find out what it actually was. What got me was not the tokens. It was verifiable, trustless, communal ownership.',
  },
  {
    title: 'The foundation in my own hands',
    when: '2022 to 2023',
    html: 'So I taught myself Solidity. I wrote small contracts until the thing stopped being abstract, and then I stopped. I wanted to think ideas through and explain them.',
  },
  {
    title: 'The second jolt',
    when: '2024',
    html: 'AI hit the same nerve. Another democratization, this time of the act of building itself. I pointed it at my own life first, then at work, and that turned into Newo.ai.',
  },
  {
    title: 'The thing I could not name',
    when: '2026 to now',
    html: `A hunch that something sat at the intersection of the two. I asked for a course on it, and that course became ${external(LINKS.plainstrata, '<span class="hl">Plain Strata</span>')}, the show I now publish twice a week.`,
  },
];

export const EXPERTISE = [
  ['AI voice agents in production', 'I design, ship and debug voice and chat agents from zero. Intent systems, scenario logic, telephony, multi-language routing.'],
  ['Production integrations', 'Python integrations with booking systems, CRMs and webhooks. The payload and encoding bugs that only appear in production.'],
  ['Incident command', 'Detection, code, deploy, testing, stakeholders and resolution, end to end, including silent failures from an upstream API change.'],
  ['AI tooling for teams', 'An AI-assisted investigation and fix workflow for my team, with one human approval gate, sandboxed test loops and enforced data-safety rules.'],
  ['Contracts and the oracle pattern', 'Solidity and Foundry on testnet. EIP-712 attestations that settle proofs on Sepolia: compute off chain, verify on chain.'],
  ['Explaining hard things', 'A show twice a week that takes one concept down to the ground and builds it back up, for people who are allergic to hype.'],
];

export const BACKGROUND = [
  { title: 'Middle East Technical University', when: '2018', text: "Bachelor of Arts in City and Regional Planning, Faculty of Architecture, Ankara." },
  { title: 'University of Manchester', when: '2014 to 2015', text: 'Erasmus exchange programme.' },
  { title: 'Languages', when: '', text: 'Kyrgyz is my native language. Russian and English at C2, and English is the language I work in. Turkish at C1.' },
  { title: 'Based in', when: 'UTC+6', text: 'Bishkek, Kyrgyzstan, at the moment. Remote, and used to working across time zones.' },
];

export const WORK = [
  {
    company: 'Newo.ai',
    href: 'https://newo.ai',
    dates: 'Dec 2025 - current',
    roles: ['Solution Engineer'],
    live: true,
    text: [
      'I build and run AI voice agents on an AI voice agent platform, and the booking integrations behind them. I owned the dental vertical for seven months, write code on the core platform, and run incidents end to end.',
      'I built an AI-assisted investigation and fix workflow for my team, and was acting team lead for a stretch.',
    ],
  },
  {
    company: 'Irbis HVAC',
    dates: 'May 2025 - Dec 2025',
    roles: ['AI Integration and', 'Automation Specialist'],
    text: [
      'I built one communications pipeline across eleven lead sources: intake, routing, AI attribution, automated follow-up and an after-hours voice line.',
      'I led the AI rollout across the business and migrated the website with a zero-downtime cutover.',
    ],
  },
  {
    company: 'Independent',
    dates: 'Nov 2024 - current',
    roles: ['AI Automation Consulting'],
    text: [
      'Business process automation for small and mid-sized companies. A multilingual medical booking agent on Telegram, and AI workflows in n8n and Make.',
    ],
  },
  {
    company: 'Tentek Animation Studio',
    dates: 'Sept 2018 - Dec 2022',
    roles: ['Co-founder and', 'General Director'],
    text: [
      'I founded and ran an animation studio for four years, weighted toward sales. A team of fifteen to twenty across more than forty productions.',
      'We raised funding for an original feature and produced a history course now used in schools nationwide.',
    ],
  },
];

export const PROJECTS = [
  {
    title: 'auditable-front-desk',
    repo: 'auditable-front-desk',
    href: 'https://github.com/dassmod/auditable-front-desk',
    status: 'public',
    live: true,
    text: 'A receptionist agent for a fictional clinic, where every booking leaves a record a stranger can re-check. The model proposes, plain-code guards decide, and every decision is replayed afterwards. It runs as a text agent; an HTTP API, retrieval over the clinic\'s rules and a scored test set come next, then a voice.',
  },
  {
    title: 'proof-of-agent-run',
    repo: 'proof-of-agent-run',
    href: 'https://github.com/dassmod/proof-of-agent-run',
    status: 'public',
    text: 'The replay engine under auditable-front-desk. It re-derives the steps a machine can re-derive and reports match, divergence, or could not check. The third outcome is the point: a validator that cannot tell a lie from a blind spot is not a validator.',
  },
  {
    title: 'smart-repetition-agent',
    repo: 'smart-repetition-agent',
    href: 'https://github.com/dassmod/smart-repetition-agent',
    status: 'public',
    text: 'A tutor that reads my notes, asks real questions, adapts at runtime, and settles a signed proof of what I studied on Ethereum Sepolia. Compute off chain, verify on chain.',
  },
  {
    title: 'Agent companions',
    status: 'private, daily',
    text: 'Seven agent systems that run my days, each shaped around me rather than an average user. Built on the Claude Agent SDK, with scheduled tasks and sub-agents.',
  },
];

export const LEARNING = [
  ['Inference on Bittensor', 'The model, speech and translation calls moved onto subnets such as Chutes and Vocence, and what that costs in latency next to a centralized stack.'],
  ['ERC-8004 validation', "The agent's identity and a replay verdict written to the registries on a testnet, so anyone can read the verdict without trusting my server."],
  ['Attestation', 'What hardware can vouch for: running the agent inside a confidential machine, and carrying the signed proof of which code ran.'],
];

export const STACK = [
  ['Python', 'https://www.python.org', 'My default for everything that has to run in production: integrations, agents, automation and the build scripts around them. I write it by hand, from an empty file.'],
  ['Claude API and Agent SDK', 'https://docs.claude.com', 'Skills, scheduled tasks and sub-agent orchestration. The layer most of my agent systems stand on.'],
  ['LangGraph', 'https://langchain-ai.github.io/langgraph/', 'For agents that have to pause for hours between turns and pick up exactly where they stopped.'],
  ['LLM APIs and tool calling', 'https://platform.openai.com/docs/guides/function-calling', 'OpenAI-compatible chat APIs with tool calls, read as plain JSON so every call can be traced and replayed.'],
  ['FastAPI and Docker', 'https://fastapi.tiangolo.com', 'An agent served over HTTP like any other service: typed requests and replies, sessions, and a container around the whole thing.'],
  ['Retrieval', 'https://en.wikipedia.org/wiki/Retrieval-augmented_generation', "RAG over a business's own rules, and the judgment of when retrieval beats putting everything into the prompt."],
  ['Evals', 'https://platform.claude.com/docs/en/test-and-evaluate/develop-tests', 'A test set of conversations scored for right bookings and right refusals, with every run traced.'],
  ['Solidity and Foundry', 'https://getfoundry.sh', 'Contracts and their tests, on testnet. Where the oracle pattern gets written down as code.'],
  ['Twilio and WebRTC', 'https://www.twilio.com', 'The telephony underneath voice agents: numbers, routing, voicemail detection and the quirks of real calls.'],
  ['Pipecat', 'https://github.com/pipecat-ai/pipecat', 'The voice body around an agent: speech in, speech out, turn-taking and interruptions, with the delay measured per stage.'],
  ['web3.py', 'https://web3py.readthedocs.io', 'How my Python agents reach the chain: signing attestations, submitting them, and reading the result back.'],
  ['proof-of-agent-run', 'https://github.com/dassmod/proof-of-agent-run', "My own replay engine and trace format: what a machine can honestly re-derive about another machine's run."],
];

/**
 * Single source of truth for Aryan's portfolio content.
 * Consumed by the UI, the role-fit matcher, the dev terminal and the
 * offline copilot brain so every surface stays factually consistent.
 */

export const PROFILE = {
  name: 'Aryan Chandra',
  shortName: 'ARYAN',
  title: 'Software Engineer',
  roles: ['Backend Engineer', 'Full-Stack Engineer', 'AI Systems Engineer', 'Mobile Engineer'],
  location: 'Delhi NCR, India',
  relocation: 'Open to Remote & Relocation',
  availability: 'Immediate joiner — SDE-1 / SWE-1',
  email: 'aryanchandra3456@gmail.com',
  phone: '+91 92057 23006',
  phoneRaw: '+919205723006',
  github: 'https://github.com/TheAryanchandra',
  linkedin: 'https://www.linkedin.com/in/thearyanchandra/',
  resume: 'https://drive.google.com/file/d/1fnwhYzbHkrANYvNCtQWQndm9WKlAl2QD/view?usp=sharing',
  education: 'B.Tech, Software Engineering',
  tagline:
    'I build distributed backends, agentic AI systems and mobile products that real people use — 10,000+ installs, 50K+ daily transactions, 99.9% uptime.',
};

export const METRICS = [
  { value: 10000, suffix: '+', label: 'Play Store installs', hint: 'Fonofy Partners · 4.8★' },
  { value: 50000, suffix: '+', label: 'Daily transactions', hint: 'GiantCell commerce' },
  { value: 99.9, suffix: '%', label: 'Uptime SLA', hint: '24 months in prod', decimals: 1 },
  { value: 200, prefix: '<', suffix: 'ms', label: 'P95 latency', hint: 'RAG retrieval' },
  { value: 420, suffix: '+', label: 'DSA problems', hint: 'LeetCode + SDE sheet' },
];

export interface Experience {
  org: string;
  role: string;
  kind: string;
  summary: string;
  points: string[];
  stack: string[];
}

export const EXPERIENCE: Experience[] = [
  {
    org: 'Ta Rule Technology Pvt. Ltd.',
    role: 'Software Engineer',
    kind: 'Full-time · Production',
    summary: 'Full-stack, backend, Java & mobile systems for commerce and healthcare products.',
    points: [
      'Architected GiantCell healthcare commerce: 150+ REST APIs serving 50,000+ daily transactions.',
      'Held a 99.9% uptime SLA for 24 continuous months in production.',
      'Integrated Razorpay & Paytm payments with real-time inventory synchronisation.',
      'Shipped React Native apps to the Play Store & App Store — 10,000+ installs on Fonofy Partners.',
    ],
    stack: ['Java', 'Spring Boot', 'Node.js', 'React Native', 'MySQL', 'Redis', 'Docker'],
  },
  {
    org: 'Indian Oil Corporation Ltd. (IOCL)',
    role: 'Software Engineer Intern',
    kind: 'Internship · Enterprise',
    summary: 'ML inference & forecasting for industrial fuel supply.',
    points: [
      'Built automated telemetry pipelines for fuel-supply monitoring.',
      'Developed time-series ML inference for forecasting and inventory anomaly detection.',
    ],
    stack: ['Python', 'Time-Series ML', 'Data Pipelines', 'Telemetry'],
  },
  {
    org: 'B.Tech — Software Engineering',
    role: 'Education',
    kind: 'Foundations',
    summary: 'Strong CS fundamentals: data structures, algorithms, OS, DBMS, networks.',
    points: ['420+ DSA problems solved across LeetCode and the Striver SDE sheet.'],
    stack: ['DSA', 'System Design', 'OOP', 'DBMS'],
  },
];

export interface Project {
  id: string;
  title: string;
  kicker: string;
  oneLiner: string;
  problem: string;
  approach: string[];
  impact: string[];
  stack: string[];
  href: string;
  accent: string;
  award?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'rag',
    title: 'Enterprise RAG Knowledge Copilot',
    kicker: 'Distributed Backend · Enterprise AI',
    oneLiner: 'Hybrid-search knowledge platform on Java 21 virtual threads with sub-200ms P95.',
    problem:
      'Enterprise teams needed grounded answers over scattered documents — fast, secure and access-controlled, without blocking ingestion when traffic spikes.',
    approach: [
      'Java 21 virtual threads + Spring Boot 3 for high-concurrency request handling.',
      'JWT-secured RBAC API gateway so retrieval respects document permissions.',
      'Event-driven Kafka ingestion decouples document parsing/embedding from query traffic.',
      'Qdrant hybrid retrieval: dense HNSW vectors + BM25 lexical scoring, fused and re-ranked.',
      'Redis caching for hot queries; PostgreSQL for metadata; Dockerised services.',
    ],
    impact: ['Sub-200ms P95 retrieval latency', 'Ingestion isolated from query path', 'Permission-aware answers'],
    stack: ['Java 21', 'Spring Boot 3', 'Spring AI', 'Kafka', 'Qdrant', 'PostgreSQL', 'Redis', 'Docker'],
    href: 'https://github.com/TheAryanchandra/AI-Copilot',
    accent: '#7dd3fc',
  },
  {
    id: 'stadium',
    title: 'Stadium Pulse — Crowd Intelligence',
    kicker: 'Agentic AI · Google Cloud',
    oneLiner: 'LangGraph multi-agent system that won the Top Builder Award.',
    problem:
      'Stadium operators need real-time crowd decisions — routing, safety and congestion — from noisy signals, with reliable structured outputs.',
    approach: [
      'LangGraph multi-agent state graph orchestrating specialised agents.',
      'Gemini API calls validated against strict Pydantic schemas for reliable structured output.',
      'OpenAI embeddings for semantic context retrieval.',
      'Serverless deployment on Google Cloud Run.',
    ],
    impact: ['Top Builder Award — Google Cloud Agentic Premier League', 'Sub-500ms latency', 'Serverless autoscaling'],
    stack: ['Python', 'LangGraph', 'Gemini API', 'Pydantic', 'OpenAI Embeddings', 'Cloud Run'],
    href: 'https://github.com/TheAryanchandra/agentic-premier-league',
    accent: '#c4b5fd',
    award: 'Top Builder Award',
  },
  {
    id: 'jarvis',
    title: 'Jarvis — Autonomous Copilot & IoT',
    kicker: 'Agentic AI · Model Gateway',
    oneLiner: 'ReAct agent with browser automation, a triple-model gateway and live IoT control.',
    problem:
      'A personal engineering copilot that can plan, browse, act and control devices — while surviving any single model provider going down.',
    approach: [
      'LangGraph ReAct loop: Plan → Think → Act → Observe → Synthesize.',
      'Triple-model gateway (Gemini / Claude / GPT-4o) with automatic failover.',
      'Playwright browser automation for real web tasks.',
      'MongoDB Atlas Vector Search memory; persistent WebSockets for live IoT control.',
    ],
    impact: ['Provider-failover resilience', 'Real browser actions', 'Live device control'],
    stack: ['Node.js', 'Next.js', 'LangGraph', 'Playwright', 'MongoDB Atlas', 'WebSocket'],
    href: 'https://github.com/TheAryanchandra/tracker-development',
    accent: '#fcd34d',
  },
  {
    id: 'giantcell',
    title: 'GiantCell Healthcare Commerce',
    kicker: 'High-Throughput Commerce',
    oneLiner: '150+ APIs, 50K+ daily transactions, 99.9% uptime for 24 months.',
    problem:
      'A healthcare commerce business needed reliable ordering, payments and inventory at scale — where downtime directly costs revenue and patient trust.',
    approach: [
      '150+ REST APIs on Node.js/Express with a React Native client.',
      'Razorpay & Paytm payment integrations with idempotent order flows.',
      'Real-time inventory synchronisation backed by MySQL and Redis.',
      'Dockerised deployments with monitoring for SLA tracking.',
    ],
    impact: ['50,000+ daily transactions', '99.9% uptime over 24 months', 'Multi-gateway payments'],
    stack: ['Node.js', 'Express', 'React Native', 'MySQL', 'Redis', 'Docker'],
    href: 'https://github.com/TheAryanchandra',
    accent: '#86efac',
  },
  {
    id: 'tutor',
    title: 'Concept Learning Engine — Adaptive AI Tutor',
    kicker: 'Adaptive Pedagogy · Knowledge Graphs',
    oneLiner: 'Personalized learning engine with concept prerequisite graphs and dense semantic retrieval.',
    problem:
      'Students and engineers learning complex CS concepts often get stuck due to unidentified knowledge gaps in prerequisite topics.',
    approach: [
      'Engineered directed acyclic graph (DAG) mapping topic dependencies and prerequisite trees.',
      'Semantic document retrieval over course materials using dense embeddings.',
      'Adaptive diagnostic evaluation with structured schema validation for real-time gap discovery.',
      'Interactive quiz generation and conversational remediation loop.',
    ],
    impact: ['Automated knowledge gap diagnosis', 'DAG concept prerequisite tracking', 'Grounded educational explanations'],
    stack: ['Python', 'Next.js', 'FastAPI', 'MongoDB', 'OpenAI Embeddings'],
    href: 'https://github.com/TheAryanchandra',
    accent: '#f472b6',
  },
];

export const ENGINEERING_PRINCIPLES = [
  {
    num: '01',
    title: 'High Concurrency via Virtual Threads',
    summary: 'Project Loom fibers over reactive WebFlux',
    desc: 'Java 21 virtual threads handle blocking network and vector database I/O with negligible memory footprint, preserving clean synchronous code and full stacktraces.',
  },
  {
    num: '02',
    title: 'Event-Driven Decoupling',
    summary: 'Apache Kafka partitions isolate query traffic',
    desc: 'Heavy document OCR, embedding, and order processing are offloaded to Kafka topics. Ingestion spikes never degrade user-facing sub-200ms query latency.',
  },
  {
    num: '03',
    title: 'Idempotency & Cache Integrity',
    summary: 'Distributed Redis locks & ACID transactions',
    desc: 'Distributed mutex locks prevent race conditions in inventory and payment transactions; TTL jitter on cache keys protects databases against thundering herds.',
  },
  {
    num: '04',
    title: 'Grounded RAG with Hybrid Fusion',
    summary: 'Dense HNSW + Sparse BM25 Lexical search',
    desc: 'Pure vector similarity fails on exact technical codes; hybrid Reciprocal Rank Fusion guarantees both semantic understanding and keyword precision with verified citations.',
  },
];

export const APPS = [
  {
    name: 'Fonofy Partners',
    role: 'Device trade-in & refurbished commerce',
    downloads: '10,000+',
    rating: '4.8',
    desc: 'B2B merchant app: device diagnostics, automated trade-in grading, live dynamic pricing and fulfilment.',
    url: 'https://play.google.com/store/apps/details?id=com.fonofy.merchant&hl=en_IN',
    store: 'Google Play',
    tech: ['React Native', 'Node.js', 'MongoDB'],
  },
  {
    name: 'Delhi Golf Federation',
    role: 'Tournament & league management',
    downloads: '5,000+',
    rating: '4.9',
    desc: 'Real-time scoring, handicap calculation, live leaderboards and verified player profiles.',
    url: 'https://apps.apple.com/in/app/delhi-golf-federation/id6758339712',
    store: 'App Store',
    tech: ['React Native', 'Spring Boot', 'PostgreSQL', 'WebSocket'],
  },
  {
    name: 'Carenzy',
    role: 'Healthcare & caregiver booking',
    downloads: '2,000+',
    rating: '4.7',
    desc: 'On-demand caregiver dispatch, vitals telemetry, scheduling and patient health timelines.',
    url: 'https://carenzy.com',
    store: 'Web',
    tech: ['React Native', 'Node.js', 'Firebase', 'GCP'],
  },
];

export interface SkillGroup {
  id: string;
  label: string;
  skills: string[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  { id: 'lang', label: 'Languages', skills: ['Java', 'TypeScript', 'JavaScript', 'Python', 'SQL'] },
  {
    id: 'backend',
    label: 'Backend & Distributed',
    skills: ['Spring Boot', 'Node.js', 'Express', 'Kafka', 'REST APIs', 'WebSocket', 'Microservices'],
  },
  {
    id: 'data',
    label: 'Data & Search',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Qdrant', 'Vector Search'],
  },
  {
    id: 'ai',
    label: 'AI / LLM Systems',
    skills: ['LangGraph', 'RAG', 'Spring AI', 'Gemini API', 'Pydantic', 'Playwright'],
  },
  { id: 'frontend', label: 'Frontend & Mobile', skills: ['React', 'Next.js', 'React Native', 'Three.js'] },
  { id: 'cloud', label: 'Cloud & DevOps', skills: ['Docker', 'Cloud Run', 'GCP', 'CI/CD', 'Linux'] },
];

/** Map a skill name to the projects that actually used it (for highlight). */
export function projectsUsingSkill(skill: string): string[] {
  const s = skill.toLowerCase();
  const alias: Record<string, string[]> = {
    java: ['java 21'],
    kafka: ['kafka'],
    'spring boot': ['spring boot 3', 'spring boot'],
    'vector search': ['qdrant', 'mongodb atlas'],
    rag: ['spring ai', 'qdrant'],
    'gemini api': ['gemini api'],
    'cloud run': ['cloud run'],
    gcp: ['cloud run'],
    mongodb: ['mongodb atlas', 'mongodb'],
    'rest apis': ['express', 'spring boot 3'],
    microservices: ['docker', 'kafka'],
    react: ['next.js', 'react native'],
  };
  const needles = [s, ...(alias[s] || [])];
  return PROJECTS.filter((p) =>
    p.stack.some((t) => needles.some((n) => t.toLowerCase().includes(n))),
  ).map((p) => p.id);
}

/** Role-fit matcher vocabulary: keyword → evidence from real work. */
export const FIT_VOCAB: { keys: string[]; label: string; evidence: string }[] = [
  { keys: ['java'], label: 'Java', evidence: 'Java 21 virtual threads in the RAG Copilot' },
  { keys: ['spring', 'spring boot'], label: 'Spring Boot', evidence: 'Spring Boot 3 + Spring AI gateway' },
  { keys: ['kafka', 'event-driven', 'event driven', 'streaming', 'pub/sub', 'message queue'], label: 'Kafka / Event-driven', evidence: 'Kafka ingestion pipeline' },
  { keys: ['microservice', 'distributed'], label: 'Distributed systems', evidence: 'Decoupled ingestion & query services' },
  { keys: ['node', 'node.js', 'express'], label: 'Node.js', evidence: '150+ REST APIs on GiantCell' },
  { keys: ['typescript', 'javascript'], label: 'TypeScript / JS', evidence: 'Next.js + Node.js products' },
  { keys: ['python'], label: 'Python', evidence: 'LangGraph agents · IOCL ML pipelines' },
  { keys: ['react', 'next.js', 'nextjs', 'frontend'], label: 'React / Next.js', evidence: 'This portfolio + Jarvis dashboard' },
  { keys: ['react native', 'mobile', 'android', 'ios'], label: 'Mobile', evidence: '3 shipped apps · 10K+ installs' },
  { keys: ['sql', 'postgres', 'postgresql', 'mysql', 'rdbms'], label: 'SQL databases', evidence: 'PostgreSQL & MySQL in production' },
  { keys: ['mongodb', 'nosql'], label: 'MongoDB', evidence: 'Atlas Vector Search memory' },
  { keys: ['redis', 'cache', 'caching'], label: 'Redis / Caching', evidence: 'Hot-path caching for commerce + RAG' },
  { keys: ['docker', 'container', 'kubernetes', 'k8s'], label: 'Containers', evidence: 'Dockerised services' },
  { keys: ['gcp', 'google cloud', 'cloud run', 'aws', 'azure', 'cloud'], label: 'Cloud', evidence: 'Serverless on Google Cloud Run' },
  { keys: ['llm', 'genai', 'gen ai', 'generative', 'rag', 'langchain', 'langgraph', 'agent', 'ai'], label: 'LLM / Agentic AI', evidence: 'Top Builder Award · LangGraph' },
  { keys: ['vector', 'embedding', 'semantic search', 'search'], label: 'Vector search', evidence: 'Qdrant dense + BM25 hybrid' },
  { keys: ['rest', 'api', 'apis', 'graphql'], label: 'API design', evidence: '150+ production REST APIs' },
  { keys: ['payment', 'fintech', 'razorpay'], label: 'Payments', evidence: 'Razorpay & Paytm integrations' },
  { keys: ['websocket', 'real-time', 'realtime'], label: 'Real-time', evidence: 'Live leaderboards & IoT sockets' },
  { keys: ['data structure', 'algorithm', 'dsa', 'problem solving', 'problem-solving'], label: 'DSA', evidence: '420+ problems solved' },
  { keys: ['system design', 'scalab', 'high availability', 'reliability', 'uptime', 'sla'], label: 'Scale & reliability', evidence: '99.9% uptime · 50K+ txns/day' },
  { keys: ['ci/cd', 'cicd', 'devops', 'linux', 'git'], label: 'DevOps', evidence: 'CI/CD pipelines on Linux' },
  { keys: ['ml', 'machine learning', 'forecast', 'time series', 'time-series'], label: 'ML', evidence: 'IOCL forecasting models' },
];

export const ROLE_PRESETS: Record<string, string> = {
  'Backend SDE-1':
    'Java Spring Boot microservices, REST APIs, SQL, Redis caching, Kafka, distributed systems, Docker, system design, data structures and algorithms.',
  'Full-Stack SDE':
    'React, Next.js, TypeScript, Node.js, REST APIs, PostgreSQL or MongoDB, CI/CD, cloud deployment, problem solving.',
  'AI / LLM Engineer':
    'Python, LLM applications, RAG, LangChain or LangGraph agents, vector search and embeddings, APIs, cloud deployment.',
  'Mobile Engineer':
    'React Native, mobile apps on Android and iOS, REST APIs, real-time WebSocket features, Firebase, performance.',
};

export function computeFit(jd: string) {
  const text = ` ${jd.toLowerCase()} `;
  const asked = FIT_VOCAB.filter((v) => v.keys.some((k) => text.includes(k)));
  if (asked.length === 0) return { score: 0, matched: [], asked: 0 };
  // All vocabulary entries are backed by real work, so a match = evidence.
  const score = Math.min(98, Math.round(62 + asked.length * 3.2));
  return { score, matched: asked, asked: asked.length };
}

export const CANDIDATE_BRIEF = `Aryan Chandra — Software Engineer (SDE-1 · Backend / Full-Stack / AI)
• Software Engineer @ Ta Rule Technology — GiantCell: 150+ APIs, 50K+ daily txns, 99.9% uptime (24 mo)
• Shipped Fonofy Partners app — 10,000+ Play Store installs, 4.8★
• Enterprise RAG Copilot — Java 21, Spring Boot 3, Kafka, Qdrant hybrid search, sub-200ms P95
• Top Builder Award — Google Cloud Agentic Premier League (LangGraph, Gemini, Cloud Run)
• 420+ DSA problems · B.Tech Software Engineering · ex-IOCL SWE Intern
• Delhi NCR · Open to remote & relocation · Immediate joiner
• ${PROFILE.email} · ${PROFILE.phone}
• Resume: ${PROFILE.resume}`;

export const CHAPTERS = [
  { id: 'hero', label: 'Intro' },
  { id: 'experience', label: 'Experience' },
  { id: 'systems', label: 'Systems' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' },
  { id: 'contact', label: 'Contact' },
];
